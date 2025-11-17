const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying AgentRegistry contract...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "HBAR");

  const AgentRegistry = await hre.ethers.getContractFactory("AgentRegistry");
  const agentRegistry = await AgentRegistry.deploy();

  await agentRegistry.waitForDeployment();

  const address = await agentRegistry.getAddress();
  console.log("✅ AgentRegistry deployed to:", address);

  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    address: address,
    deployer: deployer.address,
    network: hre.network.name,
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync(
    "./deployment.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("📝 Deployment info saved to deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
