# AxiLearn

A step-by-step learning platform for teenagers and beginners, in English and
French. Three tracks — **Physical AI** (robotics), **AI & Machine Learning**,
**Game Development** — presented as a game-style mission map rather than a list
of chapters.

Built with Next.js (App Router) + TypeScript + Tailwind, on Firebase Auth and
Firestore, entirely on free tiers.

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:3000 — you land on `/en` or `/fr` depending on your
browser's language.

Firebase config goes in `.env.local` (copy `.env.example`). Without it the site
still runs: content falls back to the curriculum bundled in the repo, and
sign-in is disabled rather than broken.

## How content works

Content lives in Firestore, one document per track with its lessons inside it,
and is edited from `/admin` in the browser. No lesson text lives in the code.

- **Published vs draft.** Only published tracks and lessons reach learners; a
  draft is visible to admins alone. This is enforced by `firestore.rules`, not
  by the app.
- **The map lays itself out.** A lesson's position on the mission map is derived
  from its order in the track. There are no coordinates to edit — reorder a
  lesson and its node moves.
- **English is required, French is optional.** Anything untranslated shows the
  English text, so a lesson can go live the day it is written.
- **Videos are embedded, never uploaded.** A lesson stores a YouTube ID; free
  hosting has no room for video files.
- **Reads are cached for 60 seconds**, which is what keeps the platform inside
  Firestore's free 50k reads a day. Edits therefore appear on the public site
  within about a minute.
- **If Firestore is empty or unreachable**, the repo curriculum
  (`src/content/repo-content.ts`) is served instead, so the site is never blank.

### Setting up the CMS on a fresh project

Three steps, in order:

1. **Deploy the rules.** Copy `firestore.rules` into the Firebase console
   (Firestore Database → Rules → Publish). Nothing else protects drafts or
   stops a learner writing content.
2. **Make yourself an admin.** In the console: Firestore → `users` → your
   document → set `role` to `admin`. This cannot be done from the app on
   purpose — the rules forbid a browser from changing its own role, which is
   what stops anyone promoting themselves.
3. **Press "Import starter content"** on `/admin`. It copies the bundled
   curriculum into Firestore as the starting point. Running it again skips
   tracks that already exist, so it cannot wipe your edits.

## Layout

```
src/
  app/[locale]/          pages; every route is language-prefixed
    admin/               the CMS (dashboard, track editor, lesson editor)
  components/            UI, including the mission map and the robot mascot
  content/
    schema.ts            how content is stored, and how it becomes page shapes
    store.ts             server-side reads (published only, cached)
    admin-content.ts     admin reads and writes (drafts included)
    repo-content.ts      the bundled curriculum: fallback and import seed
    roadmap-data.ts      page-facing types and the map layout function
  i18n/                  typed EN/FR messages; a missing key fails the build
  lib/                   Firebase, auth, theme
firestore.rules          the actual security boundary
```

## Security notes

- The `NEXT_PUBLIC_FIREBASE_*` values are public by design — every Firebase web
  app ships them. Protection comes from `firestore.rules`.
- There is **no service-account key** anywhere in this project, and there should
  not be. Seeding runs as the signed-in admin instead.
- `AuthGate` and the admin role check are UX, not security. A determined visitor
  can reach any page; what they cannot do is read a draft or write content.
