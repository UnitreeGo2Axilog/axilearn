"use client";

/**
 * The body of a track briefing: what to do next, and the reading, without
 * making anyone scroll a page and a half to reach either.
 *
 * The problem this solves is real. The briefing had SEVEN stacked sections --
 * who it is for, what you will learn, the optional primer, challenges, five
 * pieces of advice, and only then the button that actually starts the track.
 * All of it worth saying, none of it worth making a teenager scroll past to
 * find the one control they came for.
 *
 * Three changes, in order of how much they help:
 *
 *  1. The three long TEXT sections become tabs. They are reference material,
 *     read once, and nobody needs all three at the same moment -- so showing
 *     one at a time cuts the page's height by roughly two thirds without
 *     removing a single word.
 *  2. The two ACTIONS (the optional primer, the challenges) sit together in
 *     one compact row near the top, because they are things to do, not things
 *     to read, and burying an action below an essay is how it gets missed.
 *  3. The primary CTA is sticky. Whatever tab is open and however far down
 *     someone is, "enter the map" is on screen -- which was the actual
 *     complaint: having to scroll to the foot to reach the thing you came for.
 *
 * Tabs are the same component the challenge workspace uses, so the two
 * screens behave identically instead of each inventing their own.
 */
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, Sparkles, Swords, Users , Bot} from "lucide-react";
import type { RoadmapTrack } from "@/content/roadmap-data";
import { useProgress } from "@/lib/progress-context";
import { Tabs, type TabItem } from "@/components/tabs";
import { useT } from "@/i18n/use-t";

type TabId = "about" | "learn" | "succeed";

