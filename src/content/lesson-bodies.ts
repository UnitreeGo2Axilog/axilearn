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
