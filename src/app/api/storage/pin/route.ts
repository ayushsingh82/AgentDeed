/**
 * POST /api/storage/pin
 *
 * Body: raw bytes (application/octet-stream) — the AES-256-GCM ciphertext
 *       produced by /builder's encrypt step.
 *
 * Returns: { rootHash, txHash, txSeq, size, uri } — the real on-chain
 *          handle to use as ERC-7857 `encryptedURI`.
 */
import { pinBytes, StorageError } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Cap inbound payloads at 50 MB — sealed LoRAs sit well below this, and we
// don't want a stray multi-GB upload to wedge the dev server.
const MAX_BYTES = 50 * 1024 * 1024;

export async function POST(request: Request) {
  const lengthHeader = request.headers.get("content-length");
  if (lengthHeader && Number(lengthHeader) > MAX_BYTES) {
    return Response.json(
      { error: `Ciphertext exceeds ${MAX_BYTES} byte cap.` },
      { status: 413 },
    );
  }

  let bytes: Uint8Array;
  try {
    const buf = await request.arrayBuffer();
    if (buf.byteLength > MAX_BYTES) {
      return Response.json(
        { error: `Ciphertext exceeds ${MAX_BYTES} byte cap.` },
        { status: 413 },
      );
    }
    bytes = new Uint8Array(buf);
  } catch (e) {
    return Response.json(
      { error: `Failed to read request body: ${(e as Error).message}` },
      { status: 400 },
    );
  }

  if (bytes.length === 0) {
    return Response.json(
      { error: "Empty body — nothing to pin." },
      { status: 400 },
    );
  }

  try {
    const result = await pinBytes(bytes);
    return Response.json(result);
  } catch (err) {
    const status = err instanceof StorageError ? err.status : 502;
    return Response.json(
      { error: (err as Error).message },
      { status: status >= 400 ? status : 502 },
    );
  }
}
