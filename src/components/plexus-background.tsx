"use client";

/**
 * The animated 3D background for the challenges page: nodes drifting in a
 * bounded volume, connected by lines that appear and dissolve as points cross
 * a proximity threshold, a slowly panning camera, and a few large soft
 * "bokeh" glows behind the cluster.
 *
 * Colours are pulled from the platform's own CSS custom properties at mount
 * time, not hard-coded to the reference spec's blue -- the same --neon /
 * --advanced accents used everywhere else, so this reads as one more piece
 * of AxiLearn rather than a pasted-in effect. It also rebuilds on a theme
 * toggle: dark and light are genuinely different treatments here, not one
 * palette inverted, matching how the rest of the site's two themes work.
 * Dark uses additive blending (soft light on near-black, which is what makes
 * the reference's glow work); light uses ordinary alpha blending with a dark
 * ink line colour, because additive blending on a pale background just
 * washes everything out toward white -- adding light to something already
 * bright has no visible effect.
 *
 * Two deliberate simplifications versus the original spec, worth being
 * explicit about rather than silently cutting:
 *
 *  - No post-processing bloom pass (EffectComposer / UnrealBloomPass). The
 *    glow instead comes from soft-edged radial-gradient sprite textures on
 *    the points and bokeh themselves. This gets most of the same look for a
 *    fraction of the bundle size, one fewer moving part that can break across
 *    Three.js versions, and no extra render passes to keep at 60fps.
 *  - Connections appear and disappear at a distance threshold rather than
 *    fading through a continuous per-vertex alpha (which would need a custom
 *    shader). Combined with the points' own slow drift, a line still forms
 *    and dissolves smoothly as two points cross the threshold -- it just
 *    isn't a continuous alpha ramp underneath.
 *
 * Mounted only on the challenges page via next/dynamic(..., { ssr: false }),
 * not globally: Three.js needs a real <canvas> and `window`, so it cannot run
 * on the server, and there is no reason for every other route to pay for this
 * bundle.
 */
import { useEffect, useRef } from "react";
import * as THREE from "three";

const NODE_COUNT = 80;
const BOUND = { x: 16, y: 10, z: 9 }; // half-extents of the volume nodes drift within
const CONNECT_DISTANCE = 4.2;
const CONNECT_RECOMPUTE_EVERY_N_FRAMES = 4; // the O(n^2) proximity pass, throttled
const MAX_PIXEL_RATIO = 1.5;

interface Palette {
  dark: boolean;
  bg0: string;
  bg1: string;
  line: string;
  bokehA: string;
  bokehB: string;
}

function readPalette(): Palette {
  const style = getComputedStyle(document.documentElement);
  const dark = document.documentElement.getAttribute("data-theme") !== "light";
  const v = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;
  return {
    dark,
    bg0: v("--bg", dark ? "#050914" : "#e8eef7"),
    bg1: v("--bg-2", dark ? "#0a1020" : "#f4f7fc"),
    // White light-lines on the dark theme (matches the reference); a dark
    // ink tone on light, or the lines would be invisible on a pale sky.
    line: dark ? "#e6f6ff" : v("--text-strong", "#0f172a"),
    bokehA: v("--neon", "#22d3ee"),
    bokehB: v("--advanced", "#a78bfa"),
  };
}

/** A soft circular sprite: alpha falls off from the centre, giving the "glow"
 *  look without a real bloom pass. Reused, scaled, and tinted for both the
 *  nodes and the big background bokeh blobs. */
function glowTexture(): THREE.Texture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.7)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

interface Node {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
}

function makeNodes(): Node[] {
  const nodes: Node[] = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    nodes.push({
      position: new THREE.Vector3(
        (Math.random() * 2 - 1) * BOUND.x,
        (Math.random() * 2 - 1) * BOUND.y,
        (Math.random() * 2 - 1) * BOUND.z,
      ),
      velocity: new THREE.Vector3(
        (Math.random() * 2 - 1) * 0.01,
        (Math.random() * 2 - 1) * 0.01,
        (Math.random() * 2 - 1) * 0.01,
      ),
    });
  }
  return nodes;
}

/** Pulls velocity back toward zero once position strays past `bound`, in
 *  proportion to how far past it is -- a spring, not a clamp, so a node
 *  nearing the edge decelerates and reverses smoothly instead of popping. */
