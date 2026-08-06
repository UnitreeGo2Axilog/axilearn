"use client";

/**
 * The notebook a learner works in: cells that share one robot and one Python
 * namespace, run in order, with the simulation beside them.
 *
 * "Run this part" is the primary button on purpose. Letting people run cells
 * in any order is how notebooks earn their reputation: you edit cell 2, cell 5
 * still holds the old value, and now nothing makes sense and nothing is
 * visibly broken. Running the part top to bottom is always correct, so it is
 * the big button; running one cell is there for tinkering and is secondary.
 *
 * Every run of the part starts from a robot lying on the floor. That is not a
 * limitation, it is the point -- the same code always produces the same
 * result, which is the first thing a beginner needs to be able to trust.
 */
import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Loader2, Lightbulb, Eye, Check, X, Info, FileCode2 } from "lucide-react";
import { SimRunner, simSupported, type RunResult, type SimInfo } from "@/lib/sim-runner";
import { RobotViewport } from "@/components/robot-viewport";
import type { SimPart } from "@/content/sim-parts";
import { term } from "@/content/robot-glossary";
import type { Locale } from "@/content/types";
import { markLabPartDone } from "@/lib/lab-progress";
import { useAuth } from "@/lib/auth-context";
import { useProgress } from "@/lib/progress-context";

import { useT } from "@/i18n/use-t";

/**
 * Pull the ## TODO lines out of a cell so they can be shown properly.
 *
 * They were buried in the middle of a grey code block looking exactly like
 * every other comment, which is a poor way to mark the one thing the learner
 * is supposed to do. A textarea cannot colour individual lines, so instead
 * the instruction is lifted out and shown above the editor in the track's
 * colour -- while staying in the code, where it marks the spot.
 */
