"use client";

/**
 * Every certificate at once: the ones earned, and the ones still owed work.
 *
 * Locked entries are shown rather than hidden, with what is left to do. A
 * page listing only what you have already achieved is empty on the day it
 * matters most -- the first one -- and says nothing about how to change that.
 */
import { LiveBackground } from "@/components/live-background";
import Link from "next/link";
import { Award, Lock } from "lucide-react";
import type { RoadmapTrack } from "@/content/roadmap-data";
import { useProgress } from "@/lib/progress-context";
import { certificateStatus } from "@/lib/certificate";
import { useLocale, useT } from "@/i18n/use-t";

export function CertificatesView({ tracks }: { tracks: RoadmapTrack[] }) {
  const t = useT();
  const locale = useLocale();
  const { completedIds } = useProgress();

  const withStatus = tracks
    .map((track) => ({ track, status: certificateStatus(track, completedIds) }))
    .filter(({ status }) => status.total > 0);
  const earned = withStatus.filter(({ status }) => status.earned).length;

  return (
    <>
      <LiveBackground />
    <div className="relative z-10 mx-auto max-w-3xl px-4 pb-20 pt-8">
      <header className="mb-6">
        <h1 className="flex items-center gap-2.5 text-3xl font-extrabold tracking-tight text-strong">
          <Award className="h-7 w-7" style={{ color: "var(--reward)" }} />
          {t("nav.certificates")}
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          {t("certs.summary")
            .replace("{earned}", String(earned))
            .replace("{total}", String(withStatus.length))}
        </p>
      </header>

      <div className="space-y-3">
        {withStatus.map(({ track, status }) => {
          const body = (
            <>
              <span
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
                style={{
                  background: status.earned
                    ? "color-mix(in srgb, var(--reward) 16%, transparent)"
                    : "var(--bg-2)",
                  color: status.earned ? "var(--reward)" : "var(--text-faint)",
                }}
              >
                {status.earned ? <Award className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-extrabold text-strong">
                  {track.title}
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                  {status.earned
                    ? t("certs.ready")
                    : t("cert.lockedBody").replace("{track}", track.title)}
                </span>
              </span>
              <span
                className="shrink-0 text-xs font-bold"
                style={{ color: status.earned ? "var(--reward)" : track.color }}
              >
                {status.done}/{status.total}
              </span>
            </>
          );

          const shape = "panel flex items-center gap-3.5 rounded-2xl p-4";

          // An unearned certificate links to the MAP, not to the certificate
          // page. Sending someone to a screen whose only content is a refusal
          // is a dead end; the lessons are the thing that changes the answer.
          return status.earned ? (
            <Link
              key={track.id}
              href={`/${locale}/certificate/${track.id}`}
              className={`${shape} transition hover:opacity-90`}
              style={{ borderColor: "color-mix(in srgb, var(--reward) 40%, transparent)" }}
            >
              {body}
            </Link>
          ) : (
            <Link
              key={track.id}
              href={`/${locale}/roadmap/${track.id}`}
              className={`${shape} transition hover:opacity-90`}
            >
              {body}
            </Link>
          );
        })}
      </div>
    </div>
    </>
  );
}
