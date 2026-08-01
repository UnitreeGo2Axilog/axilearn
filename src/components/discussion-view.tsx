"use client";

/**
 * The shared room: everyone on the platform, one conversation.
 *
 * CODE IS THE POINT, so it gets treated as code. Anything inside triple
 * backticks renders as a block in a monospace face rather than as prose with
 * the indentation collapsed -- which is what would happen otherwise, and
 * indentation is not decoration in Python.
 *
 * REPLIES quote the message they answer, and the quote is stored on the reply
 * rather than looked up. Moderation means messages get deleted; a reply whose
 * context vanishes with the message it answered is a conversation with holes
 * in it.
 *
 * MODERATION is visible, not hidden in an admin screen: an admin sees delete
 * on every message and block on every author, in the room, while reading it.
 * A moderation tool you have to go somewhere else to use is a moderation tool
 * nobody uses.
 */
import { LiveBackground } from "@/components/live-background";
import { useCallback, useEffect, useRef, useState } from "react";
import { Ban, Eraser, Loader2, MessagesSquare, Reply, Send, Trash2, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useActivity } from "@/lib/activity-context";
import {
  clearDiscussion,
  deleteMessage,
  postMessage,
  setBlocked,
  watchDiscussion,
} from "@/lib/discussion";
import { Avatar } from "@/components/avatar";
import type { DiscussionMessage } from "@/content/schema";
import { useT } from "@/i18n/use-t";

