"use client";

/**
 * The lab's map: one card per part, in order, each opening when the one
 * before it is done.
 *
 * Same rule as the lesson map -- finished ones cleared, the next one open,
 * the rest locked -- because a learner should not have to work out that two
 * parts of the same platform behave differently. A locked part is SHOWN, not
 * hidden: an empty space reads as a broken page, whereas a lock says there is
 * more and tells you how to get it.
 */
import Link from "next/link";
import { Check, Lock, Play } from "lucide-react";
import type { SimPart } from "@/content/sim-parts";
import type { Locale } from "@/content/types";
import { labStates } from "@/lib/lab-progress";
import { useProgress } from "@/lib/progress-context";
import { useT } from "@/i18n/use-t";

export function Go2RlMap({
  parts,
  locale,
  trackId,
  accent,
}: {
  parts: SimPart[];
  locale: Locale;
  trackId: string;
  accent: string;
}) {
  const t = useT();
  const { completedIds: done } = useProgress();

  const states = labStates(parts.map((p) => p.id), done);
  const say = (b: { en: string; fr: string }) => (locale === "fr" ? b.fr : b.en);

  return (
    <ol className="mt-6 space-y-3">
      {parts.map((part, i) => {
        const state = states[part.id];
        const locked = state === "locked";
        const body = (
          <>
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-robot text-sm font-black"
              style={{
                background:
                  state === "done" ? accent : locked ? "var(--bg-2)" : `color-mix(in srgb, ${accent} 16%, transparent)`,
                color: state === "done" ? "var(--surface-solid)" : locked ? "var(--text-faint)" : accent,
              }}
            >
              {state === "done" ? <Check className="h-4 w-4" /> : locked ? <Lock className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-extrabold text-strong">{say(part.title)}</span>
              <span className="mt-0.5 block text-[13px] leading-relaxed text-muted">
                {locked ? t("go2rl.locked") : say(part.intro)}
              </span>
            </span>
            {!locked && (
              <span className="ml-2 hidden shrink-0 items-center gap-1 text-[12px] font-black sm:inline-flex" style={{ color: accent }}>
                {state === "done" ? t("go2rl.again") : t("go2rl.start")}
                <Play className="h-3 w-3" />
              </span>
            )}
          </>
        );

        const shell =
          "flex items-start gap-3 rounded-2xl border p-4 transition";
        return (
          <li key={part.id}>
            {locked ? (
              <div
                className={`${shell} opacity-60`}
                style={{ borderColor: "var(--border)", background: "var(--bg-2)" }}
                aria-disabled
              >
                {body}
              </div>
            ) : (
              <Link
                href={`/${locale}/go2rl/${trackId}/${part.id}`}
                className={`${shell} hover:opacity-90`}
                style={{
                  borderColor: `color-mix(in srgb, ${accent} 45%, transparent)`,
                  background: `color-mix(in srgb, ${accent} 7%, var(--surface))`,
                }}
              >
                {body}
              </Link>
            )}
          </li>
        );
      })}
    </ol>
  );
}
