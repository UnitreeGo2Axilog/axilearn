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
import { certificateId } from "@/lib/certificate";
import { useProgress } from "@/lib/progress-context";
import { useLocale, useT } from "@/i18n/use-t";
import { certificateStatus } from "@/lib/certificate";
import type { RoadmapTrack } from "@/content/roadmap-data";

export function CertificateView({
  track,
  examId,
}: {
  track: RoadmapTrack;
  /** The track's final exam, when it has one. */
  examId?: string;
}) {
  const t = useT();
  const locale = useLocale();
  const { profile, user } = useAuth();
  const { records, completedIds, solvedChallengeIds } = useProgress();

  const status = certificateStatus(
    track,
    completedIds,
    examId ? { id: examId, solved: solvedChallengeIds.has(examId) } : null,
  );
  const { total, done, remaining, earned } = status;

  if (!earned) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <span
          className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl"
          style={{ background: "var(--bg-2)", color: "var(--text-faint)" }}
        >
          <Lock className="h-7 w-7" />
        </span>
        <h1 className="mb-2 text-xl font-extrabold text-strong">{t("cert.lockedTitle")}</h1>
        {/* Two different reasons to be here, and they need different
            instructions. Telling somebody who has read every chapter to "go
            and finish the lessons" would be wrong and infuriating. */}
        {status.lessonsComplete && status.examRequired ? (
          <>
            <p className="mb-1 text-sm leading-relaxed text-muted">{t("cert.examLeft")}</p>
            <Link
              href={`/${locale}/challenges/${track.id}?start=${examId}`}
              className="mt-4 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-black"
              style={{ background: track.color, color: "var(--surface-solid)" }}
            >
              {t("cert.takeExam")}
            </Link>
          </>
        ) : (
          <p className="mb-1 text-sm leading-relaxed text-muted">
            {t("cert.lockedBody").replace("{track}", track.title)}
          </p>
        )}
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

  // Derived, not random: the same learner and track must always produce the

  // same id, or a reprinted certificate contradicts the one handed in.

  const certId = certificateId(user?.uid ?? name, track.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href={`/${locale}/roadmap/${track.id}`}
        className="no-print mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition hover:opacity-80"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("cert.backToMap")}
      </Link>

      {/*
        The sheet.

        Modelled on how a real training certificate is laid out -- issuer at
        the top, a plain sentence, the name large, what it was for, a
        signature block, and an id at the foot -- because this is a document
        somebody shows a teacher or attaches to an application. Centred
        rainbow gradients look like a game reward; this has to look like a
        record.

        White and near-black regardless of the site theme: a certificate that
        arrives dark grey because the reader had dark mode on is not a
        certificate.
      */}
      <div
        className="certificate-sheet relative overflow-hidden rounded-lg border"
        style={{ borderColor: "#d7dce2", background: "#ffffff", color: "#111418" }}
      >
        {/* the issuer's colour, as a spine rather than a decoration */}
        <span aria-hidden className="absolute left-0 top-0 h-full w-[10px]" style={{ background: track.color }} />

        <div className="px-8 py-10 pl-12 sm:px-14 sm:pl-16">
          <div className="flex items-center gap-2">
            <span
              className="grid h-6 w-6 place-items-center rounded"
              style={{ background: track.color, color: "#fff" }}
            >
              <Award className="h-3.5 w-3.5" />
            </span>
            <span className="font-robot text-[13px] font-black tracking-[0.14em]">AXILEARN</span>
          </div>

          <h1 className="mt-8 text-[19px] font-bold sm:text-[22px]">{t("cert.title")}</h1>

          <p className="mt-8 text-[13px]" style={{ color: "#5a626b" }}>
            {t("cert.thisCertifies")}
          </p>
          <p className="mt-1 text-[30px] font-extrabold leading-tight sm:text-[38px]">{name}</p>

          <p className="mt-6 text-[13px]" style={{ color: "#5a626b" }}>
            {t("cert.hasCompleted")}
          </p>
          <p className="mt-1 text-[16px] font-bold sm:text-[18px]">{track.title}</p>

          {/* Signature. Deliberately the platform, not a person -- signing a
              record with a human name nobody actually signed would make it a
              forgery, however good it looked. */}
          <div className="mt-12 flex flex-wrap items-end justify-between gap-8">
            <div>
              <p className="text-[22px] italic" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                AxiLearn
              </p>
              <div className="mt-1 w-52 border-t" style={{ borderColor: "#111418" }} />
              <p className="mt-1 text-[11px] font-bold">{t("cert.issuedBy")}</p>
              <p className="text-[11px]" style={{ color: "#5a626b" }}>{t("cert.issuer")}</p>
            </div>

            <div className="text-right text-[10px]" style={{ color: "#5a626b" }}>
              <p>{t("cert.date")}: {dateLabel}</p>
              <p className="mt-0.5 font-robot">{t("cert.id")}: {certId}</p>
              <p className="mt-0.5">{total} {t("cert.lessons")} · {trackXp} XP</p>
            </div>
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
