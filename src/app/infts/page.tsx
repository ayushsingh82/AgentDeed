"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

type Listing = {
  id: string;
  name: string;
  base: string;
  domain: string;
  rank: number;
  sizeMb: number;
  priceOg: number;
  metric: { label: string; value: string };
  status: "Sealed" | "Sold" | "Reserved";
  seller: string;
  trainedAt: string;
};

const LISTINGS: Listing[] = [
  {
    id: "0427",
    name: "MedScribe-LoRA",
    base: "phi-3-mini-4k",
    domain: "medical Q&A",
    rank: 16,
    sizeMb: 142.6,
    priceOg: 5.0,
    metric: { label: "MMLU-med", value: "+11.2" },
    status: "Sealed",
    seller: "0xa1c4…f3",
    trainedAt: "2 weeks ago",
  },
  {
    id: "0431",
    name: "SolidityAuditor-v2",
    base: "llama-3-8b",
    domain: "smart-contract review",
    rank: 32,
    sizeMb: 286.4,
    priceOg: 12.5,
    metric: { label: "SWC-coverage", value: "94%" },
    status: "Sealed",
    seller: "0x9b…41",
    trainedAt: "3 days ago",
  },
  {
    id: "0438",
    name: "JP→EN-Manga-Tone",
    base: "qwen2-7b",
    domain: "JP→EN literary",
    rank: 16,
    sizeMb: 168.3,
    priceOg: 3.2,
    metric: { label: "BLEU", value: "+6.4" },
    status: "Sealed",
    seller: "0x55…ee",
    trainedAt: "1 day ago",
  },
  {
    id: "0399",
    name: "RetailVoice-Adapter",
    base: "mistral-7b",
    domain: "support-call summarization",
    rank: 8,
    sizeMb: 76.1,
    priceOg: 1.8,
    metric: { label: "ROUGE-L", value: "+8.9" },
    status: "Sold",
    seller: "0x71…2a",
    trainedAt: "1 month ago",
  },
  {
    id: "0442",
    name: "Sonnet-Style-LoRA",
    base: "stable-diffusion-xl",
    domain: "vintage-illustration",
    rank: 32,
    sizeMb: 211.7,
    priceOg: 7.7,
    metric: { label: "CLIP-sim", value: "0.81" },
    status: "Sealed",
    seller: "0xfa…07",
    trainedAt: "5 days ago",
  },
  {
    id: "0445",
    name: "SQL-CoT-Adapter",
    base: "deepseek-coder-6.7b",
    domain: "text → SQL",
    rank: 16,
    sizeMb: 124.2,
    priceOg: 4.4,
    metric: { label: "Spider-EX", value: "78%" },
    status: "Reserved",
    seller: "0x12…bb",
    trainedAt: "8 hours ago",
  },
  {
    id: "0451",
    name: "Whisper-Surgical-Notes",
    base: "whisper-large-v3",
    domain: "ASR medical",
    rank: 8,
    sizeMb: 64.8,
    priceOg: 6.1,
    metric: { label: "WER", value: "−32%" },
    status: "Sealed",
    seller: "0xdd…91",
    trainedAt: "12 days ago",
  },
  {
    id: "0454",
    name: "Pixel-Logo-LoRA",
    base: "flux-1-dev",
    domain: "logo generation",
    rank: 16,
    sizeMb: 158.0,
    priceOg: 2.9,
    metric: { label: "Style-fit", value: "0.74" },
    status: "Sealed",
    seller: "0x4e…3c",
    trainedAt: "yesterday",
  },
];

const FILTERS = ["All", "Sealed", "Sold", "Reserved"] as const;

