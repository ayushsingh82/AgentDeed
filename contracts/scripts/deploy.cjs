const hre = require("hardhat");

// Deploys TEEOracle + AgentDeed to the configured network.
// Set WIRE_ORACLE=true to point AgentDeed at the oracle on deploy. Leave it
// unset on testnet to keep transfer/clone permissionless until a TEE signer
// is registered (otherwise every transfer reverts with InvalidProof).
async function main() {
  const { ethers, network } = hre;
  const [deployer] = await ethers.getSigners();

  if (!deployer) {
    throw new Error(
      "No deployer account. Set DEPLOYER_PRIVATE_KEY in contracts/.env"
    );
  }

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Network :", network.name);
  console.log("Deployer:", deployer.address);
  console.log("Balance :", ethers.formatEther(balance), "OG\n");

  const Oracle = await ethers.getContractFactory("TEEOracle");
  const oracle = await Oracle.deploy();
  await oracle.waitForDeployment();
  const oracleAddr = await oracle.getAddress();
  console.log("TEEOracle deployed:", oracleAddr);

  const Deed = await ethers.getContractFactory("AgentDeed");
  const deed = await Deed.deploy("AgentDeed", "DEED");
  await deed.waitForDeployment();
  const deedAddr = await deed.getAddress();
  console.log("AgentDeed deployed:", deedAddr);

  if (process.env.WIRE_ORACLE === "true") {
    const tx = await deed.setOracle(oracleAddr);
    await tx.wait();
    console.log("AgentDeed.oracle ->", oracleAddr);
  } else {
    console.log("AgentDeed.oracle left unset (permissionless transfers).");
  }

  console.log("\nAdd to your app .env.local:");
  console.log(`NEXT_PUBLIC_AGENT_DEED_ADDRESS=${deedAddr}`);
  console.log(`NEXT_PUBLIC_TEE_ORACLE_ADDRESS=${oracleAddr}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
