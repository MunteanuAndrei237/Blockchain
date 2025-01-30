// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract MyContract {
    // Public variables for token details
    string public name = "Leetcoin";
    string public symbol = "LEET";
    uint8 public decimals = 5;
    uint256 public totalSupply;

    // Mapping from address to balance
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    // Mapping to track problems solved by each address
    struct ProblemSolved {
        uint256 problemId;
        uint256 solvingTime; // Solving time in milliseconds
    }

    mapping(address => ProblemSolved[]) public problemsSolved;

    string public message;

    // Constructor to set the initial message and total supply
    constructor(string memory _message) {
        message = _message;
        totalSupply = 1000000 * (10 ** uint256(decimals)); // 1 million tokens
        balanceOf[msg.sender] = totalSupply; // Assign all tokens to the contract deployer's address
    }

    // Function to update the message
    function updateMessage(string memory _newMessage) public {
        message = _newMessage;
    }

    // Anyone can mint tokens
    function mint(address to, uint256 amount) internal {
        require(to != address(0), "Cannot mint to the zero address.");
        totalSupply += amount;
        balanceOf[to] += amount;
    }

    // Transfer function (ERC-20 standard)
    function transfer(address recipient, uint256 amount) public returns (bool) {
        require(recipient != address(0), "Transfer to the zero address is not allowed.");
        require(balanceOf[msg.sender] >= amount, "Insufficient balance.");

        // Deduct the amount from sender's balance
        balanceOf[msg.sender] -= amount;

        // Add the amount to recipient's balance
        balanceOf[recipient] += amount;

        // Emit Transfer event
        emit Transfer(msg.sender, recipient, amount);

        return true;
    }

    // Function to store or update the solved problem and the time taken
    function storeSolvedProblem(uint256 problemId, uint256 solvingTime) private {
        bool problemSolvedBefore = false;
        
        // Check if the user has already solved the problem
        for (uint256 i = 0; i < problemsSolved[msg.sender].length; i++) {
            ProblemSolved memory solved = problemsSolved[msg.sender][i];
            
            // If problem is solved before, check the time
            if (solved.problemId == problemId) {
                problemSolvedBefore = true;
                problemsSolved[msg.sender][i].solvingTime = solvingTime;
                break;
            }
        }

        // If problem is solved for the first time, add it to the solved list
        if (!problemSolvedBefore) {
            problemsSolved[msg.sender].push(ProblemSolved({
                problemId: problemId,
                solvingTime: solvingTime
            }));
        }
    }

    // Modifier to check if the new solving time is the best time
    modifier newBestTime(uint256 problemId, uint256 solvingTime) {
        bool isNewBest = true;
        
        // Check if the user has solved the problem before
        for (uint256 i = 0; i < problemsSolved[msg.sender].length; i++) {
            ProblemSolved memory solved = problemsSolved[msg.sender][i];
            
            // If problem is solved before, compare the solving times
            if (solved.problemId == problemId) {
                // If the new solving time is not better, revert
                if (solvingTime >= solved.solvingTime) {
                    isNewBest = false;
                }
                break;
            }
        }

        // If the solving time is not better, revert
        require(isNewBest, "New solving time is not better than the previous one.");
        _;
    }

    // Function to reward the user with tokens if the new solving time is the best
    function getRewards(address receiver, uint256 amount, uint256 problemId, uint256 solvingTime) external newBestTime(problemId, solvingTime) {
        mint(receiver, amount); // Mint tokens
        storeSolvedProblem(problemId, solvingTime); // Store problem-solving data
        emit GetRewards(receiver, amount, problemId, solvingTime);
    }

    // Function to get problems solved by the user
    function getSolvedProblems(address user) public view returns (ProblemSolved[] memory) {
        return problemsSolved[user];
    }

    function calculateEthToLeet(uint256 ethAmount, uint256 ethPriceInUSD) public pure returns (uint256) {
        // Convert ETH to LEET where 1 LEET = 1 cent (0.01 USD)
        uint256 leetAmount = ethAmount * ethPriceInUSD * 100;
        return leetAmount;
    }

    // Function to swap ETH to LEET tokens
    function swapEthToLeet() public payable {
        // Ensure ETH has been sent
        require(msg.value > 0, "No ETH sent.");

        uint256 ethPriceInUSD = 3632;
        uint256 leetAmount = calculateEthToLeet(msg.value, ethPriceInUSD);
        mint(msg.sender, leetAmount);

        // Emit an event for the swap
        emit SwapEthToLeet(msg.sender, msg.value, leetAmount);
    }

    receive() external payable {
        // Emit an event when Ether is received
        emit EtherReceived(msg.sender, msg.value);
    }

    // Fallback function with revert logic
    fallback() external payable {
        // Example: Only accept Ether from a specific address
        revert("Details of the call are not recognized.");
    }

    // Events (ERC-20 standard)
    event Transfer(address indexed from, address indexed to, uint256 value);
    event GetRewards(address indexed receiver, uint256 amount, uint256 problemId, uint256 solvingTime);
    event SwapEthToLeet(address indexed user, uint256 ethAmount, uint256 leetAmount);
    event EtherReceived(address indexed sender, uint256 value);
}
