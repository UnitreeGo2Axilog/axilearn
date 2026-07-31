/**
 * Challenges: standalone CODING problems, grouped by difficulty, separate from
 * the quiz at the end of each lesson.
 *
 * A lesson's quiz checks whether someone read that lesson. A challenge asks
 * them to actually write working code -- a function stub, and hidden test
 * cases that decide whether it is right. Nothing is gated on them; they are
 * practice, which is also why they award no XP (that comes from lessons).
 *
 * Every problem here is deliberately answerable from what the five written
 * Physical AI lessons teach, plus ordinary beginner Python. A challenge that
 * needs knowledge the platform never taught is not a challenge, it is a
 * gotcha.
 *
 * REPO-LEVEL FALLBACK, same as lesson-bodies.ts and lesson-quizzes.ts: works
 * with zero Firestore setup, and is what importStarterContent seeds.
 *
 * On test design: `call` and `expected` are Python expressions, evaluated and
 * compared, so lists and strings compare properly. Some cases are visible as
 * worked examples; the rest are hidden, so the answer cannot be reverse
 * engineered from the examples alone.
 */
import type { ChallengeDoc } from "./schema";

export const repoChallenges: Record<string, ChallengeDoc[]> = {
  "physical-ai": [
    {
      id: "ph-c-easy-1",
      order: 0,
      status: "published",
      difficulty: "easy",
      kind: "code",
      title: { en: "Clamp a motor command" },
      prompt: {
        en: "A servo only accepts angles between 0 and 180 degrees. Anything outside that range must be pulled back to the nearest limit -- sending 200 should send 180, and -30 should send 0. Complete `clamp_angle` so it returns a safe angle.",
      },
      options: [],
      correctIndex: 0,
      starterCode:
        "def clamp_angle(angle):\n    # Return angle, but never below 0 and never above 180.\n    return angle\n",
      tests: [
        { call: "clamp_angle(90)", expected: "90" },
        { call: "clamp_angle(200)", expected: "180" },
        { call: "clamp_angle(-30)", expected: "0", hidden: true },
        { call: "clamp_angle(0)", expected: "0", hidden: true },
        { call: "clamp_angle(180)", expected: "180", hidden: true },
      ],
      explanation: {
        en: "Real robot code is full of limits like this. Sending a joint past what it can physically reach does not make it move further -- it just strains the hardware, so the command is capped before it is ever sent.",
      },
    },
    {
      id: "ph-c-easy-2",
      order: 1,
      status: "published",
      difficulty: "easy",
      kind: "code",
      title: { en: "Should the robot stop?" },
      prompt: {
        en: "The simplest possible piece of robotics logic: a distance sensor reading comes in, and the robot must stop if something is closer than 20cm. Return True if it should stop, False otherwise.",
      },
      options: [],
      correctIndex: 0,
      starterCode: "def should_stop(distance_cm):\n    # True when the way ahead is blocked.\n    pass\n",
      tests: [
        { call: "should_stop(10)", expected: "True" },
        { call: "should_stop(50)", expected: "False" },
        { call: "should_stop(20)", expected: "False", hidden: true },
        { call: "should_stop(19.9)", expected: "True", hidden: true },
      ],
      explanation: {
        en: "This is a complete, working control rule -- primitive, but real. Notice 20 itself is NOT closer than 20, so it does not stop: getting that boundary right is exactly the kind of detail that decides whether a robot bumps the wall.",
      },
    },
    {
      id: "ph-c-medium-1",
      order: 2,
      status: "published",
      difficulty: "medium",
      kind: "code",
      title: { en: "Average out a noisy sensor" },
      prompt: {
        en: "Every sensor lies a little, so readings are usually smoothed before they are trusted. Given a list of readings, return their average rounded to 2 decimal places. An empty list has no average -- return 0.0 for it rather than crashing.",
      },
      options: [],
      correctIndex: 0,
      starterCode:
        "def smooth(readings):\n    # Average of the readings, rounded to 2 decimals.\n    # An empty list should give 0.0\n    pass\n",
      tests: [
        { call: "smooth([10, 20, 30])", expected: "20.0" },
        { call: "smooth([1.5, 2.5])", expected: "2.0" },
        { call: "smooth([])", expected: "0.0", hidden: true },
        { call: "smooth([1, 2])", expected: "1.5", hidden: true },
        { call: "smooth([0.333, 0.333, 0.333])", expected: "0.33", hidden: true },
      ],
      explanation: {
        en: "The empty case is the interesting one. Dividing by len(readings) crashes on an empty list, and a robot whose perception code crashes the moment a sensor returns nothing is a robot that falls over. Handling the empty case is not defensive padding -- it is the job.",
      },
    },
    {
      id: "ph-c-medium-2",
      order: 3,
      status: "published",
      difficulty: "medium",
      kind: "code",
      title: { en: "Find the closest object" },
      prompt: {
        en: "The camera reports several objects, each as a (name, distance) pair. Return the NAME of the nearest one. If the list is empty, return None.",
      },
      options: [],
      correctIndex: 0,
      starterCode:
        'def closest(objects):\n    # objects looks like [("bottle", 1.2), ("box", 0.7)]\n    # Return the name of the nearest one.\n    pass\n',
      tests: [
        { call: 'closest([("bottle", 1.2), ("box", 0.7)])', expected: '"box"' },
        { call: 'closest([("can", 3.0)])', expected: '"can"' },
        { call: "closest([])", expected: "None", hidden: true },
        {
          call: 'closest([("a", 2.0), ("b", 0.5), ("c", 1.0)])',
          expected: '"b"',
          hidden: true,
        },
      ],
      explanation: {
        en: "This is the decision a sorting robot makes constantly: several things are visible, and it has to pick one to go to. Sorting the whole list works, but so does a single pass keeping the best so far -- and the single pass is what you would actually run inside a control loop.",
      },
    },
    {
      id: "ph-c-hard-1",
      order: 4,
      status: "published",
      difficulty: "hard",
      kind: "code",
      title: { en: "Sort waste into the right bin" },
      prompt: {
        en: "Colour-based sorting, the way the lesson describes it. Given a list of detected colours, return a dictionary counting how many go to each bin: red and orange are 'plastic', green and brown are 'glass', anything else is 'other'. Always return all three keys, even when a count is zero.",
      },
      options: [],
      correctIndex: 0,
      starterCode:
        'def sort_waste(colours):\n    # red/orange -> "plastic",  green/brown -> "glass",  else -> "other"\n    # Always return all three keys.\n    pass\n',
      tests: [
        {
          call: 'sort_waste(["red", "green", "red"])',
          expected: '{"plastic": 2, "glass": 1, "other": 0}',
        },
        {
          call: "sort_waste([])",
          expected: '{"plastic": 0, "glass": 0, "other": 0}',
        },
        {
          call: 'sort_waste(["blue", "brown", "orange"])',
          expected: '{"plastic": 1, "glass": 1, "other": 1}',
          hidden: true,
        },
        {
          call: 'sort_waste(["purple"])',
          expected: '{"plastic": 0, "glass": 0, "other": 1}',
          hidden: true,
        },
      ],
      explanation: {
        en: "Returning all three keys every time, even at zero, is what makes this usable by the code downstream -- a caller can read result['glass'] without checking whether the key exists first. An output shape that never varies is worth more than a shorter function.",
      },
    },
    {
      id: "ph-c-hard-2",
      order: 5,
      status: "published",
      difficulty: "hard",
      kind: "code",
      title: { en: "Run the control loop" },
      prompt: {
        en: "Put sense-think-act together. Given a list of distance readings taken one after another, return the list of actions the robot takes: 'stop' when the reading is under 20, 'slow' when it is under 50, otherwise 'go'. One action per reading, in order.",
      },
      options: [],
      correctIndex: 0,
      starterCode:
        'def control_loop(readings):\n    # under 20 -> "stop",  under 50 -> "slow",  otherwise -> "go"\n    pass\n',
      tests: [
        {
          call: "control_loop([100, 40, 10])",
          expected: '["go", "slow", "stop"]',
        },
        { call: "control_loop([])", expected: "[]" },
        {
          call: "control_loop([20, 50, 19])",
          expected: '["slow", "go", "stop"]',
          hidden: true,
        },
        {
          call: "control_loop([5])",
          expected: '["stop"]',
          hidden: true,
        },
      ],
      explanation: {
        en: "This is the whole sense-think-act loop in one function: each reading is sensed, a rule decides, an action comes out. A real robot runs this tens of times a second on live sensor data instead of a list -- but the shape of the logic is exactly this.",
      },
    },
  ],
};
