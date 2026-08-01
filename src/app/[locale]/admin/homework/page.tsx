"use client";

/**
 * Setting homework, and marking it.
 *
 * The deadline defaults to 24 hours from now and can be switched off
 * entirely. It is stored as an absolute instant rather than a duration, so
 * the learner's screen, this list and the security rule all mean the same
 * moment -- and the rule is what actually decides whether a submission counts
 * as late, from the server's clock rather than the learner's.
 */
import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  ClipboardList,
  Loader2,
  Plus,
  Save,
  Send,
  Trash2,
  Paperclip,
  Users,
  X,
} from "lucide-react";
import {
  deleteAssignment,
  fetchSubmissionsFor,
  giveFeedback,
  listAssignments,
  saveAssignment,
} from "@/lib/homework";
import {
  DEFAULT_HOMEWORK_WINDOW_MS,
  type AssignmentDoc,
  type SubmissionDoc,
} from "@/content/schema";
import { AdminGuard, L10nInput, StatusToggle } from "@/components/admin/admin-shell";

/** A Firestore document caps at 1 MiB and base64 adds a third on top. */
const MAX_FILE_BYTES = 600 * 1024;
import { useT } from "@/i18n/use-t";

export default function AdminHomeworkPage() {
  return (
    <AdminGuard>
      <Board />
    </AdminGuard>
  );
}

