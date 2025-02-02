import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Box, Grid, TextField, Button, Typography, Divider, Paper } from '@mui/material';

const SwapTransfer = ({
  walletAddress,
  contract,
  signer,
  maxGasCost,
  updateBalance,
}) => {
  const [transferAmount, setTransferAmount] = useState('');
  const [receiverAddress, setReceiverAddress] = useState('');
  const [coinType, setCoinType] = useState('LEET');
  const [swapEthAmount, setSwapEthAmount] = useState('');
  const [isSwapLoading, setSwapLoading] = useState(false);
  const [transferGasCost, setTransferGasCost] = useState(null);
  const [swapGasCost, setSwapGasCost] = useState(null);

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
        gasEstimate = await contract.transfer.estimateGas(receiverAddress, ethers.parseUnits(transferAmount, 5));
        setTransferGasCost(gasEstimate.toString());

        tx = await contract.transfer(receiverAddress, ethers.parseUnits(transferAmount, 5), {
          gasLimit: ethers.parseUnits(maxGasCost.toString(), 'gwei'),
        });
      } else if (coinType === 'ETH') {
        gasEstimate = await signer.estimateGas({
          to: receiverAddress,
          value: ethers.parseEther(transferAmount),
        });
        setTransferGasCost(gasEstimate.toString());

        tx = await signer.sendTransaction({
          to: receiverAddress,
          value: ethers.parseEther(transferAmount),
          gasLimit: ethers.parseUnits(maxGasCost, 'gwei'),
        });
      }

      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);

      updateBalance();
    } catch (error) {
      console.error('Error during transfer:', error);
      alert('Transfer failed. Check the console for details.');
    }

    setTransferAmount('');
    setReceiverAddress('');
    setCoinType('LEET');
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
      const gasEstimate = await contract.swapEthToLeet.estimateGas({
        value: ethers.parseEther(swapEthAmount),
      });
      setSwapGasCost(gasEstimate.toString());

      const tx = await contract.swapEthToLeet({
        value: ethers.parseEther(swapEthAmount),
        gasLimit: ethers.parseUnits(maxGasCost.toString(), 'gwei'),
      });

      const receipt = await tx.wait();
      console.log('Swap confirmed:', receipt);

      updateBalance();
    } catch (error) {
      console.error('Error during swap:', error);
      alert('Swap failed. Check the console for details.');
    }

    setSwapEthAmount('');
    setSwapLoading(false);
  };

  return (
    <>
    <Box sx={{ padding: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <Typography variant="h5" sx={{ marginBottom: 2, color: 'text.primary', fontWeight: 'bold' }}>
                    Wallet address: 
    </Typography>
    <Typography variant="subtitle1" sx={{ marginBottom: 2, color: 'text.primary', fontWeight: 'bold' }}>
                    {walletAddress}
    </Typography>
    </Box>
    <Box sx={{ display: 'flex', justifyContent: 'center', padding: 2 }}>

      <Grid container spacing={2}>
        {/* Transfer Section */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ padding: 2, textAlign: 'center' }}>
            <Typography variant="h6">Transfer Menu</Typography>
            <Box sx={{ marginBottom: 2 }}>
              <TextField
                fullWidth
                label="Receiver Address"
                value={receiverAddress}
                onChange={(e) => setReceiverAddress(e.target.value)}
                placeholder="0x..."
              />
            </Box>
            <Box sx={{ marginBottom: 2 }}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="Amount"
              />
            </Box>
            <Box sx={{ marginBottom: 2 }}>
              <TextField
                fullWidth
                select
                label="Coin Type"
                value={coinType}
                onChange={(e) => setCoinType(e.target.value)}
                SelectProps={{ native: true }}
              >
                <option value="LEET">LEET</option>
                <option value="ETH">ETH</option>
              </TextField>
            </Box>
            <Button variant="contained" onClick={handleTransfer}>
              Transfer
            </Button>
            {transferGasCost && (
              <Typography sx={{ marginTop: 2 }}>
                Estimated Gas Cost: {ethers.formatUnits(transferGasCost, 'gwei')} gwei
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Divider */}
        <Grid item xs={12} md={1} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Divider orientation="vertical" flexItem />
        </Grid>

        {/* Swap Section */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ padding: 2, textAlign: 'center' }}>
            <Typography variant="h6">Swap ETH to LEET</Typography>
            <Box sx={{ marginBottom: 2 }}>
              <TextField
                fullWidth
                label="ETH Amount"
                type="number"
                value={swapEthAmount}
                onChange={(e) => setSwapEthAmount(e.target.value)}
                placeholder="Amount in ETH"
              />
            </Box>
            <Button variant="contained" onClick={handleSwap} disabled={isSwapLoading}>
              {isSwapLoading ? 'Swapping...' : 'Swap ETH to LEET'}
            </Button>
            {swapGasCost && (
              <Typography sx={{ marginTop: 2 }}>
                Estimated Gas Cost: {ethers.formatUnits(swapGasCost, 'gwei')} gwei
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
    </>
  );
};

export default SwapTransfer;