function springBack(pos: number, bound: number, vel: number): number {
  return Math.abs(pos) > bound ? vel - Math.sign(pos) * (Math.abs(pos) - bound) * 0.004 : vel;
}

/** Brownian drift inside a bounded volume: continuous small random jitter,
 *  damped so speed never runs away, with the spring above keeping every node
 *  inside the volume without a hard clamp or wrap -- both would show up as a
 *  visible pop, which the spec explicitly rules out ("never linear... never
 *  ends or cuts"). */
function stepNode(n: Node) {
  n.velocity.x += (Math.random() * 2 - 1) * 0.0025;
  n.velocity.y += (Math.random() * 2 - 1) * 0.0025;
  n.velocity.z += (Math.random() * 2 - 1) * 0.0025;

  n.velocity.x = springBack(n.position.x, BOUND.x, n.velocity.x);
  n.velocity.y = springBack(n.position.y, BOUND.y, n.velocity.y);
  n.velocity.z = springBack(n.position.z, BOUND.z, n.velocity.z);

  n.velocity.multiplyScalar(0.985); // damping -- keeps drift slow and settled
  n.position.add(n.velocity);
}

/** Owns the whole Three.js lifecycle; returns a cleanup function. Kept as a
 *  plain function rather than living inside the component body, so the
 *  imperative WebGL setup is not entangled with React's render cycle. */
