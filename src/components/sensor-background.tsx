"use client";

/**
 * The Physical AI background: a ground grid with a sensor sweep crossing it,
 * lighting up the points it passes.
 *
 * Chosen over the plexus network the challenges page uses because this track
 * is about a machine perceiving a room, and a sweep that reveals what it
 * touches is that idea rather than a decoration next to it.
 *
 * Plain canvas 2D, not three.js. The lab pages already load a WebGL context
 * for the robot viewport, and a second one competing for the GPU on a school
 * laptop is a bad trade for a background. This costs a few hundred points and
 * one gradient per frame.
 *
 * Two things it must not do: keep animating in a hidden tab, and animate at
 * all for somebody who has asked the system for reduced motion.
 */
import { useEffect, useRef } from "react";

interface Point {
  x: number;
  y: number;
  /** 0..1, how recently the sweep passed. Decays every frame. */
  lit: number;
}

export function SensorBackground({ accent = "#22d3ee" }: { accent?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let points: Point[] = [];
    let w = 0;
    let h = 0;

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Points on a jittered lattice: a perfect grid reads as graph paper,
      // a little scatter reads as a world being measured.
      const step = w < 640 ? 78 : 58;
      points = [];
      for (let y = step / 2; y < h + step; y += step) {
        for (let x = step / 2; x < w + step; x += step) {
          points.push({
            x: x + (Math.random() - 0.5) * step * 0.45,
            y: y + (Math.random() - 0.5) * step * 0.45,
            lit: 0,
          });
        }
      }
    };

    const draw = (angle: number) => {
      ctx.clearRect(0, 0, w, h);

      // origin sits off the left edge, so the sweep reads as coming from a
      // machine standing just out of frame
      const ox = -w * 0.08;
      const oy = h * 0.5;

      // the faint grid
      ctx.strokeStyle = `color-mix(in srgb, ${accent} 9%, transparent)`;
      ctx.lineWidth = 1;
      const g = w < 640 ? 78 : 58;
      ctx.beginPath();
      for (let x = 0; x <= w; x += g) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = 0; y <= h; y += g) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();

      // the beam
      const reach = Math.hypot(w - ox, h);
      const spread = 0.16;
      const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, reach);
      grad.addColorStop(0, `color-mix(in srgb, ${accent} 26%, transparent)`);
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.arc(ox, oy, reach, angle - spread, angle + spread);
      ctx.closePath();
      ctx.fill();

      // light whatever the beam is crossing, then let it fade
      for (const p of points) {
        const a = Math.atan2(p.y - oy, p.x - ox);
        let d = Math.abs(a - angle);
        if (d > Math.PI) d = Math.PI * 2 - d;
        if (d < spread) p.lit = 1;
        else p.lit *= 0.985;

        const size = 1.1 + p.lit * 2.2;
        ctx.fillStyle = `color-mix(in srgb, ${accent} ${Math.round(14 + p.lit * 76)}%, transparent)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    build();
    if (reduced) {
      // one still frame: the picture without the motion
      draw(-0.35);
      const onResize = () => {
        build();
        draw(-0.35);
      };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    let angle = -0.9;
    let last = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      // A backgrounded tab returns with a huge delta; clamping stops the beam
      // teleporting a full turn on the frame the learner comes back.
      const dt = Math.min(now - last, 50) / 1000;
      last = now;
      angle += dt * 0.22;
      if (angle > 0.9) angle = -0.9;
      draw(angle);
    };
    raf = requestAnimationFrame(tick);

    const onResize = () => build();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [accent]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
