# AxiLearn — architecture and working notes

Read this before changing anything. It is written for two readers:

- **an engineer picking the project up**, who needs to know how it fits together and which decisions are load-bearing;
- **an AI agent being given context**, which needs the constraints stated plainly so it does not "improve" something that is deliberate.

Everything here is what the code actually does, not what was planned. Where a
decision looks odd, the reason is given — usually because the obvious
alternative was tried and broke something.

---

## 1. What this is

A bilingual (EN/FR) learning platform for teenagers, built as an Axilog
internship deliverable. Four tracks on the home page:

| track | id | owner | state |
|---|---|---|---|
| Python Basics | `python-primer` | this project | complete — 9 chapters, 28 challenges, exam |
| Physical AI | `physical-ai` | this project | 9 lessons + a 5-part robot lab |
| AI & Machine Learning | `ml-ai` | supervisor | empty |
| Game Development | `game-dev` | supervisor | empty |

Live at `axilearn.vercel.app`. The **audience is about 12 years old**, and
that is a design constraint, not a footnote — it decides vocabulary, how much
is asked of the reader at once, and why the tone rules below exist.

---

## 2. Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript 5**
- **Tailwind 4**
- **Firebase** — Auth and Firestore
- **Pyodide 0.26.4** — CPython in WebAssembly, runs learner code in the browser
- **@mujoco/mujoco 3.11.0** — Google DeepMind's official MuJoCo WASM build
- **three.js** — the robot viewport, and the challenges page background
- **Playwright** — screenshots and end-to-end checks
- Hosting: **Vercel**. No backend of our own. Nothing the learner writes ever
  reaches a server.

Roughly: 26 routes, 42 components, 24 lib modules, 13 content modules, ~1,066
translated strings, 14 Firestore collections.

---

## 3. The rules that must not be broken

Violating any of these produces bugs that look like something else, which is
why they are listed first.

### 3.1 Never write a user-visible string inside a component

Every string goes in `src/i18n/messages.ts` and is read through `useT()` or
`getT()`. The key type is generated from the English block, so **a missing
French key fails the build** — that is intentional and is the only thing
keeping the French half honest.

Two blocks live in one object, `en` first then `fr`. If you insert a key by
string replacement, insert it into **both** blocks and check the count — a
naive `replace(..., 1)` hits the English block twice and produces duplicate
keys (TS1117).

### 3.2 Firestore rules are not filters

A `where` clause is not optional decoration. If a rule inspects a field, the
**query must constrain that field**, or the whole query is denied — not
filtered down, denied. Any list query has to be written with its rule open
beside it.

Related: **reading a document that does not exist is denied** when the rule
requires `resource != null`. A read-before-write on a first-time document
fails for that reason and looks like a permissions bug.

### 3.3 Content lives in Firestore; the repo only seeds it

This is the single most confusing thing in the project and it has cost time
more than once. See §5.

### 3.4 `AuthGate` is a UX gate, not a security boundary

It hides pages from signed-out users. The actual boundary is
`firestore.rules`. Nobody can grant themselves admin from the browser: `role`
is fixed at account creation and pinned on update.

### 3.5 The learner's code never leaves the browser

Pyodide and MuJoCo both run client-side. There is no code-execution endpoint,
and adding one would change the platform's security posture completely.

---

## 4. Where things live

```
src/
  app/[locale]/          routes; every page is under a locale segment
    track/[trackId]      the briefing: three doors — course, challenges, lab
    roadmap/[trackId]    the lesson map
    lesson/[lessonId]    reading + quiz + optional code sandbox
    challenges/[trackId] exercises, difficulty picker first
    go2rl/[trackId]      the robot lab: map, then one page per part
    admin/...            CMS, roster, homework, notifications, messages
  components/            42 components; admin/ and roadmap/ are grouped
  content/               the curriculum AS CODE (see §5)
  lib/                   runtime, progress, auth, certificate, markup parser
  i18n/messages.ts       every string, both languages
public/
  pyodide-worker.js      Python runner (classic worker)
  sim-worker.js          robot simulator (module worker: Pyodide + MuJoCo)
  mujoco/                mujoco.js + mujoco.wasm, served statically
  robot/                 five clips + posters from the go2_rl project
scripts/
  screenshots.mjs        Playwright capture for the guide
  guide-pdf.mjs          prints docs/platform-guide.html to PDF
```

