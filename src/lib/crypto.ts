const AES_KEY_BITS = 256;
const IV_BYTES = 12;

export type SealedBlob = {
  ciphertext: Uint8Array;
  iv: Uint8Array;
  rawKey: Uint8Array;
};

export async function generateAesKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: "AES-GCM", length: AES_KEY_BITS },
    true,
    ["encrypt", "decrypt"],
  );
}

export async function exportRawKey(key: CryptoKey): Promise<Uint8Array> {
  const raw = await crypto.subtle.exportKey("raw", key);
  return new Uint8Array(raw);
}

export async function sealWeights(file: File): Promise<SealedBlob> {
  const key = await generateAesKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const plaintext = new Uint8Array(await file.arrayBuffer());

  const cipherBuf = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    plaintext,
  );

  const rawKey = await exportRawKey(key);
  return {
    ciphertext: new Uint8Array(cipherBuf),
    iv,
    rawKey,
  };
}

/** Copy a view into a standalone ArrayBuffer — WebCrypto's BufferSource type
 *  rejects the generic `Uint8Array<ArrayBufferLike>` that TS infers. */
function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
}

export async function sha256(bytes: Uint8Array): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", toArrayBuffer(bytes));
  return bytesToHex(new Uint8Array(hash));
}

export function bytesToHex(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, "0");
  }
  return out;
}

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

// --- Sealed-key envelope ---------------------------------------------------
//
// The AES key that decrypts a model's weights is never stored in the clear.
// It travels as a "sealed envelope": encrypted to the owner's vault key so
// only that owner can unwrap it. On transfer the TEE re-seals the same AES
// key to the new owner's vault key — the weights never need re-encrypting.
//
// Vault keys are ECDH P-256 keypairs. Sealing does ephemeral-static ECDH:
// a throwaway keypair + the recipient's public key derive a one-time AES-GCM
// key that wraps the raw weights key.

const ECDH_CURVE = "P-256";

export type SealedKeyEnvelope = {
  /** Ephemeral ECDH public key (JWK) — needed to re-derive the wrapping key. */
  ephemeralPublicKey: JsonWebKey;
  /** AES-GCM nonce for the wrap, hex. */
  iv: string;
  /** The wrapped raw AES key, hex. */
  wrappedKey: string;
};

/** Generate an owner's vault keypair. The public key is published; the
 *  private key stays in the owner's wallet/secure storage. */
export async function generateVaultKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: ECDH_CURVE },
    true,
    ["deriveKey"],
  );
}

export async function exportVaultPublicKey(
  keyPair: CryptoKeyPair,
): Promise<JsonWebKey> {
  return crypto.subtle.exportKey("jwk", keyPair.publicKey);
}

async function deriveWrappingKey(
  privateKey: CryptoKey,
  publicKey: CryptoKey,
  usage: KeyUsage,
): Promise<CryptoKey> {
  return crypto.subtle.deriveKey(
    { name: "ECDH", public: publicKey },
    privateKey,
    { name: "AES-GCM", length: AES_KEY_BITS },
    false,
    [usage],
  );
}

/** Seal a raw AES weights key to an owner's vault public key. */
export async function sealKey(
  rawKey: Uint8Array,
  recipientPublicJwk: JsonWebKey,
): Promise<SealedKeyEnvelope> {
  const recipientPublicKey = await crypto.subtle.importKey(
    "jwk",
    recipientPublicJwk,
    { name: "ECDH", namedCurve: ECDH_CURVE },
    false,
    [],
  );

  const ephemeral = await generateVaultKeyPair();
  const wrappingKey = await deriveWrappingKey(
    ephemeral.privateKey,
    recipientPublicKey,
    "encrypt",
  );

  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const wrapped = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    wrappingKey,
    toArrayBuffer(rawKey),
  );

  return {
    ephemeralPublicKey: await crypto.subtle.exportKey(
      "jwk",
      ephemeral.publicKey,
    ),
    iv: bytesToHex(iv),
    wrappedKey: bytesToHex(new Uint8Array(wrapped)),
  };
}

/** Unwrap a sealed envelope with the owner's vault private key. */
export async function unsealKey(
  envelope: SealedKeyEnvelope,
  recipientPrivateKey: CryptoKey,
): Promise<Uint8Array> {
  const ephemeralPublicKey = await crypto.subtle.importKey(
    "jwk",
    envelope.ephemeralPublicKey,
    { name: "ECDH", namedCurve: ECDH_CURVE },
    false,
    [],
  );

  const wrappingKey = await deriveWrappingKey(
    recipientPrivateKey,
    ephemeralPublicKey,
    "decrypt",
  );

  const raw = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: toArrayBuffer(hexToBytes(envelope.iv)) },
    wrappingKey,
    toArrayBuffer(hexToBytes(envelope.wrappedKey)),
  );
  return new Uint8Array(raw);
}

/** Serialize an envelope for on-chain storage as the iNFT `sealedKey` bytes. */
export function encodeEnvelope(envelope: SealedKeyEnvelope): string {
  return bytesToHex(
    new TextEncoder().encode(JSON.stringify(envelope)),
  );
}

export function decodeEnvelope(hex: string): SealedKeyEnvelope {
  return JSON.parse(new TextDecoder().decode(hexToBytes(hex)));
}
