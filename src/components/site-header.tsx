"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLocale, useT } from "@/i18n/use-t";
import { LOCALES } from "@/i18n/messages";
import { ThemeToggle } from "@/components/theme-toggle";
import { AccountMenu } from "@/components/account-menu";

/**
 * Top bar: logo mark, theme, language, and the account menu.
 *
 * The account area used to be loose links -- profile, admin, sign out -- which
 * is fine at three and breaks at nine. It all lives under the avatar now, so
 * the platform can grow pages without the header growing with it.
 */
export function SiteHeader() {
  const locale = useLocale();
  const t = useT();
  const pathname = usePathname();
  const { user, loading } = useAuth();

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

          {!loading && user ? (
            <AccountMenu />
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
