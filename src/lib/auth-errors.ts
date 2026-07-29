import type { Locale } from "@/content/types";

/**
 * Turn raw Firebase error codes into something a teenager can act on.
 *
 * The tech spec calls this "error translation" and it matters: a beginner who
 * sees `Firebase: Error (auth/invalid-credential)` assumes they broke
 * something and leaves. Anything unrecognised falls back to a calm generic
 * line rather than leaking internals.
 */
const MAP: Record<string, { en: string; fr: string }> = {
  "auth/invalid-email": {
    en: "That email address doesn't look right.",
    fr: "Cette adresse email ne semble pas correcte.",
  },
  "auth/missing-password": {
    en: "Don't forget your password!",
    fr: "N'oublie pas ton mot de passe !",
  },
  "auth/weak-password": {
    en: "Pick a longer password — at least 6 characters.",
    fr: "Choisis un mot de passe plus long — au moins 6 caractères.",
  },
  "auth/email-already-in-use": {
    en: "This email already has an account. Try signing in instead.",
    fr: "Cet email a déjà un compte. Essaie plutôt de te connecter.",
  },
  "auth/invalid-credential": {
    en: "Wrong email or password. Try again!",
    fr: "Email ou mot de passe incorrect. Réessaie !",
  },
  "auth/user-not-found": {
    en: "No account with that email yet. Create one!",
    fr: "Aucun compte avec cet email. Crées-en un !",
  },
  "auth/wrong-password": {
    en: "Wrong password. Try again!",
    fr: "Mot de passe incorrect. Réessaie !",
  },
  "auth/too-many-requests": {
    en: "Too many tries. Take a short break and come back.",
    fr: "Trop d'essais. Fais une petite pause et reviens.",
  },
  "auth/popup-closed-by-user": {
    en: "The Google window was closed before finishing.",
    fr: "La fenêtre Google a été fermée avant la fin.",
  },
  "auth/network-request-failed": {
    en: "No internet connection.",
    fr: "Pas de connexion internet.",
  },
  // Setup problems -- the message points at the fix instead of blaming the user.
  "auth/configuration-not-found": {
    en: "Sign-in isn't switched on for this project yet (Firebase console → Authentication → Sign-in method).",
    fr: "La connexion n'est pas encore activée pour ce projet (console Firebase → Authentication → Sign-in method).",
  },
  "auth/operation-not-allowed": {
    en: "This sign-in method isn't enabled in the Firebase console yet.",
    fr: "Cette méthode de connexion n'est pas encore activée dans la console Firebase.",
  },
};

export function friendlyAuthError(error: unknown, locale: Locale): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: unknown }).code)
      : "";
  const hit = MAP[code];
  if (hit) return hit[locale];
  return locale === "fr"
    ? "Quelque chose n'a pas marché. Réessaie."
    : "Something didn't work. Please try again.";
}
