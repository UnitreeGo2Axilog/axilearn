"use client";

/**
 * Profile -- and there are two of them, because an admin is not a learner.
 *
 * A student sees their record: level, XP, streak, coins, badges and how far
 * each track has come. An admin sees the platform instead: how much content
 * exists, what shape each track is in, and a way into the dashboard. Showing a
 * supervisor "Level 1, 0 XP, no badges" would be nonsense -- they are not
 * taking the course, they are building it.
 */
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  BookOpen,
  Clock,
  Compass,
  Flame,
  FolderKanban,
  GraduationCap,
  Layers,
  LayoutDashboard,
  ShieldCheck,
  Swords,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { learner, type RoadmapTrack } from "@/content/roadmap-data";
import { useProgress } from "@/lib/progress-context";
import { certificateStatus } from "@/lib/certificate";
import { useAuth } from "@/lib/auth-context";
import { useLocale, useT } from "@/i18n/use-t";
import type { Profile } from "@/lib/auth-context";

export function ProfileView({ tracks }: { tracks: RoadmapTrack[] }) {
  const t = useT();
  const locale = useLocale();
  const { user, profile, loading } = useAuth();
  const mainTracks = tracks.filter((tr) => !tr.hidden);

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
  const email = user.email ?? "";

  return profile?.role === "admin" ? (
    <AdminProfile name={name} email={email} profile={profile} locale={locale} t={t} tracks={tracks} />
  ) : (
    <LearnerProfile
      name={name}
      email={email}
      locale={locale}
      t={t}
      tracks={tracks}
      mainTracks={mainTracks}
    />
  );
}

type T = ReturnType<typeof useT>;

/* ------------------------------------------------------------------ admin */

