export const OG_CHAIN = {
  id: 16602,
  name: "0G",
  rpcUrl: "https://evmrpc-testnet.0g.ai",
  explorer: "https://chainscan-galileo.0g.ai",
  symbol: "OG",
} as const;

export const OG_STORAGE = {
  indexerUrl:
    process.env.NEXT_PUBLIC_OG_INDEXER_URL ??
    "https://indexer-storage-testnet-turbo.0g.ai",
  kvNodeUrl:
    process.env.NEXT_PUBLIC_OG_KV_NODE_URL ??
    "https://rpc-storage-testnet-turbo.0g.ai",
} as const;

export const OG_COMPUTE = {
  brokerUrl:
    process.env.NEXT_PUBLIC_OG_COMPUTE_BROKER_URL ??
    "https://compute-testnet.0g.ai",
} as const;

// 0G Compute Router — OpenAI-compatible inference gateway.
// Public model catalog needs no auth; chat/image calls need an API key
// (kept server-side, see src/app/api/inference/route.ts).
export const OG_ROUTER = {
  baseUrl: process.env.NEXT_PUBLIC_OG_ROUTER_URL ?? "https://router-api.0g.ai",
} as const;

export const AGENT_DEED_CONTRACT =
  (process.env.NEXT_PUBLIC_AGENT_DEED_ADDRESS as `0x${string}` | undefined) ??
  ("0x0000000000000000000000000000000000000000" as const);

export const AGENT_DEED_DEPLOYED =
  AGENT_DEED_CONTRACT !== "0x0000000000000000000000000000000000000000";

// ERC-7857 (INFT) — extends ERC-721 with encrypted, re-encryptable metadata.
// Interface per the 0G ERC-7857 technical standard.
export const AGENT_DEED_ABI = [
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "encryptedURI", type: "string" },
      { name: "metadataHash", type: "bytes32" },
    ],
    outputs: [{ name: "tokenId", type: "uint256" }],
  },
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "tokenId", type: "uint256" },
      { name: "sealedKey", type: "bytes" },
      { name: "proof", type: "bytes" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "clone",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "tokenId", type: "uint256" },
      { name: "sealedKey", type: "bytes" },
      { name: "proof", type: "bytes" },
    ],
    outputs: [{ name: "newTokenId", type: "uint256" }],
  },
  {
    type: "function",
    name: "authorizeUsage",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "executor", type: "address" },
      { name: "permissions", type: "bytes" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "getMetadataHash",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "bytes32" }],
  },
  {
    type: "function",
    name: "getEncryptedURI",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "string" }],
  },
  {
    type: "function",
    name: "ownerOf",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "event",
    name: "MetadataUpdated",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "newHash", type: "bytes32", indexed: false },
    ],
  },
  {
    type: "event",
    name: "UsageAuthorized",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "executor", type: "address", indexed: true },
    ],
  },
] as const;
