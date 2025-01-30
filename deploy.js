const hre = require("hardhat");

async function main() {
    console.log("Deploying contract...");

    const MyContract = await hre.ethers.getContractFactory("MyContract");
    const myContract = await MyContract.deploy("Hello, Ethereum!");

    console.log("Contract deployed to:", myContract.target); // Use `.target` for the deployed address
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
