import { getT, isLocale } from "@/i18n/messages";
import type { Locale } from "@/content/types";
import { Info } from "lucide-react";

/**
 * What AxiLearn is built from, and what was consulted while building it.
 *
 * A deliberate page rather than a README nobody opens: an internship
 * deliverable is judged partly on whether its sources are stated. Every entry
 * carries the date it was consulted, which is the convention for citing
 * anything that can change under you -- and documentation always can.
 *
 * The list is the real dependency set, taken from package.json, not a
 * plausible-looking one. Versions are pinned here as they shipped.
 */
export const metadata = { title: "Info & resources" };

interface Resource {
  name: string;
  version?: string;
  what: string;
  url: string;
}

const CONSULTED = "2026-08-01";

const BUILT_WITH: Resource[] = [
  { name: "Next.js", version: "16.2.12", what: "App Router, server components, routing", url: "https://nextjs.org/docs" },
  { name: "React", version: "19.2.4", what: "the interface layer", url: "https://react.dev" },
  { name: "TypeScript", version: "5", what: "types across the whole codebase", url: "https://www.typescriptlang.org/docs/" },
  { name: "Tailwind CSS", version: "4", what: "styling", url: "https://tailwindcss.com/docs" },
  { name: "Firebase", version: "12.16.0", what: "authentication and Firestore database", url: "https://firebase.google.com/docs" },
  { name: "Pyodide", version: "0.26.4", what: "Python running inside the browser, for the code editor", url: "https://pyodide.org/en/stable/" },
  { name: "CodeMirror", version: "6", what: "the code editor itself", url: "https://codemirror.net/docs/" },
  { name: "Three.js", version: "0.185.1", what: "the animated background on the challenges page", url: "https://threejs.org/docs/" },
  { name: "Framer Motion", version: "12", what: "animation on the mission map", url: "https://motion.dev/docs" },
  { name: "Lucide", version: "1.27", what: "the icon set", url: "https://lucide.dev/icons/" },
];

const INSPIRED_BY: Resource[] = [
  { name: "Python for Everybody", what: "how the Python chapters explain conditions and loops -- the flowchart shapes and the sequential / conditional / repeated framing come from this course (CC BY)", url: "https://www.py4e.com/" },
  { name: "Kaggle Learn", what: "lesson shape: read a little, then immediately try it", url: "https://www.kaggle.com/learn" },
  { name: "HackerRank", what: "challenge shape: a problem, tests, and an editorial that costs you something", url: "https://www.hackerrank.com/domains/python" },
];

export default async function InfoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const t = getT(locale);

  return (
    <div className="relative z-10 mx-auto max-w-3xl px-4 pb-20 pt-8">
      <header className="mb-6">
        <h1 className="flex items-center gap-2.5 text-3xl font-extrabold tracking-tight text-strong">
          <Info className="h-7 w-7" style={{ color: "var(--neon)" }} />
          {t("nav.info")}
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{t("info.intro")}</p>
      </header>

      <Section title={t("info.builtWith")} items={BUILT_WITH} consultedLabel={t("info.consulted")} />
      <Section title={t("info.inspiredBy")} items={INSPIRED_BY} consultedLabel={t("info.consulted")} />

      <p className="mt-8 text-xs leading-relaxed text-faint">{t("info.note")}</p>
    </div>
  );
}

function Section({
  title,
  items,
  consultedLabel,
}: {
  title: string;
  items: Resource[];
  consultedLabel: string;
}) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-lg font-extrabold text-strong">{title}</h2>
      <div className="space-y-2">
        {items.map((r) => (
          <a
            key={r.name}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="panel block rounded-xl p-3.5 transition hover:opacity-90"
          >
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-sm font-bold text-strong">{r.name}</span>
              {r.version && (
                <span className="font-robot text-[11px] font-bold text-faint">v{r.version}</span>
              )}
              <span className="ml-auto text-[11px] text-faint">
                {consultedLabel} {CONSULTED}
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted">{r.what}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
