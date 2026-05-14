"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { listInfts, type InftRecord } from "@/lib/inft";
import { AGENT_DEED_CONTRACT, AGENT_DEED_DEPLOYED, OG_CHAIN } from "@/lib/og";

export default function MyModelsPage() {
  const { isConnected, address } = useAccount();
  const [infts, setInfts] = useState<InftRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected || !address || !AGENT_DEED_DEPLOYED) {
      setInfts([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    listInfts()
      .then((all) => {
        if (cancelled) return;
        setInfts(
          all.filter(
            (t) => t.owner.toLowerCase() === address.toLowerCase(),
          ),
        );
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
  }, [isConnected, address]);

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
            Models you own, read straight from the AgentDeed contract. Inference
            is gated to the current key holder — that&apos;s you, until you sell.
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
              iNFTs you hold.
            </p>
            <div className="mt-8">
              <ConnectButton />
            </div>
          </div>
        </section>
      ) : !AGENT_DEED_DEPLOYED ? (
        <section className="px-6 py-24">
          <div className="mx-auto max-w-2xl border border-[#F64618]/50 bg-[#F64618]/[0.06] p-10 text-center">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#F64618]">
              Contract not configured
            </p>
            <h2 className="mt-4 text-2xl font-black">
              No AgentDeed address set
            </h2>
            <p className="mt-3 text-sm text-[#0A0A0A]/75">
              Deploy the ERC-7857 contract from <code>contracts/</code> and set{" "}
              <code className="font-mono">NEXT_PUBLIC_AGENT_DEED_ADDRESS</code>{" "}
              to load on-chain holdings.
            </p>
          </div>
        </section>
      ) : (
        <>
          <section className="border-b border-[#0A0A0A] px-6 py-10">
            <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-4">
              <SummaryStat label="Owner" value={shortAddr(address)} mono />
              <SummaryStat
                label="Models in vault"
                value={loading ? "…" : String(infts.length)}
              />
              <SummaryStat label="Network" value={OG_CHAIN.name} />
              <SummaryStat
                label="Contract"
                value={shortAddr(AGENT_DEED_CONTRACT)}
                mono
              />
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

              {error && (
                <p className="mt-6 border border-[#F64618]/50 bg-[#F64618]/[0.06] px-4 py-3 font-mono text-xs text-[#F64618]">
                  Failed to read contract: {error}
                </p>
              )}

              {loading ? (
                <p className="mt-8 font-mono text-sm text-[#6A6A60]">
                  Reading on-chain holdings…
                </p>
              ) : infts.length === 0 ? (
                <p className="mt-8 font-mono text-sm text-[#6A6A60]">
                  No iNFTs held by this wallet yet.{" "}
                  <Link href="/builder" className="text-[#F64618] underline">
                    Mint your first →
                  </Link>
                </p>
              ) : (
                <div className="mt-8 grid gap-6 md:grid-cols-2">
                  {infts.map((m) => (
                    <InftCard key={m.tokenId.toString()} inft={m} />
                  ))}
                </div>
              )}
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

function InftCard({ inft }: { inft: InftRecord }) {
  const id = inft.tokenId.toString().padStart(4, "0");
  return (
    <article className="flex flex-col border border-[#0A0A0A] bg-[#E2E2DA] p-6 transition hover:border-[#F64618]">
      <header className="flex items-start justify-between">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#6A6A60]">
          iNFT #{id}
        </span>
        <span className="border border-[#F64618]/50 bg-[#F64618]/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-[#F64618]">
          Sealed (mine)
        </span>
      </header>

      <h3 className="mt-5 break-all text-lg font-black">AgentDeed #{id}</h3>

      <div className="mt-5 border-t border-[#0A0A0A] pt-4 font-mono text-[11px] leading-6 text-[#0A0A0A]/85">
        <div className="flex justify-between gap-3">
          <span className="text-[#6A6A60]">weights hash</span>
          <span className="truncate">
            {inft.metadataHash.slice(0, 10)}…{inft.metadataHash.slice(-6)}
          </span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-[#6A6A60]">storage uri</span>
          <span className="truncate">{inft.encryptedURI || "—"}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-[#6A6A60]">owner</span>
          <span>{shortAddr(inft.owner)}</span>
        </div>
      </div>

      <footer className="mt-6 flex items-center justify-end gap-2 border-t border-[#0A0A0A] pt-5">
        <Link
          href="/playground"
          className="border-2 border-[#0A0A0A] bg-transparent px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-[#0A0A0A] transition hover:border-[#F64618] hover:text-[#F64618]"
        >
          Run inference →
        </Link>
      </footer>
    </article>
  );
}
