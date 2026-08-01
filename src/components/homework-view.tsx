"use client";

/**
 * The learner's homework: what has been set, what they sent, what came back.
 *
 * The deadline is stated plainly and the consequence of missing it is stated
 * with it. "Due in 3 hours" next to a submit button that might refuse you is
 * a threat; "due in 3 hours -- after that it still sends, marked late" is
 * information. Nobody has to guess whether it is worth finishing.
 */
import { useCallback, useEffect, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import { AlertTriangle, CheckCircle2, ClipboardList, Clock, Loader2, Send, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme";
import { fetchAssignments, fetchMySubmissions, submitWork, submissionId } from "@/lib/homework";
import { isLateAt, pick, type AssignmentDoc, type SubmissionDoc } from "@/content/schema";
import { useLocale, useT } from "@/i18n/use-t";
import type { Locale } from "@/content/types";

export function HomeworkView() {
  const t = useT();
  const locale = useLocale() as Locale;
  const { user, profile } = useAuth();
  const { theme } = useTheme();
  const [items, setItems] = useState<AssignmentDoc[] | null>(null);
  const [mine, setMine] = useState<SubmissionDoc[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Set after mount: reading the clock during render is impure. */
  const [now, setNow] = useState(0);

  const uid = user?.uid ?? null;

  useEffect(() => {
    setNow(Date.now());
  }, []);

  const load = useCallback(async () => {
    if (!uid) return;
    try {
      const [list, subs] = await Promise.all([fetchAssignments(), fetchMySubmissions(uid)]);
      setItems(list);
      setMine(subs);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      setItems([]);
    }
  }, [uid]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!user) return null;

  const open = items?.find((a) => a.id === openId) ?? null;
  const submissionFor = (id: string) => mine.find((s) => s.id === submissionId(id, user.uid));

  function start(a: AssignmentDoc) {
    const existing = submissionFor(a.id);
    setOpenId(a.id);
    setCode(existing?.code ?? a.starterCode ?? "");
    setNote(existing?.note ?? "");
    setError(null);
  }

  async function send() {
    if (!open || !code.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await submitWork(open, user!.uid, profile?.displayName ?? "Learner", code, note);
      await load();
      setOpenId(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative z-10 mx-auto max-w-3xl px-4 pb-20 pt-8">
      <header className="mb-6">
        <h1 className="flex items-center gap-2.5 text-3xl font-extrabold tracking-tight text-strong">
          <ClipboardList className="h-7 w-7" style={{ color: "var(--advanced)" }} />
          {t("nav.homework")}
        </h1>
        <p className="mt-1.5 text-sm text-muted">{t("hw.intro")}</p>
      </header>

      {error && (
        <p
          className="mb-5 rounded-xl border p-3 text-sm"
          style={{
            borderColor: "color-mix(in srgb, var(--reward) 40%, transparent)",
            background: "color-mix(in srgb, var(--reward) 10%, transparent)",
            color: "var(--reward)",
          }}
        >
          {error}
        </p>
      )}

      {open ? (
        <section className="panel rounded-2xl p-5">
          <button
            onClick={() => setOpenId(null)}
            className="mb-3 text-xs font-bold text-faint underline decoration-2 underline-offset-2"
          >
            {t("contact.backToList")}
          </button>
          <h2 className="text-lg font-extrabold text-strong">{pick(open.title, locale)}</h2>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-muted">
            {pick(open.brief, locale)}
          </p>

          <Deadline dueAt={open.dueAt} now={now} t={t} />

          <div
            className="mt-4 overflow-hidden rounded-xl border"
            style={{ borderColor: "var(--border)" }}
          >
            <CodeMirror
              value={code}
              onChange={setCode}
              height="280px"
              theme={theme === "dark" ? oneDark : undefined}
              extensions={[python()]}
              basicSetup={{ lineNumbers: true, foldGutter: false }}
            />
          </div>

          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("hw.notePlaceholder")}
            className="field mt-3 w-full rounded-xl px-3 py-2.5 text-sm"
          />

          <button
            onClick={() => void send()}
            disabled={busy || !code.trim()}
            className="mt-3 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black disabled:opacity-40"
            style={{ background: "var(--advanced)", color: "var(--surface-solid)" }}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {submissionFor(open.id) ? t("hw.resend") : t("hw.send")}
          </button>
        </section>
      ) : items === null ? (
        <p className="text-sm text-faint">…</p>
      ) : items.length === 0 ? (
        <p className="panel rounded-2xl p-5 text-sm text-muted">{t("hw.none")}</p>
      ) : (
        <div className="space-y-3">
          {items.map((a) => {
            const sub = submissionFor(a.id);
            return (
              <div key={a.id} className="panel rounded-2xl p-4">
                <div className="flex flex-wrap items-start gap-x-3 gap-y-1.5">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-extrabold text-strong">
                      {pick(a.title, locale)}
                    </span>
                    <span className="mt-0.5 block line-clamp-2 text-xs leading-relaxed text-muted">
                      {pick(a.brief, locale)}
                    </span>
                  </span>
                  {sub && (
                    <span
                      className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider"
                      style={{
                        background: sub.late
                          ? "color-mix(in srgb, var(--reward) 16%, transparent)"
                          : "color-mix(in srgb, var(--cleared) 16%, transparent)",
                        color: sub.late ? "var(--reward)" : "var(--cleared)",
                      }}
                    >
                      {sub.late ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                      {sub.late ? t("hw.late") : t("hw.sent")}
                    </span>
                  )}
                </div>

                <Deadline dueAt={a.dueAt} now={now} t={t} compact />

                {sub?.feedback ? (
                  <div
                    className="mt-3 rounded-xl p-3"
                    style={{ background: "color-mix(in srgb, var(--advanced) 10%, transparent)" }}
                  >
                    <p className="mb-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-faint">
                      <ShieldCheck className="h-3 w-3" style={{ color: "var(--advanced)" }} />
                      {t("hw.feedback")}
                    </p>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-main">
                      {sub.feedback}
                    </p>
                  </div>
                ) : null}

                <button
                  onClick={() => start(a)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold text-main"
                  style={{ borderColor: "var(--border-strong)" }}
                >
                  {sub ? t("hw.openAgain") : t("hw.open")}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * The deadline, and what happens after it.
 *
 * Saying only "due in 3 hours" invites the reading that missing it means
 * losing the work. Saying what late actually costs -- a label, not a refusal
 * -- is the difference between a learner finishing at midnight and a learner
 * giving up at 23:50.
 */
function Deadline({
  dueAt,
  now,
  t,
  compact = false,
}: {
  dueAt: number | null;
  now: number;
  t: (k: "hw.noDeadline" | "hw.dueIn" | "hw.overdue" | "hw.lateNote") => string;
  compact?: boolean;
}) {
  if (dueAt === null) {
    return (
      <p className={`${compact ? "mt-2" : "mt-3"} text-xs font-bold text-faint`}>
        {t("hw.noDeadline")}
      </p>
    );
  }
  // now === 0 until the mount effect runs; showing "overdue" for one frame
  // because the clock has not been read yet would be a lie.
  if (now === 0) return null;

  const late = isLateAt(dueAt, now);
  const hours = Math.max(0, Math.round((dueAt - now) / 3_600_000));

  return (
    <p
      className={`${compact ? "mt-2" : "mt-3"} inline-flex items-center gap-1.5 text-xs font-bold`}
      style={{ color: late ? "var(--reward)" : "var(--text-muted)" }}
    >
      <Clock className="h-3.5 w-3.5" />
      {late ? t("hw.overdue") : t("hw.dueIn").replace("{h}", String(hours))}
      <span className="font-semibold text-faint">· {t("hw.lateNote")}</span>
    </p>
  );
}
