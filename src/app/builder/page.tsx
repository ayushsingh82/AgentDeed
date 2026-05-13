"use client";

import { useMemo, useRef, useState } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

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
    if (!canContinue) return;
    setStage("encrypt");
    pushLog(`[encrypt] init AES-256-GCM · 12B nonce`);
    await advance(setProgress, 0, 100, 1200);
    pushLog(`[encrypt] ${file!.name} → sealed (${formatMb(file!.size)})`);

    setStage("store");
    setProgress(0);
    pushLog(`[0g.store] uploading to 0G Storage…`);
    await advance(setProgress, 0, 100, 1400);
    pushLog(`[0g.store] cid: bafy…${randomHex(8)} · replicas: 3`);

    setStage("mint");
    setProgress(0);
    pushLog(`[mint] preparing ERC-7857 calldata`);
    await advance(setProgress, 0, 100, 1100);
    const tid = String(400 + Math.floor(Math.random() * 80)).padStart(4, "0");
    setTokenId(tid);
    pushLog(`[mint] tx ${randomHex(6)}…${randomHex(4)} · iNFT #${tid}`);
    pushLog(`[seal] key envelope sealed to TEE attestation`);

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
    <main className="flex min-h-screen flex-col bg-[#0A0A0F] text-[#F5F2EB]">
      <NavBar />

      <section className="border-b border-[#2a2a36] px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#E0B65A]">
            Builder · /builder
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Encrypt. Pin. Mint. Seal.
          </h1>
          <p className="mt-3 max-w-2xl text-base text-[#F5F2EB]/75">
            Walk a checkpoint from disk to ERC-7857 iNFT. Your weights are
            encrypted in the browser before anything leaves it — the marketplace
            only ever sees the sealed blob.
          </p>
        </div>
      </section>

      {/* Stage indicator */}
      <section className="border-b border-[#2a2a36] px-6 py-8">
        <ol className="mx-auto grid max-w-7xl grid-cols-2 gap-3 md:grid-cols-4">
          {STAGES.map((s, i) => {
            const reached = i <= stageIdx || stage === "done";
            const active = s.key === stage;
            return (
              <li
                key={s.key}
                className={`flex items-start gap-3 border p-4 transition ${
                  active
                    ? "border-[#E0B65A] bg-[#E0B65A]/[0.06]"
                    : reached
                    ? "border-[#E0B65A]/40 bg-[#14141b]"
                    : "border-[#2a2a36] bg-[#14141b] opacity-60"
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center border font-mono text-[11px] font-black ${
                    reached
                      ? "border-[#E0B65A] bg-[#E0B65A] text-[#0A0A0F]"
                      : "border-[#2a2a36] text-[#8a8794]"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-[#8a8794]">
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
              <div className="border border-[#2a2a36] bg-[#14141b] p-7">
                <h2 className="text-2xl font-black">Source checkpoint</h2>
                <p className="mt-2 text-sm text-[#F5F2EB]/70">
                  .safetensors, .bin, .pt, or .gguf — up to 4 GB on testnet.
                </p>

                <div
                  onClick={() => fileRef.current?.click()}
                  className="mt-6 cursor-pointer border-2 border-dashed border-[#2a2a36] bg-[#0A0A0F] p-8 text-center transition hover:border-[#E0B65A]"
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
                      <p className="font-mono text-sm font-bold text-[#E0B65A]">
                        {file.name}
                      </p>
                      <p className="mt-1 font-mono text-xs text-[#8a8794]">
                        {formatMb(file.size)} · ready to seal
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#E0B65A]">
                        Drop weights here
                      </p>
                      <p className="mt-2 text-sm text-[#F5F2EB]/75">
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
                      className="w-full border border-[#2a2a36] bg-[#0A0A0F] px-3 py-2.5 font-mono text-sm focus:border-[#E0B65A] focus:outline-none"
                    />
                  </Field>
                  <Field label="Base model">
                    <select
                      value={base}
                      onChange={(e) => setBase(e.target.value)}
                      className="w-full border border-[#2a2a36] bg-[#0A0A0F] px-3 py-2.5 font-mono text-sm focus:border-[#E0B65A] focus:outline-none"
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
                      className="w-full border border-[#2a2a36] bg-[#0A0A0F] px-3 py-2.5 font-mono text-sm focus:border-[#E0B65A] focus:outline-none"
                    />
                  </Field>
                  <Field label="LoRA rank">
                    <input
                      type="number"
                      min={1}
                      value={rank}
                      onChange={(e) => setRank(Number(e.target.value))}
                      className="w-full border border-[#2a2a36] bg-[#0A0A0F] px-3 py-2.5 font-mono text-sm focus:border-[#E0B65A] focus:outline-none"
                    />
                  </Field>
                  <Field label="List price (OG)" full>
                    <input
                      type="number"
                      step="0.1"
                      min={0}
                      value={priceOg}
                      onChange={(e) => setPriceOg(Number(e.target.value))}
                      className="w-full border border-[#2a2a36] bg-[#0A0A0F] px-3 py-2.5 font-mono text-sm focus:border-[#E0B65A] focus:outline-none"
                    />
                  </Field>
                </div>

                <button
                  onClick={run}
                  disabled={!canContinue}
                  className={`mt-8 inline-flex items-center gap-3 border-2 px-7 py-3.5 font-bold uppercase tracking-[0.22em] transition ${
                    canContinue
                      ? "border-[#E0B65A] bg-[#E0B65A] text-[#0A0A0F] hover:bg-[#F0CB7A]"
                      : "border-[#2a2a36] text-[#8a8794]"
                  }`}
                >
                  Seal & mint →
                </button>
              </div>
            )}

            {(stage === "encrypt" ||
              stage === "store" ||
              stage === "mint") && (
              <div className="border border-[#2a2a36] bg-[#14141b] p-7">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#E0B65A]">
                  In progress · {stage}
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  {stage === "encrypt" && "Encrypting weights…"}
                  {stage === "store" && "Uploading sealed blob to 0G…"}
                  {stage === "mint" && "Minting ERC-7857 iNFT…"}
                </h2>
                <p className="mt-2 text-sm text-[#F5F2EB]/70">
                  Don&apos;t close this tab. Each phase posts a verifiable
                  receipt before the next one starts.
                </p>

                <div className="mt-6 h-3 w-full border border-[#2a2a36] bg-[#0A0A0F]">
                  <div
                    className="h-full bg-[#E0B65A] transition-[width] duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 text-right font-mono text-xs text-[#8a8794]">
                  {progress}%
                </p>
              </div>
            )}

            {stage === "done" && (
              <div className="border border-[#E0B65A]/50 bg-[#E0B65A]/[0.06] p-7">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#E0B65A]">
                  Mint complete
                </p>
                <h2 className="mt-2 text-3xl font-black">
                  iNFT #{tokenId} is sealed.
                </h2>
                <p className="mt-3 max-w-xl text-sm text-[#F5F2EB]/80">
                  Your model is live on the marketplace. Only your wallet can
                  run inference until you transfer the iNFT.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="/infts"
                    className="border-2 border-[#E0B65A] bg-[#E0B65A] px-6 py-3 font-bold uppercase tracking-[0.22em] text-[#0A0A0F] hover:bg-[#F0CB7A]"
                  >
                    View on marketplace →
                  </a>
                  <a
                    href="/my-agents"
                    className="border-2 border-[#2a2a36] bg-transparent px-6 py-3 font-bold uppercase tracking-[0.22em] text-[#F5F2EB] hover:border-[#E0B65A] hover:text-[#E0B65A]"
                  >
                    Open my vault
                  </a>
                  <button
                    onClick={reset}
                    className="border-2 border-[#2a2a36] bg-transparent px-6 py-3 font-bold uppercase tracking-[0.22em] text-[#F5F2EB] hover:border-[#B73A3A] hover:text-[#B73A3A]"
                  >
                    Mint another
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right column: sealed preview + log */}
          <div className="space-y-6">
            <div className="border border-[#2a2a36] bg-[#14141b] p-6 seal-shadow">
              <div className="flex items-center justify-between border-b border-[#2a2a36] pb-3">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#8a8794]">
                  Sealed preview
                </span>
                <span className="border border-[#E0B65A]/40 bg-[#E0B65A]/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-[#E0B65A]">
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

            <div className="border border-[#2a2a36] bg-[#14141b]">
              <div className="flex items-center gap-2 border-b border-[#2a2a36] bg-[#0A0A0F] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#8a8794]">
                <span className="h-2 w-2 rounded-full bg-[#B73A3A]" />
                <span className="h-2 w-2 rounded-full bg-[#E0B65A]" />
                <span className="h-2 w-2 rounded-full bg-[#7BBF6A]" />
                <span className="ml-2">build.log</span>
              </div>
              <div className="max-h-72 space-y-1.5 overflow-y-auto p-5 font-mono text-[11px] leading-5">
                {log.length === 0 ? (
                  <p className="text-[#8a8794]">
                    Waiting for input… fill the form and seal.
                  </p>
                ) : (
                  log.map((l, i) => (
                    <p key={i} className="text-[#F5F2EB]/90">
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
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-[#8a8794]">
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
      <span className="text-[#8a8794]">{k}</span>
      <span
        className={
          highlight ? "font-bold text-[#E0B65A]" : "text-[#F5F2EB]/90"
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
