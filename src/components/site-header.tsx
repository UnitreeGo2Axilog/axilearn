"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Shield, UserRound } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLocale, useT } from "@/i18n/use-t";
import { LOCALES } from "@/i18n/messages";

/** Top bar: logo, language switch, and sign-in / profile. */
export function SiteHeader() {
  const locale = useLocale();
  const t = useT();
  const pathname = usePathname();
  const { user, profile, logout, loading } = useAuth();

  /** Same page, other language: swap the first path segment. */
  const swapLocale = (next: string) => {
    const rest = pathname.split("/").slice(2).join("/");
    return `/${next}${rest ? `/${rest}` : ""}`;
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link href={`/${locale}`} className="flex items-center gap-2 font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white">
            A
          </span>
          <span className="text-lg">{t("app.name")}</span>
        </Link>

        <div className="ml-auto flex items-center gap-3">
          <div className="flex overflow-hidden rounded-md border border-slate-200 text-xs font-medium">
            {LOCALES.map((l) => (
              <Link
                key={l}
                href={swapLocale(l)}
                className={`px-2.5 py-1.5 uppercase transition ${
                  l === locale
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                {l}
              </Link>
            ))}
          </div>

          {!loading && profile?.role === "admin" && (
            <Link
              href={`/${locale}/admin`}
              className="hidden items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 sm:flex"
            >
              <Shield className="h-4 w-4" />
              {t("nav.admin")}
            </Link>
          )}

          {!loading && user ? (
            <div className="flex items-center gap-2">
              <Link
                href={`/${locale}/profile`}
                className="flex items-center gap-1.5 text-sm text-slate-700 hover:text-slate-900"
              >
                <UserRound className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {profile?.displayName ?? t("nav.profile")}
                </span>
              </Link>
              <button
                onClick={() => logout()}
                aria-label={t("nav.signOut")}
                className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            !loading && (
              <Link
                href={`/${locale}/login`}
                className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
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
