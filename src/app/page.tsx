import Link from "next/link";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-[#E2E2DA] text-[#0A0A0A]">
      <NavBar />

      {/* HERO — asymmetric editorial layout */}
      <section className="relative overflow-hidden border-b-2 border-[#0A0A0A]">
        <div className="absolute inset-0 bone-grid opacity-70" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-12 lg:py-28">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 border-2 border-[#0A0A0A] bg-[#F64618] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#E2E2DA]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E2E2DA] pulse-dot" />
                ERC-7857 · sealed-key transfer
              </span>
              <span className="hidden font-mono text-[10px] uppercase tracking-[0.3em] text-[#6A6A60] md:inline">
                / hackathon-grade
              </span>
            </div>

            <h1 className="mt-8 font-black uppercase leading-[0.88] tracking-tight">
              <span className="block text-[18vw] sm:text-[14vw] lg:text-[10vw]">
                Sell
              </span>
              <span className="block text-[18vw] sm:text-[14vw] lg:text-[10vw]">
                the <span className="text-[#F64618]">model</span>.
              </span>
              <span className="block text-[12vw] sm:text-[9vw] lg:text-[6.5vw] text-[#6A6A60]">
                Lose the access.
              </span>
            </h1>

            <p className="mt-10 max-w-xl text-lg leading-8 text-[#0A0A0A]/85">
              WeightVault is a sealed-key marketplace for fine-tunes.
              Encrypted weights live on{" "}
              <span className="border-b-2 border-[#F64618] font-bold">
                0G Storage
              </span>
              . The iNFT <em>is</em> the model. Buy it → sealed key
              transfers inside a TEE → only you can run inference.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/infts"
                className="group inline-flex items-center gap-3 border-2 border-[#0A0A0A] bg-[#F64618] px-7 py-4 font-bold uppercase tracking-[0.22em] text-[#E2E2DA] transition ink-shadow ink-shadow-hover"
              >
                Browse Marketplace
                <span className="transition group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="/builder"
                className="inline-flex items-center gap-3 border-2 border-[#0A0A0A] bg-[#E2E2DA] px-7 py-4 font-bold uppercase tracking-[0.22em] text-[#0A0A0A] transition ink-shadow ink-shadow-hover"
              >
                List a Model
              </Link>
            </div>
          </div>

          {/* Right column — sealed iNFT mock card */}
          <div className="relative lg:col-span-5">
            <div className="relative ml-auto max-w-md border-2 border-[#0A0A0A] bg-[#E2E2DA] p-6 ink-shadow">
              <div className="flex items-center justify-between border-b-2 border-[#0A0A0A] pb-4">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em]">
                  iNFT #00427
                </span>
                <span className="border-2 border-[#0A0A0A] bg-[#F64618] px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-[#E2E2DA]">
                  Sealed
                </span>
              </div>

              <div className="mt-5 space-y-2.5 font-mono text-xs">
                <Row k="model" v="phi-3-mini · LoRA r=16" />
                <Row k="domain" v="medical Q&A" />
                <Row k="weights" v="142.6 MB · AES-256-GCM" />
                <Row k="key.holder" v="0xa1…f3 (you)" highlight />
                <Row k="key.transfer" v="TEE → buyer on settle" />
                <Row k="price" v="5.000 OG" />
              </div>

              <div className="mt-6 border-2 border-[#0A0A0A] bg-[#0A0A0A] p-4 font-mono text-[11px] leading-6 text-[#E2E2DA]">
                <p className="text-[#E2E2DA]/60">
                  <span className="text-[#F64618]">$</span> wv infer
                  &lt;tokenId&gt;
                </p>
                <p>
                  → seal verified · key unwrapped · running on TEE
                  <span className="ml-1 inline-block h-3 w-1.5 -translate-y-[1px] animate-pulse bg-[#F64618] align-middle" />
                </p>
              </div>

              <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.22em] text-[#6A6A60]">
                0G Galileo · chain 16601
              </p>
            </div>

            {/* offset sticker */}
            <div className="absolute -left-6 -top-6 hidden h-24 w-24 -rotate-12 items-center justify-center border-2 border-[#0A0A0A] bg-[#E2E2DA] font-mono text-[9px] font-black uppercase leading-tight tracking-[0.2em] sm:flex">
              <div className="text-center">
                Buyer
                <br />
                only
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE TAPE */}
      <section className="overflow-hidden border-b-2 border-[#0A0A0A] bg-[#F64618] py-3">
        <div className="marquee-track flex whitespace-nowrap font-mono text-sm font-black uppercase tracking-[0.4em] text-[#E2E2DA]">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex shrink-0 gap-12 px-12">
              <span>Sealed</span>
              <span>·</span>
              <span>Signed</span>
              <span>·</span>
              <span>On-chain</span>
              <span>·</span>
              <span>ERC-7857</span>
              <span>·</span>
              <span>0G Galileo</span>
              <span>·</span>
              <span>TEE Inference</span>
              <span>·</span>
              <span>AES-256-GCM</span>
              <span>·</span>
              <span>Hackathon-grade</span>
              <span>·</span>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS — alternating split rows */}
      <section className="border-b-2 border-[#0A0A0A] px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#F64618]">
                §02 · How it works
              </p>
              <h2 className="mt-3 max-w-3xl text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl">
                Checkpoint →<br />
                <span className="text-[#F64618]">transferable</span> iNFT.
              </h2>
            </div>
            <p className="max-w-sm text-base leading-7 text-[#0A0A0A]/80">
              Four atomic moves. Encrypt before upload. Mint with the key
              envelope embedded. The whole flow is built so the seller
              <em> physically cannot</em> exfiltrate the model after sale.
            </p>
          </div>

          <ol className="mt-14 space-y-0">
            {steps.map((s, i) => (
              <li
                key={s.tag}
                className={`grid grid-cols-1 items-stretch border-b-2 border-[#0A0A0A] md:grid-cols-12 ${
                  i === 0 ? "border-t-2" : ""
                }`}
              >
                <div className="flex items-center gap-6 border-r-0 border-[#0A0A0A] px-6 py-8 md:col-span-2 md:border-r-2">
                  <span className="font-mono text-5xl font-black tabular-nums">
                    {s.tag}
                  </span>
                </div>
                <div
                  className={`flex flex-col justify-center px-6 py-8 md:col-span-7 ${
                    i % 2 === 1
                      ? "bg-[#F64618] text-[#E2E2DA]"
                      : "bg-[#E2E2DA]"
                  }`}
                >
                  <p
                    className={`font-mono text-[10px] font-bold uppercase tracking-[0.28em] ${
                      i % 2 === 1 ? "text-[#E2E2DA]/80" : "text-[#6A6A60]"
                    }`}
                  >
                    {s.layer}
                  </p>
                  <h3 className="mt-2 text-2xl font-black uppercase tracking-tight sm:text-3xl">
                    {s.title}
                  </h3>
                  <p
                    className={`mt-2 max-w-2xl text-sm leading-6 ${
                      i % 2 === 1 ? "text-[#E2E2DA]/90" : "text-[#0A0A0A]/85"
                    }`}
                  >
                    {s.desc}
                  </p>
                </div>
                <div className="flex items-center justify-end border-t-2 border-[#0A0A0A] px-6 py-8 font-mono text-[11px] uppercase tracking-[0.22em] md:col-span-3 md:border-t-0 md:border-l-2">
                  {s.spec}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* DEMO — two-wallet split */}
      <section className="border-b-2 border-[#0A0A0A] px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col items-start gap-3">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#F64618]">
              §03 · The 30-second demo
            </p>
            <h2 className="max-w-4xl text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl">
              Two wallets. One capability. <br />
              <span className="text-[#F64618]">Watch it move.</span>
            </h2>
          </div>

          <div className="grid gap-0 border-2 border-[#0A0A0A] md:grid-cols-2">
            <WalletPane
              who="A · Seller"
              addr="0xa1c4…f3"
              tone="ink"
              lines={[
                { kind: "cmd", text: "wv mint ./medical-lora.safetensors --price 5" },
                { kind: "ok", text: "✓ encrypted · uploaded to 0G · iNFT #00427 minted" },
                { kind: "cmd", text: "(buyer settled — control rotated)" },
                { kind: "cmd", text: "wv infer 00427 --prompt \"…\"" },
                { kind: "err", text: "✗ unauthorized: key holder is 0xB…" },
              ]}
            />
            <WalletPane
              who="B · Buyer"
              addr="0xb27d…ee"
              tone="accent"
              lines={[
                { kind: "cmd", text: "wv buy 00427" },
                { kind: "ok", text: "✓ payment settled · key re-encrypted in TEE" },
                { kind: "cmd", text: "wv infer 00427 --prompt \"What dose of…\"" },
                { kind: "ok", text: "✓ TEE attestation · 412 tok · 1.8s" },
                { kind: "ok", text: "✓ output: \"The recommended dose is…\"" },
              ]}
            />
          </div>

          <div className="mt-6 flex items-center gap-3 border-2 border-[#0A0A0A] bg-[#0A0A0A] px-5 py-3 font-mono text-xs uppercase tracking-[0.22em] text-[#E2E2DA]">
            <span className="h-2 w-2 rounded-full bg-[#F64618] pulse-dot" />
            outcome: capability moved from A to B, undeniably and atomically.
          </div>
        </div>
      </section>

      {/* STATS BANNER */}
      <section className="border-b-2 border-[#0A0A0A] bg-[#0A0A0A] px-6 py-20 text-[#E2E2DA]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#F64618]">
                {s.label}
              </p>
              <p className="mt-3 font-mono text-5xl font-black sm:text-6xl">
                {s.value}
              </p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#E2E2DA]/60">
                {s.note}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY UNIQUE — three pillars with one inverted */}
      <section className="border-b-2 border-[#0A0A0A] px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-start gap-3">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#F64618]">
              §04 · Why it wins
            </p>
            <h2 className="max-w-4xl text-4xl font-black uppercase leading-[0.92] tracking-tight sm:text-6xl">
              You <span className="text-[#F64618]">cannot</span>{" "}
              <span className="line-through decoration-[#F64618] decoration-4">
                replicate
              </span>{" "}
              this on Ethereum + IPFS.
            </h2>
          </div>

          <div className="mt-14 grid gap-0 border-2 border-[#0A0A0A] md:grid-cols-3">
            {pillars.map((p, i) => {
              const inverted = i === 1;
              return (
                <div
                  key={p.title}
                  className={`flex flex-col gap-4 border-b-2 border-[#0A0A0A] p-8 last:border-b-0 md:border-b-0 ${
                    i < 2 ? "md:border-r-2" : ""
                  } ${
                    inverted
                      ? "bg-[#F64618] text-[#E2E2DA]"
                      : "bg-[#E2E2DA] text-[#0A0A0A]"
                  }`}
                >
                  <span className="font-mono text-5xl font-black tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p
                    className={`font-mono text-[10px] font-bold uppercase tracking-[0.3em] ${
                      inverted ? "text-[#E2E2DA]/85" : "text-[#F64618]"
                    }`}
                  >
                    {p.kicker}
                  </p>
                  <h3 className="text-2xl font-black uppercase tracking-tight">
                    {p.title}
                  </h3>
                  <p
                    className={`text-sm leading-6 ${
                      inverted ? "text-[#E2E2DA]/90" : "text-[#0A0A0A]/85"
                    }`}
                  >
                    {p.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ-STYLE NUMBERED LIST */}
      <section className="border-b-2 border-[#0A0A0A] px-6 py-24">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[1fr_2fr]">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#F64618]">
              §05 · Answers
            </p>
            <h2 className="mt-3 text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-5xl">
              Things judges <span className="text-[#F64618]">always</span> ask.
            </h2>
          </div>
          <dl className="space-y-0 border-2 border-[#0A0A0A]">
            {faqs.map((f, i) => (
              <div
                key={f.q}
                className={`flex flex-col gap-2 px-6 py-5 ${
                  i > 0 ? "border-t-2 border-[#0A0A0A]" : ""
                }`}
              >
                <dt className="flex items-start gap-4 font-bold uppercase tracking-tight">
                  <span className="font-mono text-sm text-[#F64618]">
                    Q{String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-lg">{f.q}</span>
                </dt>
                <dd className="ml-10 text-sm leading-6 text-[#0A0A0A]/80">
                  {f.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* FINAL CTA — full bleed orange */}
      <section className="bg-[#F64618] px-6 py-24 text-[#E2E2DA]">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[2fr_1fr] md:items-center">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.32em] text-[#E2E2DA]/85">
              Ready when you are
            </p>
            <h2 className="mt-3 text-5xl font-black uppercase leading-[0.95] tracking-tight sm:text-7xl">
              Mint a model.
              <br />
              Watch it transfer.
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            <Link
              href="/builder"
              className="inline-flex items-center justify-between gap-3 border-2 border-[#0A0A0A] bg-[#0A0A0A] px-7 py-5 font-bold uppercase tracking-[0.22em] text-[#E2E2DA] transition hover:bg-[#E2E2DA] hover:text-[#0A0A0A]"
            >
              Open Builder <span>→</span>
            </Link>
            <Link
              href="/infts"
              className="inline-flex items-center justify-between gap-3 border-2 border-[#0A0A0A] bg-[#E2E2DA] px-7 py-5 font-bold uppercase tracking-[0.22em] text-[#0A0A0A] transition hover:bg-[#0A0A0A] hover:text-[#E2E2DA]"
            >
              See marketplace <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Row({
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
          highlight
            ? "font-bold text-[#F64618]"
            : "text-[#0A0A0A]"
        }
      >
        {v}
      </span>
    </div>
  );
}

type LineKind = "cmd" | "ok" | "err";

function WalletPane({
  who,
  addr,
  tone,
  lines,
}: {
  who: string;
  addr: string;
  tone: "ink" | "accent";
  lines: { kind: LineKind; text: string }[];
}) {
  const isAccent = tone === "accent";
  return (
    <div
      className={`flex flex-col border-[#0A0A0A] last:border-l-2 ${
        isAccent ? "bg-[#F64618] text-[#E2E2DA]" : "bg-[#E2E2DA] text-[#0A0A0A]"
      }`}
    >
      <div
        className={`flex items-center justify-between border-b-2 border-[#0A0A0A] px-5 py-3 font-mono text-[10px] uppercase tracking-[0.22em] ${
          isAccent ? "bg-[#0A0A0A] text-[#E2E2DA]" : "bg-[#0A0A0A] text-[#E2E2DA]"
        }`}
      >
        <span>wallet {who}</span>
        <span>{addr}</span>
      </div>
      <div className="space-y-2 px-5 py-6 font-mono text-[12px] leading-6">
        {lines.map((l, i) => (
          <p key={i} className="flex gap-2">
            <span
              className={
                isAccent ? "text-[#E2E2DA]/60" : "text-[#6A6A60]"
              }
            >
              {l.kind === "cmd" ? "$" : l.kind === "ok" ? "✓" : "✗"}
            </span>
            <span
              className={
                l.kind === "err"
                  ? isAccent
                    ? "font-bold text-[#0A0A0A]"
                    : "font-bold text-[#F64618]"
                  : ""
              }
            >
              {l.text}
            </span>
          </p>
        ))}
      </div>
    </div>
  );
}

const steps = [
  {
    tag: "01",
    layer: "off-chain · browser",
    title: "Upload & Encrypt",
    desc: "Pick a checkpoint, LoRA, or adapter. WeightVault encrypts it with AES-256-GCM client-side. Your raw weights never leave the browser unsealed.",
    spec: "AES-256-GCM",
  },
  {
    tag: "02",
    layer: "0G Storage",
    title: "Pin sealed blob",
    desc: "Encrypted blob pinned to 0G Storage with content-addressed proof. Cheap, durable, and indexed by the same chain that mints the iNFT.",
    spec: "0G Storage · 3× replicas",
  },
  {
    tag: "03",
    layer: "ERC-7857",
    title: "Mint as iNFT",
    desc: "The iNFT is the model. Metadata, capability tags, and a sealed-key envelope are bound to one transferable token following ERC-7857.",
    spec: "ERC-7857 token",
  },
  {
    tag: "04",
    layer: "TEE",
    title: "Sealed-key transfer",
    desc: "On sale, a TEE re-encrypts the AES key to the buyer's pubkey. Seller loses access. Buyer gains a working endpoint — atomically.",
    spec: "TEE attestation",
  },
];

const stats = [
  { label: "iNFTs minted", value: "142", note: "across 38 wallets" },
  { label: "Capability transfers", value: "67", note: "all on 0G Galileo" },
  { label: "Avg. settle time", value: "1.8s", note: "from buy → inference" },
  { label: "Replication factor", value: "3×", note: "encrypted on 0G Storage" },
];

const pillars = [
  {
    kicker: "Usable capability",
    title: "Not just a JPEG of a model",
    body: "Other marketplaces sell pointers. WeightVault sells inference rights — provable, exclusive, revoked on transfer. The token unlocks a working endpoint.",
  },
  {
    kicker: "Cryptographic exclusivity",
    title: "TEE-sealed key envelopes",
    body: "Decryption keys live inside attested enclaves and are re-encrypted to the new owner at settlement. No off-chain trust, no honor-system licenses.",
  },
  {
    kicker: "Chain-native settlement",
    title: "One tx, two outcomes",
    body: "Payment, ownership flip, and capability transfer settle atomically on 0G Galileo. The buyer's first inference call is the receipt.",
  },
];

const faqs = [
  {
    q: "What stops the seller from keeping a copy?",
    a: "Nothing stops them from keeping the ciphertext, but the AES key is sealed inside a TEE and is re-encrypted to the buyer's pubkey on sale. The seller's old key never decrypts the blob again — and the on-chain seal envelope is the authoritative key holder.",
  },
  {
    q: "Why ERC-7857 and not 721/1155?",
    a: "ERC-7857 attaches a transferable encrypted-key envelope to the token. That envelope is the whole point: the iNFT is not just a record of ownership — it is the only way to unwrap the model's AES key.",
  },
  {
    q: "Does inference happen on-chain?",
    a: "No. Inference runs in a TEE provider. The TEE attests to running the unwrapped key only on behalf of the current iNFT holder; the marketplace contract verifies the attestation on transfer.",
  },
  {
    q: "Why 0G Storage instead of IPFS?",
    a: "0G is co-located with the chain settling the iNFT, which means storage proofs and ownership state come from the same execution layer. IPFS pinning is honor-system; 0G is the same trust domain as the token.",
  },
];
