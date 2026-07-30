"use client";

/**
 * The certificate for finishing a track, and the locked state before that.
 *
 * Eligibility is 100% of the track's PUBLISHED lessons completed -- every one
 * of them, not a subset -- which is why the locked state literally says
 * "complete the mandatory lessons": there is no optional-lesson concept on
 * this platform, so every lesson in the track is mandatory by definition.
 *
 * This checks eligibility again on its own, independently of how someone
 * arrived here. The roadmap only offers the certificate link once it already
 * knows the track is complete, but a learner can still type the URL directly,
 * so the gate has to hold here too, not just at the link.
 */
import Link from "next/link";
import { Award, ArrowLeft, Lock, Printer } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useProgress } from "@/lib/progress-context";
import { useLocale, useT } from "@/i18n/use-t";
import type { RoadmapTrack } from "@/content/roadmap-data";

export function CertificateView({ track }: { track: RoadmapTrack }) {
  const t = useT();
  const locale = useLocale();
  const { profile } = useAuth();
  const { records, completedIds } = useProgress();

  const total = track.levels.length;
  const done = track.levels.filter((l) => completedIds.has(l.id)).length;
  const remaining = total - done;
  const eligible = total > 0 && remaining === 0;

  if (!eligible) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <span
          className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl"
          style={{ background: "var(--bg-2)", color: "var(--text-faint)" }}
        >
          <Lock className="h-7 w-7" />
        </span>
        <h1 className="mb-2 text-xl font-extrabold text-strong">{t("cert.lockedTitle")}</h1>
        <p className="mb-1 text-sm leading-relaxed text-muted">{t("cert.lockedBody")}</p>
        <p className="mb-6 text-sm font-bold" style={{ color: track.color }}>
          {done}/{total} · {remaining} {remaining === 1 ? t("cert.oneLeft") : t("cert.moreLeft")}
        </p>
        <Link
          href={`/${locale}/roadmap/${track.id}`}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-black"
          style={{ background: track.color, color: "var(--surface-solid)" }}
        >
          <ArrowLeft className="h-4 w-4" />
          {t("cert.backToMap")}
        </Link>
      </div>
    );
  }

  const trackXp = records
    .filter((r) => r.trackId === track.id)
    .reduce((sum, r) => sum + (r.xp ?? 0), 0);
  const latest = records
    .filter((r) => r.trackId === track.id)
    .reduce((max, r) => Math.max(max, r.completedAt), 0);
  // `latest` is 0 only in the instant between completedIds saying "complete"
  // and records finishing their own fetch -- never a real certificate state.
  // No Date.now() fallback here: reading the clock during render is impure.
  const dateLabel = latest
    ? new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "numeric" }).format(
        latest,
      )
    : "";

  const name = profile?.displayName ?? "Learner";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href={`/${locale}/roadmap/${track.id}`}
        className="no-print mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition hover:opacity-80"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("cert.backToMap")}
      </Link>

      {/* the printable sheet */}
      <div
        className="certificate-sheet relative overflow-hidden rounded-3xl border-2 p-8 text-center sm:p-12"
        style={{
          borderColor: `${track.color}66`,
          background: "var(--surface-solid)",
          boxShadow: `0 0 60px ${track.color}22`,
        }}
      >
        {/* corner glow -- decorative only, dropped in print */}
        <span
          aria-hidden
          className="no-print pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-20 blur-3xl"
          style={{ background: track.color }}
        />

        <span
          className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl"
          style={{ background: `color-mix(in srgb, ${track.color} 16%, transparent)`, color: track.color }}
        >
          <Award className="h-8 w-8" />
        </span>

        <p className="font-robot text-[11px] font-bold uppercase tracking-[0.3em] text-faint">
          AxiLearn
        </p>
        <h1 className="mt-2 text-2xl font-extrabold text-strong sm:text-3xl">
          {t("cert.title")}
        </h1>

        <p className="mt-8 text-sm text-muted">{t("cert.thisCertifies")}</p>
        <p
          className="mt-2 text-3xl font-extrabold sm:text-4xl"
          style={{ color: track.color, fontFamily: "var(--font-robot)" }}
        >
          {name}
        </p>

        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted">
          {t("cert.hasCompleted")} <span className="font-bold text-main">{track.title}</span>
        </p>

        <div className="mx-auto mt-8 flex max-w-sm items-center justify-center gap-6 border-t pt-6 text-xs" style={{ borderColor: "var(--border)" }}>
          <div>
            <p className="font-robot text-lg font-bold" style={{ color: track.color }}>
              {total}
            </p>
            <p className="text-faint">{t("cert.lessons")}</p>
          </div>
          <div>
            <p className="font-robot text-lg font-bold" style={{ color: "var(--reward)" }}>
              {trackXp}
            </p>
            <p className="text-faint">XP</p>
          </div>
          <div>
            <p className="font-robot text-sm font-bold text-main">{dateLabel}</p>
            <p className="text-faint">{t("cert.date")}</p>
          </div>
        </div>
      </div>

      <button
        onClick={() => window.print()}
        className="no-print mx-auto mt-6 flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-black"
        style={{ background: track.color, color: "var(--surface-solid)" }}
      >
        <Printer className="h-4 w-4" />
        {t("cert.print")}
      </button>
    </div>
  );
}
