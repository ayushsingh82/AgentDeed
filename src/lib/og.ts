export const OG_CHAIN = {
  id: 16601,
  name: "0G Galileo Testnet",
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

export const WEIGHT_VAULT_CONTRACT =
  (process.env.NEXT_PUBLIC_WEIGHT_VAULT_ADDRESS as `0x${string}` | undefined) ??
  ("0x0000000000000000000000000000000000000000" as const);

export const WEIGHT_VAULT_ABI = [
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "encryptedURI", type: "string" },
      { name: "metadataHash", type: "bytes32" },
      { name: "sealedKey", type: "bytes" },
    ],
    outputs: [{ name: "tokenId", type: "uint256" }],
  },
  {
    type: "function",
    name: "list",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "price", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "buy",
    stateMutability: "payable",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "buyerPubkey", type: "bytes" },
    ],
    outputs: [],
  },
] as const;
