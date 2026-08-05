/**
 * The robot simulator: Pyodide and MuJoCo in one worker.
 *
 * WHY RECORD-THEN-REPLAY, rather than animating as the physics runs:
 *
 * The learner's Python is synchronous. `robot.stand()` has to return before
 * the next line runs, so there is no moment during their code in which the
 * worker could yield for a frame to be painted. Streaming would mean either
 * rewriting their code as async -- unthinkable for a first Python course -- or
 * a stuttering picture.
 *
 * So the physics runs flat out (about 20x real time, measured), recording a
 * pose every 60th of a second, and the finished trajectory is handed to the
 * page to play at normal speed. The learner sees a smooth animation, can
 * replay it without re-running anything, and the whole run is over in a
 * fraction of a second.
 *
 * It also removed a browser risk: nothing is drawn in here, so no
 * OffscreenCanvas, so no Safari question to answer.
 *
 * This worker is a MODULE worker and lives in public/ on purpose. Both of its
 * dependencies load from a URL -- the MuJoCo glue finds its own .wasm sitting
 * beside it -- so no bundler is involved in something this load-bearing.
 */
import loadMujoco from "/mujoco/mujoco.js";

const PYODIDE_CDN = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";

/** dt in the model. Keep in step with go2-model.ts. */
const DT = 0.002;
/** One recorded frame per 60th of a second. */
const STEPS_PER_FRAME = Math.round(1 / 60 / DT);
/** Hard ceiling on a recording: 20 s. Stops a long loop eating all memory. */
const MAX_FRAMES = 20 * 60;

let pyodide = null;
let mujoco = null;
let model = null;
let data = null;
/** Kept between cells of one part, so cell 3 can use what cell 1 defined. */
let namespace = null;
let nbody = 0;

/** Poses, duplicated from go2-model.ts because a worker cannot import it. */
const LYING = [0, 1.25, -2.7];
const STANDING = [0, 0.9, -1.8];
const LEGS = { front_left: 0, front_right: 1, back_left: 2, back_right: 3 };

/** Recording state for the run in progress. */
let frames = [];
let targets = new Array(12).fill(0);
let simTime = 0;
let hitLimit = false;

function resetSim() {
  mujoco.mj_resetData(model, data);
  const qpos = data.qpos;
  qpos[2] = 0.09;
  for (let i = 0; i < 12; i++) qpos[7 + i] = LYING[i % 3];
  for (let i = 0; i < 12; i++) {
    targets[i] = LYING[i % 3];
    data.ctrl[i] = targets[i];
  }
  mujoco.mj_forward(model, data);
  frames = [];
  simTime = 0;
  hitLimit = false;
  captureFrame();
}

function captureFrame() {
  if (frames.length >= MAX_FRAMES) {
    hitLimit = true;
    return;
  }
  const xpos = data.xpos;
  const xquat = data.xquat;
  const f = new Float32Array(nbody * 7);
  for (let b = 0; b < nbody; b++) {
    f[b * 7 + 0] = xpos[b * 3 + 0];
    f[b * 7 + 1] = xpos[b * 3 + 1];
    f[b * 7 + 2] = xpos[b * 3 + 2];
    f[b * 7 + 3] = xquat[b * 4 + 0];
    f[b * 7 + 4] = xquat[b * 4 + 1];
    f[b * 7 + 5] = xquat[b * 4 + 2];
    f[b * 7 + 6] = xquat[b * 4 + 3];
  }
  frames.push(f);
}

/** Advance the physics by `seconds`, recording as it goes. */
function advance(seconds) {
  const steps = Math.max(1, Math.round(seconds / DT));
  for (let s = 0; s < steps; s++) {
    for (let i = 0; i < 12; i++) data.ctrl[i] = targets[i];
    mujoco.mj_step(model, data);
    simTime += DT;
    if (s % STEPS_PER_FRAME === 0) captureFrame();
    if (hitLimit) return;
  }
  captureFrame();
}

/**
 * Move smoothly to a set of joint targets instead of snapping.
 * A real robot cannot teleport its legs, and a snapped target makes the
 * simulation explode in a way that teaches a beginner nothing.
 */
