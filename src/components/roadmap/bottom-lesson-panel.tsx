"use client";

/**
 * Fixed bottom mission card -- the thing that turns a map into a game.
 *
 * Slides in whenever a node is selected, carries the reward and the call to
 * action, and runs a light sweep across its top edge so it reads as "live"
 * rather than a static box.
 */
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Award, Clock, Lock, Play, RotateCcw, Sparkles, Zap } from "lucide-react";
import type { Level } from "@/content/roadmap-data";
import { useLocale, useT } from "@/i18n/use-t";

interface Props {
  level: Level | null;
  trackId: string;
  trackTitle: string;
  /** Every lesson in the track finished -- the certificate condition. */
  trackComplete: boolean;
  accent: string;
  onClose?: () => void;
}

const DIFF_LABEL: Record<Level["difficulty"], string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

const TYPE_LABEL: Record<Level["type"], string> = {
  lesson: "Lesson",
  checkpoint: "Checkpoint",
  project: "Mini project",
  final_project: "Final project",
};

function cta(level: Level) {
  if (level.state === "locked")
    return { label: "Locked", icon: Lock, disabled: true, classes: "text-faint", inline: { background: "var(--bg-2)" } };
  if (level.state === "completed")
    return { label: "Review", icon: RotateCcw, disabled: false, classes: "", inline: { background: "var(--cleared)", color: "var(--surface-solid)" } };
  return { label: "Continue", icon: Play, disabled: false, classes: "", inline: { background: "var(--neon)", color: "var(--surface-solid)" } };
}

export function BottomLessonPanel({ level, trackId, trackTitle, trackComplete, accent }: Props) {
  const locale = useLocale();
  const t = useT();
  const reduce = useReducedMotion();
  const isFinal = level?.type === "final_project";

  return (
    <AnimatePresence mode="wait">
      {level && (
        <motion.div
          key={level.id}
          initial={reduce ? false : { y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduce ? undefined : { y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          className="fixed inset-x-0 bottom-0 z-40"
        >
          <div className="mx-auto max-w-3xl px-3 pb-3">
            <div
              className="relative overflow-hidden rounded-2xl border p-4 backdrop-blur-md"
              style={{ borderColor: `${accent}66`, background: "color-mix(in srgb, var(--surface-solid) 95%, transparent)", boxShadow: "var(--glow-soft)" }}
            >
              {/* sweeping highlight along the top edge */}
              {!reduce && (
                <motion.span
                  aria-hidden
                  className="absolute left-0 top-0 h-px w-24"
                  style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
                  animate={{ x: ["-20%", "420%"] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: "linear" }}
                />
              )}

              <div className="mb-1 flex items-center gap-2">
                <span
                  className="rounded font-robot text-[9px] font-bold uppercase tracking-[0.18em]"
                  style={{ color: accent }}
                >
                  {trackTitle}
                </span>
                <span className="text-faint">·</span>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                  {TYPE_LABEL[level.type]}
                </span>
              </div>

              <h2 className="text-lg font-extrabold leading-tight text-strong">{level.title}</h2>
              <p className="mt-1 line-clamp-2 text-sm leading-snug text-muted">
                {level.shortDescription}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-main"
                  style={{ background: "var(--bg-2)" }}>
                  <Clock className="h-3 w-3" />
                  {level.durationMinutes} min
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-main"
                  style={{ background: "var(--bg-2)" }}>
                  <Sparkles className="h-3 w-3" />
                  {DIFF_LABEL[level.difficulty]}
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold"
                  style={{ background: "color-mix(in srgb, var(--reward) 14%, transparent)", color: "var(--reward)" }}>
                  <Zap className="h-3 w-3" />+{level.xpReward} XP
                </span>
                {level.badge && (
                  <span className="rounded-lg px-2 py-1 text-[11px] font-bold"
                    style={{ background: "color-mix(in srgb, var(--advanced) 14%, transparent)", color: "var(--advanced)" }}>
                    {level.badge}
                  </span>
                )}
              </div>

              {/* the capstone node carries the certificate, once every lesson
                  in the track -- not just this one -- is actually done */}
              {isFinal && (
                <div
                  className="mt-3 flex items-center gap-2.5 rounded-xl border p-3"
                  style={{
                    borderColor: trackComplete
                      ? "color-mix(in srgb, var(--reward) 45%, transparent)"
                      : "var(--border)",
                    background: trackComplete
                      ? "color-mix(in srgb, var(--reward) 10%, transparent)"
                      : "var(--bg-2)",
                  }}
                >
                  <Award
                    className="h-4 w-4 shrink-0"
                    style={{ color: trackComplete ? "var(--reward)" : "var(--text-faint)" }}
                  />
                  <p
                    className="flex-1 text-xs font-semibold leading-snug"
                    style={{ color: trackComplete ? "var(--reward)" : "var(--text-muted)" }}
                  >
                    {trackComplete ? t("cert.available") : t("cert.lockedBody")}
                  </p>
                  {trackComplete && (
                    <Link
                      href={`/${locale}/certificate/${trackId}`}
                      className="shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-black"
                      style={{ background: "var(--reward)", color: "var(--surface-solid)" }}
                    >
                      {t("cert.view")}
                    </Link>
                  )}
                </div>
              )}

              {(() => {
                const c = cta(level);
                const CtaIcon = c.icon;
                const shape = `mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black uppercase tracking-wide transition active:translate-y-0.5 disabled:cursor-not-allowed ${c.classes}`;
                // A locked mission stays a dead button; an open one opens the
                // lesson, which is what makes the map navigable at all.
                return c.disabled ? (
                  <button disabled style={c.inline} className={shape}>
                    <CtaIcon className="h-4 w-4" />
                    {c.label}
                  </button>
                ) : (
                  <Link href={`/${locale}/lesson/${level.id}`} style={c.inline} className={shape}>
                    <CtaIcon className="h-4 w-4" />
                    {c.label}
                  </Link>
                );
              })()}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
