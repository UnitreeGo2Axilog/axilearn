"use client";

/**
 * Fixed bottom mission card -- the thing that turns a map into a game.
 *
 * Slides in whenever a node is selected, carries the reward and the call to
 * action, and runs a light sweep across its top edge so it reads as "live"
 * rather than a static box.
 */
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Clock, Lock, Play, RotateCcw, Sparkles, Zap } from "lucide-react";
import type { Level } from "@/content/roadmap-data";

interface Props {
  level: Level | null;
  trackTitle: string;
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
    return { label: "Locked", icon: Lock, disabled: true, classes: "bg-slate-700 text-slate-400" };
  if (level.state === "completed")
    return { label: "Review", icon: RotateCcw, disabled: false, classes: "bg-lime-400 text-slate-900" };
  return { label: "Continue", icon: Play, disabled: false, classes: "bg-cyan-400 text-slate-900" };
}

export function BottomLessonPanel({ level, trackTitle, accent }: Props) {
  const reduce = useReducedMotion();

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
              className="relative overflow-hidden rounded-2xl border bg-[#0a1020]/95 p-4 backdrop-blur-md"
              style={{ borderColor: `${accent}55`, boxShadow: `0 0 30px rgba(0,0,0,.6), 0 0 18px ${accent}22` }}
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
                <span className="text-slate-600">·</span>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  {TYPE_LABEL[level.type]}
                </span>
              </div>

              <h2 className="text-lg font-extrabold leading-tight text-slate-50">{level.title}</h2>
              <p className="mt-1 line-clamp-2 text-sm leading-snug text-slate-400">
                {level.shortDescription}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1 text-[11px] font-semibold text-slate-300">
                  <Clock className="h-3 w-3" />
                  {level.durationMinutes} min
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1 text-[11px] font-semibold text-slate-300">
                  <Sparkles className="h-3 w-3" />
                  {DIFF_LABEL[level.difficulty]}
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg bg-amber-300/10 px-2 py-1 text-[11px] font-bold text-amber-300">
                  <Zap className="h-3 w-3" />+{level.xpReward} XP
                </span>
                {level.badge && (
                  <span className="rounded-lg bg-violet-400/10 px-2 py-1 text-[11px] font-bold text-violet-300">
                    {level.badge}
                  </span>
                )}
              </div>

              {(() => {
                const c = cta(level);
                const CtaIcon = c.icon;
                return (
                  <button
                    disabled={c.disabled}
                    className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black uppercase tracking-wide transition active:translate-y-0.5 disabled:cursor-not-allowed ${c.classes}`}
                  >
                    <CtaIcon className="h-4 w-4" />
                    {c.label}
                  </button>
                );
              })()}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
