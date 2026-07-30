"use client";

/**
 * One multiple-choice question's answer buttons: A/B/C/D chips, the selected
 * one tinted, and once checked, the correct option turns green and a wrong
 * pick turns red -- with the explanation right below either way.
 *
 * Shared between the lesson-end quiz (three questions gating completion) and
 * standalone challenges (one question each, optional practice). Both need the
 * identical answer-reveal interaction; only what happens around it -- "gate a
 * lesson" vs "gate a challenge" -- differs, so that logic stays with each
 * caller and only the shared visual piece lives here.
 */
import { Check, X } from "lucide-react";

export function QuizOptions({
  options,
  correctIndex,
  chosen,
  checked,
  accent,
  onPick,
}: {
  options: string[];
  correctIndex: number;
  chosen: number | null;
  checked: boolean;
  accent: string;
  onPick: (index: number) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map((opt, oi) => {
        const selected = chosen === oi;
        const revealCorrect = checked && oi === correctIndex;
        const revealWrong = checked && selected && oi !== correctIndex;
        return (
          <button
            key={oi}
            type="button"
            onClick={() => onPick(oi)}
            disabled={checked}
            className="flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm font-semibold transition disabled:cursor-default"
            style={{
              borderColor: revealCorrect
                ? "color-mix(in srgb, var(--cleared) 60%, transparent)"
                : revealWrong
                  ? "color-mix(in srgb, var(--reward) 60%, transparent)"
                  : selected
                    ? `${accent}88`
                    : "var(--border)",
              background: revealCorrect
                ? "color-mix(in srgb, var(--cleared) 12%, transparent)"
                : revealWrong
                  ? "color-mix(in srgb, var(--reward) 12%, transparent)"
                  : selected
                    ? `color-mix(in srgb, ${accent} 12%, transparent)`
                    : "var(--bg-2)",
              color: revealCorrect ? "var(--cleared)" : revealWrong ? "var(--reward)" : "var(--text)",
            }}
          >
            <span
              className="grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px] font-black"
              style={{
                borderColor: "currentColor",
                background: selected ? "currentColor" : "transparent",
                color: "inherit",
              }}
            >
              {revealCorrect ? (
                <Check className="h-3 w-3" style={{ color: "var(--surface-solid)" }} strokeWidth={3.5} />
              ) : revealWrong ? (
                <X className="h-3 w-3" style={{ color: "var(--surface-solid)" }} strokeWidth={3.5} />
              ) : (
                String.fromCharCode(65 + oi)
              )}
            </span>
            {opt}
          </button>
        );
      })}
    </div>
  );
}
