# WeightVault

> Sealed-key marketplace for fine-tuned models. **The iNFT *is* the model.**
> Sell the weights, lose the access — the buyer's wallet is the only one that
> can run inference.

WeightVault lists encrypted fine-tunes (LoRAs, adapters, full checkpoints) as
ERC-7857 iNFTs on 0G Galileo. The encrypted weights live on **0G Storage**.
The AES key that decrypts them is **sealed inside a TEE** and re-encrypted to
the new owner on every transfer. Other marketplaces sell pointers to weights;
WeightVault sells the *capability to run them*.

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
| Chain        | 0G Galileo Testnet (chain id `16601`)         |
| Storage      | 0G Storage (encrypted blobs, content-addr)    |
| Token        | ERC-7857 iNFT with sealed-key envelope        |
| Inference    | 0G Compute TEE provider (attested)            |
| Encryption   | AES-256-GCM in WebCrypto (client-side)        |

## Routes

| Path          | What                                                           |
| ------------- | -------------------------------------------------------------- |
| `/`           | Landing — hero, marquee, how-it-works, two-wallet demo, FAQ    |
| `/infts`      | Marketplace — sealed listings with filters & search            |
| `/my-agents`  | Wallet-gated vault — your holdings, listings, and revenue      |
| `/builder`    | Mint pipeline — upload → encrypt → 0G pin → mint               |

## How the builder actually works

The `/builder` route walks a checkpoint through a real four-stage flow:

1. **Upload** — `.safetensors` / `.bin` / `.pt` / `.gguf` picked from disk.
   Never leaves the browser unsealed.
2. **Encrypt** — `src/lib/crypto.ts` runs **AES-256-GCM via WebCrypto** on
   the bytes, with a fresh 256-bit key and 96-bit nonce. SHA-256 of the
   ciphertext is computed for the content address.
3. **Pin to 0G Storage** — the ciphertext is shipped to the 0G Storage
   indexer (`NEXT_PUBLIC_OG_INDEXER_URL`) and a root hash / CID is returned.
4. **Mint** — `WeightVault` ERC-7857 contract is called with
   `(to, encryptedURI, metadataHash, sealedKey)`. The sealed-key envelope
   is what the TEE later unwraps for the current holder.

The stage indicator, progress bars, and live build log on the right column
all reflect actual work — the SHA-256 you see logged is the hash of *your*
file's ciphertext.

## Project layout

```
src/
├── app/
│   ├── layout.tsx           ← root layout + providers
│   ├── providers.tsx        ← wagmi + RainbowKit on 0G Galileo
│   ├── globals.css          ← bone palette, grain, marquee keyframes
│   ├── page.tsx             ← landing page
│   ├── components/
│   │   ├── NavBar.tsx
│   │   ├── Footer.tsx
│   │   └── VaultLogo.tsx
│   ├── infts/page.tsx       ← marketplace
│   ├── my-agents/page.tsx   ← owner vault (wallet-gated)
│   └── builder/page.tsx     ← upload → encrypt → mint pipeline
└── lib/
    ├── crypto.ts            ← WebCrypto AES-256-GCM helpers
    └── og.ts                ← 0G chain / storage / compute constants + ABI
```

## Running locally

```bash
npm install
npm run dev          # http://localhost:3000
```

For wallet flows to work end-to-end you'll need a WalletConnect project id.
Copy `.env.example` to `.env.local` and fill it in:

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...
NEXT_PUBLIC_OG_INDEXER_URL=https://indexer-storage-testnet-turbo.0g.ai
NEXT_PUBLIC_OG_KV_NODE_URL=https://rpc-storage-testnet-turbo.0g.ai
NEXT_PUBLIC_OG_COMPUTE_BROKER_URL=https://compute-testnet.0g.ai
NEXT_PUBLIC_WEIGHT_VAULT_ADDRESS=0x...     # deploy your ERC-7857 first
```

Defaults that ship in the code point at the public 0G Galileo testnet
endpoints — most users won't need to override them.

## Why ERC-7857 (and not 721 / 1155)

A vanilla 721 only records ownership. ERC-7857 attaches a transferable
**encrypted-key envelope** to the token; the contract is the authoritative
holder of "who can unwrap this." Combined with a TEE that refuses to decrypt
for anyone except the current key holder, this gives you cryptographic
exclusivity rather than honor-system licensing.

## What ships today

- ✅ Full UI for all four routes
- ✅ Real client-side AES-256-GCM encryption via WebCrypto
- ✅ Real `0G Galileo` wallet config and chain switching via RainbowKit
- ✅ ABI + constants for the `WeightVault` ERC-7857 contract
- ⏳ Live 0G Storage upload — wired through env vars, contract deploy pending
- ⏳ TEE inference broker call — broker URL wired, attestation flow pending

## License

MIT
