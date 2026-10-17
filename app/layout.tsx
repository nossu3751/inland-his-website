import type { Metadata, Viewport } from "next";
import { COPY } from "./content";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.inlandhis.com"),
  title: COPY.ko.meta.title,
  description: COPY.ko.meta.description,
  alternates: { canonical: "/", languages: { ko: "/", en: "/en" } },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
