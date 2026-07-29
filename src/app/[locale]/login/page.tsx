"use client";

/**
 * Sign in / sign up / reset, built around the robot.
 *
 * Axi is the validation UI. It checks each field AS IT IS TYPED and says what
 * is wrong in a sentence, so nobody has to press the button to find out --
 * which is the whole point: a beginner who submits and gets a red error learns
 * that the form is hostile, while one who is told "an email needs an @" while
 * typing just fixes it.
 *
 * On sign-up the robot's screen also reports how hard the password would be to
 * guess: EASY -> MEDIUM -> GOOD -> HARD. It is coaching, not a gate; the only
 * hard rule is Firebase's six-character minimum.
 */
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLocale, useT } from "@/i18n/use-t";
import { friendlyAuthError } from "@/lib/auth-errors";
import { passwordStrength, type Strength } from "@/lib/password-strength";
import { RobotMascot, type RobotMood } from "@/components/robot-mascot";
import type { MessageKey } from "@/i18n/messages";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const STRENGTH_LABEL: Record<Exclude<Strength, "empty">, MessageKey> = {
  easy: "auth.strengthEasy",
  medium: "auth.strengthMedium",
  good: "auth.strengthGood",
  hard: "auth.strengthHard",
};
const STRENGTH_HINT: Record<Exclude<Strength, "empty">, MessageKey> = {
  easy: "auth.strengthEasyHint",
  medium: "auth.strengthMediumHint",
  good: "auth.strengthGoodHint",
  hard: "auth.strengthHardHint",
};
const STRENGTH_COLOR: Record<Exclude<Strength, "empty">, string> = {
  easy: "var(--reward)",
  medium: "var(--reward)",
  good: "var(--neon)",
  hard: "var(--cleared)",
};

