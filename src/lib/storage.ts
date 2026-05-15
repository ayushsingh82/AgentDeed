/**
 * Server-side 0G Storage helper.
 *
 * Wraps `@0gfoundation/0g-storage-ts-sdk`'s Indexer.upload() so the rest of
 * the app can pin an in-memory ciphertext buffer and get back a real root
 * hash without having to pull ethers + the SDK into the browser bundle.
 *
 * The signer is the deployer key from contracts/.env (also serves as the
 * mint/transfer signer). Lives in DEPLOYER_PRIVATE_KEY on the server only.
 */
import { Indexer, MemData } from "@0gfoundation/0g-storage-ts-sdk";
import { ethers } from "ethers";
import { OG_CHAIN, OG_STORAGE } from "./og";

export class StorageError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "StorageError";
    this.status = status;
  }
}

let cached:
  | {
      indexer: Indexer;
      signer: ethers.Wallet;
      provider: ethers.JsonRpcProvider;
      address: string;
    }
  | null = null;

function getClient() {
  if (cached) return cached;
  const pk = process.env.DEPLOYER_PRIVATE_KEY;
  if (!pk) {
    throw new StorageError(
      503,
      "DEPLOYER_PRIVATE_KEY is not set on the server — cannot sign storage uploads.",
    );
  }
  const provider = new ethers.JsonRpcProvider(OG_CHAIN.rpcUrl);
  const signer = new ethers.Wallet(pk, provider);
  const indexer = new Indexer(OG_STORAGE.indexerUrl);
  cached = { indexer, signer, provider, address: signer.address };
  return cached;
}

export type PinResult = {
  rootHash: string;
  txHash: string;
  txSeq: number;
  size: number;
  /** uri suitable for storing as ERC-7857 encryptedURI — `0g://<rootHash>`. */
  uri: string;
};

/**
 * Pin an in-memory byte buffer to 0G Storage.
 *
 * @param ciphertext  encrypted weights blob (already sealed in the browser)
 * @param replicas    sharding sets to upload to (3 is the default; matches
 *                    the public testnet recommendation)
 */
export async function pinBytes(
  ciphertext: Uint8Array,
  replicas: number = 3,
): Promise<PinResult> {
  if (ciphertext.length === 0) {
    throw new StorageError(400, "Empty ciphertext — nothing to pin.");
  }
  const { indexer, signer } = getClient();

  const file = new MemData(ciphertext);
  const [tx, err] = await indexer.upload(
    file,
    OG_CHAIN.rpcUrl,
    signer,
    undefined,
    undefined,
    { expectedReplica: replicas } as never,
  );
  if (err) {
    throw new StorageError(502, `0G Storage upload failed: ${err.message}`);
  }

  // The SDK can return a single-hash record or a multi-fragment record
  // depending on file size. Normalize down to the single-hash shape for
  // our use case (small ciphertexts) and surface the first if sharded.
  const single =
    "rootHash" in tx ? tx : { rootHash: tx.rootHashes[0], txHash: tx.txHashes[0], txSeq: tx.txSeqs[0] };

  return {
    rootHash: single.rootHash,
    txHash: single.txHash,
    txSeq: Number(single.txSeq),
    size: ciphertext.length,
    uri: `0g://${single.rootHash}`,
  };
}
