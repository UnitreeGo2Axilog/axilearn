/**
 * Mock data for the mission-map roadmap.
 *
 * Shape follows the product brief: a track holds levels, each level knows its
 * own type/state/reward/position, and a separate `learner` object holds the
 * gamification state. Positions are percentages inside the map canvas -- x
 * alternates left/right for visual rhythm, y walks down the map, so the path
 * winds vertically on a phone screen.
 *
 * All three tracks are filled in here because this is a design prototype; in
 * the product only Physical AI has real content for now (the other two are the
 * supervisor's, later).
 */

export type LevelType = "lesson" | "checkpoint" | "project" | "final_project";
export type LevelState = "completed" | "current" | "locked";
export type Difficulty = "easy" | "medium" | "hard";

export interface Level {
  id: string;
  title: string;
  shortDescription: string;
  type: LevelType;
  state: LevelState;
  xpReward: number;
  durationMinutes: number;
  difficulty: Difficulty;
  position: { x: number; y: number };
  skills: string[];
  badge?: string;
  section?: string;
}

export interface RoadmapTrack {
  id: string;
  title: string;
  short: string;
  description: string;
  color: string;
  glow: string;
  icon: string;
  levels: Level[];
}

export interface Learner {
  name: string;
  level: number;
  currentXp: number;
  nextLevelXp: number;
  streakDays: number;
  coins: number;
  activeTrackId: string;
}

export const learner: Learner = {
  name: "Nasser",
  level: 4,
  currentXp: 380,
  nextLevelXp: 600,
  streakDays: 6,
  coins: 240,
  activeTrackId: "physical-ai",
};

/**
 * Positions the levels across the WHOLE map area (percentages).
 *
 * The reference art shows an entire mission map filling the screen, so the
 * route weaves widely (14%..86%) instead of hugging a narrow centre column,
 * and walks from the bottom of the map to the top -- climbing, which reads as
 * progress.
 */
function layout<T extends { id: string }>(items: T[]): { x: number; y: number }[] {
  const pad = 9;
  const span = 100 - pad * 2;
  const gap = span / Math.max(items.length - 1, 1);
  // five-column weave: wide, irregular, never a straight zig-zag
  const weave = [20, 46, 74, 86, 58, 30, 14, 50];
  return items.map((_, i) => ({
    x: weave[i % weave.length],
    y: 100 - pad - i * gap,
  }));
}

function build(
  raw: Omit<Level, "position">[],
): Level[] {
  const pos = layout(raw);
  return raw.map((l, i) => ({ ...l, position: pos[i] }));
}

const pythonLevels = build([
  { id: "py-1", title: "Python Basics", shortDescription: "Your very first lines of code: print, comments, and running a program.", type: "lesson", state: "completed", xpReward: 40, durationMinutes: 15, difficulty: "easy", skills: ["print", "syntax"], section: "Foundations" },
  { id: "py-2", title: "Variables & Data Types", shortDescription: "Store text and numbers, and learn what a type actually is.", type: "lesson", state: "completed", xpReward: 40, durationMinutes: 20, difficulty: "easy", skills: ["variables", "types"] },
  { id: "py-3", title: "Conditions & Loops", shortDescription: "Make your program decide and repeat — the heart of every algorithm.", type: "lesson", state: "completed", xpReward: 60, durationMinutes: 25, difficulty: "easy", skills: ["if/else", "for", "while"] },
  { id: "py-4", title: "Functions", shortDescription: "Package your code into reusable blocks you can call anywhere.", type: "lesson", state: "current", xpReward: 60, durationMinutes: 25, difficulty: "medium", skills: ["def", "return"], section: "Building Blocks" },
  { id: "py-5", title: "Lists & Dictionaries", shortDescription: "Hold many values at once and look them up by name.", type: "lesson", state: "locked", xpReward: 70, durationMinutes: 30, difficulty: "medium", skills: ["list", "dict"] },
  { id: "py-6", title: "Checkpoint: Code Drills", shortDescription: "Prove the basics stuck before moving into data work.", type: "checkpoint", state: "locked", xpReward: 100, durationMinutes: 20, difficulty: "medium", skills: ["review"], badge: "Syntax Solid" },
  { id: "py-7", title: "NumPy Basics", shortDescription: "Arrays and fast maths — the foundation under every AI library.", type: "lesson", state: "locked", xpReward: 80, durationMinutes: 30, difficulty: "medium", skills: ["numpy", "arrays"], section: "Into AI" },
  { id: "py-8", title: "Data Analysis Intro", shortDescription: "Load a real dataset and pull the story out of it.", type: "lesson", state: "locked", xpReward: 90, durationMinutes: 35, difficulty: "medium", skills: ["pandas", "plots"] },
  { id: "py-9", title: "Machine Learning Basics", shortDescription: "How a model learns from examples instead of rules.", type: "lesson", state: "locked", xpReward: 110, durationMinutes: 40, difficulty: "hard", skills: ["training", "features"] },
  { id: "py-10", title: "Build Your First AI Model", shortDescription: "Train, test and use a model that makes real predictions.", type: "final_project", state: "locked", xpReward: 250, durationMinutes: 60, difficulty: "hard", skills: ["end-to-end ML"], badge: "AI Builder" },
]);

