# AgentDeed

> Sealed-key marketplace for fine-tuned models. **The iNFT *is* the model.**
> Sell the weights, lose the access — the buyer's wallet is the only one that
> can run inference.

AgentDeed lists encrypted fine-tunes (LoRAs, adapters, full checkpoints) as
ERC-7857 iNFTs on 0G. The encrypted weights live on **0G Storage**.
The AES key that decrypts them is **sealed inside a TEE** and re-encrypted to
the new owner on every transfer. Other marketplaces sell pointers to weights;
AgentDeed sells the *capability to run them*.

```
  wallet A          contract            wallet B
     │                  │                   │
     ├──mint──▶ iNFT #00427 ◀──buy──────────┤
     │                  │                   │
     │            sealed-key                │
     │           re-encrypted               │
     │              to B                    │
     │                  │                   │
     ├─ infer ✗ unauthorized                │
     │                  ├─ infer ✓ TEE──────┤
```

You cannot build this on Ethereum + IPFS. The seal-and-rotate flow only works
if storage, settlement, and the attested TEE inference provider are in the
same trust domain — which is what 0G gives you.

## Stack

| Layer        | Choice                                        |
| ------------ | --------------------------------------------- |
| App          | Next.js 16 (App Router) · React 19 · TS       |
| Styling      | Tailwind v4 · custom bone/black/orange theme  |
| Wallet       | wagmi 2 · RainbowKit · viem                   |
| Chain        | 0G (chain id `16602`)                         |
| Storage      | 0G Storage (encrypted blobs, content-addr)    |
| Token        | ERC-7857 iNFT with sealed-key envelope        |
| Inference    | 0G Compute TEE provider (attested)            |
| Encryption   | AES-256-GCM in WebCrypto (client-side)        |

## Routes

| Path            | What                                                          |
| --------------- | ------------------------------------------------------------- |
| `/`             | Landing — hero, marquee, how-it-works, two-wallet demo, FAQ   |
| `/infts`        | Marketplace — sealed listings with filters & search           |
| `/my-agents`    | Wallet-gated vault — your holdings, listings, and revenue     |
| `/builder`      | Mint pipeline — upload → encrypt → 0G pin → mint              |
| `/playground`   | Live inference — runs models on the 0G Compute Router         |
| `/api/inference`| Server proxy — fronts the 0G Router, keeps the API key server-side |
| `/pitch`        | 8-slide investor deck — problem, solution, business model, traction |

## What's a LoRA, and why this matters

**LoRA = Low-Rank Adaptation.** A small file (~5–500 MB) that *modifies* a
base model's behavior without replacing the model itself.

The intuition: a 70B-parameter model has billions of weights. Retraining
all of them to specialize the model for, say, medical Q&A costs $50k–$200k
in GPU time. But it turns out you can capture most of the specialization
by training a tiny "delta" — two small matrices that get added on top of
each transformer layer. That delta is the LoRA.

So instead of shipping a 140 GB fine-tune, you ship:

- **The base model** (Llama-3, Mistral, etc.) — already public, hosted everywhere
- **A 50 MB LoRA file** — your IP

At inference time the runtime loads both and merges them. The "rank" you
see in the `/builder` form (16, 32, 64) is the inner dimension of those
delta matrices — smaller = cheaper to train, bigger = more capacity for
specialization. Rank 16 is a sane default for chat-style tasks.

**Why this matters for AgentDeed.** LoRAs are the perfect product for a
sealed-key marketplace. They're small (cheap to encrypt + pin), have real
economic value (good ones are scarce), and the base model they ride on is
free and public — so the buyer's compute cost is normal even though the
*capability* is exclusive to them.

## How the builder actually works

The `/builder` route walks a checkpoint through a real four-stage flow:

1. **Upload** — `.safetensors` / `.bin` / `.pt` / `.gguf` picked from disk.
   Never leaves the browser unsealed.
2. **Encrypt** — `src/lib/crypto.ts` runs **AES-256-GCM via WebCrypto** on
   the bytes, with a fresh 256-bit key and 96-bit nonce. SHA-256 of the
   ciphertext is computed for the content address.
3. **Pin to 0G Storage** — the ciphertext is `POST`ed to `/api/storage/pin`,
   which uses `@0gfoundation/0g-storage-ts-sdk` (signed with the deployer
   key, server-side) to submit a real upload tx. A genuine
   `0g://<rootHash>` URI comes back.
4. **Mint** — `AgentDeed.mint(to, encryptedURI, metadataHash)` is signed
   by the connected wallet and submitted to chain 16602. The mint receipt
   carries the new `tokenId`.

The stage indicator, progress bars, and live build log on the right column
all reflect actual work — the SHA-256 you see logged is the hash of *your*
file's ciphertext.

## Architecture

