"use client";

/**
 * One mission-select card on the home page.
 *
 * Client-rendered for the same reason TrackBriefing and LearnerStrip are:
 * progress is per-learner, and the track object arriving from the server has
 * no completed lessons applied (getMainTracks builds it with an empty
 * completed-set, since the server render isn't personalized). Before this,
 * the card's percentage read `trackProgress(track)` on that unpersonalized
 * object, so every learner saw ~0% here regardless of what they had actually
 * finished -- the map and profile were already fixed to read real progress;
 * this card on the home page was the one place still lying.
 *
 * The certificate badge in the corner is ALWAYS there, and always answers.
 * It used to appear only once the track was finished, which meant the one
 * question a learner actually has -- "what do I have to do to get that?" --
 * had no control anywhere to ask it: the badge that would have explained was
 * itself invisible until the answer no longer mattered. Now it is shown
 * either way. Earned, it opens the certificate. Not earned, it says what is
 * missing, right on the card, without navigating anyone to a page whose only
 * content is a refusal.
 *
 * Both states read the same certificateStatus() the certificate page reads,
 * so a gold badge here is a promise that page will keep.
 *
 * The challenges badge shows on EVERY track that has challenges, including a
 * "coming soon" one -- content readiness and challenge availability are two
 * separate facts, and gating the icon on `locked` was conflating them. It goes
 * straight to the challenges themselves rather than to an anchor on the
 * briefing page: the briefing now surfaces challenges in its top action row,
 * so there is nothing left to scroll past and the extra hop earned nothing.
 * It is a <button> calling router.push rather than a nested <Link>, because on
 * an unlocked track the whole card is already one <a>, and a real anchor
 * inside another anchor is invalid HTML with unpredictable click behaviour.
 */
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Award, Lock, Swords, X } from "lucide-react";
import type { RoadmapTrack } from "@/content/roadmap-data";
import { useProgress } from "@/lib/progress-context";
import { certificateStatus } from "@/lib/certificate";
import { useT } from "@/i18n/use-t";
import { Tooltip } from "@/components/tooltip";

