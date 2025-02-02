import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ethers } from 'ethers';
import SwapTransfer from './SwapTransfer'; // Import the SwapTransfer component
import ProblemList from './ProblemList';
import Problem from './Problem';
import Activity from './Activity';
import problems from './problems.json';
import Header from './Header';

const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';  // Replace with your actual contract address
const contractABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address recipient, uint256 amount) public returns (bool)",
  "function getRewards(address receiver, uint256 amount, uint256 problemId, uint256 solvingTime) public",
  "function getSolvedProblems(address user) view returns (tuple(uint256 problemId, uint256 solvingTime)[])",
  "function swapEthToLeet() payable public",
  "event GetRewards(address indexed receiver, uint256 amount, uint256 problemId, uint256 solvingTime)"
];

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [ethBalance, setEthBalance] = useState(null); // For ETH balance
  const [tokenBalance, setTokenBalance] = useState(null); // For LEET token balance
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [maxGasCost, setMaxGasCost] = useState(0.00034361);

  useEffect(() => {
    const initWallet = async () => {
      await connectWallet();
    };
    initWallet();
  }, []);

  useEffect(() => {
    if (walletAddress && contract) {
      updateBalances(); // Fetch both balances when walletAddress and contract are set
    }
  }, [walletAddress, contract]);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []); // Request accounts from MetaMask
        const newSigner = await provider.getSigner(); // Get the signer (your wallet)
        const newContract = new ethers.Contract(contractAddress, contractABI, newSigner);

        // Update state
        setSigner(newSigner);
        setContract(newContract);

        // Fetch and display the wallet address
        const address = await newSigner.getAddress();
        setWalletAddress(address);

      } catch (error) {
        console.error("Error connecting wallet:", error);
        alert("Failed to connect wallet.");
      }
    } else {
      alert("MetaMask not detected. Please install MetaMask.");
    }
  };

  const updateBalances = async () => {
    try {
      // Fetch ETH balance
      const provider = signer.provider;
      const ethBal = await provider.getBalance(walletAddress);
      const formattedEthBal = ethers.formatEther(ethBal);
      const roundedEthBal = parseFloat(formattedEthBal).toFixed(2); // Round to 2 decimals
      setEthBalance(roundedEthBal);
      // Fetch LEET token balance
      const leetBal = await contract['balanceOf(address)'](walletAddress);
      const formattedLeetBal = ethers.formatUnits(leetBal, 5); // Assuming 4 decimal places for LEET token
      setTokenBalance(formattedLeetBal);
    } catch (err) {
      console.error("Error fetching balances:", err);
      alert("Error fetching balances.");
    }
  };

  const changeMaxGasCost = (newGasCost) => {
    setMaxGasCost(newGasCost);
  }

  return (
    <Router>
      <Header
        walletAddress={walletAddress}
        ethBalance={ethBalance}
        tokenBalance={tokenBalance}
        contract={contract}
        signer={signer}
        maxGasCost={maxGasCost}
        updateBalance={updateBalances}
        changeMaxGasCost={changeMaxGasCost}
      />
      <Routes>
        <Route path="/swap-transfer" element={<SwapTransfer
          walletAddress={walletAddress}
          ethBalance={ethBalance}
          tokenBalance={tokenBalance}
          contract={contract}
          signer={signer}
          maxGasCost={maxGasCost}
          updateBalance={updateBalances}
          changeMaxGasCost={changeMaxGasCost}
        />} />
        <Route path="/problem/:id" element={<Problem contract={contract} signer={signer} maxGasCost={maxGasCost} updateBalance={updateBalances} walletAddress={walletAddress} />} />
        <Route path="/activity" element={<Activity contract={contract} />} />
        <Route path="/" element={<ProblemList problems={problems} walletAddress={walletAddress} contract={contract} />} />
      </Routes>
    </Router>
  );
};

export default App;