One trust domain, four layers. Storage, settlement, and inference all
settle to the same chain — no cross-chain bridges, no off-chain receipts
to trust.

```
┌───────────────────────────────────────────────────────────────────┐
│ L4 · App                                                          │
│   Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4   │
│   Pages: / · /infts · /my-agents · /builder · /playground · /pitch│
└─────────────────────────────┬─────────────────────────────────────┘
                              │
┌─────────────────────────────┴─────────────────────────────────────┐
│ L3 · Wallet & RPC                                                 │
│   wagmi 2 · viem · RainbowKit                                     │
│   Parallel contract reads (no Multicall3) · signed writes         │
└─────────────────────────────┬─────────────────────────────────────┘
                              │
              ┌───────────────┼────────────────┐
              ▼               ▼                ▼
┌────────────────────┐ ┌──────────────┐ ┌──────────────────────────┐
│ L2 · Compute       │ │ L1 · Chain   │ │ L0 · Storage             │
│ 0G Compute Router  │ │ AgentDeed    │ │ 0G Storage               │
│ TEE-attested       │ │  (ERC-7857)  │ │ content-addressed        │
│ providers          │ │ TEEOracle    │ │ 3× replicas              │
│ Ollama fallback    │ │ chain 16602  │ │ AES-256-GCM ciphertext   │
│ (local dev)        │ │              │ │                          │
└────────────────────┘ └──────────────┘ └──────────────────────────┘
```

### Request flow — what happens on a mint

```
Browser                Next.js /api          0G Storage          AgentDeed
   │                       │                      │                   │
   ├─ select file ─────────┤                      │                   │
   ├─ AES-256-GCM encrypt ─┤  (WebCrypto, in-browser, raw bytes stay here)
   │   → ciphertext + key  │                      │                   │
   │                       │                      │                   │
   ├─ POST /api/storage/pin┤                      │                   │
   │   (ciphertext bytes)  │                      │                   │
   │                       ├─ Indexer.upload ────▶│                   │
   │                       │   (signed by         │ rootHash returned │
   │                       │    deployer key)     │                   │
   │                       │◀─ rootHash, txHash ──┤                   │
   │◀─ { uri, rootHash } ──┤                      │                   │
   │                       │                      │                   │
   ├─ wallet.writeContract ────────────────────────────────────────▶  │
   │   AgentDeed.mint(to, "0g://<rootHash>", sha256(ciphertext))      │
   │                                                                  │
   │◀─ tx hash · tokenId ─────────────────────────────────────────────┤
   │                       │                      │                   │
   │  Token now references the encrypted blob by content hash.        │
   │  Only the AES key (sealed in the envelope) can decrypt it.       │
```

### Key design decisions

| Decision                                  | Why                                                                                  |
| ----------------------------------------- | ------------------------------------------------------------------------------------ |
| Encrypt in the browser, never server-side | Raw weights never touch a network we don't control. WebCrypto is a hard requirement. |
| Server-side storage pin                   | The 0G Storage SDK signs an on-chain submission tx. Browser can't safely hold a key. |
| Parallel `eth_call` instead of Multicall3 | 0G doesn't register Multicall3 with viem. Three parallel reads batch on the RPC.     |
| Ollama as a `/playground` fallback        | Lets the inference layer be exercised end-to-end without a router key.               |
| Oracle deployed but unwired               | Permissionless transfers on testnet → faster demo iteration; oracle wiring is a `setSigner` call away. |

### Repository

```
.                       
├── src/app/            ← Next.js routes (UI + API)
├── src/components/     ← NavBar, Footer, brand mark
├── src/lib/            ← Framework-agnostic clients
│   ├── crypto.ts       ← WebCrypto AES-256-GCM
│   ├── inft.ts         ← viem client for AgentDeed
│   ├── ollama.ts       ← Local inference fallback
│   ├── router.ts       ← 0G Compute Router client
│   └── storage.ts      ← Server-side 0G Storage pin
├── contracts/          ← Hardhat project (Solidity 0.8.24)
│   ├── src/            ← AgentDeed.sol · IERC7857.sol · TEEOracle.sol
│   └── scripts/        ← deploy · wallet:new · mint:test · transfer
└── pending.mmd         ← Cross-session task tracker
```

## Deployed contracts

Live on 0G (chain id `16602`).