function Board() {
  const t = useT();
  const [items, setItems] = useState<AssignmentDoc[] | null>(null);
  const [subs, setSubs] = useState<Record<string, SubmissionDoc[]>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    setNow(Date.now());
  }, []);

  const load = useCallback(async () => {
    try {
      setItems(await listAssignments());
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      setItems([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function addNew() {
    if (!now) return;
    const a: AssignmentDoc = {
      id: `hw-${now}`,
      status: "draft",
      title: { en: "" },
      brief: { en: "" },
      createdAt: now,
      dueAt: now + DEFAULT_HOMEWORK_WINDOW_MS,
    };
    setItems([a, ...(items ?? [])]);
  }

  function patch(id: string, changes: Partial<AssignmentDoc>) {
    setItems((prev) => (prev ?? []).map((a) => (a.id === id ? { ...a, ...changes } : a)));
  }

  async function persist(a: AssignmentDoc) {
    setBusy(a.id);
    setError(null);
    try {
      await saveAssignment(a);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function remove(id: string) {
    setBusy(id);
    try {
      await deleteAssignment(id);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function openSubs(id: string) {
    try {
      const list = await fetchSubmissionsFor(id);
      setSubs((prev) => ({ ...prev, [id]: list }));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="relative z-10 mx-auto max-w-3xl px-4 pb-20 pt-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2.5 text-3xl font-extrabold text-strong">
            <ClipboardList className="h-7 w-7" style={{ color: "var(--advanced)" }} />
            {t("hw.adminTitle")}
          </h1>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted">{t("hw.adminIntro")}</p>
        </div>
        <button
          onClick={addNew}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-black"
          style={{ background: "var(--advanced)", color: "var(--surface-solid)" }}
        >
          <Plus className="h-3.5 w-3.5" />
          {t("hw.adminNew")}
        </button>
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

      {items === null ? (
        <p className="text-sm text-faint">…</p>
      ) : items.length === 0 ? (
        <p className="panel rounded-2xl p-5 text-sm text-muted">{t("hw.adminEmpty")}</p>
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <div key={a.id} className="panel rounded-2xl p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="font-robot text-[11px] font-bold text-faint">{a.id}</span>
                <div className="ml-auto flex items-center gap-1.5">
                  <button
                    onClick={() => void persist(a)}
                    disabled={busy === a.id || !a.title.en.trim()}
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-black disabled:opacity-40"
                    style={{ background: "var(--cleared)", color: "var(--surface-solid)" }}
                  >
                    {busy === a.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Save className="h-3 w-3" />
                    )}
                    {t("admin.save")}
                  </button>
                  <button
                    onClick={() => void remove(a.id)}
                    aria-label={t("admin.remove")}
                    className="rounded-lg border p-1.5 text-faint"
                    style={{ borderColor: "var(--border-strong)" }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <L10nInput
                  label={t("hw.fTitle")}
                  value={a.title}
                  onChange={(title) => patch(a.id, { title })}
                />
                <L10nInput
                  label={t("hw.fBrief")}
                  value={a.brief}
                  onChange={(brief) => patch(a.id, { brief })}
                  rows={3}
                />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <StatusToggle status={a.status} onChange={(status) => patch(a.id, { status })} />
                {a.status !== "published" && (
                  <span className="text-[11px] font-bold" style={{ color: "var(--reward)" }}>
                    {t("hw.draftWarning")}
                  </span>
                )}

                {/* The switch the brief called for: on by default at 24h,
                    off means nothing is ever marked late. */}
                <label className="inline-flex items-center gap-2 text-xs font-bold text-main">
                  <input
                    type="checkbox"
                    checked={a.dueAt !== null}
                    onChange={(e) =>
                      patch(a.id, {
                        dueAt: e.target.checked ? (now || Date.now()) + DEFAULT_HOMEWORK_WINDOW_MS : null,
                      })
                    }
                  />
                  {t("hw.limitOn")}
                </label>

                {a.dueAt !== null && (
                  <input
                    type="datetime-local"
                    value={toLocalInput(a.dueAt)}
                    onChange={(e) => {
                      const ms = Date.parse(e.target.value);
                      if (!Number.isNaN(ms)) patch(a.id, { dueAt: ms });
                    }}
                    className="field rounded-xl px-3 py-2 text-xs"
                  />
                )}
              </div>

              {/* An attached brief. Held on the document as a data URL --
                  this project has no Cloud Storage bucket, and adding one
                  means rules and a billing decision for what is usually a
                  one-page PDF. The size cap is the price of that. */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <label
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold text-main"
                  style={{ borderColor: "var(--border-strong)" }}
                >
                  <Paperclip className="h-3.5 w-3.5" />
                  {a.file ? t("hw.fileReplace") : t("hw.fileAttach")}
                  <input
                    type="file"
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      e.target.value = "";
                      if (!f) return;
                      if (f.size > MAX_FILE_BYTES) {
                        setError(t("hw.fileTooBig"));
                        return;
                      }
                      const dataUrl = await new Promise<string>((resolve, reject) => {
                        const r = new FileReader();
                        r.onload = () => resolve(String(r.result));
                        r.onerror = () => reject(new Error("read failed"));
                        r.readAsDataURL(f);
                      });
                      setError(null);
                      patch(a.id, { file: { name: f.name, type: f.type, dataUrl } });
                    }}
                  />
                </label>
                {a.file && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                    {a.file.name}
                    <button
                      onClick={() => patch(a.id, { file: undefined })}
                      aria-label={t("admin.remove")}
                      className="text-faint"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                <span className="text-[11px] text-faint">{t("hw.fileHint")}</span>
              </div>

              <button
                onClick={() => void openSubs(a.id)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold text-main"
                style={{ borderColor: "var(--border-strong)" }}
              >
                <Users className="h-3.5 w-3.5" />
                {t("hw.viewSubs")}
              </button>

              {subs[a.id] && (
                <div className="mt-3 space-y-2">
                  {subs[a.id].length === 0 ? (
                    <p className="text-xs text-faint">{t("hw.noSubs")}</p>
                  ) : (
                    subs[a.id].map((s) => (
                      <SubmissionRow key={s.id} sub={s} t={t} onSaved={() => void openSubs(a.id)} />
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SubmissionRow({
  sub,
  t,
  onSaved,
}: {
  sub: SubmissionDoc;
  t: ReturnType<typeof useT>;
  onSaved: () => void;
}) {
  const [feedback, setFeedback] = useState(sub.feedback ?? "");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      await giveFeedback(sub.id, feedback);
      onSaved();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border p-3" style={{ borderColor: "var(--border)" }}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="text-xs font-extrabold text-strong">{sub.displayName}</span>
        {sub.late && (
          <span
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider"
            style={{
              background: "color-mix(in srgb, var(--reward) 16%, transparent)",
              color: "var(--reward)",
            }}
          >
            <AlertTriangle className="h-3 w-3" />
            {t("hw.late")}
          </span>
        )}
      </div>
      {sub.note && <p className="mb-2 text-[11px] italic text-muted">{sub.note}</p>}
      <pre
        className="max-h-56 overflow-auto rounded-lg p-2.5 text-[11px] leading-relaxed"
        style={{ background: "var(--bg)", color: "var(--text-main)" }}
      >
        <code>{sub.code}</code>
      </pre>
      <textarea
        rows={2}
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder={t("hw.feedbackPlaceholder")}
        className="field mt-2 w-full rounded-xl px-3 py-2 text-xs"
      />
      <button
        onClick={() => void save()}
        disabled={busy}
        className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-black disabled:opacity-40"
        style={{ background: "var(--advanced)", color: "var(--surface-solid)" }}
      >
        {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
        {t("hw.sendFeedback")}
      </button>
    </div>
  );
}

/** `datetime-local` wants local wall-clock text, not an ISO instant. */
function toLocalInput(ms: number): string {
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