function moveTo(next, seconds) {
  const from = targets.slice();
  const steps = Math.max(1, Math.round(seconds / DT));
  for (let s = 0; s < steps; s++) {
    const a = (s + 1) / steps;
    // smoothstep: starts gently, ends gently, like a real servo ramp
    const e = a * a * (3 - 2 * a);
    for (let i = 0; i < 12; i++) {
      targets[i] = from[i] + (next[i] - from[i]) * e;
      data.ctrl[i] = targets[i];
    }
    mujoco.mj_step(model, data);
    simTime += DT;
    if (s % STEPS_PER_FRAME === 0) captureFrame();
    if (hitLimit) return;
  }
  captureFrame();
}

/** The bridge the Python `robot` object calls into. */
const bridge = {
  reset: () => resetSim(),
  wait: (seconds) => advance(Math.min(Math.max(seconds, 0), 10)),
  move_to: (list, seconds) => {
    const arr = list.toJs ? list.toJs() : Array.from(list);
    moveTo(arr, Math.min(Math.max(seconds, 0.05), 10));
  },
  set_now: (list) => {
    const arr = list.toJs ? list.toJs() : Array.from(list);
    for (let i = 0; i < 12; i++) targets[i] = arr[i];
  },
  pose: (name) => (name === "standing" ? STANDING : LYING),
  height: () => data.qpos[2],
  time: () => simTime,
  /** Roll and pitch, so a lesson can ask "is it still upright?" */
  tilt: () => {
    const q = data.qpos;
    const w = q[3], x = q[4], y = q[5], z = q[6];
    const roll = Math.atan2(2 * (w * x + y * z), 1 - 2 * (x * x + y * y));
    const pitch = Math.asin(Math.max(-1, Math.min(1, 2 * (w * y - z * x))));
    return [roll, pitch];
  },
  joints: () => Array.from({ length: 12 }, (_, i) => data.qpos[7 + i]),
  targets: () => targets.slice(),
  leg_index: (name) => (name in LEGS ? LEGS[name] : -1),
};

/**
 * The `robot` object, written for someone who has had nine Python lessons.
 *
 * Names are verbs a person would use out loud -- stand_up, lie_down, wait --
 * and angles are named hip/thigh/knee rather than the model's hip/thigh/calf,
 * because "knee" is a word a teenager already owns. Everything is keyword
 * arguments so a line reads like a sentence.
 */
const STANDING_HEIGHT = 0.25;

const ROBOT_PY = `
class _Robot:
    """Your Go2 robot. Tell it what to do, one line at a time."""

    LEGS = ("front_left", "front_right", "back_left", "back_right")

    def __init__(self, bridge):
        self._b = bridge

    # ---- moving -------------------------------------------------------
    def stand_up(self, seconds=1.5):
        """Push up onto all four legs."""
        self._b.move_to(list(self._b.pose("standing")) * 4, seconds)

    def lie_down(self, seconds=1.5):
        """Fold the legs and sit down on the floor."""
        self._b.move_to(list(self._b.pose("lying")) * 4, seconds)

    def set_leg(self, leg, hip=None, thigh=None, knee=None, seconds=0.5):
        """Move ONE leg. Angles are in radians."""
        i = self._b.leg_index(leg)
        if i < 0:
            raise ValueError(
                "I do not know a leg called " + repr(leg) + ". "
                "Try one of: " + ", ".join(self.LEGS))
        new = [float(v) for v in self._b.targets()]
        if hip is not None:
            new[i * 3] = hip
        if thigh is not None:
            new[i * 3 + 1] = thigh
        if knee is not None:
            new[i * 3 + 2] = knee
        self._b.move_to(new, seconds)

    def set_all_legs(self, hip=0.0, thigh=0.9, knee=-1.8, seconds=0.5):
        """Move all four legs to the same angles."""
        self._b.move_to([hip, thigh, knee] * 4, seconds)

    def wait(self, seconds=1.0):
        """Hold still and let time pass."""
        self._b.wait(seconds)

    # ---- looking ------------------------------------------------------
    @property
    def height(self):
        """How high the robot's body is off the floor, in metres."""
        return float(self._b.height())

    @property
    def is_standing(self):
        """True when the body is up off the floor."""
        return self.height > ${STANDING_HEIGHT}

    @property
    def time(self):
        """Seconds since the robot woke up."""
        return float(self._b.time())

    @property
    def tilt(self):
        """How far it is leaning: (roll, pitch) in radians."""
        return tuple(float(v) for v in self._b.tilt())

    @property
    def joints(self):
        """All twelve joint angles, in radians."""
        return [float(v) for v in self._b.joints()]

robot = _Robot(__axi_bridge)
`;