export function DiscussionView() {
  const t = useT();
  const { user, profile } = useAuth();
  const { see } = useActivity();
  const [messages, setMessages] = useState<DiscussionMessage[] | null>(null);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<DiscussionMessage | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const isAdmin = profile?.role === "admin";
  const blocked = profile?.blocked === true;

  useEffect(() => {
    void see("discussion");
  }, [see]);

  useEffect(() => {
    if (!user) return;
    const stop = watchDiscussion(
      (list) => {
        setMessages(list);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setMessages([]);
      },
    );
    return stop;
  }, [user]);

  // Follow the conversation down as it grows, the way a chat should.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  const send = useCallback(async () => {
    if (!user || !text.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await postMessage(user.uid, profile?.displayName ?? "Learner", text, replyTo ?? undefined);
      setText("");
      setReplyTo(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }, [user, profile, text, replyTo]);

  if (!user) return null;

  return (
    <>
      <LiveBackground />
    <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-3xl flex-col px-4 pb-6 pt-8">
      <header className="mb-4">
        <h1 className="flex items-center gap-2.5 text-3xl font-extrabold tracking-tight text-strong">
          <MessagesSquare className="h-7 w-7" style={{ color: "var(--cleared)" }} />
          {t("nav.discussion")}
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{t("disc.intro")}</p>

        {isAdmin && (messages?.length ?? 0) > 0 && (
          // Two steps, like blocking. Emptying a room is not undoable and it
          // takes everybody's messages with it, not just the one that was
          // annoying.
          <button
            onClick={async () => {
              if (!confirmClear) {
                setConfirmClear(true);
                return;
              }
              try {
                await clearDiscussion();
                setConfirmClear(false);
              } catch (err) {
                setError((err as Error).message);
              }
            }}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition hover:opacity-80"
            style={{
              borderColor: confirmClear ? "var(--reward)" : "var(--border-strong)",
              color: confirmClear ? "var(--reward)" : "var(--text-muted)",
            }}
          >
            <Eraser className="h-3.5 w-3.5" />
            {confirmClear ? t("disc.clearConfirm") : t("disc.clear")}
          </button>
        )}
      </header>

      {error && (
        <p
          className="mb-4 rounded-xl border p-3 text-sm"
          style={{
            borderColor: "color-mix(in srgb, var(--reward) 40%, transparent)",
            background: "color-mix(in srgb, var(--reward) 10%, transparent)",
            color: "var(--reward)",
          }}
        >
          {error}
        </p>
      )}

      <div className="panel mb-3 flex-1 space-y-3 overflow-y-auto rounded-2xl p-4">
        {messages === null ? (
          <p className="text-sm text-faint">…</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted">{t("disc.empty")}</p>
        ) : (
          messages.map((m) => (
            <Message
              key={m.id}
              m={m}
              mine={m.uid === user.uid}
              isAdmin={isAdmin}
              t={t}
              onReply={() => setReplyTo(m)}
              onDelete={async () => {
                try {
                  await deleteMessage(m.id);
                } catch (err) {
                  setError((err as Error).message);
                }
              }}
              onBlock={async () => {
                try {
                  await setBlocked(m.uid, true);
                } catch (err) {
                  setError((err as Error).message);
                }
              }}
            />
          ))
        )}
        <div ref={endRef} />
      </div>

      {blocked ? (
        <p
          className="rounded-xl border p-3 text-sm"
          style={{
            borderColor: "color-mix(in srgb, var(--reward) 40%, transparent)",
            color: "var(--reward)",
          }}
        >
          {t("disc.blocked")}
        </p>
      ) : (
        <div className="panel rounded-2xl p-3">
          {replyTo && (
            <div
              className="mb-2 flex items-start gap-2 rounded-lg p-2"
              style={{ background: "var(--bg-2)" }}
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] font-black uppercase tracking-wider text-faint">
                  {t("disc.replyingTo")} {replyTo.displayName}
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted">{replyTo.text}</span>
              </span>
              <button
                onClick={() => setReplyTo(null)}
                aria-label={t("disc.cancelReply")}
                className="shrink-0 text-faint"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <textarea
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("disc.placeholder")}
            className="field w-full rounded-xl px-3 py-2.5 text-sm"
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-[11px] text-faint">{t("disc.codeHint")}</span>
            <button
              onClick={() => void send()}
              disabled={busy || !text.trim()}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black disabled:opacity-40"
              style={{ background: "var(--cleared)", color: "var(--surface-solid)" }}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {t("disc.send")}
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

function Message({
  m,
  mine,
  isAdmin,
  t,
  onReply,
  onDelete,
  onBlock,
}: {
  m: DiscussionMessage;
  mine: boolean;
  isAdmin: boolean;
  t: ReturnType<typeof useT>;
  onReply: () => void;
  onDelete: () => Promise<void>;
  onBlock: () => Promise<void>;
}) {
  const [confirmBlock, setConfirmBlock] = useState(false);

  return (
    <div className="flex gap-2.5">
      <Avatar uid={m.uid} displayName={m.displayName} size={30} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-xs font-extrabold text-strong">{m.displayName}</span>
          {mine && <span className="text-[10px] font-bold text-faint">{t("disc.you")}</span>}

          <span className="ml-auto flex items-center gap-1">
            <button
              onClick={onReply}
              aria-label={t("disc.reply")}
              title={t("disc.reply")}
              className="rounded p-1 text-faint transition hover:opacity-80"
            >
              <Reply className="h-3.5 w-3.5" />
            </button>
            {(mine || isAdmin) && (
              <button
                onClick={() => void onDelete()}
                aria-label={t("disc.delete")}
                title={t("disc.delete")}
                className="rounded p-1 text-faint transition hover:opacity-80"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
            {isAdmin && !mine && (
              // Two steps on purpose. Deleting a message is reversible by
              // reposting it; silencing a person is not something to do by
              // brushing a button.
              <button
                onClick={() => (confirmBlock ? void onBlock() : setConfirmBlock(true))}
                aria-label={t("disc.block")}
                title={t("disc.block")}
                className="inline-flex items-center gap-1 rounded p-1 text-[10px] font-black uppercase transition hover:opacity-80"
                style={{ color: confirmBlock ? "var(--reward)" : "var(--text-faint)" }}
              >
                <Ban className="h-3.5 w-3.5" />
                {confirmBlock && t("disc.blockConfirm")}
              </button>
            )}
          </span>
        </div>

        {m.replyToExcerpt && (
          <div
            className="my-1 rounded-lg border-l-2 py-1 pl-2"
            style={{ borderColor: "var(--border-strong)" }}
          >
            <span className="block text-[10px] font-bold text-faint">{m.replyToName}</span>
            <span className="block text-[11px] leading-relaxed text-muted">
              {m.replyToExcerpt}
            </span>
          </div>
        )}

        <MessageBody text={m.text} />
      </div>
    </div>
  );
}

/**
 * Prose stays prose; anything fenced in triple backticks becomes a code
 * block. Without this, shared Python arrives with its indentation collapsed,
 * which for Python means it arrives wrong.
 */
function MessageBody({ text }: { text: string }) {
  const parts = text.split(/```/);
  return (
    <div className="space-y-1.5">
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <pre
            key={i}
            className="overflow-x-auto rounded-lg p-2.5 text-[11px] leading-relaxed"
            style={{ background: "var(--bg)", color: "var(--text-main)" }}
          >
            <code>{part.replace(/^\n/, "")}</code>
          </pre>
        ) : part.trim() ? (
          <p key={i} className="whitespace-pre-wrap text-sm leading-relaxed text-main">
            {part.trim()}
          </p>
        ) : null,
      )}
    </div>
  );
}
