"use client";

/**
 * Where the robot appears.
 *
 * The scene is built from what the worker reports about the model -- geom
 * types, sizes, colours and their body attachments -- so the robot is
 * described in exactly one place (go2-model.ts). Change a leg there and this
 * follows without being edited.
 *
 * It plays a recording. The physics already ran; this walks through the
 * frames at wall-clock speed, which is why scrubbing and replay cost nothing
 * and why a slow laptop shows a slower animation rather than wrong physics.
 */
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Play, Pause, RotateCcw } from "lucide-react";
import type { GeomSpec, RunResult } from "@/lib/sim-runner";
import { useT } from "@/i18n/use-t";

// MuJoCo geom type ids
const PLANE = 0, SPHERE = 2, CAPSULE = 3, BOX = 6;

interface Bound {
  mesh: THREE.Mesh;
  body: number;
  localPos: THREE.Vector3;
  localQuat: THREE.Quaternion;
}

export function RobotViewport({
  geoms,
  result,
  accent,
  className = "",
}: {
  geoms: GeomSpec[] | null;
  result: RunResult | null;
  accent: string;
  className?: string;
}) {
  const t = useT();
  const host = useRef<HTMLDivElement>(null);
  const bound = useRef<Bound[]>([]);
  const renderer = useRef<THREE.WebGLRenderer | null>(null);
  const scene = useRef<THREE.Scene | null>(null);
  const camera = useRef<THREE.PerspectiveCamera | null>(null);
  const raf = useRef(0);
  const frame = useRef(0);
  // The loop reads this rather than the state, so pausing does not have to
  // tear down and rebuild the animation frame -- an earlier version cancelled
  // it on pause and had nothing to start it again on resume.
  const playingRef = useRef(true);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const setPlayingBoth = (v: boolean) => {
    playingRef.current = v;
    setPlaying(v);
  };

  // --- build the scene once we know what the robot is made of --------------
  useEffect(() => {
    const el = host.current;
    if (!el || !geoms || geoms.length === 0) return;

    const r = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    r.setSize(el.clientWidth, el.clientHeight, false);
    el.appendChild(r.domElement);
    r.domElement.style.width = "100%";
    r.domElement.style.height = "100%";
    r.domElement.style.display = "block";

    const s = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(42, el.clientWidth / el.clientHeight, 0.01, 100);
    // MuJoCo is Z-up and three.js cameras are Y-up by default. Without this
    // the entire world renders on its side.
    cam.up.set(0, 0, 1);
    // BEHIND the robot's start, looking the way it travels.
    //
    // Two earlier framings failed for the same reason: both stood on the far
    // side, between the robot and the red target box at x = 1.4. That puts
    // the box NEARER the lens than the robot, so the box fills the shot and
    // the robot is a small dark shape behind it. From behind, the robot is
    // the close object and the box sits beyond it where a goal belongs.
    // Verified by projecting both objects through this exact camera rather
    // than by eye: the robot lands at the centre of the frame 1.13 m away,
    // and the target box at 2.37 m off to the right -- further from the lens
    // than the robot, which is the whole point. Two earlier framings stood
    // between the two and put the box nearer than the robot it was meant to
    // be a goal for.
    cam.position.set(-0.85, -0.70, 0.34);
    cam.lookAt(0.05, 0, 0.12);

    s.add(new THREE.HemisphereLight(0xffffff, 0x8fa3b8, 2.1));
    const key = new THREE.DirectionalLight(0xffffff, 1.5);
    key.position.set(2, -2.5, 4);
    s.add(key);

    const list: Bound[] = [];
    for (const g of geoms) {
      const [sx, sy, sz] = g.size;
      let geo: THREE.BufferGeometry | null = null;
      if (g.type === PLANE) geo = new THREE.PlaneGeometry(14, 14);
      else if (g.type === SPHERE) geo = new THREE.SphereGeometry(sx, 20, 14);
      else if (g.type === BOX) geo = new THREE.BoxGeometry(sx * 2, sy * 2, sz * 2);
      else if (g.type === CAPSULE) geo = new THREE.CapsuleGeometry(sx, sy * 2, 6, 14);
      if (!geo) continue;
      // MuJoCo capsules run along local Z; three.js builds them along Y.
      if (g.type === CAPSULE) geo.rotateX(Math.PI / 2);

      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(g.rgba[0], g.rgba[1], g.rgba[2]),
        roughness: 0.55,
        metalness: 0.05,
        transparent: g.rgba[3] < 1,
        opacity: g.rgba[3],
        side: g.type === PLANE ? THREE.DoubleSide : THREE.FrontSide,
      });
      const mesh = new THREE.Mesh(geo, mat);
      s.add(mesh);
      list.push({
        mesh,
        body: g.body,
        localPos: new THREE.Vector3(g.pos[0], g.pos[1], g.pos[2]),
        // MuJoCo quaternions are [w,x,y,z]; three.js wants (x,y,z,w).
        localQuat: new THREE.Quaternion(g.quat[1], g.quat[2], g.quat[3], g.quat[0]),
      });
    }

    renderer.current = r;
    scene.current = s;
    camera.current = cam;
    bound.current = list;
    r.render(s, cam);

    const onResize = () => {
      if (!el.clientWidth) return;
      cam.aspect = el.clientWidth / el.clientHeight;
      cam.updateProjectionMatrix();
      r.setSize(el.clientWidth, el.clientHeight, false);
      r.render(s, cam);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(el);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf.current);
      list.forEach((b) => {
        b.mesh.geometry.dispose();
        (b.mesh.material as THREE.Material).dispose();
      });
      r.dispose();
      if (r.domElement.parentNode === el) el.removeChild(r.domElement);
      renderer.current = null;
    };
  }, [geoms]);

  // --- play the recording --------------------------------------------------
  useEffect(() => {
    if (!result || !renderer.current || !scene.current || !camera.current) return;
    const { frames, frameCount, nbody } = result;
    if (frameCount === 0) return;

    frame.current = 0;
    playingRef.current = true;
    let announced = false;

    // Frame the run, not the origin. A part that walks a metre needs a wider
    // shot than one that stands still, and picking a single compromise angle
    // makes both look wrong -- the stationary one tiny, the travelling one
    // half out of frame. The trunk is body 1; sweep its path and fit to it.
    {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (let i = 0; i < frameCount; i++) {
        const o = i * nbody * 7 + 1 * 7;
        minX = Math.min(minX, frames[o]);
        maxX = Math.max(maxX, frames[o]);
        minY = Math.min(minY, frames[o + 1]);
        maxY = Math.max(maxY, frames[o + 1]);
      }
      // Aim at the middle of the journey, but bias toward where it STARTED:
      // a learner watches the robot set off, and a shot centred on empty
      // floor it has not reached yet wastes half the frame.
      const cx = minX + (maxX - minX) * 0.35;
      const cy = (minY + maxY) / 2;
      // Span of the journey plus the robot's own length, so it is never
      // cropped at the ends of the path.
      const span = Math.max(maxX - minX, maxY - minY) + 0.8;
      // Distance that fits `span` in a 42 degree vertical field, with a
      // little air, and never closer than the resting shot.
      const dist = Math.max(1.25, (span / 2) / Math.tan((42 * Math.PI) / 360) * 1.25);
      const cam2 = camera.current!;
      // Same side as the resting shot -- behind the start, never between the
      // robot and the box.
      cam2.position.set(cx - dist * 0.60, cy - dist * 0.55, dist * 0.30);
      cam2.lookAt(cx + 0.15, cy, 0.15);
      cam2.updateProjectionMatrix();
    }

    const pos = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    const stride = nbody * 7;

    const draw = (i: number) => {
      const base = i * stride;
      for (const b of bound.current) {
        const o = base + b.body * 7;
        pos.set(frames[o], frames[o + 1], frames[o + 2]);
        quat.set(frames[o + 4], frames[o + 5], frames[o + 6], frames[o + 3]);
        b.mesh.position.copy(b.localPos).applyQuaternion(quat).add(pos);
        b.mesh.quaternion.copy(quat).multiply(b.localQuat);
      }
      renderer.current!.render(scene.current!, camera.current!);
    };

    let last = performance.now();
    let acc = 0;
    const STEP = 1000 / 60;

    const tick = (now: number) => {
      raf.current = requestAnimationFrame(tick);
      const dt = now - last;
      last = now;
      // Setting state here rather than in the effect body: doing it
      // synchronously in an effect cascades renders, and this is the first
      // moment that is safely outside it.
      if (!announced) {
        announced = true;
        setPlayingBoth(true);
        setProgress(0);
      }
      if (!playingRef.current) return;
      acc += dt;
      // Never advance more than a few frames after a stall, or a backgrounded
      // tab returns and the robot teleports through the whole recording.
      let advanced = 0;
      while (acc >= STEP && advanced < 4) {
        acc -= STEP;
        advanced++;
        if (frame.current < frameCount - 1) frame.current++;
        else setPlayingBoth(false);
      }
      if (advanced) {
        draw(frame.current);
        setProgress(frame.current / Math.max(1, frameCount - 1));
      }
    };

    draw(0);
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [result]);

  const replay = () => {
    frame.current = 0;
    setProgress(0);
    setPlayingBoth(true);
  };

  return (
    <div className={`overflow-hidden rounded-2xl border ${className}`} style={{ borderColor: "var(--border)" }}>
      <div
        ref={host}
        className="h-[300px] w-full sm:h-[360px]"
        style={{ background: "linear-gradient(180deg, var(--bg-2), var(--surface))" }}
      />
      {result && result.frameCount > 0 && (
        <div className="flex items-center gap-3 border-t px-3 py-2" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={() => (progress >= 1 ? replay() : setPlayingBoth(!playingRef.current))}
            className="rounded-lg p-1.5 transition hover:opacity-70"
            aria-label={playing ? t("sim.pause") : t("sim.play")}
            style={{ color: accent }}
          >
            {progress >= 1 ? <RotateCcw className="h-4 w-4" /> : playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "var(--bg-2)" }}>
            <div className="h-full rounded-full transition-[width] duration-100" style={{ width: `${progress * 100}%`, background: accent }} />
          </div>
          <span className="font-robot text-[11px] tabular-nums text-faint">
            {(result.state.time).toFixed(1)}s
          </span>
        </div>
      )}
    </div>
  );
}
