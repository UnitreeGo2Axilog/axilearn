"use client";

/**
 * One part, with a contents menu above it and a way onward below it.
 *
 * The header used to read "PART 2 / 5", which tells you where you are and
 * nothing else -- you still had to go back to the map to reach anything. It
 * is now the same information as a menu you can open: every part by name,
 * with its state, one click away.
 *
 * The footer carries Previous and Next permanently, so moving between parts
 * never requires a detour through the map. Next is only live once this part
 * is done, matching the map's rule rather than quietly disagreeing with it.
 */
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, ArrowRight, PartyPopper, ChevronDown, Check, Lock } from "lucide-react";
import { SimNotebook } from "@/components/sim-notebook";
import type { SimPart } from "@/content/sim-parts";
import type { Locale } from "@/content/types";
import { labDone, labStates } from "@/lib/lab-progress";

const PlexusBackground = dynamic(
  () => import("@/components/plexus-background").then((m) => m.PlexusBackground),
  { ssr: false },
);

export function Go2RlPartView({
  parts,
  index,
  locale,
  trackId,
  accent,
  labels,
}: {
  parts: SimPart[];
  index: number;
  locale: Locale;
  trackId: string;
  accent: string;
  labels: {
    back: string; step: string; next: string; finished: string;
    finishedBody: string; prev: string; contents: string; locked: string;
  };
}) {
  const part = parts[index];
  const prev = parts[index - 1] ?? null;
  const next = parts[index + 1] ?? null;

  const [solved, setSolved] = useState(false);
  const [open, setOpen] = useState(false);
  // localStorage is not readable on the server; reading it during the first
  // client render would disagree with the HTML that was sent.
  const [done, setDone] = useState<ReadonlySet<string>>(() => new Set<string>());
  useEffect(() => setDone(labDone()), []);

  const say = (b: { en: string; fr: string }) => (locale === "fr" ? b.fr : b.en);
  const states = labStates(parts.map((p) => p.id), done);
  // Solving this part opens the next one immediately, without a page reload.
  const nextOpen = next ? states[next.id] !== "locked" || solved : false;

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

          {/* contents, as a menu rather than a read-only counter */}
          <div className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className="inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-[12px] font-bold transition hover:opacity-80"
              style={{ borderColor: "var(--border-strong)", color: accent }}
            >
              <span className="font-robot tracking-[0.14em]">
                {labels.step} {index + 1} / {parts.length}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
              />
            </button>

            {open && (
              <div
                className="absolute right-0 z-20 mt-1.5 w-[min(20rem,80vw)] overflow-hidden rounded-xl border shadow-lg"
                style={{ borderColor: "var(--border-strong)", background: "var(--surface-solid)" }}
              >
                {parts.map((p, i) => {
                  const st = states[p.id];
                  const locked = st === "locked" && i !== index;
                  const here = i === index;
                  const row = (
                    <>
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-robot text-[11px] font-black"
                        style={{
                          background: st === "done" ? accent : "var(--bg-2)",
                          color: st === "done" ? "var(--surface-solid)" : "var(--text-faint)",
                        }}
                      >
                        {st === "done" ? <Check className="h-3 w-3" /> : locked ? <Lock className="h-3 w-3" /> : i + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{say(p.title)}</span>
                    </>
                  );
                  const cls = "flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] font-bold";
                  if (locked) {
                    return (
                      <div key={p.id} className={`${cls} opacity-50`} title={labels.locked}>
                        {row}
                      </div>
                    );
                  }
                  return (
                    <Link
                      key={p.id}
                      href={`/${locale}/go2rl/${trackId}/${p.id}`}
                      onClick={() => setOpen(false)}
                      className={`${cls} transition hover:opacity-75`}
                      style={{
                        background: here ? `color-mix(in srgb, ${accent} 12%, transparent)` : undefined,
                        color: here ? accent : "var(--text-main)",
                      }}
                    >
                      {row}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="mb-5 flex gap-1.5">
          {parts.map((p, i) => (
            <span
              key={p.id}
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
            <p className="mt-2 text-lg font-extrabold text-strong">
              {next ? say(next.title) : labels.finished}
            </p>
            {!next && (
              <p className="mx-auto mt-1 max-w-lg text-sm leading-relaxed text-muted">
                {labels.finishedBody}
              </p>
            )}
          </div>
        )}

        {/* permanent navigation: never make somebody go back to the map to
            reach the next thing */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          {prev ? (
            <Link
              href={`/${locale}/go2rl/${trackId}/${prev.id}`}
              className="inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-bold text-main transition hover:opacity-80"
              style={{ borderColor: "var(--border-strong)" }}
            >
              <ArrowLeft className="h-4 w-4" />
              {labels.prev}
            </Link>
          ) : (
            <span />
          )}

          {next &&
            (nextOpen ? (
              <Link
                href={`/${locale}/go2rl/${trackId}/${next.id}`}
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-black"
                style={{ background: accent, color: "var(--surface-solid)" }}
              >
                {labels.next}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <span
                className="inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-bold text-faint"
                style={{ borderColor: "var(--border)", background: "var(--bg-2)" }}
              >
                <Lock className="h-3.5 w-3.5" />
                {labels.next}
              </span>
            ))}
        </div>
      </div>
    </>
  );
}