| Contract     | Address                                                                                                                          | Explorer                                                                                                              |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **AgentDeed** (ERC-7857) | `0x21cBA803EdB8676D06FAf9aCAb84611C98B7A370` | [chainscan-galileo.0g.ai/address/0x21cBA803EdB8676D06FAf9aCAb84611C98B7A370](https://chainscan-galileo.0g.ai/address/0x21cBA803EdB8676D06FAf9aCAb84611C98B7A370) |
| **TEEOracle**            | `0xcF7294f6C6Ca09cae9b6832efbCffAB218e7d499` | [chainscan-galileo.0g.ai/address/0xcF7294f6C6Ca09cae9b6832efbCffAB218e7d499](https://chainscan-galileo.0g.ai/address/0xcF7294f6C6Ca09cae9b6832efbCffAB218e7d499) |

First test mint: `tokenId 1`, tx
[`0x84f5baf9b99e6b1e4d180a97eabe7decfaf980fe9ae5eca9a4a7b04f4ac60351`](https://chainscan-galileo.0g.ai/tx/0x84f5baf9b99e6b1e4d180a97eabe7decfaf980fe9ae5eca9a4a7b04f4ac60351).

The oracle is deployed but **not wired** into AgentDeed — transfers/clones
are permissionless on testnet until an attested TEE signer is registered via
`TEEOracle.setSigner`.

## Running locally

```bash
npm install
npm run dev          # http://localhost:3000
```

Copy `.env.example` to `.env.local` and fill what you need:

```bash
NEXT_PUBLIC_OG_INDEXER_URL=https://indexer-storage-testnet-turbo.0g.ai
NEXT_PUBLIC_OG_KV_NODE_URL=https://rpc-storage-testnet-turbo.0g.ai
NEXT_PUBLIC_OG_COMPUTE_BROKER_URL=https://compute-testnet.0g.ai
NEXT_PUBLIC_OG_ROUTER_URL=https://router-api.0g.ai
OG_ROUTER_API_KEY=sk-...                                              # server-side; enables /playground chat
NEXT_PUBLIC_AGENT_DEED_ADDRESS=0x21cBA803EdB8676D06FAf9aCAb84611C98B7A370
NEXT_PUBLIC_TEE_ORACLE_ADDRESS=0xcF7294f6C6Ca09cae9b6832efbCffAB218e7d499
```

Defaults that ship in the code point at the public 0G endpoints — most users
won't need to override them. `OG_ROUTER_API_KEY` is the only secret: it's
read server-side by `/api/inference` and never reaches the browser. Without
it, `/playground` still loads the live model catalog but chat calls return a
clear "not configured" error.

### Local inference with Ollama (no router key needed)

`/playground` has a built-in fallback that routes to a local **Ollama**
instance instead of the 0G Compute Router. Useful when you don't have a
router API key or want to demo offline.

```bash
brew install ollama          # macOS; ollama.com has Linux + Windows builds
ollama pull qwen2:0.5b       # ~350 MB · fits in 8 GB RAM. or phi3, llama3, etc.
ollama serve                 # listens on localhost:11434
```

Then in `.env.local`:

```bash
OLLAMA_BASE_URL=http://localhost:11434
```

Restart `npm run dev`. `/playground` now shows a **"Provider · Self-hosted
Ollama · localhost"** banner, the model picker lists whatever you've pulled,
and chat responses come from your laptop. Wire format is OpenAI-compatible
— same code path as the 0G Router, the request body is identical.

The `x_0g_trace` in the response is synthesized (zero cost, `tee_verified:
false`) so the UI's billing trace block stays honest about the source.

### Deploy your own copy

```bash
cd contracts
npm install
npm run wallet:new         # writes a fresh EOA to contracts/.env
# fund the printed address from https://faucet.0g.ai
npm run deploy             # deploys TEEOracle + AgentDeed
npm run mint:test          # optional — mints token #1 as a smoke test
```

The deploy script prints both `NEXT_PUBLIC_*` lines to paste into
`.env.local`.

## Why ERC-7857 (and not 721 / 1155)

A vanilla 721 only records ownership. ERC-7857 attaches a transferable
**encrypted-key envelope** to the token; the contract is the authoritative
holder of "who can unwrap this." Combined with a TEE that refuses to decrypt
for anyone except the current key holder, this gives you cryptographic
exclusivity rather than honor-system licensing.

## What ships today

- ✅ Full UI for all five routes
- ✅ Real client-side AES-256-GCM encryption via WebCrypto
- ✅ Real `0G` wallet config and chain switching via RainbowKit
- ✅ `AgentDeed` + `TEEOracle` deployed live on 0G (see addresses above)
- ✅ `/infts` and `/my-agents` read live state via the viem multicall client
- ✅ `/builder` mint stage submits a real on-chain `mint` tx (with a
  simulated-mint fallback for unconfigured environments)
- ✅ Live 0G Compute Router inference — `/playground` calls real TEE-attested
  providers through the `/api/inference` proxy, with on-chain billing traces
- ✅ Live 0G Storage upload — `/builder` ciphertext is pinned through
  `@0gfoundation/0g-storage-ts-sdk` via the server-side `/api/storage/pin`
  route; the iNFT records a real `0g://<rootHash>` URI
- ✅ TEE re-encryption on transfer — contract path ready; awaits an attested
  TEE signer registered via `TEEOracle.setSigner`

## License

MIT
