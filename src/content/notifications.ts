/**
 * The starter set of tips, shipped in the repo.
 *
 * Same job as challenges.ts: a fallback so the bell is not empty on a fresh
 * install, and the seed the admin "Import starter content" button writes into
 * Firestore. After that the supervisor owns them in the CMS.
 *
 * They are short on purpose. A notification nobody finishes reading is worse
 * than no notification, and the ones here are meant to be a nudge on the way
 * past, not a lesson.
 */
import type { NotificationDoc } from "./schema";

export const repoNotifications: NotificationDoc[] = [
  {
    id: "tip-read-the-error",
    order: 0,
    status: "published",
    category: "programming",
    schedule: { kind: "daily" },
    title: { en: "Read the error, slowly", fr: "Lis l'erreur, lentement" },
    body: {
      en: "An error message is not the computer complaining. It is the computer telling you the file, the line, and what it expected instead. Most bugs are solved by reading it twice rather than changing code once.",
      fr: "Un message d'erreur n'est pas une plainte de l'ordinateur. Il te donne le fichier, la ligne, et ce qu'il attendait. La plupart des bugs se résolvent en le lisant deux fois plutôt qu'en changeant le code une fois.",
    },
  },
  {
    id: "tip-one-change",
    order: 1,
    status: "published",
    category: "practice",
    schedule: { kind: "daily" },
    title: { en: "Change one thing at a time", fr: "Change une seule chose à la fois" },
    body: {
      en: "When something breaks, change one line and run it again. Change three and you will not know which one mattered — and that is how an hour disappears.",
      fr: "Quand quelque chose casse, change une ligne et relance. Si tu en changes trois, tu ne sauras pas laquelle comptait — et c'est comme ça qu'une heure disparaît.",
    },
  },
  {
    id: "tip-print-it",
    order: 2,
    status: "published",
    category: "programming",
    schedule: { kind: "daily" },
    title: { en: "When in doubt, print it", fr: "Dans le doute, affiche-le" },
    body: {
      en: "You do not have to guess what a variable holds. Put print() next to it and look. Real programmers do this constantly — it is not cheating, it is measuring.",
      fr: "Tu n'as pas à deviner ce que contient une variable. Mets print() à côté et regarde. Les vrais programmeurs font ça tout le temps — ce n'est pas tricher, c'est mesurer.",
    },
  },
  {
    id: "tip-robot-loop",
    order: 3,
    status: "published",
    category: "robotics",
    schedule: { kind: "daily" },
    title: { en: "Every robot runs one loop", fr: "Tout robot tourne sur une boucle" },
    body: {
      en: "Sense, think, act, repeat — thousands of times a second. A robot that behaves strangely is almost always one of those four steps getting the wrong answer, not all of them at once.",
      fr: "Percevoir, décider, agir, recommencer — des milliers de fois par seconde. Un robot qui se comporte bizarrement, c'est presque toujours une de ces quatre étapes qui se trompe, pas les quatre.",
    },
  },
  {
    id: "tip-game-feel",
    order: 4,
    status: "published",
    category: "games",
    schedule: { kind: "daily" },
    title: { en: "A game is judged in the first ten seconds", fr: "Un jeu se juge dans les dix premières secondes" },
    body: {
      en: "Before levels and story, make the jump feel good. If moving your character is fun with nothing else on screen, you have a game. If it is not, no amount of content will rescue it.",
      fr: "Avant les niveaux et l'histoire, fais que le saut soit agréable. Si déplacer ton personnage est amusant sans rien d'autre à l'écran, tu tiens un jeu. Sinon, aucun contenu ne le sauvera.",
    },
  },
  {
    id: "tip-name-things",
    order: 5,
    status: "published",
    category: "practice",
    schedule: { kind: "daily" },
    title: { en: "Name it what it is", fr: "Nomme les choses telles qu'elles sont" },
    body: {
      en: "`d` saves you three keystrokes today and costs you ten minutes next week. `distance_cm` never does. You write code once and read it many times.",
      fr: "`d` t'économise trois frappes aujourd'hui et te coûte dix minutes la semaine prochaine. `distance_cm` jamais. On écrit le code une fois et on le relit souvent.",
    },
  },
  {
    id: "tip-sleep-on-it",
    order: 6,
    status: "published",
    category: "practice",
    schedule: { kind: "weekly" },
    title: { en: "Stuck for an hour? Stop.", fr: "Bloqué depuis une heure ? Arrête." },
    body: {
      en: "Walk away and come back tomorrow. The bug you cannot find at midnight is usually obvious at breakfast. This is not laziness — it is the single most reliable debugging technique there is.",
      fr: "Éloigne-toi et reviens demain. Le bug introuvable à minuit est souvent évident au petit-déjeuner. Ce n'est pas de la paresse — c'est la technique de débogage la plus fiable qui existe.",
    },
  },
  {
    id: "tip-type-it",
    order: 7,
    status: "published",
    category: "practice",
    schedule: { kind: "weekly" },
    title: { en: "Type the example, do not copy it", fr: "Tape l'exemple, ne le copie pas" },
    body: {
      en: "Copying teaches your clipboard. Typing teaches your hands, and your hands notice the colon you forgot before your eyes do.",
      fr: "Copier apprend à ton presse-papiers. Taper apprend à tes mains, et tes mains remarquent le deux-points oublié avant tes yeux.",
    },
  },
  {
    id: "tip-small-commits",
    order: 8,
    status: "published",
    category: "programming",
    schedule: { kind: "weekly" },
    title: { en: "Save a working version before you experiment", fr: "Sauvegarde une version qui marche avant d'expérimenter" },
    body: {
      en: "Before you rewrite something that works, keep a copy. Being able to go back is what makes it safe to try the risky idea — and the risky idea is usually the interesting one.",
      fr: "Avant de réécrire quelque chose qui marche, garde une copie. Pouvoir revenir en arrière est ce qui rend l'idée risquée possible — et l'idée risquée est souvent la plus intéressante.",
    },
  },
];
