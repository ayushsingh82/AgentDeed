import {
  encodePacked,
  keccak256,
  recoverMessageAddress,
  type Address,
  type Hex,
} from "viem";

// Client-side verification of TEE re-encryption proofs.
//
// When the 0G Compute TEE re-seals a model's AES key to a new owner it signs
// a digest binding the token, its weights hash, the new owner, and the sealed
// envelope. `TEEOracle.verifyReseal` checks that same signature on-chain; this
// module lets the UI verify it *before* submitting the transfer, so a user is
// never asked to sign a transaction against a bogus envelope.

export type ResealProof = {
  tokenId: bigint;
  metadataHash: Hex;
  newOwner: Address;
  /** The sealed-key envelope bytes, as stored on-chain. */
  sealedKey: Hex;
  /** 65-byte ECDSA signature produced by the TEE's attested signing key. */
  signature: Hex;
};

/** The digest the TEE signs — mirrors `TEEOracle.resealDigest` exactly. */
export function resealDigest(
  tokenId: bigint,
  metadataHash: Hex,
  newOwner: Address,
  sealedKey: Hex,
): Hex {
  return keccak256(
    encodePacked(
      ["uint256", "bytes32", "address", "bytes32"],
      [tokenId, metadataHash, newOwner, keccak256(sealedKey)],
    ),
  );
}

/** Recover the TEE signer address from a re-encryption proof. */
export async function recoverResealSigner(
  proof: ResealProof,
): Promise<Address> {
  const digest = resealDigest(
    proof.tokenId,
    proof.metadataHash,
    proof.newOwner,
    proof.sealedKey,
  );
  return recoverMessageAddress({
    message: { raw: digest },
    signature: proof.signature,
  });
}

/**
 * Verify a TEE re-encryption proof against a set of trusted signer addresses.
 * `trustedSigners` should mirror the addresses registered in `TEEOracle`
 * (read them from the contract, or pin known-good attested keys).
 */
export async function verifyTeeAttestation(
  proof: ResealProof,
  trustedSigners: readonly Address[],
): Promise<{ valid: boolean; signer: Address }> {
  const signer = await recoverResealSigner(proof);
  const normalized = trustedSigners.map((s) => s.toLowerCase());
  return {
    valid: normalized.includes(signer.toLowerCase()),
    signer,
  };
}
