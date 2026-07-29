import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AxiLearn",
  description: "Learn to build intelligent machines — AI, robotics and games.",
};

/**
 * Root shell. The real layout (header, auth, locale) lives in
 * src/app/[locale]/layout.tsx -- everything a visitor sees sits under a
 * language segment, so /en/... and /fr/... are fully separate, shareable URLs.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
