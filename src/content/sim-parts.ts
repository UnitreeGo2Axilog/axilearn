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
  /**
   * What the clip shows. Required in spirit: a video with no caption invites
   * the reader to assume it is real-world hardware footage, and this one is
   * not -- it is the detailed Go2 model in the same physics engine.
   */
  realVideoNote?: Localized;
  /**
   * A still to show before it plays. Without one the player is a black
   * rectangle, which reads as broken rather than as "press play".
   */
  realVideoPoster?: string;
  /** Glossary ids introduced by this part, in the order they come up. */
  terms?: string[];
  /** The real project code this part is a simplified version of. */
  realCode?: RealCode;
}

export const SIM_PARTS: SimPart[] = [
  {
    id: "sp-stand-up",
    lessonId: "ph-3",
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
    realVideo: "/robot/go2-crawl-10s.mp4",
    realVideoPoster: "/robot/go2-crawl-poster.jpg",
    realVideoNote: {
      en: "The same Go2, with its real shape instead of the simple blocks — walking, from the research project. Your robot is the same machine and the same physics; the blocks just make it easier to see which part is the thigh and which is the knee. Making it walk like this is Part 2.",
      fr: "Le même Go2, avec sa vraie forme au lieu des blocs simples — en train de marcher, tiré du projet de recherche. Ton robot est la même machine et la même physique ; les blocs servent juste à mieux voir quelle partie est la cuisse et laquelle est le genou. Le faire marcher comme ça, c'est la partie 2.",
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
  {
    id: "sp-walk-forward",
    lessonId: "ph-4",
    title: { en: "Part 2 — Walk forward", fr: "Partie 2 — Marcher en avant" },
    intro: {
      en: "Standing still is one pose. Walking is a pose that changes with time, over and over, with the four legs taking turns. The order they take turns in is the gait — and this is the exact one the real Go2 project uses.",
      fr: "Rester debout, c'est une posture. Marcher, c'est une posture qui change avec le temps, encore et encore, les quatre pattes chacune à leur tour. L'ordre de ces tours, c'est l'allure — et c'est exactement celle qu'utilise le vrai projet Go2.",
    },
    terms: ["gait", "crawl-gait", "phase", "trot"],
    cells: [
      {
        id: "w1",
        kind: "given",
        explain: {
          en: "These four numbers are the whole gait. Each leg starts its cycle at a different moment, a quarter apart, so only one leg is ever in the air. Three feet always stay on the ground — which is why this is very hard to knock over.",
          fr: "Ces quatre nombres sont toute l'allure. Chaque patte commence son cycle à un moment différent, espacé d'un quart, donc une seule patte est en l'air à la fois. Trois pieds restent toujours au sol — c'est pour ça que c'est très difficile à faire tomber.",
        },
        code: `# unitree_mujoco/.../foot_trajectory.py -- the real leg_phases
PHASES = {
    "front_left": 0.0, "back_right": 0.25,
    "front_right": 0.5, "back_left": 0.75,
}
for leg, start in PHASES.items():
    print(leg, "starts its cycle at", start)`,
      },
      {
        id: "w2",
        kind: "given",
        explain: {
          en: "A cycle runs from 0 to 1. The project uses duty_factor = 0.75, which means a leg spends three quarters of its cycle pushing on the ground and one quarter in the air. Run this to see which leg is in the air at a few moments in time.",
          fr: "Un cycle va de 0 à 1. Le projet utilise duty_factor = 0.75 : une patte passe trois quarts de son cycle à pousser au sol et un quart en l'air. Lance ceci pour voir quelle patte est en l'air à différents instants.",
        },
        code: `SWING = 1.0 - 0.75      # duty_factor 0.75 -> a quarter in the air
FREQ = 0.7

for t in [0.0, 0.4, 0.8, 1.2]:
    up = [leg for leg, start in PHASES.items()
          if ((t * FREQ + start) % 1.0) < SWING]
    print("at", t, "s the leg in the air is:", up)`,
      },
      {
        id: "w3",
        kind: "todo",
        explain: {
          en: "Now the loop. Every 1/50th of a second it works out, for each leg, where in its cycle it is — then aims that leg. The line that lifts the foot is missing. A knee angle that is MORE negative is a knee folded up tighter, which lifts the foot off the ground.",
          fr: "Maintenant la boucle. Toutes les 1/50e de seconde, elle calcule où en est chaque patte dans son cycle, puis vise cette patte. La ligne qui lève le pied manque. Un angle de genou PLUS négatif, c'est un genou plus replié, ce qui décolle le pied du sol.",
        },
        code: `import math
robot.stand_up(); robot.wait(0.6)
STAND_THIGH, STAND_KNEE = 0.9, -1.8
STEP, LIFT = 0.10, 0.30

t = 0.0
while t < 6.0:
    for leg, start in PHASES.items():
        ph = (t * FREQ + start) % 1.0
        if ph < SWING:                       # in the air: reach forward
            s = ph / SWING
            thigh = STAND_THIGH + STEP * (s - 0.5) * 2
            ## TODO: lift the foot. Fold the knee tighter as the leg swings.
            ## knee = STAND_KNEE - LIFT * math.sin(math.pi * s)
            knee = STAND_KNEE
        else:                                # on the ground: push back
            s = (ph - SWING) / (1 - SWING)
            thigh = STAND_THIGH + STEP * (0.5 - s) * 2
            knee = STAND_KNEE
        robot.target(leg, thigh=thigh, knee=knee)
    robot.tick(0.02)
    t += 0.02

print("travelled:", round(robot.x, 3), "m")`,
        hint: {
          en: "math.sin(math.pi * s) goes 0 -> 1 -> 0 as s goes 0 -> 1, so it lifts the foot and puts it back down. Subtract LIFT times that from STAND_KNEE.",
          fr: "math.sin(math.pi * s) va de 0 à 1 puis à 0 quand s va de 0 à 1 : ça lève le pied puis le repose. Soustrais LIFT fois ça à STAND_KNEE.",
        },
        solution: `import math
robot.stand_up(); robot.wait(0.6)
STAND_THIGH, STAND_KNEE = 0.9, -1.8
STEP, LIFT = 0.10, 0.30

t = 0.0
while t < 6.0:
    for leg, start in PHASES.items():
        ph = (t * FREQ + start) % 1.0
        if ph < SWING:
            s = ph / SWING
            thigh = STAND_THIGH + STEP * (s - 0.5) * 2
            knee = STAND_KNEE - LIFT * math.sin(math.pi * s)
        else:
            s = (ph - SWING) / (1 - SWING)
            thigh = STAND_THIGH + STEP * (0.5 - s) * 2
            knee = STAND_KNEE
        robot.target(leg, thigh=thigh, knee=knee)
    robot.tick(0.02)
    t += 0.02

print("travelled:", round(robot.x, 3), "m")`,
      },
    ],
    check: "robot.x > 0.15 and robot.height > 0.18",
    success: {
      en: "It walked. About 40 cm in six seconds, one foot at a time, and it never came close to falling. Try changing LIFT to 0 and running again: with the foot never leaving the ground, it drags itself BACKWARDS.",
      fr: "Il a marché. Environ 40 cm en six secondes, un pied à la fois, sans jamais frôler la chute. Essaie de mettre LIFT à 0 et relance : si le pied ne quitte jamais le sol, il se traîne EN ARRIÈRE.",
    },
    failure: {
      en: "It stayed roughly where it was. Without the lift, the foot never leaves the ground, so the leg drags on its way forward and undoes the push. Look at the printed distance: near zero, or negative, means dragging.",
      fr: "Il est resté à peu près sur place. Sans le lever, le pied ne quitte jamais le sol : la patte traîne en avançant et annule la poussée. Regarde la distance affichée : proche de zéro, ou négative, veut dire qu'elle traîne.",
    },
    realVideo: "/robot/go2-crawl-10s.mp4",
    realVideoPoster: "/robot/go2-crawl-poster.jpg",
    realVideoNote: {
      en: "The real project's crawl gait, with the same four phases you just used. Watch one foot at a time leave the ground.",
      fr: "L'allure rampante du vrai projet, avec les quatre mêmes phases que tu viens d'utiliser. Regarde : un seul pied quitte le sol à la fois.",
    },
    realCode: {
      file: "unitree_mujoco/.../controllers/foot_trajectory.py",
      code: `self.leg_phases = leg_phases or {
    "FL": 0.0,
    "RR": 0.25,
    "FR": 0.5,
    "RL": 0.75,
}
# Statically-stable crawl/wave gait: exactly one leg swings at a time
# (phases spaced 0.25 apart, duty_factor=0.75 keeps swing_fraction<=0.25),
# so 3 feet always support the robot.`,
      note: {
        en: "The comment goes on to explain why the project did NOT use the faster trot, where two legs swing together: with only per-joint control, one of the remaining feet gets pinned to the floor by its own weight and never lifts. They proved it with contact-force logging, not guessing.",
        fr: "Le commentaire explique ensuite pourquoi le projet n'a PAS utilisé le trot, plus rapide, où deux pattes bougent ensemble : avec une commande par articulation seulement, l'un des pieds restants est cloué au sol par son propre poids et ne décolle jamais. Ils l'ont prouvé en mesurant les forces de contact, pas en devinant.",
      },
    },
  },
  {
    id: "sp-walk-backward",
    lessonId: "ph-4",
    title: { en: "Part 3 — Go backward", fr: "Partie 3 — Reculer" },
    intro: {
      en: "Making it walk backwards sounds like it should be easy: swing the legs the other way. It is not, and finding out why teaches you more than the forward walk did.",
      fr: "Le faire reculer semble facile : il suffirait de balancer les pattes dans l'autre sens. Ce n'est pas le cas, et comprendre pourquoi apprend plus que la marche en avant.",
    },
    terms: ["gait", "phase", "sim-to-real"],
    cells: [
      {
        id: "b1",
        kind: "given",
        explain: {
          en: "Here is the obvious idea: flip the direction of the thigh sweep. Run it and look at the distance. It still goes forwards.",
          fr: "Voici l'idée évidente : inverser le sens du balayage de la cuisse. Lance-la et regarde la distance. Il avance quand même.",
        },
        code: `import math
robot.stand_up(); robot.wait(0.6)
# the same gait you built in Part 2 -- each part starts with a fresh robot,
# so the constants have to be set up again here
PHASES = {"front_left": 0.0, "back_right": 0.25,
          "front_right": 0.5, "back_left": 0.75}
FREQ, SWING = 0.7, 0.25
STAND_THIGH, STAND_KNEE = 0.9, -1.8
STEP, LIFT = 0.10, 0.30

t = 0.0
while t < 5.0:
    for leg, start in PHASES.items():
        ph = (t * FREQ + start) % 1.0
        if ph < SWING:
            s = ph / SWING
            thigh = STAND_THIGH - STEP * (s - 0.5) * 2      # flipped
            knee = STAND_KNEE - LIFT * math.sin(math.pi * s)
        else:
            s = (ph - SWING) / (1 - SWING)
            thigh = STAND_THIGH - STEP * (0.5 - s) * 2      # flipped
            knee = STAND_KNEE
        robot.target(leg, thigh=thigh, knee=knee)
    robot.tick(0.02)
    t += 0.02

print("travelled:", round(robot.x, 3), "m  <- still positive!")`,
      },
      {
        id: "b2",
        kind: "todo",
        explain: {
          en: "The direction is not decided by which way the leg sweeps. It is decided by WHEN the foot is lifted. The half of the cycle where the foot is DOWN is the half that grips and pushes. So: move the lift into the other half. Take the lift line out of the swing branch and put it in the stance branch.",
          fr: "Le sens n'est pas décidé par la direction du balayage. Il est décidé par le MOMENT où le pied se lève. La moitié du cycle où le pied est AU SOL est celle qui accroche et pousse. Donc : déplace le lever dans l'autre moitié. Enlève la ligne du lever de la partie « en l'air » et mets-la dans la partie « au sol ».",
        },
        code: `import math
robot.stand_up(); robot.wait(0.6)
STAND_THIGH, STAND_KNEE = 0.9, -1.8
STEP, LIFT = 0.10, 0.30

start_x = robot.x          # where we are before this cell moves anything
t = 0.0
while t < 6.0:
    for leg, start in PHASES.items():
        ph = (t * FREQ + start) % 1.0
        if ph < SWING:
            s = ph / SWING
            thigh = STAND_THIGH - STEP * (s - 0.5) * 2
            ## TODO: this half should now keep the foot DOWN
            knee = STAND_KNEE - LIFT * math.sin(math.pi * s)
        else:
            s = (ph - SWING) / (1 - SWING)
            thigh = STAND_THIGH - STEP * (0.5 - s) * 2
            ## TODO: ...and this half should lift it
            knee = STAND_KNEE
        robot.target(leg, thigh=thigh, knee=knee)
    robot.tick(0.02)
    t += 0.02

print("moved:", round(robot.x - start_x, 3), "m  (negative means backwards)")`,
        hint: {
          en: "Swap the two knee lines. The first branch gets plain STAND_KNEE; the second gets the one with math.sin in it.",
          fr: "Échange les deux lignes de genou. La première partie reçoit STAND_KNEE tout simple ; la seconde reçoit celle avec math.sin.",
        },
        solution: `import math
robot.stand_up(); robot.wait(0.6)
STAND_THIGH, STAND_KNEE = 0.9, -1.8
STEP, LIFT = 0.10, 0.30

start_x = robot.x
t = 0.0
while t < 6.0:
    for leg, start in PHASES.items():
        ph = (t * FREQ + start) % 1.0
        if ph < SWING:
            s = ph / SWING
            thigh = STAND_THIGH - STEP * (s - 0.5) * 2
            knee = STAND_KNEE
        else:
            s = (ph - SWING) / (1 - SWING)
            thigh = STAND_THIGH - STEP * (0.5 - s) * 2
            knee = STAND_KNEE - LIFT * math.sin(math.pi * s)
        robot.target(leg, thigh=thigh, knee=knee)
    robot.tick(0.02)
    t += 0.02

print("moved:", round(robot.x - start_x, 3), "m  (negative means backwards)")`,
      },
    ],
    check: "robot.x - start_x < -0.10 and robot.height > 0.18",
    success: {
      en: "Negative — it reversed. The lesson is that a walking robot is not a machine with a forward gear and a reverse gear. Which way it goes falls out of which foot is gripping at which moment, and that is easy to get backwards.",
      fr: "Négatif — il a reculé. La leçon : un robot qui marche n'a pas une marche avant et une marche arrière. Le sens vient de quel pied accroche à quel moment, et c'est facile de se tromper.",
    },
    failure: {
      en: "Still going forwards, or barely moving. Check that exactly one of the two branches has the math.sin line — if both have it, or neither does, the feet never take turns gripping.",
      fr: "Toujours en avant, ou presque immobile. Vérifie qu'une seule des deux parties contient la ligne math.sin — si les deux l'ont, ou aucune, les pieds ne se relaient jamais pour accrocher.",
    },
    realCode: {
      file: "unitree_mujoco/.../controllers/foot_trajectory.py",
      code: `# NOTE: backward travels ~2x farther per nominal step_length than
# forward, because the crawl foothold/stance-sweep geometry was tuned
# forward and is not fore/aft symmetric.`,
      note: {
        en: "The real project hit the same thing. Walking backwards is not the mirror image of walking forwards, and their own comment records it as a measured fact rather than a theory. When your robot behaves differently in reverse, that is not your bug — it is the shape of the problem.",
        fr: "Le vrai projet a rencontré la même chose. Reculer n'est pas l'image miroir d'avancer, et leur propre commentaire l'enregistre comme un fait mesuré, pas une théorie. Si ton robot se comporte autrement en marche arrière, ce n'est pas ton bug — c'est la forme du problème.",
      },
    },
  },
  {
    id: "sp-turn",
    lessonId: "ph-4",
    title: { en: "Part 4 — Turn on the spot", fr: "Partie 4 — Tourner sur place" },
    intro: {
      en: "Walking forward is not much use if you cannot aim. To turn without moving anywhere, the two sides of the robot have to push in opposite directions — like rowing a boat with one oar forward and one back.",
      fr: "Marcher tout droit ne sert pas à grand-chose si on ne peut pas viser. Pour tourner sans se déplacer, les deux côtés du robot doivent pousser en sens contraire — comme ramer avec une rame en avant et une en arrière.",
    },
    terms: ["gait", "phase"],
    cells: [
      {
        id: "r1",
        kind: "given",
        explain: {
          en: "First, a way to see which way the robot is facing. yaw is that angle in radians: 0 is straight ahead, and about 1.57 is a quarter turn. Run this before it has moved.",
          fr: "D'abord, un moyen de voir dans quelle direction le robot regarde. yaw est cet angle en radians : 0 c'est droit devant, et environ 1,57 c'est un quart de tour. Lance ceci avant qu'il bouge.",
        },
        code: `robot.stand_up()
robot.wait(0.4)
print("facing:", round(robot.yaw, 3), "radians")
print("that is", round(robot.yaw * 57.3, 1), "degrees")`,
      },
      {
        id: "r2",
        kind: "given",
        explain: {
          en: "Each leg needs to know which side it is on. Left legs get +1, right legs get -1. That single number is what will make the two sides push against each other.",
          fr: "Chaque patte doit savoir de quel côté elle est. Les pattes gauches reçoivent +1, les droites -1. Ce seul nombre est ce qui va faire pousser les deux côtés l'un contre l'autre.",
        },
        code: `PHASES = {"front_left": 0.0, "back_right": 0.25,
          "front_right": 0.5, "back_left": 0.75}
FREQ, SWING = 0.7, 0.25
STAND_THIGH, STAND_KNEE = 0.9, -1.8
SIDE = {"front_left": 1, "back_left": 1,
        "front_right": -1, "back_right": -1}

for leg in PHASES:
    print(leg, "is on side", SIDE[leg])`,
      },
      {
        id: "r3",
        kind: "todo",
        explain: {
          en: "Here is the walking loop again, with one change to make. Multiply the sweep by that side number so the left legs sweep one way and the right legs the other. Everything else stays exactly as it was.",
          fr: "Voici de nouveau la boucle de marche, avec un seul changement à faire. Multiplie le balayage par ce numéro de côté pour que les pattes gauches balaient dans un sens et les droites dans l'autre. Tout le reste ne change pas.",
        },
        code: `import math
SWEEP, LIFT = 0.28, 0.30
start_yaw = robot.yaw

t = 0.0
while t < 8.0:
    for leg, start in PHASES.items():
        ph = (t * FREQ + start) % 1.0
        ## TODO: read this leg's side out of SIDE, then multiply
        ## the two SWEEP terms below by it.
        d = 1
        if ph < SWING:
            s = ph / SWING
            thigh = STAND_THIGH + SWEEP * (s - 0.5) * 2
            knee  = STAND_KNEE - LIFT * math.sin(math.pi * s)
        else:
            s = (ph - SWING) / (1 - SWING)
            thigh = STAND_THIGH + SWEEP * (0.5 - s) * 2
            knee  = STAND_KNEE
        robot.target(leg, thigh=thigh, knee=knee)
    robot.tick(0.02)
    t += 0.02

print("turned:", round((robot.yaw - start_yaw) * 57.3, 1), "degrees")`,
        hint: {
          en: "d = SIDE[leg] gives +1 or -1. Then write STAND_THIGH + d * SWEEP * ... in both places.",
          fr: "d = SIDE[leg] donne +1 ou -1. Ensuite écris STAND_THIGH + d * SWEEP * ... aux deux endroits.",
        },
        solution: `import math
SWEEP, LIFT = 0.28, 0.30
start_yaw = robot.yaw

t = 0.0
while t < 8.0:
    for leg, start in PHASES.items():
        ph = (t * FREQ + start) % 1.0
        d = SIDE[leg]
        if ph < SWING:
            s = ph / SWING
            thigh = STAND_THIGH + d * SWEEP * (s - 0.5) * 2
            knee  = STAND_KNEE - LIFT * math.sin(math.pi * s)
        else:
            s = (ph - SWING) / (1 - SWING)
            thigh = STAND_THIGH + d * SWEEP * (0.5 - s) * 2
            knee  = STAND_KNEE
        robot.target(leg, thigh=thigh, knee=knee)
    robot.tick(0.02)
    t += 0.02

print("turned:", round((robot.yaw - start_yaw) * 57.3, 1), "degrees")`,
      },
    ],
    check: "robot.yaw - start_yaw > 0.5 and robot.height > 0.18",
    success: {
      en: "About seventy degrees, and it barely wandered — roughly ten centimetres of drift over eight seconds. That is a robot turning on the spot, from one extra multiplication.",
      fr: "Environ soixante-dix degrés, et il a à peine dérivé — une dizaine de centimètres en huit secondes. C'est un robot qui tourne sur place, grâce à une seule multiplication de plus.",
    },
    failure: {
      en: "It went somewhere instead of turning. If d stayed at 1, both sides pushed the same way and you got a walk. Read the side out of SIDE with the leg's name, and use it on BOTH sweep lines — one alone half-cancels the other.",
      fr: "Il est parti au lieu de tourner. Si d est resté à 1, les deux côtés ont poussé pareil et tu as obtenu une marche. Lis le côté dans SIDE avec le nom de la patte, et utilise-le sur les DEUX lignes de balayage — une seule annule à moitié l'autre.",
    },
    realCode: {
      file: "unitree_mujoco/.../controllers/foot_trajectory.py",
      code: `# A larger amplitude turns faster (fewer cycles, less accumulated
# drift) BUT throws the legs into wider tangential arcs -- at 0.7 rad
# the robot visibly splays low and "crawls" mid-turn (pitch ~0.13).
# Re-tuned 2026-07-20 to 0.4 rad: legs stay gathered and upright
# (pitch ~0.077, matching straight walking), at the cost of a slower
# ~17s half-turn.
self.turn_step_angle = float(turn_step_angle)`,
      note: {
        en: "The real project had the same knob and the same trade-off: turn harder and you turn faster, but the robot starts to sprawl. They measured the pitch, found 0.7 made it crawl, and settled on 0.4 — accepting a slower turn to keep it upright. Choosing the slower, uglier number because the measurement said so is most of engineering.",
        fr: "Le vrai projet avait le même réglage et le même compromis : tourner plus fort fait tourner plus vite, mais le robot commence à s'affaler. Ils ont mesuré le tangage, vu que 0,7 le faisait ramper, et choisi 0,4 — un demi-tour plus lent, mais droit. Choisir le nombre plus lent et moins joli parce que la mesure le dit, c'est l'essentiel du métier.",
      },
    },
  },
  {
    id: "sp-detect",
    lessonId: "ph-5",
    title: { en: "Part 5 — Walk up and stop", fr: "Partie 5 — Avancer et s'arrêter" },
    intro: {
      en: "There is a red box in front of the robot. Walking to it is easy; knowing when to STOP is the whole job. This is the loop every robot runs: look, decide, move — over and over, many times a second.",
      fr: "Il y a une boîte rouge devant le robot. Y aller est facile ; savoir quand S'ARRÊTER, c'est tout le travail. C'est la boucle que tout robot exécute : regarder, décider, bouger — encore et encore, plusieurs fois par seconde.",
    },
    terms: ["sim-to-real"],
    cells: [
      {
        id: "d1",
        kind: "given",
        explain: {
          en: "robot.distance is how far the box is, in metres. Think of it as what a range sensor on the robot's nose would report. Run this and see how far away it starts.",
          fr: "robot.distance, c'est à quelle distance se trouve la boîte, en mètres. Imagine ce que dirait un capteur de distance sur le nez du robot. Lance ceci pour voir la distance de départ.",
        },
        code: `robot.stand_up()
robot.wait(0.4)
print("the box is", round(robot.distance, 2), "metres away")`,
      },
      {
        id: "d2",
        kind: "todo",
        explain: {
          en: "Now the loop. It should keep walking WHILE the box is still far away, and stop as soon as it is close. The safety limit t < 18 is there so a wrong answer ends instead of running forever — real robot code has one of those too.",
          fr: "Maintenant la boucle. Elle doit continuer à marcher TANT QUE la boîte est loin, et s'arrêter dès qu'elle est proche. La limite de sécurité t < 18 est là pour qu'une mauvaise réponse s'arrête au lieu de tourner sans fin — le vrai code de robot en a une aussi.",
        },
        code: `import math
PHASES = {"front_left": 0.0, "back_right": 0.25,
          "front_right": 0.5, "back_left": 0.75}
FREQ, SWING = 0.7, 0.25
STAND_THIGH, STAND_KNEE = 0.9, -1.8
STEP, LIFT = 0.10, 0.30
STOP_AT = 0.75          # metres. Close enough.

t = 0.0
## TODO: keep walking WHILE the box is further away than STOP_AT.
## Replace True with the right test on robot.distance.
while True and t < 18.0:
    for leg, start in PHASES.items():
        ph = (t * FREQ + start) % 1.0
        if ph < SWING:
            s = ph / SWING
            thigh = STAND_THIGH + STEP * (s - 0.5) * 2
            knee  = STAND_KNEE - LIFT * math.sin(math.pi * s)
        else:
            s = (ph - SWING) / (1 - SWING)
            thigh = STAND_THIGH + STEP * (0.5 - s) * 2
            knee  = STAND_KNEE
        robot.target(leg, thigh=thigh, knee=knee)
    robot.tick(0.02)
    t += 0.02

robot.set_all_legs(thigh=STAND_THIGH, knee=STAND_KNEE, seconds=0.4)
robot.wait(0.3)
print("stopped", round(robot.distance, 2), "m away, after", round(t, 1), "s")`,
        hint: {
          en: "It should carry on while the distance is still bigger than STOP_AT. That is a > comparison.",
          fr: "Il doit continuer tant que la distance est encore plus grande que STOP_AT. C'est une comparaison avec >.",
        },
        solution: `import math
PHASES = {"front_left": 0.0, "back_right": 0.25,
          "front_right": 0.5, "back_left": 0.75}
FREQ, SWING = 0.7, 0.25
STAND_THIGH, STAND_KNEE = 0.9, -1.8
STEP, LIFT = 0.10, 0.30
STOP_AT = 0.75

t = 0.0
while robot.distance > STOP_AT and t < 18.0:
    for leg, start in PHASES.items():
        ph = (t * FREQ + start) % 1.0
        if ph < SWING:
            s = ph / SWING
            thigh = STAND_THIGH + STEP * (s - 0.5) * 2
            knee  = STAND_KNEE - LIFT * math.sin(math.pi * s)
        else:
            s = (ph - SWING) / (1 - SWING)
            thigh = STAND_THIGH + STEP * (0.5 - s) * 2
            knee  = STAND_KNEE
        robot.target(leg, thigh=thigh, knee=knee)
    robot.tick(0.02)
    t += 0.02

robot.set_all_legs(thigh=STAND_THIGH, knee=STAND_KNEE, seconds=0.4)
robot.wait(0.3)
print("stopped", round(robot.distance, 2), "m away, after", round(t, 1), "s")`,
      },
    ],
    check: "robot.distance < 0.95 and t < 17.0 and robot.height > 0.18",
    success: {
      en: "It walked up and stopped by itself. Nothing told it how many steps to take — it checked the distance fifty times a second and decided each time. That is what makes it a robot rather than a wind-up toy.",
      fr: "Il s'est avancé et s'est arrêté tout seul. Personne ne lui a dit combien de pas faire : il a vérifié la distance cinquante fois par seconde et décidé à chaque fois. C'est ça qui en fait un robot et pas un jouet mécanique.",
    },
    failure: {
      en: "Look at the seconds in the output. If it says 18, the loop never decided anything — it just ran out of safety time, and walking into the box by accident is not the same as stopping on purpose. The test belongs where True is: keep going while robot.distance is greater than STOP_AT.",
      fr: "Regarde les secondes affichées. S'il y a 18, la boucle n'a rien décidé : elle a juste épuisé la sécurité, et arriver sur la boîte par hasard n'est pas s'arrêter exprès. Le test va là où se trouve True : continuer tant que robot.distance est plus grand que STOP_AT.",
    },
    realCode: {
      file: "waste_sorting/robot.py",
      code: `def object_xy(self, category: str):
    p = self.data.body(f"obj_{category}").xpos
    return float(p[0]), float(p[1])

def is_fallen(self) -> bool:
    return self.base_height() < 0.18`,
      note: {
        en: "The real project asks the same two kinds of question: where is the thing, and am I still upright. Its waste-sorting robot walks to an object, picks it up and drops it in the right bin — and the whole mission is built from loops exactly like the one you just wrote.",
        fr: "Le vrai projet pose les deux mêmes sortes de questions : où est l'objet, et est-ce que je suis encore debout. Son robot de tri marche jusqu'à un objet, le ramasse et le dépose dans la bonne poubelle — et toute la mission est faite de boucles exactement comme celle que tu viens d'écrire.",
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
