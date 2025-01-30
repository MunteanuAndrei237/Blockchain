import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';

const Header = ({ walletAddress, ethBalance, tokenBalance, contract, signer, maxGasCost, updateBalance, changeMaxGasCost }) => {
    const [isTransferMenuOpen, setTransferMenuOpen] = useState(false);
    const [transferAmount, setTransferAmount] = useState('');
    const [receiverAddress, setReceiverAddress] = useState('');
    const [coinType, setCoinType] = useState('LEET'); // Default to LEET
    const [swapEthAmount, setSwapEthAmount] = useState(''); // ETH amount for swapping
    const [isSwapLoading, setSwapLoading] = useState(false);
    const [transferGasCost, setTransferGasCost] = useState(null); // State for storing gas cost
    const [swapGasCost, setSwapGasCost] = useState(null); // State for storing gas cost

    const toggleTransferMenu = () => {
        setTransferMenuOpen(!isTransferMenuOpen);
    };

    const handleTransfer = async () => {
        if (!walletAddress) {
            alert('Please connect your wallet first.');
            return;
        }

        if (!receiverAddress || !transferAmount || isNaN(transferAmount)) {
            alert('Please enter valid receiver address and transfer amount.');
            return;
        }

        try {
            let tx;
            let gasEstimate;

            if (coinType === 'LEET') {
                // Estimate gas for LEET token transfer
                gasEstimate = await contract.transfer.estimateGas(receiverAddress, ethers.parseUnits(transferAmount, 5));
                setTransferGasCost(gasEstimate.toString());

                // Proceed with transfer and set max gas limit
                tx = await contract.transfer(receiverAddress, ethers.parseUnits(transferAmount, 5), {
                    gasLimit: ethers.parseUnits(maxGasCost.toString(), 'gwei'), // Use maxGasCost
                });
            } else if (coinType === 'ETH') {
                // Estimate gas for ETH transfer
                gasEstimate = await signer.estimateGas({
                    to: receiverAddress,
                    value: ethers.parseEther(transferAmount),
                });
                setTransferGasCost(gasEstimate.toString());

                // Proceed with ETH transfer and set max gas limit
                tx = await signer.sendTransaction({
                    to: receiverAddress,
                    value: ethers.parseEther(transferAmount),
                    gasLimit: ethers.parseUnits(maxGasCost, 'gwei'), // Use maxGasCost
                });
            }

            // Wait for the transaction to be mined (confirmed)
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt);

            // Once the transaction is confirmed, update the balance
            updateBalance();
        } catch (error) {
            console.error('Error during transfer:', error);
            alert('Transfer failed. Check the console for details.');
        }

        // Reset form fields
        setTransferAmount('');
        setReceiverAddress('');
        setCoinType('LEET');
        setTransferMenuOpen(false);
    };

    const handleSwap = async () => {
        if (!walletAddress) {
            alert('Please connect your wallet first.');
            return;
        }

        if (!swapEthAmount || isNaN(swapEthAmount) || parseFloat(swapEthAmount) <= 0) {
            alert('Please enter a valid ETH amount.');
            return;
        }

        setSwapLoading(true);

        try {
            // Estimate gas for swap ETH to LEET
            const gasEstimate = await contract.swapEthToLeet.estimateGas({
                value: ethers.parseEther(swapEthAmount),
            });
            setSwapGasCost(gasEstimate.toString());

            // Proceed with swap and set max gas limit
            const tx = await contract.swapEthToLeet({
                value: ethers.parseEther(swapEthAmount),
                gasLimit: ethers.parseUnits(maxGasCost.toString(), 'gwei'), // Use maxGasCost
            });

            // Wait for the transaction to be mined (confirmed)
            const receipt = await tx.wait();
            console.log('Swap confirmed:', receipt);

            // Once the swap is confirmed, update the balance
            updateBalance();
        } catch (error) {
            console.error('Error during swap:', error);
            alert('Swap failed. Check the console for details.');
        }

        // Reset swap input field
        setSwapEthAmount('');
        setSwapLoading(false);
    };


    return (
        <div id="walletInfo">
            {walletAddress && <p>Wallet Address: {walletAddress}</p>}
            {ethBalance && <p>ETH Balance: {ethBalance} ETH</p>}
            {tokenBalance && <p>LEET Token Balance: {tokenBalance}</p>}

            <h2>Wallet Actions</h2>
            <div id="changeMaxGasCost">
                <input value={maxGasCost} onChange={(e) => changeMaxGasCost(e.target.value)} />
            </div>

            <button onClick={toggleTransferMenu}>
                {isTransferMenuOpen ? 'Close Transfer Menu' : 'Open Transfer Menu'}
            </button>

            <button>
                <Link to={`/activity/`}>
                    See activity
                </Link>
            </button>

            {isTransferMenuOpen && (
                <div id="transferMenu" style={{ border: '1px solid #ccc', padding: '10px', marginTop: '10px' }}>
                    <h3>Transfer Menu</h3>
                    <div>
                        <label>
                            Receiver Address:
                            <input
                                type="text"
                                value={receiverAddress}
                                onChange={(e) => setReceiverAddress(e.target.value)}
                                placeholder="0x..."
                            />
                        </label>
                    </div>
                    <div>
                        <label>
                            Amount:
                            <input
                                type="number"
                                value={transferAmount}
                                onChange={(e) => setTransferAmount(e.target.value)}
                                placeholder="Amount"
                            />
                        </label>
                    </div>
                    <div>
                        <label>
                            Coin Type:
                            <select value={coinType} onChange={(e) => setCoinType(e.target.value)}>
                                <option value="LEET">LEET</option>
                                <option value="ETH">ETH</option>
                            </select>
                        </label>
                    </div>
                    <button onClick={handleTransfer} style={{ marginTop: '10px' }}>
                        Transfer
                    </button>
                    {transferGasCost && <p>Estimated Gas Cost: {ethers.formatUnits(transferGasCost, 'gwei')} gwei</p>}
                </div>
            )}

            {/* Swap ETH to LEET */}
            <div id="swapMenu" style={{ border: '1px solid #ccc', padding: '10px', marginTop: '10px' }}>
                <h3>Swap ETH to LEET</h3>
                <div>
                    <label>
                        ETH Amount:
                        <input
                            type="number"
                            value={swapEthAmount}
                            onChange={(e) => setSwapEthAmount(e.target.value)}
                            placeholder="Amount in ETH"
                        />
                    </label>
                </div>
                <button
                    onClick={handleSwap}
                    style={{ marginTop: '10px' }}
                    disabled={isSwapLoading}
                >

                    {isSwapLoading ? 'Swapping...' : 'Swap ETH to LEET'}
                </button>
                {swapGasCost && <p>Estimated Gas Cost: {ethers.formatUnits(swapGasCost, 'gwei')} gwei</p>}
            </div>
        </div>
    );
};

export default Header;
