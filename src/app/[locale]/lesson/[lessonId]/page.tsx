import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Zap } from "lucide-react";
import { getT, isLocale } from "@/i18n/messages";
import { getChallenges, getLessonContent, getLessonLocation } from "@/content/store";
import type { Locale } from "@/content/types";
import { AuthGate } from "@/components/auth-gate";
import { LessonComplete } from "@/components/lesson-complete";
import { LessonQuiz } from "@/components/lesson-quiz";
import { LessonExercisePrompt } from "@/components/lesson-exercise-prompt";
import { CodeSandbox } from "@/components/code-sandbox";
import { LessonBody } from "@/components/lesson-body";
import { LessonSteps } from "@/components/lesson-steps";
import { LessonNav } from "@/components/lesson-nav";
import { BookmarkButton } from "@/components/bookmark-button";

/**
 * The Learning Studio, in the three-pane shape the tech spec describes:
 * instructions on the left, the code editor in the middle, its output on the
 * right. Python runs in the learner's own browser (see code-sandbox.tsx), so
 * no server ever executes anybody's code.
 *
 * A lesson only gets the editor if it carries `starterCode`. The rest stay
 * reading-and-quiz pages, which is right -- "What is Physical AI?" has nothing
 * to run, and two dead panels there would just look broken.
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

  const { track, level, prev, next, index } = found;
  const { body, quiz } = await getLessonContent(track.id, level.id, locale);
  // Only offer the exercise nudge when there is actually something to send
  // them to -- a prompt that leads to an empty page is worse than no prompt.
  const trackChallenges = await getChallenges(track.id, locale);
  const hasChallenges = trackChallenges.length > 0;
  // "Your turn" should hand over the exercise about THIS chapter, not drop the
  // learner into a list of thirty. Easy first; the harder ones are offered
  // once that one is solved.
  const startId = trackChallenges.find(
    (c) => c.lessonId === level.id && c.difficulty === "easy",
  )?.id;

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
          <div className="flex items-center gap-2">
            <span
              className="rounded-md px-2.5 py-1 font-robot text-[11px] font-bold tracking-[0.16em]"
              style={{
                background: `color-mix(in srgb, ${track.color} 14%, transparent)`,
                color: track.color,
              }}
            >
              {level.section ?? track.short}
            </span>
            <BookmarkButton lessonId={level.id} accent={track.color} />
          </div>
        </div>

        <LessonSteps
          levels={track.levels}
          index={index}
          locale={locale}
          accent={track.color}
          trackTitle={track.title}
        />

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

        {/* The reading, as one column.
            It used to be a narrow left rail beside the editor, which asks a
            reader to hold the explanation in their head while they look at
            the example somewhere else. The code now sits inside the text, at
            the moment it is being explained, and the workspace -- when the
            lesson has one -- comes after the reading rather than beside it. */}
        <section className="panel rounded-2xl p-5 sm:p-7">
          <h2
            className="mb-4 text-sm font-semibold uppercase tracking-wide"
            style={{ color: "var(--neon)" }}
          >
            {t("lesson.instructions")}
          </h2>

          {body ? (
            <LessonBody body={body} accent={track.color} />
          ) : (
            <p className="text-sm leading-relaxed text-muted">{level.shortDescription}</p>
          )}

          {level.skills.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-1.5">
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

        {/* "Your turn": the exercise comes after the reading, as it does on
            the sites this shape is borrowed from. */}
        {level.starterCode && (
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_minmax(240px,340px)]">
            <CodeSandbox starterCode={level.starterCode} />
          </div>
        )}

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

        {hasChallenges && (
          <LessonExercisePrompt
            trackId={track.id}
            trackTitle={track.title}
            accent={track.color}
            lessonId={level.id}
            startId={startId}
          />
        )}

        {/* Both directions, but forward has to be earned -- see LessonNav. */}
        <LessonNav
          lessonId={level.id}
          prev={prev}
          next={next}
          locale={locale}
          accent={track.color}
        />
      </div>
    </AuthGate>
  );
}
