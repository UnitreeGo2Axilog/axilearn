/**
 * The small markup a lesson body is written in.
 *
 * Bodies used to render as bare paragraphs -- split on blank lines, wrap each
 * in a <p>, done. That is enough for five paragraphs of prose and nothing
 * like enough for a course a twelve-year-old reads: no headings to break up a
 * wall of text, no code they can run, no picture of what a loop actually
 * does.
 *
 * It stays a STRING rather than becoming a structured document, deliberately.
 * The CMS edits bodies in a textarea, Firestore stores them as one field, and
 * both keep working untouched. A teacher writing a lesson types the same
 * things they would type in a chat message.
 *
 * Everything here is a pure function of text, which is what lets the whole
 * format be tested without a browser.
 */

export type Block =
  | { kind: "heading"; text: string }
  | { kind: "text"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "code"; code: string; runnable: boolean }
  | { kind: "callout"; tone: CalloutTone; text: string }
  | { kind: "flow"; steps: FlowStep[] }
  | { kind: "progout"; program: string; output: string };

export type CalloutTone = "tip" | "warn" | "do" | "dont";

/** One row of a flowchart, in the shape the Python for Everybody slides use. */
export interface FlowStep {
  kind: "step" | "ask" | "yes" | "no";
  text: string;
}

/**
 * The flat step list, grouped into what a reader actually sees: a spine of
 * steps, with each question owning the branches that hang off it.
 *
 * Kept separate from parsing so the written form stays as simple as possible
 * -- a teacher writes four lines in a row, not a nested structure.
 */
export type FlowNode =
  | { kind: "step"; text: string }
  | { kind: "decision"; question: string; yes: string[]; no: string[] };

export function groupFlow(steps: FlowStep[]): FlowNode[] {
  const out: FlowNode[] = [];
  for (const s of steps) {
    if (s.kind === "step") {
      out.push({ kind: "step", text: s.text });
      continue;
    }
    if (s.kind === "ask") {
      out.push({ kind: "decision", question: s.text, yes: [], no: [] });
      continue;
    }
    const last = out[out.length - 1];
    if (last && last.kind === "decision") last[s.kind].push(s.text);
    // A yes/no with no question above it is a typo; showing it as a plain
    // step is more useful than dropping it silently.
    else out.push({ kind: "step", text: s.text });
  }
  return out;
}

const CALLOUTS: Record<string, CalloutTone> = {
  tip: "tip",
  warn: "warn",
  do: "do",
  "don't": "dont",
  dont: "dont",
};

/**
 * Parse a body into blocks.
 *
 * The rules, all of which a teacher can hold in their head:
 *
 *   ## Heading
 *   - a bullet
 *   > tip: something helpful          (also warn:, do:, don't:)
 *   ```python  ... ```                a code block you can RUN
 *   ```text    ... ```                a code block you cannot
 *   ```flow    ... ```                a flowchart
 *
 * Anything else is a paragraph. Blank lines separate blocks.
 */
export function parseLessonBody(body: string): Block[] {
  const blocks: Block[] = [];
  const lines = body.replace(/\r\n/g, "\n").split("\n");

  let i = 0;
  let paragraph: string[] = [];
  let bullets: string[] = [];

  const flushParagraph = () => {
    const text = paragraph.join(" ").trim();
    if (text) blocks.push({ kind: "text", text });
    paragraph = [];
  };
  const flushBullets = () => {
    if (bullets.length) blocks.push({ kind: "list", items: bullets });
    bullets = [];
  };
  const flushAll = () => {
    flushParagraph();
    flushBullets();
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      flushAll();
      i++;
      continue;
    }

    // ``` fenced blocks
    if (trimmed.startsWith("```")) {
      flushAll();
      const lang = trimmed.slice(3).trim().toLowerCase();
      const collected: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        collected.push(lines[i]);
        i++;
      }
      i++; // step past the closing fence
      const content = collected.join("\n").replace(/^\n+|\n+$/g, "");

      if (lang === "flow") blocks.push({ kind: "flow", steps: parseFlow(content) });
      else if (lang === "progout") {
        // "the program, and what it printed" -- the pairing the Python for
        // Everybody slides put side by side, split on a --- line.
        const at = content.indexOf("\n---");
        const program = at >= 0 ? content.slice(0, at) : content;
        const output = at >= 0 ? content.slice(content.indexOf("\n", at + 1) + 1) : "";
        blocks.push({ kind: "progout", program: program.trim(), output: output.trim() });
      }
      // `python` gets a Run button; anything else is shown and not run.
      // `pyshow` exists for illustrations -- a line of real robot code quoted
      // to be READ. Those were fenced as `python`, so they got a Run button
      // and a NameError, which teaches a beginner that the platform is broken
      // rather than that the line is an example.
      else blocks.push({ kind: "code", code: content, runnable: lang === "python" || lang === "py" });
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushAll();
      blocks.push({ kind: "heading", text: trimmed.slice(3).trim() });
      i++;
      continue;
    }

    if (trimmed.startsWith("- ")) {
      flushParagraph();
      bullets.push(trimmed.slice(2).trim());
      i++;
      continue;
    }

    if (trimmed.startsWith(">")) {
      flushAll();
      const rest = trimmed.slice(1).trim();
      const at = rest.indexOf(":");
      const label = at > 0 ? rest.slice(0, at).trim().toLowerCase() : "";
      const tone = CALLOUTS[label];
      blocks.push({
        kind: "callout",
        tone: tone ?? "tip",
        text: tone ? rest.slice(at + 1).trim() : rest,
      });
      i++;
      continue;
    }

    flushBullets();
    paragraph.push(trimmed);
    i++;
  }

  flushAll();
  return blocks;
}

/**
 * A flowchart, written as one instruction per line:
 *
 *   step: x = 5
 *   ask: x < 10 ?
 *   yes: print("Smaller")
 *   step: print("Finis")
 *
 * A line with no prefix is a step, so the quickest possible diagram is just a
 * list of lines.
 */
export function parseFlow(text: string): FlowStep[] {
  const out: FlowStep[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const at = line.indexOf(":");
    const head = at > 0 ? line.slice(0, at).trim().toLowerCase() : "";
    if (head === "step" || head === "ask" || head === "yes" || head === "no") {
      out.push({ kind: head, text: line.slice(at + 1).trim() });
    } else {
      out.push({ kind: "step", text: line });
    }
  }
  return out;
}

/**
 * Inline marks inside a paragraph: **bold** and `code`.
 *
 * Returned as pieces rather than HTML, so nothing ever builds markup from a
 * string a teacher typed. A lesson body is not a place to introduce an
 * injection hole.
 */
export type Inline = { kind: "plain" | "bold" | "code"; text: string };

export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    const at = m.index ?? 0;
    if (at > last) out.push({ kind: "plain", text: text.slice(last, at) });
    const token = m[0];
    if (token.startsWith("**")) out.push({ kind: "bold", text: token.slice(2, -2) });
    else out.push({ kind: "code", text: token.slice(1, -1) });
    last = at + token.length;
  }
  if (last < text.length) out.push({ kind: "plain", text: text.slice(last) });
  return out;
}
