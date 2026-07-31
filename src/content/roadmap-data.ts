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
  /** YouTube id, when the lesson has a video. */
  videoId?: string;
  /** Seeds the code editor. A lesson with this gets an interactive sandbox;
   *  one without keeps a plain reading page. */
  starterCode?: string;
}

/** Optional warm-up module offered before a track starts. */
export interface Primer {
  title: string;
  why: string;
  lessons: string[];
  minutes: number;
  /** The track the primer actually IS -- it has its own lessons, its own
   *  challenges and its own briefing page, so the link has to be able to
   *  point at it rather than assuming an id. */
  trackId?: string;
}

/** The "before you start" briefing shown on a track's intro page. */
export interface TrackOverview {
  tagline: string;
  forWho: string;
  outcomes: string[];
  advice: string[];
  primer?: Primer;
}

export interface RoadmapTrack {
  id: string;
  title: string;
  short: string;
  description: string;
  color: string;
  glow: string;
  icon: string;
  /** Hidden from the main track switcher (e.g. an optional sub-course). */
  hidden?: boolean;
  /** Shown but not enterable yet -- the supervisor decides this per track. */
  comingSoon?: boolean;
  overview: TrackOverview;
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
export function layout<T extends { id: string }>(items: T[]): { x: number; y: number }[] {
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

const mlLevels = build([
  { id: "ml-1", title: "Python Basics", shortDescription: "Your very first lines of code: print, comments, and running a program.", type: "lesson", state: "completed", xpReward: 40, durationMinutes: 15, difficulty: "easy", skills: ["print", "syntax"], section: "Foundations" },
  { id: "ml-2", title: "Variables & Data Types", shortDescription: "Store text and numbers, and learn what a type actually is.", type: "lesson", state: "completed", xpReward: 40, durationMinutes: 20, difficulty: "easy", skills: ["variables", "types"] },
  { id: "ml-3", title: "Conditions & Loops", shortDescription: "Make your program decide and repeat — the heart of every algorithm.", type: "lesson", state: "completed", xpReward: 60, durationMinutes: 25, difficulty: "easy", skills: ["if/else", "for", "while"] },
  { id: "ml-4", title: "Functions", shortDescription: "Package your code into reusable blocks you can call anywhere.", type: "lesson", state: "current", xpReward: 60, durationMinutes: 25, difficulty: "medium", skills: ["def", "return"], section: "Building Blocks" },
  { id: "ml-5", title: "Lists & Dictionaries", shortDescription: "Hold many values at once and look them up by name.", type: "lesson", state: "locked", xpReward: 70, durationMinutes: 30, difficulty: "medium", skills: ["list", "dict"] },
  { id: "ml-6", title: "Checkpoint: Code Drills", shortDescription: "Prove the basics stuck before moving into data work.", type: "checkpoint", state: "locked", xpReward: 100, durationMinutes: 20, difficulty: "medium", skills: ["review"], badge: "Syntax Solid" },
  { id: "ml-7", title: "NumPy Basics", shortDescription: "Arrays and fast maths — the foundation under every AI library.", type: "lesson", state: "locked", xpReward: 80, durationMinutes: 30, difficulty: "medium", skills: ["numpy", "arrays"], section: "Into AI" },
  { id: "ml-8", title: "Data Analysis Intro", shortDescription: "Load a real dataset and pull the story out of it.", type: "lesson", state: "locked", xpReward: 90, durationMinutes: 35, difficulty: "medium", skills: ["pandas", "plots"] },
  { id: "ml-9", title: "Machine Learning Basics", shortDescription: "How a model learns from examples instead of rules.", type: "lesson", state: "locked", xpReward: 110, durationMinutes: 40, difficulty: "hard", skills: ["training", "features"] },
  { id: "ml-10", title: "Build Your First AI Model", shortDescription: "Train, test and use a model that makes real predictions.", type: "final_project", state: "locked", xpReward: 250, durationMinutes: 60, difficulty: "hard", skills: ["end-to-end ML"], badge: "AI Builder" },
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

const primerLevels = build([
  { id: "pp-1", title: "Your First Line of Code", shortDescription: "Say hello with print(), and learn what a comment is for.", type: "lesson", state: "current", xpReward: 30, durationMinutes: 15, difficulty: "easy", skills: ["print"], section: "Python Warm-up", starterCode: "# Anything after a # is a comment -- Python ignores it.\n# print() shows a value on the screen. Press Run and see.\n\nprint(\"Hello from my first program!\")\n" },
  { id: "pp-2", title: "Variables, Numbers & Text", shortDescription: "Store values, do maths, and join words together.", type: "lesson", state: "locked", xpReward: 30, durationMinutes: 15, difficulty: "easy", skills: ["variables"], starterCode: "# A variable stores a value under a name you choose.\nname = \"Axi\"\nlegs = 4\n\n# f\" ... \" lets you drop a variable straight into text.\nprint(f\"{name} has {legs} legs.\")\nprint(f\"With two more, that is {legs + 2}.\")\n" },
  { id: "pp-3", title: "If, Else & Loops", shortDescription: "Let your program decide, and repeat work without retyping it.", type: "lesson", state: "locked", xpReward: 40, durationMinutes: 15, difficulty: "easy", skills: ["if", "loops"], starterCode: "# A loop repeats work without retyping it.\nfor step in range(1, 5):\n    print(f\"Step {step}\")\n\n# An if decides which branch to take.\ndistance = 15\nif distance < 20:\n    print(\"Too close -- stop!\")\nelse:\n    print(\"Clear ahead.\")\n" },
  { id: "pp-4", title: "Functions & Lists", shortDescription: "Package code you reuse, and hold many values at once.", type: "final_project", state: "locked", xpReward: 60, durationMinutes: 15, difficulty: "easy", skills: ["functions", "lists"], badge: "Python Ready", starterCode: "# A function packages code you want to reuse.\ndef describe(part, count):\n    return f\"The robot has {count} {part}.\"\n\n# A list holds many values at once.\nparts = [\"leg\", \"motor\", \"sensor\"]\ncounts = [4, 12, 3]\n\nfor part, count in zip(parts, counts):\n    print(describe(part, count))\n" },
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
    overview: {
      tagline: "Make a real robot see, think and move -- in a simulator on your own computer.",
      forWho:
        "For anyone curious about robots. No experience needed: you only need a computer and patience.",
      outcomes: [
        "How a robot senses the world with cameras and sensors, and how it moves with motors",
        "The control loop every robot runs on: sense, think, act, repeat",
        "How to make a four-legged robot stand, walk, turn and keep its balance",
        "How a robot recognises objects by colour and shape from its own camera",
        "How to control a robotic arm and grip an object without dropping it",
        "How to combine all of it into one mission the robot completes by itself",
      ],
      advice: [
        "Run every example yourself. Watching code is not learning code -- breaking it and fixing it is.",
        "When something fails, read the error slowly. In robotics the error message is usually the answer.",
        "Change one number at a time and watch what happens. That is how you build real intuition.",
        "Keep a small notebook of what you tried. Your own notes will save you hours later.",
        "Do a little every day rather than everything on Sunday -- your streak is on the map for a reason.",
      ],
      primer: {
        title: "New to programming? Start with Python (optional)",
        why:
          "This track uses a little Python to talk to the robot. If you have never written code, take these four short lessons first -- about an hour in total. Already comfortable with Python? Skip straight to the robot.",
        minutes: 60,
        lessons: [
          "Your first line of code: print and comments",
          "Variables, numbers and text",
          "Making decisions: if, else and loops",
          "Functions and lists",
        ],
      },
    },
    levels: physicalLevels,
  },
  {
    id: "ml-ai",
    title: "AI & Machine Learning",
    short: "ML",
    description: "Teach machines to find patterns and make predictions.",
    color: "#a78bfa",
    glow: "167,139,250",
    icon: "Brain",
    comingSoon: true,
    overview: {
      tagline: "Teach a machine to learn from data -- from first principles to a model that predicts.",
      forWho: "For complete beginners. If you can use a browser, you can start here.",
      outcomes: [
        "Write Python confidently: variables, conditions, loops, functions and data",
        "Handle real data with NumPy and pandas instead of toy examples",
        "Understand what it actually means for a machine to learn from examples",
        "Train, test and judge your own model -- and know when it is fooling you",
        "Finish by building an AI model end to end, from raw data to prediction",
      ],
      advice: [
        "Type the code out instead of copying it. Your fingers learn the syntax too.",
        "Every time something works, change it on purpose to see what breaks.",
        "Do not rush to machine learning -- strong basics make the AI part easy.",
        "Explain what you learned to someone else. If you cannot, you are not done yet.",
      ],
    },
    levels: mlLevels,
  },
  {
    id: "game-dev",
    title: "Game Development",
    short: "GAMES",
    description: "Build and publish your own playable game.",
    color: "#f472b6",
    glow: "244,114,182",
    icon: "Gamepad2",
    comingSoon: true,
    overview: {
      tagline: "Build a real game you can play, then put it online for your friends.",
      forWho: "Made for younger learners. Fun first -- the serious skills sneak in along the way.",
      outcomes: [
        "How games are actually built: scenes, sprites, and the game loop",
        "Bring a character to life and control it with the keyboard",
        "Add points, obstacles, enemies, sound and effects",
        "Design levels that are fun and fair instead of frustrating",
        "Publish your finished game on the web and share the link",
      ],
      advice: [
        "Make the smallest playable thing first, then make it better. Finished beats perfect.",
        "Let a friend play it and just watch -- you will learn more in two minutes than in an hour of guessing.",
        "Save your work often, and keep a copy before big changes.",
        "Steal ideas from games you love, then make them yours.",
      ],
    },
    levels: gameLevels,
  },

  {
    id: "python-primer",
    title: "Python Warm-up",
    short: "PYTHON",
    description: "The optional hour of Python you need before the robot track.",
    color: "#a78bfa",
    glow: "167,139,250",
    icon: "Code",
    hidden: true,
    overview: {
      tagline: "One hour of Python, just enough to start talking to a robot.",
      forWho: "For anyone who has never written code. Completely optional -- skip it if you already have.",
      outcomes: [
        "Write and run your own Python program",
        "Use variables to store numbers and text",
        "Make your program decide with if/else and repeat with loops",
        "Write functions and use lists -- the two things robot code leans on most",
      ],
      advice: [
        "Type every example instead of copying it.",
        "Break it on purpose, then fix it. That is the fastest way to understand it.",
        "One lesson a day is plenty -- this is a warm-up, not a race.",
      ],
    },
    levels: primerLevels,
  },
];

/** Tracks shown in the main switcher (sub-courses stay out of it). */
export const mainTracks = tracks.filter((t) => !t.hidden);

export function trackProgress(track: RoadmapTrack): number {
  const done = track.levels.filter((l) => l.state === "completed").length;
  return Math.round((done / track.levels.length) * 100);
}
