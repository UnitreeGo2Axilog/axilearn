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
  "pp-7": {
    en: `## One box, many things

A variable holds one thing. A **list** holds as many as you like, in order,
under one name.

\`\`\`python
parts = ["leg", "motor", "sensor"]

print(parts)
print(len(parts))
\`\`\`

Square brackets, commas between the items. That is the whole idea.

## Getting one out

Same counting as strings: **the first one is 0**.

\`\`\`python
parts = ["leg", "motor", "sensor"]

print(parts[0])
print(parts[2])
print(parts[-1])
\`\`\`

\`[-1]\` is the last one, whatever the length. Very handy.

## Adding and removing

\`\`\`python
parts = ["leg", "motor"]

parts.append("sensor")
print(parts)

parts.remove("leg")
print(parts)
\`\`\`

- \`.append(x)\` puts \`x\` on the end
- \`.remove(x)\` takes the first \`x\` out

> tip: Add two more parts of your own before the prints, then run it.

## Changing one

Unlike a string, a list can be edited in place.

\`\`\`python
parts = ["leg", "motor", "sensor"]
parts[1] = "battery"

print(parts)
\`\`\`

## Going through it

This is what lists are really for. A \`for\` loop and a list are best friends.

\`\`\`python
parts = ["leg", "motor", "sensor", "camera"]

for part in parts:
    print(f"checking the {part}")

print("all checked")
\`\`\`

Four items, four lines of output. Add a fifth part and you do not touch the
loop at all -- it just does it five times.

## Numbers in a list

\`\`\`python
readings = [12, 40, 7, 33]

print(sum(readings))
print(max(readings))
print(min(readings))
print(len(readings))
\`\`\`

\`sum\`, \`max\`, \`min\` and \`len\` do exactly what they sound like. Together they
are most of what you need to make sense of a pile of measurements.

> tip: An average is \`sum(readings) / len(readings)\`. Try printing it.

## Building a list as you go

Start empty and fill it up.

\`\`\`python
squares = []

for n in range(1, 6):
    squares.append(n * n)

print(squares)
\`\`\`

> do: \`[]\` is an empty list. Starting empty and appending inside a loop is one of the most useful patterns in all of programming.
`,
    fr: `## Une boîte, plusieurs choses

Une variable contient une chose. Une **liste** en contient autant que tu veux,
dans l'ordre, sous un seul nom.

\`\`\`python
pieces = ["patte", "moteur", "capteur"]

print(pieces)
print(len(pieces))
\`\`\`

Des crochets, des virgules entre les éléments. C'est toute l'idée.

## En sortir une

On compte comme pour les strings : **la première est 0**.

\`\`\`python
pieces = ["patte", "moteur", "capteur"]

print(pieces[0])
print(pieces[2])
print(pieces[-1])
\`\`\`

\`[-1]\`, c'est la dernière, quelle que soit la longueur. Très pratique.

## Ajouter et enlever

\`\`\`python
pieces = ["patte", "moteur"]

pieces.append("capteur")
print(pieces)

pieces.remove("patte")
print(pieces)
\`\`\`

- \`.append(x)\` met \`x\` à la fin
- \`.remove(x)\` enlève le premier \`x\`

> tip: Ajoute deux pièces à toi avant les prints, puis relance.

## En changer une

Contrairement à une string, une liste se modifie sur place.

\`\`\`python
pieces = ["patte", "moteur", "capteur"]
pieces[1] = "batterie"

print(pieces)
\`\`\`

## La parcourir

C'est vraiment à ça que servent les listes. Une boucle \`for\` et une liste sont
les meilleures amies du monde.

\`\`\`python
pieces = ["patte", "moteur", "capteur", "camera"]

for piece in pieces:
    print(f"vérification : {piece}")

print("tout est vérifié")
\`\`\`

Quatre éléments, quatre lignes affichées. Ajoute une cinquième pièce et tu ne
touches pas du tout à la boucle -- elle le fait cinq fois, c'est tout.

## Des nombres dans une liste

\`\`\`python
mesures = [12, 40, 7, 33]

print(sum(mesures))
print(max(mesures))
print(min(mesures))
print(len(mesures))
\`\`\`

\`sum\`, \`max\`, \`min\` et \`len\` font exactement ce que leur nom dit. Ensemble,
c'est déjà presque tout ce qu'il faut pour comprendre un tas de mesures.

> tip: Une moyenne, c'est \`sum(mesures) / len(mesures)\`. Essaie de l'afficher.

## Construire une liste au fur et à mesure

Commence vide et remplis-la.

\`\`\`python
carres = []

for n in range(1, 6):
    carres.append(n * n)

print(carres)
\`\`\`

> do: \`[]\` est une liste vide. Partir de vide et ajouter dans une boucle est un des schémas les plus utiles de toute la programmation.
`,
  },
  "pp-8": {
    en: `## Looking things up by name

A list finds things by **position**: \`parts[2]\`. That works until you have to
remember that position 2 is the battery.

A **dictionary** finds things by **name**.

\`\`\`python
battery = {"level": 82, "charging": False}

print(battery["level"])
print(battery["charging"])
\`\`\`

Curly brackets. Each entry is a **key**, then a colon, then a **value**.

## Why this is nicer

Compare the two:

\`\`\`python
robot_list = ["Axi", 4, 82]
robot_dict = {"name": "Axi", "legs": 4, "battery": 82}

print(robot_list[2])
print(robot_dict["battery"])
\`\`\`

Both print 82. Only one of them still makes sense when you read it next month.

> do: When the things you are storing are different kinds of fact about one thing, use a dictionary. When they are the same kind of thing repeated, use a list.

## Changing and adding

\`\`\`python
battery = {"level": 82, "charging": False}

battery["level"] = 41
battery["temperature"] = 30

print(battery)
\`\`\`

Assigning to a key that exists changes it. Assigning to one that does not
**creates** it. There is no separate "add" step.

## Asking safely

Looking up a key that is not there is an error:

\`\`\`python
battery = {"level": 82}
print(battery["voltage"])
\`\`\`

\`.get()\` asks politely instead, and gives you a fallback:

\`\`\`python
battery = {"level": 82}

print(battery.get("voltage"))
print(battery.get("voltage", 0))
print("level" in battery)
\`\`\`

> tip: \`.get(key, fallback)\` is how you avoid crashing on data you did not write yourself. You will use it a lot.

## Going through it

\`\`\`python
robot = {"name": "Axi", "legs": 4, "battery": 82}

for key in robot:
    print(key, "->", robot[key])
\`\`\`

Or both at once, which reads better:

\`\`\`python
robot = {"name": "Axi", "legs": 4, "battery": 82}

for key, value in robot.items():
    print(f"{key}: {value}")
\`\`\`

## Counting things

The classic use, and it puts several chapters together at once:

\`\`\`python
colours = ["red", "green", "red", "blue", "red"]
counts = {}

for colour in colours:
    counts[colour] = counts.get(colour, 0) + 1

print(counts)
\`\`\`

Read that middle line slowly: *take what is already counted for this colour --
or 0 if we have not seen it -- add one, put it back*.

> warn: Keys must be unique. Putting \`"red"\` in twice does not make two entries; the second one overwrites the first.
`,
    fr: `## Chercher par son nom

Une liste trouve les choses par **position** : \`pieces[2]\`. Ça marche jusqu'au
jour où il faut se rappeler que la position 2, c'est la batterie.

Un **dictionnaire** trouve les choses par **nom**.

\`\`\`python
batterie = {"niveau": 82, "en_charge": False}

print(batterie["niveau"])
print(batterie["en_charge"])
\`\`\`

Des accolades. Chaque entrée est une **clé**, puis deux points, puis une
**valeur**.

## Pourquoi c'est mieux

Compare les deux :

\`\`\`python
robot_liste = ["Axi", 4, 82]
robot_dico = {"nom": "Axi", "pattes": 4, "batterie": 82}

print(robot_liste[2])
print(robot_dico["batterie"])
\`\`\`

Les deux affichent 82. Un seul des deux se comprend encore le mois prochain.

> do: Quand ce que tu ranges, ce sont des faits différents sur une même chose, prends un dictionnaire. Quand c'est la même sorte de chose répétée, prends une liste.

## Modifier et ajouter

\`\`\`python
batterie = {"niveau": 82, "en_charge": False}

batterie["niveau"] = 41
batterie["temperature"] = 30

print(batterie)
\`\`\`

Écrire dans une clé qui existe la modifie. Écrire dans une qui n'existe pas la
**crée**. Il n'y a pas d'étape « ajouter » séparée.

## Demander prudemment

Chercher une clé absente est une erreur :

\`\`\`python
batterie = {"niveau": 82}
print(batterie["tension"])
\`\`\`

\`.get()\` demande poliment, et te donne une valeur de secours :

\`\`\`python
batterie = {"niveau": 82}

print(batterie.get("tension"))
print(batterie.get("tension", 0))
print("niveau" in batterie)
\`\`\`

> tip: \`.get(cle, secours)\` est la façon d'éviter de planter sur des données que tu n'as pas écrites toi-même. Tu vas t'en servir souvent.

## Le parcourir

\`\`\`python
robot = {"nom": "Axi", "pattes": 4, "batterie": 82}

for cle in robot:
    print(cle, "->", robot[cle])
\`\`\`

Ou les deux d'un coup, ce qui se lit mieux :

\`\`\`python
robot = {"nom": "Axi", "pattes": 4, "batterie": 82}

for cle, valeur in robot.items():
    print(f"{cle} : {valeur}")
\`\`\`

## Compter des choses

L'usage classique, et il met plusieurs chapitres ensemble d'un coup :

\`\`\`python
couleurs = ["rouge", "vert", "rouge", "bleu", "rouge"]
comptes = {}

for couleur in couleurs:
    comptes[couleur] = comptes.get(couleur, 0) + 1

print(comptes)
\`\`\`

Lis la ligne du milieu lentement : *prends ce qui est déjà compté pour cette
couleur -- ou 0 si on ne l'a jamais vue -- ajoute un, remets-le*.

> warn: Les clés sont uniques. Mettre \`"rouge"\` deux fois ne fait pas deux entrées ; la seconde écrase la première.
`,
  },
  "pp-9": {
    en: `## Everything, at once

Eight chapters. Three small programs. Nothing new to learn here -- this is
where you find out that you already know enough to build things.

Read each one, guess what it will print, then run it and see if you were
right. Guessing first is the part that teaches you.

## Project 1 -- the robot check-up

Variables, conditions, and putting a decision in order.

\`\`\`python
battery = 45
distance = 12

if battery < 20:
    print("Go home and charge.")
elif distance < 20:
    print("Something is in the way -- stop.")
else:
    print("All good, keep going.")
\`\`\`

> tip: Change \`battery\` to 15 and run it. Then put it back and change \`distance\` to 40. Three different answers from the same six lines.

## Project 2 -- the sensor report

Lists, a loop, and the maths functions from Chapter 7.

\`\`\`python
readings = [12, 40, 7, 33, 21]

print(f"{len(readings)} readings")
print(f"closest: {min(readings)} cm")
print(f"furthest: {max(readings)} cm")
print(f"average: {sum(readings) / len(readings)} cm")

for reading in readings:
    if reading < 20:
        print(f"{reading} cm -- too close!")
\`\`\`

> tip: Add your own numbers to the list. Everything below updates by itself, because nothing in the code knows how many there are.

## Project 3 -- the parts counter

A function, a dictionary, and the counting pattern.

\`\`\`python
def count_parts(parts):
    counts = {}
    for part in parts:
        counts[part] = counts.get(part, 0) + 1
    return counts

robot = ["motor", "sensor", "motor", "leg", "motor", "sensor"]

result = count_parts(robot)
print(result)

for part, number in result.items():
    print(f"{number} x {part}")
\`\`\`

This is a real function. It works on any list you hand it, not just this one.

> tip: Call it again with a completely different list -- \`count_parts(["a", "b", "a"])\`. Same function, new answer. That is the whole point of Chapter 5.

## What you can do now

Look back at what those three programs used:

- variables and types -- Chapter 2
- if / elif / else -- Chapter 3
- for loops -- Chapter 4
- functions with return -- Chapter 5
- f-strings -- Chapter 6
- lists, sum, min, max, len -- Chapter 7
- dictionaries and .get() -- Chapter 8

That is enough Python to start on the robot track. Not enough to build
everything -- nobody has that -- but enough to read robot code and understand
what it is doing.

> do: When you get stuck later, come back and re-run these three. They are small enough to hold in your head, and almost every bigger program is these same pieces arranged differently.
`,
    fr: `## Tout, d'un coup

Huit chapitres. Trois petits programmes. Rien de nouveau à apprendre ici --
c'est le moment où tu découvres que tu en sais déjà assez pour construire des
choses.

Lis chacun, devine ce qu'il va afficher, puis lance-le et vois si tu avais
raison. Deviner d'abord, c'est la partie qui t'apprend quelque chose.

## Projet 1 -- le bilan du robot

Variables, conditions, et une décision mise dans le bon ordre.

\`\`\`python
batterie = 45
distance = 12

if batterie < 20:
    print("Retour à la base pour charger.")
elif distance < 20:
    print("Quelque chose bloque -- stop.")
else:
    print("Tout va bien, on continue.")
\`\`\`

> tip: Mets \`batterie\` à 15 et lance. Puis remets-la et mets \`distance\` à 40. Trois réponses différentes à partir des mêmes six lignes.

## Projet 2 -- le rapport des capteurs

Listes, une boucle, et les fonctions de calcul du chapitre 7.

\`\`\`python
mesures = [12, 40, 7, 33, 21]

print(f"{len(mesures)} mesures")
print(f"la plus proche : {min(mesures)} cm")
print(f"la plus loin : {max(mesures)} cm")
print(f"moyenne : {sum(mesures) / len(mesures)} cm")

for mesure in mesures:
    if mesure < 20:
        print(f"{mesure} cm -- trop près !")
\`\`\`

> tip: Ajoute tes propres nombres à la liste. Tout ce qui est en dessous se met à jour tout seul, parce que rien dans le code ne sait combien il y en a.

## Projet 3 -- le compteur de pièces

Une fonction, un dictionnaire, et le schéma du comptage.

\`\`\`python
def compter_pieces(pieces):
    comptes = {}
    for piece in pieces:
        comptes[piece] = comptes.get(piece, 0) + 1
    return comptes

robot = ["moteur", "capteur", "moteur", "patte", "moteur", "capteur"]

resultat = compter_pieces(robot)
print(resultat)

for piece, nombre in resultat.items():
    print(f"{nombre} x {piece}")
\`\`\`

C'est une vraie fonction. Elle marche sur n'importe quelle liste que tu lui
donnes, pas seulement celle-là.

> tip: Rappelle-la avec une liste complètement différente -- \`compter_pieces(["a", "b", "a"])\`. Même fonction, nouveau résultat. C'est tout l'intérêt du chapitre 5.

## Ce que tu sais faire maintenant

Regarde ce que ces trois programmes ont utilisé :

- variables et types -- chapitre 2
- if / elif / else -- chapitre 3
- boucles for -- chapitre 4
- fonctions avec return -- chapitre 5
- f-strings -- chapitre 6
- listes, sum, min, max, len -- chapitre 7
- dictionnaires et .get() -- chapitre 8

C'est assez de Python pour commencer le parcours robot. Pas assez pour tout
construire -- personne n'a ça -- mais assez pour lire du code de robot et
comprendre ce qu'il fait.

> do: Quand tu bloqueras plus tard, reviens relancer ces trois-là. Ils sont assez petits pour tenir dans la tête, et presque tous les programmes plus gros sont ces mêmes morceaux arrangés autrement.
`,
  },
  "pp-5": {
    en: `## Giving a block of code a name

You have written the same three lines twice. Then a third time. A **function**
lets you write them once, give them a name, and use the name instead.

\`\`\`python
def greet(name):
    return f"Hello, {name}!"

print(greet("Sara"))
print(greet("Youssef"))
\`\`\`

Read \`def\` as *define*. You are teaching Python a new word.

## The three parts

- \`def greet(name):\` -- the name of the function, and what it needs
- the indented lines -- what it does
- \`return\` -- what it hands back

Nothing inside a function happens until you **call** it. Writing the recipe is
not cooking.

\`\`\`python
def shout(word):
    return word.upper() + "!"

print("nothing has happened yet")
print(shout("stop"))
\`\`\`

## What it needs, and what it gives back

The thing in the brackets is called an **argument**. You can have none, one,
or several.

\`\`\`python
def area(width, height):
    return width * height

print(area(3, 4))
print(area(10, 2))
\`\`\`

> tip: Swap the two numbers in \`area(3, 4)\` and run it again. Same answer here -- but try \`def area(width, height): return width - height\` and it very much matters.

## return is not print

This one catches everybody.

\`\`\`python
def double_a(n):
    print(n * 2)

def double_b(n):
    return n * 2

double_a(5)
result = double_b(5)
print(result + 1)
\`\`\`

\`print\` shows something to a human and then it is gone. \`return\` hands the
value back to your program so you can keep using it.

> don't: Do not use \`print\` inside a function when you meant \`return\`. You cannot do maths with something that was only shown on a screen.

## Default values

Give an argument a value in the definition and it becomes optional.

\`\`\`python
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

print(greet("Sara"))
print(greet("Sara", "Good morning"))
\`\`\`

## Why bother

Three real reasons, and they all show up fast:

- you write it once instead of five times
- when it is wrong, you fix it in one place
- \`steer(pixel, width)\` says what it does; forty lines of maths does not

> do: When you catch yourself copy-pasting code and changing one number, that is the moment to make it a function.
`,
    fr: `## Donner un nom à un bloc de code

Tu as écrit les mêmes trois lignes deux fois. Puis une troisième. Une
**fonction** te laisse les écrire une fois, leur donner un nom, et utiliser le
nom à la place.

\`\`\`python
def saluer(nom):
    return f"Salut, {nom} !"

print(saluer("Sara"))
print(saluer("Youssef"))
\`\`\`

Lis \`def\` comme *définir*. Tu apprends un nouveau mot à Python.

## Les trois parties

- \`def saluer(nom):\` -- le nom de la fonction, et ce dont elle a besoin
- les lignes indentées -- ce qu'elle fait
- \`return\` -- ce qu'elle rend

Rien dans une fonction ne se passe tant que tu ne l'**appelles** pas. Écrire la
recette, ce n'est pas cuisiner.

\`\`\`python
def crier(mot):
    return mot.upper() + " !"

print("il ne s'est encore rien passé")
print(crier("stop"))
\`\`\`

## Ce dont elle a besoin, ce qu'elle rend

Ce qu'il y a entre parenthèses s'appelle un **argument**. Tu peux en avoir
aucun, un, ou plusieurs.

\`\`\`python
def aire(largeur, hauteur):
    return largeur * hauteur

print(aire(3, 4))
print(aire(10, 2))
\`\`\`

> tip: Inverse les deux nombres dans \`aire(3, 4)\` et relance. Même résultat ici -- mais essaie \`def aire(largeur, hauteur): return largeur - hauteur\` et là, ça change tout.

## return, ce n'est pas print

Celle-là piège tout le monde.

\`\`\`python
def double_a(n):
    print(n * 2)

def double_b(n):
    return n * 2

double_a(5)
resultat = double_b(5)
print(resultat + 1)
\`\`\`

\`print\` montre quelque chose à un humain et puis c'est fini. \`return\` rend la
valeur à ton programme pour que tu puisses continuer à t'en servir.

> don't: N'utilise pas \`print\` dans une fonction quand tu voulais \`return\`. On ne peut pas calculer avec quelque chose qui a seulement été affiché.

## Valeurs par défaut

Donne une valeur à un argument dans la définition et il devient facultatif.

\`\`\`python
def saluer(nom, salut="Salut"):
    return f"{salut}, {nom} !"

print(saluer("Sara"))
print(saluer("Sara", "Bonjour"))
\`\`\`

## Pourquoi s'embêter

Trois vraies raisons, et elles arrivent vite :

- tu l'écris une fois au lieu de cinq
- quand c'est faux, tu corriges à un seul endroit
- \`steer(pixel, largeur)\` dit ce que ça fait ; quarante lignes de calcul, non

> do: Quand tu te surprends à copier-coller du code en changeant un chiffre, c'est le moment d'en faire une fonction.
`,
  },
  "pp-6": {
    en: `## Text is a thing you can work on

A **string** is a piece of text. You have used them since the first chapter.
They can do much more than sit there.

\`\`\`python
word = "robot"

print(len(word))
print(word.upper())
print(word.lower())
\`\`\`

\`len\` tells you how many characters. \`.upper()\` and \`.lower()\` change the case.

> tip: The dot means *ask this thing to do something to itself*. \`word.upper()\` is you asking the word to give you a shouty version.

## Picking out one letter

Every character has a position, and **the first one is 0**.

\`\`\`python
word = "robot"

print(word[0])
print(word[1])
print(word[4])
\`\`\`

\`\`\`flow
step: r  o  b  o  t
step: 0  1  2  3  4
\`\`\`

Counting from zero feels wrong for about a week and then feels normal forever.

> warn: \`word[5]\` on a five-letter word gives an error. The last position is 4, because we started at 0.

Counting backwards works too, and is often easier:

\`\`\`python
word = "robot"

print(word[-1])
print(word[-2])
\`\`\`

## Taking a slice

Two numbers with a colon gives you a piece.

\`\`\`python
word = "robotics"

print(word[0:5])
print(word[5:])
print(word[:5])
\`\`\`

Same rule as \`range\`: **start here, stop before there**.

## Joining and repeating

\`\`\`python
first = "Physical"
second = "AI"

print(first + " " + second)
print("-" * 20)
\`\`\`

Adding glues text together. Multiplying repeats it, which is a quick way to
draw a line.

## f-strings, again

The neat way to build a sentence out of pieces:

\`\`\`python
name = "Axi"
battery = 82

print(f"{name} is at {battery}% battery.")
\`\`\`

> do: Use f-strings. \`"Battery: " + str(battery) + "%"\` does the same job with more chances to get it wrong.

## Useful things strings can do

\`\`\`python
message = "  stop the robot  "

print(message.strip())
print(message.strip().replace("stop", "start"))
print("robot" in message)
\`\`\`

- \`.strip()\` removes spaces at the ends
- \`.replace(a, b)\` swaps one piece of text for another
- \`in\` asks whether something appears inside -- and gives you \`True\` or \`False\`
`,
    fr: `## Le texte, c'est une chose sur laquelle on peut travailler

Une **string** (chaîne) est un morceau de texte. Tu en utilises depuis le
premier chapitre. Elles peuvent faire bien plus que rester là.

\`\`\`python
mot = "robot"

print(len(mot))
print(mot.upper())
print(mot.lower())
\`\`\`

\`len\` te dit combien il y a de caractères. \`.upper()\` et \`.lower()\` changent la
casse.

> tip: Le point veut dire *demande à cette chose de faire quelque chose sur elle-même*. \`mot.upper()\`, c'est toi qui demandes au mot une version en majuscules.

## Prendre une seule lettre

Chaque caractère a une position, et **la première est 0**.

\`\`\`python
mot = "robot"

print(mot[0])
print(mot[1])
print(mot[4])
\`\`\`

\`\`\`flow
step: r  o  b  o  t
step: 0  1  2  3  4
\`\`\`

Compter à partir de zéro paraît bizarre pendant une semaine, puis paraît normal
pour toujours.

> warn: \`mot[5]\` sur un mot de cinq lettres donne une erreur. La dernière position est 4, parce qu'on a commencé à 0.

Compter à l'envers marche aussi, et c'est souvent plus pratique :

\`\`\`python
mot = "robot"

print(mot[-1])
print(mot[-2])
\`\`\`

## Prendre une tranche

Deux nombres séparés par deux points donnent un morceau.

\`\`\`python
mot = "robotique"

print(mot[0:5])
print(mot[5:])
print(mot[:5])
\`\`\`

Même règle que \`range\` : **commence ici, arrête-toi avant là**.

## Coller et répéter

\`\`\`python
premier = "Physical"
second = "AI"

print(premier + " " + second)
print("-" * 20)
\`\`\`

L'addition colle le texte. La multiplication le répète, ce qui est un moyen
rapide de tracer une ligne.

## Les f-strings, encore

La façon propre de construire une phrase à partir de morceaux :

\`\`\`python
nom = "Axi"
batterie = 82

print(f"{nom} est à {batterie} % de batterie.")
\`\`\`

> do: Utilise les f-strings. \`"Batterie : " + str(batterie) + " %"\` fait la même chose avec plus d'occasions de se tromper.

## Des choses utiles que font les strings

\`\`\`python
message = "  arrete le robot  "

print(message.strip())
print(message.strip().replace("arrete", "demarre"))
print("robot" in message)
\`\`\`

- \`.strip()\` enlève les espaces aux deux bouts
- \`.replace(a, b)\` remplace un morceau de texte par un autre
- \`in\` demande si quelque chose apparaît dedans -- et donne \`True\` ou \`False\`
`,
  },
  "pp-2": {
    en: `## A box with a name on it

A **variable** is a box. You put something in it, you write a name on the
outside, and later you ask for it back by name.

\`\`\`python
legs = 4
print(legs)
\`\`\`

The \`=\` does not mean "equals" here. It means **put this in that box**. Read
it as *"legs gets 4"*.

## You can change what is inside

The box keeps whatever you put in it last.

\`\`\`python
score = 0
print(score)

score = 10
print(score)
\`\`\`

> tip: Add a line \`score = score + 5\` before the last print and run it again. Yes, that is allowed -- it means "take what is in the box, add 5, put it back".

## Four kinds of thing

Python cares what *kind* of thing is in the box. There are four you will use
all the time.

- a whole number -- \`7\` -- called an **int**
- a number with a dot -- \`3.5\` -- called a **float**
- some text -- \`"hello"\` -- called a **str**, short for string
- true or false -- \`True\` or \`False\` -- called a **bool**

You can ask Python what something is:

\`\`\`python
print(type(7))
print(type(3.5))
print(type("hello"))
print(type(True))
\`\`\`

> warn: \`True\` and \`False\` start with a capital letter in Python. \`true\` will not work.

## Text and numbers are not the same

This looks like it should be 8. It is not.

\`\`\`python
print("3" + "5")
\`\`\`

\`"3"\` with quotes is **text**. Adding two pieces of text glues them together.
Take the quotes off and you get real numbers:

\`\`\`python
print(3 + 5)
\`\`\`

> don't: Do not put quotes around a number you want to do maths with. \`"10" + "1"\` is \`"101"\`, not 11.

## Putting a variable inside a sentence

Sticking \`f\` in front of the quotes lets you drop variables straight into the
text, inside curly brackets.

\`\`\`python
name = "Axi"
legs = 4

print(f"{name} has {legs} legs.")
\`\`\`

That is called an **f-string**. The \`f\` stands for *format*. You will use it
constantly.

## Naming your boxes

- names can have letters, numbers and \`_\`
- they cannot start with a number
- they cannot have spaces -- use \`battery_level\`, not \`battery level\`

> do: Give boxes names that say what is inside. \`d = 12\` means nothing next week. \`distance_cm = 12\` still makes sense.
`,
    fr: `## Une boîte avec un nom dessus

Une **variable**, c'est une boîte. Tu mets quelque chose dedans, tu écris un
nom dessus, et plus tard tu le redemandes par son nom.

\`\`\`python
pattes = 4
print(pattes)
\`\`\`

Le \`=\` ne veut pas dire « égal » ici. Il veut dire **mets ça dans cette
boîte**. Lis-le comme *« pattes reçoit 4 »*.

## Tu peux changer ce qu'il y a dedans

La boîte garde ce que tu y as mis en dernier.

\`\`\`python
score = 0
print(score)

score = 10
print(score)
\`\`\`

> tip: Ajoute la ligne \`score = score + 5\` avant le dernier print et relance. Oui, c'est permis -- ça veut dire « prends ce qu'il y a dans la boîte, ajoute 5, remets-le ».

## Quatre sortes de choses

Python fait attention au *type* de ce qu'il y a dans la boîte. Il y en a quatre
que tu utiliseras tout le temps.

- un nombre entier -- \`7\` -- un **int**
- un nombre à virgule -- \`3.5\` -- un **float**
- du texte -- \`"salut"\` -- un **str**, pour *string*
- vrai ou faux -- \`True\` ou \`False\` -- un **bool**

Tu peux demander à Python ce que c'est :

\`\`\`python
print(type(7))
print(type(3.5))
print(type("salut"))
print(type(True))
\`\`\`

> warn: \`True\` et \`False\` prennent une majuscule en Python. \`true\` ne marchera pas.

## Le texte et les nombres, ce n'est pas pareil

On dirait que ça fait 8. Non.

\`\`\`python
print("3" + "5")
\`\`\`

\`"3"\` avec des guillemets, c'est du **texte**. Additionner deux textes, ça les
colle. Enlève les guillemets et tu as de vrais nombres :

\`\`\`python
print(3 + 5)
\`\`\`

> don't: Ne mets pas de guillemets autour d'un nombre avec lequel tu veux calculer. \`"10" + "1"\` donne \`"101"\`, pas 11.

## Mettre une variable dans une phrase

Un \`f\` devant les guillemets te laisse glisser des variables directement dans
le texte, entre accolades.

\`\`\`python
nom = "Axi"
pattes = 4

print(f"{nom} a {pattes} pattes.")
\`\`\`

Ça s'appelle une **f-string**. Le \`f\`, c'est pour *format*. Tu vas t'en servir
sans arrêt.

## Nommer tes boîtes

- un nom peut contenir des lettres, des chiffres et \`_\`
- il ne peut pas commencer par un chiffre
- il ne peut pas contenir d'espace -- écris \`niveau_batterie\`, pas \`niveau batterie\`

> do: Donne à tes boîtes des noms qui disent ce qu'il y a dedans. \`d = 12\` ne veut rien dire la semaine prochaine. \`distance_cm = 12\` se comprend encore.
`,
  },
  "pp-3": {
    en: `## Making the program choose

So far every line ran, every time. A **condition** lets the program look at
something and decide.

\`\`\`flow
step: x = 5
ask: x < 10 ?
yes: print('Smaller')
no: skip it
ask: x > 20 ?
yes: print('Bigger')
no: skip it
step: print('Done')
\`\`\`

That is the picture. Here is the same thing as a program, and what it prints:

\`\`\`progout
x = 5
if x < 10:
    print('Smaller')
if x > 20:
    print('Bigger')

print('Done')
---
Smaller
Done
\`\`\`

Bigger never appears, because 5 is not bigger than 20. The program reaches the
last line either way -- it is not indented, so it belongs to no if.

## if

\`\`\`python
distance = 15

if distance < 20:
    print("Too close -- stop!")

print("Done")
\`\`\`

Two things to notice, and both matter:

- the line ends with a colon \`:\`
- the next line is pushed in by four spaces

That push-in is called **indentation**, and in Python it is not decoration. It
is how Python knows which lines belong to the \`if\`.

> warn: Change \`distance\` to 50 and run it again. "Stop!" disappears, "Done" stays. "Done" is not indented, so it is not part of the \`if\`.

## else

\`else\` is what happens when the answer was no.

\`\`\`python
battery = 12

if battery > 20:
    print("Keep working.")
else:
    print("Go home and charge.")
\`\`\`

Exactly one of those two lines runs. Never both, never neither.

## elif

For more than two choices, \`elif\` sits in the middle. It is short for
*else if*.

\`\`\`python
battery = 45

if battery > 50:
    print("Normal mode")
elif battery > 20:
    print("Saving power")
else:
    print("Going home")
\`\`\`

Python checks them **top to bottom** and stops at the first one that is true.
So order matters -- put the strictest test first.

## The questions you can ask

- \`<\` smaller than
- \`>\` bigger than
- \`<=\` smaller or the same
- \`>=\` bigger or the same
- \`==\` the same as
- \`!=\` not the same as

> warn: \`=\` puts something in a box. \`==\` asks a question. Using \`=\` where you meant \`==\` is the single most common beginner mistake, and everyone makes it.

\`\`\`python
age = 12

print(age == 12)
print(age != 12)
print(age >= 18)
\`\`\`

Each of those prints \`True\` or \`False\` -- the bool from the last chapter,
doing its real job.

## Asking two things at once

\`\`\`python
battery = 60
distance = 8

if battery > 20 and distance > 10:
    print("Safe to move")
else:
    print("Not moving")
\`\`\`

- \`and\` -- both must be true
- \`or\` -- at least one must be true
- \`not\` -- flips it around

> tip: Change \`distance\` to 30 and run it again. Now both parts are true, and the answer changes.
`,
    fr: `## Faire choisir le programme

Jusqu'ici, chaque ligne s'exécutait, à chaque fois. Une **condition** permet au
programme de regarder quelque chose et de décider.

\`\`\`flow
step: x = 5
ask: x < 10 ?
yes: print('Plus petit')
no: on saute
ask: x > 20 ?
yes: print('Plus grand')
no: on saute
step: print('Fini')
\`\`\`

Voilà l'image. Voici la même chose en programme, et ce qu'il affiche :

\`\`\`progout
x = 5
if x < 10:
    print('Plus petit')
if x > 20:
    print('Plus grand')

print('Fini')
---
Plus petit
Fini
\`\`\`

Plus grand n'apparaît jamais, parce que 5 n'est pas plus grand que 20. Le
programme atteint quand même la dernière ligne -- elle n'est pas indentée, donc
elle n'appartient à aucun if.

## if

\`\`\`python
distance = 15

if distance < 20:
    print("Trop près -- stop !")

print("Fini")
\`\`\`

Deux choses à remarquer, et les deux comptent :

- la ligne finit par deux points \`:\`
- la ligne suivante est décalée de quatre espaces

Ce décalage s'appelle l'**indentation**, et en Python ce n'est pas de la
décoration. C'est comme ça que Python sait quelles lignes appartiennent au
\`if\`.

> warn: Mets \`distance\` à 50 et relance. « Stop ! » disparaît, « Fini » reste. « Fini » n'est pas indenté, donc il ne fait pas partie du \`if\`.

## else

\`else\`, c'est ce qui se passe quand la réponse était non.

\`\`\`python
batterie = 12

if batterie > 20:
    print("Je continue.")
else:
    print("Je rentre me recharger.")
\`\`\`

Exactement une des deux lignes s'exécute. Jamais les deux, jamais aucune.

## elif

Pour plus de deux choix, \`elif\` se met au milieu. C'est le raccourci de
*else if*.

\`\`\`python
batterie = 45

if batterie > 50:
    print("Mode normal")
elif batterie > 20:
    print("Économie d'énergie")
else:
    print("Retour à la base")
\`\`\`

Python les vérifie **de haut en bas** et s'arrête à la première qui est vraie.
Donc l'ordre compte -- mets le test le plus strict en premier.

## Les questions que tu peux poser

- \`<\` plus petit que
- \`>\` plus grand que
- \`<=\` plus petit ou égal
- \`>=\` plus grand ou égal
- \`==\` égal à
- \`!=\` différent de

> warn: \`=\` met quelque chose dans une boîte. \`==\` pose une question. Utiliser \`=\` à la place de \`==\` est l'erreur de débutant la plus fréquente, et tout le monde la fait.

\`\`\`python
age = 12

print(age == 12)
print(age != 12)
print(age >= 18)
\`\`\`

Chacune affiche \`True\` ou \`False\` -- le bool du chapitre d'avant, dans son
vrai rôle.

## Demander deux choses à la fois

\`\`\`python
batterie = 60
distance = 8

if batterie > 20 and distance > 10:
    print("On peut avancer")
else:
    print("On n'avance pas")
\`\`\`

- \`and\` -- les deux doivent être vraies
- \`or\` -- au moins une doit être vraie
- \`not\` -- inverse la réponse

> tip: Mets \`distance\` à 30 et relance. Maintenant les deux parties sont vraies, et la réponse change.
`,
  },
  "pp-4": {
    en: `## Doing something again

You want to print five numbers. You could write five lines. Now imagine a
hundred numbers. A **loop** does the same thing over and over without you
typing it over and over.

\`\`\`flow
step: n = 5
ask: n > 0 ?
yes: print(n)
yes: n = n - 1
no: leave the loop
step: print('Blastoff!')
\`\`\`

Follow the arrows: while the answer is **Yes** it goes round again. The moment
it is **No**, it leaves the loop and carries on.

\`\`\`progout
n = 5
while n > 0:
    print(n)
    n = n - 1
print('Blastoff!')
---
5
4
3
2
1
Blastoff!
\`\`\`

That is the picture. Here is the code.

## while

\`while\` means *keep going as long as this is true*.

\`\`\`python
n = 5

while n > 0:
    print(n)
    n = n - 1

print("Blastoff!")
\`\`\`

Run it. It counts down and then stops.

The \`n = n - 1\` line is doing the important work: without it, \`n\` stays 5
forever and the loop never ends.

> warn: A loop that never ends is called an **infinite loop**. If you make one here, the page stops it for you after a few seconds and tells you. It is a normal mistake, not a disaster.

## for

Most of the time you know how many times you want to go round. \`for\` is for
that, and it is easier to get right.

\`\`\`python
for n in range(5):
    print(n)
\`\`\`

\`range(5)\` gives you 0, 1, 2, 3, 4. **Five numbers, starting at zero** --
which surprises everybody the first time.

\`\`\`python
for n in range(1, 6):
    print(n)
\`\`\`

Two numbers means *start here, stop before there*. So \`range(1, 6)\` is 1 to 5.

## Going through a list of things

\`for\` also walks through things one at a time.

\`\`\`python
for part in ["leg", "motor", "sensor"]:
    print(part)
\`\`\`

Read that out loud: *for each part in this list, print the part*. Python reads
almost like English here, which is not an accident.

## Stopping early

\`break\` jumps straight out of the loop.

\`\`\`python
for n in range(10):
    if n == 3:
        break
    print(n)

print("Out.")
\`\`\`

> tip: Change \`3\` to \`7\` and run it again. The loop gets further before it gives up.

## The two mistakes everybody makes

> don't: Forgetting to change the counter inside a \`while\`. Then the condition never becomes false.
> don't: Forgetting the indentation. The lines that repeat are the indented ones -- everything else runs only once.
`,
    fr: `## Refaire quelque chose

Tu veux afficher cinq nombres. Tu pourrais écrire cinq lignes. Maintenant
imagine cent nombres. Une **boucle** répète la même chose encore et encore
sans que tu la retapes encore et encore.

\`\`\`flow
step: n = 5
ask: n > 0 ?
yes: print(n)
yes: n = n - 1
no: sortir de la boucle
step: print('Décollage !')
\`\`\`

Suis les flèches : tant que la réponse est **Oui**, on refait un tour. Dès que
c'est **Non**, on sort de la boucle et on continue.

\`\`\`progout
n = 5
while n > 0:
    print(n)
    n = n - 1
print('Décollage !')
---
5
4
3
2
1
Décollage !
\`\`\`

Voilà l'image. Voici le code.

## while

\`while\` veut dire *continue tant que c'est vrai*.

\`\`\`python
n = 5

while n > 0:
    print(n)
    n = n - 1

print("Décollage !")
\`\`\`

Lance-le. Il compte à rebours puis s'arrête.

La ligne \`n = n - 1\` fait le travail important : sans elle, \`n\` reste à 5 pour
toujours et la boucle ne finit jamais.

> warn: Une boucle qui ne finit jamais s'appelle une **boucle infinie**. Si tu en fais une ici, la page l'arrête toute seule après quelques secondes et te le dit. C'est une erreur normale, pas une catastrophe.

## for

La plupart du temps tu sais combien de fois tu veux tourner. \`for\` sert à ça,
et il est plus facile à réussir.

\`\`\`python
for n in range(5):
    print(n)
\`\`\`

\`range(5)\` donne 0, 1, 2, 3, 4. **Cinq nombres, en partant de zéro** -- ça
surprend tout le monde la première fois.

\`\`\`python
for n in range(1, 6):
    print(n)
\`\`\`

Deux nombres veut dire *commence ici, arrête-toi avant là*. Donc \`range(1, 6)\`
va de 1 à 5.

## Parcourir une liste de choses

\`for\` sait aussi passer sur des choses une par une.

\`\`\`python
for piece in ["patte", "moteur", "capteur"]:
    print(piece)
\`\`\`

Lis-le à voix haute : *pour chaque pièce dans cette liste, affiche la pièce*.
Python se lit presque comme de l'anglais ici, et ce n'est pas un hasard.

## S'arrêter plus tôt

\`break\` saute directement hors de la boucle.

\`\`\`python
for n in range(10):
    if n == 3:
        break
    print(n)

print("Sorti.")
\`\`\`

> tip: Remplace \`3\` par \`7\` et relance. La boucle va plus loin avant d'abandonner.

## Les deux erreurs que tout le monde fait

> don't: Oublier de changer le compteur dans un \`while\`. La condition ne devient jamais fausse.
> don't: Oublier l'indentation. Les lignes qui se répètent sont celles qui sont décalées -- tout le reste ne s'exécute qu'une fois.
`,
  },
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
no: wait a bit longer
step: eat
\`\`\`

A program runs the same way -- one step, then the next, top to bottom:

\`\`\`progout
x = 2
print(x)
x = x + 2
print(x)
---
2
4
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
no: attendre encore un peu
step: manger
\`\`\`

Un programme marche pareil -- une étape, puis la suivante, de haut en bas :

\`\`\`progout
x = 2
print(x)
x = x + 2
print(x)
---
2
4
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
    en: `## Four kinds of AI

