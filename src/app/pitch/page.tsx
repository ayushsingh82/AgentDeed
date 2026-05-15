"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import AgentDeedLogo from "@/components/AgentDeedLogo";

// One snap-scrolling page = the pitch deck. Each slide is full-viewport
// and registered with the IntersectionObserver below so the pager + arrow
// keys stay in sync no matter how the user navigates (scroll / wheel /
// arrow keys / clicking the pager dots).

const SLIDES = [
  { id: "01", title: "Cover" },
  { id: "02", title: "Problem" },
  { id: "03", title: "Solution" },
  { id: "04", title: "How it works" },
  { id: "05", title: "Sealed-key transfer" },
  { id: "06", title: "Architecture" },
  { id: "07", title: "Why now" },
  { id: "08", title: "Business model" },
  { id: "09", title: "Traction" },
  { id: "10", title: "Closing" },
] as const;

export default function PitchPage() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);

  const goTo = useCallback((idx: number) => {
    const clamped = Math.max(0, Math.min(SLIDES.length - 1, idx));
    slideRefs.current[clamped]?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Keyboard nav — arrows + space + home/end.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName ?? "";
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goTo(active + 1);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(active - 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        goTo(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goTo(SLIDES.length - 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, goTo]);

  // Track which slide is in view via IntersectionObserver.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const idx = Number((visible.target as HTMLElement).dataset.idx);
          if (!Number.isNaN(idx)) setActive(idx);
        }
      },
      { threshold: [0.5, 0.75] },
    );
    slideRefs.current.forEach((s) => s && observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="bg-[#E2E2DA] text-[#0A0A0A]">
      <div
        ref={trackRef}
        className="h-screen snap-y snap-mandatory overflow-y-scroll scroll-smooth"
      >
        <Slide
          idx={0}
          register={(el) => (slideRefs.current[0] = el)}
          bg="bone"
        >
          <Cover />
        </Slide>
        <Slide
          idx={1}
          register={(el) => (slideRefs.current[1] = el)}
          bg="ink"
        >
          <Problem />
        </Slide>
        <Slide
          idx={2}
          register={(el) => (slideRefs.current[2] = el)}
          bg="orange"
        >
          <Solution />
        </Slide>
        <Slide
          idx={3}
          register={(el) => (slideRefs.current[3] = el)}
          bg="bone"
        >
          <HowItWorks />
        </Slide>
        <Slide
          idx={4}
          register={(el) => (slideRefs.current[4] = el)}
          bg="ink"
        >
          <SealedTransfer />
        </Slide>
        <Slide
          idx={5}
          register={(el) => (slideRefs.current[5] = el)}
          bg="bone"
        >
          <Architecture />
        </Slide>
        <Slide
          idx={6}
          register={(el) => (slideRefs.current[6] = el)}
          bg="orange"
        >
          <WhyNow />
        </Slide>
        <Slide
          idx={7}
          register={(el) => (slideRefs.current[7] = el)}
          bg="bone"
        >
          <BusinessModel />
        </Slide>
        <Slide
          idx={8}
          register={(el) => (slideRefs.current[8] = el)}
          bg="orange"
        >
          <Traction />
        </Slide>
        <Slide
          idx={9}
          register={(el) => (slideRefs.current[9] = el)}
          bg="ink"
        >
          <Closing />
        </Slide>
      </div>

      <TopBar />
      <Pager active={active} goTo={goTo} />
    </main>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Shell
// ────────────────────────────────────────────────────────────────────────

function TopBar() {
  return (
    <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-4 mix-blend-difference">
      <Link
        href="/"
        className="flex items-center gap-3 text-[#E2E2DA]"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[#E2E2DA]">
          <AgentDeedLogo size={22} />
        </span>
        <span className="text-base font-black tracking-tight">
          Agent<span className="text-[#F64618]">Deed</span>
          <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#E2E2DA]/70">
            / pitch
          </span>
        </span>
      </Link>
      <Link
        href="/builder"
        className="hidden border border-[#E2E2DA] px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-[#E2E2DA] transition hover:bg-[#E2E2DA] hover:text-[#0A0A0A] sm:inline-block"
      >
        Try the builder →
      </Link>
    </header>
  );
}

function Pager({
  active,
  goTo,
}: {
  active: number;
  goTo: (idx: number) => void;
}) {
  return (
    <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-3 mix-blend-difference">
      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#E2E2DA]">
        {String(active + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")} ·{" "}
        <span className="text-[#F64618]">{SLIDES[active].title}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          aria-label="Previous slide"
          onClick={() => goTo(active - 1)}
          disabled={active === 0}
          className="border border-[#E2E2DA] px-3 py-1 font-mono text-xs font-bold text-[#E2E2DA] transition hover:bg-[#E2E2DA] hover:text-[#0A0A0A] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ←
        </button>
        <button
          aria-label="Next slide"
          onClick={() => goTo(active + 1)}
          disabled={active === SLIDES.length - 1}
          className="border border-[#E2E2DA] bg-[#F64618] px-3 py-1 font-mono text-xs font-bold text-[#E2E2DA] transition hover:bg-[#E2E2DA] hover:text-[#0A0A0A] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          →
        </button>
      </div>
    </div>
  );
}

type Bg = "bone" | "ink" | "orange";
function Slide({
  idx,
  register,
  bg,
  children,
}: {
  idx: number;
  register: (el: HTMLElement | null) => void;
  bg: Bg;
  children: React.ReactNode;
}) {
  const palette =
    bg === "ink"
      ? "bg-[#0A0A0A] text-[#E2E2DA]"
      : bg === "orange"
        ? "bg-[#F64618] text-[#E2E2DA]"
        : "bg-[#E2E2DA] text-[#0A0A0A]";
  return (
    <section
      ref={register}
      data-idx={idx}
      className={`relative flex h-screen snap-start snap-always items-center overflow-hidden ${palette}`}
    >
      <div className="mx-auto w-full max-w-7xl px-6 py-24">{children}</div>
    </section>
  );
}

function Kicker({
  num,
  title,
  tone = "ink",
}: {
  num: string;
  title: string;
  tone?: "ink" | "bone";
}) {
  const color =
    tone === "bone" ? "text-[#E2E2DA]/70" : "text-[#0A0A0A]/70";
  return (
    <p
      className={`font-mono text-[10px] font-bold uppercase tracking-[0.32em] ${color}`}
    >
      §{num} · <span className="text-[#F64618]">{title}</span>
    </p>
  );
}

// ────────────────────────────────────────────────────────────────────────
// 01 · Cover
// ────────────────────────────────────────────────────────────────────────
function Cover() {
  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
      <div className="lg:col-span-8">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-[#F64618]">
          AgentDeed · investor preview · v1
        </p>
        <h1 className="mt-8 text-[14vw] font-black uppercase leading-[0.86] tracking-tight sm:text-[12vw] lg:text-[8.5vw]">
          Sell the <span className="text-[#F64618]">model.</span>
          <br />
          Lose the access.
        </h1>
        <p className="mt-10 max-w-2xl text-lg leading-8 text-[#0A0A0A]/80">
          A sealed-key marketplace for fine-tuned AI. Encrypted weights on
          0G Storage, ERC-7857 ownership on-chain, TEE inference for the
          current key holder. <span className="font-bold">The token is the model.</span>
        </p>
      </div>
      <div className="lg:col-span-4">
        <div className="relative ml-auto max-w-sm border-2 border-[#0A0A0A] bg-[#0A0A0A] p-5 text-[#E2E2DA] ink-shadow">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#F64618]">
            iNFT #00001 · live
          </p>
          <p className="mt-2 font-mono text-xs leading-6 text-[#E2E2DA]/85">
            owner       0x15E7…98ef
            <br />
            sealed      AES-256-GCM
            <br />
            URI         0g://stub/1fad…
            <br />
            hash        0x1fad…aeb6
          </p>
          <p className="mt-4 border-t border-[#E2E2DA]/30 pt-3 font-mono text-[10px] uppercase tracking-[0.24em] text-[#E2E2DA]/60">
            AgentDeed @ 0x21cB…A370
          </p>
        </div>
        <p className="mt-4 text-right font-mono text-[10px] uppercase tracking-[0.28em] text-[#0A0A0A]/60">
          press → to advance
        </p>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// 02 · Problem
// ────────────────────────────────────────────────────────────────────────
function Problem() {
  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <Kicker num="02" title="Problem" tone="bone" />
        <h2 className="mt-6 text-5xl font-black uppercase leading-[0.94] tracking-tight sm:text-7xl">
          Fine-tuners can&apos;t
          <br />
          <span className="text-[#F64618]">capture</span> the value
          <br />
          they create.
        </h2>
        <p className="mt-8 max-w-2xl text-lg leading-8 text-[#E2E2DA]/80">
          A 12-hour LoRA can outperform a frontier model in its niche. Twelve
          hours after release, anyone with bandwidth has cloned it. Today&apos;s
          marketplaces sell <em>pointers</em>. They never sold the capability.
        </p>
      </div>
      <ul className="space-y-4 lg:col-span-5">
        <PainPoint
          label="HuggingFace / Civitai"
          body="Public weights, distribution leaks, zero exclusivity."
        />
        <PainPoint
          label="License PDFs"
          body="Honor-system. Unenforceable. A signed contract is not a key."
        />
        <PainPoint
          label="Model NFTs (2021)"
          body="Vibes-ownership. The token never had the model. Decorative."
        />
        <PainPoint
          label="TEE inference alone"
          body="Solves privacy. Doesn't solve who's paid, who owns it, or who can revoke."
        />
      </ul>
    </div>
  );
}

function PainPoint({ label, body }: { label: string; body: string }) {
  return (
    <li className="border-2 border-[#E2E2DA]/30 bg-[#E2E2DA]/[0.04] p-5">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#F64618]">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-[#E2E2DA]/85">{body}</p>
    </li>
  );
}

// ────────────────────────────────────────────────────────────────────────
// 03 · Solution
// ────────────────────────────────────────────────────────────────────────
function Solution() {
  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
      <div className="lg:col-span-7">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-[#0A0A0A]/80">
          §03 · <span className="text-[#0A0A0A]">Solution</span>
        </p>
        <h2 className="mt-6 text-5xl font-black uppercase leading-[0.94] tracking-tight sm:text-7xl">
          The iNFT
          <br />
          <span className="text-[#0A0A0A]">is</span> the model.
        </h2>
        <p className="mt-8 max-w-2xl text-lg leading-8 text-[#E2E2DA]">
          ERC-7857 binds an encrypted-key envelope to a transferable token.
          A TEE re-encrypts that key to the new owner on every transfer.
          The previous holder&apos;s key never decrypts the blob again — the
          chain is the authoritative holder of capability.
        </p>
        <p className="mt-6 max-w-2xl text-base leading-7 text-[#E2E2DA]/90">
          Cryptographic exclusivity replaces honor-system licensing.
        </p>
      </div>
      <div className="lg:col-span-5">
        <div className="grid gap-4">
          <Pill heading="Encrypt" sub="AES-256-GCM, in browser, before upload" />
          <Pill heading="Pin" sub="0G Storage · content-addressed · 3× replicas" />
          <Pill heading="Mint" sub="ERC-7857 · sealed-key envelope on token" />
          <Pill heading="Transfer" sub="TEE re-encrypts key to buyer · atomic" />
        </div>
      </div>
    </div>
  );
}

function Pill({ heading, sub }: { heading: string; sub: string }) {
  return (
    <div className="border-2 border-[#0A0A0A] bg-[#0A0A0A] px-5 py-4 text-[#E2E2DA]">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#F64618]">
        {heading}
      </p>
      <p className="mt-1 font-mono text-xs text-[#E2E2DA]/85">{sub}</p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// 04 · How it works
// ────────────────────────────────────────────────────────────────────────
function HowItWorks() {
  return (
    <div>
      <Kicker num="04" title="How it works" />
      <h2 className="mt-6 text-5xl font-black uppercase leading-[0.94] tracking-tight sm:text-6xl">
        Checkpoint → <span className="text-[#F64618]">transferable</span> capability.
      </h2>

      <ol className="mt-12 grid grid-cols-1 gap-0 border-2 border-[#0A0A0A] md:grid-cols-4">
        <StepCell
          tag="01"
          where="browser"
          title="Encrypt"
          body="WebCrypto AES-256-GCM. Raw weights never leave unsealed."
        />
        <StepCell
          tag="02"
          where="0G Storage"
          title="Pin"
          body="Ciphertext content-addressed. Cheap, durable, indexed."
          accent
        />
        <StepCell
          tag="03"
          where="0G chain"
          title="Mint"
          body="ERC-7857 token + sealed-key envelope. Single tx."
        />
        <StepCell
          tag="04"
          where="TEE"
          title="Transfer"
          body="Key re-encrypted to buyer. Seller's access ends."
          accent
        />
      </ol>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <Spec label="Trust domain" value="0G chain + 0G storage + 0G TEE" />
        <Spec label="Settlement" value="One tx → ownership + key + payment" />
        <Spec label="Revocation" value="Built-in. Old key can't decrypt." />
      </div>
    </div>
  );
}

function StepCell({
  tag,
  where,
  title,
  body,
  accent,
}: {
  tag: string;
  where: string;
  title: string;
  body: string;
  accent?: boolean;
}) {
  return (
    <li
      className={`flex flex-col gap-3 border-b-2 border-[#0A0A0A] p-6 last:border-b-0 md:border-b-0 md:border-r-2 md:last:border-r-0 ${
        accent ? "bg-[#F64618] text-[#E2E2DA]" : "bg-[#E2E2DA] text-[#0A0A0A]"
      }`}
    >
      <span className="font-mono text-3xl font-black">{tag}</span>
      <p
        className={`font-mono text-[10px] font-bold uppercase tracking-[0.28em] ${
          accent ? "text-[#E2E2DA]/80" : "text-[#6A6A60]"
        }`}
      >
        {where}
      </p>
      <h3 className="text-2xl font-black uppercase tracking-tight">{title}</h3>
      <p
        className={`text-sm leading-6 ${
          accent ? "text-[#E2E2DA]/90" : "text-[#0A0A0A]/85"
        }`}
      >
        {body}
      </p>
    </li>
  );
}

// ────────────────────────────────────────────────────────────────────────
// 05 · Sealed-key transfer (the deep dive)
// ────────────────────────────────────────────────────────────────────────
function SealedTransfer() {
  return (
    <div>
      <Kicker num="05" title="Sealed-key transfer" tone="bone" />
      <h2 className="mt-6 text-5xl font-black uppercase leading-[0.94] tracking-tight sm:text-6xl">
        You sell <span className="text-[#F64618]">keys</span>, not bytes.
      </h2>
      <p className="mt-6 max-w-3xl text-base leading-7 text-[#E2E2DA]/85">
        The encrypted weights live in public storage forever — anyone can pull
        the ciphertext. The AES key that decrypts them only exists{" "}
        <em>inside a TEE</em>, sealed to one owner at a time. Transfer rotates
        the seal; revocation is automatic.
      </p>

      <div className="mt-10 grid gap-0 border-2 border-[#E2E2DA] md:grid-cols-3">
        <TransferState
          tag="Before"
          envelope="sealedKey₍seller₎"
          ownerOf="seller"
          decrypts={["✓ seller (via TEE)"]}
          cantDecrypt={["✗ everyone else"]}
        />
        <TransferState
          tag="At transfer"
          envelope="TEE: decrypt → re-encrypt"
          ownerOf="pending"
          decrypts={["enclave only, briefly"]}
          cantDecrypt={["seller wallet, buyer wallet"]}
          accent
        />
        <TransferState
          tag="After"
          envelope="sealedKey₍buyer₎"
          ownerOf="buyer"
          decrypts={["✓ buyer (via TEE)"]}
          cantDecrypt={["✗ seller (envelope rotated)", "✗ everyone else"]}
        />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Why
          k="Why the seller can't keep using it"
          v="They never had the key outside the TEE in the first place. After re-seal, the only envelope on-chain is the buyer's."
        />
        <Why
          k="Why we don't trust the seller"
          v="The contract verifies a TEE attestation signed by an attested signer key. No attestation, no transfer."
          accent
        />
        <Why
          k="Why it's atomic"
          v="Ownership flip, envelope rotation, and payment all happen in one transaction. Either all of it lands, or none."
        />
      </div>
    </div>
  );
}

function TransferState({
  tag,
  envelope,
  ownerOf,
  decrypts,
  cantDecrypt,
  accent,
}: {
  tag: string;
  envelope: string;
  ownerOf: string;
  decrypts: string[];
  cantDecrypt: string[];
  accent?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-3 border-b-2 border-[#E2E2DA] p-6 last:border-b-0 md:border-b-0 md:border-r-2 md:last:border-r-0 ${
        accent
          ? "bg-[#F64618] text-[#E2E2DA]"
          : "bg-[#0A0A0A] text-[#E2E2DA]"
      }`}
    >
      <p
        className={`font-mono text-[10px] font-bold uppercase tracking-[0.28em] ${
          accent ? "text-[#0A0A0A]" : "text-[#F64618]"
        }`}
      >
        {tag}
      </p>
      <p className="break-all font-mono text-base font-black">{envelope}</p>
      <p
        className={`font-mono text-[10px] uppercase tracking-[0.24em] ${
          accent ? "text-[#E2E2DA]/80" : "text-[#E2E2DA]/70"
        }`}
      >
        ownerOf → {ownerOf}
      </p>
      <div className="mt-2 space-y-1 font-mono text-xs leading-5">
        {decrypts.map((d) => (
          <p key={d}>{d}</p>
        ))}
        {cantDecrypt.map((d) => (
          <p
            key={d}
            className={accent ? "text-[#0A0A0A]" : "text-[#E2E2DA]/60"}
          >
            {d}
          </p>
        ))}
      </div>
    </div>
  );
}

function Why({
  k,
  v,
  accent,
}: {
  k: string;
  v: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`border-2 p-5 ${
        accent
          ? "border-[#F64618] bg-[#F64618] text-[#E2E2DA]"
          : "border-[#E2E2DA]/30 bg-[#E2E2DA]/[0.04] text-[#E2E2DA]"
      }`}
    >
      <p
        className={`font-mono text-[10px] font-bold uppercase tracking-[0.26em] ${
          accent ? "text-[#0A0A0A]" : "text-[#F64618]"
        }`}
      >
        {k}
      </p>
      <p
        className={`mt-2 text-sm leading-6 ${
          accent ? "text-[#E2E2DA]" : "text-[#E2E2DA]/85"
        }`}
      >
        {v}
      </p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// 06 · Architecture (tech stack)
// ────────────────────────────────────────────────────────────────────────
function Architecture() {
  return (
    <div>
      <Kicker num="06" title="Architecture" />
      <h2 className="mt-6 text-5xl font-black uppercase leading-[0.94] tracking-tight sm:text-6xl">
        One trust domain.
        <br />
        <span className="text-[#F64618]">Four</span> layers.
      </h2>
      <p className="mt-6 max-w-3xl text-base leading-7 text-[#0A0A0A]/80">
        Storage, settlement, compute, and app all settle to the same proof
        system. No cross-chain bridges, no off-chain receipts to trust.
      </p>

      <div className="mt-10 border-2 border-[#0A0A0A]">
        <ArchRow
          tier="L4 · App"
          tech="Next.js 16 · React 19 · TypeScript · Tailwind v4"
          role="UI · /builder · /infts · /my-agents · /playground · /pitch"
        />
        <ArchRow
          tier="L3 · Wallet / RPC"
          tech="wagmi 2 · viem · RainbowKit"
          role="Wallet connection · contract reads (parallel, no multicall3) · signed writes"
          accent
        />
        <ArchRow
          tier="L2 · Compute"
          tech="0G Compute Router · TEE-attested providers · Ollama (local fallback)"
          role="Inference layer · OpenAI-compatible · billing trace returned with every response"
        />
        <ArchRow
          tier="L1 · Settlement"
          tech="ERC-7857 (AgentDeed) · TEEOracle · chain 16602"
          role="Ownership · sealed-key envelopes · TEE attestation verification"
          accent
        />
        <ArchRow
          tier="L0 · Storage"
          tech="0G Storage · content-addressed · 3× replicas · AES-256-GCM"
          role="Encrypted weights blob · indexed by root hash · same trust domain as the chain"
        />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <TechChip
          name="ERC-7857"
          detail="Sealed-key envelope token. transfer / clone / authorizeUsage."
        />
        <TechChip
          name="AES-256-GCM"
          detail="WebCrypto, 96-bit nonce. Symmetric key sealed to the TEE."
        />
        <TechChip
          name="secp256k1 ECDH"
          detail="Buyer pubkey + TEE pubkey derive the new envelope on transfer."
        />
        <TechChip
          name="Hardhat + viem"
          detail="Contracts in Solidity 0.8.24; off-chain in pure TS — no ethers."
        />
      </div>
    </div>
  );
}

function ArchRow({
  tier,
  tech,
  role,
  accent,
}: {
  tier: string;
  tech: string;
  role: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-12 items-center border-b-2 border-[#0A0A0A] last:border-b-0 ${
        accent ? "bg-[#F64618] text-[#E2E2DA]" : "bg-[#E2E2DA] text-[#0A0A0A]"
      }`}
    >
      <p
        className={`col-span-3 border-r-2 border-[#0A0A0A] px-5 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.28em] ${
          accent ? "text-[#0A0A0A]" : "text-[#F64618]"
        }`}
      >
        {tier}
      </p>
      <div className="col-span-9 px-5 py-4">
        <p className="font-mono text-sm font-black">{tech}</p>
        <p
          className={`mt-1 font-mono text-[11px] leading-5 ${
            accent ? "text-[#E2E2DA]/90" : "text-[#0A0A0A]/75"
          }`}
        >
          {role}
        </p>
      </div>
    </div>
  );
}

function TechChip({ name, detail }: { name: string; detail: string }) {
  return (
    <div className="border-2 border-[#0A0A0A] bg-[#0A0A0A] p-4 text-[#E2E2DA]">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#F64618]">
        {name}
      </p>
      <p className="mt-2 text-xs leading-5 text-[#E2E2DA]/85">{detail}</p>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#0A0A0A] bg-[#E2E2DA] px-5 py-4">
      <p className="font-mono text-[9px] font-bold uppercase tracking-[0.26em] text-[#6A6A60]">
        {label}
      </p>
      <p className="mt-2 font-mono text-sm text-[#0A0A0A]">{value}</p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// 05 · Why now
// ────────────────────────────────────────────────────────────────────────
function WhyNow() {
  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
      <div className="lg:col-span-6">
        <Kicker num="07" title="Why now" tone="bone" />
        <h2 className="mt-6 text-5xl font-black uppercase leading-[0.94] tracking-tight sm:text-7xl">
          The model
          <br />
          <span className="text-[#F64618]">economy</span>
          <br />
          just got pieces.
        </h2>
      </div>
      <ul className="space-y-6 lg:col-span-6">
        <Wave
          year="2023"
          title="Open-weights explosion"
          body="Llama / Mistral / Qwen / DeepSeek release competitive checkpoints monthly. Fine-tuners are no longer waiting on permission."
        />
        <Wave
          year="2024"
          title="LoRA / QLoRA make tuning cheap"
          body="A useful domain adapter costs $10–500 to produce. Supply is exploding; monetization isn't."
        />
        <Wave
          year="2025"
          title="0G ships the trust domain"
          body="Storage, chain, and TEE inference under one provable stack. The first network where sealed-key transfer is actually atomic."
        />
        <Wave
          year="2026"
          title="ERC-7857 lands"
          body="A token spec built for capability transfer rather than collectibles. AgentDeed is what 7857 was drafted for."
          accent
        />
      </ul>
    </div>
  );
}

function Wave({
  year,
  title,
  body,
  accent,
}: {
  year: string;
  title: string;
  body: string;
  accent?: boolean;
}) {
  return (
    <li
      className={`flex items-start gap-5 border-l-4 pl-5 ${
        accent ? "border-[#F64618]" : "border-[#E2E2DA]/40"
      }`}
    >
      <span
        className={`font-mono text-2xl font-black ${
          accent ? "text-[#F64618]" : "text-[#E2E2DA]"
        }`}
      >
        {year}
      </span>
      <div>
        <h3 className="text-xl font-black uppercase tracking-tight">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-[#E2E2DA]/80">{body}</p>
      </div>
    </li>
  );
}

// ────────────────────────────────────────────────────────────────────────
// 06 · Business model
// ────────────────────────────────────────────────────────────────────────
function BusinessModel() {
  return (
    <div>
      <Kicker num="08" title="Business model" />
      <h2 className="mt-6 text-5xl font-black uppercase leading-[0.94] tracking-tight sm:text-6xl">
        Three revenue lines.
        <br />
        <span className="text-[#F64618]">All settle on-chain.</span>
      </h2>

      <div className="mt-12 grid gap-0 border-2 border-[#0A0A0A] md:grid-cols-3">
        <RevCell
          tag="01"
          name="Protocol fee"
          headline="2.5% of every capability transfer"
          body="Charged on the sale price of an iNFT. Sticky because the contract — not the marketplace — is the settlement layer."
          metric="2.5%"
          metricLabel="per transfer"
        />
        <RevCell
          tag="02"
          name="Inference royalty"
          headline="5% of TEE inference billed against an iNFT"
          body="When the buyer runs the model through the Compute Router, AgentDeed gets a share routed via the on-chain billing ledger."
          metric="5%"
          metricLabel="of inference"
          accent
        />
        <RevCell
          tag="03"
          name="Seller pro"
          headline="Verified attestations + featured listings"
          body="Subscription tier for serious fine-tuners: signed metric proofs, priority slots, eval-suite integrations."
          metric="$49"
          metricLabel="seller / mo"
        />
      </div>

      <div className="mt-8 border-2 border-[#0A0A0A] bg-[#0A0A0A] p-6 text-[#E2E2DA]">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#F64618]">
          Unit economics
        </p>
        <p className="mt-2 text-base leading-7">
          A single $5 model sold 200 times → $25 in protocol fees. The same
          model run for 2M inference tokens at $0.50 / 1k → $5,000 routed,
          $250 to AgentDeed. <span className="font-bold">Inference dwarfs sale price</span> — and we earn on both.
        </p>
      </div>
    </div>
  );
}

function RevCell({
  tag,
  name,
  headline,
  body,
  metric,
  metricLabel,
  accent,
}: {
  tag: string;
  name: string;
  headline: string;
  body: string;
  metric: string;
  metricLabel: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-3 border-b-2 border-[#0A0A0A] p-6 last:border-b-0 md:border-b-0 md:border-r-2 md:last:border-r-0 ${
        accent ? "bg-[#F64618] text-[#E2E2DA]" : "bg-[#E2E2DA] text-[#0A0A0A]"
      }`}
    >
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-3xl font-black">{tag}</span>
        <span
          className={`font-mono text-4xl font-black ${
            accent ? "text-[#0A0A0A]" : "text-[#F64618]"
          }`}
        >
          {metric}
        </span>
      </div>
      <p
        className={`font-mono text-[10px] font-bold uppercase tracking-[0.28em] ${
          accent ? "text-[#E2E2DA]/80" : "text-[#6A6A60]"
        }`}
      >
        {name} · {metricLabel}
      </p>
      <h3 className="text-lg font-black leading-tight">{headline}</h3>
      <p
        className={`text-sm leading-6 ${
          accent ? "text-[#E2E2DA]/90" : "text-[#0A0A0A]/85"
        }`}
      >
        {body}
      </p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// 07 · Traction
// ────────────────────────────────────────────────────────────────────────
function Traction() {
  return (
    <div>
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-[#0A0A0A]/80">
        §09 · <span className="text-[#0A0A0A]">Traction</span>
      </p>
      <h2 className="mt-6 text-5xl font-black uppercase leading-[0.94] tracking-tight sm:text-7xl">
        <span className="text-[#0A0A0A]">Live</span> today.
      </h2>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-[#E2E2DA]">
        Contracts deployed on 0G. Real iNFTs minting. Verifiable on-chain —
        not slideware.
      </p>

      <div className="mt-10 grid gap-0 border-2 border-[#0A0A0A] md:grid-cols-2">
        <Deployed
          name="AgentDeed (ERC-7857)"
          addr="0x21cBA803EdB8676D06FAf9aCAb84611C98B7A370"
          href="https://chainscan-galileo.0g.ai/address/0x21cBA803EdB8676D06FAf9aCAb84611C98B7A370"
        />
        <Deployed
          name="TEEOracle"
          addr="0xcF7294f6C6Ca09cae9b6832efbCffAB218e7d499"
          href="https://chainscan-galileo.0g.ai/address/0xcF7294f6C6Ca09cae9b6832efbCffAB218e7d499"
        />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <TractionStat value="2" label="contracts live" />
        <TractionStat value="16602" label="chain id (0G)" />
        <TractionStat value="100%" label="encrypt pipeline shipped" mono />
        <TractionStat value="1+" label="iNFT minted on-chain" />
      </div>

      <div className="mt-6 border-2 border-[#0A0A0A] bg-[#0A0A0A] p-5 font-mono text-xs leading-6 text-[#E2E2DA]">
        <span className="text-[#F64618]">$</span> First mint tx ·
        <span className="text-[#E2E2DA]/70">
          {" "}
          0x84f5baf9b99e6b1e4d180a97eabe7decfaf980fe9ae5eca9a4a7b04f4ac60351
        </span>
        <br />
        <a
          href="https://chainscan-galileo.0g.ai/tx/0x84f5baf9b99e6b1e4d180a97eabe7decfaf980fe9ae5eca9a4a7b04f4ac60351"
          target="_blank"
          rel="noreferrer"
          className="text-[#F64618] underline"
        >
          → verify on chainscan
        </a>
      </div>
    </div>
  );
}

function Deployed({
  name,
  addr,
  href,
}: {
  name: string;
  addr: string;
  href: string;
}) {
  return (
    <div className="flex flex-col gap-3 border-b-2 border-[#0A0A0A] bg-[#E2E2DA] p-6 text-[#0A0A0A] last:border-b-0 md:border-b-0 md:border-r-2 md:last:border-r-0">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#F64618]">
        {name}
      </p>
      <p className="break-all font-mono text-sm">{addr}</p>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="self-start font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-[#0A0A0A] underline transition hover:text-[#F64618]"
      >
        view on explorer →
      </a>
    </div>
  );
}

function TractionStat({
  value,
  label,
  mono,
}: {
  value: string;
  label: string;
  mono?: boolean;
}) {
  return (
    <div className="border-2 border-[#0A0A0A] bg-[#0A0A0A] p-4 text-[#E2E2DA]">
      <p
        className={`${
          mono ? "font-mono" : ""
        } text-3xl font-black text-[#F64618]`}
      >
        {value}
      </p>
      <p className="mt-2 font-mono text-[9px] font-bold uppercase tracking-[0.26em] text-[#E2E2DA]/70">
        {label}
      </p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// 08 · Closing
// ────────────────────────────────────────────────────────────────────────
function Closing() {
  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
      <div className="lg:col-span-8">
        <Kicker num="10" title="What's next" tone="bone" />
        <h2 className="mt-8 text-6xl font-black uppercase leading-[0.9] tracking-tight sm:text-[10vw] lg:text-[7.5vw]">
          Mint a model.
          <br />
          Watch it
          <br />
          <span className="text-[#F64618]">transfer.</span>
        </h2>
        <p className="mt-8 max-w-2xl text-lg leading-8 text-[#E2E2DA]/85">
          The next twelve months: real 0G Storage pinning, attested TEE
          signers on transfer, a verifier-grade marketplace for AI capability.
          We&apos;re raising to make the iNFT the default unit of model
          ownership.
        </p>
      </div>
      <div className="space-y-3 lg:col-span-4">
        <Link
          href="/builder"
          className="flex items-center justify-between border-2 border-[#E2E2DA] bg-[#F64618] px-6 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.24em] text-[#E2E2DA] transition hover:bg-[#E2E2DA] hover:text-[#0A0A0A]"
        >
          Open the builder <span>→</span>
        </Link>
        <Link
          href="/infts"
          className="flex items-center justify-between border-2 border-[#E2E2DA] bg-transparent px-6 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.24em] text-[#E2E2DA] transition hover:bg-[#E2E2DA] hover:text-[#0A0A0A]"
        >
          See the marketplace <span>→</span>
        </Link>
        <Link
          href="/"
          className="flex items-center justify-between border-2 border-[#E2E2DA]/40 bg-transparent px-6 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.24em] text-[#E2E2DA]/80 transition hover:border-[#E2E2DA] hover:text-[#E2E2DA]"
        >
          Back to home <span>→</span>
        </Link>
        <p className="pt-4 text-right font-mono text-[10px] uppercase tracking-[0.28em] text-[#E2E2DA]/50">
          end of deck · press Home to restart
        </p>
      </div>
    </div>
  );
}
