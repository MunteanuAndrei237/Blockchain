import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, TextField, Button, CircularProgress, Paper } from '@mui/material';
import problems from './problems.json'; // Import the JSON file with problems
import { ethers } from 'ethers';

const Problem = ({ contract, signer, maxGasCost, updateBalance, walletAddress }) => {
    const [userCode, setUserCode] = useState('');
    const [result, setResult] = useState('');
    const [status, setStatus] = useState('');
    const [executionTime, setExecutionTime] = useState(null);
    const [problem, setProblem] = useState(null);
    const [rewardAmount, setRewardAmount] = useState(null); // Store the reward
    const [gasEstimate, setGasEstimate] = useState(null); // Store gas estimate for claiming reward
    const [hasClaimedReward, setHasClaimedReward] = useState(false); // Track if the reward has been claimed
    const [isProblemSolved, setIsProblemSolved] = useState(false); // Track if the problem is solved already
    const [userLowestTime, setUserLowestTime] = useState(null); // Track user's solving time for comparison
    const { id: problemId } = useParams();

    // Load the problem based on the problemId
    useEffect(() => {
        const selectedProblem = problems.find((p) => p.id == problemId);
        if (selectedProblem) {
            setProblem(selectedProblem);
        } else {
            setResult('Problem not found.');
            setStatus('failed');
        }
    }, [problemId]);

    // Load solved problems from the contract to check if the problem is already solved
    useEffect(() => {
        if (walletAddress && contract) {
            getSolvedProblems(walletAddress);
        }
    }, [walletAddress, contract]);

    const getSolvedProblems = async (userAddress) => {
        try {
            const solvedProblems = await contract.getSolvedProblems(userAddress);
            const solvedProblem = solvedProblems.find((problem) => problem[0].toString() === problemId);
            if (solvedProblem) {
                setIsProblemSolved(true);
                setUserLowestTime(solvedProblem[1].toString()); // user's previous solving time
            }
        } catch (error) {
            console.error('Error fetching solved problems:', error);
        }
    };

    const runTests = () => {
        if (!problem) {
            setResult('No problem loaded.');
            setStatus('failed');
            return;
        }

        let userFunction;

        try {
            // Convert the input string to a JavaScript function
            userFunction = new Function('return ' + userCode)();
        } catch (err) {
            setResult('Error: Invalid function code.');
            setStatus('failed');
            setExecutionTime(null);
            return;
        }

        let allTestsPassed = true;
        const testResults = [];

        try {
            const startTime = performance.now(); // Start time

            problem.testCases.forEach(({ input, expected }, index) => {
                try {
                    const output = userFunction(...input); // Execute user function
                    const isPassed = output === expected;

                    testResults.push(`Test ${index + 1}: ${isPassed ? 'Passed' : 'Failed'}`);
                    if (!isPassed) allTestsPassed = false;
                } catch (err) {
                    testResults.push(`Test ${index + 1}: Error - ${err.message}`);
                    allTestsPassed = false;
                }
            });

            const endTime = performance.now(); // End time

            // Calculate execution time
            const timeTaken = 50;

            // Display results
            if (allTestsPassed) {
                setResult(`All tests passed!`);
                setStatus('passed');
                getRewards(problem.maxReward, timeTaken, problem.bestTimeMs, {gasLimit: ethers.parseUnits(maxGasCost.toString(), 'gwei')});
            } else {
                setResult(testResults.join('\n'));
                setStatus('failed');
            }

            setExecutionTime(timeTaken);
        } catch (err) {
            console.error('Error during test execution:', err);
            setResult('Error during test execution.');
            setStatus('failed');
            setExecutionTime(null);
        }
    };

    const getRewards = async (maxReward, solvingTime, bestTimeMs) => {
        if(userLowestTime && solvingTime >= userLowestTime) {
            return;
        }

        const address = await signer.getAddress();

        if (!ethers.isAddress(address)) {
            alert("Invalid recipient address.");
            return;
        }

        let rewardAmount = 0;

        if(userLowestTime === null) {
         rewardAmount = maxReward * (bestTimeMs / solvingTime);
        } else {
            const improvementFactor = (userLowestTime - solvingTime) / (userLowestTime - bestTimeMs);
            rewardAmount = maxReward * improvementFactor;
        }

        // Round the reward amount to 5 decimals
        const roundedRewardAmount = rewardAmount.toFixed(5); 
        
        // Convert the rounded reward amount to Wei
        const amountInWei = ethers.parseUnits(roundedRewardAmount, 5);

        // Estimate gas cost for claiming the reward
        try {
            const gasEstimate = await contract.getRewards.estimateGas(address, amountInWei, problemId, solvingTime);
            setGasEstimate(gasEstimate.toString()); // Set the gas estimate
            setRewardAmount(roundedRewardAmount); // Set the reward amount
        } catch (err) {
            console.error("Error estimating gas:", err);
            alert("Error estimating gas for claiming rewards.");
        }
    };

    const claimReward = async () => {
        const address = await signer.getAddress();
        if (!ethers.isAddress(address)) {
            alert("Invalid recipient address.");
            return;
        }

        const amountInWei = ethers.parseUnits(rewardAmount, 5);

        try {
            // Call the getRewards function on the contract
            const tx = await contract.getRewards(address, amountInWei, problemId, executionTime);
            await tx.wait(); // Wait for the transaction to be mined
            
            setHasClaimedReward(true); // Mark reward as claimed
            updateBalance(); // Update balance after claiming
        } catch (err) {
            console.error("Claiming rewards:", err);
            alert("Claiming reward failed.");
        }
    };

    return (
        <Box sx={{ padding: 4, fontFamily: 'Arial, sans-serif' }}>
            {problem ? (
                <Paper sx={{ padding: 3, boxShadow: 3 }}>
                    <Typography variant="h4" gutterBottom>
                        Problem: {problem.requirement}
                    </Typography>
                    <TextField
                        id="codeBox"
                        value={userCode}
                        onChange={(e) => setUserCode(e.target.value)}
                        placeholder="Enter JavaScript code here..."
                        multiline
                        rows={4}
                        fullWidth
                        sx={{ marginBottom: 2 }}
                    />
                    <Button variant="contained" color="primary" onClick={runTests} sx={{ marginBottom: 2 }}>
                        Run Tests
                    </Button>
                    <Box sx={{ marginTop: 2, whiteSpace: 'pre-wrap' }}>
                        <Typography variant="body1">{result}</Typography>
                        {executionTime !== null && status === 'passed' && (
                            <Typography variant="body2" color="textSecondary">
                                Execution Time: {executionTime} ms
                            </Typography>
                        )}
                    </Box>

                    {rewardAmount && !hasClaimedReward && (
                        <Box sx={{ marginTop: 4 }}>
                            <Typography variant="h6">Reward Amount: {rewardAmount} LEET</Typography>
                            <Typography variant="body1">Estimated Gas: {ethers.formatUnits(gasEstimate, 'gwei')} gwei</Typography>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={claimReward}
                                disabled={hasClaimedReward}
                                sx={{ marginTop: 2 }}
                            >
                                Claim Reward
                            </Button>
                        </Box>
                    )}

                    {isProblemSolved && !hasClaimedReward && (
                        <Box sx={{ marginTop: 4 }}>
                            <Typography variant="h5" color="success.main">
                                You've already solved this problem!
                            </Typography>
                            <Typography variant="body1">Best Solving Time: {userLowestTime} ms</Typography>
                        </Box>
                    )}
                </Paper>
            ) : (
                <CircularProgress />
            )}
        </Box>
    );
};

export default Problem;