function todoLines(code: string): string[] {
  return code
    .split("\n")
    .filter((l) => l.trim().startsWith("##"))
    .map((l) => l.trim().replace(/^##\s?/, "").replace(/^TODO:\s*/i, ""))
    .filter(Boolean);
}

type Verdict = "none" | "pass" | "fail";

export function SimNotebook({
  part,
  locale,
  accent,
  trackId,
  onSolved,
}: {
  part: SimPart;
  locale: Locale;
  accent: string;
  trackId: string;
  /** Fired the first time this part's check passes. */
  onSolved?: () => void;
}) {
  const t = useT();
  const { user } = useAuth();
  const { refresh } = useProgress();
  const runner = useRef<SimRunner | null>(null);
  const [info, setInfo] = useState<SimInfo | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [supported] = useState(() => (typeof window === "undefined" ? true : simSupported()));

  // The learner's own text for each cell, keyed by cell id.
  const [code, setCode] = useState<Record<string, string>>(() =>
    Object.fromEntries(part.cells.map((c) => [c.id, c.code])),
  );
  const [revealed, setRevealed] = useState<Record<string, "hint" | "solution" | null>>({});
  const [result, setResult] = useState<RunResult | null>(null);
  const [output, setOutput] = useState("");
  const [runError, setRunError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [verdict, setVerdict] = useState<Verdict>("none");
  const [openTerm, setOpenTerm] = useState<string | null>(null);
  const [showReal, setShowReal] = useState(false);

  useEffect(() => {
    if (!supported) return;
    const r = new SimRunner();
    runner.current = r;
    r.warmUp().then(setInfo).catch((e: Error) => setLoadError(e.message));
    return () => r.dispose();
  }, [supported]);

  const say = (b: { en: string; fr: string }) => (locale === "fr" ? b.fr : b.en);

  /** Run every cell in order, in one namespace, from a fresh robot. */
  const runPart = async () => {
    if (!runner.current) return;
    setBusy(true);
    setRunError(null);
    setVerdict("none");
    try {
      let text = "";
      let last: RunResult | null = null;
      let failed = false;
      for (let i = 0; i < part.cells.length; i++) {
        const cell = part.cells[i];
        // Only the first cell resets; the rest inherit the robot and the
        // variables, which is what makes this a part and not five snippets.
        const res = await runner.current.run(code[cell.id] ?? cell.code, i > 0);
        text += res.output;
        last = res;
        if (res.error) {
          setRunError(res.error);
          failed = true;
          break;
        }
      }
      setOutput(text);
      // The recording of the WHOLE part is on the last result, because the
      // worker keeps recording across cells until something resets it.
      if (last) setResult(last);
      if (!failed) {
        const v = await runner.current.check(part.check);
        setVerdict(v.pass ? "pass" : "fail");
        if (v.pass) {
          // Written to Firestore so it survives a different computer and can
          // stand behind a certificate. A failed write must not silently
          // pretend the part was banked.
          if (user) {
            try {
              await markLabPartDone(user.uid, trackId, part.id);
              await refresh();
            } catch {
              setRunError(t("sim.saveFailed"));
            }
          }
          onSolved?.();
        }
      }
    } catch (e) {
      setRunError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  /** Run one cell on its own, keeping whatever is already there. */
  const runCell = async (cellId: string) => {
    if (!runner.current) return;
    setBusy(true);
    setRunError(null);
    try {
      const res = await runner.current.run(code[cellId] ?? "", true);
      setOutput(res.output);
      setResult(res);
      if (res.error) setRunError(res.error);
    } catch (e) {
      setRunError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    setCode(Object.fromEntries(part.cells.map((c) => [c.id, c.code])));
    setRevealed({});
    setResult(null);
    setOutput("");
    setRunError(null);
    setVerdict("none");
    await runner.current?.reset();
  };

  if (!supported) {
    return (
      <div className="rounded-2xl border p-5 text-sm text-muted" style={{ borderColor: "var(--border)" }}>
        {t("sim.unsupported")}
        {part.realVideo && (
          <video src={part.realVideo} controls playsInline className="mt-3 w-full rounded-xl" />
        )}
      </div>
    );
  }

  return (
    <section className="rounded-2xl border p-4 sm:p-5" style={{ borderColor: "var(--border)" }}>
      <h3 className="text-lg font-extrabold text-strong">{say(part.title)}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted">{say(part.intro)}</p>

      {/* New words, up front. A learner who does not know what a joint is
          cannot read the first cell, and hiding the definition behind a word
          buried in a paragraph means only the confident ones ever press it. */}
      {part.terms && part.terms.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wide text-faint">
            {t("sim.newWords")}
          </span>
          {part.terms.map((id) => {
            const g = term(id);
            if (!g) return null;
            const open = openTerm === id;
            return (
              <span key={id} className="relative">
                <button
                  onClick={() => setOpenTerm(open ? null : id)}
                  aria-expanded={open}
                  className="inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[12px] font-bold transition hover:opacity-70"
                  style={{
                    borderColor: open ? accent : "var(--border)",
                    color: open ? accent : "var(--text-muted)",
                  }}
                >
                  <Info className="h-3 w-3" />
                  {say(g.word)}
                </button>
              </span>
            );
          })}
        </div>
      )}

      {openTerm && term(openTerm) && (
        <p
          className="mt-2 rounded-xl border px-3 py-2 text-[13px] leading-relaxed text-main"
          style={{
            borderColor: `color-mix(in srgb, ${accent} 40%, transparent)`,
            background: `color-mix(in srgb, ${accent} 7%, transparent)`,
          }}
        >
          <strong>{say(term(openTerm)!.word)}</strong> — {say(term(openTerm)!.short)}
          {term(openTerm)!.more ? ` ${say(term(openTerm)!.more!)}` : ""}
        </p>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(300px,420px)]">
        {/* the cells */}
        <div className="space-y-4">
          {part.cells.map((cell, i) => (
            <div key={cell.id}>
              <div className="mb-1.5 flex items-baseline gap-2">
                <span
                  className="shrink-0 whitespace-nowrap font-robot text-[11px] font-bold tracking-[0.14em]"
                  style={{ color: cell.kind === "todo" ? accent : "var(--text-faint)" }}
                >
                  {cell.kind === "todo" ? t("sim.yourTurn") : `${i + 1}`}
                </span>
                <p className="text-sm leading-relaxed text-muted">{say(cell.explain)}</p>
              </div>

              {cell.kind === "todo" && todoLines(code[cell.id] ?? cell.code).length > 0 && (
                <div
                  className="mb-1.5 rounded-xl border-l-4 px-3 py-2"
                  style={{
                    borderColor: accent,
                    background: `color-mix(in srgb, ${accent} 12%, transparent)`,
                  }}
                >
                  {todoLines(code[cell.id] ?? cell.code).map((line, k) => (
                    <p
                      key={k}
                      className="font-robot text-[12.5px] font-bold leading-relaxed"
                      style={{ color: accent }}
                    >
                      {line}
                    </p>
                  ))}
                </div>
              )}

              <textarea
                value={code[cell.id] ?? cell.code}
                onChange={(e) => setCode((c) => ({ ...c, [cell.id]: e.target.value }))}
                spellCheck={false}
                rows={Math.min(12, (code[cell.id] ?? cell.code).split("\n").length + 1)}
                className={`w-full resize-y rounded-xl p-3 font-robot text-[13px] leading-relaxed text-main ${
                  cell.kind === "todo" ? "border-2" : "border"
                }`}
                style={{
                  borderColor: cell.kind === "todo" ? accent : "var(--border)",
                  background:
                    cell.kind === "todo"
                      ? `color-mix(in srgb, ${accent} 5%, var(--bg-2))`
                      : "var(--bg-2)",
                }}
              />

              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => runCell(cell.id)}
                  disabled={!info || busy}
                  className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[12px] font-bold text-muted transition hover:opacity-70 disabled:opacity-40"
                  style={{ borderColor: "var(--border)" }}
                >
                  <Play className="h-3 w-3" />
                  {t("sim.run")}
                </button>

                {cell.hint && (
                  <button
                    onClick={() => setRevealed((r) => ({ ...r, [cell.id]: r[cell.id] === "hint" ? null : "hint" }))}
                    className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[12px] font-bold text-muted transition hover:opacity-70"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <Lightbulb className="h-3 w-3" />
                    {t("sim.hint")}
                  </button>
                )}

                {cell.solution && (
                  <button
                    onClick={() => setRevealed((r) => ({ ...r, [cell.id]: "solution" }))}
                    className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[12px] font-bold text-muted transition hover:opacity-70"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <Eye className="h-3 w-3" />
                    {t("sim.showSolution")}
                  </button>
                )}
              </div>

              {revealed[cell.id] === "hint" && cell.hint && (
                <p
                  className="mt-2 rounded-xl border px-3 py-2 text-[13px] leading-relaxed text-main"
                  style={{ borderColor: `color-mix(in srgb, ${accent} 40%, transparent)`, background: `color-mix(in srgb, ${accent} 7%, transparent)` }}
                >
                  {say(cell.hint)}
                </p>
              )}

              {revealed[cell.id] === "solution" && cell.solution && (
                <div className="mt-2">
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-faint">
                    {t("sim.solutionLabel")}
                  </p>
                  {/* Their attempt stays above, on purpose: seeing the two
                      together is where the learning is. */}
                  <pre
                    className="overflow-x-auto rounded-xl border p-3 font-robot text-[13px] leading-relaxed text-main"
                    style={{ borderColor: "var(--border)", background: "var(--bg-2)" }}
                  >
                    {cell.solution}
                  </pre>
                  <button
                    onClick={() => setCode((c) => ({ ...c, [cell.id]: cell.solution! }))}
                    className="mt-1.5 text-[12px] font-bold underline decoration-dotted"
                    style={{ color: accent }}
                  >
                    {t("sim.useSolution")}
                  </button>
                </div>
              )}
            </div>
          ))}

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={runPart}
              disabled={!info || busy}
              data-testid="run-part"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black disabled:opacity-40"
              style={{ background: accent, color: "var(--surface-solid)" }}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {t("sim.runPart")}
            </button>
            <button
              onClick={reset}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold disabled:opacity-40"
              style={{ borderColor: "var(--border-strong)" }}
            >
              <RotateCcw className="h-4 w-4" />
              {t("sim.reset")}
            </button>
          </div>

          {/* The real thing. Shown AFTER they have made it work, not before:
              the point is "you did that, and here is the line it came from",
              which only lands once there is a "that". */}
          {part.realCode && (
            <div className="pt-2">
              <button
                onClick={() => setShowReal((v) => !v)}
                className="inline-flex items-center gap-1.5 text-[12px] font-bold underline decoration-dotted"
                style={{ color: accent }}
              >
                <FileCode2 className="h-3.5 w-3.5" />
                {showReal ? t("sim.hideRealCode") : t("sim.showRealCode")}
              </button>
              {showReal && (
                <div className="mt-2">
                  <p className="mb-1 font-robot text-[11px] text-faint">{part.realCode.file}</p>
                  <pre
                    className="overflow-x-auto rounded-xl border p-3 font-robot text-[12px] leading-relaxed text-main"
                    style={{ borderColor: "var(--border)", background: "var(--bg-2)" }}
                  >
                    {part.realCode.code}
                  </pre>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted">{say(part.realCode.note)}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* the robot */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          {!info && !loadError && (
            <div
              className="flex h-[300px] flex-col items-center justify-center rounded-2xl border text-center sm:h-[360px]"
              style={{ borderColor: "var(--border)", background: "var(--bg-2)" }}
            >
              <Loader2 className="h-6 w-6 animate-spin" style={{ color: accent }} />
              <p className="mt-3 text-sm font-bold text-main">{t("sim.loading")}</p>
              <p className="mt-1 max-w-[15rem] text-xs text-faint">{t("sim.loadingHint")}</p>
            </div>
          )}
          {loadError && (
            <div className="rounded-2xl border p-4 text-sm text-muted" style={{ borderColor: "var(--border)" }}>
              {t("sim.unsupported")}
              {part.realVideo && <video src={part.realVideo} controls playsInline className="mt-3 w-full rounded-xl" />}
            </div>
          )}
          {info && <RobotViewport geoms={info.geoms} result={result} accent={accent} />}

          {verdict !== "none" && (
            <div
              data-testid="verdict"
              className="mt-3 rounded-xl border p-3 text-[13px] leading-relaxed"
              style={{
                borderColor: verdict === "pass" ? `color-mix(in srgb, ${accent} 55%, transparent)` : "var(--border-strong)",
                background: verdict === "pass" ? `color-mix(in srgb, ${accent} 9%, transparent)` : "var(--bg-2)",
              }}
            >
              <p className="mb-1 flex items-center gap-1.5 font-black text-strong">
                {verdict === "pass" ? <Check className="h-4 w-4" style={{ color: accent }} /> : <X className="h-4 w-4 text-faint" />}
                {verdict === "pass" ? t("sim.gotIt") : t("sim.notYet")}
              </p>
              <p className="text-muted">{verdict === "pass" ? say(part.success) : say(part.failure)}</p>
            </div>
          )}

          {result?.truncated && <p className="mt-2 text-xs text-faint">{t("sim.truncated")}</p>}

          {/* Yours in the simulator, above; the actual machine, here. */}
          {part.realVideo && (
            <div className="mt-3">
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-faint">
                {t("sim.realRobot")}
              </p>
              <video
                src={part.realVideo}
                poster={part.realVideoPoster}
                controls
                muted
                loop
                playsInline
                preload="metadata"
                className="w-full rounded-xl border"
                style={{ borderColor: "var(--border)" }}
              />
              {part.realVideoNote && (
                <p className="mt-1.5 text-[12px] leading-relaxed text-faint">
                  {say(part.realVideoNote)}
                </p>
              )}
            </div>
          )}

          {(output || runError) && (
            <pre
              data-testid="sim-output"
              className="mt-3 max-h-52 overflow-auto rounded-xl border p-3 font-robot text-xs leading-relaxed"
              style={{
                borderColor: runError ? "#f87171" : "var(--border)",
                background: "var(--bg-2)",
                color: runError ? "#f87171" : "var(--text-main)",
              }}
            >
              {output}
              {runError ? `\n${runError}` : ""}
            </pre>
          )}
        </div>
      </div>
    </section>
  );
}
