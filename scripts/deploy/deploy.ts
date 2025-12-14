import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // 1. Deploy Verifier
    const Verifier = await ethers.getContractFactory("Verifier");
    const verifier = await Verifier.deploy();
    await verifier.waitForDeployment();
    const verifierAddress = await verifier.getAddress();
    console.log("Verifier deployed to:", verifierAddress);

    // 2. Deploy EkMatVoting
    const EkMatVoting = await ethers.getContractFactory("EkMatVoting");
    const ekMatVoting = await EkMatVoting.deploy(verifierAddress);
    await ekMatVoting.waitForDeployment();
    const ekMatVotingAddress = await ekMatVoting.getAddress();
    console.log("EkMatVoting deployed to:", ekMatVotingAddress);

    // Save deployments
    const network = process.env.HARDHAT_NETWORK || "localhost";
    const deploymentsDir = path.join(__dirname, `../../deployments/${network}`);
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentData = {
        Verifier: verifierAddress,
        EkMatVoting: ekMatVotingAddress,
        Timestamp: new Date().toISOString(),
    };

    fs.writeFileSync(
        path.join(deploymentsDir, "addresses.json"),
        JSON.stringify(deploymentData, null, 2)
    );
    console.log(`Deployment addresses saved to ${deploymentsDir}/addresses.json`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
