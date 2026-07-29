"use client";

/**
 * The learner's level and XP, shown on the main page above the tracks.
 *
 * This used to live inside the mission map's HUD, but progress belongs where
 * the learner chooses what to do next -- the page that holds the tracks --
 * rather than buried inside one track's map.
 */
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Coins, Flame, LayoutDashboard, ShieldCheck, Trophy } from "lucide-react";
import { learner, mainTracks, trackProgress } from "@/content/roadmap-data";
import { useAuth } from "@/lib/auth-context";
import { useLocale, useT } from "@/i18n/use-t";

export function LearnerStrip() {
  const { user, profile } = useAuth();
  const locale = useLocale();
  const t = useT();
  if (!user) return null;

  // An admin has no XP, streak or coins -- show them the way into the
  // dashboard instead of a learner bar that would always read "Level 1".
  if (profile?.role === "admin") {
    return (
      <section className="panel panel-glow mb-8 flex flex-wrap items-center gap-4 rounded-2xl p-4">
        <div
          className="grid h-12 w-12 shrink-0 place-items-center rounded-xl"
          style={{
            background: "linear-gradient(135deg, var(--advanced), var(--neon))",
            color: "var(--surface-solid)",
          }}
        >
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div className="min-w-[180px] flex-1">
          <p className="text-sm font-bold text-strong">
            {t("home.adminHello")} · {profile.displayName}
          </p>
          <p className="mt-0.5 text-[11px] text-faint">{t("home.adminHint")}</p>
        </div>
        <Link
          href={`/${locale}/admin`}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black"
          style={{ background: "var(--advanced)", color: "var(--surface-solid)" }}
        >
          <LayoutDashboard className="h-4 w-4" />
          {t("profile.openAdmin")}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    );
  }

  const pct = Math.min(100, Math.round((learner.currentXp / learner.nextLevelXp) * 100));
  const name = profile?.displayName ?? learner.name;

  return (
    <section className="panel panel-glow mb-8 rounded-2xl p-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* avatar + level */}
        <div className="relative shrink-0">
          <div
            className="grid h-12 w-12 place-items-center rounded-xl text-lg font-black"
            style={{
              background: "linear-gradient(135deg, var(--neon), var(--cleared))",
              color: "var(--surface-solid)",
            }}
          >
            {name.slice(0, 1).toUpperCase()}
          </div>
          <span
            className="absolute -bottom-1.5 -right-1.5 rounded-md px-1.5 text-[10px] font-black"
            style={{
              background: "var(--reward)",
              color: "var(--surface-solid)",
              border: "1px solid var(--bg)",
            }}
          >
            {learner.level}
          </span>
        </div>

        {/* xp bar */}
        <div className="min-w-[180px] flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-sm font-bold text-strong">
              {t("home.welcomeBack")} {name}
            </p>
            <p className="font-robot text-[11px] tracking-wider" style={{ color: "var(--neon)" }}>
              {learner.currentXp}/{learner.nextLevelXp} XP
            </p>
          </div>
          <div
            className="mt-1.5 h-2 w-full overflow-hidden rounded-full"
            style={{ background: "color-mix(in srgb, var(--text) 14%, transparent)" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, var(--neon), var(--cleared))" }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          </div>
          <p className="mt-1 text-[11px] text-faint">
            {t("home.level")} {learner.level} · {learner.nextLevelXp - learner.currentXp}{" "}
            {t("home.xpToNext")}
          </p>
        </div>

        {/* streak / coins */}
        <div className="flex shrink-0 items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm font-bold"
            style={{
              borderColor: "color-mix(in srgb, var(--reward) 35%, transparent)",
              background: "color-mix(in srgb, var(--reward) 12%, transparent)",
              color: "var(--reward)",
            }}
          >
            <Flame className="h-4 w-4" />
            {learner.streakDays}
          </span>
          <span
            className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm font-bold"
            style={{
              borderColor: "color-mix(in srgb, var(--cleared) 35%, transparent)",
              background: "color-mix(in srgb, var(--cleared) 12%, transparent)",
              color: "var(--cleared)",
            }}
          >
            <Coins className="h-4 w-4" />
            {learner.coins}
          </span>
        </div>
      </div>

      {/* per-track completion */}
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {mainTracks.map((track) => {
          const p = trackProgress(track);
          return (
            <div key={track.id} className="flex items-center gap-2">
              <Trophy className="h-3.5 w-3.5 shrink-0" style={{ color: track.color }} />
              <span className="w-16 shrink-0 font-robot text-[10px] font-bold tracking-wider text-faint">
                {track.short}
              </span>
              <span
                className="h-1.5 flex-1 overflow-hidden rounded-full"
                style={{ background: "color-mix(in srgb, var(--text) 12%, transparent)" }}
              >
                <span
                  className="block h-full rounded-full"
                  style={{ width: `${p}%`, background: track.color }}
                />
              </span>
              <span className="w-8 shrink-0 text-right text-[10px] font-bold text-faint">{p}%</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
