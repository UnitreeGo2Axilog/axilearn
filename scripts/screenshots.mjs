/**
 * Capture the figures for docs/platform-guide.html.
 *
 * Almost every screen on AxiLearn sits behind sign-in, so this drives a real
 * browser through the real login form rather than trying to fake a session.
 * That is also why it needs an account: pass one in, or it can only reach the
 * home page and the login form.
 *
 *   BASE=http://localhost:3500 \
 *   AXI_EMAIL=... AXI_PASSWORD=... \
 *   node scripts/screenshots.mjs
 *
 * An ADMIN account captures the teaching screens too. A student account skips
 * them and says so -- a screenshot of the "access denied" panel would be
 * worse than a missing file.
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

/**
 * Chromium needs libnss3 and libnspr4, and installing them system-wide wants
 * sudo. If a local copy has been extracted into .browserlibs (see the README),
 * point the dynamic linker at it here rather than making every caller
 * remember an export -- the browser is spawned as a child process, so it
 * inherits whatever this sets.
 */
const localLibs = path.join(process.cwd(), ".browserlibs", "usr", "lib", "x86_64-linux-gnu");
if (fs.existsSync(localLibs)) {
  process.env.LD_LIBRARY_PATH = [localLibs, process.env.LD_LIBRARY_PATH].filter(Boolean).join(":");
  // The libraries are present, just not where Playwright's check looks.
  process.env.PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS = "1";
}

const BASE = process.env.BASE ?? "http://localhost:3500";
const OUT = path.join(process.cwd(), "docs", "screenshots");
const EMAIL = process.env.AXI_EMAIL;
const PASSWORD = process.env.AXI_PASSWORD;

/** id -> [file, path, action]. `action` runs before the shot when a screen
 *  only exists after a click (a menu, the bell). */
const SHOTS = [
  [1, "01-signing-in.png", "/en/login", null, "public"],
  [2, "02-home-choose-a-track.png", "/en", null, "student"],
  [3, "03-track-briefing.png", "/en/track/python-primer", null, "student"],
  [4, "04-the-mission-map.png", "/en/roadmap/python-primer", null, "student"],
  [5, "05-a-lesson.png", "/en/lesson/pp-3", null, "student"],
  [6, "06-diagram-and-output.png", "/en/lesson/pp-4", null, "student"],
  [7, "07-end-of-lesson-quiz.png", "/en/lesson/pp-3", "bottom", "student"],
  [8, "08-challenges-pick-a-level.png", "/en/challenges/python-primer", null, "student"],
  [9, "09-solving-a-challenge.png", "/en/challenges/python-primer?start=pp-c-3-easy", null, "student"],
  [10, "10-my-progress.png", "/en/progress", null, "student"],
  [11, "11-certificates.png", "/en/certificates", null, "student"],
  [12, "12-saved-lessons.png", "/en/bookmarks", null, "student"],
  [13, "13-homework.png", "/en/homework", null, "student"],
  [14, "14-discussion.png", "/en/discussion", null, "student"],
  [15, "15-ask-the-teacher.png", "/en/contact", null, "student"],
  [16, "16-notifications.png", "/en", "bell", "student"],
  [17, "17-the-account-menu.png", "/en", "menu", "student"],
  [18, "18-profile.png", "/en/profile", null, "student"],
  [19, "19-admin-dashboard.png", "/en/admin", null, "admin"],
  [20, "20-editing-a-track.png", "/en/admin/track/python-primer", null, "admin"],
  [21, "21-writing-a-lesson.png", "/en/admin/track/python-primer", "bottom", "admin"],
  [22, "22-setting-homework.png", "/en/admin/homework", null, "admin"],
  [23, "23-marking.png", "/en/admin/homework", "bottom", "admin"],
  [24, "24-daily-tips.png", "/en/admin/notifications", null, "admin"],
  [25, "25-student-messages.png", "/en/admin/messages", null, "admin"],
  [26, "26-the-class.png", "/en/admin/students", null, "admin"],
];

/** Firebase keeps a channel open, so "networkidle" never fires on a signed-in
 *  page. Wait for the document instead, then give the client a beat to render
 *  what it fetched. */
const settle = (p) => p.waitForTimeout(2500);
const GOTO = { waitUntil: "domcontentloaded", timeout: 45000 };

async function act(page, what) {
  if (what === "bottom") {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(600);
    await page.evaluate(() => window.scrollBy(0, -300));
  } else if (what === "bell") {
    await page.locator('button[aria-haspopup="menu"]').first().click().catch(() => {});
  } else if (what === "menu") {
    const buttons = page.locator('button[aria-haspopup="menu"]');
    await buttons.nth((await buttons.count()) - 1).click().catch(() => {});
  }
  await page.waitForTimeout(700);
}

if (!EMAIL || !PASSWORD) {
  console.log(
    "\n  No login given, so only the public pages can be captured.\n" +
    "  Set AXI_EMAIL and AXI_PASSWORD -- note the leading A on both.\n",
  );
}

let browser;
try {
  browser = await chromium.launch({ headless: true });
} catch (e) {
  console.log("\n  The browser would not start.\n");
  if (!fs.existsSync(localLibs)) {
    console.log("  Chromium needs two libraries this machine does not have. Either:");
    console.log("    sudo npx playwright install-deps");
    console.log("  or extract them locally, which needs no root -- see docs/screenshots/README.md\n");
  } else {
    console.log(`  ${String(e).split("\n")[0]}\n`);
  }
  process.exit(1);
}
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();

let role = "public";
if (EMAIL && PASSWORD) {
  await page.goto(`${BASE}/en/login`, GOTO);
  await page.locator('input[type="email"]').first().fill(EMAIL);
  await page.locator('input[type="password"]').first().fill(PASSWORD);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(4000);
  // The account menu only renders for a signed-in user, so its presence is
  // the honest test that the login actually took.
  const signedIn = (await page.locator('button[aria-haspopup="menu"]').count()) > 0;
  if (!signedIn) {
    console.log("  sign-in did not take -- capturing public pages only");
  } else {
    try {
      await page.goto(`${BASE}/en/admin`, GOTO);
      await settle(page);
      // Match what the guard actually says. The first version looked for
      // "denied", the panel says "You need an admin account", so every
      // student run was misread as admin and captured eight screenshots of
      // the refusal panel.
      const denied = await page
        .getByText(/admin account to open|compte admin pour ouvrir/i)
        .count();
      role = denied > 0 ? "student" : "admin";
    } catch {
      role = "student";
    }
    console.log(`  signed in as ${EMAIL} (${role})`);
  }
}

fs.mkdirSync(OUT, { recursive: true });
const rank = { public: 0, student: 1, admin: 2 };
let taken = 0, skipped = [];

for (const [n, file, url, action, needs] of SHOTS) {
  if (rank[needs] > rank[role]) { skipped.push(`${n} ${file}`); continue; }
  try {
    await page.goto(`${BASE}${url}`, GOTO);
    await settle(page);
    if (action) await act(page, action);
    await page.screenshot({ path: path.join(OUT, file) });
    taken++;
    console.log(`  ${String(n).padStart(2)}  ${file}`);
  } catch (e) {
    skipped.push(`${n} ${file} (${String(e).split("\n")[0].slice(0, 60)})`);
  }
}

await browser.close();
console.log(`\n  ${taken} captured, ${skipped.length} skipped`);
for (const s of skipped) console.log(`    skipped: ${s}`);
