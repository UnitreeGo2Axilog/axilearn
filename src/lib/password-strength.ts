/**
 * How hard a password would be to guess.
 *
 * Framed as easy-to-guess vs hard-to-guess rather than "weak/strong", because
 * that is what the word actually means to a teenager and it says what to do
 * about it. Four levels so the robot has something to react to on every
 * keystroke without flapping between two states.
 *
 * This is a coaching aid, not a security control -- Firebase's own six
 * character minimum is the only hard rule. Nobody is blocked from signing up
 * with an "easy" password; they are just told.
 */
export type Strength = "empty" | "easy" | "medium" | "good" | "hard";

/** Passwords that are guessed first, whatever else is bolted onto them. */
const OBVIOUS = /^(password|passe|motdepasse|123456|1234567|12345678|qwerty|azerty|letmein|welcome|admin|iloveyou|abc123)/i;

export interface StrengthResult {
  level: Strength;
  /** 0-4, for drawing a four-segment meter. */
  score: number;
}

export function passwordStrength(password: string): StrengthResult {
  if (!password) return { level: "empty", score: 0 };

  // Below Firebase's minimum nothing else can rescue it.
  if (password.length < 6) return { level: "easy", score: 1 };

  let points = 0;
  if (password.length >= 8) points++;
  if (password.length >= 12) points++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) points++;
  if (/\d/.test(password)) points++;
  if (/[^A-Za-z0-9]/.test(password)) points++;

  // A single repeated character is long but trivial: "aaaaaaaaaaaa".
  if (new Set(password).size <= 3) points = Math.min(points, 1);
  if (OBVIOUS.test(password)) points = Math.min(points, 1);

  if (points <= 1) return { level: "easy", score: 1 };
  if (points === 2) return { level: "medium", score: 2 };
  if (points === 3) return { level: "good", score: 3 };
  return { level: "hard", score: 4 };
}
