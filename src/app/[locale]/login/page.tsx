"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLocale, useT } from "@/i18n/use-t";
import { friendlyAuthError } from "@/lib/auth-errors";
import { RobotMascot, type RobotMood } from "@/components/robot-mascot";

/**
 * Sign in / sign up, built around the robot.
 *
 * Axi watches what you type: it thinks while you type, gives a thumbs up when
 * the form looks valid, celebrates on success and pulls a thumbs down with a
 * head shake when something is wrong -- so a beginner gets feedback from a
 * character instead of a red error line.
 */
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
  const [done, setDone] = useState(false);
  const [touched, setTouched] = useState(false);

  const valid = useMemo(() => {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const passOk = password.length >= 6;
    const nameOk = mode === "in" || name.trim().length > 1;
    return emailOk && passOk && nameOk;
  }, [email, password, name, mode]);

  const mood: RobotMood = done
    ? "celebrate"
    : error
      ? "error"
      : valid
        ? "happy"
        : touched
          ? "thinking"
          : "idle";

  const screen = done
    ? locale === "fr" ? "BRAVO" : "WELCOME"
    : error
      ? locale === "fr" ? "OUPS" : "OOPS"
      : mode === "in"
        ? locale === "fr" ? "CONNEXION" : "LOG IN"
        : locale === "fr" ? "INSCRIPTION" : "SIGN UP";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "up") await signUp(name, email, password);
      else await signIn(email, password);
      setDone(true);
      setTimeout(() => router.push(`/${locale}`), 900);
    } catch (err) {
      setError(friendlyAuthError(err, locale));
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setError(null);
    try {
      await signInWithGoogle();
      setDone(true);
      setTimeout(() => router.push(`/${locale}`), 900);
    } catch (err) {
      setError(friendlyAuthError(err, locale));
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl items-center gap-8 px-4 py-10 md:grid-cols-2">
      {/* the robot */}
      <div className="order-1 flex flex-col items-center md:order-none">
        <RobotMascot mood={mood} screenText={screen} className="h-64 w-64 sm:h-72 sm:w-72" />
        <p className="mt-3 h-6 text-center font-semibold text-slate-600">
          {done
            ? locale === "fr" ? "C'est parti !" : "Let's go!"
            : error
              ? error
              : valid
                ? locale === "fr" ? "Parfait, tu peux continuer !" : "Nice, you're good to go!"
                : ""}
        </p>
      </div>

      {/* the form */}
      <div className="order-2 md:order-none">
        <h1 className="mb-1 text-3xl font-extrabold">
          {mode === "in" ? t("auth.signIn") : t("auth.signUp")}
        </h1>
        <p className="mb-5 text-slate-500">{t("app.tagline")}</p>

        {!configured && (
          <p className="mb-4 rounded-2xl bg-amber-100 p-3 text-sm font-medium text-amber-900">
            {t("auth.notConfigured")}
          </p>
        )}

        <form
          onSubmit={submit}
          onChange={() => setTouched(true)}
          className="space-y-3 rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-chunky"
        >
          {mode === "up" && (
            <input
              className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-base outline-none transition focus:border-sky-400"
              placeholder={t("auth.name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-base outline-none transition focus:border-sky-400"
            placeholder={t("auth.email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-base outline-none transition focus:border-sky-400"
            placeholder={t("auth.password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 py-3.5 text-lg font-extrabold text-white shadow-chunky-sm transition hover:brightness-105 active:translate-y-1 active:shadow-none disabled:opacity-60"
          >
            {mode === "in" ? t("auth.signIn") : t("auth.signUp")}
          </button>

          <button
            type="button"
            onClick={google}
            disabled={busy}
            className="w-full rounded-2xl border-2 border-slate-200 py-3 font-semibold transition hover:bg-slate-50 disabled:opacity-60"
          >
            {t("auth.google")}
          </button>
        </form>

        <p className="mt-4 text-center text-slate-600">
          {mode === "in" ? t("auth.noAccount") : t("auth.haveAccount")}{" "}
          <button
            onClick={() => {
              setMode(mode === "in" ? "up" : "in");
              setError(null);
            }}
            className="font-extrabold text-orange-600 underline decoration-2 underline-offset-2"
          >
            {mode === "in" ? t("auth.signUp") : t("auth.signIn")}
          </button>
        </p>

        <p className="mt-6 text-center">
          <Link href={`/${locale}`} className="text-sm text-slate-500 hover:text-slate-800">
            ← {t("track.back")}
          </Link>
        </p>
      </div>
    </div>
  );
}
