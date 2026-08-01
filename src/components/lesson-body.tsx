"use client";

/**
 * A lesson, rendered: headings, prose, pictures of what the code does, and
 * code you can actually run without leaving the sentence that introduced it.
 *
 * The Kaggle shape, and it is the right one for a twelve-year-old: read two
 * paragraphs, press Run, see the number change, read two more. A lesson that
 * puts all its code in a panel on the right asks the reader to hold the
 * explanation in their head while they walk over to the example. At twelve,
 * they will not.
 *
 * ONE PYTHON RUNTIME for the whole page, shared by every code block on it.
 * Pyodide is a ~10 MB download and a second or two to start; paying that once
 * per code block would make a lesson with four examples unusable. The first
 * Run on the page is slow and every one after it is instant.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Play, RotateCcw } from "lucide-react";
import { PythonRunner, type RunResult } from "@/lib/python-runner";
import { parseInline, parseLessonBody, type Block, type FlowStep } from "@/lib/lesson-markup";
import { useT } from "@/i18n/use-t";

export function LessonBody({ body, accent }: { body: string; accent: string }) {
  const blocks = parseLessonBody(body);
  const runnerRef = useRef<PythonRunner | null>(null);

  useEffect(() => {
    const runner = new PythonRunner();
    runnerRef.current = runner;
    return () => {
      runnerRef.current = null;
      runner.dispose();
    };
  }, []);

  const run = useCallback(async (code: string) => {
    const runner = runnerRef.current;
    if (!runner) return null;
    return runner.run(code);
  }, []);

  return (
    <div className="space-y-4">
      {blocks.map((b, i) => (
        <BlockView key={i} block={b} accent={accent} run={run} />
      ))}
    </div>
  );
}

function BlockView({
  block,
  accent,
  run,
}: {
  block: Block;
  accent: string;
  run: (code: string) => Promise<RunResult | null>;
}) {
  switch (block.kind) {
    case "heading":
      return (
        <h3 className="pt-2 text-lg font-extrabold text-strong" style={{ color: accent }}>
          {block.text}
        </h3>
      );

    case "text":
      return (
        <p className="text-[15px] leading-[1.75] text-main">
          <Rich text={block.text} />
        </p>
      );

    case "list":
      return (
        <ul className="space-y-1.5 pl-1">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-2.5 text-[15px] leading-[1.7] text-main">
              <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: accent }} />
              <span>
                <Rich text={item} />
              </span>
            </li>
          ))}
        </ul>
      );

    case "callout":
      return <Callout tone={block.tone} text={block.text} />;

    case "flow":
      return <Flow steps={block.steps} accent={accent} />;

    case "code":
      return block.runnable ? (
        <RunnableCode code={block.code} accent={accent} run={run} />
      ) : (
        <pre
          className="overflow-x-auto rounded-xl p-3.5 text-[13px] leading-relaxed"
          style={{ background: "var(--bg)", color: "var(--text-main)" }}
        >
          <code>{block.code}</code>
        </pre>
      );
  }
}

/** **bold** and `code`, built from pieces rather than from a string of HTML. */
function Rich({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((p, i) =>
        p.kind === "bold" ? (
          <strong key={i} className="font-bold text-strong">
            {p.text}
          </strong>
        ) : p.kind === "code" ? (
          <code
            key={i}
            className="rounded px-1 py-0.5 font-robot text-[13px]"
            style={{ background: "var(--bg-2)", color: "var(--neon)" }}
          >
            {p.text}
          </code>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </>
  );
}

const TONES: Record<string, { label: string; color: string }> = {
  tip: { label: "💡", color: "var(--neon)" },
  warn: { label: "⚠️", color: "var(--reward)" },
  do: { label: "✅", color: "var(--cleared)" },
  dont: { label: "🚫", color: "var(--reward)" },
};

function Callout({ tone, text }: { tone: string; text: string }) {
  const { label, color } = TONES[tone] ?? TONES.tip;
  return (
    <div
      className="flex gap-2.5 rounded-xl border-l-4 p-3.5"
      style={{
        borderColor: color,
        background: `color-mix(in srgb, ${color} 8%, transparent)`,
      }}
    >
      <span aria-hidden className="text-sm leading-6">
        {label}
      </span>
      <p className="text-[14px] leading-[1.7] text-main">
        <Rich text={text} />
      </p>
    </div>
  );
}

/**
 * The flowchart from the Python for Everybody slides, in the platform's own
 * colours: rectangles for steps, a diamond edge for questions, and answers
 * stepped in under the question they belong to.
 *
 * Built from divs rather than an image, so it reads correctly in both themes,
 * survives being translated, and can be edited by a teacher who has never
 * opened a drawing program.
 */
function Flow({ steps, accent }: { steps: FlowStep[]; accent: string }) {
  return (
    <div
      className="space-y-1.5 overflow-x-auto rounded-xl border p-4"
      style={{ borderColor: "var(--border)", background: "var(--bg-2)" }}
    >
      {steps.map((s, i) => (
        <FlowRow key={i} step={s} accent={accent} last={i === steps.length - 1} />
      ))}
    </div>
  );
}

function FlowRow({ step, accent, last }: { step: FlowStep; accent: string; last: boolean }) {
  const branch = step.kind === "yes" || step.kind === "no";
  const ask = step.kind === "ask";

  return (
    <div className={branch ? "pl-8" : ""}>
      <div className="flex items-center gap-2">
        {branch && (
          <span
            className="font-robot text-[10px] font-black uppercase"
            style={{ color: step.kind === "yes" ? "var(--cleared)" : "var(--text-faint)" }}
          >
            {step.kind}
          </span>
        )}
        <span
          className="inline-block px-3 py-1.5 font-robot text-[13px] font-bold"
          style={{
            border: `2px solid ${ask ? accent : "var(--border-strong)"}`,
            // A question is not a step, so it does not look like one.
            borderRadius: ask ? "999px" : "8px",
            color: ask ? accent : "var(--text-main)",
            background: "var(--surface-solid)",
          }}
        >
          {step.text}
        </span>
      </div>
      {!last && (
        <span
          aria-hidden
          className={`ml-4 block h-3 w-px ${branch ? "ml-12" : ""}`}
          style={{ background: "var(--border-strong)" }}
        />
      )}
    </div>
  );
}

/**
 * A code block with a Run button under it.
 *
 * Output appears below the code and stays there, so a reader can scroll back
 * and see what the example did without running it again. Errors are shown as
 * errors rather than swallowed -- the whole point of letting them press Run
 * is that they find out what happens, including when it breaks.
 */
function RunnableCode({
  code,
  accent,
  run,
}: {
  code: string;
  accent: string;
  run: (code: string) => Promise<RunResult | null>;
}) {
  const t = useT();
  const [source, setSource] = useState(code);
  const [result, setResult] = useState<RunResult | null>(null);
  const [busy, setBusy] = useState(false);

  const dirty = source !== code;

  async function go() {
    setBusy(true);
    try {
      setResult(await run(source));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--border)" }}>
      {/* Editable, because the first thing anybody wants to do with an example
          is change the number and see what happens. Reset puts it back. */}
      <textarea
        value={source}
        onChange={(e) => setSource(e.target.value)}
        spellCheck={false}
        rows={Math.min(source.split("\n").length + 1, 16)}
        className="w-full resize-none border-0 px-3.5 py-3 font-robot text-[13px] leading-relaxed outline-none"
        style={{ background: "var(--bg)", color: "var(--text-main)" }}
      />

      <div
        className="flex flex-wrap items-center gap-2 border-t px-3 py-2"
        style={{ borderColor: "var(--border)", background: "var(--bg-2)" }}
      >
        <button
          onClick={() => void go()}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black disabled:opacity-50"
          style={{ background: accent, color: "var(--surface-solid)" }}
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
          {t("lesson.run")}
        </button>
        {dirty && (
          <button
            onClick={() => {
              setSource(code);
              setResult(null);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold text-muted"
            style={{ borderColor: "var(--border-strong)" }}
          >
            <RotateCcw className="h-3 w-3" />
            {t("lesson.reset")}
          </button>
        )}
        {busy && <span className="text-[11px] text-faint">{t("lesson.pythonLoading")}</span>}
      </div>

      {result && (
        <div
          className="border-t px-3.5 py-2.5 font-robot text-[12px] leading-relaxed"
          style={{ borderColor: "var(--border)", background: "var(--surface-solid)" }}
        >
          {result.loadFailed ? (
            <span style={{ color: "var(--reward)" }}>{t("lesson.pythonFailed")}</span>
          ) : result.timedOut ? (
            <span style={{ color: "var(--reward)" }}>{t("lesson.tooLong")}</span>
          ) : result.error ? (
            <span className="whitespace-pre-wrap" style={{ color: "var(--reward)" }}>
              {result.error}
            </span>
          ) : result.stdout.trim() ? (
            <span className="whitespace-pre-wrap text-main">{result.stdout}</span>
          ) : (
            <span className="text-faint">{t("lesson.ranNoOutput")}</span>
          )}
        </div>
      )}
    </div>
  );
}
