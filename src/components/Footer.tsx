import AgentDeedLogo from "./AgentDeedLogo";

export default function Footer() {
  return (
    <footer className="border-t border-[#0A0A0A] bg-[#E2E2DA]">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md border border-[#0A0A0A] bg-[#E2E2DA]">
              <AgentDeedLogo size={26} />
            </span>
            <span className="text-lg font-black tracking-tight">
              Agent<span className="text-[#F64618]">Deed</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-6 text-[#6A6A60]">
            Sealed-key marketplace for fine-tuned models. Sell a model, sell the
            ability to run it — only the buyer can.
          </p>
        </div>

        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#F64618]">
            Product
          </p>
          <ul className="mt-4 space-y-2 text-sm text-[#0A0A0A]/85">
            <li>
              <a href="/infts" className="hover:text-[#F64618]">
                Marketplace
              </a>
            </li>
            <li>
              <a href="/my-agents" className="hover:text-[#F64618]">
                My Models
              </a>
            </li>
            <li>
              <a href="/builder" className="hover:text-[#F64618]">
                Builder
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#F64618]">
            Stack
          </p>
          <ul className="mt-4 space-y-2 font-mono text-xs text-[#0A0A0A]/85">
            <li>ERC-7857 iNFT</li>
            <li>0G Storage</li>
            <li>TEE Inference</li>
            <li>Sealed-key transfer</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[#0A0A0A]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 text-xs text-[#6A6A60]">
          <p>© {new Date().getFullYear()} AgentDeed</p>
          <p className="font-mono uppercase tracking-[0.24em]">
            Sealed · Signed · On-chain
          </p>
        </div>
      </div>
    </footer>
  );
}
