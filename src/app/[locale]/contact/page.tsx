import { getT, isLocale } from "@/i18n/messages";
import type { Locale } from "@/content/types";
import { Mail, MessageCircle } from "lucide-react";
import Link from "next/link";

/**
 * How to reach a human.
 *
 * A mailto rather than a form on purpose. A form needs somewhere to put the
 * message, which means a new Firestore collection, new security rules, and a
 * screen for the supervisor to read them -- a small feature pretending to be
 * a smaller one. Until that exists, a link that certainly works beats a form
 * that might silently fail.
 *
 * SUPPORT_EMAIL is the one line to change to point this somewhere else.
 */
export const SUPPORT_EMAIL = "contact@axilearn.local";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const t = getT(locale);

  return (
    <div className="relative z-10 mx-auto max-w-2xl px-4 pb-20 pt-8">
      <header className="mb-6">
        <h1 className="flex items-center gap-2.5 text-3xl font-extrabold tracking-tight text-strong">
          <MessageCircle className="h-7 w-7" style={{ color: "var(--neon)" }} />
          {t("nav.contact")}
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{t("contact.intro")}</p>
      </header>

      <a
        href={`mailto:${SUPPORT_EMAIL}`}
        className="panel flex items-center gap-3.5 rounded-2xl p-4 transition hover:opacity-90"
      >
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
          style={{ background: "color-mix(in srgb, var(--neon) 16%, transparent)", color: "var(--neon)" }}
        >
          <Mail className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-extrabold text-strong">{t("contact.emailUs")}</span>
          <span className="mt-0.5 block truncate text-xs text-muted">{SUPPORT_EMAIL}</span>
        </span>
      </a>

      <div className="panel mt-4 rounded-2xl p-4">
        <p className="text-sm font-bold text-strong">{t("contact.stuckTitle")}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted">{t("contact.stuckBody")}</p>
        <Link
          href={`/${locale}`}
          className="mt-3 inline-flex rounded-lg border px-3 py-1.5 text-xs font-bold text-main"
          style={{ borderColor: "var(--border-strong)" }}
        >
          {t("bookmarks.browse")}
        </Link>
      </div>
    </div>
  );
}
