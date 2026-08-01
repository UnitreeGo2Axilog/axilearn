"use client";

/**
 * Ask your teacher, and read what they said back.
 *
 * This replaces a mailto. The reason to build it rather than keep the link is
 * that a reply to an email lands in a mailbox a teenager may not check and
 * their teacher may not have; a reply here lands in the bell they already
 * look at, next to everything else about the course.
 *
 * It is deliberately not a forum. Every thread is between one learner and the
 * staff -- no classmate can read it, and there is nothing to moderate.
 */
import { LiveBackground } from "@/components/live-background";
import { useCallback, useEffect, useState } from "react";
import { Loader2, MessageCircle, Send, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  fetchMessages,
  fetchMyThreads,
  markThreadRead,
  replyToThread,
  startThread,
} from "@/lib/contact";
import type { ContactMessage, ContactThread } from "@/content/schema";
import { useT } from "@/i18n/use-t";

export function ContactView() {
  const t = useT();
  const { user, profile } = useAuth();
  const [threads, setThreads] = useState<ContactThread[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uid = user?.uid ?? null;

  const load = useCallback(async () => {
    if (!uid) return;
    try {
      setThreads(await fetchMyThreads(uid));
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      setThreads([]);
    }
  }, [uid]);

  useEffect(() => {
    void load();
  }, [load]);

  async function open(id: string) {
    setOpenId(id);
    setReply("");
    try {
      setMessages(await fetchMessages(id));
      await markThreadRead(id, "student");
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function send() {
    if (!uid || !subject.trim() || !text.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const id = await startThread(
        uid,
        profile?.displayName ?? "Learner",
        user?.email ?? null,
        subject,
        text,
      );
      setSubject("");
      setText("");
      await load();
      await open(id);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function sendReply() {
    if (!openId || !reply.trim()) return;
    setBusy(true);
    try {
      await replyToThread(openId, "student", reply);
      setReply("");
      setMessages(await fetchMessages(openId));
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (!user) return null;

  return (
    <>
      <LiveBackground />
    <div className="relative z-10 mx-auto max-w-2xl px-4 pb-20 pt-8">
      <header className="mb-6">
        <h1 className="flex items-center gap-2.5 text-3xl font-extrabold tracking-tight text-strong">
          <MessageCircle className="h-7 w-7" style={{ color: "var(--neon)" }} />
          {t("nav.contact")}
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{t("contact.intro")}</p>
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

      {/* the open conversation */}
      {openId ? (
        <section className="panel mb-6 rounded-2xl p-5">
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
                  // The staff reply is tinted and labelled. In a two-person
                  // thread the only thing that matters at a glance is which
                  // lines are the answer.
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
                  {m.from === "admin" ? t("contact.fromStaff") : t("contact.fromYou")}
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
              onClick={() => void sendReply()}
              disabled={busy || !reply.trim()}
              className="mt-2 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black disabled:opacity-40"
              style={{ background: "var(--neon)", color: "var(--surface-solid)" }}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {t("contact.send")}
            </button>
          </div>
        </section>
      ) : (
        <>
          {/* a new question */}
          <section className="panel mb-6 rounded-2xl p-5">
            <h2 className="mb-3 text-sm font-extrabold text-strong">{t("contact.newTitle")}</h2>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={80}
              placeholder={t("contact.subjectPlaceholder")}
              className="field mb-2.5 w-full rounded-xl px-3 py-2.5 text-sm"
            />
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("contact.bodyPlaceholder")}
              className="field w-full rounded-xl px-3 py-2.5 text-sm"
            />
            <button
              onClick={() => void send()}
              disabled={busy || !subject.trim() || !text.trim()}
              className="mt-3 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black disabled:opacity-40"
              style={{ background: "var(--neon)", color: "var(--surface-solid)" }}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {t("contact.send")}
            </button>
          </section>

          {/* past conversations */}
          {threads && threads.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-extrabold text-strong">{t("contact.yours")}</h2>
              <div className="space-y-2">
                {threads.map((th) => (
                  <button
                    key={th.id}
                    onClick={() => void open(th.id)}
                    className="panel flex w-full items-center gap-3 rounded-xl p-3.5 text-left transition hover:opacity-90"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-main">
                        {th.subject}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-faint">
                        {th.lastFrom === "admin" ? t("contact.staffReplied") : t("contact.waiting")}
                      </span>
                    </span>
                    {th.studentUnread && (
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black"
                        style={{ background: "var(--reward)", color: "var(--surface-solid)" }}
                      >
                        {t("contact.new")}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
    </>
  );
}
