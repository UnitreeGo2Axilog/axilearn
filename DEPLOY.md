# Deploying AxiLearn

The app is a standard Next.js 16 App Router project talking to Firebase from
the browser and, for public content reads, from the server over Firestore's
REST API. There is nothing to run yourself: no server process to manage, no
service-account key, no Cloud Functions, no billing plan to upgrade.

Recommended host is **Vercel** — it builds Next.js with no configuration, the
free tier covers this comfortably, and Firebase stays exactly as it is today.
Firebase App Hosting also works if your supervisor wants everything in one
console; the steps below only differ in step 2.

---

## Before you start

You need:

- push access to `https://github.com/UnitreeGo2Axilog/axilearn.git`
- the Firebase console for the `axiloglearn` project
- the six values from **Project settings → Your apps → Web app**

You do **not** need a service-account key. If anyone asks you to paste one
into a deploy form, that is the wrong form.

---

## 1. Push the branch

```bash
git push origin main
```

---

## 2. Create the Vercel project

1. vercel.com → **Add New… → Project** → import the GitHub repo.
2. Framework preset detects **Next.js**. Leave build command, output
   directory and install command untouched.
3. Under **Environment Variables**, add all six, for *all three* environments
   (Production, Preview, Development):

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   NEXT_PUBLIC_FIREBASE_PROJECT_ID
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
   NEXT_PUBLIC_FIREBASE_APP_ID
   ```

4. **Deploy.**

> **The one that catches everybody.** A missing environment variable does not
> fail the build. The site comes up looking fine, serving the repo's fallback
> curriculum, with sign-in broken and every CMS edit invisible. If the deploy
> is green but the content looks like a fresh clone, this is why — check the
> variables before you check anything else.

These values are public. They ship in the browser bundle on every Firebase
app; the security boundary is `firestore.rules`, not secrecy.

---

## 3. Let Firebase accept the new domain

**Sign-in fails on the deployed site until you do this**, with an
`auth/unauthorized-domain` error in the browser console.

Firebase console → **Authentication → Settings → Authorized domains → Add
domain**, and add:

- `axilearn.vercel.app` (or whatever Vercel named it)
- any custom domain you attach later

`localhost` is already there, which is why development never hit this.

---

## 4. Publish the security rules from the repo

Rules have been maintained by pasting into the console. They live in
`firestore.rules` here, so publish them from the file instead — the file is
reviewed, versioned, and cannot drift from what the code expects:

```bash
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules
```

`.firebaserc` already points at the `axiloglearn` project.

Do this whenever `firestore.rules` changes. It is also the fix if reads start
returning empty on the deployed site while working locally.

---

## 5. Seed the content

Sign in as the admin on the deployed site, open `/admin`, press **Import
starter content**. Firestore is shared between local and production, so if
you have already imported, there is nothing to do.

---

## 6. Check it actually works

Open the deployed URL and confirm, in this order:

- [ ] home shows **four** track cards — Python Basics, Physical AI, ML, Game Dev
- [ ] sign in works (this is step 3 if it doesn't)
- [ ] a lesson opens and its quiz marks it complete
- [ ] `/en/challenges/python-primer` lists 12 problems, `/physical-ai` lists 6
- [ ] a challenge runs Python — **first run takes 10–20 seconds**, it is
      downloading ~10 MB of Pyodide from jsdelivr; after that it is instant
- [ ] `/fr` renders French chrome
- [ ] the admin dashboard lists tracks and students

---

## Things worth knowing

**Python runs in the browser, not on your server.** Pyodide is fetched from
`cdn.jsdelivr.net` by a Web Worker. No server-side execution, no sandbox to
secure, no cost per run. If you ever add a Content-Security-Policy, it must
allow `cdn.jsdelivr.net` or every challenge stops working.

**Content reads are cached for ~60 seconds** server-side. After a CMS edit,
the public pages can lag by up to a minute. That is deliberate, not a bug.

**Preview deployments** point at the same Firestore as production. A branch
preview writing content writes it for real. There is only one database.

**If pages feel slow**, check which region your Firestore database lives in
(Firebase console → Firestore → the location under the database name) and pin
Vercel's function region to match, in Project Settings → Functions. The
default puts them on different continents.
