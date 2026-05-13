"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

type Owned = {
  id: string;
  name: string;
  base: string;
  domain: string;
  sizeMb: number;
  status: "Sealed (mine)" | "Listed" | "Draft";
  priceOg?: number;
  lastInfer?: string;
  revenue?: number;
};

const OWNED: Owned[] = [
  {
    id: "0438",
    name: "JP→EN-Manga-Tone",
    base: "qwen2-7b",
    domain: "JP→EN literary",
    sizeMb: 168.3,
    status: "Sealed (mine)",
    lastInfer: "12m ago · 384 tok",
  },
  {
    id: "0445",
    name: "SQL-CoT-Adapter",
    base: "deepseek-coder-6.7b",
    domain: "text → SQL",
    sizeMb: 124.2,
    status: "Listed",
    priceOg: 4.4,
    revenue: 0,
  },
  {
    id: "0399",
    name: "RetailVoice-Adapter",
    base: "mistral-7b",
    domain: "support summarization",
    sizeMb: 76.1,
    status: "Listed",
    priceOg: 1.8,
    revenue: 14.4,
  },
  {
    id: "draft-01",
    name: "Legal-Brief-LoRA",
    base: "llama-3-8b",
    domain: "US case-law",
    sizeMb: 222.0,
    status: "Draft",
  },
];

export default function MyModelsPage() {
  const { isConnected, address } = useAccount();

  return (
    <main className="flex min-h-screen flex-col bg-[#E2E2DA] text-[#0A0A0A]">
      <NavBar />

      <section className="border-b border-[#0A0A0A] px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#F64618]">
            Vault · /my-agents
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Your sealed weights.
          </h1>
          <p className="mt-3 max-w-2xl text-base text-[#0A0A0A]/75">
            Models you own, list, or are still drafting. Inference is gated to
            the current key holder — that&apos;s you, until you sell.
          </p>
        </div>
      </section>

      {!isConnected ? (
        <section className="px-6 py-24">
          <div className="mx-auto flex max-w-2xl flex-col items-center border border-[#0A0A0A] bg-[#E2E2DA] p-10 text-center">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#F64618]">
              Wallet required
            </p>
            <h2 className="mt-4 text-2xl font-black">
              Connect to view your vault
            </h2>
            <p className="mt-3 max-w-md text-sm text-[#0A0A0A]/75">
              Ownership is on-chain. Connect a wallet on 0G Galileo to load the
              iNFTs you hold, your listings, and revenue.
            </p>
            <div className="mt-8">
              <ConnectButton />
            </div>
          </div>
        </section>
      ) : (
        <>
          <section className="border-b border-[#0A0A0A] px-6 py-10">
            <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-4">
              <SummaryStat label="Owner" value={shortAddr(address)} mono />
              <SummaryStat label="Models in vault" value="3" />
              <SummaryStat label="Listings · live" value="2" />
              <SummaryStat label="Revenue · all-time" value="14.4 OG" accent />
            </div>
          </section>

          <section className="px-6 py-12">
            <div className="mx-auto max-w-7xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black">Holdings</h2>
                <Link
                  href="/builder"
                  className="inline-flex items-center gap-2 border-2 border-[#F64618] bg-[#F64618] px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-[#E2E2DA] transition hover:bg-[#D63A0E]"
                >
                  + Mint new iNFT
                </Link>
              </div>

              <div className="mt-8 grid gap-6 md:grid-cols-2">
                {OWNED.map((m) => (
                  <OwnedCard key={m.id} model={m} />
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      <Footer />
    </main>
  );
}

function shortAddr(a?: string) {
  if (!a) return "—";
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

function SummaryStat({
  label,
  value,
  accent,
  mono,
}: {
  label: string;
  value: string;
  accent?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="border border-[#0A0A0A] bg-[#E2E2DA] px-5 py-4">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-[#6A6A60]">
        {label}
      </p>
      <p
        className={`mt-2 text-xl font-black ${
          accent ? "text-[#F64618]" : "text-[#0A0A0A]"
        } ${mono ? "font-mono" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function OwnedCard({ model }: { model: Owned }) {
  const isDraft = model.status === "Draft";
  const isListed = model.status === "Listed";
  const statusStyles = isDraft
    ? "border-[#0A0A0A] bg-[#0A0A0A] text-[#6A6A60]"
    : isListed
    ? "border-[#F64618]/50 bg-[#F64618]/10 text-[#F64618]"
    : "border-[#F64618]/50 bg-[#F64618]/10 text-[#F64618]";

  return (
    <article className="flex flex-col border border-[#0A0A0A] bg-[#E2E2DA] p-6 transition hover:border-[#F64618]">
      <header className="flex items-start justify-between">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#6A6A60]">
          iNFT #{model.id}
        </span>
        <span
          className={`border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.22em] ${statusStyles}`}
        >
          {model.status}
        </span>
      </header>

      <h3 className="mt-5 text-xl font-black">{model.name}</h3>
      <p className="mt-1 font-mono text-[11px] text-[#6A6A60]">
        base · <span className="text-[#0A0A0A]">{model.base}</span> · {model.domain}
      </p>

      <div className="mt-5 border-t border-[#0A0A0A] pt-4 font-mono text-[11px] leading-6 text-[#0A0A0A]/85">
        <div className="flex justify-between">
          <span className="text-[#6A6A60]">weights</span>
          <span>{model.sizeMb.toFixed(1)} MB</span>
        </div>
        {model.priceOg !== undefined && (
          <div className="flex justify-between">
            <span className="text-[#6A6A60]">listed at</span>
            <span className="text-[#F64618]">
              {model.priceOg.toFixed(2)} OG
            </span>
          </div>
        )}
        {model.revenue !== undefined && (
          <div className="flex justify-between">
            <span className="text-[#6A6A60]">revenue</span>
            <span>{model.revenue.toFixed(2)} OG</span>
          </div>
        )}
        {model.lastInfer && (
          <div className="flex justify-between">
            <span className="text-[#6A6A60]">last infer</span>
            <span>{model.lastInfer}</span>
          </div>
        )}
      </div>

      <footer className="mt-6 flex items-center justify-end gap-2 border-t border-[#0A0A0A] pt-5">
        {isDraft && (
          <Link
            href="/builder"
            className="border-2 border-[#F64618] bg-[#F64618] px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-[#E2E2DA] hover:bg-[#D63A0E]"
          >
            Continue minting
          </Link>
        )}
        {isListed && (
          <button
            type="button"
            className="border-2 border-[#F64618] bg-transparent px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-[#F64618] transition hover:bg-[#F64618] hover:text-[#E2E2DA]"
          >
            Delist
          </button>
        )}
        {!isDraft && (
          <button
            type="button"
            className="border-2 border-[#0A0A0A] bg-transparent px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-[#0A0A0A] transition hover:border-[#F64618] hover:text-[#F64618]"
          >
            Run inference →
          </button>
        )}
      </footer>
    </article>
  );
}
