/**
 * Print docs/platform-guide.html to a PDF.
 *
 * The guide's CSS is already print-first -- A4 pages, a figure and its caption
 * kept together -- so this asks Chromium to do exactly what a browser's
 * Print-to-PDF would, with no scaling surprises and no headers stamped over
 * the content.
 *
 * printBackground matters: the browser-chrome frame around every figure and
 * the page's tinted panels are backgrounds. Without it the guide prints as
 * screenshots floating on white with none of the framing that tells the
 * reader they are looking at a screen.
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const localLibs = path.join(process.cwd(), ".browserlibs", "usr", "lib", "x86_64-linux-gnu");
if (fs.existsSync(localLibs)) {
  process.env.LD_LIBRARY_PATH = [localLibs, process.env.LD_LIBRARY_PATH].filter(Boolean).join(":");
  process.env.PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS = "1";
}

const src = path.resolve("docs/platform-guide.html");
const out = path.resolve("docs/AxiLearn-platform-guide.pdf");

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(`file://${src}`, { waitUntil: "load" });

// Every figure must have actually decoded before printing. A PNG that is still
// loading prints as a blank frame, and the whole point of the guide is the
// pictures.
const missing = await page.evaluate(async () => {
  const imgs = [...document.images];
  await Promise.all(imgs.map((i) => (i.complete ? null : i.decode().catch(() => null))));
  return imgs.filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.getAttribute("src"));
});
if (missing.length) {
  console.log(`  ${missing.length} image(s) did not load:`);
  for (const m of missing) console.log(`    ${m}`);
}

await page.pdf({
  path: out,
  format: "A4",
  printBackground: true,
  preferCSSPageSize: true,
  margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
});
await browser.close();

const kb = Math.round(fs.statSync(out).size / 1024);
console.log(`  ${path.relative(process.cwd(), out)}  ${kb} KB`);
