import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
            const timeTaken = 10;

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
        if(solvingTime < userLowestTime) {
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
        <div id="container" style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            {problem ? (
                <>
                    <h3>Problem: {problem.requirement}</h3>
                    <textarea
                        id="codeBox"
                        value={userCode}
                        onChange={(e) => setUserCode(e.target.value)}
                        placeholder="Enter JavaScript code here..."
                        style={{ width: '100%', height: '100px', marginBottom: '10px' }}
                    />
                    <br />
                    <button id="runButton" onClick={runTests}>
                        Run Tests
                    </button>
                    <div id="result" style={{ marginTop: '10px', whiteSpace: 'pre-wrap' }}>
                        {result}
                        {executionTime !== null && status === 'passed' && (
                            <div>
                                Execution Time: {executionTime} ms
                            </div>
                        )}
                    </div>

                    {rewardAmount && !hasClaimedReward && (
                        <div id="rewardInfo" style={{ marginTop: '20px' }}>
                            <p>Reward Amount: {rewardAmount} LEET</p>
                            <p>Estimated Gas: {ethers.formatUnits(gasEstimate, 'gwei')} gwei</p>
                            <button onClick={claimReward} disabled={hasClaimedReward}>
                                Claim Reward
                            </button>
                        </div>
                    )}

                    {isProblemSolved && !hasClaimedReward && (
                        <div>
                            <h4>You've already solved this problem!</h4>
                            <p>Previous Solving Time: {userLowestTime} ms</p>
                        </div>
                    )}
                </>
            ) : (
                <p>Loading problem...</p>
            )}
        </div>
    );
};

export default Problem;
