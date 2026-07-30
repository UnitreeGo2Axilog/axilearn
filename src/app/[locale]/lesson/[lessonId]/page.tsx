import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, Play, Zap } from "lucide-react";
import { getT, isLocale } from "@/i18n/messages";
import { getLessonContent, getLessonLocation } from "@/content/store";
import type { Locale } from "@/content/types";
import { AuthGate } from "@/components/auth-gate";
import { LessonComplete } from "@/components/lesson-complete";
import { LessonQuiz } from "@/components/lesson-quiz";

/**
 * The Learning Studio shell, in the three-pane shape the tech spec describes:
 * instructions on the left, workspace in the middle, result on the right. The
 * editor and in-browser Python arrive in Phase 3; the reading, the video and
 * the navigation are real now.
 *
 * The lesson comes from the same content store as the maps, so a lesson the
 * supervisor writes in the CMS appears here with no code change. There is no
 * second copy of the curriculum any more.
 */
export default async function LessonPage({
  params,
}: {
  params: Promise<{ locale: string; lessonId: string }>;
}) {
  const { locale: raw, lessonId } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const t = getT(locale);

  const found = await getLessonLocation(locale, lessonId);
  if (!found) notFound();

  const { track, level, next } = found;
  const { body, quiz } = await getLessonContent(track.id, level.id, locale);

  return (
    <AuthGate>
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/${locale}/roadmap/${track.id}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:opacity-80"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("lesson.backToMap")}
          </Link>
          <span
            className="rounded-md px-2.5 py-1 font-robot text-[11px] font-bold tracking-[0.16em]"
            style={{
              background: `color-mix(in srgb, ${track.color} 14%, transparent)`,
              color: track.color,
            }}
          >
            {level.section ?? track.short}
          </span>
        </div>

        <h1 className="mb-1 text-2xl font-extrabold text-strong">{level.title}</h1>
        <p className="mb-2 text-sm text-muted">{level.shortDescription}</p>
        <div className="mb-6 flex flex-wrap items-center gap-3 text-xs font-semibold text-faint">
          <span className="inline-flex items-center gap-1">
            <Zap className="h-3.5 w-3.5" style={{ color: "var(--reward)" }} />
            {level.xpReward} XP
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {level.durationMinutes} min
          </span>
          <span>{level.type.replace("_", " ")}</span>
          <span>{level.difficulty}</span>
        </div>

        {/* video, when the lesson has one -- nocookie host, so watching a
            lesson does not hand YouTube a tracking cookie for a minor. */}
        {level.videoId && (
          <div
            className="mb-6 overflow-hidden rounded-2xl border"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="relative aspect-video w-full">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${level.videoId}`}
                title={level.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-[minmax(280px,340px)_1fr_minmax(240px,320px)]">
          {/* instructions */}
          <section className="panel rounded-xl p-4">
            <h2
              className="mb-3 text-sm font-semibold uppercase tracking-wide"
              style={{ color: "var(--neon)" }}
            >
              {t("lesson.instructions")}
            </h2>
            {body ? (
              <div className="space-y-3 text-sm leading-relaxed text-main">
                {body.split(/\n{2,}/).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-muted">{level.shortDescription}</p>
            )}

            {level.skills.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {level.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md px-2 py-0.5 text-[11px] font-semibold text-faint"
                    style={{ background: "var(--bg-2)" }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* workspace */}
          <section className="panel panel-glow rounded-xl p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
                {t("lesson.workspace")}
              </h2>
              <span
                className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium"
                style={{ background: "var(--bg-2)", color: "var(--text-faint)" }}
              >
                <Play className="h-3 w-3" />
                {t("lesson.run")}
              </span>
            </div>
            <pre
              className="min-h-[220px] whitespace-pre-wrap rounded-lg p-3 font-mono text-xs text-main"
              style={{ background: "var(--bg)" }}
            >
              {`# ${t("lesson.comingSoon")}`}
            </pre>
          </section>

          {/* output */}
          <section className="panel rounded-xl p-4">
            <h2
              className="mb-3 text-sm font-semibold uppercase tracking-wide"
              style={{ color: "var(--neon)" }}
            >
              {t("lesson.output")}
            </h2>
            <div
              className="grid min-h-[220px] place-items-center rounded-lg border p-3 text-center text-sm text-muted"
              style={{ borderColor: "var(--border)", background: "var(--bg)" }}
            >
              {t("lesson.comingSoon")}
            </div>
          </section>
        </div>

        {/* completion -- the only write a learner makes, and what every
            progress number on the platform is counted from. A lesson with a
            quiz can only be marked done by passing it; one without falls
            back to the plain button, so lessons that don't have a quiz yet
            still work. */}
        <div className="mt-6">
          {quiz ? (
            <LessonQuiz
              trackId={track.id}
              lessonId={level.id}
              quiz={quiz}
              xp={level.xpReward}
              accent={track.color}
            />
          ) : (
            <LessonComplete
              trackId={track.id}
              lessonId={level.id}
              xp={level.xpReward}
              accent={track.color}
            />
          )}
        </div>

        {next && (
          <div className="mt-6 flex justify-end">
            <Link
              href={`/${locale}/lesson/${next.id}`}
              className="btn-neon inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold"
            >
              {t("lesson.next")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </AuthGate>
  );
}
