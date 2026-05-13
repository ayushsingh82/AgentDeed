import VaultLogo from "./VaultLogo";

export default function Footer() {
  return (
    <footer className="border-t border-[#2a2a36] bg-[#0A0A0F]">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md border border-[#2a2a36] bg-[#14141b]">
              <VaultLogo size={26} />
            </span>
            <span className="text-lg font-black tracking-tight">
              Weight<span className="text-[#E0B65A]">Vault</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-6 text-[#8a8794]">
            Sealed-key marketplace for fine-tuned models. Sell a model, sell the
            ability to run it — only the buyer can.
          </p>
        </div>

        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#E0B65A]">
            Product
          </p>
          <ul className="mt-4 space-y-2 text-sm text-[#F5F2EB]/85">
            <li>
              <a href="/infts" className="hover:text-[#E0B65A]">
                Marketplace
              </a>
            </li>
            <li>
              <a href="/my-agents" className="hover:text-[#E0B65A]">
                My Models
              </a>
            </li>
            <li>
              <a href="/builder" className="hover:text-[#E0B65A]">
                Builder
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#E0B65A]">
            Stack
          </p>
          <ul className="mt-4 space-y-2 font-mono text-xs text-[#F5F2EB]/85">
            <li>ERC-7857 iNFT</li>
            <li>0G Storage</li>
            <li>TEE Inference</li>
            <li>Sealed-key transfer</li>
          </ul>
        </div>

        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#E0B65A]">
            Network
          </p>
          <ul className="mt-4 space-y-2 font-mono text-xs text-[#F5F2EB]/85">
            <li>0G Galileo</li>
            <li>Chain ID 16601</li>
            <li>evmrpc-testnet.0g.ai</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[#2a2a36]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 text-xs text-[#8a8794]">
          <p>© {new Date().getFullYear()} WeightVault</p>
          <p className="font-mono uppercase tracking-[0.24em]">
            Sealed · Signed · On-chain
          </p>
        </div>
      </div>
    </footer>
  );
}
