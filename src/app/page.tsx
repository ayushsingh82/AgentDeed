import Link from "next/link";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-[#0A0A0F] text-[#F5F2EB]">
      <NavBar />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-[#2a2a36]">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A0A0F]" />

        <div className="relative mx-auto grid max-w-7xl gap-14 px-6 py-24 lg:grid-cols-[1.15fr_0.85fr] lg:py-32">
          <div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 border border-[#E0B65A]/40 bg-[#E0B65A]/[0.06] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#E0B65A]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E0B65A] seal-pulse" />
                ERC-7857 · sealed-key transfer
              </span>
            </div>

            <h1 className="mt-8 text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
              The model{" "}
              <span className="text-[#E0B65A]">
                <em className="not-italic">is</em>
              </span>{" "}
              the iNFT.
              <span className="mt-3 block text-[#8a8794]">
                Sell weights. Lose access.
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-[#F5F2EB]/85">
              List your LoRA, fine-tune, or adapter on WeightVault. Encrypted
              weights live on{" "}
              <span className="font-mono text-[#E0B65A]">0G Storage</span>. The
              iNFT <em>is</em> the model — buy it and the sealed key transfers
              inside a TEE, so only you can run inference. Sell it and your
              endpoint goes dark.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/infts"
                className="group inline-flex items-center gap-3 border-2 border-[#E0B65A] bg-[#E0B65A] px-7 py-4 font-bold uppercase tracking-[0.22em] text-[#0A0A0F] transition hover:bg-[#F0CB7A]"
              >
                Browse Marketplace
                <span className="transition group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="/builder"
                className="inline-flex items-center gap-3 border-2 border-[#2a2a36] bg-transparent px-7 py-4 font-bold uppercase tracking-[0.22em] text-[#F5F2EB] transition hover:border-[#E0B65A] hover:text-[#E0B65A]"
              >
                List a Model
              </Link>
            </div>

            <dl className="mt-14 grid max-w-xl grid-cols-3 gap-6 border-t border-[#2a2a36] pt-8">
              <div>
                <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#8a8794]">
                  Standard
                </dt>
                <dd className="mt-1 font-mono text-base font-black text-[#E0B65A]">
                  ERC-7857
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#8a8794]">
                  Storage
                </dt>
                <dd className="mt-1 font-mono text-base font-black text-[#E0B65A]">
                  0G
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#8a8794]">
                  Inference
                </dt>
                <dd className="mt-1 font-mono text-base font-black text-[#E0B65A]">
                  TEE
                </dd>
              </div>
            </dl>
          </div>

          {/* Sealed-vault visual card */}
          <div className="relative">
            <div className="relative border border-[#2a2a36] bg-[#14141b] p-6 seal-shadow">
              <div className="flex items-center justify-between border-b border-[#2a2a36] pb-4">
                <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#8a8794]">
                  <span className="h-2 w-2 rounded-full bg-[#E0B65A]" />
                  weight-vault://lora-7b/abf3
                </div>
                <span className="border border-[#E0B65A]/40 bg-[#E0B65A]/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-[#E0B65A]">
                  Sealed
                </span>
              </div>

              <div className="mt-5 space-y-3 font-mono text-xs">
                <Row k="model" v="phi-3-mini · LoRA r=16" />
                <Row k="domain" v="medical-Q&A" />
                <Row k="weights" v="142.6 MB · AES-256-GCM" />
                <Row k="key.holder" v="0xa1…f3 (you)" highlight />
                <Row k="key.transfer" v="TEE → buyer on settle" />
                <Row k="price" v="5.000 OG" />
              </div>

              <div className="mt-6 border border-[#2a2a36] bg-[#0A0A0F] p-4 font-mono text-[11px] leading-6 text-[#F5F2EB]/85">
                <p className="text-[#8a8794]">
                  <span className="text-[#E0B65A]">$</span> wv infer
                  &lt;tokenId&gt;
                </p>
                <p>
                  → seal verified · key unwrapped · running on TEE…
                  <span className="ml-1 inline-block h-3 w-1.5 -translate-y-[1px] animate-pulse bg-[#E0B65A] align-middle" />
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-[#2a2a36] pt-4 text-[10px] font-mono uppercase tracking-[0.22em] text-[#8a8794]">
                <span>iNFT #00427</span>
                <span>0G Galileo · 16601</span>
              </div>
            </div>

            <div className="absolute -bottom-5 -right-5 hidden h-24 w-24 rotate-12 items-center justify-center border-2 border-[#B73A3A] bg-[#B73A3A]/[0.08] font-mono text-[9px] font-black uppercase leading-tight tracking-[0.2em] text-[#B73A3A] sm:flex">
              <div className="text-center">
                Buyer
                <br />
                only
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-b border-[#2a2a36] px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-start gap-3">
            <span className="border border-[#E0B65A]/40 bg-[#E0B65A]/[0.06] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#E0B65A]">
              How it works
            </span>
            <h2 className="max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">
              Four moves from{" "}
              <span className="text-[#E0B65A]">trained checkpoint</span> to{" "}
              <span className="text-[#E0B65A]">transferable iNFT</span>.
            </h2>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div
                key={s.tag}
                className="group border border-[#2a2a36] bg-[#14141b] p-6 transition hover:border-[#E0B65A]"
              >
                <div className="flex items-start justify-between">
                  <span className="border border-[#E0B65A]/50 px-2 py-1 font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#E0B65A]">
                    {s.tag}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#8a8794]">
                    {s.layer}
                  </span>
                </div>
                <p className="mt-6 text-lg font-bold">{s.title}</p>
                <p className="mt-3 text-sm leading-6 text-[#F5F2EB]/75">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEMO STRIP */}
      <section className="border-b border-[#2a2a36] px-6 py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <span className="border border-[#B73A3A]/50 bg-[#B73A3A]/[0.08] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#B73A3A]">
              The 30-second demo
            </span>
            <h2 className="mt-6 text-3xl font-black leading-tight tracking-tight sm:text-5xl">
              Two wallets.{" "}
              <span className="text-[#E0B65A]">One usable capability.</span>{" "}
              Watch it move.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#F5F2EB]/80">
              Wallet A mints a LoRA, lists it at 5 OG. Wallet B buys. Wallet A
              tries to run inference — sealed key is gone, request fails.
              Wallet B runs it — success. Undeniable. You cannot replicate this
              on Ethereum + IPFS.
            </p>
          </div>

          <div className="border border-[#2a2a36] bg-[#14141b] font-mono text-xs">
            <div className="flex items-center gap-2 border-b border-[#2a2a36] bg-[#0A0A0F] px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-[#8a8794]">
              <span className="h-2 w-2 rounded-full bg-[#B73A3A]" />
              <span className="h-2 w-2 rounded-full bg-[#E0B65A]" />
              <span className="h-2 w-2 rounded-full bg-[#7BBF6A]" />
              <span className="ml-3">demo.session</span>
            </div>
            <div className="space-y-2 p-5 leading-6">
              <p>
                <span className="text-[#8a8794]">[wallet A]</span>{" "}
                <span className="text-[#E0B65A]">$</span> wv mint
                ./medical-lora.safetensors --price 5
              </p>
              <p className="text-[#7BBF6A]">
                ✓ encrypted · uploaded to 0G · iNFT #00427 minted
              </p>
              <p>
                <span className="text-[#8a8794]">[wallet B]</span>{" "}
                <span className="text-[#E0B65A]">$</span> wv buy 00427
              </p>
              <p className="text-[#7BBF6A]">
                ✓ payment settled · sealed key re-encrypted to 0xB…
              </p>
              <p>
                <span className="text-[#8a8794]">[wallet A]</span>{" "}
                <span className="text-[#E0B65A]">$</span> wv infer 00427
                --prompt &quot;…&quot;
              </p>
              <p className="text-[#B73A3A]">
                ✗ unauthorized: key holder is 0xB…
              </p>
              <p>
                <span className="text-[#8a8794]">[wallet B]</span>{" "}
                <span className="text-[#E0B65A]">$</span> wv infer 00427
                --prompt &quot;…&quot;
              </p>
              <p className="text-[#7BBF6A]">
                ✓ TEE attestation · 412 tok · 1.8s
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY UNIQUE */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-start gap-3">
            <span className="border border-[#E0B65A]/40 bg-[#E0B65A]/[0.06] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#E0B65A]">
              Why it wins
            </span>
            <h2 className="max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">
              You{" "}
              <span className="text-[#B73A3A] line-through decoration-2">
                cannot
              </span>{" "}
              build this on Ethereum + IPFS.
            </h2>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {pillars.map((p) => (
              <div
                key={p.title}
                className="border border-[#2a2a36] bg-[#14141b] p-7 transition hover:border-[#E0B65A]"
              >
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#E0B65A]">
                  {p.kicker}
                </p>
                <p className="mt-4 text-xl font-black">{p.title}</p>
                <p className="mt-3 text-sm leading-6 text-[#F5F2EB]/75">
                  {p.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 flex flex-col items-center justify-between gap-6 border border-[#E0B65A]/40 bg-[#E0B65A]/[0.05] p-8 md:flex-row">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#E0B65A]">
                Ready when you are
              </p>
              <p className="mt-2 text-xl font-black">
                List your first model in under five minutes.
              </p>
            </div>
            <Link
              href="/builder"
              className="inline-flex items-center gap-3 border-2 border-[#E0B65A] bg-[#E0B65A] px-7 py-4 font-bold uppercase tracking-[0.22em] text-[#0A0A0F] transition hover:bg-[#F0CB7A]"
            >
              Open Builder →
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

const steps = [
  {
    tag: "01",
    layer: "off-chain",
    title: "Upload & encrypt",
    desc: "Pick a checkpoint, LoRA, or adapter. WeightVault encrypts with AES-256-GCM client-side. Your raw weights never leave the browser unsealed.",
  },
  {
    tag: "02",
    layer: "0G storage",
    title: "Store on 0G",
    desc: "Encrypted blob pinned to 0G Storage with content-addressed proof. Cheap, durable, and indexed by the same chain that mints the iNFT.",
  },
  {
    tag: "03",
    layer: "ERC-7857",
    title: "Mint as iNFT",
    desc: "The iNFT is the model. Metadata, capability tags, and a sealed-key envelope are bound to one transferable token following ERC-7857.",
  },
  {
    tag: "04",
    layer: "TEE",
    title: "Sealed-key transfer",
    desc: "On sale, a TEE re-encrypts the AES key to the buyer's pubkey. Seller loses access. Buyer gains a working endpoint — atomically.",
  },
];

const pillars = [
  {
    kicker: "Useable capability",
    title: "Not just a JPEG of a model",
    body: "Other marketplaces sell pointers. WeightVault sells inference rights — provable, exclusive, revoked on transfer. The token unlocks a working model.",
  },
  {
    kicker: "Cryptographic exclusivity",
    title: "TEE-sealed key envelopes",
    body: "Decryption keys live inside attested enclaves and are re-encrypted to the new owner at settlement. No off-chain trust, no honor-system licenses.",
  },
  {
    kicker: "Chain-native settlement",
    title: "One transaction, two outcomes",
    body: "Payment, ownership flip, and capability transfer settle atomically on 0G Galileo. The buyer's first inference call is the receipt.",
  },
];
