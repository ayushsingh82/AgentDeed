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

export async function sha256(bytes: Uint8Array): Promise<string> {
  const buf = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return bytesToHex(new Uint8Array(hash));
}

export function bytesToHex(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, "0");
  }
  return out;
}
