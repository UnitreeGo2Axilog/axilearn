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
import {
  groupFlow,
  parseInline,
  parseLessonBody,
  type Block,
  type FlowNode,
} from "@/lib/lesson-markup";
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
      return <Flow nodes={groupFlow(block.steps)} accent={accent} />;

    case "progout":
      return <ProgramOutput program={block.program} output={block.output} accent={accent} />;

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
 * An activity diagram: a spine of steps, with each question sending a labelled
 * branch off to the side that rejoins underneath.
 *
 * Built from elements rather than an image, which costs some fidelity against
 * a hand-drawn slide and buys three things that matter more here: it reads in
 * both themes, the labels translate with the rest of the lesson, and a teacher
 * can change one by editing four lines of text.
 *
 * The decision shape is a cut-corner hexagon rather than a true diamond. A
 * diamond wide enough to hold "battery > 20 and distance > 10 ?" is enormous;
 * flattening it keeps the "this is a question, not an instruction" reading at
 * any sentence length, in any language.
 */
function Flow({ nodes, accent }: { nodes: FlowNode[]; accent: string }) {
  return (
    <div
      className="overflow-x-auto rounded-xl border p-4 sm:p-5"
      style={{ borderColor: "var(--border)", background: "var(--bg-2)" }}
    >
      <div className="min-w-[300px]">
        {nodes.map((n, i) => (
          <FlowNodeView key={i} node={n} accent={accent} last={i === nodes.length - 1} />
        ))}
      </div>
    </div>
  );
}

function FlowNodeView({
  node,
  accent,
  last,
}: {
  node: FlowNode;
  accent: string;
  last: boolean;
}) {
  if (node.kind === "step") {
    return (
      <div>
        <Box text={node.text} />
        {!last && <Down />}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start gap-0">
        <Decision text={node.question} accent={accent} />

        {node.yes.length > 0 && (
          <Branch label="Yes" tone="var(--cleared)" items={node.yes} />
        )}
      </div>

      {node.no.length > 0 && (
        <div className="flex items-start gap-0">
          <span
            className="ml-4 mt-1 font-robot text-[10px] font-black uppercase"
            style={{ color: "var(--text-faint)" }}
          >
            No
          </span>
          <div className="ml-2 mt-1 space-y-1">
            {node.no.map((t, i) => (
              <Box key={i} text={t} />
            ))}
          </div>
        </div>
      )}

      {!last && <Down />}
    </div>
  );
}

/** A branch that goes out to the right and comes back. */
function Branch({ label, tone, items }: { label: string; tone: string; items: string[] }) {
  return (
    <div className="flex items-center">
      <span
        aria-hidden
        className="h-px w-5 shrink-0"
        style={{ background: "var(--border-strong)" }}
      />
      <span className="mr-2 font-robot text-[10px] font-black uppercase" style={{ color: tone }}>
        {label}
      </span>
      <div className="space-y-1">
        {items.map((t, i) => (
          <Box key={i} text={t} />
        ))}
      </div>
    </div>
  );
}

function Box({ text }: { text: string }) {
  return (
    <span
      className="inline-block rounded-lg px-3 py-1.5 font-robot text-[12px] font-bold"
      style={{
        border: "2px solid var(--border-strong)",
        color: "var(--text-main)",
        background: "var(--surface-solid)",
      }}
    >
      {text}
    </span>
  );
}

function Decision({ text, accent }: { text: string; accent: string }) {
  // Two stacked clipped layers: the outer one is the border colour, the inner
  // is inset by 2px, which draws an outline that clip-path alone cannot.
  const shape = "polygon(14px 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 14px 100%, 0 50%)";
  return (
    <span className="relative inline-block shrink-0">
      <span aria-hidden className="absolute inset-0" style={{ background: accent, clipPath: shape }} />
      <span
        aria-hidden
        className="absolute"
        style={{ inset: 2, background: "var(--surface-solid)", clipPath: shape }}
      />
      <span
        className="relative block px-6 py-1.5 font-robot text-[12px] font-bold"
        style={{ color: accent }}
      >
        {text}
      </span>
    </span>
  );
}

/** The vertical connector, with an arrowhead. */
function Down() {
  return (
    <span aria-hidden className="ml-5 flex h-5 flex-col items-center">
      <span className="w-px flex-1" style={{ background: "var(--border-strong)" }} />
      <span
        className="h-0 w-0"
        style={{
          borderLeft: "4px solid transparent",
          borderRight: "4px solid transparent",
          borderTop: "5px solid var(--border-strong)",
        }}
      />
    </span>
  );
}

/**
 * A program and what it printed, side by side.
 *
 * The pairing the reference slides use, and it does something a runnable cell
 * cannot: it lets a reader check their PREDICTION before running anything.
 * Guessing the output first is the part that teaches; a Run button invites
 * skipping straight to the answer.
 */
function ProgramOutput({
  program,
  output,
  accent,
}: {
  program: string;
  output: string;
  accent: string;
}) {
  const t = useT();
  return (
    <div
      className="grid gap-px overflow-hidden rounded-xl border sm:grid-cols-[1fr_auto]"
      style={{ borderColor: "var(--border)", background: "var(--border)" }}
    >
      <div style={{ background: "var(--bg)" }}>
        <p
          className="px-3.5 pt-2.5 font-robot text-[10px] font-black uppercase tracking-wider"
          style={{ color: accent }}
        >
          {t("lesson.program")}
        </p>
        <pre className="overflow-x-auto px-3.5 pb-3 pt-1 text-[13px] leading-relaxed">
          <code style={{ color: "var(--text-main)" }}>{program}</code>
        </pre>
      </div>
      <div className="sm:min-w-[140px]" style={{ background: "var(--surface-solid)" }}>
        <p
          className="px-3.5 pt-2.5 font-robot text-[10px] font-black uppercase tracking-wider"
          style={{ color: "var(--cleared)" }}
        >
          {t("lesson.output")}
        </p>
        <pre className="overflow-x-auto px-3.5 pb-3 pt-1 text-[13px] leading-relaxed">
          <code style={{ color: "var(--cleared)" }}>{output}</code>
        </pre>
      </div>
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
