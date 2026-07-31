/*
 * Python execution, isolated in a Web Worker.
 *
 * This runs in a worker rather than on the main thread for one specific
 * reason: beginners write infinite loops. `while True:` is not an edge case
 * in a course teaching loops -- it is a rite of passage, and it will happen
 * on day one. Python running on the main thread cannot be interrupted by
 * JavaScript (it is a single synchronous WASM call), so a runaway loop there
 * freezes the entire tab: no output, no Run button, no way back except
 * closing it. In a worker, the main thread stays responsive and can simply
 * terminate() the whole worker and start a fresh one.
 *
 * Every run gets a FRESH global namespace, so a run only ever sees the code
 * currently in the editor -- never leftovers from a previous one. See the
 * comment at the call site for why that matters so much for a learner.
 *
 * Deliberately a plain classic worker in /public rather than a bundled
 * module worker: Pyodide's loader uses importScripts and expects to fetch its
 * own .wasm/.data assets at runtime from the same CDN path, which fights with
 * bundler asset rewriting. Serving this file as-is keeps that simple.
 *
 * Protocol (worker <- main):  { type: "run", id, code }
 *          (worker -> main):  { type: "ready" }
 *                             { type: "result", id, stdout, error }
 */

/* global importScripts, loadPyodide */

const PYODIDE_VERSION = "0.26.4";
const PYODIDE_CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

let pyodidePromise = null;

function getPyodide() {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      importScripts(`${PYODIDE_CDN}pyodide.js`);
      const pyodide = await loadPyodide({ indexURL: PYODIDE_CDN });
      return pyodide;
    })();
  }
  return pyodidePromise;
}

/**
 * The grading harness appended after a learner's code when checking a
 * challenge.
 *
 * Both sides of a test are Python EXPRESSIONS that get evaluated, not strings
 * compared -- so `[1, 2]` genuinely equals `[1, 2]`, and a test can check a
 * list, tuple, dict or float without any special handling here.
 *
 * Every name is prefixed `__axi_` because this shares one namespace with
 * whatever the learner wrote; a plain `results` or `tests` would collide with
 * an ordinary variable and produce a baffling failure in their own code.
 *
 * Each case is caught individually: one raising case reports as that case
 * failing, and the remaining cases still run. A learner deserves to see "3 of
 * 4 passed", not just the first thing that broke.
 */
function gradingHarness(tests) {
  const payload = JSON.stringify(JSON.stringify(tests));
  return `
import json as __axi_json

__axi_results = []
for __axi_t in __axi_json.loads(${payload}):
    try:
        __axi_actual = eval(__axi_t["call"])
        __axi_expected = eval(__axi_t["expected"])
        __axi_results.append({
            "ok": bool(__axi_actual == __axi_expected),
            "actual": repr(__axi_actual),
            "error": None,
        })
    except Exception as __axi_err:
        __axi_results.append({
            "ok": False,
            "actual": None,
            "error": type(__axi_err).__name__ + ": " + str(__axi_err),
        })

__axi_json.dumps(__axi_results)
`;
}

self.onmessage = async (event) => {
  const { type, id, code, tests } = event.data ?? {};
  if (type !== "run" && type !== "grade") return;

  let pyodide;
  try {
    pyodide = await getPyodide();
  } catch (err) {
    self.postMessage({
      type: "result",
      id,
      stdout: "",
      error: `Could not start Python: ${err?.message ?? err}`,
    });
    return;
  }

  // Collect print() output rather than letting it vanish into the worker's
  // console -- for a beginner, print IS the output, so it has to come back.
  let stdout = "";
  pyodide.setStdout({ batched: (text) => { stdout += text + "\n"; } });
  pyodide.setStderr({ batched: (text) => { stdout += text + "\n"; } });

  // A FRESH GLOBAL NAMESPACE FOR EVERY RUN. Without this, Pyodide reuses one
  // module-level globals dict across runs, so anything ever defined stays
  // defined: delete a function from the editor, run code that calls it, and
  // it still works, because the definition from the previous run is still
  // sitting in the interpreter. That is a genuinely harmful lie to tell
  // someone learning -- their program appears to depend on code that is no
  // longer in front of them, and a fixed typo or a renamed variable keeps
  // resolving to the stale version. Each run now starts from nothing, so
  // what runs is exactly what is in the editor.
  const namespace = pyodide.toPy({});
  try {
    if (type === "grade") {
      // The learner's code and the harness run together in ONE namespace, so
      // the harness can call the function they just defined.
      const raw = await pyodide.runPythonAsync(code + "\n" + gradingHarness(tests ?? []), {
        globals: namespace,
      });
      self.postMessage({ type: "result", id, stdout, error: null, cases: JSON.parse(raw) });
      return;
    }
    await pyodide.runPythonAsync(code, { globals: namespace });
    self.postMessage({ type: "result", id, stdout, error: null });
  } catch (err) {
    // Python tracebacks arrive as the error message; send the last line,
    // which is the part that actually names what went wrong, plus keep
    // whatever was printed before the failure -- that context is often the
    // most useful thing for working out where it broke.
    const message = String(err?.message ?? err);
    const lines = message.trim().split("\n");
    const summary = lines[lines.length - 1] || message;
    self.postMessage({ type: "result", id, stdout, error: summary, cases: null });
  } finally {
    // PyProxy objects are not garbage collected from JS -- an undestroyed
    // namespace leaks the whole run's Python objects on the WASM heap.
    namespace.destroy();
  }
};

// Warm the runtime as soon as the worker exists, so the first Run is not also
// the first 10MB download. A failure here has to be reported, not swallowed:
// if the CDN is blocked or the network is down, the main thread would
// otherwise wait forever for a "ready" that is never coming.
getPyodide().then(
  () => self.postMessage({ type: "ready" }),
  (err) => self.postMessage({ type: "load-error", message: String(err?.message ?? err) }),
);
