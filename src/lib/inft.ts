import {
  createPublicClient,
  defineChain,
  http,
  parseEventLogs,
  type Address,
  type Hex,
  type WalletClient,
} from "viem";
import {
  AGENT_DEED_ABI,
  AGENT_DEED_CONTRACT,
  AGENT_DEED_DEPLOYED,
  OG_CHAIN,
} from "./og";

// viem client for the AgentDeed ERC-7857 contract.
//
// Reads go through a shared public client; writes take a wagmi `WalletClient`
// (from `useWalletClient()`) so this module stays framework-agnostic. Every
// entry point throws early if the contract address isn't configured, rather
// than letting calls fail opaquely against the zero address.

export const ogGalileo = defineChain({
  id: OG_CHAIN.id,
  name: OG_CHAIN.name,
  nativeCurrency: { name: OG_CHAIN.symbol, symbol: OG_CHAIN.symbol, decimals: 18 },
  rpcUrls: { default: { http: [OG_CHAIN.rpcUrl] } },
  blockExplorers: {
    default: { name: "0G Explorer", url: OG_CHAIN.explorer },
  },
  testnet: true,
});

export const publicClient = createPublicClient({
  chain: ogGalileo,
  transport: http(OG_CHAIN.rpcUrl),
});

// Functions present on the deployed contract but not in the app's base ABI.
const EXTRA_ABI = [
  {
    type: "function",
    name: "getSealedKey",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "bytes" }],
  },
  {
    type: "function",
    name: "getApproved",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function",
    name: "totalSupply",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "usagePermissions",
    stateMutability: "view",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "executor", type: "address" },
    ],
    outputs: [{ name: "", type: "bytes" }],
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

export const INFT_ABI = [...AGENT_DEED_ABI, ...EXTRA_ABI] as const;

function assertDeployed(): void {
  if (!AGENT_DEED_DEPLOYED) {
    throw new Error(
      "AgentDeed contract not configured — set NEXT_PUBLIC_AGENT_DEED_ADDRESS",
    );
  }
}

function requireAccount(wallet: WalletClient): Address {
  if (!wallet.account) {
    throw new Error("Wallet client has no connected account");
  }
  return wallet.account.address;
}

// --- reads ----------------------------------------------------------------

export function ownerOf(tokenId: bigint): Promise<Address> {
  assertDeployed();
  return publicClient.readContract({
    address: AGENT_DEED_CONTRACT,
    abi: INFT_ABI,
    functionName: "ownerOf",
    args: [tokenId],
  });
}

export function balanceOf(owner: Address): Promise<bigint> {
  assertDeployed();
  return publicClient.readContract({
    address: AGENT_DEED_CONTRACT,
    abi: INFT_ABI,
    functionName: "balanceOf",
    args: [owner],
  });
}

export function getMetadataHash(tokenId: bigint): Promise<Hex> {
  assertDeployed();
  return publicClient.readContract({
    address: AGENT_DEED_CONTRACT,
    abi: INFT_ABI,
    functionName: "getMetadataHash",
    args: [tokenId],
  });
}

export function getEncryptedURI(tokenId: bigint): Promise<string> {
  assertDeployed();
  return publicClient.readContract({
    address: AGENT_DEED_CONTRACT,
    abi: INFT_ABI,
    functionName: "getEncryptedURI",
    args: [tokenId],
  });
}

export function getSealedKey(tokenId: bigint): Promise<Hex> {
  assertDeployed();
  return publicClient.readContract({
    address: AGENT_DEED_CONTRACT,
    abi: INFT_ABI,
    functionName: "getSealedKey",
    args: [tokenId],
  });
}

export function getApproved(tokenId: bigint): Promise<Address> {
  assertDeployed();
  return publicClient.readContract({
    address: AGENT_DEED_CONTRACT,
    abi: INFT_ABI,
    functionName: "getApproved",
    args: [tokenId],
  });
}

export function totalSupply(): Promise<bigint> {
  assertDeployed();
  return publicClient.readContract({
    address: AGENT_DEED_CONTRACT,
    abi: INFT_ABI,
    functionName: "totalSupply",
  });
}

export function usagePermissions(
  tokenId: bigint,
  executor: Address,
): Promise<Hex> {
  assertDeployed();
  return publicClient.readContract({
    address: AGENT_DEED_CONTRACT,
    abi: INFT_ABI,
    functionName: "usagePermissions",
    args: [tokenId, executor],
  });
}

/** Token ids start at 1 and are never reused — enumerate by counting up to
 *  `totalSupply()`. Tokens are never burned, so every id in range exists. */
export async function listTokenIds(): Promise<bigint[]> {
  const supply = await totalSupply();
  return Array.from({ length: Number(supply) }, (_, i) => BigInt(i + 1));
}

