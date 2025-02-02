import React from 'react';
import { Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

const Header = ({ walletAddress, ethBalance, tokenBalance, maxGasCost, changeMaxGasCost }) => {
  return (
    <div id="walletInfo">
      <AppBar position="sticky">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Navigation Links - Aligned to the left */}
          <Typography variant="h6" component="div">
            <Link to={`/activity`} style={{ marginRight: '15px', color: 'white' }}>
              Activity
            </Link>
            <Link to={`/`} style={{ marginRight: '15px', color: 'white' }}>
              Home
            </Link>
            <Link to={`/swap-transfer`} style={{ marginRight: '15px', color: 'white' }}>
              Swap & Transfer
            </Link>
          </Typography>

          {/* Centered Title and Subtitle */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1 }}>
            <Typography variant="h4" sx={{ color: 'white' }}>
              LeetCoin
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'white' }}>
              Decentralized platform for Leetcode problems
            </Typography>
          </Box>

          {/* Wallet Info Section - Aligned to the right */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            {ethBalance && <Typography variant="subtitle1" sx={{ color: 'white' }}>ETH: {ethBalance}</Typography>}
            {tokenBalance && <Typography variant="subtitle1" sx={{ color: 'white' }}>LEET: {tokenBalance}</Typography>}

            {/* Mini Gas Cost Input Section */}
            <Box sx={{ marginTop: 1, width: '200px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              {/* Max Gas Cost text on top-right */}
              <Typography variant="body2" sx={{ color: 'white', marginBottom: 0.5 }}>
                Max Gas Cost
              </Typography>
              {/* TextField */}
              <TextField
                value={maxGasCost}
                onChange={(e) => changeMaxGasCost(e.target.value)}
                placeholder="Gas Cost"
                variant="standard"
                margin="dense"
                size="small"
                sx={{
                    '& .MuiInputBase-root': {
                      color: 'white', // White text
                    },
                    '& .MuiInput-underline:before': {
                      borderBottomColor: 'white', // White underline before focus
                    },
                    '& .MuiInput-underline:hover:before': {
                      borderBottomColor: 'white', // White underline on hover
                    },
                    '& .MuiInput-underline:after': {
                      borderBottomColor: 'white', // White underline after focus
                    },
                }}
              />
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default Header;