People say "AI" about four quite different things. Your supervisor's course is about the fourth one, and it helps a lot to see where it sits.

- **Traditional AI** sorts and predicts. It looks at things that already exist and puts them in boxes: this email is spam, this photo has a cat in it, this customer will probably leave.
- **Generative AI** makes new things. Text, pictures, music, code. ChatGPT is this one.
- **Agentic AI** decides and acts, over several steps, to reach a goal. It can use tools, check its own work, and try again. It still lives entirely inside a computer.
- **Physical AI** has a body. It senses a real room, decides, and then *moves something*. That is the one with legs.

\`\`\`flow
step: Traditional AI -- puts things in boxes
step: Generative AI -- makes new things
step: Agentic AI -- decides and acts, in software
step: Physical AI -- decides and MOVES
\`\`\`

## Why the body changes everything

The first three can be wrong cheaply. A chatbot writes a bad sentence and you press delete.

A robot cannot press delete. If it is wrong, it walks into a wall, drops what it was holding, or falls on somebody's foot. There is no undo button in a real room.

It also cannot take its time. A robot that needs three seconds to decide has already fallen over, because gravity did not wait for it.

> tip: This is the whole difficulty of Physical AI in one sentence -- **be right, be fast, and you only get one try.**

## The machines this course is about

- **Unitree Go2** -- a four-legged robot about the size of a medium dog, and about as heavy as one: **15 kg**. It is the robot you will be programming.
- **NVIDIA Jetson** -- a small computer that rides on the robot's back and does the thinking. It has to work with no internet, on a battery.
- **Simulators** -- a pretend world with real physics, where a robot can fall over a thousand times and break nothing.

## Safety, before anything else

You will spend this course in simulation, where nothing can go wrong. But if you are ever in a room with a real one:

> warn: A Go2 weighs about 15 kg and moves faster than you expect. It is not a toy, and it does not know you are there unless someone told it.

> do: Stand back. Know where the stop button is before it starts. Let one person -- and only one -- give it commands.

> don't: Never put your hand near a leg joint while it is powered on. A joint that is holding still is still pushing hard.

## The project you are learning from

This course is not built from made-up examples. It is built from a real research project on a real Go2, and you will meet its actual code:

- **the standing angles** the robot uses to get up
- **the control rule** its motors follow, in one line of maths
- **the walking pattern**, and the story of the faster one that kept falling over

> tip: Everything you write runs in simulation first. That is not the beginner version -- it is how professional robotics teams work, because a mistake on real hardware is slow and expensive. Simulation is where you get to be wrong for free.`,
    fr: `## Quatre sortes d'IA

Les gens disent « IA » pour quatre choses assez différentes. Le cours de ton encadrant parle de la quatrième, et ça aide beaucoup de voir où elle se situe.

- **L'IA traditionnelle** trie et prédit. Elle regarde ce qui existe déjà et le range dans des cases : cet e-mail est un spam, cette photo contient un chat, ce client va sûrement partir.
- **L'IA générative** fabrique du neuf. Du texte, des images, de la musique, du code. ChatGPT, c'est celle-là.
- **L'IA agentique** décide et agit, en plusieurs étapes, pour atteindre un but. Elle peut utiliser des outils, vérifier son travail et réessayer. Elle reste entièrement dans un ordinateur.
- **L'IA physique** a un corps. Elle perçoit une vraie pièce, décide, puis *fait bouger quelque chose*. C'est celle qui a des pattes.

\`\`\`flow
step: IA traditionnelle -- range dans des cases
step: IA générative -- fabrique du neuf
step: IA agentique -- décide et agit, dans le logiciel
step: IA physique -- décide et BOUGE
\`\`\`

## Pourquoi le corps change tout

Les trois premières peuvent se tromper sans que ça coûte cher. Un chatbot écrit une mauvaise phrase, tu appuies sur supprimer.

Un robot ne peut pas appuyer sur supprimer. S'il se trompe, il rentre dans un mur, lâche ce qu'il portait, ou tombe sur le pied de quelqu'un. Il n'y a pas de bouton « annuler » dans une vraie pièce.

Il ne peut pas non plus prendre son temps. Un robot qui met trois secondes à décider est déjà tombé, parce que la gravité ne l'a pas attendu.

> tip: Voilà toute la difficulté de l'IA physique en une phrase : **avoir raison, vite, et avec un seul essai.**

## Les machines dont parle ce cours

- **Unitree Go2** -- un robot à quatre pattes de la taille d'un chien moyen, et à peu près aussi lourd : **15 kg**. C'est le robot que tu vas programmer.
- **NVIDIA Jetson** -- un petit ordinateur posé sur le dos du robot, qui fait la réflexion. Il doit fonctionner sans internet, sur batterie.
- **Les simulateurs** -- un monde imaginaire avec de vraies lois physiques, où un robot peut tomber mille fois sans rien casser.

## La sécurité, avant tout le reste

Tu vas passer ce cours en simulation, où rien ne peut mal tourner. Mais si tu te retrouves un jour dans une pièce avec un vrai :

> warn: Un Go2 pèse environ 15 kg et bouge plus vite que tu ne le crois. Ce n'est pas un jouet, et il ne sait pas que tu es là si personne ne le lui a dit.

> do: Recule. Sache où est le bouton d'arrêt avant qu'il démarre. Une seule personne -- une seule -- lui donne des ordres.

> don't: Ne mets jamais la main près d'une articulation quand il est allumé. Une articulation immobile pousse quand même très fort.

## Le projet dont tu apprends

Ce cours n'est pas fait d'exemples inventés. Il est construit à partir d'un vrai projet de recherche sur un vrai Go2, et tu vas rencontrer son vrai code :

- **les angles** que le robot utilise pour se lever
- **la règle de commande** que suivent ses moteurs, en une ligne de maths
- **le motif de marche**, et l'histoire de celui, plus rapide, qui tombait sans arrêt

> tip: Tout ce que tu écris tourne d'abord en simulation. Ce n'est pas la version débutant : c'est comme ça que travaillent les équipes de robotique professionnelles, parce qu'une erreur sur du vrai matériel est lente et coûteuse. La simulation, c'est là où tu as le droit de te tromper gratuitement.`,
  },

  "ph-2": {
    en: `Before a robot can do anything intelligent, it has to know what is actually going on around it -- and unlike you, it starts out knowing nothing. It has no eyes unless you give it a camera, no sense of distance unless you give it a range sensor, no sense of touch unless you give it something that can feel contact. Every one of a robot's senses is a piece of hardware someone chose to add, and every choice is a trade-off.

A camera gives rich detail -- colour, shape, texture -- which is exactly what you need to tell a red block from a blue one, or a cup from a bottle. But a camera is easily confused by bad lighting, and turning a picture into "there is an object at this exact position" takes real computation. A distance sensor (like the LiDAR or ultrasonic sensors real robots use) is the opposite: it tells you almost nothing about what an object looks like, but it tells you exactly how far away it is, instantly and reliably, which is precisely what you need to avoid walking into it. A touch or force sensor tells the robot something a camera never can: whether it is actually gripping something, and how hard -- which is the only way to hold an egg without either dropping it or crushing it.

Notice the pattern: no single sensor tells the whole story. A real robot almost always combines several, each covering the gap the others leave. This is called sensor fusion, and it's one of the first things that separates a toy robot from a working one.

There's a second problem hiding underneath all of this: every sensor lies a little. A camera image has noise in low light. A distance sensor has a small margin of error. Nothing a robot measures is ever perfectly exact -- so any control logic you write later has to expect slightly wrong numbers, not perfect ones. That single idea -- design for imperfect information, not perfect information -- is something you'll come back to constantly in this track.

In the simulator, your robot carries an onboard camera, which is the sensor you will work with most directly, because it's what lets a robot tell one object apart from another -- the foundation the vision lessons later in this track are built on.`,
  },

  "ph-3": {
    en: `## The other half of the loop

A sensor tells the robot what is happening. An **actuator** is how it does something about it. On the Go2 there are twelve of them -- one per joint, three per leg -- and each is a small electric motor.

You do not tell a motor "move". You tell it **an angle you want**, and it pushes until it gets there.

## Push, then brake

Here is the rule those twelve motors follow. This is one real line from the research project:

\`\`\`python
# waste_sorting/robot.py
tau = KP * (target - q) - KD * qd
\`\`\`

Read it in two halves:

- \`KP * (target - q)\` -- **how far off am I?** The further the joint is from where you want it, the harder it pushes. \`KP\` is 200 in this project.
- \`- KD * qd\` -- **how fast am I already moving?** Subtract some push if it is moving quickly, so it slows down as it arrives. \`KD\` is 6.

That is called **PD control**, and almost every robot in the world uses some version of it.

> tip: The braking half is the part beginners leave out. Without it the leg races to the target, sails straight past, comes back, overshoots again -- and wobbles forever. The D is what makes it *arrive* instead of *oscillate*.

## What "too strong" and "too weak" look like

- Gains too low: the legs sag. The robot tries to stand and slowly sinks under its own weight.
- Gains too high: the robot shakes, buzzes, and can throw itself over.

> warn: In the real project a bug once left the turning motion running on the soft standing gains (80 and 4) instead of the walking gains (200 and 6). The robot looked like it was *dragging* its feet, and a lot of time went into rewriting the geometry before anyone checked the gains. The maths was never wrong. The numbers were.

## The angles for standing

\`\`\`python
# waste_sorting/scene.py
LEG_STAND = (0.0, 0.9, -1.8)   # hip, thigh, knee -- in radians
\`\`\`

Three numbers, sent to all four legs. The hip stays at 0 so the leg points straight down the side of the body. The thigh goes forward a little, the knee folds back -- and that shape, repeated four times, holds a 15 kg robot off the floor.

Next you will send exactly those numbers yourself, and watch it stand up.`,
    fr: `## L'autre moitié de la boucle

Un capteur dit au robot ce qui se passe. Un **actionneur**, c'est ce avec quoi il agit. Le Go2 en a douze -- un par articulation, trois par patte -- et chacun est un petit moteur électrique.

On ne dit pas à un moteur « bouge ». On lui dit **l'angle qu'on veut**, et il pousse jusqu'à l'atteindre.

## Pousser, puis freiner

Voici la règle que suivent ces douze moteurs. C'est une vraie ligne du projet de recherche :

\`\`\`python
# waste_sorting/robot.py
tau = KP * (target - q) - KD * qd
\`\`\`

Lis-la en deux moitiés :

- \`KP * (target - q)\` -- **à quelle distance suis-je ?** Plus l'articulation est loin de l'angle voulu, plus elle pousse fort. \`KP\` vaut 200 dans ce projet.
- \`- KD * qd\` -- **à quelle vitesse est-ce que je bouge déjà ?** On enlève de la poussée si ça va vite, pour ralentir en arrivant. \`KD\` vaut 6.

Ça s'appelle la **commande PD**, et presque tous les robots du monde en utilisent une version.

> tip: La moitié « freinage » est celle que les débutants oublient. Sans elle, la patte fonce vers la cible, la dépasse, revient, la dépasse encore -- et oscille sans fin. C'est le D qui la fait *arriver* au lieu d'*osciller*.

## À quoi ressemblent « trop fort » et « trop faible »

- Gains trop bas : les pattes s'affaissent. Le robot essaie de se lever et s'enfonce lentement sous son propre poids.
- Gains trop hauts : le robot tremble, vibre, et peut se renverser tout seul.

> warn: Dans le vrai projet, un bug a un jour laissé le demi-tour tourner avec les gains doux de la position debout (80 et 4) au lieu de ceux de la marche (200 et 6). Le robot avait l'air de *traîner* les pieds, et beaucoup de temps est passé à réécrire la géométrie avant que quelqu'un vérifie les gains. Les maths n'ont jamais été fausses. Les nombres, si.

## Les angles pour se tenir debout

\`\`\`python
# waste_sorting/scene.py
LEG_STAND = (0.0, 0.9, -1.8)   # hanche, cuisse, genou -- en radians
\`\`\`

Trois nombres, envoyés aux quatre pattes. La hanche reste à 0 pour que la patte pointe droit vers le bas le long du corps. La cuisse avance un peu, le genou se replie -- et cette forme, répétée quatre fois, tient un robot de 15 kg au-dessus du sol.

Ensuite, tu enverras toi-même exactement ces nombres, et tu le regarderas se lever.`,
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
