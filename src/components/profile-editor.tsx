"use client";

/**
 * The part of the profile you can actually change.
 *
 * "Edit profile" led here and here was read-only -- a page of badges, XP and
 * certificates with nothing to edit anywhere on it. This is the form that
 * makes the link true.
 *
 * WHAT IS EDITABLE is deliberately small:
 *
 *  - The DISPLAY NAME, which is the only thing a learner owns that appears
 *    to other people: the header, their avatar's initials, their teacher's
 *    roster and the name printed on their certificate.
 *  - The PASSWORD, by the reset email Firebase sends and hosts. Asking for a
 *    new password in a form here would mean handling re-authentication when
 *    the session is old, and getting that wrong locks people out of their own
 *    account. The email path is the one Firebase supports properly.
 *
 * The EMAIL is shown and not editable. Changing it is a genuine
 * re-authentication flow with a verification round trip, and half-building
 * that is how an account becomes unreachable. Better to say plainly that it
 * cannot be changed here than to offer a field that fails.
 *
 * The AVATAR has no control because there is nothing to set: the initials
 * come from the name in this form and the colour from the account id, so
 * editing the name is editing the avatar.
 */
import { useState } from "react";
import { Check, KeyRound, Loader2, Save } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Avatar } from "@/components/avatar";
import { useT } from "@/i18n/use-t";

export function ProfileEditor() {
  const t = useT();
  const { user, profile, updateDisplayName, resetPassword } = useAuth();
  const [name, setName] = useState(profile?.displayName ?? "");
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  if (!user) return null;

  const trimmed = name.trim();
  const changed = trimmed !== (profile?.displayName ?? "") && trimmed.length > 0;

  async function save() {
    setState("saving");
    setError(null);
    try {
      await updateDisplayName(trimmed);
      setState("saved");
    } catch (err) {
      setError((err as Error).message);
      setState("idle");
    }
  }

  async function sendReset() {
    setError(null);
    try {
      if (!user!.email) throw new Error(t("editp.noEmail"));
      await resetPassword(user!.email);
      setSent(true);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <section className="panel mb-6 rounded-2xl p-5">
      <h2 className="mb-4 text-lg font-extrabold text-strong">{t("editp.title")}</h2>

      <div className="mb-4 flex items-center gap-3">
        {/* Live preview: the initials follow what is being typed, so the
            effect of the change is visible before it is saved. */}
        <Avatar uid={user.uid} displayName={trimmed || " "} email={user.email} size={44} ring />
        <p className="text-xs leading-relaxed text-muted">{t("editp.avatarNote")}</p>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-faint">
          {t("editp.displayName")}
        </span>
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setState("idle");
          }}
          maxLength={40}
          className="field w-full rounded-xl px-3 py-2.5 text-sm"
        />
      </label>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          onClick={() => void save()}
          disabled={!changed || state === "saving"}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black disabled:opacity-40"
          style={{ background: "var(--neon)", color: "var(--surface-solid)" }}
        >
          {state === "saving" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {t("admin.save")}
        </button>
        {state === "saved" && (
          <span
            className="inline-flex items-center gap-1.5 text-xs font-bold"
            style={{ color: "var(--cleared)" }}
          >
            <Check className="h-3.5 w-3.5" />
            {t("editp.saved")}
          </span>
        )}
      </div>

      <div className="mt-5 border-t pt-4" style={{ borderColor: "var(--border)" }}>
        <p className="text-xs font-bold uppercase tracking-wide text-faint">{t("editp.email")}</p>
        <p className="mt-1 text-sm text-main">{user.email ?? "—"}</p>
        <p className="mt-1 text-[11px] leading-relaxed text-faint">{t("editp.emailNote")}</p>

        <button
          onClick={() => void sendReset()}
          disabled={sent}
          className="mt-3 inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold text-main disabled:opacity-50"
          style={{ borderColor: "var(--border-strong)" }}
        >
          <KeyRound className="h-3.5 w-3.5" />
          {sent ? t("editp.resetSent") : t("editp.resetPassword")}
        </button>
      </div>

      {error && (
        <p className="mt-3 text-xs font-bold" style={{ color: "var(--reward)" }}>
          {error}
        </p>
      )}
    </section>
  );
}
