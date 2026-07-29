/**
 * All interface text, in both languages.
 *
 * Deliberately hand-rolled instead of pulling in an i18n library: the site has
 * exactly two locales and a simple `/[locale]/...` route shape, and Next.js 16
 * is new enough that library compatibility is a risk we do not need to take.
 * Rule for the whole codebase: never write a user-visible string inside a
 * component -- add it here and read it through `useT()` / `getMessages()`.
 */
import type { Locale } from "@/content/types";

export const LOCALES: Locale[] = ["en", "fr"];
export const DEFAULT_LOCALE: Locale = "en";

export const messages = {
  en: {
    "app.name": "AxiLearn",
    "app.tagline": "Learn to build intelligent machines",
    "nav.tracks": "Tracks",
    "nav.signIn": "Sign in",
    "nav.signOut": "Sign out",
    "nav.profile": "Profile",
    "nav.admin": "Admin",

    "home.title": "Choose your adventure",
    "home.subtitle":
      "Three journeys into artificial intelligence. Start anywhere, learn by doing.",
    "home.start": "Start learning",
    "home.comingSoon": "Coming soon",
    "home.lessons": "lessons",

    "track.back": "All tracks",
    "track.yourProgress": "Your progress",
    "track.locked": "Finish the previous lesson first",
    "track.points": "points",
    "track.start": "Start",
    "track.continue": "Continue",
    "track.review": "Review",
    "track.chapters": "chapters",
    "track.hours": "hours",
    "track.whatYouLearn": "What you will be able to do",
    "track.howToSucceed": "How to actually succeed here",
    "track.optional": "Optional warm-up",
    "track.takePrimer": "Take the Python warm-up",
    "track.enterMap": "Enter the mission map",
    "track.readyToStart": "Your journey starts here.",
    "track.alreadyDone": "of this track already complete",

    "lesson.instructions": "Instructions",
    "lesson.workspace": "Workspace",
    "lesson.output": "Result",
    "lesson.run": "Run",
    "lesson.next": "Next lesson",
    "lesson.complete": "Mark as done",
    "lesson.comingSoon": "This part arrives in the next phase.",
    "lesson.backToMap": "Back to the map",

    "auth.signIn": "Sign in",
    "auth.signUp": "Create an account",
    "auth.name": "Your name",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.google": "Continue with Google",
    "auth.noAccount": "No account yet?",
    "auth.haveAccount": "Already have an account?",
    "auth.notConfigured":
      "Firebase is not configured yet — you can still browse the lessons.",

    "profile.title": "Your profile",
    "profile.role": "Role",
    "profile.language": "Language",

    "admin.title": "Content admin",
    "admin.soon":
      "The lesson editor arrives in Phase 2. Only admins can see this page.",
    "admin.denied": "You need an admin account to open this page.",
  },
  fr: {
    "app.name": "AxiLearn",
    "app.tagline": "Apprends à construire des machines intelligentes",
    "nav.tracks": "Parcours",
    "nav.signIn": "Se connecter",
    "nav.signOut": "Se déconnecter",
    "nav.profile": "Profil",
    "nav.admin": "Admin",

    "home.title": "Choisis ton aventure",
    "home.subtitle":
      "Trois parcours vers l'intelligence artificielle. Commence où tu veux, apprends en pratiquant.",
    "home.start": "Commencer",
    "home.comingSoon": "Bientôt disponible",
    "home.lessons": "leçons",

    "track.back": "Tous les parcours",
    "track.yourProgress": "Ta progression",
    "track.locked": "Termine d'abord la leçon précédente",
    "track.points": "points",
    "track.start": "Commencer",
    "track.continue": "Continuer",
    "track.review": "Revoir",
    "track.chapters": "chapitres",
    "track.hours": "heures",
    "track.whatYouLearn": "Ce que tu sauras faire",
    "track.howToSucceed": "Comment vraiment réussir ici",
    "track.optional": "Échauffement optionnel",
    "track.takePrimer": "Faire l'échauffement Python",
    "track.enterMap": "Entrer dans la carte",
    "track.readyToStart": "Ton aventure commence ici.",
    "track.alreadyDone": "de ce parcours déjà terminé",

    "lesson.instructions": "Instructions",
    "lesson.workspace": "Espace de travail",
    "lesson.output": "Résultat",
    "lesson.run": "Exécuter",
    "lesson.next": "Leçon suivante",
    "lesson.complete": "Marquer comme terminé",
    "lesson.comingSoon": "Cette partie arrive à la prochaine phase.",
    "lesson.backToMap": "Retour à la carte",

    "auth.signIn": "Se connecter",
    "auth.signUp": "Créer un compte",
    "auth.name": "Ton nom",
    "auth.email": "Email",
    "auth.password": "Mot de passe",
    "auth.google": "Continuer avec Google",
    "auth.noAccount": "Pas encore de compte ?",
    "auth.haveAccount": "Tu as déjà un compte ?",
    "auth.notConfigured":
      "Firebase n'est pas encore configuré — tu peux quand même parcourir les leçons.",

    "profile.title": "Ton profil",
    "profile.role": "Rôle",
    "profile.language": "Langue",

    "admin.title": "Administration du contenu",
    "admin.soon":
      "L'éditeur de leçons arrive en Phase 2. Seuls les admins voient cette page.",
    "admin.denied": "Tu dois avoir un compte admin pour ouvrir cette page.",
  },
} as const;

export type MessageKey = keyof (typeof messages)["en"];

export function isLocale(value: string): value is Locale {
  return (LOCALES as string[]).includes(value);
}

/** Server-side translator for a given locale. */
export function getT(locale: Locale) {
  return (key: MessageKey): string =>
    messages[locale][key] ?? messages.en[key] ?? key;
}
