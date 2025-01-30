import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

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

    return (
        <div>
            <h2>Click on a problem to view details:</h2>
            <ul>
                {problems.map((problem) => (
                    <li key={problem.id}>
                        <Link to={`/problem/${problem.id}`}>
                            {problem.requirement}
                        </Link>
                        <span>
                            {isProblemSolved(problem.id) ? (
                                <>
                                    <strong> Solved!</strong>
                                    <span> (Time: {getSolvingTime(problem.id)} ms)</span>
                                </>
                            ) : (
                                <strong> Unsolved</strong>
                            )}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProblemList;
