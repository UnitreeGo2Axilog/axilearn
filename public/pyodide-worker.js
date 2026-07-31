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

self.onmessage = async (event) => {
  const { type, id, code } = event.data ?? {};
  if (type !== "run") return;

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

  try {
    await pyodide.runPythonAsync(code);
    self.postMessage({ type: "result", id, stdout, error: null });
  } catch (err) {
    // Python tracebacks arrive as the error message; send the last line,
    // which is the part that actually names what went wrong, plus keep
    // whatever was printed before the failure -- that context is often the
    // most useful thing for working out where it broke.
    const message = String(err?.message ?? err);
    const lines = message.trim().split("\n");
    const summary = lines[lines.length - 1] || message;
    self.postMessage({ type: "result", id, stdout, error: summary });
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