function AdminProfile({
  name,
  email,
  profile,
  locale,
  t,
  tracks,
}: {
  name: string;
  email: string;
  profile: Profile;
  locale: string;
  t: T;
  tracks: RoadmapTrack[];
}) {
  const all = tracks.flatMap((tr) => tr.levels);
  const counts = [
    { icon: Layers, label: t("profile.cTracks"), value: tracks.length, color: "var(--advanced)" },
    {
      icon: Compass,
      label: t("profile.cChapters"),
      value: all.filter((l) => l.section).length,
      color: "var(--neon)",
    },
    { icon: BookOpen, label: t("profile.cLessons"), value: all.length, color: "var(--cleared)" },
    {
      icon: FolderKanban,
      label: t("profile.cProjects"),
      value: all.filter((l) => l.type === "project" || l.type === "final_project").length,
      color: "var(--reward)",
    },
  ];

  return (
    <div className="relative z-10 mx-auto max-w-3xl px-4 pb-20 pt-8">
      {/* identity -- no level chip, no XP bar: an admin has neither */}
      <header className="panel panel-glow mb-4 flex flex-wrap items-center gap-4 rounded-2xl p-5">
        <div
          className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl"
          style={{
            background: "linear-gradient(135deg, var(--advanced), var(--neon))",
            color: "var(--surface-solid)",
          }}
        >
          <ShieldCheck className="h-8 w-8" />
        </div>

        <div className="min-w-[200px] flex-1">
          <h1 className="text-2xl font-extrabold text-strong">{name}</h1>
          <p className="text-sm text-muted">{email}</p>
        </div>

        <span
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black uppercase tracking-widest"
          style={{
            background: "color-mix(in srgb, var(--advanced) 16%, transparent)",
            border: "1px solid color-mix(in srgb, var(--advanced) 45%, transparent)",
            color: "var(--advanced)",
          }}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          {t("profile.adminRole")}
        </span>
      </header>

      <p
        className="mb-6 rounded-xl border p-4 text-sm leading-relaxed text-muted"
        style={{
          borderColor: "color-mix(in srgb, var(--advanced) 30%, transparent)",
          background: "color-mix(in srgb, var(--advanced) 6%, var(--surface))",
        }}
      >
        {t("profile.adminNote")}
      </p>

      {/* what exists on the platform */}
      <section className="mb-6">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-strong">
          <Layers className="h-5 w-5" style={{ color: "var(--advanced)" }} />
          {t("profile.contentOverview")}
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {counts.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="panel rounded-xl p-4 text-center">
              <Icon className="mx-auto h-5 w-5" style={{ color }} />
              <p className="mt-2 font-robot text-xl font-bold" style={{ color }}>
                {value}
              </p>
              <p className="text-[11px] font-semibold text-faint">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* per-track shape: size, not the admin's own progress */}
      <section className="panel mb-6 rounded-2xl p-5">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-strong">
          <BookOpen className="h-5 w-5" style={{ color: "var(--neon)" }} />
          {t("profile.tracks")}
        </h2>
        <div className="space-y-3">
          {tracks.map((track) => {
            const min = track.levels.reduce((s, l) => s + l.durationMinutes, 0);
            const chapters = track.levels.filter((l) => l.section).length;
            return (
              <div
                key={track.id}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border p-3.5"
                style={{ borderColor: "var(--border)", background: "var(--bg-2)" }}
              >
                <span
                  className="rounded-md px-2 py-0.5 font-robot text-[10px] font-bold tracking-[0.18em]"
                  style={{
                    background: `color-mix(in srgb, ${track.color} 14%, transparent)`,
                    color: track.color,
                  }}
                >
                  {track.short}
                </span>
                <span className="flex-1 text-sm font-bold text-main">{track.title}</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-faint">
                  <BookOpen className="h-3.5 w-3.5" />
                  {track.levels.length}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-faint">
                  <Compass className="h-3.5 w-3.5" />
                  {chapters}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-faint">
                  <Clock className="h-3.5 w-3.5" />~{Math.round(min / 60)}
                  {t("track.hours").slice(0, 1)}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* account + way in */}
      <section className="panel mb-6 rounded-2xl p-5">
        <h2 className="mb-3 text-lg font-extrabold text-strong">{t("profile.adminAccount")}</h2>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          {[
            ["Email", email],
            ["Role", profile.role],
            ["Language", profile.locale.toUpperCase()],
            ["UID", `${profile.uid.slice(0, 10)}…`],
          ].map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-3">
              <dt className="text-faint">{k}</dt>
              <dd className="truncate font-semibold text-main">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href={`/${locale}/admin`}
          className="flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-black"
          style={{ background: "var(--advanced)", color: "var(--surface-solid)" }}
        >
          <LayoutDashboard className="h-5 w-5" />
          {t("profile.openAdmin")}
        </Link>
        <Link
          href={`/${locale}/admin/students`}
          className="flex items-center justify-center gap-2 rounded-xl border px-6 py-3.5 text-base font-black text-main"
          style={{ borderColor: "var(--border-strong)" }}
        >
          <Users className="h-5 w-5" />
          {t("admin.students")}
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- learner */

function LearnerProfile({
  name,
  email,
  locale,
  t,
  tracks,
  mainTracks,
}: {
  name: string;
  email: string;
  locale: string;
  t: T;
  tracks: RoadmapTrack[];
  mainTracks: RoadmapTrack[];
}) {
  // Every number here is this learner's real record now, counted from the
  // lessons they marked done -- not the authored demo state the prototype used.
  const { completedIds, xp, level, into, span, streak, solvedChallengeIds } = useProgress();
  const pct = Math.min(100, Math.round((into / span) * 100));

  const badges = tracks
    .flatMap((tr) => tr.levels.map((l) => ({ level: l, color: tr.color })))
    .filter((x) => x.level.badge && completedIds.has(x.level.id));

  const earnedCerts = mainTracks.filter((tr) => certificateStatus(tr, completedIds).earned);
  // The next track worth pointing an empty-state CTA at: the one still in
  // progress, or the first available if nothing has been started yet.
  const nextTrack =
    mainTracks.find((tr) => tr.levels.some((l) => completedIds.has(l.id)) && !earnedCerts.includes(tr)) ??
    mainTracks[0];
  const nextTrackHref = nextTrack ? `/${locale}/roadmap/${nextTrack.id}` : `/${locale}`;

  const stats = [
    { icon: Zap, label: t("profile.xp"), value: `${xp}`, color: "var(--neon)" },
    { icon: Trophy, label: t("profile.done"), value: `${completedIds.size}`, color: "var(--cleared)" },
    { icon: Flame, label: t("profile.streak"), value: `${streak}`, color: "var(--reward)" },
    { icon: Swords, label: t("profile.challengesSolved"), value: `${solvedChallengeIds.size}`, color: "var(--advanced)" },
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
            {level}
          </span>
        </div>

        <div className="min-w-[200px] flex-1">
          <h1 className="text-2xl font-extrabold text-strong">{name}</h1>
          <p className="text-sm text-muted">{email}</p>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-bold text-faint">
                {t("profile.level")} {level}
              </span>
              <span className="font-robot text-[11px]" style={{ color: "var(--neon)" }}>
                {into}/{span} XP
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
          {t("profile.student")}
        </span>
      </header>

      {/* score */}
      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
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
            const { total, done, earned: complete } = certificateStatus(track, completedIds);
            const p = total ? Math.round((done / total) * 100) : 0;
            return (
              <div key={track.id}>
                <Link href={`/${locale}/track/${track.id}`} className="block">
                  <div className="mb-1.5 flex items-baseline justify-between">
                    <span className="text-sm font-bold text-main">{track.title}</span>
                    <span className="text-xs font-bold" style={{ color: track.color }}>
                      {done}/{total} · {p}%
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
                {complete && (
                  <Link
                    href={`/${locale}/certificate/${track.id}`}
                    className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold"
                    style={{ color: "var(--reward)" }}
                  >
                    <Award className="h-3 w-3" />
                    {t("cert.view")}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* badges */}
      <section className="panel mb-6 rounded-2xl p-5">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-strong">
          <Award className="h-5 w-5" style={{ color: "var(--advanced)" }} />
          {t("profile.badges")}
        </h2>
        {badges.length === 0 ? (
          <EmptyReward
            text={t("profile.noBadges")}
            cta={t("profile.getBadges")}
            href={nextTrackHref}
            color="var(--advanced)"
          />
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

      {/* certifications -- earned once a track hits 100% of its lessons.
          "mandatory" just means "every lesson", since nothing on the platform
          is optional yet; a real exam gate is planned but not built. */}
      <section className="panel rounded-2xl p-5">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-strong">
          <GraduationCap className="h-5 w-5" style={{ color: "var(--reward)" }} />
          {t("profile.certifications")}
        </h2>
        {earnedCerts.length === 0 ? (
          <>
            <EmptyReward
              text={t("profile.noCerts")}
              cta={t("profile.getCertified")}
              href={nextTrackHref}
              color="var(--reward)"
            />
            <p className="mt-3 text-[11px] leading-relaxed text-faint">
              {t("profile.certEligibility")} {t("profile.certFutureNote")}
            </p>
          </>
        ) : (
          <div className="flex flex-wrap gap-2">
            {earnedCerts.map((track) => (
              <Link
                key={track.id}
                href={`/${locale}/certificate/${track.id}`}
                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition hover:opacity-80"
                style={{
                  borderColor: "color-mix(in srgb, var(--reward) 40%, transparent)",
                  background: "color-mix(in srgb, var(--reward) 12%, transparent)",
                  color: "var(--reward)",
                }}
              >
                <Award className="h-3.5 w-3.5" />
                {track.title}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/** The shared "nothing here yet, go get one" empty state for badges/certs. */
function EmptyReward({
  text,
  cta,
  href,
  color,
}: {
  text: string;
  cta: string;
  href: string;
  color: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="text-sm text-muted">{text}</p>
      <Link
        href={href}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black uppercase tracking-wide"
        style={{ background: color, color: "var(--surface-solid)" }}
      >
        {cta}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
