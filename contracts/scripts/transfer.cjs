const hre = require("hardhat");

// Transfer an iNFT to another wallet, exercising the ERC-7857 transfer()
// function with sealedKey + proof bytes.
//
// On testnet the AgentDeed contract has its TEE oracle left unwired, so
// these two bytes fields are accepted as-is (permissionless). In
// production they'd be a real re-encrypted key envelope + a TEE
// attestation proof — the values you pass would come from the oracle,
// not from this script.
//
// Usage:
//   TO=0xRecipientAddress TOKEN_ID=1 npm run transfer
//
// Optional:
//   SEALED_KEY=0x...   (defaults to a 32B placeholder)
//   PROOF=0x...        (defaults to empty bytes)
async function main() {
  const { ethers } = hre;
  const [signer] = await ethers.getSigners();
  if (!signer) {
    throw new Error("No signer — set DEPLOYER_PRIVATE_KEY in contracts/.env");
  }

  const to = process.env.TO;
  const tokenId = process.env.TOKEN_ID;
  if (!to || !tokenId) {
    throw new Error("Set TO=<address> TOKEN_ID=<n> in the environment");
  }
  if (!ethers.isAddress(to)) {
    throw new Error(`Invalid TO address: ${to}`);
  }

  const AGENT_DEED = "0x21cBA803EdB8676D06FAf9aCAb84611C98B7A370";
  const sealedKey =
    process.env.SEALED_KEY ||
    "0x" + "00".repeat(32); // 32-byte placeholder envelope
  const proof = process.env.PROOF || "0x";

  console.log("Network    :", hre.network.name);
  console.log("From       :", signer.address);
  console.log("To         :", to);
  console.log("Token id   :", tokenId);
  console.log("Sealed key :", sealedKey);
  console.log("Proof      :", proof);
  console.log("");

  const abi = [
    "function ownerOf(uint256) view returns (address)",
    "function transfer(address from, address to, uint256 tokenId, bytes sealedKey, bytes proof)",
    "event MetadataUpdated(uint256 indexed tokenId, bytes32 newHash)",
  ];
  const deed = new ethers.Contract(AGENT_DEED, abi, signer);

  const currentOwner = await deed.ownerOf(tokenId);
  console.log("Current owner :", currentOwner);
  if (currentOwner.toLowerCase() !== signer.address.toLowerCase()) {
    throw new Error(
      `Signer ${signer.address} does not own token ${tokenId} (owner is ${currentOwner})`,
    );
  }

  const tx = await deed.transfer(
    signer.address,
    to,
    BigInt(tokenId),
    sealedKey,
    proof,
  );
  console.log("\ntransfer tx :", tx.hash);
  const receipt = await tx.wait();
  console.log("status      :", receipt.status === 1 ? "ok" : "reverted");
  console.log("gas used    :", receipt.gasUsed.toString());

  const newOwner = await deed.ownerOf(tokenId);
  console.log("New owner   :", newOwner);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
