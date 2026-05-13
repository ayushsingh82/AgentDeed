"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import VaultLogo from "./VaultLogo";

const links = [
  { label: "Marketplace", href: "/infts" },
  { label: "My Models", href: "/my-agents" },
  { label: "Builder", href: "/builder" },
];

export default function NavBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-[#0A0A0A] bg-[#E2E2DA]/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md border border-[#0A0A0A] bg-[#E2E2DA]">
            <VaultLogo size={26} />
          </span>
          <span className="text-xl font-black tracking-tight sm:text-2xl">
            Weight<span className="text-[#F64618]">Vault</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[12px] font-bold uppercase tracking-[0.22em] text-[#0A0A0A] transition hover:text-[#F64618]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center">
          <ConnectButton
            accountStatus={{ smallScreen: "avatar", largeScreen: "full" }}
            chainStatus="icon"
            showBalance={false}
          />
        </div>
      </div>
    </header>
  );
}