function mountScene(container: HTMLDivElement): () => void {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    50,
    container.clientWidth / container.clientHeight,
    0.1,
    100,
  );
  camera.position.set(0, 0, 22);

  const texture = glowTexture();
  const nodes = makeNodes();

  let palette = readPalette();
  scene.background = null; // the gradient is CSS behind the canvas, not WebGL

  // -- points ---------------------------------------------------------
  const pointGeometry = new THREE.BufferGeometry();
  const pointPositions = new Float32Array(NODE_COUNT * 3);
  pointGeometry.setAttribute("position", new THREE.BufferAttribute(pointPositions, 3));
  const pointMaterial = new THREE.PointsMaterial({
    size: 0.45,
    map: texture,
    transparent: true,
    depthWrite: false,
    sizeAttenuation: true,
    color: palette.line,
    opacity: palette.dark ? 0.95 : 0.85,
    blending: palette.dark ? THREE.AdditiveBlending : THREE.NormalBlending,
  });
  const points = new THREE.Points(pointGeometry, pointMaterial);
  scene.add(points);

  // -- connecting lines -------------------------------------------------
  // Geometry sized for a generous worst case; only `drawRange` vertices are
  // actually drawn each recompute, so unused capacity costs nothing to render.
  const MAX_SEGMENTS = NODE_COUNT * 12;
  const lineGeometry = new THREE.BufferGeometry();
  const linePositions = new Float32Array(MAX_SEGMENTS * 2 * 3);
  lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
  lineGeometry.setDrawRange(0, 0);
  const lineMaterial = new THREE.LineBasicMaterial({
    color: palette.line,
    transparent: true,
    opacity: palette.dark ? 0.22 : 0.28,
    depthWrite: false,
    blending: palette.dark ? THREE.AdditiveBlending : THREE.NormalBlending,
  });
  const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lines);

  // -- bokeh: a handful of big, slow, soft blobs behind the cluster -----
  const bokehSprites: THREE.Sprite[] = [];
  const bokehColors = [palette.bokehA, palette.bokehA, palette.bokehB];
  for (let i = 0; i < 7; i++) {
    const material = new THREE.SpriteMaterial({
      map: texture,
      color: bokehColors[i % bokehColors.length],
      transparent: true,
      opacity: palette.dark ? 0.1 : 0.16,
      depthWrite: false,
      blending: palette.dark ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    const sprite = new THREE.Sprite(material);
    const scale = 14 + Math.random() * 18;
    sprite.scale.set(scale, scale, 1);
    sprite.position.set(
      (Math.random() * 2 - 1) * (BOUND.x + 10),
      (Math.random() * 2 - 1) * (BOUND.y + 8),
      -18 - Math.random() * 18,
    );
    scene.add(sprite);
    bokehSprites.push(sprite);
  }

  function applyPalette(next: Palette) {
    palette = next;
    pointMaterial.color.set(palette.line);
    pointMaterial.opacity = palette.dark ? 0.95 : 0.85;
    pointMaterial.blending = palette.dark ? THREE.AdditiveBlending : THREE.NormalBlending;
    pointMaterial.needsUpdate = true;
    lineMaterial.color.set(palette.line);
    lineMaterial.opacity = palette.dark ? 0.22 : 0.28;
    lineMaterial.blending = palette.dark ? THREE.AdditiveBlending : THREE.NormalBlending;
    lineMaterial.needsUpdate = true;
    bokehSprites.forEach((sprite, i) => {
      const mat = sprite.material;
      mat.color.set(bokehColors[i % bokehColors.length]);
      mat.opacity = palette.dark ? 0.1 : 0.16;
      mat.blending = palette.dark ? THREE.AdditiveBlending : THREE.NormalBlending;
      mat.needsUpdate = true;
    });
  }

  function recomputeConnections() {
    let segments = 0;
    for (let i = 0; i < NODE_COUNT && segments < MAX_SEGMENTS; i++) {
      for (let j = i + 1; j < NODE_COUNT && segments < MAX_SEGMENTS; j++) {
        const dist = nodes[i].position.distanceTo(nodes[j].position);
        if (dist < CONNECT_DISTANCE) {
          const base = segments * 6;
          linePositions[base] = nodes[i].position.x;
          linePositions[base + 1] = nodes[i].position.y;
          linePositions[base + 2] = nodes[i].position.z;
          linePositions[base + 3] = nodes[j].position.x;
          linePositions[base + 4] = nodes[j].position.y;
          linePositions[base + 5] = nodes[j].position.z;
          segments++;
        }
      }
    }
    lineGeometry.attributes.position.needsUpdate = true;
    lineGeometry.setDrawRange(0, segments * 2);
  }

  let raf = 0;
  let frame = 0;
  let start = performance.now();

  function render(now: number) {
    const t = (now - start) / 1000;

    for (const n of nodes) stepNode(n);
    nodes.forEach((n, i) => {
      pointPositions[i * 3] = n.position.x;
      pointPositions[i * 3 + 1] = n.position.y;
      pointPositions[i * 3 + 2] = n.position.z;
    });
    pointGeometry.attributes.position.needsUpdate = true;

    if (frame % CONNECT_RECOMPUTE_EVERY_N_FRAMES === 0) recomputeConnections();

    // slow, non-repeating camera drift -- several sine waves of different
    // periods rather than one loop, so the motion never reads as a cycle.
    camera.position.x = Math.sin(t * 0.055) * 3.2;
    camera.position.y = Math.cos(t * 0.041) * 2.1;
    camera.position.z = 22 + Math.sin(t * 0.023) * 2.4;
    camera.lookAt(Math.sin(t * 0.03) * 1.5, Math.cos(t * 0.026) * 1, 0);

    bokehSprites.forEach((sprite, i) => {
      sprite.position.x += Math.sin(t * 0.02 + i) * 0.006;
      sprite.position.y += Math.cos(t * 0.017 + i) * 0.005;
    });

    renderer.render(scene, camera);
    frame++;
    raf = requestAnimationFrame(render);
  }

  recomputeConnections();
  renderer.render(scene, camera);
  if (!reduceMotion) raf = requestAnimationFrame(render);

  function onVisibility() {
    if (reduceMotion) return;
    if (document.hidden) {
      cancelAnimationFrame(raf);
    } else {
      start = performance.now() - frame * 16; // resume roughly where the clock left off
      raf = requestAnimationFrame(render);
    }
  }
  document.addEventListener("visibilitychange", onVisibility);

  const resize = new ResizeObserver(() => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
  resize.observe(container);

  const themeObserver = new MutationObserver(() => applyPalette(readPalette()));
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  return () => {
    cancelAnimationFrame(raf);
    document.removeEventListener("visibilitychange", onVisibility);
    resize.disconnect();
    themeObserver.disconnect();
    pointGeometry.dispose();
    pointMaterial.dispose();
    lineGeometry.dispose();
    lineMaterial.dispose();
    bokehSprites.forEach((sprite) => sprite.material.dispose());
    texture.dispose();
    renderer.dispose();
    container.removeChild(renderer.domElement);
  };
}

export function PlexusBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    return mountScene(el);
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        background:
          "radial-gradient(ellipse at 50% 30%, var(--bg-2), var(--bg) 75%)",
      }}
    />
  );
}