async function init(xml) {
  const { loadPyodide } = await import(PYODIDE_CDN + "pyodide.mjs");
  pyodide = await loadPyodide({ indexURL: PYODIDE_CDN });
  mujoco = await loadMujoco();

  model = mujoco.MjModel.from_xml_string(xml);
  data = new mujoco.MjData(model);
  nbody = model.nbody;

  resetSim();
  return { nbody, ngeom: model.ngeom, geoms: describeGeoms() };
}

/** Everything the page needs to build the three.js scene, read from the model. */
function describeGeoms() {
  const out = [];
  const t = model.geom_type, s = model.geom_size, c = model.geom_rgba,
    b = model.geom_bodyid, p = model.geom_pos, q = model.geom_quat;
  for (let g = 0; g < model.ngeom; g++) {
    out.push({
      type: t[g],
      size: [s[g * 3], s[g * 3 + 1], s[g * 3 + 2]],
      rgba: [c[g * 4], c[g * 4 + 1], c[g * 4 + 2], c[g * 4 + 3]],
      body: b[g],
      pos: [p[g * 3], p[g * 3 + 1], p[g * 3 + 2]],
      quat: [q[g * 4], q[g * 4 + 1], q[g * 4 + 2], q[g * 4 + 3]],
    });
  }
  return out;
}

function freshNamespace() {
  if (namespace) namespace.destroy();
  namespace = pyodide.toPy({});
  namespace.set("__axi_bridge", bridge);
  pyodide.runPython(ROBOT_PY, { globals: namespace });
}

self.onmessage = async (ev) => {
  const { id, kind, code, keepState } = ev.data;
  const reply = (msg, transfer) => self.postMessage({ id, ...msg }, transfer || []);

  try {
    if (kind === "init") {
      const info = await init(ev.data.xml);
      freshNamespace();
      return reply({ ok: true, info });
    }

    if (kind === "reset") {
      resetSim();
      freshNamespace();
      return reply({ ok: true });
    }

    if (kind === "check") {
      // Never let a broken check look like a failed answer.
      try {
        const val = pyodide.runPython(code, { globals: namespace });
        const pass = Boolean(val && val.valueOf ? val.valueOf() : val);
        if (val && val.destroy) val.destroy();
        return reply({ ok: true, pass });
      } catch (e) {
        return reply({ ok: true, pass: false, checkError: String((e && e.message) || e) });
      }
    }

    if (kind === "run") {
      // A cell that starts a part resets the world; later cells in the same
      // part keep both the robot's pose and the learner's variables.
      if (!keepState) {
        resetSim();
        freshNamespace();
      }

      let out = "";
      // Pyodide's batched writer strips the trailing newline, so two
      // prints arrive as one run-on line unless it is put back.
      const capture = (s) => { out += s + "\n"; };
      pyodide.setStdout({ batched: capture });
      pyodide.setStderr({ batched: capture });

      let error = null;
      try {
        await pyodide.runPythonAsync(code, { globals: namespace });
      } catch (e) {
        error = String(e.message || e);
      }
      pyodide.setStdout({});
      pyodide.setStderr({});

      // One flat buffer, transferred rather than copied.
      const buf = new Float32Array(frames.length * nbody * 7);
      frames.forEach((f, i) => buf.set(f, i * nbody * 7));

      return reply({
        ok: !error,
        error,
        output: out,
        frames: buf,
        frameCount: frames.length,
        nbody,
        truncated: hitLimit,
        state: {
          height: data.qpos[2],
          time: simTime,
          joints: Array.from({ length: 12 }, (_, i) => data.qpos[7 + i]),
          tilt: bridge.tilt(),
        },
      }, [buf.buffer]);
    }
  } catch (e) {
    reply({ ok: false, error: String((e && e.message) || e) });
  }
};
