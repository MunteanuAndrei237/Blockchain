import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, List, ListItem, ListItemText, Chip } from '@mui/material';

const ProblemList = ({ problems, walletAddress, contract }) => {
    const [solvedProblems, setSolvedProblems] = useState([]);

    useEffect(() => {
        if (walletAddress && contract) {
            getSolvedProblems(walletAddress);
        }
    }, [walletAddress, contract]);

    const getSolvedProblems = async (userAddress) => {
        try {
            const solvedProblems = await contract.getSolvedProblems(userAddress);
            const formattedProblems = solvedProblems.map((problem) => ({
                problemId: problem[0].toString(),  // Convert BigInt to string
                solvingTime: problem[1].toString(),  // Convert BigInt to string
            }));
            setSolvedProblems(formattedProblems);
        } catch (error) {
            console.error('Error fetching solved problems:', error);
        }
    };

    const isProblemSolved = (problemId) => {
        return solvedProblems.some((solved) => solved.problemId == problemId);
    };

    const getSolvingTime = (problemId) => {
        const solvedProblem = solvedProblems.find((solved) => solved.problemId == problemId);
        return solvedProblem ? solvedProblem.solvingTime : null;
    };

    const calculateReward = (difficulty, solvingTime) => {
        // Calculate reward based on difficulty and solving time (example)
        const reward = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30;
        const timePenalty = solvingTime > 5000 ? -5 : 0; // Example time penalty
        return reward + timePenalty;
    };

    return (
        <Box sx={{ padding: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h4" sx={{ marginBottom: 2, color: 'text.primary', fontWeight: 'bold' }}>
                            Problem List
            </Typography>
            <Typography variant="subtitle2" sx={{ marginBottom: 4, textAlign: 'center', maxWidth: '1500px' }}>
                In this list, you'll find a series of problems that test your skills and knowledge. Each problem
                has a reward based on its difficulty and the time it takes you to solve it. As you solve more problems,
                you'll earn rewards in the form of LEET tokens. The faster and more efficiently you solve them, the greater
                your reward! The challenges range from easy to hard, so there's something for everyone. Start solving and
                see how much you can earn!
            </Typography>
            <List>
                {problems.map((problem) => (
                    <Link to={`/problem/${problem.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <ListItem key={problem.id} sx={{ display: 'flex', justifyContent: 'center', marginBottom: 3 }}>
                            <Box sx={{
                                width: '100%',
                                padding: 2,
                                border: '1px solid #ccc',
                                borderRadius: 2,
                                boxShadow: 2,
                                backgroundColor: 'background.paper',
                            }}>
                                <ListItemText
                                    primary={
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                            {problem.requirement}
                                        </Typography>
                                    }
                                    secondary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', marginTop: 1 }}>
                                            {isProblemSolved(problem.id) ? (
                                                <>
                                                    <Chip label="Solved" color="success" sx={{ marginRight: 2, marginBottom: 1 }} />
                                                    <Chip label={`Solving time: ${getSolvingTime(problem.id)} ms`} color="grey" sx={{ marginRight: 2, marginBottom: 1 }} />
                                                </>
                                            ) : (
                                                <Chip label="Unsolved" color="error" sx={{ marginRight: 2, marginBottom: 1 }} />
                                            )}
                                            <Chip
                                                label={`Max reward: ${problem.maxReward} LEET`}
                                                color="primary"
                                                sx={{ marginBottom: 1 }}
                                            />
                                        </Box>
                                    }
                                />
                            </Box>
                        </ListItem>
                    </Link>
                ))}
            </List>
        </Box>
    );
};

export default ProblemList;
