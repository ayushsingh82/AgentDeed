"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { listInfts, type InftRecord } from "@/lib/inft";
import { AGENT_DEED_CONTRACT, AGENT_DEED_DEPLOYED, OG_CHAIN } from "@/lib/og";

type Filter = "All" | "Mine" | "Others";
const FILTERS: Filter[] = ["All", "Mine", "Others"];

export default function MarketplacePage() {
  const { address } = useAccount();
  const [infts, setInfts] = useState<InftRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!AGENT_DEED_DEPLOYED) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    listInfts()
      .then((all) => {
        if (!cancelled) setInfts(all);
      })
      .catch((e) => {
        if (!cancelled) setError((e as Error).message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const me = address?.toLowerCase();
    return infts.filter((t) => {
      const ownerLower = t.owner.toLowerCase();
      if (filter === "Mine" && (!me || ownerLower !== me)) return false;
      if (filter === "Others" && me && ownerLower === me) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        t.tokenId.toString().includes(q) ||
        ownerLower.includes(q) ||
        t.encryptedURI.toLowerCase().includes(q) ||
        t.metadataHash.toLowerCase().includes(q)
      );
    });
  }, [infts, query, filter, address]);

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
                Sealed models on-chain.
              </h1>
              <p className="mt-3 max-w-2xl text-base text-[#0A0A0A]/75">
                Every listing is an ERC-7857 iNFT minted to the AgentDeed
                contract. Read live on-chain.
              </p>
            </div>
            <Stats total={infts.length} loading={loading} />
          </div>

          {AGENT_DEED_DEPLOYED && (
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
                  placeholder="Search by token id, owner, or hash…"
                  className="w-full border border-[#0A0A0A] bg-[#E2E2DA] px-4 py-3 pr-10 font-mono text-sm text-[#0A0A0A] placeholder:text-[#6A6A60] focus:border-[#F64618] focus:outline-none"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-[#6A6A60]">
                  ⌘K
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="px-6 py-12">
        <div className="mx-auto max-w-7xl">
          {!AGENT_DEED_DEPLOYED ? (
            <NotDeployed />
          ) : error ? (
            <div className="border border-[#F64618]/50 bg-[#F64618]/[0.06] p-10 font-mono text-sm text-[#F64618]">
              Failed to read contract: {error}
            </div>
          ) : loading ? (
            <p className="font-mono text-sm text-[#6A6A60]">
              Reading on-chain listings…
            </p>
          ) : filtered.length === 0 ? (
            <div className="border border-dashed border-[#0A0A0A] p-16 text-center font-mono text-sm text-[#6A6A60]">
              No iNFTs minted yet.{" "}
              <Link href="/builder" className="text-[#F64618] underline">
                Mint the first →
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((t, idx) => (
                <ListingCard
                  key={t.tokenId.toString()}
                  inft={t}
                  variant={idx % 5 === 2 ? "accent" : "ink"}
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

function NotDeployed() {
  return (
    <div className="mx-auto max-w-2xl border border-[#F64618]/50 bg-[#F64618]/[0.06] p-10 text-center">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#F64618]">
        Contract not configured
      </p>
      <h2 className="mt-4 text-2xl font-black">No AgentDeed address set</h2>
      <p className="mt-3 text-sm text-[#0A0A0A]/75">
        Deploy the ERC-7857 contract from <code>contracts/</code> and set{" "}
        <code className="font-mono">NEXT_PUBLIC_AGENT_DEED_ADDRESS</code> to
        load on-chain listings.
      </p>
    </div>
  );
}

function Stats({ total, loading }: { total: number; loading: boolean }) {
  return (
    <dl className="grid grid-cols-2 gap-3 font-mono text-xs">
      <Stat label="Total minted" value={loading ? "…" : String(total)} />
      <Stat
        label="Contract"
        value={
          AGENT_DEED_DEPLOYED
            ? `${AGENT_DEED_CONTRACT.slice(0, 6)}…${AGENT_DEED_CONTRACT.slice(-4)}`
            : "—"
        }
      />
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

type Variant = "ink" | "accent";

function ListingCard({ inft, variant }: { inft: InftRecord; variant: Variant }) {
  const id = inft.tokenId.toString().padStart(4, "0");
  const palette =
    variant === "accent"
      ? {
          card: "bg-[#F64618] text-[#E2E2DA] border-[#0A0A0A]",
          ink: "text-[#E2E2DA]",
          mute: "text-[#E2E2DA]/70",
          rule: "border-[#E2E2DA]/30",
          statusBox: "border-[#0A0A0A] bg-[#0A0A0A] text-[#E2E2DA]",
          accentText: "text-[#0A0A0A]",
          cta: "border-[#0A0A0A] bg-[#0A0A0A] text-[#E2E2DA] hover:bg-[#E2E2DA] hover:text-[#0A0A0A]",
        }
      : {
          card: "bg-[#0A0A0A] text-[#E2E2DA] border-[#0A0A0A]",
          ink: "text-[#E2E2DA]",
          mute: "text-[#E2E2DA]/60",
          rule: "border-[#E2E2DA]/20",
          statusBox: "border-[#F64618] bg-[#F64618] text-[#E2E2DA]",
          accentText: "text-[#F64618]",
          cta: "border-[#F64618] bg-[#F64618] text-[#E2E2DA] hover:bg-[#E2E2DA] hover:text-[#0A0A0A] hover:border-[#E2E2DA]",
        };

  return (
    <article
      className={`group flex flex-col border-2 p-6 transition ${palette.card}`}
    >
      <header className="flex items-start justify-between">
        <span
          className={`font-mono text-[10px] font-bold uppercase tracking-[0.22em] ${palette.mute}`}
        >
          iNFT #{id}
        </span>
        <span
          className={`border-2 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.22em] ${palette.statusBox}`}
        >
          Sealed
        </span>
      </header>

      <h3 className="mt-5 break-all text-xl font-black">AgentDeed #{id}</h3>

      <div
        className={`mt-5 border-t-2 pt-4 font-mono text-[11px] leading-6 ${palette.rule}`}
      >
        <div className="flex justify-between gap-3">
          <span className={palette.mute}>owner</span>
          <span>{shortAddr(inft.owner)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className={palette.mute}>weights hash</span>
          <span className="truncate">
            {inft.metadataHash.slice(0, 10)}…{inft.metadataHash.slice(-6)}
          </span>
        </div>
        <div className="flex justify-between gap-3">
          <span className={palette.mute}>storage uri</span>
          <span className="truncate">{inft.encryptedURI || "—"}</span>
        </div>
      </div>

      <footer
        className={`mt-6 flex items-end justify-between border-t-2 pt-5 ${palette.rule}`}
      >
        <a
          href={`${OG_CHAIN.explorer}/token/${AGENT_DEED_CONTRACT}?tokenId=${inft.tokenId}`}
          target="_blank"
          rel="noreferrer"
          className={`font-mono text-[10px] font-bold uppercase tracking-[0.24em] underline ${palette.accentText}`}
        >
          View on explorer →
        </a>
        <Link
          href="/builder"
          className={`inline-flex items-center gap-2 border-2 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.22em] transition ${palette.cta}`}
        >
          Unseal →
        </Link>
      </footer>
    </article>
  );
}

function shortAddr(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}
