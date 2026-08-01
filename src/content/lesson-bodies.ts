/**
 * Real lesson text for the Physical AI track, in the same shape a body stored
 * in Firestore has (`L10n`: English required, French optional).
 *
 * This is a REPO-LEVEL FALLBACK, mirroring how repo-content.ts backs the map
 * before anything has been imported. Two reasons it lives here instead of only
 * in the CMS:
 *
 *  1. A fresh clone of the repo, with no Firestore project at all, should still
 *     teach something -- not show "coming soon" on every lesson.
 *  2. `importStarterContent` writes these into the `bodies` subcollection
 *     alongside the tracks themselves, so pressing the one button in /admin
 *     ships real lessons, not just real titles.
 *
 * ML and Game Dev are the supervisor's tracks and are intentionally left
 * empty here -- writing their content is not this track's job.
 *
 * French is not written yet; the reader falls back to English, which the rest
 * of the platform already does for untranslated content.
 */
import type { L10n } from "./schema";

export const lessonBodies: Record<string, L10n> = {
  "pp-1": {
    en: `## A program is just a list of orders

A computer is very fast and very obedient. It is also very literal. It will do
exactly what you tell it -- in exactly the order you tell it -- and it will
never guess what you meant.

That is the whole job of a programmer: write the orders clearly enough that
something with no common sense can follow them.

\`\`\`flow
step: put bread in the toaster
step: press the button
ask: is it brown yet ?
yes: take it out
step: eat
\`\`\`

If you swap two of those lines, you eat bread and toast the plate. The
computer will not stop you. It will just do it.

## Say hello

Here is a real Python program. It is one line long. Press **Run** and see what
happens.

\`\`\`python
print("Hello! I am your first program.")
\`\`\`

\`print\` means *show this on the screen*. Whatever you put between the round
brackets is what gets shown.

> tip: Change the words inside the quotes to your own name, then press Run again. Nothing breaks. You can do this as many times as you like.

## The quotes matter

Python needs the quotes so it knows where your message starts and ends.
Without them it thinks you are talking about something else and it stops.

Try running this one. It is **supposed** to break:

\`\`\`python
print(Hello)
\`\`\`

You got a red message saying \`NameError\`. That is not you being bad at this.
That is Python telling you, politely, *"I do not know anything called Hello."*

> do: Read the red message. It nearly always says what is wrong and which line it is on.
> don't: Do not panic and delete everything. An error is information, not a punishment.

## Doing two things

Give it two orders and it does them in order, top to bottom.

\`\`\`python
print("First")
print("Second")
\`\`\`

Swap the two lines and run it again. The order changes, because the computer
follows your list from the top -- always.

## Notes to yourself

A line that starts with \`#\` is a **comment**. Python ignores it completely. It
is there for humans.

\`\`\`python
# This line does nothing at all.
print("But this line works.")
\`\`\`

You will use comments to leave notes for the person who reads your code later.
That person is usually you, in two weeks, having forgotten everything.

## Why is it called Python?

Not the snake. It is named after *Monty Python*, an old British comedy show
that the person who invented the language liked. Programming has more silly
names in it than you would expect.

> tip: Everything you just ran happened inside this page -- there is nothing to install, and nothing you can break. Try things.
`,
    fr: `## Un programme, c'est une liste d'ordres

Un ordinateur est très rapide et très obéissant. Il est aussi très bête. Il
fait exactement ce que tu lui dis -- dans l'ordre exact où tu le dis -- et il
ne devine jamais ce que tu voulais dire.

C'est tout le métier de programmeur : écrire les ordres assez clairement pour
que quelque chose sans aucun bon sens puisse les suivre.

\`\`\`flow
step: mettre le pain dans le grille-pain
step: appuyer sur le bouton
ask: c'est doré ?
yes: sortir le pain
step: manger
\`\`\`

Si tu inverses deux lignes, tu manges du pain cru et tu fais griller l'assiette.
L'ordinateur ne t'arrêtera pas. Il le fera, c'est tout.

## Dire bonjour

Voici un vrai programme Python. Il fait une ligne. Appuie sur **Run** et
regarde.

\`\`\`python
print("Salut ! Je suis ton premier programme.")
\`\`\`

\`print\` veut dire *affiche ça à l'écran*. Ce que tu mets entre les parenthèses,
c'est ce qui s'affiche.

> tip: Remplace le texte entre les guillemets par ton prénom, puis appuie encore sur Run. Rien ne casse. Tu peux recommencer autant de fois que tu veux.

## Les guillemets comptent

Python a besoin des guillemets pour savoir où ton message commence et où il
s'arrête. Sans eux, il croit que tu parles d'autre chose et il s'arrête.

Lance celui-ci. Il est **fait** pour planter :

\`\`\`python
print(Salut)
\`\`\`

Tu as eu un message rouge qui dit \`NameError\`. Ce n'est pas parce que tu es
nul. C'est Python qui te dit, poliment : *« je ne connais rien qui s'appelle
Salut »*.

> do: Lis le message rouge. Il dit presque toujours ce qui ne va pas et à quelle ligne.
> don't: Ne panique pas et n'efface pas tout. Une erreur, c'est une information, pas une punition.

## Faire deux choses

Donne-lui deux ordres et il les fait dans l'ordre, de haut en bas.

\`\`\`python
print("Premier")
print("Deuxième")
\`\`\`

Inverse les deux lignes et relance. L'ordre change, parce que l'ordinateur suit
ta liste depuis le haut -- toujours.

## Des notes pour toi-même

Une ligne qui commence par \`#\` est un **commentaire**. Python l'ignore
complètement. Elle est là pour les humains.

\`\`\`python
# Cette ligne ne fait rien du tout.
print("Mais celle-ci marche.")
\`\`\`

Tu utiliseras les commentaires pour laisser des notes à la personne qui lira
ton code plus tard. Cette personne, c'est souvent toi, dans deux semaines,
qui as tout oublié.

## Pourquoi « Python » ?

Pas le serpent. C'est nommé d'après *Monty Python*, une vieille série comique
anglaise qu'aimait la personne qui a inventé le langage. En programmation, il y
a plus de noms idiots que tu ne crois.

> tip: Tout ce que tu viens de lancer s'est passé dans cette page -- rien à installer, et rien que tu puisses casser. Essaie des choses.
`,
  },
  "ph-1": {
    en: `Physical AI is what happens when the two halves of "AI" that you usually hear about separately -- software that can decide things, and a machine that can move -- are put in the same box. A chatbot is intelligence with no body: it can reason about the world, but it cannot touch it. A washing machine is a body with no intelligence: it moves, but only ever the same fixed sequence, blind to what is actually inside the drum. A robot is both at once. It has to sense a world that keeps changing, decide what to do about it, and then physically act -- and it has to do all three fast enough that the world hasn't changed again by the time it moves.

That combination is what makes robotics hard in a way that pure software isn't. A website that mishandles bad input shows an error message. A robot that mishandles bad input can walk into a wall, drop something it was holding, or fall over. The stakes of being wrong are physical, not just logical, and there is no undo button in the real world.

In this track you will build up a robot's intelligence in the same order a real robotics engineer does: first how it perceives the world (sensors), then how it acts on it (actuators), then how those two connect into a loop that runs continuously (control), then how it makes sense of what a camera actually shows it (vision), and finally how it strings all of that together into one mission it can carry out by itself -- for example, walking up to an object, picking it up, and putting it exactly where it belongs.

You will do this on a simulated four-legged robot, the same kind of machine that companies actually build and sell today, running inside a physics engine on your own computer. Everything you try -- every command, every mistake -- happens in simulation first. That is not a shortcut; it's how professional robotics teams work too, because testing an idea on real hardware is slow and a mistake can break something expensive. Simulation is where you get to be wrong for free, as many times as it takes.

By the end of this track, you won't just know what a robot is. You will have written the logic that makes one see, decide, and move -- three things that, until you've done it yourself, look like magic.`,
  },

  "ph-2": {
    en: `Before a robot can do anything intelligent, it has to know what is actually going on around it -- and unlike you, it starts out knowing nothing. It has no eyes unless you give it a camera, no sense of distance unless you give it a range sensor, no sense of touch unless you give it something that can feel contact. Every one of a robot's senses is a piece of hardware someone chose to add, and every choice is a trade-off.

A camera gives rich detail -- colour, shape, texture -- which is exactly what you need to tell a red block from a blue one, or a cup from a bottle. But a camera is easily confused by bad lighting, and turning a picture into "there is an object at this exact position" takes real computation. A distance sensor (like the LiDAR or ultrasonic sensors real robots use) is the opposite: it tells you almost nothing about what an object looks like, but it tells you exactly how far away it is, instantly and reliably, which is precisely what you need to avoid walking into it. A touch or force sensor tells the robot something a camera never can: whether it is actually gripping something, and how hard -- which is the only way to hold an egg without either dropping it or crushing it.

Notice the pattern: no single sensor tells the whole story. A real robot almost always combines several, each covering the gap the others leave. This is called sensor fusion, and it's one of the first things that separates a toy robot from a working one.

There's a second problem hiding underneath all of this: every sensor lies a little. A camera image has noise in low light. A distance sensor has a small margin of error. Nothing a robot measures is ever perfectly exact -- so any control logic you write later has to expect slightly wrong numbers, not perfect ones. That single idea -- design for imperfect information, not perfect information -- is something you'll come back to constantly in this track.

In the simulator, your robot carries an onboard camera, which is the sensor you will work with most directly, because it's what lets a robot tell one object apart from another -- the foundation the vision lessons later in this track are built on.`,
  },

  "ph-3": {
    en: `If sensors are how a robot perceives the world, actuators are how it changes it. An actuator is any part that converts a command into physical motion -- a motor spinning a wheel, a servo bending a joint, a gripper closing around an object. Sensing without acting is just watching. Acting is what makes something a robot instead of a camera on a stick.

The actuator you'll use constantly in this track is the servo motor, because it is what makes every leg joint and every arm joint move. A servo doesn't just spin freely like a fan motor -- it moves to a specific angle you ask for and holds that position. That's exactly the behaviour a leg joint needs: "bend to 30 degrees and stay there" is a request a servo can satisfy directly. A quadruped robot's leg typically has three such joints, so standing, walking or turning is really the coordinated motion of twelve joints (three per leg, times four legs) all being told an angle at the same time.

Here is the part that surprises most people the first time: asking a joint to move to an angle and it actually arriving there are two different problems. Gravity pulls down on the leg. Friction resists the motion. The robot's own weight shifts as other legs move. A joint that was told "30 degrees" might genuinely end up at 27, or overshoot to 33, depending on everything else happening at that instant. This gap between commanded and actual position is one of the most important ideas in robotics, and it's why "walking" is a much harder problem than it looks: standing still, a robot only has to hold twelve numbers steady. Walking means changing all twelve, continuously, while the robot's own balance depends on getting the timing right.

A robotic arm and gripper work the same way, just aimed at a different job: instead of moving the whole robot, an arm moves an end point (the gripper) to a target position in space, and the gripper itself is one more actuator whose only two states are open and closed -- but even "closed" has a range, because gripping a bottle and gripping a cardboard box need different amounts of force.

Every actuator you'll command in this track -- legs, arm, gripper -- reduces to the same basic instruction repeated many times: here is the angle or position I want, go there. What changes as the lessons progress is how you decide what to ask for.`,
  },

  "ph-4": {
    en: `You now have two pieces: sensors that tell the robot what's happening, and actuators that let it do something about it. Robotics logic is the part that connects them -- and it turns out almost every robot on Earth, no matter how sophisticated, runs on the same basic loop:

Sense. Read what the sensors are reporting right now.
Think. Decide, based on that reading, what should happen next.
Act. Send that decision to the actuators.
Repeat. Immediately go back to step one, because the world has already changed.

This is called the sense-think-act loop, and the "repeat" is not optional -- it's the whole point. A robot doesn't decide once and then execute a fixed plan; it re-checks the world dozens of times a second and re-decides every time. That's what lets it react: if an object it was walking toward moves, the very next loop notices and adjusts, instead of the robot blindly continuing toward where the object used to be.

Running this loop fast enough is a real engineering constraint, not a detail. If your loop only runs once a second, your robot's "reflexes" are one second slow -- which, if it's walking, is more than enough time to fall over before it notices anything went wrong. Real robots typically run their control loop tens or hundreds of times per second for exactly this reason.

The "think" step is where the actual intelligence lives, and it can be as simple or as complex as the problem needs. The simplest form is a direct rule: if the distance sensor reads less than 20cm, stop. That single line is a complete, working piece of robotics logic -- primitive, but real, and it's exactly the kind of rule that keeps a robot from walking into a wall while something more sophisticated is still deciding what to do next. Later in this track, "think" grows to include recognising an object from a camera image and choosing between several possible actions -- but it is always built on top of this same loop, never a replacement for it.

One more thing worth knowing before you start writing this logic yourself: a robot's plan and reality will disagree constantly, and that is completely normal, not a sign something is broken. The sense-think-act loop isn't there because robots get it right -- it's there because it lets them keep noticing when they got it wrong, and correct course before it matters.`,
  },

  "ph-5": {
    en: `A camera gives a robot a grid of pixels -- numbers describing colour and brightness. Nothing in that grid says "this is a bottle" or "this is 40 centimetres away." Computer vision is the work of turning that raw grid into information the robot's decision-making can actually use: what is out there, and where.

The technique you'll start with is one of the oldest and most reliable in the field, and it's also exactly what a real waste-sorting robot needs: colour-based detection. If the objects you care about have distinct, consistent colours -- a red block, a green bin, a blue crate -- you can scan the image for pixels matching each colour, group the matching pixels that are near each other into a blob, and treat each blob's centre as "an object of that colour is here." It sounds almost too simple, but it's fast, it's reliable in good lighting, and it's genuinely how a lot of real industrial sorting systems work, because it doesn't need to be any more complicated than the problem requires.

It also has a real limitation worth naming honestly: it only tells you what colour something is, not what it is. Two red objects of completely different shapes look identical to a system that only checks colour. More advanced vision -- which you'll meet later in this track -- can classify objects by shape and texture too, not only colour, which is what lets a robot tell a red block apart from a red ball.

There's a second, quieter problem underneath all of this: a camera reports a 2D pixel position, but a robot needs to know a 3D real-world position to actually walk toward something or reach for it. Going from "this blob is at pixel (340, 210)" to "this object is 1.2 metres ahead and slightly to the left" requires knowing things about the camera itself -- where it's mounted, which way it's angled, how wide its field of view is. Get that wrong and the robot will walk toward the wrong spot with complete confidence, because as far as its own logic is concerned, the maths checked out.

This is the lesson where the sense-think-act loop from before finally gets something worth reacting to: instead of a fixed rule like "if the sensor reads less than 20cm, stop," the robot can now ask "what am I looking at, and where is it?" -- and that answer is what makes everything from here on feel less like a machine following a script and more like a robot that's actually paying attention to the world around it.`,
  },
};
