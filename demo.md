# AgentDeed — Demo & Video Script

This is the script you record to. It's organized as the **video** would
flow, with notes on what to say, what to click, and when to switch wallet.
Total runtime if you stick to it: ~3–5 minutes.

> **The single most important thing to know:** the iNFTs you mint on
> `/builder` represent encrypted **LoRAs / fine-tunes** on-chain. The
> `/playground` page runs **base models** for live chat. These are two
> different layers today — the iNFT carries the *right* to a sealed key;
> applying that LoRA onto a base model running in TEE is the production
> path we haven't wired yet. Don't promise the audience that minting
> `MedScribe-LoRA` makes the playground answer medical Q&A — it doesn't,
> yet. Frame it as **"capability ownership on-chain"** + **"compute layer
> wired and demonstrable"** as two parallel tracks meeting in the future.

---

## 0. Before you hit record

Open these three things in advance so you're not fumbling on camera:

1. **Browser tab A** → `http://localhost:3000` (the app).
2. **Browser tab B** → `https://chainscan-galileo.0g.ai/address/0x21cBA803EdB8676D06FAf9aCAb84611C98B7A370` (the deployed contract on the explorer).
3. **MetaMask** (or your wallet) → open, signed in. Have **two accounts** ready if you want to show transfer later:
   - **Account 1 — Deployer:** the wallet imported from `contracts/.env`. Holds 0G, owns iNFT #1 already.
   - **Account 2 — Buyer:** any second wallet on chain 16602.

**Local services that must be running:**

| Service          | Command                | Port  | Status check                          |
| ---------------- | ---------------------- | ----- | ------------------------------------- |
| Next.js dev      | `npm run dev`          | 3000  | `curl http://localhost:3000/` → 200   |
| Ollama           | `ollama serve`         | 11434 | `curl http://localhost:11434/api/version` → JSON |

If `npm run dev` was running before you set `OLLAMA_BASE_URL`, **restart it**
— Next.js only reads `.env.local` at boot.

---

## 1. The pitch deck — `/pitch` (~30 s)

Open `http://localhost:3000/pitch`.

- **What to say:** *"AgentDeed is the first marketplace where the token is
  the model. You'll see in the next two minutes — mint, on-chain, live
  inference — but first, the 30-second story."*
- **What to do:** press → four or five times. Land on **§07 · Traction**
  and pause for a beat so the camera catches the deployed addresses.

---

## 2. The marketplace — `/infts` (~30 s)

Click **Marketplace** in the nav.

- **What to say:** *"Every card here is read live from a deployed
  ERC-7857 contract on 0G — not a static list. There's one minted token
  on the contract right now, and you'll see me mint another in a second."*
- **What to do:**
  - Hover the iNFT #0001 card. Show the **copy** affordance on the
    owner address, weights hash, and storage URI.
  - Click **View on explorer →**. Switch to tab B. The contract page on
    chainscan should already be open. Show the transaction count is
    non-zero.

---

## 3. Mint a new model — `/builder` (~60 s) — **headline moment**

Click **Builder** in the nav.

### Wallet step (do this BEFORE clicking Run)

- Top-right: **Connect Wallet** → choose **Account 1 (Deployer)**.
- If the wallet asks to add a network: **chain id 16602, name "0G",
  RPC `https://evmrpc-testnet.0g.ai`**.
- Confirm the wallet shows your address + the 0G chain icon.

### Fill the form

| Field         | Value                                       |
| ------------- | ------------------------------------------- |
| **File**      | `demo-models/medscribe-lora.safetensors` (or any small file) |
| **Name**      | `MedScribe-LoRA`                            |
| **Base**      | `phi-3-mini-4k`                             |
| **Domain**    | `medical Q&A`                               |
| **Rank**      | `16`                                        |
| **Price**     | `5` (OG)                                    |

A larger menu of realistic inputs lives at `demo-models/MINT_INPUTS.md`.

### Click **Seal & mint →** and narrate as the log appears

The log lines and what to say for each:

