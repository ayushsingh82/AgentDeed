const hre = require("hardhat");

// Mints one test iNFT to the deployer so /infts and /my-agents have something
// to render. Mirrors what the /builder UI does on real input:
//   - generate a random AES key (irrelevant on-chain — we only hash a placeholder)
//   - hash a stand-in "weights" payload for metadataHash
//   - point encryptedURI at a deterministic stub (no real 0G Storage pin yet)
async function main() {
  const { ethers } = hre;
  const [signer] = await ethers.getSigners();
  if (!signer) throw new Error("No signer — set DEPLOYER_PRIVATE_KEY in contracts/.env");

  const AGENT_DEED = "0x21cBA803EdB8676D06FAf9aCAb84611C98B7A370";

  // Stand-in payload — represents the encrypted weights blob.
  const payload = ethers.toUtf8Bytes(
    "agentdeed-test-payload-" + Date.now()
  );
  const metadataHash = ethers.keccak256(payload);
  const encryptedURI = "0g://stub/" + metadataHash.slice(2, 14);

  console.log("Deployer    :", signer.address);
  console.log("AgentDeed   :", AGENT_DEED);
  console.log("metadataHash:", metadataHash);
  console.log("encryptedURI:", encryptedURI);

  const abi = [
    "function mint(address to, string encryptedURI, bytes32 metadataHash) returns (uint256)",
    "function totalSupply() view returns (uint256)",
    "event MetadataUpdated(uint256 indexed tokenId, bytes32 newHash)",
  ];
  const deed = new ethers.Contract(AGENT_DEED, abi, signer);

  const tx = await deed.mint(signer.address, encryptedURI, metadataHash);
  console.log("\nmint tx     :", tx.hash);
  const receipt = await tx.wait();
  console.log("status      :", receipt.status === 1 ? "ok" : "reverted");
  console.log("gas used    :", receipt.gasUsed.toString());

  // Pull the new tokenId out of MetadataUpdated.
  const iface = new ethers.Interface(abi);
  for (const log of receipt.logs) {
    try {
      const parsed = iface.parseLog(log);
      if (parsed && parsed.name === "MetadataUpdated") {
        console.log("tokenId     :", parsed.args.tokenId.toString());
      }
    } catch {}
  }

  const supply = await deed.totalSupply();
  console.log("totalSupply :", supply.toString());
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
