import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgentDeed — sealed-key marketplace for fine-tuned models",
  description:
    "List your LoRA / fine-tune / adapter. Encrypted weights on 0G Storage. The iNFT is the model. Buy it → sealed key transfers → only you can run inference.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#E2E2DA] text-[#0A0A0A]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
