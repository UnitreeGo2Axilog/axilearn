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
  "pp-1": [
    {
      question: { en: "What does `print` do?", fr: "Que fait `print` ?" },
      options: [
        { en: "Prints paper on a printer", fr: "Imprime sur une imprimante" },
        { en: "Shows something on the screen", fr: "Affiche quelque chose \u00e0 l'\u00e9cran" },
        { en: "Saves your program", fr: "Enregistre ton programme" },
        { en: "Makes the code run faster", fr: "Rend le code plus rapide" },
      ],
      correctIndex: 1,
      explanation: { en: "`print` puts something on the screen so a human can see it. Nothing is sent to a real printer.", fr: "`print` met quelque chose \u00e0 l'\u00e9cran pour qu'un humain le voie. Rien n'est envoy\u00e9 \u00e0 une vraie imprimante." },
    },
    {
      question: { en: "You run `print(Hello)` without quotes and get a NameError. What does that mean?", fr: "Tu lances `print(Salut)` sans guillemets et tu obtiens un NameError. \u00c7a veut dire quoi ?" },
      options: [
        { en: "Your computer is broken", fr: "Ton ordinateur est cass\u00e9" },
        { en: "Python does not know anything called Hello", fr: "Python ne conna\u00eet rien qui s'appelle Salut" },
        { en: "You must restart the page", fr: "Il faut recharger la page" },
        { en: "Python does not like that word", fr: "Python n'aime pas ce mot" },
      ],
      correctIndex: 1,
      explanation: { en: "Without quotes, Python thinks `Hello` is the name of something you made earlier. It looks, finds nothing, and says so. Errors are information.", fr: "Sans guillemets, Python croit que `Salut` est le nom de quelque chose que tu as cr\u00e9\u00e9 avant. Il cherche, ne trouve rien, et le dit. Une erreur, c'est une information." },
    },
  ],
  "pp-2": [
    {
      question: { en: "What does `score = 10` do?", fr: "Que fait `score = 10` ?" },
      options: [
        { en: "Asks whether score is 10", fr: "Demande si score vaut 10" },
        { en: "Puts 10 into a box called score", fr: "Met 10 dans une bo\u00eete appel\u00e9e score" },
        { en: "Prints 10", fr: "Affiche 10" },
        { en: "Compares score with 10", fr: "Compare score et 10" },
      ],
      correctIndex: 1,
      explanation: { en: "A single `=` means *put this in that box*. Asking a question needs `==`, which is the next chapter.", fr: "Un seul `=` veut dire *mets \u00e7a dans cette bo\u00eete*. Pour poser une question il faut `==`, c'est le chapitre suivant." },
    },
    {
      question: { en: "What does `print(\"3\" + \"5\")` show?", fr: "Qu'affiche `print(\"3\" + \"5\")` ?" },
      options: [
        { en: "8", fr: "8" },
        { en: "35", fr: "35" },
        { en: "\"8\"", fr: "\"8\"" },
        { en: "An error", fr: "Une erreur" },
      ],
      correctIndex: 1,
      explanation: { en: "With quotes, `\"3\"` and `\"5\"` are text, and adding text glues it together. Without quotes, `3 + 5` really is 8.", fr: "Avec les guillemets, `\"3\"` et `\"5\"` sont du texte, et additionner du texte le colle. Sans guillemets, `3 + 5` fait bien 8." },
    },
  ],
  "pp-3": [
    {
      question: { en: "In an `if`, what does the indentation do?", fr: "Dans un `if`, \u00e0 quoi sert l'indentation ?" },
      options: [
        { en: "Makes the code look tidy", fr: "\u00c0 faire joli" },
        { en: "Tells Python which lines belong to the if", fr: "\u00c0 dire \u00e0 Python quelles lignes appartiennent au if" },
        { en: "Nothing, it is optional", fr: "\u00c0 rien, c'est facultatif" },
        { en: "Makes it run faster", fr: "\u00c0 aller plus vite" },
      ],
      correctIndex: 1,
      explanation: { en: "In Python indentation is not decoration. The indented lines are the ones that belong to the `if`; anything not indented runs either way.", fr: "En Python l'indentation n'est pas de la d\u00e9coration. Les lignes d\u00e9cal\u00e9es sont celles qui appartiennent au `if` ; le reste s'ex\u00e9cute de toute fa\u00e7on." },
    },
    {
      question: { en: "What is the difference between `=` and `==`?", fr: "Quelle est la diff\u00e9rence entre `=` et `==` ?" },
      options: [
        { en: "No difference", fr: "Aucune" },
        { en: "`=` puts a value in a box, `==` asks if two things are the same", fr: "`=` met une valeur dans une bo\u00eete, `==` demande si deux choses sont pareilles" },
        { en: "`==` is for numbers only", fr: "`==` c'est seulement pour les nombres" },
        { en: "`=` is older", fr: "`=` est plus ancien" },
      ],
      correctIndex: 1,
      explanation: { en: "`=` stores. `==` asks a question and gives back True or False. Mixing them up is the most common beginner mistake there is.", fr: "`=` range. `==` pose une question et rend True ou False. Les confondre est l'erreur de d\u00e9butant la plus fr\u00e9quente qui existe." },
    },
  ],
  "pp-4": [
    {
      question: { en: "What numbers does `range(5)` give you?", fr: "Quels nombres donne `range(5)` ?" },
      options: [
        { en: "1 2 3 4 5", fr: "1 2 3 4 5" },
        { en: "0 1 2 3 4", fr: "0 1 2 3 4" },
        { en: "0 1 2 3 4 5", fr: "0 1 2 3 4 5" },
        { en: "5 only", fr: "5 seulement" },
      ],
      correctIndex: 1,
      explanation: { en: "It starts at 0 and stops *before* 5 -- five numbers in total. `range(1, 6)` is what gives you 1 to 5.", fr: "Il commence \u00e0 0 et s'arr\u00eate *avant* 5 -- cinq nombres en tout. C'est `range(1, 6)` qui donne 1 \u00e0 5." },
    },
    {
      question: { en: "What happens if you forget `n = n - 1` inside a `while n > 0` loop?", fr: "Que se passe-t-il si tu oublies `n = n - 1` dans une boucle `while n > 0` ?" },
      options: [
        { en: "It runs once", fr: "Elle tourne une fois" },
        { en: "It never runs", fr: "Elle ne tourne jamais" },
        { en: "It never stops, because n stays the same", fr: "Elle ne s'arr\u00eate jamais, car n ne change pas" },
        { en: "Python fixes it", fr: "Python corrige tout seul" },
      ],
      correctIndex: 2,
      explanation: { en: "The condition never becomes false, so the loop goes round forever. On this platform the page stops it for you after a few seconds.", fr: "La condition ne devient jamais fausse, donc la boucle tourne sans fin. Sur cette plateforme, la page l'arr\u00eate pour toi apr\u00e8s quelques secondes." },
    },
  ],
  "pp-5": [
    {
      question: { en: "What is the difference between `print` and `return` inside a function?", fr: "Quelle diff\u00e9rence entre `print` et `return` dans une fonction ?" },
      options: [
        { en: "None", fr: "Aucune" },
        { en: "`print` shows it to a human, `return` hands the value back to your program", fr: "`print` montre \u00e0 un humain, `return` rend la valeur \u00e0 ton programme" },
        { en: "`return` is faster", fr: "`return` est plus rapide" },
        { en: "`print` only works with text", fr: "`print` ne marche qu'avec du texte" },
      ],
      correctIndex: 1,
      explanation: { en: "Something you only printed is gone. Something you returned can be stored in a variable and used in more maths.", fr: "Ce qui est seulement affich\u00e9 est perdu. Ce qui est renvoy\u00e9 peut \u00eatre rang\u00e9 dans une variable et r\u00e9utilis\u00e9." },
    },
    {
      question: { en: "When does the code inside `def greet(name):` actually run?", fr: "Quand le code de `def saluer(nom):` s'ex\u00e9cute-t-il vraiment ?" },
      options: [
        { en: "As soon as you write it", fr: "D\u00e8s que tu l'\u00e9cris" },
        { en: "When you call `greet(\"Sara\")`", fr: "Quand tu appelles `saluer(\"Sara\")`" },
        { en: "When the program starts", fr: "Au d\u00e9marrage du programme" },
        { en: "Never", fr: "Jamais" },
      ],
      correctIndex: 1,
      explanation: { en: "Writing the recipe is not cooking. The lines run when you call the function by name.", fr: "\u00c9crire la recette, ce n'est pas cuisiner. Les lignes s'ex\u00e9cutent quand tu appelles la fonction par son nom." },
    },
  ],
  "pp-6": [
    {
      question: { en: "For `word = \"robot\"`, what does `word[0]` give?", fr: "Pour `mot = \"robot\"`, que donne `mot[0]` ?" },
      options: [
        { en: "\"r\"", fr: "\"r\"" },
        { en: "\"o\"", fr: "\"o\"" },
        { en: "\"robot\"", fr: "\"robot\"" },
        { en: "An error", fr: "Une erreur" },
      ],
      correctIndex: 0,
      explanation: { en: "Positions start at 0, so position 0 is the first letter. `word[4]` is the last one, and `word[5]` is an error.", fr: "Les positions commencent \u00e0 0, donc la position 0 est la premi\u00e8re lettre. `mot[4]` est la derni\u00e8re, et `mot[5]` est une erreur." },
    },
    {
      question: { en: "What does `\"-\" * 20` do?", fr: "Que fait `\"-\" * 20` ?" },
      options: [
        { en: "An error, you cannot multiply text", fr: "Une erreur, on ne multiplie pas du texte" },
        { en: "Draws a line of 20 dashes", fr: "Trace une ligne de 20 tirets" },
        { en: "Gives -20", fr: "Donne -20" },
        { en: "Removes 20 characters", fr: "Enl\u00e8ve 20 caract\u00e8res" },
      ],
      correctIndex: 1,
      explanation: { en: "Multiplying text repeats it. It is the quickest way to draw a separator line.", fr: "Multiplier du texte le r\u00e9p\u00e8te. C'est le moyen le plus rapide de tracer un s\u00e9parateur." },
    },
  ],
  "pp-7": [
    {
      question: { en: "How do you add something to the end of a list?", fr: "Comment ajouter quelque chose \u00e0 la fin d'une liste ?" },
      options: [
        { en: "`list.add(x)`", fr: "`liste.add(x)`" },
        { en: "`list.append(x)`", fr: "`liste.append(x)`" },
        { en: "`list + x`", fr: "`liste + x`" },
        { en: "`list.push(x)`", fr: "`liste.push(x)`" },
      ],
      correctIndex: 1,
      explanation: { en: "`.append(x)` puts x on the end. `.remove(x)` takes the first x out again.", fr: "`.append(x)` met x \u00e0 la fin. `.remove(x)` enl\u00e8ve le premier x." },
    },
    {
      question: { en: "What does `sum(readings) / len(readings)` give you?", fr: "Que donne `sum(mesures) / len(mesures)` ?" },
      options: [
        { en: "The biggest reading", fr: "La plus grande mesure" },
        { en: "The number of readings", fr: "Le nombre de mesures" },
        { en: "The average", fr: "La moyenne" },
        { en: "The smallest reading", fr: "La plus petite mesure" },
      ],
      correctIndex: 2,
      explanation: { en: "Add them all up, divide by how many there are. That is an average, and it works for a list of any length without changing the code.", fr: "On additionne tout, on divise par le nombre. C'est une moyenne, et \u00e7a marche pour une liste de n'importe quelle taille sans changer le code." },
    },
  ],
  "pp-8": [
    {
      question: { en: "When should you use a dictionary instead of a list?", fr: "Quand utiliser un dictionnaire plut\u00f4t qu'une liste ?" },
      options: [
        { en: "When you have more than ten things", fr: "Au-del\u00e0 de dix \u00e9l\u00e9ments" },
        { en: "When you want to find things by name instead of by position", fr: "Quand on veut chercher par nom plut\u00f4t que par position" },
        { en: "When the things are numbers", fr: "Quand ce sont des nombres" },
        { en: "Dictionaries are always better", fr: "Le dictionnaire est toujours mieux" },
      ],
      correctIndex: 1,
      explanation: { en: "A list is for the same kind of thing repeated. A dictionary is for different facts about one thing, each with a name.", fr: "Une liste, c'est la m\u00eame sorte de chose r\u00e9p\u00e9t\u00e9e. Un dictionnaire, ce sont des faits diff\u00e9rents sur une m\u00eame chose, chacun avec un nom." },
    },
    {
      question: { en: "What does `battery.get(\"voltage\", 0)` do when there is no voltage key?", fr: "Que fait `batterie.get(\"tension\", 0)` s'il n'y a pas de cl\u00e9 tension ?" },
      options: [
        { en: "Crashes", fr: "Plante" },
        { en: "Gives back 0", fr: "Rend 0" },
        { en: "Creates the key", fr: "Cr\u00e9e la cl\u00e9" },
        { en: "Gives back None", fr: "Rend None" },
      ],
      correctIndex: 1,
      explanation: { en: "`.get()` with a second value hands that back instead of crashing. It is how you survive data you did not write yourself.", fr: "`.get()` avec une deuxi\u00e8me valeur rend celle-ci au lieu de planter. C'est comme \u00e7a qu'on survit \u00e0 des donn\u00e9es qu'on n'a pas \u00e9crites soi-m\u00eame." },
    },
  ],
  "pp-9": [
    {
      question: { en: "In Project 3, why is `count_parts` written as a function?", fr: "Dans le projet 3, pourquoi `compter_pieces` est-elle une fonction ?" },
      options: [
        { en: "To make it look professional", fr: "Pour faire pro" },
        { en: "So it can be used on any list, not just that one", fr: "Pour servir sur n'importe quelle liste, pas seulement celle-l\u00e0" },
        { en: "Functions run faster", fr: "Les fonctions vont plus vite" },
        { en: "It is required", fr: "C'est obligatoire" },
      ],
      correctIndex: 1,
      explanation: { en: "That is the whole point of Chapter 5: one recipe, used with different ingredients. Call it with a new list and it works straight away.", fr: "C'est tout l'int\u00e9r\u00eat du chapitre 5 : une recette, plusieurs ingr\u00e9dients. Appelle-la avec une nouvelle liste et \u00e7a marche tout de suite." },
    },
    {
      question: { en: "Project 2 works whether the list has 5 readings or 50. Why?", fr: "Le projet 2 marche avec 5 mesures comme avec 50. Pourquoi ?" },
      options: [
        { en: "It was written for 5", fr: "Il a \u00e9t\u00e9 \u00e9crit pour 5" },
        { en: "Nothing in the code says how many there are -- len, sum, min and max count for themselves", fr: "Rien dans le code ne dit combien il y en a -- len, sum, min et max comptent tout seuls" },
        { en: "It guesses", fr: "Il devine" },
        { en: "It only works with 5", fr: "Il marche seulement avec 5" },
      ],
      correctIndex: 1,
      explanation: { en: "Code that never mentions a fixed number keeps working when the number changes. That is a habit worth keeping.", fr: "Du code qui ne mentionne jamais un nombre fixe continue de marcher quand le nombre change. C'est une habitude \u00e0 garder." },
    },
  ],
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
