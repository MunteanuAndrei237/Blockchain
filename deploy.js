const hre = require("hardhat");

async function main() {
    console.log("Deploying contract...");

    // Deploy MyContract
    const MyContract = await hre.ethers.getContractFactory("MyContract");
    const myContract = await MyContract.deploy("Hello, LeetCoin!");

    await myContract.waitForDeployment(); // Ensures MyContract deployment is completed

    console.log("MyContract deployed to:", await myContract.getAddress()); // Ensure correct address retrieval

    // Deploy StakeContract, passing the deployed MyContract address
    const StakeContract = await hre.ethers.getContractFactory("StakingContract"); 
    const stakeContract = await StakeContract.deploy(await myContract.getAddress());

    await stakeContract.waitForDeployment(); // Ensure deployment completes

    console.log("StakeContract deployed to:", await stakeContract.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
