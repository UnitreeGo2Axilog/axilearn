/**
 * Challenges: standalone practice questions grouped by difficulty, separate
 * from the quiz at the end of each lesson.
 *
 * A lesson's quiz checks whether someone read that specific lesson. A
 * challenge is different on purpose -- it draws on the track as a whole, so
 * answering it well means connecting ideas across more than one lesson, not
 * just recalling the paragraph directly above it.
 *
 * REPO-LEVEL FALLBACK, same reasoning as lesson-bodies.ts and
 * lesson-quizzes.ts: works with zero Firestore setup, and is what
 * importStarterContent seeds into Firestore's tracks/{id}/challenges
 * subcollection.
 *
 * Two per difficulty for physical-ai -- a testing set, the same scope the
 * five written lessons already established. ML and Game Dev are the
 * supervisor's tracks and get none here.
 */
import type { ChallengeDoc } from "./schema";

export const repoChallenges: Record<string, ChallengeDoc[]> = {
  "physical-ai": [
    {
      id: "ph-c-easy-1",
      order: 0,
      status: "published",
      difficulty: "easy",
      xpReward: 20,
      title: { en: "Body or brain?" },
      prompt: { en: "Which of these is an ACTUATOR, not a sensor?" },
      options: [
        { en: "A camera" },
        { en: "A distance sensor" },
        { en: "A servo motor in a leg joint" },
        { en: "A touch sensor" },
      ],
      correctIndex: 2,
      explanation: {
        en: "Sensors take information IN from the world (camera, distance, touch). A servo motor sends motion OUT into the world -- that's an actuator.",
      },
    },
    {
      id: "ph-c-easy-2",
      order: 1,
      status: "published",
      difficulty: "easy",
      xpReward: 20,
      title: { en: "The loop" },
      prompt: { en: "In sense-think-act, what comes right after \"sense\"?" },
      options: [{ en: "Act" }, { en: "Think" }, { en: "Repeat" }, { en: "Sleep" }],
      correctIndex: 1,
      explanation: {
        en: "Sense, then think, then act -- then immediately repeat, because the world has already changed by the time one loop finishes.",
      },
    },
    {
      id: "ph-c-medium-1",
      order: 2,
      status: "published",
      difficulty: "medium",
      xpReward: 40,
      title: { en: "Sensor fusion" },
      prompt: {
        en: "A robot needs to grab an egg without crushing it. Which single sensor is LEAST useful for that specific job?",
      },
      options: [
        { en: "A force/touch sensor in the gripper" },
        { en: "A camera, alone, with no other sensor" },
        { en: "Both a camera and a force sensor together" },
        { en: "None of these help" },
      ],
      correctIndex: 1,
      explanation: {
        en: "A camera can find the egg and aim the gripper at it, but it cannot measure grip force -- without a touch/force sensor, the robot has no way to know when to stop squeezing.",
      },
    },
    {
      id: "ph-c-medium-2",
      order: 3,
      status: "published",
      difficulty: "medium",
      xpReward: 40,
      title: { en: "Why walking is hard" },
      prompt: {
        en: "A quadruped robot's leg joint is told to move to 40°, but the leg actually settles at 36°. What is the BEST explanation?",
      },
      options: [
        { en: "The code has a typo" },
        { en: "Gravity, friction and the robot's shifting weight cause a gap between commanded and actual position" },
        { en: "Servos cannot be trusted and should not be used" },
        { en: "The simulator is buggy" },
      ],
      correctIndex: 1,
      explanation: {
        en: "This gap is normal and expected, not a bug -- it's exactly why walking (constantly changing twelve joints while balance depends on timing) is much harder than standing still.",
      },
    },
    {
      id: "ph-c-hard-1",
      order: 4,
      status: "published",
      difficulty: "hard",
      xpReward: 60,
      title: { en: "Pixels to the real world" },
      prompt: {
        en: "A colour-detection system finds a red blob at pixel (400, 180). What ELSE does the robot need to know before it can walk to the real object?",
      },
      options: [
        { en: "Nothing else -- pixel position is enough" },
        { en: "Only the object's exact colour value" },
        { en: "Where the camera is mounted, its angle, and its field of view" },
        { en: "The object's weight" },
      ],
      correctIndex: 2,
      explanation: {
        en: "Turning a 2D pixel position into a real-world direction and distance requires knowing the camera's own mounting and geometry -- get that wrong and the robot walks toward the wrong spot with total confidence.",
      },
    },
    {
      id: "ph-c-hard-2",
      order: 5,
      status: "published",
      difficulty: "hard",
      xpReward: 60,
      title: { en: "Slow reflexes" },
      prompt: {
        en: "A walking robot's control loop runs only twice per second instead of the usual tens or hundreds of times. What is the MOST direct consequence?",
      },
      options: [
        { en: "It uses less battery, which is a pure benefit" },
        { en: "Its reflexes are dangerously slow -- half a second can be enough time to fall before it reacts" },
        { en: "It becomes more accurate because it thinks longer" },
        { en: "There is no real consequence" },
      ],
      correctIndex: 1,
      explanation: {
        en: "The sense-think-act loop only helps if it runs fast enough to catch problems before they matter -- a slow loop means the robot is reacting to a world that no longer exists.",
      },
    },
  ],
};