export type InftRecord = {
  tokenId: bigint;
  owner: Address;
  encryptedURI: string;
  metadataHash: Hex;
};

/** Fetch the full record for one token in a single multicall round-trip. */
export async function getInft(tokenId: bigint): Promise<InftRecord> {
  assertDeployed();
  const base = {
    address: AGENT_DEED_CONTRACT,
    abi: INFT_ABI,
  } as const;
  const [owner, encryptedURI, metadataHash] = await publicClient.multicall({
    allowFailure: false,
    contracts: [
      { ...base, functionName: "ownerOf", args: [tokenId] },
      { ...base, functionName: "getEncryptedURI", args: [tokenId] },
      { ...base, functionName: "getMetadataHash", args: [tokenId] },
    ],
  });
  return { tokenId, owner, encryptedURI, metadataHash };
}

/** All minted tokens. Use for `/infts`; filter by `owner` for `/my-agents`. */
export async function listInfts(): Promise<InftRecord[]> {
  const ids = await listTokenIds();
  return Promise.all(ids.map(getInft));
}

// --- writes ---------------------------------------------------------------

export type MintArgs = {
  to: Address;
  encryptedURI: string;
  metadataHash: Hex;
};

/** Submit a `mint` tx. Returns the tx hash — pair with `waitForMintedTokenId`. */
export function mint(wallet: WalletClient, args: MintArgs): Promise<Hex> {
  assertDeployed();
  const account = requireAccount(wallet);
  return wallet.writeContract({
    address: AGENT_DEED_CONTRACT,
    abi: INFT_ABI,
    functionName: "mint",
    args: [args.to, args.encryptedURI, args.metadataHash],
    account,
    chain: ogGalileo,
  });
}

export type TransferArgs = {
  from: Address;
  to: Address;
  tokenId: bigint;
  /** Sealed-key envelope re-encrypted to `to` (see `crypto.ts#sealKey`). */
  sealedKey: Hex;
  /** TEE attestation proof; `0x` when no oracle is wired on testnet. */
  proof: Hex;
};

export function transfer(
  wallet: WalletClient,
  args: TransferArgs,
): Promise<Hex> {
  assertDeployed();
  const account = requireAccount(wallet);
  return wallet.writeContract({
    address: AGENT_DEED_CONTRACT,
    abi: INFT_ABI,
    functionName: "transfer",
    args: [args.from, args.to, args.tokenId, args.sealedKey, args.proof],
    account,
    chain: ogGalileo,
  });
}

export type CloneArgs = {
  to: Address;
  tokenId: bigint;
  sealedKey: Hex;
  proof: Hex;
};

export function clone(wallet: WalletClient, args: CloneArgs): Promise<Hex> {
  assertDeployed();
  const account = requireAccount(wallet);
  return wallet.writeContract({
    address: AGENT_DEED_CONTRACT,
    abi: INFT_ABI,
    functionName: "clone",
    args: [args.to, args.tokenId, args.sealedKey, args.proof],
    account,
    chain: ogGalileo,
  });
}

export type AuthorizeUsageArgs = {
  tokenId: bigint;
  executor: Address;
  /** Opaque permission blob interpreted off-chain by the TEE. */
  permissions: Hex;
};

export function authorizeUsage(
  wallet: WalletClient,
  args: AuthorizeUsageArgs,
): Promise<Hex> {
  assertDeployed();
  const account = requireAccount(wallet);
  return wallet.writeContract({
    address: AGENT_DEED_CONTRACT,
    abi: INFT_ABI,
    functionName: "authorizeUsage",
    args: [args.tokenId, args.executor, args.permissions],
    account,
    chain: ogGalileo,
  });
}

export function approve(
  wallet: WalletClient,
  to: Address,
  tokenId: bigint,
): Promise<Hex> {
  assertDeployed();
  const account = requireAccount(wallet);
  return wallet.writeContract({
    address: AGENT_DEED_CONTRACT,
    abi: INFT_ABI,
    functionName: "approve",
    args: [to, tokenId],
    account,
    chain: ogGalileo,
  });
}

// --- receipts -------------------------------------------------------------

export function waitForReceipt(hash: Hex) {
  return publicClient.waitForTransactionReceipt({ hash });
}

/**
 * Wait for a `mint` / `clone` tx and pull the new token id out of the
 * `MetadataUpdated` event (`mint`'s `uint256` return value isn't readable
 * from a mined tx — the indexed event is the source of truth).
 */
export async function waitForMintedTokenId(hash: Hex): Promise<bigint> {
  const receipt = await waitForReceipt(hash);
  const logs = parseEventLogs({
    abi: INFT_ABI,
    eventName: "MetadataUpdated",
    logs: receipt.logs,
  });
  const minted = logs[0];
  if (!minted) {
    throw new Error("No MetadataUpdated event in mint receipt");
  }
  return minted.args.tokenId;
}