### Content modules worth knowing

| file | what it holds |
|---|---|
| `roadmap-data.ts` | tracks, their lessons, order, colours, `repoRevision` |
| `lesson-bodies.ts` | lesson prose, both languages, in template literals |
| `lesson-quizzes.ts` | end-of-lesson QCMs |
| `challenges.ts` | 28 Python challenges + exam, 6 physical-ai |
| `sim-parts.ts` | the five robot-lab parts |
| `go2-model.ts` | the robot, as a MuJoCo XML string |
| `robot-glossary.ts` | ℹ term definitions, one source |
| `admin-content.ts` | the importer (see §5) |

> **Escaping trap.** `lesson-bodies.ts` stores prose in backtick template
> literals, so every backtick inside the content is written `` \` ``. A
> programmatic edit that inserts a raw backtick **terminates the literal and
> breaks the file**. This has happened twice. Escape in both the search and
> the replacement, and run `tsc` immediately.

---

## 5. The content pipeline — read this twice

The repo is **not** what the site shows.

```
src/content/*.ts  ──[ Import button on /admin ]──▶  Firestore  ──▶  the site
     (seed)                                        (the truth)
```

- On first import, repo content is copied into Firestore.
- After that, **Firestore wins**. Editing `lesson-bodies.ts` changes nothing
  a learner sees until somebody presses **"Re-import lesson text from the
  repo"** on `/en/admin`.
- The repo is used as a *fallback* only when Firestore has no document for
  that lesson — which is why a brand-new lesson appears immediately and an
  edited one does not.

This asymmetry is the cause of a whole class of "my fix did not work"
confusion. If a change is in the repo, `tsc` is clean, and the site still
shows the old thing, **it is almost always this**.

Mechanics:

- `repoRevision` on a track triggers a refresh of its lessons and order.
- Bodies are **fingerprinted** (FNV-1a) so the importer can tell a changed
  body from an unchanged one.
- Challenges carry `fromRepo`, which lets the importer retire ones that no
  longer exist in the repo.
- The importer reconciles `order` for **every** repo track on every import —
  it used to only touch bumped tracks, and two tracks tied at `order: 1` and
  sorted arbitrarily.

**Deploy order matters.** The Import button reads the curriculum from the
*deployed build*. Pressing it before the push has deployed re-imports the old
content. Always: push → wait for Vercel → import.

---

## 6. Internationalisation

- Locale is a route segment: `/en/...`, `/fr/...`.
- Content types use `Localized = Record<Locale, string>`. Do not invent a
  second bilingual type.
- Hand-rolled rather than a library: two locales, a simple route shape, and
  Next 16 was new enough that library compatibility was a risk not worth
  taking.
- **Verify translations structurally, not by eye.** Parse both languages and
  compare block counts — an EN body with 14 blocks and an FR body with 11
  means something was dropped. A verification pass once reported "2 failures"
  while having read none of the 50 French snippets.

---

## 7. Auth, roles and privacy

- Firebase Auth; `users/{uid}` carries `displayName`, `role`, `blocked`.
- `role` is set at creation and **pinned on update for everyone**. `blocked`
  is pinned for the owner but writable by an admin.
- `NEXT_PUBLIC_FIREBASE_*` values are public by design. Protection comes from
  the rules, not from hiding the config.
- `.env.local` is gitignored; `.env.example` is committed with empty values
  (it needed an explicit `!.env.example` because `.env*` swallowed it).
- The service-account key must never be committed, pasted, or shared.

**Open safeguarding questions, not yet answered:**

- The platform has a **public discussion room used by minors** with no rate
  limit and no report button.
- Certificates carry real names.
- No age gate or parental-consent flow exists.

These are recorded here because they are decisions for a person, not
something to quietly implement.

---

## 8. The robot lab (`go2rl`) — the interesting part

A Unitree Go2 that a learner drives with Python, entirely in the browser.
Five parts: stand up → walk forward → go backward → turn → walk up and stop.

### 8.1 Why it works at all

MuJoCo ships **two** distributions. The Python package cannot run in a
browser — it is native code, and so are PyTorch and the CycloneDDS stack the
research project uses. But DeepMind also publish an **official WebAssembly
build of the engine itself** (`@mujoco/mujoco`, Apache-2.0). That is what
runs here: same solver, same equations, driven through JS bindings instead of
the Python package.

So: the *physics* is real and identical. What was ported is the *control
logic* on top.

**The original `go2_rl` code can never run here**, for two independent
reasons: native binaries do not execute in WASM, and DDS needs raw UDP that
browsers will never grant. This is not a size problem — 442 of that project's
imports are robot communication that is meaningless without a robot.

### 8.2 Record, then replay

The learner's Python is **synchronous**. `robot.stand_up()` must return
before the next line runs, so there is no moment during their code when the
worker could yield for a frame to be painted.

Therefore: physics runs flat out (~20× real time with Python in the loop),
recording a pose every 1/60 s, and the page animates the finished trajectory
at normal speed.

Consequences, all good:

- replay and scrubbing are free;
- nothing is drawn in the worker, so **no OffscreenCanvas and no Safari
  question**;
- a slow laptop shows a slower animation, never wrong physics.

### 8.3 The pieces

```
src/content/go2-model.ts   the robot as an XML string (~6 KB, no mesh files)
public/sim-worker.js       Pyodide + MuJoCo in ONE module worker
src/lib/sim-runner.ts      main-thread client: init / run / check / reset
src/components/
  sim-notebook.tsx         cells, TODO/hint/solution, verdict, video
  robot-viewport.tsx       three.js playback of the recorded trajectory
  go2rl-map.tsx            the five parts, sequential unlock
  go2rl-part-view.tsx      one part, contents menu, prev/next
```

The robot is **boxes and capsules**, and that is architectural as much as
visual: `MjModel.from_xml_string` takes the whole model as a string, so a
mesh-free robot has **no asset files at all**. Its dimensions are the real
Unitree ones (thigh and calf both 0.213 m, hips ±0.1934/±0.0465, real joint
limits) — only the skin is simplified.

### 8.4 The `robot` API

Written for someone nine Python lessons old. `stand_up`, `lie_down`, `wait`,
`set_leg(hip=, thigh=, knee=)`, `set_all_legs`, `target`, `tick`, and the
read-only `height`, `x`, `y`, `yaw`, `tilt`, `distance`, `is_standing`.

`knee` rather than the model's `calf` because it is a word a teenager already
owns. `tick(0.02)` is 50 Hz — the same control rate as `_SUBSTEPS = 10` at
`dt = 0.002` in the research project, not an invented number.

### 8.5 Numbers taken from the real project

| value | source |
|---|---|
| `LEG_STAND = (0.0, 0.9, -1.8)` | `waste_sorting/scene.py` |
| `_KP, _KD = 200.0, 6.0` | `waste_sorting/robot.py` |
| `tau = KP*(target-q) - KD*qd` | `waste_sorting/robot.py` |
| fallen below `0.18` m | `waste_sorting/robot.py` |
| phases `FL 0, RR .25, FR .5, RL .75`, duty `0.75` | `foot_trajectory.py` |

The gait constants that make it *walk in this simplified model* (step 0.10,
lift 0.30, freq 0.7) were **tuned by sweeping in the real engine**, not
copied. Keep it that way: if you change the model, re-sweep.

### 8.6 Lab progress and certificates

Lab completions are written to the **same `progress` collection as lessons**,
with the part id (prefix `sp-`) in the `lessonId` field. The rules already
permit a learner to write their own progress record, so this needs no rules
deploy.

It was localStorage first. That stopped being acceptable the moment the
certificate depended on it — localStorage is forged by opening devtools and
lost by changing computer.

**Cost of sharing the collection:** anything counting progress records raw
would count lab parts as lessons. Two places did; both now filter (use
`lessonsOnly()` from `lib/lab-progress.ts`). If you add a third counter,
filter it.

A certificate requires **all lessons AND all lab parts**. IDs are derived
from `uid + trackId`, never random, so a reprint matches the copy already
handed in.

---

## 9. Traps that actually cost time

Each of these was a real bug. They are listed because they are the kind that
look like something else.

**Numbers green, picture wrong.** A diagram reported 546 FPS and 19/19 geoms
while rendering a completely blank canvas — the camera was Y-up in a Z-up
world, and 180 frames ran in one synchronous task so nothing ever
composited. *Look at the screenshot, not the metric.*

**The physics silently stopped.** `tick(0.02)` is ten steps, and the frame
recorder fired on "every 8th step of this call" plus once at the end — three
frames per 1/50 s instead of one. That hit the 1200-frame cap after ~8 s, and
hitting the cap `return`ed early from the stepping loop. Short parts passed;
long ones froze mid-walk and every later reading was a lie.

**A check that passed the blank answer.** Part 5 graded `distance < 0.95`,
which walking blindly for the whole safety window satisfies by accident. The
exercise was grading a coincidence. *A checker must be tested with the wrong
answer, every time.*

**The message id that was never sent.** `send()` allocated an id, stored it
in `pending`, and posted the message without it. Every reply came back with
`id: undefined` and was dropped; the page sat on "loading…" forever. A failed
init also *resolved* instead of rejecting, so the silence was total.

**Two error states at once.** React mounts effects twice in development; the
first runner is disposed, its in-flight init rejects, and the component whose
*second* runner succeeded showed "this device cannot run the simulator" **and**
a working simulator side by side, each with its own copy of the video. Guard
async state with a `cancelled` flag.

**Stale-cache and stale-server.** `.next/cache` survives rebuilds and serves
old content; a test that `curl`s a port can connect to a *previous* run's
server and validate the wrong build. Kill ports explicitly.

**Sign errors are invisible in code.** The first gait fell over every time
because `knee = STAND_KNEE + LIFT` *straightens* the leg and pushes the foot
down. Folding it tighter is what lifts a foot. Only measurement found this.

---

## 10. How to verify things

Preference order: **measure > screenshot > read**.

```bash
npx tsc --noEmit          # must be clean
npx eslint src            # baseline is 25 errors; do not add to it
npm run build             # slow on a loaded box: 10-15 min
npm run screenshots       # ONLY=1-18 as a student, 19-26 as an admin
node scripts/guide-pdf.mjs
```

- Every Python example and challenge is executed through Pyodide with
  reference solutions before shipping — both that correct answers pass **and
  that stubs and wrong answers fail**.
- Firestore is queried directly with `curl` to tell a code bug from stale
  data.
- Camera and layout decisions are checked by **projecting geometry**, not by
  eye — two "obviously better" camera positions were both wrong.

---

## 11. What is not finished

- `firestore.rules` for homework, discussion, notifications and contact are
  written but **not published**; those features fail closed until they are.
- Lessons `ph-6`–`ph-9` have no lab parts, so the track tails off.
- `ph-1`'s first two quiz questions are English-only.
- ML and Game Dev tracks are empty (supervisor's).
- `docs/platform-guide.html` and its PDF predate the robot lab.
- The safeguarding questions in §7.

---

## 12. If you are an AI agent

Constraints, so you do not "fix" something deliberate:

- **Do not put content directly in components.** Strings → `messages.ts`,
  curriculum → `src/content`.
- **Do not assume the repo is the site.** §5. Check whether the thing you are
  changing is served from Firestore.
- **Do not make illustration code runnable.** Lesson code fenced ` ```python `
  gets a Run button; quoted research code uses ` ```pyshow ` and must not.
- **Do not simplify the record-then-replay design** into live streaming. §8.2.
- **Do not move lab progress out of the `progress` collection** without
  fixing every raw counter. §8.6.
- **Do not invent numbers.** Constants come from `go2_rl` or from a measured
  sweep. If you change the model, re-sweep and record what you measured.
- **Do not sign anything with a person's name.** The certificate is signed
  "AxiLearn" on purpose; a human name nobody signed makes it a forgery.
- **Test the wrong answer.** A checker that only passes the right answer is
  half-tested.
- **Say what you did not verify.** Several things here are verified by
  geometry or by parsing but not visually. Claiming otherwise is worse than
  leaving it open.

Tone rules for anything learner-facing: simple, not babyish — a
twelve-year-old spots condescension instantly. Short sentences. Real words.
The actual number wherever there is one.
