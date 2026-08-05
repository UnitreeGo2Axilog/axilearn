/**
 * Every new word in the robot track, explained once.
 *
 * ONE source. The ℹ button in a lesson and the glossary page both read this,
 * so the two can never drift into disagreeing about what a word means.
 *
 * Tone rule: simple, not babyish. A twelve-year-old spots being talked down to
 * instantly and stops trusting you. "This line switches the motors on" -- not
 * "the little robot friend wakes up!". Short sentences, real words, and the
 * actual number wherever there is one.
 */
import type { Localized } from "@/content/types";

export interface GlossaryTerm {
  id: string;
  word: Localized;
  short: Localized;
  /** Optional second sentence for the glossary page, skipped in the popover. */
  more?: Localized;
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    id: "joint",
    word: { en: "joint", fr: "articulation" },
    short: {
      en: "A place where the robot bends. Your knee is a joint. Each of the Go2's legs has three of them.",
      fr: "Un endroit où le robot plie. Ton genou est une articulation. Chaque patte du Go2 en a trois.",
    },
    more: {
      en: "Twelve joints in total: four legs, three each. Every one has a small motor that can hold it at an angle.",
      fr: "Douze articulations en tout : quatre pattes, trois chacune. Chacune a un petit moteur qui la tient à un angle.",
    },
  },
  {
    id: "radian",
    word: { en: "radian", fr: "radian" },
    short: {
      en: "A way of measuring an angle, like degrees but different-sized. Half a turn is 3.14 radians instead of 180 degrees.",
      fr: "Une façon de mesurer un angle, comme les degrés mais avec une autre taille. Un demi-tour vaut 3,14 radians au lieu de 180 degrés.",
    },
    more: {
      en: "Robot code almost always uses radians, because the maths for circles comes out simpler.",
      fr: "Le code des robots utilise presque toujours les radians, parce que les calculs de cercles sont plus simples.",
    },
  },
  {
    id: "actuator",
    word: { en: "actuator", fr: "actionneur" },
    short: {
      en: "The motor that moves a joint. You tell it the angle you want; it pushes until it gets there.",
      fr: "Le moteur qui bouge une articulation. Tu lui dis l'angle que tu veux, il pousse jusqu'à l'atteindre.",
    },
  },
  {
    id: "torque",
    word: { en: "torque", fr: "couple" },
    short: {
      en: "Turning force. Pushing a door near the handle needs less torque than pushing it near the hinge.",
      fr: "La force de rotation. Pousser une porte près de la poignée demande moins de couple que près des gonds.",
    },
  },
  {
    id: "pd-control",
    word: { en: "PD control", fr: "commande PD" },
    short: {
      en: "The rule a robot uses to reach an angle: push harder the further away it is, and slow down if it is moving fast.",
      fr: "La règle qu'un robot suit pour atteindre un angle : pousser plus fort s'il est loin, et freiner s'il va vite.",
    },
    more: {
      en: "The P part is the distance, the D part is the braking. Without D the leg overshoots and wobbles forever.",
      fr: "Le P, c'est la distance ; le D, c'est le freinage. Sans le D, la patte dépasse et oscille sans fin.",
    },
  },
  {
    id: "gain",
    word: { en: "gain", fr: "gain" },
    short: {
      en: "How strongly the robot reacts. In this project the leg gains are 200 for push and 6 for braking.",
      fr: "À quel point le robot réagit fort. Dans ce projet, les gains des pattes sont 200 pour pousser et 6 pour freiner.",
    },
    more: {
      en: "Too low and the legs sag under the robot's weight. Too high and it shakes itself apart.",
      fr: "Trop bas, les pattes s'affaissent sous le poids. Trop haut, le robot se secoue jusqu'à se casser.",
    },
  },
  {
    id: "simulation",
    word: { en: "simulation", fr: "simulation" },
    short: {
      en: "A pretend world with real physics rules, where a robot can fall over a thousand times and break nothing.",
      fr: "Un monde imaginaire avec de vraies règles de physique, où un robot peut tomber mille fois sans rien casser.",
    },
    more: {
      en: "This one is MuJoCo, the same engine the real research project uses — running here inside your browser.",
      fr: "Ici c'est MuJoCo, le même moteur que le vrai projet de recherche — qui tourne dans ton navigateur.",
    },
  },
  {
    id: "gait",
    word: { en: "gait", fr: "allure" },
    short: {
      en: "The pattern of which foot moves when. Walking and running are two different gaits.",
      fr: "Le motif qui décide quel pied bouge et quand. Marcher et courir sont deux allures différentes.",
    },
  },
  {
    id: "crawl-gait",
    word: { en: "crawl gait", fr: "allure rampante" },
    short: {
      en: "Move one foot at a time, so three feet always stay on the ground. Slow, but very hard to knock over.",
      fr: "Bouger un pied à la fois, pour que trois pieds restent toujours au sol. Lent, mais très difficile à faire tomber.",
    },
    more: {
      en: "This is the gait the real Go2 project settled on. A faster one, the trot, kept falling over.",
      fr: "C'est l'allure choisie par le vrai projet Go2. Une allure plus rapide, le trot, tombait sans arrêt.",
    },
  },
  {
    id: "trot",
    word: { en: "trot", fr: "trot" },
    short: {
      en: "A faster gait where two feet move together, diagonally. Only two feet hold the robot up, so it must balance.",
      fr: "Une allure plus rapide où deux pieds bougent ensemble, en diagonale. Seuls deux pieds portent le robot, il doit donc s'équilibrer.",
    },
  },
  {
    id: "phase",
    word: { en: "phase", fr: "phase" },
    short: {
      en: "Where a leg is in its cycle, from 0 at the start to 1 at the end. Give each leg a different phase and they take turns.",
      fr: "Où en est une patte dans son cycle, de 0 au début à 1 à la fin. Donne une phase différente à chaque patte et elles se relaient.",
    },
  },
  {
    id: "sim-to-real",
    word: { en: "sim-to-real", fr: "du simulateur au réel" },
    short: {
      en: "Taking something that works in simulation and making it work on the actual robot. It is the hard part.",
      fr: "Prendre ce qui marche en simulation et le faire marcher sur le vrai robot. C'est ça, le plus dur.",
    },
    more: {
      en: "The real world has friction, delay and wobble the simulator never bothered to have.",
      fr: "Le monde réel a des frottements, des retards et des tremblements que le simulateur n'a jamais eus.",
    },
  },
];

const BY_ID = new Map(GLOSSARY.map((g) => [g.id, g]));

export function term(id: string): GlossaryTerm | undefined {
  return BY_ID.get(id);
}
