"use client";

/**
 * Profile: identity plus the learner's whole record in one place -- level, XP,
 * streak, coins, badges and how far each track has come. Progress used to be
 * visible only inside one track's map; this is where you see everything at
 * once.
 */
import Link from "next/link";
import { motion } from "framer-motion";
import { Award, Coins, Flame, Trophy, Zap } from "lucide-react";
import { learner, mainTracks, tracks, trackProgress } from "@/content/roadmap-data";
import { useAuth } from "@/lib/auth-context";
import { useLocale, useT } from "@/i18n/use-t";

export default function ProfilePage() {
  const t = useT();
  const locale = useLocale();
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-transparent"
          style={{ borderTopColor: "var(--neon)", borderRightColor: "var(--neon)" }}
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <Link href={`/${locale}/login`} className="btn-neon rounded-xl px-5 py-3 text-sm">
          {t("auth.signIn")}
        </Link>
      </div>
    );
  }

  const name = profile?.displayName ?? learner.name;
  const pct = Math.min(100, Math.round((learner.currentXp / learner.nextLevelXp) * 100));

  // A badge counts as earned only when its level is cleared.
  const badges = tracks
    .flatMap((tr) => tr.levels.map((l) => ({ level: l, color: tr.color })))
    .filter((x) => x.level.badge && x.level.state === "completed");

  const stats = [
    { icon: Zap, label: t("profile.xp"), value: `${learner.currentXp}`, color: "var(--neon)" },
    { icon: Flame, label: t("profile.streak"), value: `${learner.streakDays}`, color: "var(--reward)" },
    { icon: Coins, label: t("profile.coins"), value: `${learner.coins}`, color: "var(--cleared)" },
    { icon: Award, label: t("profile.badges"), value: `${badges.length}`, color: "var(--advanced)" },
  ];

  return (
    <div className="relative z-10 mx-auto max-w-3xl px-4 pb-20 pt-8">
      {/* identity + level */}
      <header className="panel panel-glow mb-6 flex flex-wrap items-center gap-4 rounded-2xl p-5">
        <div className="relative shrink-0">
          <div
            className="grid h-16 w-16 place-items-center rounded-2xl text-2xl font-black"
            style={{
              background: "linear-gradient(135deg, var(--neon), var(--cleared))",
              color: "var(--surface-solid)",
            }}
          >
            {name.slice(0, 1).toUpperCase()}
          </div>
          <span
            className="absolute -bottom-2 -right-2 rounded-lg px-2 py-0.5 text-xs font-black"
            style={{
              background: "var(--reward)",
              color: "var(--surface-solid)",
              border: "2px solid var(--bg)",
            }}
          >
            {learner.level}
          </span>
        </div>

        <div className="min-w-[200px] flex-1">
          <h1 className="text-2xl font-extrabold text-strong">{name}</h1>
          <p className="text-sm text-muted">{user.email}</p>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-bold text-faint">
                {t("profile.level")} {learner.level}
              </span>
              <span className="font-robot text-[11px]" style={{ color: "var(--neon)" }}>
                {learner.currentXp}/{learner.nextLevelXp} XP
              </span>
            </div>
            <div
              className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full"
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
          </div>
        </div>

        <span
          className="rounded-lg px-2.5 py-1 text-xs font-bold capitalize"
          style={{ background: "var(--bg-2)", color: "var(--text-muted)" }}
        >
          {profile?.role ?? "student"}
        </span>
      </header>

      {/* score */}
      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="panel rounded-xl p-4 text-center">
            <Icon className="mx-auto h-5 w-5" style={{ color }} />
            <p className="mt-2 font-robot text-xl font-bold" style={{ color }}>
              {value}
            </p>
            <p className="text-[11px] font-semibold text-faint">{label}</p>
          </div>
        ))}
      </section>

      {/* per-track progress */}
      <section className="panel mb-6 rounded-2xl p-5">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-strong">
          <Trophy className="h-5 w-5" style={{ color: "var(--reward)" }} />
          {t("profile.tracks")}
        </h2>
        <div className="space-y-4">
          {mainTracks.map((track) => {
            const p = trackProgress(track);
            const done = track.levels.filter((l) => l.state === "completed").length;
            return (
              <Link key={track.id} href={`/${locale}/track/${track.id}`} className="block">
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="text-sm font-bold text-main">{track.title}</span>
                  <span className="text-xs font-bold" style={{ color: track.color }}>
                    {done}/{track.levels.length} · {p}%
                  </span>
                </div>
                <div
                  className="h-2 w-full overflow-hidden rounded-full"
                  style={{ background: "color-mix(in srgb, var(--text) 12%, transparent)" }}
                >
                  <span
                    className="block h-full rounded-full"
                    style={{ width: `${p}%`, background: track.color }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* badges */}
      <section className="panel rounded-2xl p-5">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-strong">
          <Award className="h-5 w-5" style={{ color: "var(--advanced)" }} />
          {t("profile.badges")}
        </h2>
        {badges.length === 0 ? (
          <p className="text-sm text-muted">{t("profile.noBadges")}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {badges.map(({ level, color }) => (
              <span
                key={level.id}
                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold"
                style={{
                  borderColor: `${color}55`,
                  background: `color-mix(in srgb, ${color} 12%, transparent)`,
                  color,
                }}
              >
                <Award className="h-3.5 w-3.5" />
                {level.badge}
              </span>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
