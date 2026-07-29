import type { Metadata } from "next";
import { Fredoka, Orbitron } from "next/font/google";
import "./globals.css";
import { ThemeScript } from "@/lib/theme";

/** Rounded, friendly type for everything the learner reads. */
const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/** Techy display face -- used only for what the robot shows on its screen. */
const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["600", "800"],
});

export const metadata: Metadata = {
  title: "AxiLearn — Robotics, AI & Games",
  description:
    "Learn robotics, artificial intelligence and game creation by building real things.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${fredoka.variable} ${orbitron.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
