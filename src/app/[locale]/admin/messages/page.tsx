"use client";

/**
 * The staff inbox: every question a learner has asked, and the reply.
 *
 * Unanswered threads sort first regardless of age. An inbox ordered purely by
 * time buries the one thing it exists for -- the message nobody has answered
 * yet -- under a week of resolved conversations.
 */
import { useCallback, useEffect, useState } from "react";
import { Inbox, Loader2, Send, ShieldCheck } from "lucide-react";
import {
  fetchAllThreads,
  fetchMessages,
  markThreadRead,
  replyToThread,
} from "@/lib/contact";
import type { ContactMessage, ContactThread } from "@/content/schema";
import { AdminGuard } from "@/components/admin/admin-shell";
import { useT } from "@/i18n/use-t";

export default function AdminMessagesPage() {
  return (
    <AdminGuard>
      <Inboxes />
    </AdminGuard>
  );
}

function Inboxes() {
  const t = useT();
  const [threads, setThreads] = useState<ContactThread[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const all = await fetchAllThreads();
      // Waiting on us first, then most recent.
      all.sort((a, b) => {
        const aw = a.lastFrom === "student" ? 0 : 1;
        const bw = b.lastFrom === "student" ? 0 : 1;
        return aw - bw || b.updatedAt - a.updatedAt;
      });
      setThreads(all);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      setThreads([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function open(id: string) {
    setOpenId(id);
    setReply("");
    try {
      setMessages(await fetchMessages(id));
      await markThreadRead(id, "admin");
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function send() {
    if (!openId || !reply.trim()) return;
    setBusy(true);
    try {
      await replyToThread(openId, "admin", reply);
      setReply("");
      setMessages(await fetchMessages(openId));
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative z-10 mx-auto max-w-3xl px-4 pb-20 pt-8">
      <header className="mb-6">
        <h1 className="flex items-center gap-2.5 text-3xl font-extrabold text-strong">
          <Inbox className="h-7 w-7" style={{ color: "var(--neon)" }} />
          {t("contact.inboxTitle")}
        </h1>
        <p className="mt-1.5 text-sm text-muted">{t("contact.inboxIntro")}</p>
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

      {openId ? (
        <section className="panel rounded-2xl p-5">
          <button
            onClick={() => setOpenId(null)}
            className="mb-3 text-xs font-bold text-faint underline decoration-2 underline-offset-2"
          >
            {t("contact.backToList")}
          </button>
          <div className="space-y-2.5">
            {messages.map((m) => (
              <div
                key={m.id}
                className="rounded-xl p-3"
                style={{
                  background:
                    m.from === "admin"
                      ? "color-mix(in srgb, var(--advanced) 10%, transparent)"
                      : "var(--bg-2)",
                }}
              >
                <p className="mb-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-faint">
                  {m.from === "admin" && (
                    <ShieldCheck className="h-3 w-3" style={{ color: "var(--advanced)" }} />
                  )}
                  {m.from === "admin" ? t("contact.fromStaff") : t("contact.fromStudent")}
                </p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-main">{m.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <textarea
              rows={3}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder={t("contact.replyPlaceholder")}
              className="field w-full rounded-xl px-3 py-2.5 text-sm"
            />
            <button
              onClick={() => void send()}
              disabled={busy || !reply.trim()}
              className="mt-2 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black disabled:opacity-40"
              style={{ background: "var(--neon)", color: "var(--surface-solid)" }}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {t("contact.send")}
            </button>
          </div>
        </section>
      ) : threads === null ? (
        <p className="text-sm text-faint">…</p>
      ) : threads.length === 0 ? (
        <p className="panel rounded-2xl p-5 text-sm text-muted">{t("contact.inboxEmpty")}</p>
      ) : (
        <div className="space-y-2">
          {threads.map((th) => (
            <button
              key={th.id}
              onClick={() => void open(th.id)}
              className="panel flex w-full items-center gap-3 rounded-xl p-3.5 text-left transition hover:opacity-90"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-main">{th.subject}</span>
                <span className="mt-0.5 block truncate text-[11px] text-faint">
                  {th.displayName}
                  {th.email ? ` · ${th.email}` : ""}
                </span>
              </span>
              {th.lastFrom === "student" && (
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black"
                  style={{ background: "var(--reward)", color: "var(--surface-solid)" }}
                >
                  {t("contact.needsReply")}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
