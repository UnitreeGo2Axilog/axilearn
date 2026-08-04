# Screenshots for the platform guide

All twenty-six are here.

## Two passes, not one

An admin can open every page, so one admin run captures all twenty-six without
a single error -- and gets several of them wrong. Staff do not see the track
cards on the home page, so figure 2 comes back showing the admin's own view
under a caption about the four tracks a student chooses between. Nothing fails;
it just quietly documents the wrong thing.

So: **1-18 as a student, 19-26 as an admin.**

    npm run screenshots    # add ONLY= and the login for each pass

    ONLY=1-18  AXI_EMAIL=student@... AXI_PASSWORD='...'  npm run screenshots
    ONLY=19-26 AXI_EMAIL=admin@...   AXI_PASSWORD='...'  npm run screenshots

`ONLY` takes a range, a single number, or a mix -- `ONLY=2,16-17` redoes just
the three home-page figures.

## The data is live

The pages are served locally but read the real Firestore, so the figures show
whatever the database holds at that moment. Import any pending content changes
BEFORE capturing, or the guide documents the old curriculum.

## First run

    npx playwright install chromium
    sudo npx playwright install-deps    # libnss3, libnspr4

Without root, extract those two into `.browserlibs/` instead -- the script
finds them there and needs no environment set up by hand.

Point `BASE` at a deployed URL to capture that instead of a local build.

## By hand

Same filenames, saved here. A window around 1280 x 800 gives the cleanest
crops, and the guide expects a signed-in view.

| # | file | page | what to show |
|---|---|---|---|
| 1 | `01-signing-in.png` | `/en/login` | Email or Google, in English or French. |
| 2 | `02-home-choose-a-track.png` | `/en` | The four tracks, each showing progress, challenges and certificate at a glance. |
| 3 | `03-track-briefing.png` | `/en/track/python-primer` | What the track teaches, who it is for, and how to succeed — before committing to it. |
| 4 | `04-the-mission-map.png` | `/en/roadmap/python-primer` | Every chapter as a node; finished ones cleared, the next one open, the rest locked. |
| 5 | `05-a-lesson.png` | `/en/lesson/pp-3` | Reading, diagrams and code the student can run and edit without leaving the page. |
| 6 | `06-diagram-and-output.png` | `/en/lesson/pp-4` | A flowchart of the logic, then the same program with what it prints. |
| 7 | `07-end-of-lesson-quiz.png` | `/en/lesson/pp-3` | A short check that awards the XP; a wrong answer explains itself and never blocks progress. |
| 8 | `08-challenges-pick-a-level.png` | `/en/challenges/python-primer` | Easy, Normal or Hard, chosen before any problem is shown. |
| 9 | `09-solving-a-challenge.png` | `/en/challenges/python-primer` | Problem, editorial and tutorial in tabs, with tests run in the browser. |
| 10 | `10-my-progress.png` | `/en/progress` | Level, streak, and four real numbers: XP, lessons, challenges, certificates. |
| 11 | `11-certificates.png` | `/en/certificates` | Earned ones open; locked ones say exactly what is left to do. |
| 12 | `12-saved-lessons.png` | `/en/bookmarks` | Anything the student starred, to come back to. |
| 13 | `13-homework.png` | `/en/homework` | What the teacher set, the deadline, and the answer sent back. |
| 14 | `14-discussion.png` | `/en/discussion` | One shared room for the whole platform, with replies and pasted code. |
| 15 | `15-ask-the-teacher.png` | `/en/contact` | A private thread between one student and the staff. |
| 16 | `16-notifications.png` | `/en` | A daily tip, plus anything waiting on the student. Open the bell. |
| 17 | `17-the-account-menu.png` | `/en` | Everything reachable from one place. Open the avatar menu. |
| 18 | `18-profile.png` | `/en/profile` | Badges, certificates, and the name and password the student can change. |
| 19 | `19-admin-dashboard.png` | `/en/admin` | Every track, its size, and whether students can see it. |
| 20 | `20-editing-a-track.png` | `/en/admin/track/python-primer` | Lessons, order and publication, all editable in the browser. |
| 21 | `21-writing-a-lesson.png` | `/en/admin/track/python-primer` | Text and quiz in both languages, English required and French optional. |
| 22 | `22-setting-homework.png` | `/en/admin/homework` | A brief, an optional file, and a deadline that defaults to 24 hours. |
| 23 | `23-marking.png` | `/en/admin/homework` | Every answer, flagged late or on time, with a reply box under each. |
| 24 | `24-daily-tips.png` | `/en/admin/notifications` | Short messages that rotate — one per day, one per week, or on a date. |
| 25 | `25-student-messages.png` | `/en/admin/messages` | Questions from students, the unanswered ones first. |
| 26 | `26-the-class.png` | `/en/admin/students` | Who is on the platform, how far they have got, and private notes. |