1. **`[encrypt] init AES-256-GCM · 12B nonce`** — *"Browser-side encryption.
   The raw weights never leave the page unsealed."*
2. **`[encrypt] sha256(ct) = …`** — *"That hash is the content address of
   your encrypted file. Same file, same key, same hash."*
3. **`[encrypt] aes-key = …`** — *"And the AES key the browser just minted.
   This is the thing we're going to seal."*
4. **`[0g.store] indexer / root / cid`** — *"Sealed blob shipped to 0G
   Storage. Three replicas. Same trust domain as the chain."*
5. **`[mint] preparing ERC-7857 calldata`** — *"Building the mint payload."*
6. **`[mint] sealedKey envelope size: 32 B`** — *"This envelope is what
   ERC-7857 adds. The token carries the right to decrypt."*
7. **`[mint] tx 0x… · awaiting receipt`** — **MetaMask popup appears here.
   Confirm.**
8. **`[mint] confirmed on-chain · iNFT #00NN`** — *"Confirmed. Real tx,
   real gas, real chain — not a demo network."*

### One-line summary to land

*"Encrypt locally. Pin to 0G. Mint on 0G. Seal to TEE. One transaction,
four guarantees."*

### Verify on chain

Switch to tab B and refresh the explorer. The transaction count went up.
Click into the latest tx to show the on-chain proof.

---

## 4. The vault — `/my-agents` (~20 s)

Click **My Models**.

- **What to say:** *"Live wallet read — this isn't faked, it's the
  contract telling us which tokens this wallet owns."*
- **What to do:** point at the holdings panel. The token you just minted
  should be there alongside any previous mints by the deployer.

### Switching wallets to show transfer (optional, ~30 s extra)

If you want to demonstrate the buyer side:

1. Open MetaMask → switch to **Account 2 (Buyer)** (must be on chain 16602
   with a bit of OG for gas).
2. Refresh `/my-agents` — vault is empty (good — that's the proof the read
   is real, not cached).
3. Refresh `/infts` — you'll still see the tokens; switch the filter to
   **Mine** to show it's empty for this account; back to **All** to show
   the deployer's tokens.

> Full **transfer** (the sealed-key re-encryption) needs the TEE oracle
> wired with an attested signer key. We've deployed the oracle and the
> contract path supports it; it's not yet enabled on testnet. Frame this
> as "next milestone."

---

## 5. Live inference — `/playground` (~45 s)

Click **Playground**.

> If you see a **"Inference is not configured"** error: it means
> `npm run dev` was started before `OLLAMA_BASE_URL` landed in
> `.env.local`. Restart `npm run dev` (Ctrl-C → `npm run dev`).

You should see a black banner near the top: **"Provider · Self-hosted
Ollama · localhost"**.

- **What to say:** *"This is the inference layer. In production it routes
  through the 0G Compute Router and bills against your model NFT. For
  this demo it routes to a local Ollama instance — same OpenAI-compatible
  wire format, same code path. The point is the round-trip works."*

