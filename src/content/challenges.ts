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
      tutorial: {
        en: "Two limits, one value. You need the value to be no lower than 0 and no higher than 180.\n\nThink about it as two separate questions rather than one complicated one: \"is it too big?\" and \"is it too small?\". Each has an obvious fix.\n\nPython has `min` and `max` built in, and they compose: `min(180, x)` can never give you more than 180, and `max(0, ...)` can never give you less than 0. You can also do it with plain if-statements -- both are correct.",
      },
      editorial: {
        en: "    def clamp_angle(angle):\n        return max(0, min(180, angle))\n\nRead it inside out. `min(180, angle)` caps the top: if angle is 200 it becomes 180, otherwise it stays as it is. `max(0, ...)` then lifts the bottom: if the result is -30 it becomes 0.\n\nThe if-statement version is just as good and easier to read when you are starting out:\n\n    def clamp_angle(angle):\n        if angle < 0:\n            return 0\n        if angle > 180:\n            return 180\n        return angle",
      },
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
      tutorial: {
        en: "The whole answer is one comparison. \"Closer than 20\" means the distance is LESS than 20 -- not less than or equal to.\n\nYou do not need an if-statement here at all. `distance_cm < 20` is already True or False; a comparison in Python IS a boolean, so you can return it directly.\n\nWatch the boundary: exactly 20 is not closer than 20, so it must give False.",
      },
      editorial: {
        en: "    def should_stop(distance_cm):\n        return distance_cm < 20\n\nBeginners often write this instead:\n\n    if distance_cm < 20:\n        return True\n    else:\n        return False\n\nThat works, but it is asking a question and then repeating the answer back. The comparison already produces exactly the True or False you want, so returning it directly says the same thing with less noise.\n\nThe reason 20 gives False is the strict `<`. Using `<=` would stop the robot at exactly 20cm too -- a different rule, and the tests would catch the difference.",
      },
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
      tutorial: {
        en: "Two things to get right: the average, and the empty list.\n\nThe average is `sum(readings) / len(readings)`, then `round(value, 2)` for two decimals.\n\nThe empty list is the interesting half. `len([])` is 0, and dividing by zero raises ZeroDivisionError -- so you must check for it BEFORE you divide, and return 0.0 instead. An empty list in Python is falsy, so `if not readings:` is the idiomatic check.",
      },
      editorial: {
        en: "    def smooth(readings):\n        if not readings:\n            return 0.0\n        return round(sum(readings) / len(readings), 2)\n\nThe early return is the important line. Handling the impossible case first, then getting on with the normal one, keeps the main logic flat and readable -- much better than wrapping everything in a big if/else.\n\n`if not readings:` works because an empty list is falsy in Python. `if len(readings) == 0:` is exactly equivalent and perfectly fine.\n\nWhy 0.0 and not 0? Both would pass here, but returning a float keeps the return type consistent -- this function always hands back a float, whatever the input.",
      },
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
      tutorial: {
        en: "Each item is a pair: `(\"bottle\", 1.2)`. Index 0 is the name, index 1 is the distance. You want the NAME of the item whose distance is smallest.\n\nTwo routes. The loop: keep a \"best so far\" variable, walk the list, replace it whenever you find something nearer. Or `min()` with a key: `min(objects, key=lambda o: o[1])` finds the pair with the smallest second element, then you take `[0]` of it for the name.\n\nEmpty list first, though -- `min()` on an empty list raises ValueError.",
      },
      editorial: {
        en: "    def closest(objects):\n        if not objects:\n            return None\n        return min(objects, key=lambda o: o[1])[0]\n\n`key=lambda o: o[1]` tells min WHAT to compare. Without it, min would compare the whole tuples -- which starts with the name, so you would get the alphabetically first object rather than the nearest one. That is a genuinely easy bug to write.\n\nThe explicit loop is just as valid and clearer to many readers:\n\n    def closest(objects):\n        best = None\n        for name, distance in objects:\n            if best is None or distance < best[1]:\n                best = (name, distance)\n        return best[0] if best else None\n\nNote `for name, distance in objects` unpacks each pair straight into two variables -- neater than `o[0]` and `o[1]` everywhere.",
      },
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
      tutorial: {
        en: "Start with the answer already built: a dictionary with all three keys set to 0. Then walk the colours and add 1 to the right one. That way \"always return all three keys\" is true by construction rather than something you have to remember at the end.\n\nFor the decision, `if c in (\"red\", \"orange\")` reads better than chaining `c == \"red\" or c == \"orange\"`.\n\nAnything not matched falls to `other` -- that is what the final `else` is for.",
      },
      editorial: {
        en: "    def sort_waste(colours):\n        counts = {\"plastic\": 0, \"glass\": 0, \"other\": 0}\n        for colour in colours:\n            if colour in (\"red\", \"orange\"):\n                counts[\"plastic\"] += 1\n            elif colour in (\"green\", \"brown\"):\n                counts[\"glass\"] += 1\n            else:\n                counts[\"other\"] += 1\n        return counts\n\nBuilding the dictionary with all three keys up front is the whole trick. A version that only adds a key when it first sees that colour would return `{\"plastic\": 2}` for a list of only red items -- and then the caller's `result[\"glass\"]` raises KeyError.\n\nAn output shape that never varies is worth more than a shorter function, because everything downstream can rely on it.",
      },
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
      tutorial: {
        en: "One reading in, one action out, in order -- so this is a loop that builds a list.\n\nThe decision has three outcomes, so it is if / elif / else. Order matters: check \"under 20\" FIRST. A reading of 10 is under 20 and also under 50, and whichever you test first wins.\n\nEmpty list needs no special case here: looping over an empty list simply does nothing, and you return the empty list you started with.",
      },
      editorial: {
        en: "    def control_loop(readings):\n        actions = []\n        for reading in readings:\n            if reading < 20:\n                actions.append(\"stop\")\n            elif reading < 50:\n                actions.append(\"slow\")\n            else:\n                actions.append(\"go\")\n        return actions\n\nThe elif is doing real work. If you wrote three separate `if` statements you would append twice for a reading of 10 -- once for \"stop\", once for \"slow\" -- and the list would come out the wrong length.\n\nA list comprehension does the same thing in one line once you are comfortable:\n\n    return [\"stop\" if r < 20 else \"slow\" if r < 50 else \"go\" for r in readings]\n\nBoth are correct. The loop is easier to read while you are learning; the comprehension is what you will see in real code.",
      },
      explanation: {
        en: "This is the whole sense-think-act loop in one function: each reading is sensed, a rule decides, an action comes out. A real robot runs this tens of times a second on live sensor data instead of a list -- but the shape of the logic is exactly this.",
      },
    },
  ],

  "python-primer": [
    {
      id: "pp-c-easy-1",
      order: 0,
      status: "published",
      difficulty: "easy",
      kind: "code",
      title: { en: "Say hello" },
      prompt: { en: "Write a function `greet` that takes a name and RETURNS the greeting \"Hello, <name>!\" -- for example greet(\"Sam\") gives \"Hello, Sam!\". Note it returns the text; it does not print it." },
      options: [],
      correctIndex: 0,
      starterCode: "def greet(name):\n    # Return the greeting, do not print it.\n    pass\n",
      tests: [
        { call: "greet(\"Sam\")", expected: "\"Hello, Sam!\"" },
        { call: "greet(\"Axi\")", expected: "\"Hello, Axi!\"" },
        { call: "greet(\"\")", expected: "\"Hello, !\"", hidden: true },
      ],
      tutorial: { en: "The trap here is print vs return. `print` shows something on screen; `return` hands a value back to whoever called the function. The tests check what comes BACK, so print alone would return None and fail.\n\nTo build the text, an f-string is the tidiest way: put an f before the quotes and wrap the variable in braces -- f\"Hello, {name}!\". Plain concatenation with + works too." },
      editorial: { en: "    def greet(name):\n        return f\"Hello, {name}!\"\n\nThe f before the string turns it into an f-string, and anything inside {} is replaced by that variable's value.\n\nWithout f-strings it is:\n\n    return \"Hello, \" + name + \"!\"\n\nSame result, more punctuation to get wrong.\n\nIf you wrote `print(f\"Hello, {name}!\")` the screen would look right but the function returns None -- and None is not \"Hello, Sam!\", so the test fails. Printing is for you; returning is for the rest of the program." },
      explanation: { en: "Getting print and return straight early saves a lot of confusion later. Almost every function you write from here on returns something." },
    },
    {
      id: "pp-c-easy-2",
      order: 1,
      status: "published",
      difficulty: "easy",
      kind: "code",
      title: { en: "Double it" },
      prompt: { en: "Write `double` that takes a number and returns twice that number. It should work for whole numbers and decimals alike." },
      options: [],
      correctIndex: 0,
      starterCode: "def double(n):\n    pass\n",
      tests: [
        { call: "double(4)", expected: "8" },
        { call: "double(0)", expected: "0" },
        { call: "double(-3)", expected: "-6", hidden: true },
        { call: "double(2.5)", expected: "5.0", hidden: true },
      ],
      tutorial: { en: "One line. Multiply the input by 2 and return it.\n\nYou do not need to handle decimals separately -- Python's * works the same way on whole numbers and decimals, so 2.5 * 2 gives 5.0 with no extra effort from you." },
      editorial: { en: "    def double(n):\n        return n * 2\n\nThat is the whole thing.\n\nWorth noticing: double(2.5) gives 5.0, not 5. Multiplying a float by an int gives a float in Python, and 5.0 and 5 are equal in value but display differently. That distinction turns up constantly once you start doing arithmetic on sensor readings." },
      explanation: { en: "Small, but it is the shape of every function: take something in, give something back." },
    },
    {
      id: "pp-c-medium-1",
      order: 2,
      status: "published",
      difficulty: "medium",
      kind: "code",
      title: { en: "Count the even numbers" },
      prompt: { en: "Write `count_even` that takes a list of whole numbers and returns how many of them are even. An empty list has none, so it returns 0." },
      options: [],
      correctIndex: 0,
      starterCode: "def count_even(numbers):\n    # How many numbers in the list are even?\n    pass\n",
      tests: [
        { call: "count_even([1, 2, 3, 4])", expected: "2" },
        { call: "count_even([1, 3, 5])", expected: "0" },
        { call: "count_even([])", expected: "0", hidden: true },
        { call: "count_even([2, 4, 6, 8])", expected: "4", hidden: true },
      ],
      tutorial: { en: "\"Even\" means it divides by 2 with nothing left over. Python's % operator gives you the remainder, so `n % 2 == 0` is True exactly when n is even.\n\nThen it is a counter: start at 0, loop through the list, add 1 each time the test passes, return the counter at the end.\n\nThe empty list needs no special case -- looping over nothing runs the body zero times, and you return the 0 you started with." },
      editorial: { en: "    def count_even(numbers):\n        count = 0\n        for n in numbers:\n            if n % 2 == 0:\n                count += 1\n        return count\n\n`count += 1` is shorthand for `count = count + 1`.\n\nThe empty list falling out for free is worth pausing on: you did not write a special case for it, but starting the counter at 0 before the loop means the answer is already correct if the loop never runs. Code that handles an edge case by construction is better than code that handles it with an extra if.\n\nOnce comfortable, this is also:\n\n    return sum(1 for n in numbers if n % 2 == 0)" },
      explanation: { en: "Counting things that match a condition is one of the most common patterns in programming -- and the pattern is always the same: a counter, a loop, a condition." },
    },
    {
      id: "pp-c-medium-2",
      order: 3,
      status: "published",
      difficulty: "medium",
      kind: "code",
      title: { en: "Longest word" },
      prompt: { en: "Write `longest` that takes a list of words and returns the longest one. If two are equally long, return the one that appears first. An empty list returns an empty string." },
      options: [],
      correctIndex: 0,
      starterCode: "def longest(words):\n    # Return the longest word in the list.\n    pass\n",
      tests: [
        { call: "longest([\"cat\", \"giraffe\", \"dog\"])", expected: "\"giraffe\"" },
        { call: "longest([\"a\"])", expected: "\"a\"" },
        { call: "longest([])", expected: "\"\"", hidden: true },
        { call: "longest([\"big\", \"cat\"])", expected: "\"big\"", hidden: true },
      ],
      tutorial: { en: "Keep a \"best so far\". Start it as an empty string, walk the list, and whenever the current word is LONGER than the best so far, make it the new best.\n\nThe tie rule matters: use strictly greater than (>), not >=. With >, a later word of equal length does not replace the earlier one -- which is exactly the \"first one wins\" behaviour asked for.\n\n`len(word)` gives a word's length." },
      editorial: { en: "    def longest(words):\n        best = \"\"\n        for word in words:\n            if len(word) > len(best):\n                best = word\n        return best\n\nStarting `best` as \"\" solves the empty-list case for free: nothing replaces it, so \"\" is what comes back.\n\nThe `>` versus `>=` choice is the whole tie rule. With `>=`, [\"big\", \"cat\"] would return \"cat\" -- the last equally-long word instead of the first. One character, completely different behaviour, and only the hidden test would have caught it." },
      explanation: { en: "\"Best so far\" is a pattern you will reuse endlessly -- largest, smallest, nearest, cheapest. Only the comparison changes." },
    },
    {
      id: "pp-c-hard-1",
      order: 4,
      status: "published",
      difficulty: "hard",
      kind: "code",
      title: { en: "Initials" },
      prompt: { en: "Write `initials` that takes a full name and returns the initials in capitals, separated by dots. \"ada lovelace\" gives \"A.L\". A single name gives just that initial, and an empty string gives an empty string." },
      options: [],
      correctIndex: 0,
      starterCode: "def initials(full_name):\n    # \"ada lovelace\" -> \"A.L\"\n    pass\n",
      tests: [
        { call: "initials(\"ada lovelace\")", expected: "\"A.L\"" },
        { call: "initials(\"grace\")", expected: "\"G\"" },
        { call: "initials(\"\")", expected: "\"\"", hidden: true },
        { call: "initials(\"alan mathison turing\")", expected: "\"A.M.T\"", hidden: true },
      ],
      tutorial: { en: "Three steps, each simple on its own.\n\nSplit the name into words: `full_name.split()` gives you a list. Take the first letter of each: `word[0]`. Uppercase it: `.upper()`. Then join them with dots: `\".\".join(letters)`.\n\nThe empty string is worth checking -- \"\".split() gives an empty list, and joining an empty list gives \"\", so this case may already work without a special branch. Try it before adding one." },
      editorial: { en: "    def initials(full_name):\n        letters = [word[0].upper() for word in full_name.split()]\n        return \".\".join(letters)\n\nOr the same thing as an explicit loop:\n\n    def initials(full_name):\n        letters = []\n        for word in full_name.split():\n            letters.append(word[0].upper())\n        return \".\".join(letters)\n\n`\".\".join(list)` reads backwards at first: the separator goes on the left, and it glues the list together with that separator between each pair -- so no trailing dot, which is exactly what you want.\n\nThe empty string needs no special case: \"\".split() is [], the comprehension makes [], and \".\".join([]) is \"\". Three operations that each do the right thing on nothing." },
      explanation: { en: "Chaining small operations -- split, transform, join -- is how a lot of real text handling is written. Each step is boring alone; together they do something useful." },
    },
    {
      id: "pp-c-hard-2",
      order: 5,
      status: "published",
      difficulty: "hard",
      kind: "code",
      title: { en: "Tally the votes" },
      prompt: { en: "Write `tally` that takes a list of names and returns a dictionary counting how many times each name appears. An empty list returns an empty dictionary." },
      options: [],
      correctIndex: 0,
      starterCode: "def tally(votes):\n    # [\"a\", \"b\", \"a\"] -> {\"a\": 2, \"b\": 1}\n    pass\n",
      tests: [
        { call: "tally([\"a\", \"b\", \"a\"])", expected: "{\"a\": 2, \"b\": 1}" },
        { call: "tally([])", expected: "{}" },
        { call: "tally([\"x\"])", expected: "{\"x\": 1}", hidden: true },
        { call: "tally([\"p\", \"p\", \"p\"])", expected: "{\"p\": 3}", hidden: true },
      ],
      tutorial: { en: "Start with an empty dictionary and fill it as you go.\n\nThe catch: the first time you see a name it is not in the dictionary yet, so `counts[name] += 1` would raise KeyError -- there is nothing to add 1 to. You need to handle \"first time seen\" separately.\n\nTwo clean ways: check `if name in counts` first, or use `counts.get(name, 0)`, which returns 0 instead of failing when the key is missing." },
      editorial: { en: "    def tally(votes):\n        counts = {}\n        for name in votes:\n            counts[name] = counts.get(name, 0) + 1\n        return counts\n\n`counts.get(name, 0)` is the key idea: give me the current count, or 0 if this name is new. Then add 1 and store it back. One line covers both the first sighting and every one after.\n\nThe longer version says the same thing:\n\n    if name in counts:\n        counts[name] += 1\n    else:\n        counts[name] = 1\n\nUnlike the waste-sorting challenge, the keys are not known in advance here -- they come from the data -- so the dictionary genuinely has to grow, and that is why the missing-key case has to be handled at all." },
      explanation: { en: "Counting occurrences with a dictionary is one of the most reused patterns there is -- word frequencies, vote counts, detected objects per colour." },
    },
  ],
};
