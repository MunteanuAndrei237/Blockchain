// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./MyContract.sol";  // Import your Leetcoin contract

contract StakingContract {
    MyContract private leetcoin;  // Reference to your main contract

    mapping(address => uint256) public stakedAmount;
    mapping(address => uint256) public rewards;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);

    // Constructor that takes the address of the Leetcoin contract
    constructor(address payable _leetcoinAddress) {
        leetcoin = MyContract(_leetcoinAddress);
    }

    // Stake function: Users can stake their Leetcoins
    function stake(uint256 amount) external {
        require(leetcoin.balanceOf(msg.sender) >= amount, "Insufficient balance.");
        require(amount > 0, "Amount must be greater than 0.");
        
        // Transfer the tokens to the staking contract
        leetcoin.transfer(address(this), amount);
        
        // Update the staked amount
        stakedAmount[msg.sender] += amount;

        emit Staked(msg.sender, amount);
    }

    // Unstake function: Users can unstake their tokens
    function unstake(uint256 amount) external {
        require(stakedAmount[msg.sender] >= amount, "Insufficient staked amount.");
        require(amount > 0, "Amount must be greater than 0.");
        
        // Update the staked amount
        stakedAmount[msg.sender] -= amount;
        
        // Transfer the tokens back to the user
        leetcoin.transfer(msg.sender, amount);

        emit Unstaked(msg.sender, amount);
    }

    // Function to calculate rewards for a user based on their stake
    function calculateReward(address user) public view returns (uint256) {
        // Simple example: Reward 1% of the staked amount per day
        return stakedAmount[user] / 100;
    }

    // Function to claim rewards
    function claimRewards() external {
        uint256 reward = calculateReward(msg.sender);
        require(reward > 0, "No rewards available.");

        // Mint rewards using the mint function from MyContract
        leetcoin.mint(msg.sender, reward);

        emit RewardsClaimed(msg.sender, reward);
    }

    // Function to get the staked amount of a user
    function getStaked(address user) external view returns (uint256) {
        return stakedAmount[user];
    }
}