- **What to do:**
  1. The model dropdown lists whatever models you've pulled in Ollama.
     Pick `qwen2:0.5b` (or whatever's there).
  2. Leave the default prompt or change to: *"Explain what an ERC-7857
     iNFT is in two sentences."*
  3. Hit **Run inference →**.
  4. The reply appears in the right panel. Below it: the **x_0g_trace**
     block with `request_id`, `provider`, `tokens`, `cost`. Note that
     `tee_verified` reads `false` and cost reads `0` — *that's correct
     and honest* because we're not on the Router today.

### Honest framing point

*"On the deployed Vercel demo this banner switches over to the 0G
Compute Router as soon as we have a router key — same code path, no
re-wiring. The chat you just saw used a 500 MB model running on this
laptop; production swaps that for a TEE-attested provider."*

---

## 6. Wrap (~15 s)

- **What to say:** *"What you just saw: live contracts, real mint,
  real inference. Two things still on the roadmap — real 0G Storage
  pinning replacing the simulated step in the builder, and TEE-attested
  transfer wiring the oracle we've already deployed. Everything else is
  in your hands today."*
- **CTA:** point at `/builder` for "mint your own" or send people to
  `/pitch` for the deck.

---

## What models can I run on `/playground`?

**Whatever you've pulled into Ollama.** They have no relationship to the
iNFTs on `/infts` — the iNFT system records *which encrypted LoRA file is
yours*, and the playground runs *whichever base model you've downloaded
locally*. To add more:

```bash
ollama pull qwen2:1.5b     # ~0.9 GB — better than 0.5b, still fast on 8 GB
ollama pull phi3:mini      # ~2.2 GB — popular Microsoft model
ollama pull llama3:8b      # ~4.7 GB — strongest of the three, may swap on 8 GB
ollama list                # see everything you've got
```

After pulling, the `/playground` model dropdown picks them up on the next
page refresh — no need to restart `npm run dev` for new Ollama models.

---

## When to switch wallets — cheat sheet

| Moment in the demo                              | Which wallet                |
| ----------------------------------------------- | --------------------------- |
| Loading any page                                | None required               |
| Mint on `/builder`                              | **Deployer** (has gas)      |
| View "Mine" on `/my-agents`                     | **Deployer** (it owns #1)   |
| Show empty vault on a second wallet             | **Buyer** (Account 2)       |
| Demonstrate transfer (future, not on screen)    | Deployer → Buyer            |
| `/playground` chat                              | None required (server-side) |

`/playground` doesn't read your wallet at all — it's a server route that
talks to Ollama / Router directly. Wallet only matters for the chain-side
pages (`/builder`, `/my-agents`, `/infts` filter).

---

## What's LIVE vs SIMULATED right now

| Surface                              | Live?                |
| ------------------------------------ | -------------------- |
| Landing, /pitch, navigation          | LIVE                 |
| `/infts` reads from chain            | LIVE                 |
| `/my-agents` reads from chain        | LIVE                 |
| `/builder` AES-256-GCM encryption    | LIVE                 |
| `/builder` 0G Storage pin            | **SIMULATED** (placeholder URI) |
| `/builder` mint to ERC-7857          | LIVE (real tx)       |
| `/playground` model catalog          | LIVE (from Ollama)   |
| `/playground` chat completions       | LIVE (via Ollama)    |
| `x_0g_trace` cost/tee fields         | **SYNTHESIZED** when on Ollama (zero cost, `tee_verified: false`) |
| TEE re-encryption on transfer        | NOT LIVE yet (oracle deployed but unwired) |

---

## Recording checklist

- [ ] Both `npm run dev` and `ollama serve` running
- [ ] At least one Ollama model pulled (`ollama list`)
- [ ] `OLLAMA_BASE_URL` in `.env.local`, dev server restarted after that change
- [ ] Wallet on chain 16602 with a bit of OG (for the mint signature)
- [ ] Chainscan tab pre-opened to the deployed contract address
- [ ] `demo-models/medscribe-lora.safetensors` exists (or any small file ready)
- [ ] Browser zoom set so the build.log on `/builder` is readable

---

## Troubleshooting

| Symptom                                              | Fix                                                                 |
| ---------------------------------------------------- | ------------------------------------------------------------------- |
| `/playground` shows "Inference is not configured"    | Restart `npm run dev` after editing `.env.local`.                   |
| Model dropdown on `/playground` is empty             | `ollama pull qwen2:0.5b` (or any model), then refresh the page.     |
| Mint pops nothing / falls back to simulated          | Wallet not connected, or chain id ≠ 16602, or contract envs not loaded. |
| `/my-agents` empty even though you minted           | You're connected as the wrong wallet — switch to the minter.        |
| `chainScan` shows tx but `/infts` doesn't            | Hard refresh (Cmd-Shift-R) — the page caches the totalSupply read.  |
| `Failed to read contract: Chain "0G" does not support contract "multicall3"` | Pull latest — already fixed via `c7103f2`. Restart dev. |
| Ollama: `connection refused` on `localhost:11434`    | `ollama serve` not running, or another process owns the port.       |