export function TrackCard({
  track,
  locale,
  locked,
  challengeCount,
}: {
  track: RoadmapTrack;
  locale: string;
  locked: boolean;
  challengeCount: number;
}) {
  const t = useT();
  const router = useRouter();
  const { completedIds } = useProgress();
  const [showRequirement, setShowRequirement] = useState(false);

  const { total, done, remaining, earned } = certificateStatus(track, completedIds);
  const pct = total ? Math.round((done / total) * 100) : 0;
  // A coming-soon track has nothing to finish, so it gets no certificate
  // control at all -- an explanation of how to earn something unreachable is
  // just noise.
  const showCertificate = !locked && total > 0;

  const certificateLabel = earned
    ? t("cert.earnedFor").replace("{track}", track.title)
    : t("cert.lockedShort");

  // The whole point of the badge: it answers either way. Earned, it hands
  // over the certificate. Not earned, it says what is still owed.
  function onCertificateClick() {
    if (earned) router.push(`/${locale}/certificate/${track.id}`);
    else setShowRequirement(true);
  }

  const card = (
    <div
      className="group relative h-full overflow-hidden rounded-2xl border p-5 transition"
      style={{
        borderColor: locked ? "var(--border)" : `${track.color}66`,
        background: "var(--surface)",
        boxShadow: locked ? "none" : `0 0 26px rgba(${track.glow},0.12)`,
      }}
    >
      {/* corner accent */}
      <span
        aria-hidden
        className="absolute right-0 top-0 h-16 w-16 opacity-25"
        style={{ background: `radial-gradient(circle at top right, ${track.color}, transparent 70%)` }}
      />

      <span
        className="font-robot text-2xl font-black tracking-[0.18em]"
        style={{ color: locked ? "var(--text-faint)" : track.color }}
      >
        {track.short}
      </span>
      <h2 className="mt-2 text-lg font-bold text-strong">{track.title}</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">{track.description}</p>

      {locked ? (
        <span
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold text-muted"
          style={{ borderColor: "var(--border)", background: "var(--bg-2)" }}
        >
          <Lock className="h-3 w-3" />
          {t("home.comingSoon")}
        </span>
      ) : (
        <>
          <div
            className="mt-4 h-1.5 w-full overflow-hidden rounded-full"
            style={{ background: "color-mix(in srgb, var(--text) 14%, transparent)" }}
          >
            <span
              className="block h-full rounded-full"
              style={{ width: `${pct}%`, background: track.color, boxShadow: `0 0 10px ${track.color}` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-faint">
              {track.levels.length} {t("home.lessons")} · {pct}%
            </span>
            <span
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black uppercase tracking-wide transition group-hover:gap-2.5"
              style={{ background: track.color, color: "var(--surface-solid)" }}
            >
              {t("home.start")}
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="relative h-full">
      {locked ? (
        <div className="h-full opacity-70">{card}</div>
      ) : (
        <Link href={`/${locale}/track/${track.id}`} className="block h-full">
          {card}
        </Link>
      )}

      {/* corner signals: challenges (any track that has any, locked or not)
          and the certificate (any startable track, earned or not yet).

          They sit OUTSIDE the link, layered over it, rather than inside the
          card. On an unlocked track the card is one big <a>, and a <button>
          inside an <a> is interactive content nested in interactive content:
          invalid HTML that browsers resolve however they like. It used to
          work only because each handler called preventDefault to smother the
          navigation it should never have triggered. As siblings painted on
          top they simply receive their own clicks, and the handlers no longer
          have to undo anything. */}
      {challengeCount > 0 || showCertificate ? (
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5">
          {challengeCount > 0 && (
            <Tooltip label={`${t("challenges.entryTitle")} (${challengeCount})`}>
              <button
                type="button"
                onClick={() => router.push(`/${locale}/challenges/${track.id}`)}
                aria-label={`${t("challenges.entryTitle")} (${challengeCount})`}
                className="grid h-8 w-8 place-items-center rounded-full border-2 transition hover:opacity-80"
                style={{
                  borderColor: "var(--border-strong)",
                  background: "var(--surface-solid)",
                  color: "var(--text-muted)",
                }}
              >
                <Swords className="h-4 w-4" />
              </button>
            </Tooltip>
          )}
          {showCertificate && (
            <Tooltip label={certificateLabel}>
              <button
                type="button"
                onClick={onCertificateClick}
                aria-label={certificateLabel}
                className="grid h-8 w-8 place-items-center rounded-full border-2 transition hover:opacity-80"
                style={{
                  borderColor: earned ? "var(--reward)" : "var(--border-strong)",
                  background: "var(--surface-solid)",
                  color: earned ? "var(--reward)" : "var(--text-faint)",
                  boxShadow: earned
                    ? "0 0 12px color-mix(in srgb, var(--reward) 55%, transparent)"
                    : "none",
                }}
              >
                <Award className="h-4 w-4" />
              </button>
            </Tooltip>
          )}
        </div>
      ) : null}

      {/* Why the certificate is not theirs yet -- answered over the card
          rather than on a page of its own, because the answer is two
          sentences and sending someone to a separate screen to read a refusal
          is a dead end. It covers the card completely, so the link underneath
          cannot be hit while it is open, and it offers the one thing that
          actually helps: the way to the lessons. */}
      {showRequirement && (
        <div
          role="dialog"
          aria-label={t("cert.lockedTitle")}
          className="absolute inset-0 z-20 flex flex-col justify-center gap-2 overflow-hidden rounded-2xl border p-5 backdrop-blur-sm"
          style={{
            borderColor: `${track.color}66`,
            background: "color-mix(in srgb, var(--surface-solid) 94%, transparent)",
          }}
        >
          <button
            type="button"
            onClick={() => setShowRequirement(false)}
            aria-label={t("cert.dismiss")}
            className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-lg transition hover:opacity-70"
            style={{ color: "var(--text-faint)" }}
          >
            <X className="h-4 w-4" />
          </button>

          <span
            className="grid h-9 w-9 place-items-center rounded-xl"
            style={{ background: "var(--bg-2)", color: "var(--text-faint)" }}
          >
            <Lock className="h-4 w-4" />
          </span>
          <h3 className="text-sm font-extrabold text-strong">{t("cert.lockedTitle")}</h3>
          <p className="text-xs leading-relaxed text-muted">
            {t("cert.lockedBody").replace("{track}", track.title)}
          </p>
          <p className="text-xs font-bold" style={{ color: track.color }}>
            {done}/{total} · {remaining} {remaining === 1 ? t("cert.oneLeft") : t("cert.moreLeft")}
          </p>
          <button
            type="button"
            onClick={() => router.push(`/${locale}/roadmap/${track.id}`)}
            className="mt-1 inline-flex items-center gap-1.5 self-start rounded-xl px-3.5 py-2 text-xs font-black uppercase tracking-wide"
            style={{ background: track.color, color: "var(--surface-solid)" }}
          >
            {t("cert.goToLessons")}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
