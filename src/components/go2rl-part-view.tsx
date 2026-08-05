"use client";

/**
 * One part, with a way back to the map and a way on to the next.
 *
 * The Next button only appears once the part has actually been solved, and it
 * appears the moment it is -- the learner should not have to guess whether
 * the platform noticed. Before that the footer says what is still missing
 * rather than showing a dead control.
 */
import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, ArrowRight, PartyPopper } from "lucide-react";
import { SimNotebook } from "@/components/sim-notebook";
import type { SimPart } from "@/content/sim-parts";
import type { Locale } from "@/content/types";

const PlexusBackground = dynamic(
  () => import("@/components/plexus-background").then((m) => m.PlexusBackground),
  { ssr: false },
);

export function Go2RlPartView({
  part,
  next,
  index,
  total,
  locale,
  trackId,
  accent,
  labels,
}: {
  part: SimPart;
  next: SimPart | null;
  index: number;
  total: number;
  locale: Locale;
  trackId: string;
  accent: string;
  labels: { back: string; step: string; next: string; finished: string; finishedBody: string };
}) {
  const [solved, setSolved] = useState(false);
  const say = (b: { en: string; fr: string }) => (locale === "fr" ? b.fr : b.en);

  return (
    <>
      <PlexusBackground />
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/${locale}/go2rl/${trackId}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:opacity-80"
          >
            <ArrowLeft className="h-4 w-4" />
            {labels.back}
          </Link>
          <span className="font-robot text-[11px] font-bold tracking-[0.16em] text-faint">
            {labels.step} {index + 1} / {total}
          </span>
        </div>

        {/* One bar segment per part, so where you are is visible without
            counting. Matches the lesson step bar. */}
        <div className="mb-5 flex gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className="h-1.5 flex-1 rounded-full"
              style={{ background: i <= index ? accent : "var(--bg-2)" }}
            />
          ))}
        </div>

        <SimNotebook part={part} locale={locale} accent={accent} onSolved={() => setSolved(true)} />

        {solved && (
          <div
            className="mt-5 rounded-2xl border p-5 text-center"
            style={{
              borderColor: `color-mix(in srgb, ${accent} 45%, transparent)`,
              background: `color-mix(in srgb, ${accent} 8%, transparent)`,
            }}
          >
            <PartyPopper className="mx-auto h-7 w-7" style={{ color: accent }} />
            {next ? (
              <>
                <p className="mt-2 text-lg font-extrabold text-strong">{say(next.title)}</p>
                <Link
                  href={`/${locale}/go2rl/${trackId}/${next.id}`}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-black"
                  style={{ background: accent, color: "var(--surface-solid)" }}
                >
                  {labels.next}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            ) : (
              <>
                <p className="mt-2 text-lg font-extrabold text-strong">{labels.finished}</p>
                <p className="mx-auto mt-1 max-w-lg text-sm leading-relaxed text-muted">
                  {labels.finishedBody}
                </p>
                <Link
                  href={`/${locale}/go2rl/${trackId}`}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-black"
                  style={{ background: accent, color: "var(--surface-solid)" }}
                >
                  {labels.back}
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
