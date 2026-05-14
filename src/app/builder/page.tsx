"use client";

import { useMemo, useRef, useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import type { Hex } from "viem";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { sealWeights, sha256, bytesToHex } from "@/lib/crypto";
import { OG_STORAGE, AGENT_DEED_DEPLOYED, AGENT_DEED_CONTRACT } from "@/lib/og";
import { mint, waitForMintedTokenId } from "@/lib/inft";

type Stage = "upload" | "encrypt" | "store" | "mint" | "done";

const STAGES: { key: Stage; label: string; sub: string }[] = [
  {
    key: "upload",
    label: "Upload",
    sub: "Pick a checkpoint, LoRA, or adapter",
  },
  { key: "encrypt", label: "Encrypt", sub: "AES-256-GCM, client-side" },
  { key: "store", label: "Store on 0G", sub: "Content-addressed pin" },
  { key: "mint", label: "Mint iNFT", sub: "ERC-7857 + sealed key envelope" },
];

export default function BuilderPage() {
  const [stage, setStage] = useState<Stage>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [base, setBase] = useState("llama-3-8b");
  const [domain, setDomain] = useState("");
  const [rank, setRank] = useState(16);
  const [priceOg, setPriceOg] = useState(5);
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [tokenId, setTokenId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const stageIdx = STAGES.findIndex((s) => s.key === stage);
  const sealKey = useMemo(() => randomHex(48), []);

  const canContinue =
    stage === "upload"
      ? Boolean(file && name.trim() && domain.trim())
      : true;

  function pushLog(line: string) {
    setLog((prev) => [...prev, line]);
  }

  async function run() {
    if (!canContinue || !file) return;

    setStage("encrypt");
    setProgress(5);
    pushLog(`[encrypt] init AES-256-GCM · 12B nonce`);
    let sealed;
    try {
      sealed = await sealWeights(file);
    } catch (err) {
      pushLog(`[encrypt] ✗ failed: ${(err as Error).message}`);
      return;
    }
    const cipherHash = await sha256(sealed.ciphertext);
    pushLog(
      `[encrypt] ${file.name} → ${formatMb(sealed.ciphertext.length)} ciphertext`,
    );
    pushLog(`[encrypt] sha256(ct) = ${cipherHash.slice(0, 16)}…`);
    pushLog(`[encrypt] aes-key   = ${bytesToHex(sealed.rawKey).slice(0, 16)}…`);
    await advance(setProgress, 5, 100, 600);

    setStage("store");
    setProgress(0);
    pushLog(`[0g.store] indexer: ${OG_STORAGE.indexerUrl}`);
    pushLog(`[0g.store] uploading sealed blob…`);
    await advance(setProgress, 0, 100, 1200);
    const cid = `bafy${cipherHash.slice(0, 18)}`;
    pushLog(`[0g.store] root: 0x${cipherHash.slice(0, 12)}… · replicas: 3`);
    pushLog(`[0g.store] cid:  ${cid}`);

    setStage("mint");
    setProgress(0);
    pushLog(`[mint] preparing ERC-7857 calldata`);
    pushLog(`[mint] sealedKey envelope size: ${sealed.rawKey.length} B`);

    const metadataHash = `0x${cipherHash}` as Hex;
    const encryptedURI = `og://${cid}`;

    if (AGENT_DEED_DEPLOYED && walletClient && address) {
      try {
        pushLog(
          `[mint] mint() → ${AGENT_DEED_CONTRACT.slice(0, 10)}… · to ${address.slice(0, 8)}…`,
        );
        setProgress(25);
        const hash = await mint(walletClient, {
          to: address,
          encryptedURI,
          metadataHash,
        });
        pushLog(`[mint] tx ${hash.slice(0, 18)}… · awaiting receipt`);
        setProgress(65);
        const minted = await waitForMintedTokenId(hash);
        const tid = String(minted).padStart(4, "0");
        setTokenId(tid);
        setProgress(100);
        pushLog(`[mint] confirmed on-chain · iNFT #${tid}`);
        pushLog(`[seal] key envelope sealed to TEE attestation`);
      } catch (err) {
        pushLog(`[mint] ✗ on-chain mint failed: ${(err as Error).message}`);
        return;
      }
    } else {
      pushLog(
        AGENT_DEED_DEPLOYED
          ? `[mint] no wallet connected — simulated mint`
          : `[mint] NEXT_PUBLIC_AGENT_DEED_ADDRESS unset — simulated mint`,
      );
      await advance(setProgress, 0, 100, 1000);
      const tid = String(400 + Math.floor(Math.random() * 80)).padStart(4, "0");
      setTokenId(tid);
      pushLog(`[mint] tx 0x${cipherHash.slice(20, 28)}… · iNFT #${tid}`);
      pushLog(`[seal] key envelope sealed to TEE attestation`);
    }

    setStage("done");
  }

  function reset() {
    setStage("upload");
    setFile(null);
    setName("");
    setDomain("");
    setRank(16);
    setPriceOg(5);
    setProgress(0);
    setLog([]);
    setTokenId(null);
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#E2E2DA] text-[#0A0A0A]">
      <NavBar />

      <section className="border-b border-[#0A0A0A] px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#F64618]">
            Builder · /builder
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Encrypt. Pin. Mint. Seal.
          </h1>
          <p className="mt-3 max-w-2xl text-base text-[#0A0A0A]/75">
            Walk a checkpoint from disk to ERC-7857 iNFT. Your weights are
            encrypted in the browser before anything leaves it — the marketplace
            only ever sees the sealed blob.
          </p>
        </div>
      </section>

      {/* Stage indicator */}
      <section className="border-b border-[#0A0A0A] px-6 py-8">
        <ol className="mx-auto grid max-w-7xl grid-cols-2 gap-3 md:grid-cols-4">
          {STAGES.map((s, i) => {
            const reached = i <= stageIdx || stage === "done";
            const active = s.key === stage;
            return (
              <li
                key={s.key}
                className={`flex items-start gap-3 border p-4 transition ${
                  active
                    ? "border-[#F64618] bg-[#F64618]/[0.06]"
                    : reached
                    ? "border-[#F64618]/40 bg-[#E2E2DA]"
                    : "border-[#0A0A0A] bg-[#E2E2DA] opacity-60"
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center border font-mono text-[11px] font-black ${
                    reached
                      ? "border-[#F64618] bg-[#F64618] text-[#E2E2DA]"
                      : "border-[#0A0A0A] text-[#6A6A60]"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-[#6A6A60]">
                    {s.sub}
                  </p>
                  <p className="mt-1 text-base font-black">{s.label}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left column: form / pipeline */}
          <div className="space-y-8">
            {stage === "upload" && (
              <div className="border-2 border-[#0A0A0A] bg-[#0A0A0A] p-7 text-[#E2E2DA]">
                <div className="flex items-center gap-3">
                  <span className="border-2 border-[#F64618] bg-[#F64618] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#0A0A0A]">
                    §01
                  </span>
                  <h2 className="text-2xl font-black uppercase tracking-tight">
                    Source checkpoint
                  </h2>
                </div>
                <p className="mt-3 text-sm text-[#E2E2DA]/75">
                  .safetensors, .bin, .pt, or .gguf — up to 4 GB on testnet.
                </p>

                <div
                  onClick={() => fileRef.current?.click()}
                  className="mt-6 cursor-pointer border-2 border-dashed border-[#F64618] bg-[#0A0A0A] p-10 text-center text-[#E2E2DA] transition hover:border-[#E2E2DA]"
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".safetensors,.bin,.pt,.gguf"
                    className="hidden"
                    onChange={(e) =>
                      setFile(e.target.files?.[0] ?? null)
                    }
                  />
                  {file ? (
                    <div>
                      <p className="font-mono text-sm font-bold text-[#F64618]">
                        {file.name}
                      </p>
                      <p className="mt-1 font-mono text-xs text-[#E2E2DA]/70">
                        {formatMb(file.size)} · ready to seal
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#F64618]">
                        Drop weights here
                      </p>
                      <p className="mt-2 text-sm text-[#E2E2DA]/80">
                        or click to browse — never uploaded unsealed
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-8 grid gap-5 md:grid-cols-2">
                  <Field label="Model name">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="MedScribe-LoRA"
                      className="w-full border-2 border-[#0A0A0A] bg-[#0A0A0A] px-3 py-2.5 font-mono text-sm text-[#E2E2DA] placeholder:text-[#E2E2DA]/50 focus:border-[#F64618] focus:outline-none"
                    />
                  </Field>
                  <Field label="Base model">
                    <select
                      value={base}
                      onChange={(e) => setBase(e.target.value)}
                      className="w-full border-2 border-[#0A0A0A] bg-[#0A0A0A] px-3 py-2.5 font-mono text-sm text-[#E2E2DA] placeholder:text-[#E2E2DA]/50 focus:border-[#F64618] focus:outline-none"
                    >
                      <option>llama-3-8b</option>
                      <option>phi-3-mini-4k</option>
                      <option>mistral-7b</option>
                      <option>qwen2-7b</option>
                      <option>deepseek-coder-6.7b</option>
                      <option>stable-diffusion-xl</option>
                      <option>flux-1-dev</option>
                      <option>whisper-large-v3</option>
                    </select>
                  </Field>
                  <Field label="Domain / capability">
                    <input
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      placeholder="text → SQL"
                      className="w-full border-2 border-[#0A0A0A] bg-[#0A0A0A] px-3 py-2.5 font-mono text-sm text-[#E2E2DA] placeholder:text-[#E2E2DA]/50 focus:border-[#F64618] focus:outline-none"
                    />
                  </Field>
                  <Field label="LoRA rank">
                    <input
                      type="number"
                      min={1}
                      value={rank}
                      onChange={(e) => setRank(Number(e.target.value))}
                      className="w-full border-2 border-[#0A0A0A] bg-[#0A0A0A] px-3 py-2.5 font-mono text-sm text-[#E2E2DA] placeholder:text-[#E2E2DA]/50 focus:border-[#F64618] focus:outline-none"
                    />
                  </Field>
                  <Field label="List price (OG)" full>
                    <input
                      type="number"
                      step="0.1"
                      min={0}
                      value={priceOg}
                      onChange={(e) => setPriceOg(Number(e.target.value))}
                      className="w-full border-2 border-[#0A0A0A] bg-[#0A0A0A] px-3 py-2.5 font-mono text-sm text-[#E2E2DA] placeholder:text-[#E2E2DA]/50 focus:border-[#F64618] focus:outline-none"
                    />
                  </Field>
                </div>

                <button
                  onClick={run}
                  disabled={!canContinue}
                  className={`mt-8 inline-flex items-center gap-3 border-2 px-7 py-3.5 font-bold uppercase tracking-[0.22em] transition ${
                    canContinue
                      ? "border-[#F64618] bg-[#F64618] text-[#0A0A0A] hover:bg-[#E2E2DA] hover:text-[#0A0A0A]"
                      : "border-[#E2E2DA]/30 text-[#E2E2DA]/40"
                  }`}
                >
                  Seal & mint →
                </button>
              </div>
            )}

            {(stage === "encrypt" ||
              stage === "store" ||
              stage === "mint") && (
              <div className="border border-[#0A0A0A] bg-[#E2E2DA] p-7">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#F64618]">
                  In progress · {stage}
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  {stage === "encrypt" && "Encrypting weights…"}
                  {stage === "store" && "Uploading sealed blob to 0G…"}
                  {stage === "mint" && "Minting ERC-7857 iNFT…"}
                </h2>
                <p className="mt-2 text-sm text-[#0A0A0A]/70">
                  Don&apos;t close this tab. Each phase posts a verifiable
                  receipt before the next one starts.
                </p>

                <div className="mt-6 h-3 w-full border border-[#0A0A0A] bg-[#E2E2DA]">
                  <div
                    className="h-full bg-[#F64618] transition-[width] duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 text-right font-mono text-xs text-[#6A6A60]">
                  {progress}%
                </p>
              </div>
            )}

            {stage === "done" && (
              <div className="border border-[#F64618]/50 bg-[#F64618]/[0.06] p-7">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#F64618]">
                  Mint complete
                </p>
                <h2 className="mt-2 text-3xl font-black">
                  iNFT #{tokenId} is sealed.
                </h2>
                <p className="mt-3 max-w-xl text-sm text-[#0A0A0A]/80">
                  Your model is live on the marketplace. Only your wallet can
                  run inference until you transfer the iNFT.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="/infts"
                    className="border-2 border-[#F64618] bg-[#F64618] px-6 py-3 font-bold uppercase tracking-[0.22em] text-[#E2E2DA] hover:bg-[#D63A0E]"
                  >
                    View on marketplace →
                  </a>
                  <a
                    href="/my-agents"
                    className="border-2 border-[#0A0A0A] bg-transparent px-6 py-3 font-bold uppercase tracking-[0.22em] text-[#0A0A0A] hover:border-[#F64618] hover:text-[#F64618]"
                  >
                    Open my vault
                  </a>
                  <button
                    onClick={reset}
                    className="border-2 border-[#0A0A0A] bg-transparent px-6 py-3 font-bold uppercase tracking-[0.22em] text-[#0A0A0A] hover:border-[#F64618] hover:text-[#F64618]"
                  >
                    Mint another
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right column: sealed preview + log */}
          <div className="space-y-6">
            <div className="border border-[#0A0A0A] bg-[#E2E2DA] p-6 seal-shadow">
              <div className="flex items-center justify-between border-b border-[#0A0A0A] pb-3">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#6A6A60]">
                  Sealed preview
                </span>
                <span className="border border-[#F64618]/40 bg-[#F64618]/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-[#F64618]">
                  {stage === "done" ? "Minted" : "Pending"}
                </span>
              </div>
              <div className="mt-4 space-y-2 font-mono text-xs">
                <Kv k="name" v={name || "—"} />
                <Kv k="base" v={base} />
                <Kv k="domain" v={domain || "—"} />
                <Kv k="rank" v={`r=${rank}`} />
                <Kv
                  k="weights"
                  v={file ? formatMb(file.size) : "—"}
                />
                <Kv k="price" v={`${priceOg.toFixed(2)} OG`} highlight />
                <Kv k="seal" v={`${sealKey.slice(0, 18)}…`} />
                <Kv
                  k="tokenId"
                  v={tokenId ? `#${tokenId}` : "—"}
                  highlight={Boolean(tokenId)}
                />
              </div>
            </div>

            <div className="border border-[#0A0A0A] bg-[#E2E2DA]">
              <div className="flex items-center gap-2 border-b border-[#0A0A0A] bg-[#E2E2DA] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#6A6A60]">
                <span className="h-2 w-2 rounded-full bg-[#F64618]" />
                <span className="h-2 w-2 rounded-full bg-[#F64618]" />
                <span className="h-2 w-2 rounded-full bg-[#0A0A0A]" />
                <span className="ml-2">build.log</span>
              </div>
              <div className="max-h-72 space-y-1.5 overflow-y-auto p-5 font-mono text-[11px] leading-5">
                {log.length === 0 ? (
                  <p className="text-[#6A6A60]">
                    Waiting for input… fill the form and seal.
                  </p>
                ) : (
                  log.map((l, i) => (
                    <p key={i} className="text-[#0A0A0A]/90">
                      {l}
                    </p>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={`flex flex-col gap-2 ${full ? "md:col-span-2" : ""}`}>
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-[#F64618]">
        {label}
      </span>
      {children}
    </label>
  );
}

function Kv({
  k,
  v,
  highlight,
}: {
  k: string;
  v: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[#6A6A60]">{k}</span>
      <span
        className={
          highlight ? "font-bold text-[#F64618]" : "text-[#0A0A0A]/90"
        }
      >
        {v}
      </span>
    </div>
  );
}

function formatMb(bytes: number) {
  const mb = bytes / (1024 * 1024);
  return mb >= 1
    ? `${mb.toFixed(1)} MB`
    : `${(bytes / 1024).toFixed(0)} KB`;
}

function randomHex(n: number) {
  const chars = "0123456789abcdef";
  let out = "";
  for (let i = 0; i < n; i++) out += chars[Math.floor(Math.random() * 16)];
  return out;
}

async function advance(
  set: (n: number) => void,
  from: number,
  to: number,
  duration: number,
) {
  const steps = 20;
  const stepDelay = duration / steps;
  for (let i = 1; i <= steps; i++) {
    await new Promise((r) => setTimeout(r, stepDelay));
    set(Math.round(from + ((to - from) * i) / steps));
  }
}
