"use client";

/**
 * Gate for the learning area: tracks, maps and lessons are for signed-in
 * learners only.
 *
 * Honest note on what this is: a UX gate, not a security boundary. It decides
 * what the interface shows; the real protection for anything that matters
 * lives in firestore.rules, which is where progress, scores and profiles are
 * actually defended. Course text is the product, not a secret.
 */
import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLocale, useT } from "@/i18n/use-t";
import { RobotMascot } from "@/components/robot-mascot";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const locale = useLocale();
  const t = useT();

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-transparent"
          style={{ borderTopColor: "var(--neon)", borderRightColor: "var(--neon)" }}
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto grid max-w-lg place-items-center px-4 py-16 text-center">
        <RobotMascot
          mood="thinking"
          screenText={locale === "fr" ? "STOP" : "HOLD ON"}
          className="h-48 w-48"
        />
        <span
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-bold"
          style={{ borderColor: "var(--border)", background: "var(--bg-2)", color: "var(--neon)" }}
        >
          <LockKeyhole className="h-3.5 w-3.5" />
          {t("gate.badge")}
        </span>
        <h1 className="mt-3 text-2xl font-extrabold text-strong">{t("gate.title")}</h1>
        <p className="mt-2 text-muted">{t("gate.body")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href={`/${locale}/login`} className="btn-neon rounded-xl px-5 py-3 text-sm">
            {t("auth.signIn")}
          </Link>
          <Link
            href={`/${locale}`}
            className="rounded-xl border px-5 py-3 text-sm font-bold text-main transition hover:opacity-80"
            style={{ borderColor: "var(--border-strong)" }}
          >
            {t("track.back")}
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