export function TrackBriefing({
  track,
  locale,
  challengeCount,
  simPartCount,
}: {
  track: RoadmapTrack;
  locale: string;
  challengeCount: number;
  /** Robot-lab parts for this track. Zero on tracks that have none. */
  simPartCount: number;
}) {
  const t = useT();
  const { completedIds } = useProgress();
  const [tab, setTab] = useState<TabId>("about");

  const { overview } = track;
  const done = track.levels.filter((l) => completedIds.has(l.id)).length;
  const pct = track.levels.length ? Math.round((done / track.levels.length) * 100) : 0;

  const tabs: TabItem<TabId>[] = [
    { id: "about", label: t("track.tabAbout") },
    { id: "learn", label: t("track.whatYouLearn") },
    { id: "succeed", label: t("track.howToSucceed") },
  ];

  return (
    <>
      {/* actions first -- these are things to do, not things to read */}
      {(overview.primer || challengeCount > 0 || simPartCount > 0) && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          {overview.primer && (
            <ActionCard
              icon={<Sparkles className="h-5 w-5" />}
              tone="var(--advanced)"
              badge={t("track.optional")}
              title={overview.primer.title}
              body={overview.primer.why}
              meta={`~${overview.primer.minutes} min`}
              cta={t("track.takePrimer")}
              // Its own track page, not straight to its lesson map -- Python
              // is a full track on the home page now, so this card is a
              // recommendation between siblings and should land where any
              // other track link lands: on its briefing.
              href={`/${locale}/track/${overview.primer.trackId ?? "python-primer"}`}
            />
          )}
          {challengeCount > 0 && (
            <ActionCard
              icon={<Swords className="h-5 w-5" />}
              tone="var(--reward)"
              title={t("challenges.entryTitle")}
              body={t("challenges.entryBody")}
              meta={`${challengeCount}`}
              cta={t("challenges.open")}
              href={`/${locale}/challenges/${track.id}`}
            />
          )}
          {/* The robot lab is deliberately its own destination rather than
              something embedded in a lesson: it is a project you go and do,
              which is a different act from reading a chapter. */}
          {simPartCount > 0 && (
            <ActionCard
              icon={<Bot className="h-5 w-5" />}
              tone={track.color}
              title={t("go2rl.entryTitle")}
              body={t("go2rl.entryBody")}
              meta={`${simPartCount} ${t("go2rl.parts")}`}
              cta={t("go2rl.open")}
              href={`/${locale}/go2rl/${track.id}`}
            />
          )}
        </div>
      )}

      {/* the reading, one section at a time */}
      <section className="panel mb-6 rounded-2xl">
        <div className="px-2 pt-1">
          <Tabs tabs={tabs} active={tab} onChange={setTab} accent={track.color} />
        </div>

        <div className="p-5">
          {tab === "about" && (
            <div className="flex items-start gap-3">
              <Users className="mt-0.5 h-5 w-5 shrink-0" style={{ color: track.color }} />
              <p className="text-sm leading-relaxed text-main">{overview.forWho}</p>
            </div>
          )}

          {tab === "learn" && (
            <ul className="grid gap-3 sm:grid-cols-2">
              {overview.outcomes.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 rounded-xl border p-3.5 text-sm leading-relaxed text-main"
                  style={{ borderColor: "var(--border)", background: "var(--bg-2)" }}
                >
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0"
                    style={{ color: "var(--cleared)" }}
                  />
                  {item}
                </li>
              ))}
            </ul>
          )}

          {tab === "succeed" && (
            <ul className="space-y-2.5">
              {overview.advice.map((tip, i) => (
                <li
                  key={tip}
                  className="flex items-start gap-3 rounded-xl border p-3.5 text-sm leading-relaxed text-main"
                  style={{ borderColor: "var(--border)", background: "var(--bg-2)" }}
                >
                  <span
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-[11px] font-black"
                    style={{
                      background: "color-mix(in srgb, var(--reward) 16%, transparent)",
                      color: "var(--reward)",
                    }}
                  >
                    {i + 1}
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* always reachable, whatever tab is open and however far down */}
      <div className="sticky bottom-4 z-20">
        <div
          className="flex flex-wrap items-center gap-3 rounded-2xl border p-3.5 backdrop-blur"
          style={{
            borderColor: `${track.color}55`,
            background: "color-mix(in srgb, var(--surface-solid) 88%, transparent)",
            boxShadow: "var(--glow-soft)",
          }}
        >
          <div className="min-w-[140px] flex-1">
            <p className="text-xs font-bold text-muted">
              {pct > 0
                ? `${done}/${track.levels.length} · ${pct}% ${t("track.alreadyDone")}`
                : t("track.readyToStart")}
            </p>
            {pct > 0 && (
              <span
                className="mt-1.5 block h-1.5 w-full overflow-hidden rounded-full"
                style={{ background: "color-mix(in srgb, var(--text) 12%, transparent)" }}
              >
                <span
                  className="block h-full rounded-full"
                  style={{ width: `${pct}%`, background: track.color }}
                />
              </span>
            )}
          </div>
          <Link
            href={`/${locale}/roadmap/${track.id}`}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl px-5 py-3 text-sm font-black uppercase tracking-wide"
            style={{ background: track.color, color: "var(--surface-solid)" }}
          >
            {pct > 0 ? t("track.continue") : t("track.enterMap")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </>
  );
}

function ActionCard({
  icon,
  tone,
  badge,
  title,
  body,
  meta,
  cta,
  href,
}: {
  icon: React.ReactNode;
  tone: string;
  badge?: string;
  title: string;
  body: string;
  meta: string;
  cta: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex h-full flex-col rounded-2xl border p-4 transition hover:opacity-90"
      style={{
        borderColor: `color-mix(in srgb, ${tone} 45%, transparent)`,
        background: `color-mix(in srgb, ${tone} 7%, var(--surface))`,
      }}
    >
      <div className="mb-2 flex items-center gap-2">
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
          style={{ background: `color-mix(in srgb, ${tone} 16%, transparent)`, color: tone }}
        >
          {icon}
        </span>
        {badge && (
          <span
            className="rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-widest"
            style={{ background: `color-mix(in srgb, ${tone} 18%, transparent)`, color: tone }}
          >
            {badge}
          </span>
        )}
        <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-faint">
          <Clock className="h-3 w-3" />
          {meta}
        </span>
      </div>
      <h3 className="text-sm font-extrabold text-strong">{title}</h3>
      <p className="mt-1 line-clamp-2 flex-1 text-xs leading-relaxed text-muted">{body}</p>
      <span
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wide"
        style={{ color: tone }}
      >
        {cta}
        <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}