export default function LoginPage() {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const { signIn, signUp, signInWithGoogle, resetPassword, configured } = useAuth();

  const [mode, setMode] = useState<"in" | "up" | "reset">("in");
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  /** Which fields the learner has actually engaged with, so an untouched form
      is not covered in complaints before they have typed anything. */
  const [seen, setSeen] = useState({ name: false, email: false, password: false });
  const [focused, setFocused] = useState<"name" | "email" | "password" | null>(null);

  const needsName = mode === "up";
  const needsPassword = mode !== "reset";

  const checks = useMemo(
    () => ({
      name: !needsName || name.trim().length >= 2,
      email: EMAIL_RE.test(email),
      password: !needsPassword || password.length >= 6,
    }),
    [name, email, password, needsName, needsPassword],
  );

  const valid = checks.name && checks.email && checks.password;
  const strength = passwordStrength(password);
  const rated = strength.level === "empty" ? null : strength.level;

  /** The first thing still wrong, among fields they have already touched. */
  const problem = useMemo(() => {
    if (needsName && seen.name && !checks.name) return t("auth.checkName");
    if (seen.email && !checks.email) return t("auth.checkEmail");
    if (needsPassword && seen.password && !checks.password) return t("auth.checkPassword");
    return null;
  }, [checks, seen, needsName, needsPassword, t]);

  const mood: RobotMood =
    done || sent
      ? "celebrate"
      : error || problem
        ? "error"
        : valid
          ? "happy"
          : focused || seen.email || seen.password
            ? "thinking"
            : "idle";

  /** What the robot's own screen reads. */
  const screen = (() => {
    if (sent) return locale === "fr" ? "ENVOYE" : "SENT";
    if (done) return locale === "fr" ? "BRAVO" : "WELCOME";
    if (error) return locale === "fr" ? "OUPS" : "OOPS";
    // A problem outranks the gauge, so the screen and the sentence below it
    // never disagree about what needs attention.
    if (problem) return locale === "fr" ? "ATTENTION" : "CHECK IT";
    // Otherwise, on sign-up the password's guessability takes the screen while
    // it is being written -- that is the feedback needed right then.
    if (mode === "up" && rated) return t(STRENGTH_LABEL[rated]);
    if (mode === "reset") return "RESET";
    if (mode === "in") return locale === "fr" ? "CONNEXION" : "LOG IN";
    return locale === "fr" ? "INSCRIPTION" : "SIGN UP";
  })();

  /** The sentence under the robot. */
  const speech = (() => {
    if (sent) return t("auth.resetSent");
    if (done) return locale === "fr" ? "C'est parti !" : "Let's go!";
    if (error) return error;
    if (problem) return problem;
    if (mode === "up" && rated && focused === "password") return t(STRENGTH_HINT[rated]);
    if (valid) return t("auth.allGood");
    if (mode === "up" && rated) return t(STRENGTH_HINT[rated]);
    return "";
  })();

  function touch(field: "name" | "email" | "password") {
    setSeen((prev) => (prev[field] ? prev : { ...prev, [field]: true }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSeen({ name: true, email: true, password: true });
    if (!valid) return; // the robot is already saying what is wrong
    setError(null);
    setBusy(true);
    try {
      if (mode === "reset") {
        await resetPassword(email);
        setSent(true);
        return;
      }
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

  function switchMode(next: "in" | "up" | "reset") {
    setMode(next);
    setError(null);
    setSent(false);
    setSeen({ name: false, email: false, password: false });
  }

  return (
    <div className="mx-auto grid max-w-5xl items-center gap-8 px-4 py-10 md:grid-cols-2">
      {/* the robot */}
      <div className="order-1 flex flex-col items-center md:order-none">
        <RobotMascot mood={mood} screenText={screen} className="h-64 w-64 sm:h-72 sm:w-72" />
        <p
          className="mt-3 min-h-[3rem] max-w-xs text-center text-sm font-semibold leading-snug"
          style={{
            color:
              error || problem
                ? "var(--reward)"
                : mood === "celebrate" || (valid && !problem)
                  ? "var(--cleared)"
                  : "var(--neon)",
          }}
        >
          {speech}
        </p>
      </div>

      {/* the form */}
      <div className="order-2 md:order-none">
        <h1 className="mb-1 text-3xl font-extrabold text-strong">
          {mode === "reset"
            ? t("auth.resetTitle")
            : mode === "in"
              ? t("auth.signIn")
              : t("auth.signUp")}
        </h1>
        <p className="mb-5 text-muted">
          {mode === "reset" ? t("auth.resetBody") : t("app.tagline")}
        </p>

        {!configured && (
          <p
            className="mb-4 rounded-xl border p-3 text-sm font-medium"
            style={{
              borderColor: "color-mix(in srgb, var(--reward) 35%, transparent)",
              background: "color-mix(in srgb, var(--reward) 10%, transparent)",
              color: "var(--reward)",
            }}
          >
            {t("auth.notConfigured")}
          </p>
        )}

        <form onSubmit={submit} className="panel panel-glow space-y-3 rounded-2xl p-6">
          {needsName && (
            <CheckedField
              ok={checks.name}
              dirty={name.length > 0}
              seen={seen.name}
              message={t("auth.checkName")}
              okLabel={t("auth.fieldOk")}
            >
              <input
                className="field w-full rounded-xl px-4 py-3 pr-10 text-base"
                placeholder={t("auth.name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocused("name")}
                onBlur={() => {
                  setFocused(null);
                  touch("name");
                }}
              />
            </CheckedField>
          )}

          <CheckedField
            ok={checks.email}
            dirty={email.length > 0}
            seen={seen.email}
            message={t("auth.checkEmail")}
            okLabel={t("auth.fieldOk")}
          >
            <input
              type="email"
              className="field w-full rounded-xl px-4 py-3 pr-10 text-base"
              placeholder={t("auth.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocused("email")}
              onBlur={() => {
                setFocused(null);
                touch("email");
              }}
            />
          </CheckedField>

          {needsPassword && (
            <div>
              <CheckedField
                ok={checks.password}
                dirty={password.length > 0}
                seen={seen.password}
                message={t("auth.strengthTooShort")}
                okLabel={t("auth.fieldOk")}
              >
                <input
                  type="password"
                  className="field w-full rounded-xl px-4 py-3 pr-10 text-base"
                  placeholder={t("auth.password")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => {
                    setFocused(null);
                    touch("password");
                  }}
                />
              </CheckedField>

              {/* strength meter, only where a password is being chosen */}
              {mode === "up" && rated && (
                <div className="mt-2">
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map((step) => (
                      <span
                        key={step}
                        className="h-1.5 flex-1 rounded-full transition-colors"
                        style={{
                          background:
                            step <= strength.score
                              ? STRENGTH_COLOR[rated]
                              : "color-mix(in srgb, var(--text) 14%, transparent)",
                        }}
                      />
                    ))}
                  </div>
                  <p className="mt-1.5 flex items-center justify-between text-[11px] font-bold">
                    <span className="text-faint">{t("auth.strength")}</span>
                    <span style={{ color: STRENGTH_COLOR[rated] }}>
                      {t(STRENGTH_LABEL[rated])}
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="btn-neon w-full rounded-xl py-3.5 text-lg font-black uppercase tracking-wide transition hover:brightness-110 disabled:opacity-50"
            style={
              // Dimmed until the fields are right, so the button itself tells
              // you the form is not ready -- without blocking the click, which
              // is what makes the robot explain why.
              valid ? undefined : { opacity: 0.65 }
            }
          >
            {mode === "reset"
              ? t("auth.sendReset")
              : mode === "in"
                ? t("auth.signIn")
                : t("auth.signUp")}
          </button>

          {mode !== "reset" && (
            <button
              type="button"
              onClick={google}
              disabled={busy}
              className="w-full rounded-xl border py-3 font-semibold text-main transition hover:opacity-80 disabled:opacity-50"
              style={{ borderColor: "var(--border-strong)" }}
            >
              {t("auth.google")}
            </button>
          )}

          {mode === "in" && (
            <button
              type="button"
              onClick={() => switchMode("reset")}
              className="w-full pt-1 text-center text-sm font-semibold text-faint transition hover:opacity-80"
            >
              {t("auth.forgot")}
            </button>
          )}

          {sent && (
            <p
              className="rounded-xl border p-3 text-sm leading-relaxed"
              style={{
                borderColor: "color-mix(in srgb, var(--cleared) 40%, transparent)",
                background: "color-mix(in srgb, var(--cleared) 10%, transparent)",
                color: "var(--cleared)",
              }}
            >
              {t("auth.resetSent")}
            </p>
          )}
        </form>

        {mode === "reset" ? (
          <p className="mt-4 text-center">
            <button
              onClick={() => switchMode("in")}
              className="font-extrabold underline decoration-2 underline-offset-2"
              style={{ color: "var(--neon)" }}
            >
              {t("auth.backToSignIn")}
            </button>
          </p>
        ) : (
          <p className="mt-4 text-center text-muted">
            {mode === "in" ? t("auth.noAccount") : t("auth.haveAccount")}{" "}
            <button
              onClick={() => switchMode(mode === "in" ? "up" : "in")}
              className="font-extrabold underline decoration-2 underline-offset-2"
              style={{ color: "var(--neon)" }}
            >
              {mode === "in" ? t("auth.signUp") : t("auth.signIn")}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * An input that shows its own verdict, with the two directions deliberately
 * timed differently:
 *
 *  - The TICK appears the moment the value becomes usable, mid-typing. That is
 *    the encouraging half, and it should be immediate.
 *  - The CROSS and its sentence wait until the field is left. Complaining on
 *    the second keystroke of an email tells someone they are wrong while they
 *    are still in the middle of being right, which is how forms come to feel
 *    hostile -- and it would have the robot shaking its head at a half-typed
 *    address.
 */
function CheckedField({
  ok,
  dirty,
  seen,
  message,
  okLabel,
  children,
}: {
  ok: boolean;
  dirty: boolean;
  seen: boolean;
  message: string;
  okLabel: string;
  children: React.ReactNode;
}) {
  const state = ok && dirty ? "ok" : seen && !ok ? "bad" : "quiet";
  return (
    <div>
      <div className="relative">
        {children}
        {state !== "quiet" && (
          <span
            aria-hidden
            className="pointer-events-none absolute right-3 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-full"
            style={{
              background: state === "ok" ? "var(--cleared)" : "var(--reward)",
              color: "var(--surface-solid)",
            }}
          >
            {state === "ok" ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
          </span>
        )}
      </div>
      {state === "bad" && (
        <p className="mt-1.5 text-[11px] font-semibold" style={{ color: "var(--reward)" }}>
          {message}
        </p>
      )}
      {state === "ok" && <span className="sr-only">{okLabel}</span>}
    </div>
  );
}
