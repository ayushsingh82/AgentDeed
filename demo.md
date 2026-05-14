# AgentDeed — Demo Walkthrough

A step-by-step guide to run AgentDeed locally and verify each part of the
demo works. Use this to check the build before a presentation or review.

> **Status legend** — used throughout this doc:
> - **LIVE** — fully working, real cryptography / real wallet calls
> - **SIM** — simulated in the UI (no network call yet), pending 0G integration

---

## 1. Prerequisites

- **Node.js 18+** and npm
- A browser wallet (MetaMask or any WalletConnect-compatible wallet)
- A **WalletConnect Project ID** — free, from https://cloud.walletconnect.com
- Optional, for wallet flows: 0G Galileo testnet tokens from the 0G faucet

---

## 2. One-time setup

```bash
# from the project root
npm install

# create your local env file
cp .env.example .env.local
```

Open `.env.local` and fill in **at minimum**:

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<your-walletconnect-id>
```

The 0G endpoint vars (`NEXT_PUBLIC_OG_INDEXER_URL`, `NEXT_PUBLIC_OG_KV_NODE_URL`,
`NEXT_PUBLIC_OG_COMPUTE_BROKER_URL`) already have working public-testnet
defaults baked into `src/lib/og.ts` — leave them blank unless you're pointing
at your own node.

`NEXT_PUBLIC_AGENT_DEED_ADDRESS` can stay empty for the demo — the contract
isn't deployed yet, so the mint step is **SIM**.

---

## 3. Start the app

```bash
npm run dev
```

Open http://localhost:3000 — you should see the AgentDeed landing page.

**Verify:** the NavBar wordmark reads **Agent**Deed (with "Deed" in orange),
and the footer copyright also says "AgentDeed". If you still see "WeightVault"
anywhere, the dev server is serving a stale build — restart it.

---

## 4. Route-by-route checklist

The app has four routes. Walk each one.

### 4.1 `/` — Landing page  **LIVE**

- Hero, marquee, how-it-works, two-wallet demo diagram, FAQ all render.
- Copy mentions "AgentDeed is a sealed-key marketplace for fine-tunes."
- Nav links (`Marketplace`, `My Models`, `Builder`) route correctly.

### 4.2 `/infts` — Marketplace  **LIVE (UI) / SIM (data)**

- Grid of sealed model listings renders.
- Filters and search narrow the list.
- Listings are demo data — there's no contract read yet.

### 4.3 `/my-agents` — Owner vault  **LIVE (wallet gate) / SIM (data)**

- If wallet is **not** connected: page shows a connect prompt (wallet-gated).
- Connect a wallet (see section 5) → holdings / listings / revenue panels render.
- Holdings are demo data until the contract is live.

### 4.4 `/builder` — Mint pipeline  **partially LIVE**

This is the most important route to demo. It walks a file through four stages:
**Upload → Encrypt → Store on 0G → Mint iNFT**.

What's real vs simulated:

| Stage        | Status | Notes                                                            |
| ------------ | ------ | ---------------------------------------------------------------- |
| Upload       | LIVE   | File picked from disk, never leaves the browser                  |
| Encrypt      | LIVE   | Real AES-256-GCM via WebCrypto (`src/lib/crypto.ts`)             |
| Store on 0G  | SIM    | Progress bar + fake `cid` — real 0G Storage upload pending       |
| Mint iNFT    | SIM    | Random `tokenId` — ERC-7857 contract deploy pending              |

See section 6 for the detailed builder test.

---

## 5. Connect a wallet  **LIVE**

1. Click **Connect** (top-right, RainbowKit button).
2. Pick your wallet. The app is configured for **0G Galileo Testnet**
   (chain id `16601`).
3. If your wallet doesn't have the network, RainbowKit / the wallet will
   prompt you to add and switch to it.
4. **Verify:** the connect button shows your address + the 0G network icon.
5. Revisit `/my-agents` — it should now show the vault panels instead of the
   connect prompt.

You do **not** need testnet tokens just to connect. You'd only need them once
the mint step is wired to a real contract.

---

## 6. Builder end-to-end test (the core demo)  **partially LIVE**

This proves the real encryption path works.

1. Go to `/builder`.
2. **Upload:** click the drop zone and pick any `.safetensors`, `.bin`,
   `.pt`, or `.gguf` file. (Any file with those extensions works for the demo —
   a small dummy file is fine.)
3. Fill the form: **Model name** and **Domain / capability** are required.
   Base model, LoRA rank, and list price have defaults.
4. Click **Seal & mint →**.
5. Watch the **build.log** panel on the right. You should see real output:
   - `[encrypt] init AES-256-GCM · 12B nonce`
   - `[encrypt] <filename> → <size> ciphertext`
   - `[encrypt] sha256(ct) = <hash>…`  ← **this is a real SHA-256 of YOUR file's ciphertext**
   - `[encrypt] aes-key = <hex>…`      ← **real 256-bit key from WebCrypto**
   - `[0g.store] …`  ← SIM (fake cid/root)
   - `[mint] …`      ← SIM (random tokenId)
6. The pipeline lands on the **"iNFT #NNNN is sealed"** done screen.

**How to verify the encryption is genuinely real (not faked):**
- Upload the **same file twice** → the `sha256(ct)` line differs each run.
  That's expected: a fresh random key + nonce every time means the ciphertext
  (and its hash) changes. A faked demo would show the same hash.
- Upload a **larger file** → the `ciphertext` size in the log scales with it.

**Known SIM behavior to call out in a demo:**
- The `cid`/`root` and `tokenId` are generated locally, not from 0G.
- No on-chain transaction is sent. The "View on marketplace" link goes to the
  demo listings, not a real token.

---

## 7. Quick smoke test (TL;DR)

```bash
npm install
cp .env.example .env.local      # add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
npm run dev
```

Then in the browser:
1. `/` loads, wordmark says **AgentDeed**.
2. Connect wallet → shows address on 0G Galileo.
3. `/my-agents` unlocks after connect.
4. `/builder` → upload a file → **Seal & mint** → build.log shows a real
   SHA-256 of your file's ciphertext → done screen appears.

If all four pass, the demo is working as intended for its current stage.

---

## 8. What's NOT in the demo yet

These are the **SIM** pieces, pending 0G integration work:

- **Real 0G Storage upload** — needs the 0G Storage TS SDK wired into the
  builder's "Store" stage so the sealed blob is actually pinned and a real
  root hash / URI comes back.
- **ERC-7857 contract** — needs an INFT contract deployed to 0G Galileo
  (per the 0G INFT Integration Guide), its address in
  `NEXT_PUBLIC_AGENT_DEED_ADDRESS`, and the `mint` call wired up.
- **TEE re-encryption + inference** — the buy → oracle re-encrypt → sealed-key
  delivery → 0G Compute inference flow. This is the `transfer(from, to,
  tokenId, sealedKey, proof)` path from the ERC-7857 standard.

Until those land, the demo proves: **the UI, the wallet integration, and the
client-side encryption are real**; storage pinning and on-chain mint are
mocked.

---

## 9. Troubleshooting

| Symptom                                  | Fix                                                          |
| ---------------------------------------- | ------------------------------------------------------------ |
| Still see "WeightVault" in the UI        | Restart `npm run dev` — stale build cache.                   |
| Connect button does nothing / errors     | `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` missing in `.env.local`. |
| Wallet won't switch network              | Manually add 0G Galileo (chain id `16601`, RPC `https://evmrpc-testnet.0g.ai`). |
| Builder "Seal & mint" button is disabled | Fill in **Model name** and **Domain** — both are required.   |
| Encryption step fails in build.log       | File too large for browser memory — try a smaller test file. |
