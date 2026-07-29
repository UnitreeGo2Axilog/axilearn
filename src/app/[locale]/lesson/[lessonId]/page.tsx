import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Play } from "lucide-react";
import { getT, isLocale } from "@/i18n/messages";
import { LESSONS, MODULES } from "@/content/seed";
import { t as pick, type Locale } from "@/content/types";
import { AuthGate } from "@/components/auth-gate";

/**
 * The Learning Studio shell, in the three-pane shape the tech spec describes:
 * instructions on the left, workspace in the middle, result on the right.
 * Phase 1 builds the frame; the Monaco editor and in-browser Python arrive in
 * Phase 3.
 */
export default async function LessonPage({
  params,
}: {
  params: Promise<{ locale: string; lessonId: string }>;
}) {
  const { locale: raw, lessonId } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const t = getT(locale);

  const ordered = [...LESSONS].sort((a, b) => a.order - b.order);
  const index = ordered.findIndex((l) => l.id === lessonId);
  if (index === -1) notFound();

  const lesson = ordered[index];
  const next = ordered[index + 1] ?? null;
  const module = MODULES.find((m) => m.id === lesson.moduleId);

  return (
    <AuthGate>
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href={`/${locale}/track/${lesson.trackId}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-cyan-300"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("lesson.backToMap")}
        </Link>
        <span
          className="rounded-full px-3 py-1 text-xs font-semibold text-white"
          style={{ backgroundColor: module?.color ?? "#64748b" }}
        >
          {module ? pick(module.title, locale) : ""}
        </span>
      </div>

      <h1 className="mb-1 text-2xl font-bold text-strong">{pick(lesson.title, locale)}</h1>
      <p className="mb-6 text-sm text-strong0">
        {lesson.points} {t("track.points")} · {lesson.type.replace("_", " ")}
      </p>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr_320px]">
        {/* instructions */}
        <section className="panel rounded-xl p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--neon)" }}>
            {t("lesson.instructions")}
          </h2>
          <p className="text-sm leading-relaxed text-main">
            {pick(lesson.body, locale)}
          </p>
        </section>

        {/* workspace */}
        <section className="panel panel-glow rounded-xl p-4 text-slate-100">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              {t("lesson.workspace")}
            </h2>
            <span className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-md bg-emerald-600/60 px-2.5 py-1 text-xs font-medium">
              <Play className="h-3 w-3" />
              {t("lesson.run")}
            </span>
          </div>
          <pre className="min-h-[220px] whitespace-pre-wrap rounded-lg p-3 font-mono text-xs text-main" style={{ background: "var(--bg)" }}>
{lesson.initialCode ?? `# ${t("lesson.comingSoon")}`}
          </pre>
        </section>

        {/* output */}
        <section className="panel rounded-xl p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--neon)" }}>
            {t("lesson.output")}
          </h2>
          <div className="grid min-h-[220px] place-items-center rounded-lg border border-cyan-400/10 bg-[#050914]/70 text-center text-sm text-strong0">
            {t("lesson.comingSoon")}
          </div>
        </section>
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
