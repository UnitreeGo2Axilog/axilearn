"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Shield, UserRound } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLocale, useT } from "@/i18n/use-t";
import { LOCALES } from "@/i18n/messages";

/** Top bar in the dark neon language: logo mark, language switch, account. */
export function SiteHeader() {
  const locale = useLocale();
  const t = useT();
  const pathname = usePathname();
  const { user, profile, logout, loading } = useAuth();

  // The mission map has its own HUD -- don't stack two headers on it.
  if (pathname?.includes("/roadmap")) return null;

  const swapLocale = (next: string) => {
    const rest = pathname.split("/").slice(2).join("/");
    return `/${next}${rest ? `/${rest}` : ""}`;
  };

  return (
    <header className="sticky top-0 z-40 border-b border-cyan-400/15 bg-[#050914]/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <span
            className="grid h-8 w-8 place-items-center rounded-lg font-robot text-sm font-black text-[#04121a]"
            style={{ background: "linear-gradient(135deg,#22d3ee,#a3e635)", boxShadow: "0 0 16px rgba(34,211,238,.5)" }}
          >
            A
          </span>
          <span className="font-robot text-base font-bold tracking-[0.14em] text-cyan-300 text-glow">
            AXILEARN
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-3">
          <div className="flex overflow-hidden rounded-lg border border-cyan-400/25 text-xs font-bold">
            {LOCALES.map((l) => (
              <Link
                key={l}
                href={swapLocale(l)}
                className={`px-2.5 py-1.5 uppercase transition ${
                  l === locale
                    ? "bg-cyan-400 text-[#04121a]"
                    : "bg-transparent text-slate-400 hover:bg-white/5"
                }`}
              >
                {l}
              </Link>
            ))}
          </div>

          {!loading && profile?.role === "admin" && (
            <Link
              href={`/${locale}/admin`}
              className="hidden items-center gap-1.5 text-sm text-slate-400 transition hover:text-cyan-300 sm:flex"
            >
              <Shield className="h-4 w-4" />
              {t("nav.admin")}
            </Link>
          )}

          {!loading && user ? (
            <div className="flex items-center gap-2">
              <Link
                href={`/${locale}/profile`}
                className="flex items-center gap-1.5 text-sm text-slate-300 transition hover:text-cyan-300"
              >
                <UserRound className="h-4 w-4" />
                <span className="hidden sm:inline">{profile?.displayName ?? t("nav.profile")}</span>
              </Link>
              <button
                onClick={() => logout()}
                aria-label={t("nav.signOut")}
                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-cyan-300"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            !loading && (
              <Link
                href={`/${locale}/login`}
                className="btn-neon rounded-lg px-3.5 py-1.5 text-sm font-bold transition"
              >
                {t("nav.signIn")}
              </Link>
            )
          )}
        </div>
      </div>
    </header>
  );
}
