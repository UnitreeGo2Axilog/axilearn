/**
 * A "part" of the robot course: a run of cells that build on each other,
 * ending in a robot that either did the thing or did not.
 *
 * Shaped after the notebooks these learners will meet later (NVIDIA's, Kaggle's)
 * but with two deliberate differences, both because the reader is twelve:
 *
 *  - Most cells are ALREADY WRITTEN and merely explained. A wall of blanks is
 *    how you lose a beginner. They read working code, run it, watch the robot,
 *    and only then are asked to write something.
 *  - The blanks that do exist are small and specific -- usually one or two
 *    lines with the surrounding code intact -- and every one has a hint before
 *    it has an answer.
 *
 * The cells share one Python namespace and one robot, in order, so a part
 * reads as a single story rather than five disconnected snippets.
 */
// Localized is the codebase's existing Record<Locale, string>; no second
// bilingual type gets invented here.
import type { Localized } from "@/content/types";

export interface SimCell {
  id: string;
  /**
   * `given`  -- written for them; they read it, run it, watch what happens.
   * `todo`   -- the interesting line is missing and they write it.
   */
  kind: "given" | "todo";
  /** A sentence or two above the cell. What this step is for. */
  explain: Localized;
  code: string;
  /** `todo` only: one nudge, before any answer is offered. */
  hint?: Localized;
  /** `todo` only: the version that works, revealed on request. */
  solution?: string;
}

export interface SimPart {
  id: string;
  /** The lesson this part belongs to. */
  lessonId: string;
  title: Localized;
  intro: Localized;
  cells: SimCell[];
  /**
   * A Python expression, evaluated in the learner's own namespace after the
   * part runs. True means they did it.
   */
  check: string;
  /** What to say when the check passes, and when it does not. */
  success: Localized;
  failure: Localized;
  /**
   * A clip of the real Go2 doing this, from the research project. Shown NEXT
   * TO their simulation, not instead of it: "yours in the simulator, mine on
   * the actual robot."
   */
  realVideo?: string;
}

export const SIM_PARTS: SimPart[] = [
  {
    id: "sp-stand-up",
    lessonId: "ph-2",
    title: { en: "Part 1 — Stand up", fr: "Partie 1 — Se lever" },
    intro: {
      en: "The robot starts folded on the floor, the way a real Go2 does when you switch it on. Your job is to get it standing on all four legs.",
      fr: "Le robot commence replié au sol, comme un vrai Go2 quand on l'allume. Ton travail : le faire tenir debout sur ses quatre pattes.",
    },
    cells: [
      {
        id: "c1",
        kind: "given",
        explain: {
          en: "First, look at it. This code does not move anything — it just asks the robot two questions and prints the answers. Press Run.",
          fr: "D'abord, regarde-le. Ce code ne bouge rien : il pose deux questions au robot et affiche les réponses. Appuie sur Lancer.",
        },
        code: `print("height:", round(robot.height, 3))
print("standing?", robot.is_standing)`,
      },
      {
        id: "c2",
        kind: "given",
        explain: {
          en: "0.09 metres is nine centimetres — it is lying down. A leg has three joints: the hip, the thigh and the knee. This moves just the front left one, so you can see which part is which.",
          fr: "0,09 mètre, c'est neuf centimètres : il est couché. Une patte a trois articulations : la hanche, la cuisse et le genou. Ceci bouge seulement celle de devant à gauche, pour voir quelle partie est laquelle.",
        },
        code: `robot.set_leg("front_left", thigh=0.4, knee=-1.2, seconds=1)
robot.wait(0.5)`,
      },
      {
        id: "c3",
        kind: "todo",
        explain: {
          en: "Now the real thing. All four legs have to push together — one leg alone cannot lift the body. Set every leg to the standing angles: thigh 0.9 and knee -1.8.",
          fr: "Maintenant le vrai défi. Les quatre pattes doivent pousser ensemble : une seule patte ne peut pas soulever le corps. Mets chaque patte aux angles debout : cuisse 0.9 et genou -1.8.",
        },
        code: `## TODO: make all four legs push down together.
## One line. Use robot.set_all_legs(thigh=..., knee=..., seconds=1.5)

robot.wait(1)
print("height:", round(robot.height, 3))`,
        hint: {
          en: "set_all_legs takes the same three angles as set_leg, but sends them to every leg at once. You need thigh and knee.",
          fr: "set_all_legs prend les mêmes angles que set_leg, mais les envoie aux quatre pattes d'un coup. Il te faut cuisse et genou.",
        },
        solution: `robot.set_all_legs(thigh=0.9, knee=-1.8, seconds=1.5)

robot.wait(1)
print("height:", round(robot.height, 3))`,
      },
    ],
    check: "robot.is_standing",
    success: {
      en: "It is standing. The body went from 9 cm to about 28 cm off the floor — and the only thing that made that happen was your line of Python.",
      fr: "Il est debout. Le corps est passé de 9 cm à environ 28 cm du sol, et la seule chose qui a provoqué ça, c'est ta ligne de Python.",
    },
    failure: {
      en: "Not up yet. Check the robot's height in the output: if it barely moved, the legs probably did not all get the command. All four have to push at the same time.",
      fr: "Pas encore debout. Regarde la hauteur affichée : si elle a à peine bougé, les pattes n'ont sans doute pas toutes reçu l'ordre. Les quatre doivent pousser en même temps.",
    },
  },
];

export function getSimPart(id: string): SimPart | undefined {
  return SIM_PARTS.find((p) => p.id === id);
}

export function simPartsForLesson(lessonId: string): SimPart[] {
  return SIM_PARTS.filter((p) => p.lessonId === lessonId);
}
