/**
 * QCM (multiple-choice quiz) for each lesson that has one, as a REPO-LEVEL
 * FALLBACK -- same reasoning as lesson-bodies.ts, and the two are meant to be
 * read together: every question here can be answered directly from that
 * lesson's text, on purpose. This is a comprehension check on what was just
 * read, not a general-knowledge robotics quiz -- testing anything outside the
 * lesson would mean a careful reader could still fail, which defeats the
 * point of gating completion on it.
 *
 * Three questions per lesson, single correct answer, an explanation shown
 * after answering either way. `importStarterContent` seeds these into
 * Firestore the same way it seeds lesson bodies: per-lesson, only when
 * Firestore's quiz for that lesson is still empty, so an admin's own edits in
 * the CMS are never overwritten.
 */
import type { LessonQuiz } from "./schema";

export const lessonQuizzes: Record<string, LessonQuiz> = {
  "ph-1": [
    {
      question: { en: "What makes Physical AI different from a chatbot?" },
      options: [
        { en: "It uses more electricity" },
        { en: "It has both intelligence AND a body that can act on the world" },
        { en: "It only works with robots that walk" },
        { en: "It doesn't need sensors" },
      ],
      correctIndex: 1,
      explanation: {
        en: "A chatbot can reason but never touch the world. A washing machine can move but never think. Physical AI is what happens when both live in the same machine.",
      },
    },
    {
      question: { en: "Why does simulation matter before testing on a real robot?" },
      options: [
        { en: "Simulations look better on camera" },
        { en: "It's required by law" },
        { en: "Mistakes in simulation are free; mistakes on real hardware can break something expensive" },
        { en: "Robots can't be programmed without a simulator" },
      ],
      correctIndex: 2,
      explanation: {
        en: "Professional robotics teams work the same way: simulation is where you get to be wrong as many times as it takes, before anything physical is at risk.",
      },
    },
    {
      question: { en: "What order does this track build a robot's intelligence in?" },
      options: [
        { en: "Vision, then sensors, then control" },
        { en: "Sensors, then actuators, then control, then vision, then a full mission" },
        { en: "Actuators first, because movement matters most" },
        { en: "Control only -- sensors and actuators aren't needed" },
      ],
      correctIndex: 1,
      explanation: {
        en: "Perceive, then act, then connect the two into a loop, then make sense of what a camera shows, then combine all of it into one mission.",
      },
    },
  ],

  "ph-2": [
    {
      question: {
        en: "Why does a real robot usually combine several sensors instead of relying on just one?",
      },
      options: [
        { en: "It looks more advanced" },
        { en: "No single sensor tells the whole story -- each covers a gap the others leave" },
        { en: "Cameras are unreliable indoors" },
        { en: "More sensors always means more speed" },
      ],
      correctIndex: 1,
      explanation: {
        en: "This is called sensor fusion. A camera gives detail but is confused by bad lighting; a distance sensor is exact but tells you nothing about what an object looks like.",
      },
    },
    {
      question: { en: "What can a touch or force sensor tell a robot that a camera cannot?" },
      options: [
        { en: "The colour of an object" },
        { en: "Whether it is actually gripping something, and how hard" },
        { en: "The exact distance in centimetres" },
        { en: "What the object is called" },
      ],
      correctIndex: 1,
      explanation: {
        en: "It's the only way to hold an egg without either dropping it or crushing it -- a camera can't measure grip force.",
      },
    },
    {
      question: { en: "What should robot logic assume about a sensor's readings?" },
      options: [
        { en: "They are always perfectly exact" },
        { en: "They are slightly imprecise, so logic should expect small errors" },
        { en: "They never need to be checked twice" },
        { en: "Only cameras can be trusted" },
      ],
      correctIndex: 1,
      explanation: {
        en: "Every sensor lies a little -- design for imperfect information, not perfect information. This idea comes back throughout the whole track.",
      },
    },
  ],

  "ph-3": [
    {
      question: { en: "What does a servo motor do that a simple spinning motor doesn't?" },
      options: [
        { en: "It spins faster" },
        { en: "It moves to a specific angle and holds that position" },
        { en: "It only works in pairs" },
        { en: "It never needs power" },
      ],
      correctIndex: 1,
      explanation: {
        en: '"Bend to 30 degrees and stay there" is exactly what a leg joint needs, and exactly what a servo is built to do.',
      },
    },
    {
      question: { en: "Why is walking harder than standing still, for a robot?" },
      options: [
        { en: "Standing still uses more battery" },
        {
          en: "Walking means continuously changing all twelve joint angles while balance depends on getting the timing right",
        },
        { en: "Standing requires more sensors" },
        { en: "There's no real difference" },
      ],
      correctIndex: 1,
      explanation: {
        en: "Standing still only means holding twelve numbers steady. Walking means changing all twelve while the robot's own balance depends on the timing.",
      },
    },
    {
      question: {
        en: "A leg joint is commanded to move to 30°, but ends up at 27°. What does this show?",
      },
      options: [
        { en: "The robot is broken" },
        {
          en: "Commanded and actual position aren't always the same -- gravity, friction and the robot's shifting weight all interfere",
        },
        { en: "The command was written wrong" },
        { en: "The simulator has a bug" },
      ],
      correctIndex: 1,
      explanation: {
        en: "This gap between commanded and actual position is one of the most important ideas in robotics -- it's why walking is much harder than it looks.",
      },
    },
  ],

  "ph-4": [
    {
      question: { en: "What are the three steps of the sense-think-act loop, in order?" },
      options: [
        { en: "Think, act, sense" },
        { en: "Sense, think, act" },
        { en: "Act, sense, think" },
        { en: "Think only -- sensing and acting come later" },
      ],
      correctIndex: 1,
      explanation: {
        en: "Read what the sensors report, decide what should happen, send that decision to the actuators -- then immediately repeat.",
      },
    },
    {
      question: { en: "Why does the loop need to repeat continuously instead of running once?" },
      options: [
        { en: "To save battery" },
        {
          en: "The world keeps changing, so the robot has to keep re-checking and re-deciding to actually react",
        },
        { en: "It's a coding requirement with no real reason" },
        { en: "Repeating makes the code shorter" },
      ],
      correctIndex: 1,
      explanation: {
        en: "A robot doesn't decide once and execute a fixed plan -- it re-checks the world dozens of times a second and re-decides every time.",
      },
    },
    {
      question: {
        en: "If a walking robot's control loop only runs once per second, what's the risk?",
      },
      options: [
        { en: "None -- once a second is always fast enough" },
        {
          en: "Its \"reflexes\" are a full second slow, which can be enough time to fall over before it reacts",
        },
        { en: "It will walk faster than intended" },
        { en: "It uses less electricity" },
      ],
      correctIndex: 1,
      explanation: {
        en: "Real robots typically run their control loop tens or hundreds of times a second for exactly this reason.",
      },
    },
  ],

  "ph-5": [
    {
      question: { en: "What does a raw camera image give a robot, before any processing?" },
      options: [
        { en: "A list of object names" },
        { en: "A grid of pixel numbers describing colour and brightness -- nothing that says \"this is a bottle\"" },
        { en: "The exact distance to every object" },
        { en: "A 3D map of the room" },
      ],
      correctIndex: 1,
      explanation: {
        en: "Computer vision is the work of turning that raw grid into information the robot's decision-making can actually use.",
      },
    },
    {
      question: { en: "What's a real limitation of colour-based object detection?" },
      options: [
        { en: "It's too slow to be useful" },
        { en: "It can't tell two differently-shaped objects apart if they're the same colour" },
        { en: "It only works at night" },
        { en: "It requires a distance sensor to function at all" },
      ],
      correctIndex: 1,
      explanation: {
        en: "Two red objects of completely different shapes look identical to a system that only checks colour.",
      },
    },
    {
      question: {
        en: 'Why is going from "this blob is at pixel (340, 210)" to "this object is 1.2m ahead" hard?',
      },
      options: [
        { en: "It isn't hard -- cameras report distance directly" },
        {
          en: "It requires knowing things about the camera itself -- where it's mounted, its angle, its field of view",
        },
        { en: "It requires a second camera always" },
        { en: "Pixels don't have positions" },
      ],
      correctIndex: 1,
      explanation: {
        en: "Get the camera's mounting or angle wrong and the robot will walk toward the wrong spot with complete confidence.",
      },
    },
  ],
};
