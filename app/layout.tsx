import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import links from "./data/links.json";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inland His Church",
  description: "Inland His Church - Home of the HIS App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <header className="absolute top-0 left-0 right-0 z-50">
          <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/">
              <Image
                src="/logo-white.png"
                alt="His Logo"
                width={48}
                height={24}
                className="h-6 w-auto"
              />
            </Link>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-white/10 bg-[#080312]">
          <div className="max-w-5xl mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
              <div className="space-y-3">
                <Image
                  src="/logo-white.png"
                  alt="His Logo"
                  width={64}
                  height={32}
                  className="h-8 w-auto opacity-40"
                />
                <p className="text-sm text-white/40 max-w-xs">
                  다시, 복음으로 — 인랜드 히즈 청년부
                </p>
              </div>
              <div className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-white/60 mb-1">소셜 미디어</span>
                {links.social.map((item) => (
                  <a
                    key={item.name}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/40 hover:text-primary transition-colors"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
              <div className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-white/60 mb-1">외부 링크</span>
                {links.external.map((item) => (
                  <a
                    key={item.name}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/40 hover:text-primary transition-colors"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
              <div className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-white/60 mb-1">Legal</span>
                <Link
                  href="/privacy-policy"
                  className="text-white/40 hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/delete-account"
                  className="text-white/40 hover:text-primary transition-colors"
                >
                  Delete Account
                </Link>
              </div>
              <div className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-white/60 mb-1">Contact</span>
                <a
                  href="tel:510-579-0192"
                  className="text-white/40 hover:text-primary transition-colors"
                >
                  Tel: 510-579-0192
                </a>
                <a
                  href="mailto:sean.kim@inlandchurch.org"
                  className="text-white/40 hover:text-primary transition-colors"
                >
                  sean.kim@inlandchurch.org
                </a>
              </div>
            </div>
            <div className="mt-10 pt-6 border-t border-white/10 text-center text-xs text-white/30">
              &copy; {new Date().getFullYear()} Inland His Church. All rights
              reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