export default function MarketplacePage() {
  const [filter, setFilter] =
    useState<(typeof FILTERS)[number]>("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return LISTINGS.filter((l) => {
      if (filter !== "All" && l.status !== filter) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        l.name.toLowerCase().includes(q) ||
        l.base.toLowerCase().includes(q) ||
        l.domain.toLowerCase().includes(q) ||
        l.id.includes(q)
      );
    });
  }, [filter, query]);

  return (
    <main className="flex min-h-screen flex-col bg-[#E2E2DA] text-[#0A0A0A]">
      <NavBar />

      <section className="border-b border-[#0A0A0A] px-6 py-14">
        <div className="mx-auto flex max-w-7xl flex-col gap-8">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#F64618]">
                Marketplace · /infts
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                Sealed models for sale.
              </h1>
              <p className="mt-3 max-w-2xl text-base text-[#0A0A0A]/75">
                Every listing is a working capability behind a TEE-sealed key.
                Buy → key re-encrypts to you. Seller can no longer infer.
              </p>
            </div>
            <Stats />
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`border px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] transition ${
                    filter === f
                      ? "border-[#F64618] bg-[#F64618] text-[#E2E2DA]"
                      : "border-[#0A0A0A] text-[#0A0A0A] hover:border-[#F64618]"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-96">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by model, base, or token id…"
                className="w-full border border-[#0A0A0A] bg-[#E2E2DA] px-4 py-3 pr-10 font-mono text-sm text-[#0A0A0A] placeholder:text-[#6A6A60] focus:border-[#F64618] focus:outline-none"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-[#6A6A60]">
                ⌘K
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-12">
        <div className="mx-auto max-w-7xl">
          {filtered.length === 0 ? (
            <div className="border border-dashed border-[#0A0A0A] p-16 text-center font-mono text-sm text-[#6A6A60]">
              No listings match the current filter.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((l, idx) => (
                <ListingCard
                  key={l.id}
                  listing={l}
                  variant={
                    l.status === "Sold"
                      ? "muted"
                      : idx % 5 === 2
                      ? "accent"
                      : "ink"
                  }
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Stats() {
  return (
    <dl className="grid grid-cols-3 gap-3 font-mono text-xs">
      <Stat label="Total listings" value="142" />
      <Stat label="Sealed today" value="6" />
      <Stat label="Volume · 7d" value="318 OG" />
    </dl>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#0A0A0A] bg-[#E2E2DA] px-4 py-3">
      <dt className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#6A6A60]">
        {label}
      </dt>
      <dd className="mt-1 text-base font-black text-[#F64618]">{value}</dd>
    </div>
  );
}

type Variant = "ink" | "accent" | "muted";

function ListingCard({
  listing,
  variant,
}: {
  listing: Listing;
  variant: Variant;
}) {
  const sold = listing.status === "Sold";

  const palette = (() => {
    if (variant === "accent") {
      return {
        card: "bg-[#F64618] text-[#E2E2DA] border-[#0A0A0A]",
        ink: "text-[#E2E2DA]",
        mute: "text-[#E2E2DA]/70",
        rule: "border-[#E2E2DA]/30",
        statusBox:
          "border-[#0A0A0A] bg-[#0A0A0A] text-[#E2E2DA]",
        priceColor: "text-[#0A0A0A]",
        accentText: "text-[#0A0A0A]",
        cta: "border-[#0A0A0A] bg-[#0A0A0A] text-[#E2E2DA] hover:bg-[#E2E2DA] hover:text-[#0A0A0A]",
      };
    }
    if (variant === "muted") {
      return {
        card: "bg-[#E2E2DA] text-[#0A0A0A] border-[#0A0A0A] opacity-70",
        ink: "text-[#0A0A0A]",
        mute: "text-[#6A6A60]",
        rule: "border-[#0A0A0A]/40",
        statusBox: "border-[#0A0A0A] bg-[#0A0A0A] text-[#E2E2DA]",
        priceColor: "text-[#0A0A0A]/70",
        accentText: "text-[#F64618]",
        cta: "pointer-events-none border-[#0A0A0A] text-[#6A6A60]",
      };
    }
    return {
      card: "bg-[#0A0A0A] text-[#E2E2DA] border-[#0A0A0A]",
      ink: "text-[#E2E2DA]",
      mute: "text-[#E2E2DA]/60",
      rule: "border-[#E2E2DA]/20",
      statusBox: "border-[#F64618] bg-[#F64618] text-[#E2E2DA]",
      priceColor: "text-[#F64618]",
      accentText: "text-[#F64618]",
      cta: "border-[#F64618] bg-[#F64618] text-[#E2E2DA] hover:bg-[#E2E2DA] hover:text-[#0A0A0A] hover:border-[#E2E2DA]",
    };
  })();

  return (
    <article
      className={`group flex flex-col border-2 p-6 transition ${palette.card}`}
    >
      <header className="flex items-start justify-between">
        <span
          className={`font-mono text-[10px] font-bold uppercase tracking-[0.22em] ${palette.mute}`}
        >
          iNFT #{listing.id}
        </span>
        <span
          className={`border-2 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.22em] ${palette.statusBox}`}
        >
          {listing.status}
        </span>
      </header>

      <h3 className="mt-5 text-xl font-black">{listing.name}</h3>
      <p className={`mt-1 font-mono text-[11px] ${palette.mute}`}>
        base · <span className={palette.ink}>{listing.base}</span> · LoRA r=
        {listing.rank}
      </p>

      <div
        className={`mt-5 border-t-2 pt-4 font-mono text-[11px] leading-6 ${palette.rule}`}
      >
        <div className="flex justify-between">
          <span className={palette.mute}>domain</span>
          <span>{listing.domain}</span>
        </div>
        <div className="flex justify-between">
          <span className={palette.mute}>weights</span>
          <span>{listing.sizeMb.toFixed(1)} MB</span>
        </div>
        <div className="flex justify-between">
          <span className={palette.mute}>{listing.metric.label}</span>
          <span className={`font-bold ${palette.accentText}`}>
            {listing.metric.value}
          </span>
        </div>
        <div className="flex justify-between">
          <span className={palette.mute}>seller</span>
          <span>{listing.seller}</span>
        </div>
      </div>

      <footer
        className={`mt-6 flex items-end justify-between border-t-2 pt-5 ${palette.rule}`}
      >
        <div>
          <p
            className={`font-mono text-[9px] font-bold uppercase tracking-[0.24em] ${palette.mute}`}
          >
            Price
          </p>
          <p
            className={`mt-1 font-mono text-2xl font-black ${palette.priceColor}`}
          >
            {listing.priceOg.toFixed(2)} <span className="text-sm">OG</span>
          </p>
        </div>
        <Link
          href={sold ? "#" : "/builder"}
          aria-disabled={sold}
          className={`inline-flex items-center gap-2 border-2 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.22em] transition ${palette.cta}`}
        >
          {sold ? "Sold" : "Unseal →"}
        </Link>
      </footer>
    </article>
  );
}
