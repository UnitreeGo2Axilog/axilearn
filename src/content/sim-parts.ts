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

/**
 * A quote from the actual research project, shown beside the simplified
 * version the learner runs.
 *
 * This matters more than it looks. The browser cannot run go2_rl -- it needs
 * MuJoCo, PyTorch and a DDS stack that will never load in a tab -- so the
 * cells are a faithful port, not the original. Showing the original next to it
 * keeps that honest: "you wrote the simple version, here is the real line, and
 * they are the same idea."
 */
export interface RealCode {
  /** Where it lives in the go2_rl project. */
  file: string;
  code: string;
  note: Localized;
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
  /** Glossary ids introduced by this part, in the order they come up. */
  terms?: string[];
  /** The real project code this part is a simplified version of. */
  realCode?: RealCode;
}

export const SIM_PARTS: SimPart[] = [
  {
    id: "sp-stand-up",
    lessonId: "ph-2",
    title: { en: "Part 1 — Stand up", fr: "Partie 1 — Se lever" },
    intro: {
      en: "A real Go2 wakes up folded flat on the floor. Before it can walk, or see, or carry anything, it has to push itself up onto four legs. That is the first thing the research project had to solve, and the angles you are about to use are the ones it actually uses.",
      fr: "Un vrai Go2 se réveille replié à plat sur le sol. Avant de marcher, de voir ou de porter quoi que ce soit, il doit se hisser sur ses quatre pattes. C'est le premier problème qu'a dû résoudre le projet de recherche, et les angles que tu vas utiliser sont ceux qu'il utilise vraiment.",
    },
    terms: ["joint", "radian", "actuator", "pd-control", "gain"],
    cells: [
      {
        id: "c1",
        kind: "given",
        explain: {
          en: "Start by looking, not moving. This asks the robot two questions and prints the answers. Press Run and read the numbers.",
          fr: "Commence par regarder, pas par bouger. Ceci pose deux questions au robot et affiche les réponses. Appuie sur Lancer et lis les nombres.",
        },
        code: `print("height:", round(robot.height, 3))
print("standing?", robot.is_standing)`,
      },
      {
        id: "c2",
        kind: "given",
        explain: {
          en: "0.09 means nine centimetres — it is lying down. Every leg has three joints: hip, thigh and knee. This moves only the front left leg, so you can see which part is which before moving all of them.",
          fr: "0,09 veut dire neuf centimètres : il est couché. Chaque patte a trois articulations : hanche, cuisse et genou. Ceci ne bouge que la patte avant gauche, pour voir quelle partie est laquelle avant de toutes les bouger.",
        },
        code: `robot.set_leg("front_left", thigh=0.4, knee=-1.2, seconds=1)
robot.wait(0.5)`,
      },
      {
        id: "c3",
        kind: "given",
        explain: {
          en: "These three numbers are not made up. In the real project they are one line — LEG_STAND — and every one of the four legs is sent the same three values. Run this to see them written down.",
          fr: "Ces trois nombres ne sont pas inventés. Dans le vrai projet, c'est une seule ligne — LEG_STAND — et les quatre pattes reçoivent les mêmes trois valeurs. Lance ceci pour les voir écrites.",
        },
        code: `# straight from waste_sorting/scene.py in the real Go2 project
LEG_STAND = (0.0, 0.9, -1.8)   # hip, thigh, knee -- in radians

hip, thigh, knee = LEG_STAND
print("hip", hip, "| thigh", thigh, "| knee", knee)`,
      },
      {
        id: "c4",
        kind: "todo",
        explain: {
          en: "Now stand it up. All four legs must push at the same moment — one leg alone cannot lift the body, and three cannot either if the fourth is not helping. Use the LEG_STAND values you just unpacked.",
          fr: "Maintenant, mets-le debout. Les quatre pattes doivent pousser au même moment : une seule patte ne peut pas soulever le corps, et trois non plus si la quatrième n'aide pas. Utilise les valeurs LEG_STAND que tu viens de séparer.",
        },
        code: `## TODO: send all four legs to the standing angles.
## One line. robot.set_all_legs(thigh=..., knee=..., seconds=1.5)
## You already have the numbers in thigh and knee.

robot.wait(1)
print("height:", round(robot.height, 3))
print("standing?", robot.is_standing)`,
        hint: {
          en: "set_all_legs takes the same arguments as set_leg but sends them to every leg at once. You can pass the variables thigh and knee straight in.",
          fr: "set_all_legs prend les mêmes arguments que set_leg mais les envoie à toutes les pattes d'un coup. Tu peux passer directement les variables thigh et knee.",
        },
        solution: `robot.set_all_legs(thigh=thigh, knee=knee, seconds=1.5)

robot.wait(1)
print("height:", round(robot.height, 3))
print("standing?", robot.is_standing)`,
      },
      {
        id: "c5",
        kind: "given",
        explain: {
          en: "One more real number. The project decides the robot has fallen when its body drops below 0.18 m. Your robot should be well above that — run this and check.",
          fr: "Encore un vrai nombre. Le projet considère que le robot est tombé quand son corps descend sous 0,18 m. Le tien devrait être bien au-dessus — lance ceci pour vérifier.",
        },
        code: `# waste_sorting/robot.py:  def is_fallen(self): return self.base_height() < 0.18
FALLEN_BELOW = 0.18

print("height  ", round(robot.height, 3))
print("fallen? ", robot.height < FALLEN_BELOW)`,
      },
    ],
    check: "robot.is_standing and robot.height > 0.18",
    success: {
      en: "It is standing. The body went from 9 cm to about 28 cm, and the only thing that made that happen was your line of Python — using the exact angles the real robot uses.",
      fr: "Il est debout. Le corps est passé de 9 cm à environ 28 cm, et la seule chose qui a provoqué ça, c'est ta ligne de Python — avec les angles exacts du vrai robot.",
    },
    failure: {
      en: "Not up yet. Look at the height in the output. If it barely changed, the legs did not all get the command — set_all_legs is the one that sends to all four. If it went up and fell back, check the knee is negative.",
      fr: "Pas encore debout. Regarde la hauteur affichée. Si elle a à peine bougé, les pattes n'ont pas toutes reçu l'ordre — set_all_legs est celle qui envoie aux quatre. Si elle est montée puis retombée, vérifie que le genou est bien négatif.",
    },
    realCode: {
      file: "waste_sorting/robot.py",
      code: `_KP, _KD = 200.0, 6.0
_SUBSTEPS = 10

for _ in range(_SUBSTEPS):
    q  = self.data.qpos[self.leg_qadr]   # where each joint IS
    qd = self.data.qvel[self.leg_vadr]   # how fast it is moving
    tau = _KP * (target - q) - _KD * qd  # push, then brake
    ...
    mujoco.mj_step(self.model, self.data)`,
      note: {
        en: "This is what robot.set_all_legs does for you. The motor is not teleported to the angle — it is pushed towards it, harder the further away it is (that is the 200), and braked if it is moving fast (the 6). Without the braking the leg overshoots and wobbles forever.",
        fr: "Voilà ce que robot.set_all_legs fait à ta place. Le moteur n'est pas téléporté à l'angle : il est poussé vers lui, d'autant plus fort qu'il en est loin (c'est le 200), et freiné s'il va vite (le 6). Sans le freinage, la patte dépasse et oscille sans fin.",
      },
    },
  },
];

export function getSimPart(id: string): SimPart | undefined {
  return SIM_PARTS.find((p) => p.id === id);
}

export function simPartsForLesson(lessonId: string): SimPart[] {
  return SIM_PARTS.filter((p) => p.lessonId === lessonId);
}
