"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Shield, UserRound } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLocale, useT } from "@/i18n/use-t";
import { LOCALES } from "@/i18n/messages";
import { ThemeToggle } from "@/components/theme-toggle";
import { Tooltip } from "@/components/tooltip";

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
    <header className="sticky top-0 z-40 border-b backdrop-blur-md"
      style={{ borderColor: "var(--border)", background: "color-mix(in srgb, var(--bg) 85%, transparent)" }}>
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <span
            className="grid h-8 w-8 place-items-center rounded-lg font-robot text-sm font-black text-[#04121a]"
            style={{ background: "linear-gradient(135deg, var(--neon), var(--cleared))", boxShadow: "var(--glow-1)" }}
          >
            A
          </span>
          <span className="font-robot text-base font-bold tracking-[0.14em] text-glow"
            style={{ color: "var(--neon)" }}>
            AXILEARN
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle />

          <div className="flex overflow-hidden rounded-lg border text-xs font-bold"
            style={{ borderColor: "var(--border-strong)" }}>
            {LOCALES.map((l) => (
              <Link
                key={l}
                href={swapLocale(l)}
                className="px-2.5 py-1.5 uppercase transition"
                style={
                  l === locale
                    ? { background: "var(--neon)", color: "var(--surface-solid)" }
                    : { color: "var(--text-muted)" }
                }
              >
                {l}
              </Link>
            ))}
          </div>

          {!loading && profile?.role === "admin" && (
            <Link
              href={`/${locale}/admin`}
              className="hidden items-center gap-1.5 text-sm text-muted transition hover:opacity-80 sm:flex"
            >
              <Shield className="h-4 w-4" />
              {t("nav.admin")}
            </Link>
          )}

          {!loading && user ? (
            <div className="flex items-center gap-2">
              <Tooltip label={profile?.displayName ?? t("nav.profile")}>
                <Link
                  href={`/${locale}/profile`}
                  className="flex items-center gap-1.5 text-sm text-main transition hover:opacity-80"
                >
                  <UserRound className="h-4 w-4" />
                  <span className="hidden sm:inline">{profile?.displayName ?? t("nav.profile")}</span>
                </Link>
              </Tooltip>
              <Tooltip label={t("nav.signOut")}>
                <button
                  onClick={() => logout()}
                  aria-label={t("nav.signOut")}
                  className="rounded-lg p-1.5 text-faint transition hover:opacity-80"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </Tooltip>
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
