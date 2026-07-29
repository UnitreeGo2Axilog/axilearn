"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLocale, useT } from "@/i18n/use-t";

/** Sign in / sign up on one page, toggled -- fewer clicks for a newcomer. */
export default function LoginPage() {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const { signIn, signUp, signInWithGoogle, configured } = useAuth();

  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "up") await signUp(name, email, password);
      else await signIn(email, password);
      router.push(`/${locale}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-6 text-center text-2xl font-bold">
        {mode === "in" ? t("auth.signIn") : t("auth.signUp")}
      </h1>

      {!configured && (
        <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          {t("auth.notConfigured")}
        </p>
      )}

      <form
        onSubmit={submit}
        className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        {mode === "up" && (
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder={t("auth.name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        <input
          type="email"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder={t("auth.email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder={t("auth.password")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={busy || !configured}
          className="w-full rounded-lg bg-slate-900 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {mode === "in" ? t("auth.signIn") : t("auth.signUp")}
        </button>

        <button
          type="button"
          disabled={busy || !configured}
          onClick={() => signInWithGoogle().then(() => router.push(`/${locale}`))}
          className="w-full rounded-lg border border-slate-300 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
        >
          {t("auth.google")}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600">
        {mode === "in" ? t("auth.noAccount") : t("auth.haveAccount")}{" "}
        <button
          onClick={() => setMode(mode === "in" ? "up" : "in")}
          className="font-semibold text-slate-900 underline"
        >
          {mode === "in" ? t("auth.signUp") : t("auth.signIn")}
        </button>
      </p>

      <p className="mt-6 text-center">
        <Link href={`/${locale}`} className="text-sm text-slate-500 hover:text-slate-800">
          {t("track.back")}
        </Link>
      </p>
    </div>
  );
}