const physicalLevels = build([
  { id: "ph-1", title: "What is Physical AI?", shortDescription: "Where software intelligence meets motors, sensors and the real world.", type: "lesson", state: "completed", xpReward: 40, durationMinutes: 15, difficulty: "easy", skills: ["concepts"], section: "Orientation" },
  { id: "ph-2", title: "Sensors & Input", shortDescription: "How a robot perceives: cameras, distance, touch and more.", type: "lesson", state: "completed", xpReward: 50, durationMinutes: 20, difficulty: "easy", skills: ["sensors"] },
  { id: "ph-3", title: "Actuators & Output", shortDescription: "Motors and joints — turning a decision into movement.", type: "lesson", state: "current", xpReward: 60, durationMinutes: 25, difficulty: "easy", skills: ["motors", "servos"], section: "Body & Control" },
  { id: "ph-4", title: "Robotics Logic", shortDescription: "The control loop: sense, think, act, repeat.", type: "lesson", state: "locked", xpReward: 70, durationMinutes: 30, difficulty: "medium", skills: ["control loop"] },
  { id: "ph-5", title: "Computer Vision for Robots", shortDescription: "Give the robot eyes: detect and recognise what it sees.", type: "lesson", state: "locked", xpReward: 90, durationMinutes: 35, difficulty: "medium", skills: ["vision", "detection"], section: "Perception" },
  { id: "ph-6", title: "Checkpoint: Robot Reflexes", shortDescription: "Wire perception into action and prove the loop works.", type: "checkpoint", state: "locked", xpReward: 120, durationMinutes: 25, difficulty: "medium", skills: ["review"], badge: "Reflex Ready" },
  { id: "ph-7", title: "AI Decision Systems", shortDescription: "Choosing the next action when the world is messy.", type: "lesson", state: "locked", xpReward: 100, durationMinutes: 35, difficulty: "hard", skills: ["planning"] },
  { id: "ph-8", title: "Smart Robot Workflow", shortDescription: "Chain perception, navigation and grasping into one mission.", type: "project", state: "locked", xpReward: 160, durationMinutes: 45, difficulty: "hard", skills: ["integration"], badge: "Systems Thinker", section: "Mission" },
  { id: "ph-9", title: "Physical AI Capstone", shortDescription: "Your robot sorts real objects on its own, start to finish.", type: "final_project", state: "locked", xpReward: 300, durationMinutes: 70, difficulty: "hard", skills: ["capstone"], badge: "Robot Master" },
]);

const gameLevels = build([
  { id: "gd-1", title: "Intro to Game Worlds", shortDescription: "What a game is made of, and how yours will look.", type: "lesson", state: "completed", xpReward: 40, durationMinutes: 15, difficulty: "easy", skills: ["scenes"], section: "Start Here" },
  { id: "gd-2", title: "Characters & Sprites", shortDescription: "Create your hero and bring it on screen.", type: "lesson", state: "current", xpReward: 50, durationMinutes: 20, difficulty: "easy", skills: ["sprites"] },
  { id: "gd-3", title: "Movement & Controls", shortDescription: "Make your character run and jump with the keyboard.", type: "lesson", state: "locked", xpReward: 60, durationMinutes: 25, difficulty: "easy", skills: ["input"], section: "Make It Move" },
  { id: "gd-4", title: "Scoring System", shortDescription: "Collect points and show them on screen.", type: "lesson", state: "locked", xpReward: 60, durationMinutes: 20, difficulty: "easy", skills: ["score", "UI"] },
  { id: "gd-5", title: "Obstacles & Enemies", shortDescription: "Add danger — because a game needs a challenge.", type: "lesson", state: "locked", xpReward: 80, durationMinutes: 30, difficulty: "medium", skills: ["collisions"] },
  { id: "gd-6", title: "Sound & Effects", shortDescription: "Jump sounds, music and sparkles that make it feel alive.", type: "lesson", state: "locked", xpReward: 70, durationMinutes: 20, difficulty: "easy", skills: ["audio", "fx"] },
  { id: "gd-7", title: "Level Design", shortDescription: "Build levels that are fun, not frustrating.", type: "checkpoint", state: "locked", xpReward: 110, durationMinutes: 30, difficulty: "medium", skills: ["design"], badge: "Level Designer", section: "Craft" },
  { id: "gd-8", title: "Build Your First Game", shortDescription: "Put every piece together into a game you can play.", type: "project", state: "locked", xpReward: 180, durationMinutes: 50, difficulty: "medium", skills: ["build"] },
  { id: "gd-9", title: "Publish & Share", shortDescription: "Put your game online and send it to your friends.", type: "final_project", state: "locked", xpReward: 260, durationMinutes: 40, difficulty: "medium", skills: ["publish"], badge: "Game Creator" },
]);

export const tracks: RoadmapTrack[] = [
  {
    id: "physical-ai",
    title: "Physical AI",
    short: "ROBOTICS",
    description: "Teach a real robot to see, walk and work.",
    color: "#22d3ee",
    glow: "34,211,238",
    icon: "Bot",
    levels: physicalLevels,
  },
  {
    id: "python-ai",
    title: "Python for AI",
    short: "AI",
    description: "From your first line of code to your first AI model.",
    color: "#a78bfa",
    glow: "167,139,250",
    icon: "Brain",
    levels: pythonLevels,
  },
  {
    id: "game-dev",
    title: "Game Development",
    short: "GAMES",
    description: "Build and publish your own playable game.",
    color: "#f472b6",
    glow: "244,114,182",
    icon: "Gamepad2",
    levels: gameLevels,
  },
];

export function trackProgress(track: RoadmapTrack): number {
  const done = track.levels.filter((l) => l.state === "completed").length;
  return Math.round((done / track.levels.length) * 100);
}
