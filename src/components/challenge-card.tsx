"use client";

/**
 * One row in the challenge list: difficulty state, title, and whether it is
 * solved.
 *
 * It used to expand in place. It no longer does -- clicking opens the full
 * workspace and the list is replaced entirely. A row that unfolds while five
 * other rows stay on screen turns solving a problem into navigating a page;
 * the problem deserves the whole surface.
 *
 * So this is now a pure list item: no runner, no grading, no state beyond
 * what it is handed. All of that lives in ChallengeWorkspace.
 */
import { Check, ChevronRight, Code2, Lock, Zap } from "lucide-react";
import { useProgress } from "@/lib/progress-context";
import { Tooltip } from "@/components/tooltip";
import { useT } from "@/i18n/use-t";
import type { ResolvedChallenge } from "@/content/schema";

const DIFF_COLOR: Record<ResolvedChallenge["difficulty"], string> = {
  easy: "var(--cleared)",
  medium: "var(--reward)",
  hard: "var(--advanced)",
};

export function ChallengeCard({
  challenge,
  onOpen,
}: {
  challenge: ResolvedChallenge;
  onOpen: () => void;
}) {
  const t = useT();
  const { solvedChallengeIds, editorialUnlockedIds } = useProgress();

  const solved = solvedChallengeIds.has(challenge.id);
  const usedEditorial = editorialUnlockedIds.has(challenge.id);
  const accent = DIFF_COLOR[challenge.difficulty];

  return (
    <button
      onClick={onOpen}
      className="panel flex w-full flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl p-3.5 text-left transition hover:opacity-90"
    >
      <span
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
        style={{
          background: solved
            ? "color-mix(in srgb, var(--cleared) 18%, transparent)"
            : "var(--bg-2)",
          color: solved ? "var(--cleared)" : "var(--text-faint)",
        }}
      >
        {solved ? <Check className="h-4 w-4" strokeWidth={3} /> : <Zap className="h-4 w-4" />}
      </span>

      <span className="min-w-[140px] flex-1 text-sm font-bold text-main">{challenge.title}</span>

      {/* An editorial-assisted solve still shows as solved -- it was -- but is
          marked, because the counter deliberately leaves it out. */}
      {usedEditorial && (
        <Tooltip label={t("challenges.editorialWarning")}>
          <span
            className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider"
            style={{
              background: "color-mix(in srgb, var(--reward) 14%, transparent)",
              color: "var(--reward)",
            }}
          >
            <Lock className="h-3 w-3" />
            {t("challenges.usedEditorial")}
          </span>
        </Tooltip>
      )}

      {challenge.kind === "code" && (
        <span
          className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider"
          style={{ background: `color-mix(in srgb, ${accent} 14%, transparent)`, color: accent }}
        >
          <Code2 className="h-3 w-3" />
          {t("challenges.codeTag")}
        </span>
      )}

      <ChevronRight className="h-4 w-4 shrink-0" style={{ color: "var(--text-faint)" }} />
    </button>
  );
}
