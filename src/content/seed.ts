/**
 * Placeholder curriculum for Phase 1.
 *
 * The lesson BODIES are still placeholders -- Phase 1 builds the house, not the
 * furniture -- but the structure is the real one, taken from the supervisor's
 * instruction for the Physical AI track: about four Python lessons first, then
 * installing the simulator, then hands-on with the robot. The hands-on modules
 * mirror the Go2 work that already exists and is proven (standing, walking,
 * the camera, the arm, the waste sort), so writing the real content later is
 * mostly explaining work we can already run.
 *
 * This file is the Phase-1 implementation of the data layer. In Phase 2 the
 * Admin CMS writes the same shapes into Firestore and `src/content/db.ts`
 * switches source -- no page needs to change.
 */
import type { Lesson, Module, Track } from "./types";

export const TRACKS: Track[] = [
  {
    id: "physical-ai",
    order: 1,
    status: "active",
    title: { en: "Physical AI", fr: "IA Physique" },
    description: {
      en: "Teach a real robot to walk, see and work — in a simulator on your own computer.",
      fr: "Apprends à un vrai robot à marcher, voir et travailler — dans un simulateur sur ton ordinateur.",
    },
    color: "#f59e0b",
    icon: "Bot",
  },
  {
    id: "ml-ai",
    order: 2,
    status: "coming_soon",
    title: { en: "AI & Machine Learning", fr: "IA & Machine Learning" },
    description: {
      en: "Train machines to recognise patterns, images and language.",
      fr: "Entraîne des machines à reconnaître des formes, des images et le langage.",
    },
    color: "#8b5cf6",
    icon: "Brain",
  },
  {
    id: "game-dev",
    order: 3,
    status: "coming_soon",
    title: { en: "Game Development", fr: "Création de Jeux" },
    description: {
      en: "Build your own playable games and publish them on the web.",
      fr: "Crée tes propres jeux et publie-les sur le web.",
    },
    color: "#06b6d4",
    icon: "Gamepad2",
  },
];

export const MODULES: Module[] = [
  {
    id: "py-basics",
    trackId: "physical-ai",
    order: 1,
    color: "#3b82f6",
    title: { en: "1. Python Basics", fr: "1. Bases de Python" },
  },
  {
    id: "simulator",
    trackId: "physical-ai",
    order: 2,
    color: "#22c55e",
    title: { en: "2. Meet the Simulator", fr: "2. Découvre le Simulateur" },
  },
  {
    id: "movement",
    trackId: "physical-ai",
    order: 3,
    color: "#f97316",
    title: { en: "3. Make the Robot Move", fr: "3. Fais bouger le Robot" },
  },
  {
    id: "senses",
    trackId: "physical-ai",
    order: 4,
    color: "#a855f7",
    title: { en: "4. Give the Robot Senses", fr: "4. Donne des sens au Robot" },
  },
  {
    id: "mission",
    trackId: "physical-ai",
    order: 5,
    color: "#eab308",
    title: { en: "5. The Robot Does a Job", fr: "5. Le Robot fait un vrai travail" },
  },
];

/** Body text is deliberately short placeholder copy for Phase 1. */
const soon = {
  en: "This lesson is being written. The structure is ready — the content arrives in the next phase.",
  fr: "Cette leçon est en cours d'écriture. La structure est prête — le contenu arrive à la prochaine phase.",
};

interface SeedLesson {
  id: string;
  moduleId: string;
  type: Lesson["type"];
  title: { en: string; fr: string };
  points: number;
  x: number;
  y: number;
}

/**
 * Node positions trace a winding path up the map (x/y are percentages), the
 * same feel as the Kalimat Crash level road.
 */
const SEED: SeedLesson[] = [
  // Module 1 -- Python basics (the supervisor's "about 4 sessions")
  { id: "py-1", moduleId: "py-basics", type: "python_sandbox", points: 10, x: 22, y: 94,
    title: { en: "Your first line of code", fr: "Ta première ligne de code" } },
  { id: "py-2", moduleId: "py-basics", type: "python_sandbox", points: 10, x: 45, y: 88,
    title: { en: "Numbers and variables", fr: "Nombres et variables" } },
  { id: "py-3", moduleId: "py-basics", type: "python_sandbox", points: 15, x: 28, y: 81,
    title: { en: "Making decisions: if / else", fr: "Prendre des décisions : if / else" } },
  { id: "py-4", moduleId: "py-basics", type: "python_sandbox", points: 15, x: 52, y: 74,
    title: { en: "Repeating with loops", fr: "Répéter avec les boucles" } },
  // Module 2 -- the simulator
  { id: "sim-1", moduleId: "simulator", type: "text_video", points: 10, x: 30, y: 67,
    title: { en: "What is a robot simulator?", fr: "C'est quoi un simulateur de robot ?" } },
  { id: "sim-2", moduleId: "simulator", type: "local_setup", points: 25, x: 55, y: 60,
    title: { en: "Install the simulator", fr: "Installe le simulateur" } },
  { id: "sim-3", moduleId: "simulator", type: "sim_viewer", points: 15, x: 32, y: 53,
    title: { en: "Meet the Go2 robot", fr: "Rencontre le robot Go2" } },
  // Module 3 -- movement
  { id: "mv-1", moduleId: "movement", type: "sim_viewer", points: 20, x: 58, y: 46,
    title: { en: "Make it stand up", fr: "Fais-le tenir debout" } },
  { id: "mv-2", moduleId: "movement", type: "sim_viewer", points: 25, x: 34, y: 39,
    title: { en: "Make it walk", fr: "Fais-le marcher" } },
  { id: "mv-3", moduleId: "movement", type: "sim_viewer", points: 25, x: 60, y: 32,
    title: { en: "Turn and walk backwards", fr: "Tourner et marcher en arrière" } },
  // Module 4 -- senses
  { id: "sn-1", moduleId: "senses", type: "sim_viewer", points: 25, x: 36, y: 25,
    title: { en: "The robot's camera", fr: "La caméra du robot" } },
  { id: "sn-2", moduleId: "senses", type: "python_sandbox", points: 30, x: 62, y: 18,
    title: { en: "Recognising colours and objects", fr: "Reconnaître couleurs et objets" } },
  // Module 5 -- the mission
  { id: "ms-1", moduleId: "mission", type: "sim_viewer", points: 30, x: 38, y: 12,
    title: { en: "The arm and the gripper", fr: "Le bras et la pince" } },
  { id: "ms-2", moduleId: "mission", type: "sim_viewer", points: 50, x: 60, y: 5,
    title: { en: "Final mission: sort the waste", fr: "Mission finale : trier les déchets" } },
];

export const LESSONS: Lesson[] = SEED.map((s, i) => ({
  id: s.id,
  moduleId: s.moduleId,
  trackId: "physical-ai",
  order: i + 1,
  type: s.type,
  title: s.title,
  body: soon,
  points: s.points,
  mapPosition: { x: s.x, y: s.y },
  ...(s.type === "python_sandbox"
    ? { initialCode: "# Write your code here\n" }
    : {}),
}));
