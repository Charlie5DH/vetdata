"use client";

import { createElement, useEffect, useId, useRef } from "react";

/*
 * AssistantPet ("Pip") – the VetData assistant mascot, in a single self-contained file.
 * A frosted cream dog or cat head on a forest or lemon backdrop, adapted from the Frost Cloud pattern:
 * soft shapes melt into one silhouette through a "goo" filter; eyes, nose and mouth are drawn in forest.
 * It floats and breathes, glances around, blinks, follows the pointer with its eyes, twitches an ear
 * now and then, and squishes, perks its ears and winks when clicked.
 * Runs only while on screen; keeps still with prefers-reduced-motion (a click still plays one bounce).
 */

export type AssistantPetProps = {
  /** "dog" (default) or "cat" */
  shape?: "dog" | "cat";
  /** "forest": forest backdrop with a lemon glow · "lemon": lemon backdrop */
  color?: "forest" | "lemon";
  /** Fill the box with the backdrop; false leaves Pip on a transparent background */
  background?: boolean;
  /** The eyes follow the pointer while it's over the illustration */
  followPointer?: boolean;
  className?: string;
  /** Accessible description */
  label?: string;
};

type El = { type: "circle" | "ellipse" | "rect" | "polygon" | "path"; props: Record<string, string | number> };
type Ear = { pivot: [number, number]; shape: El; tint: El };
type PetShape = {
  parts: El[];
  ears: [Ear, Ear];
  eyes: { y: number; w: number; h: number; left: number; right: number };
  nose: El;
  mouth: string;
  whiskers?: string;
  /** Ear twitch angle in degrees; the sign sets which way the ears flick */
  earDeg: number;
  /** Lowest point of the head: squish and breathing scale from here */
  bottom: number;
};

const SHAPES: Record<"dog" | "cat", PetShape> = {
  dog: {
    parts: [
      { type: "circle", props: { cx: 120, cy: 116, r: 50 } }, // head
      { type: "circle", props: { cx: 97, cy: 146, r: 27 } }, // left jowl
      { type: "circle", props: { cx: 143, cy: 146, r: 27 } }, // right jowl
      { type: "rect", props: { x: 92, y: 110, width: 56, height: 50 } }, // fills the muzzle
    ],
    ears: [
      {
        pivot: [80, 86],
        shape: { type: "ellipse", props: { cx: 66, cy: 120, rx: 17, ry: 35, transform: "rotate(16 66 120)" } },
        tint: { type: "ellipse", props: { cx: 62, cy: 124, rx: 11, ry: 27, transform: "rotate(16 62 124)" } },
      },
      {
        pivot: [160, 86],
        shape: { type: "ellipse", props: { cx: 174, cy: 120, rx: 17, ry: 35, transform: "rotate(-16 174 120)" } },
        tint: { type: "ellipse", props: { cx: 178, cy: 124, rx: 11, ry: 27, transform: "rotate(-16 178 124)" } },
      },
    ],
    eyes: { y: 100, w: 16, h: 27, left: 96, right: 128 },
    nose: { type: "ellipse", props: { cx: 120, cy: 141, rx: 8, ry: 5.5 } },
    mouth: "M112 151c3 4 8 4 8-1 0 5 5 5 8 1",
    earDeg: 16,
    bottom: 174,
  },
  cat: {
    parts: [
      { type: "ellipse", props: { cx: 120, cy: 124, rx: 56, ry: 48 } }, // head
      { type: "circle", props: { cx: 90, cy: 142, r: 28 } }, // left cheek
      { type: "circle", props: { cx: 150, cy: 142, r: 28 } }, // right cheek
    ],
    ears: [
      {
        pivot: [92, 82],
        shape: { type: "polygon", props: { points: "70,104 76,50 114,80" } },
        tint: { type: "polygon", props: { points: "82,90 81,64 102,80" } },
      },
      {
        pivot: [148, 82],
        shape: { type: "polygon", props: { points: "170,104 164,50 126,80" } },
        tint: { type: "polygon", props: { points: "158,90 159,64 138,80" } },
      },
    ],
    eyes: { y: 104, w: 16, h: 25, left: 95, right: 129 },
    nose: { type: "path", props: { d: "M114.5 135.5h11l-5.5 6.5z" } },
    mouth: "M120 142v3m0 0c-2 4-7 4-9 1m9-1c2 4 7 4 9 1",
    whiskers: "M74 138 42 132M74 146 42 151M166 138l32-6M166 146l32 5",
    earDeg: -12,
    bottom: 172,
  },
};

const CX = 120;
const CY = 120;
/** Idle glances: straight, left, right, up and to the side, down and to the side */
const GLANCES = [
  { x: 0, y: 0 },
  { x: -1, y: 0.05 },
  { x: 1, y: -0.05 },
  { x: 0, y: 0 },
  { x: 0.65, y: -0.55 },
  { x: -0.7, y: 0.35 },
];

const about = (x: number, y: number, t: string) => `translate(${x} ${y}) ${t} translate(${-x} ${-y})`;
const part = (el: El, key?: string | number, className?: string) => createElement(el.type, { key, className, ...el.props });
/** A gradient stop whose color comes from a CSS variable, so the palette can change */
const Stop = ({ offset, color, opacity }: { offset: number; color: string; opacity?: number }) => (
  <stop offset={offset} style={{ stopColor: `var(--vd-pet-${color})`, stopOpacity: opacity }} />
);

export function AssistantPet({
  shape = "dog",
  color = "forest",
  background = true,
  followPointer = true,
  className,
  label,
}: AssistantPetProps) {
  const S = SHAPES[shape];
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const id = (name: string) => `vp${uid}-${name}`;

  const root = useRef<HTMLDivElement>(null);
  const floatRef = useRef<SVGGElement>(null);
  const turnRef = useRef<SVGGElement>(null);
  const eyesRef = useRef<SVGGElement>(null);
  const faceRef = useRef<SVGGElement>(null);
  const leftEye = useRef<SVGGElement>(null);
  const rightEye = useRef<SVGGElement>(null);
  const shineRef = useRef<SVGEllipseElement>(null);
  const shadowRef = useRef<SVGEllipseElement>(null);
  /** 0–1: the ears inside the silhouette · 2–3: their lemon tints */
  const earRefs = useRef<(SVGGElement | null)[]>([]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const P = SHAPES[shape];
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const look = { x: 0, y: 0, vx: 0, vy: 0 };
    const target = { x: 0, y: 0 };
    const squish = { p: 0, v: 0 };
    const ears = [{ p: 0, v: 0 }, { p: 0, v: 0 }];
    let pointer = false;
    let nextGlance = 1.2;
    let nextBlink = 1.8;
    let nextTwitch = 2.5;
    let blinkAt = -1;
    let blinkTwice = false;
    let winkAt = -1;
    let frame = 0;
    let last = 0;
    let time = 0;

    const blinkScale = (since: number, length = 0.16) => (since < 0 || since > length ? 1 : 1 - 0.9 * Math.sin((since / length) * Math.PI));

    const draw = () => {
      const float = still ? 0 : Math.sin(time * 1.1) * 5;
      const breathe = still ? 0 : Math.sin(time * 1.1 + Math.PI / 2) * 0.012;
      const sy = 1 + breathe - squish.p * 0.12;
      const sx = 1 - breathe + squish.p * 0.1;
      floatRef.current?.setAttribute("transform", `translate(0 ${float.toFixed(2)}) ${about(CX, P.bottom, `scale(${sx.toFixed(4)} ${sy.toFixed(4)})`)}`);
      // Turning: the head shifts and tilts a little, the eyes move further, the nose a bit less, the shine slides the other way
      turnRef.current?.setAttribute("transform", `translate(${(look.x * 4).toFixed(2)} ${(look.y * 2).toFixed(2)}) ${about(CX, CY, `rotate(${(look.x * 2.5).toFixed(2)}) scale(${(1 - Math.abs(look.x) * 0.025).toFixed(4)} 1)`)}`);
      eyesRef.current?.setAttribute("transform", `translate(${(look.x * 11).toFixed(2)} ${(look.y * 6).toFixed(2)})`);
      faceRef.current?.setAttribute("transform", `translate(${(look.x * 8).toFixed(2)} ${(look.y * 4).toFixed(2)})`);
      shineRef.current?.setAttribute("transform", `translate(${(-look.x * 7).toFixed(2)} ${(-look.y * 3).toFixed(2)})`);
      const both = blinkAt < 0 ? 1 : Math.min(blinkScale(time - blinkAt), blinkTwice ? blinkScale(time - blinkAt - 0.26) : 1);
      const wink = blinkScale(time - winkAt, 0.34);
      const eyeY = P.eyes.y + P.eyes.h / 2;
      leftEye.current?.setAttribute("transform", about(P.eyes.left + P.eyes.w / 2, eyeY, `scale(1 ${both.toFixed(3)})`));
      rightEye.current?.setAttribute("transform", about(P.eyes.right + P.eyes.w / 2, eyeY, `scale(1 ${Math.min(both, wink).toFixed(3)})`));
      // Ears rotate around where they meet the head; the tints follow
      for (let i = 0; i < 2; i++) {
        const [px, py] = P.ears[i].pivot;
        const t = `rotate(${(ears[i].p * P.earDeg * (i ? -1 : 1)).toFixed(2)} ${px} ${py})`;
        earRefs.current[i]?.setAttribute("transform", t);
        earRefs.current[i + 2]?.setAttribute("transform", t);
      }
      // The shadow shrinks and fades as Pip rises
      const lift = (float + 5) / 10;
      shadowRef.current?.setAttribute("transform", about(CX, 208, `scale(${(1 - lift * 0.12).toFixed(3)} 1)`));
      shadowRef.current?.setAttribute("opacity", (0.34 - lift * 0.1).toFixed(3));
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      time += dt;

      if (!pointer && time > nextGlance) {
        const g = GLANCES[Math.floor(Math.random() * GLANCES.length)];
        target.x = g.x;
        target.y = g.y;
        nextGlance = time + 1.4 + Math.random() * 2.2;
      }
      if (time > nextBlink) {
        blinkAt = time;
        blinkTwice = Math.random() < 0.25;
        nextBlink = time + 2.4 + Math.random() * 3;
      }
      if (!still && time > nextTwitch) {
        const i = Math.random() < 0.5 ? 0 : 1;
        ears[i].v += 9;
        if (Math.random() < 0.3) ears[1 - i].v += 7;
        nextTwitch = time + 3 + Math.random() * 4;
      }

      // Springs: the gaze settles softly, the bounce and the ears wobble out
      look.vx += ((target.x - look.x) * 70 - look.vx * 13) * dt;
      look.vy += ((target.y - look.y) * 70 - look.vy * 13) * dt;
      look.x += look.vx * dt;
      look.y += look.vy * dt;
      squish.v += (-squish.p * 220 - squish.v * 9) * dt;
      squish.p += squish.v * dt;
      for (const e of ears) {
        e.v += (-e.p * 160 - e.v * 7) * dt;
        e.p += e.v * dt;
      }

      draw();
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (frame || still) return;
      last = 0;
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()));
    io.observe(el);

    const onMove = (e: PointerEvent) => {
      if (!followPointer) return;
      const r = el.getBoundingClientRect();
      pointer = true;
      target.x = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2.4));
      target.y = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2.4));
    };
    const onLeave = () => {
      pointer = false;
      target.x = 0;
      target.y = 0;
      nextGlance = time + 1.2;
    };
    const onDown = () => {
      squish.p = 0.9;
      squish.v = 0;
      winkAt = time + 0.12;
      ears.forEach((e) => (e.v += 8));
      if (still) {
        // Reduced motion: play just this one bounce
        frame = requestAnimationFrame(function once(now) {
          const dt = Math.min(0.05, (now - (last || now)) / 1000);
          last = now;
          time += dt;
          squish.v += (-squish.p * 220 - squish.v * 9) * dt;
          squish.p += squish.v * dt;
          for (const e of ears) {
            e.v += (-e.p * 160 - e.v * 7) * dt;
            e.p += e.v * dt;
          }
          draw();
          frame = Math.abs(squish.p) + Math.abs(squish.v) > 0.002 ? requestAnimationFrame(once) : 0;
        });
      }
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointerdown", onDown);
    draw();

    return () => {
      stop();
      io.disconnect();
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointerdown", onDown);
    };
  }, [followPointer, shape]);

  const E = S.eyes;
  const eye = (x: number, ref: typeof leftEye, side: string) => {
    const pill = { x, y: E.y, width: E.w, height: E.h, rx: E.w / 2 };
    return (
      <g ref={ref}>
        {/* A soft shade around the eye, the forest fill, a darker inner edge at the top, and a small glint */}
        <rect {...pill} x={x - 1.5} y={E.y - 1} width={E.w + 3} height={E.h + 3} rx={E.w / 2 + 1.5} className="vd-pet__eye-drop" filter={`url(#${id("edge")})`} />
        <rect {...pill} fill={`url(#${id("hole")})`} />
        <clipPath id={id(`clip-${side}`)}>
          <rect {...pill} />
        </clipPath>
        <rect {...pill} y={E.y + 2.5} className="vd-pet__eye-shade" fill="none" strokeWidth="5" filter={`url(#${id("edge")})`} clipPath={`url(#${id(`clip-${side}`)})`} />
        <circle cx={x + E.w * 0.64} cy={E.y + E.h * 0.27} r="2.6" className="vd-pet__glint" />
      </g>
    );
  };

  return (
    <div
      ref={root}
      className={["vd-pet", className].filter(Boolean).join(" ")}
      data-bg={background || undefined}
      data-color={color}
      role="img"
      aria-label={label ?? `Pip, the VetData assistant: a frosted ${shape} that floats, looks around and blinks`}
    >
      {/* React 19 hoists this into <head> once, no matter how many render */}
      <style href="vd-assistant-pet" precedence="default">
        {css}
      </style>
      <svg viewBox="0 0 240 240" aria-hidden="true">
        <defs>
          {/* Blur, then sharpen the edge again: the parts melt into one soft head */}
          <filter id={id("goo")} x="0" y="0" width="240" height="240" filterUnits="userSpaceOnUse">
            <feGaussianBlur stdDeviation="3.5" />
            <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 28 -12" />
          </filter>
          <filter id={id("soft")} x="0" y="0" width="240" height="240" filterUnits="userSpaceOnUse">
            <feGaussianBlur stdDeviation="12" />
          </filter>
          <filter id={id("halo")} x="0" y="0" width="240" height="240" filterUnits="userSpaceOnUse">
            <feGaussianBlur stdDeviation="9" />
          </filter>
          <filter id={id("edge")} x="0" y="0" width="240" height="240" filterUnits="userSpaceOnUse">
            <feGaussianBlur stdDeviation="1.6" />
          </filter>
          <filter id={id("shade")} x="0" y="0" width="240" height="240" filterUnits="userSpaceOnUse">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          <g id={id("shape")} filter={`url(#${id("goo")})`}>
            {S.parts.map((p, i) => part(p, i))}
            {S.ears.map((e, i) => (
              <g key={i} ref={(n) => { earRefs.current[i] = n; }}>
                {part(e.shape)}
              </g>
            ))}
          </g>
          <mask id={id("mask")} maskUnits="userSpaceOnUse" x="0" y="0" width="240" height="240">
            <use href={`#${id("shape")}`} fill="#fff" />
          </mask>
          <linearGradient id={id("frost")} x1="0" y1="50" x2="0" y2="180" gradientUnits="userSpaceOnUse">
            <Stop offset={0} color="white" />
            <Stop offset={1} color="frost" opacity={0.97} />
          </linearGradient>
          <linearGradient id={id("hole")} x1="0" y1="0" x2="0" y2="1">
            <Stop offset={0} color="hole-1" />
            <Stop offset={1} color="hole-2" />
          </linearGradient>
        </defs>

        <ellipse ref={shadowRef} className="vd-pet__shadow" cx={CX} cy="208" rx="50" ry="7" filter={`url(#${id("shade")})`} />

        <g ref={floatRef}>
          <g ref={turnRef}>
            {/* A soft halo around the head, and a fine edge right around it that keeps it crisp */}
            <use href={`#${id("shape")}`} className="vd-pet__halo" filter={`url(#${id("halo")})`} />
            <use href={`#${id("shape")}`} className="vd-pet__edge" filter={`url(#${id("edge")})`} />
            <g mask={`url(#${id("mask")})`}>
              <rect width="240" height="240" fill={`url(#${id("frost")})`} />
              {/* The backdrop shines through softly towards the bottom; the edge stays bright all around */}
              <g filter={`url(#${id("soft")})`} className="vd-pet__tint" transform={`translate(-6 18) ${about(CX, CY, "scale(0.84 0.78)")}`}>
                <use href={`#${id("shape")}`} />
              </g>
              {S.ears.map((e, i) => (
                <g key={i} className="vd-pet__ear" ref={(n) => { earRefs.current[i + 2] = n; }}>
                  {part(e.tint)}
                </g>
              ))}
              <ellipse ref={shineRef} cx="106" cy="84" rx="30" ry="12" fill="#fff" opacity="0.7" filter={`url(#${id("shade")})`} />
            </g>
            {S.whiskers && <path className="vd-pet__whisker" d={S.whiskers} />}
            <g ref={eyesRef}>
              {eye(E.left, leftEye, "l")}
              {eye(E.right, rightEye, "r")}
            </g>
            <g ref={faceRef}>
              {part(S.nose, undefined, "vd-pet__nose")}
              <path className="vd-pet__mouth" d={S.mouth} />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}

/* ---------- Styles ---------- */

const css = /* css */ `
/* In the components layer so Tailwind utilities on the root (w-28, size-40, …) can size it. */
@layer components {
/* VetData palette as variables – forest backdrop, or lemon via data-color="lemon" */
.vd-pet {
  --vd-pet-sky-top: #2a3f2e;
  --vd-pet-sky-bottom: #46634b;
  --vd-pet-sky-light: rgba(243, 220, 126, 0.3);
  --vd-pet-white: #fcfaf4;
  --vd-pet-frost: #eee9d8;
  --vd-pet-tint: rgba(70, 99, 75, 0.16);
  --vd-pet-hole-1: #2a3f2e;
  --vd-pet-hole-2: #3a5640;
  --vd-pet-eye-drop: rgba(30, 46, 34, 0.14);
  --vd-pet-eye-shade: rgba(10, 20, 12, 0.35);
  --vd-pet-glint: #fcfaf4;
  --vd-pet-ear: rgba(229, 198, 88, 0.42);
  --vd-pet-whisker: rgba(42, 63, 46, 0.35);
  --vd-pet-halo: rgba(42, 63, 46, 0.16);
  --vd-pet-edge: rgba(42, 63, 46, 0.5);
  --vd-pet-shadow: rgba(42, 63, 46, 0.35);
  --vd-pet-ground: rgba(8, 18, 10, 0.5);
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  aspect-ratio: 1;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
.vd-pet[data-color="lemon"] {
  --vd-pet-sky-top: #e5c658;
  --vd-pet-sky-bottom: #f8e9a8;
  --vd-pet-sky-light: rgba(255, 255, 255, 0.55);
  --vd-pet-tint: rgba(201, 132, 36, 0.14);
  --vd-pet-ear: rgba(201, 132, 36, 0.32);
  --vd-pet-ground: rgba(120, 88, 10, 0.38);
}
.vd-pet svg { display: block; width: 100%; max-width: 320px; overflow: visible; }
.vd-pet__halo { fill: var(--vd-pet-halo); }
.vd-pet__edge { fill: var(--vd-pet-edge); }
.vd-pet__shadow { fill: var(--vd-pet-shadow); }
.vd-pet__tint { fill: var(--vd-pet-tint); }
.vd-pet__ear { fill: var(--vd-pet-ear); }
.vd-pet__eye-drop { fill: var(--vd-pet-eye-drop); }
.vd-pet__eye-shade { stroke: var(--vd-pet-eye-shade); }
.vd-pet__glint { fill: var(--vd-pet-glint); }
.vd-pet__nose { fill: var(--vd-pet-hole-1); stroke: var(--vd-pet-hole-1); stroke-width: 2.5; stroke-linejoin: round; }
.vd-pet__mouth { fill: none; stroke: var(--vd-pet-hole-1); stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
.vd-pet__whisker { fill: none; stroke: var(--vd-pet-whisker); stroke-width: 1.6; stroke-linecap: round; }

/* The backdrop: darker at the top, lighter at the bottom, a glow behind the head – fills the whole box */
.vd-pet[data-bg] {
  --vd-pet-halo: rgba(252, 250, 244, 0.55);
  --vd-pet-edge: rgba(252, 250, 244, 0.5);
  --vd-pet-shadow: var(--vd-pet-ground);
  --vd-pet-whisker: rgba(252, 250, 244, 0.75);
  background:
    radial-gradient(60% 55% at 60% 40%, var(--vd-pet-sky-light), transparent 70%),
    linear-gradient(180deg, var(--vd-pet-sky-top), var(--vd-pet-sky-bottom));
}
.vd-pet[data-color="lemon"][data-bg] {
  --vd-pet-halo: rgba(255, 255, 255, 0.6);
  --vd-pet-edge: rgba(42, 63, 46, 0.28);
  --vd-pet-whisker: rgba(42, 63, 46, 0.45);
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor – a deeper forest, lighter outline off the backdrop */
:where(.dark, [data-theme="dark"]) .vd-pet {
  --vd-pet-sky-top: #17231a;
  --vd-pet-sky-bottom: #2b3f2f;
  --vd-pet-ground: rgba(0, 0, 0, 0.55);
}
:where(.dark, [data-theme="dark"]) .vd-pet:not([data-bg]) {
  --vd-pet-halo: rgba(252, 250, 244, 0.18);
  --vd-pet-edge: rgba(252, 250, 244, 0.3);
  --vd-pet-whisker: rgba(252, 250, 244, 0.5);
  --vd-pet-shadow: rgba(0, 0, 0, 0.45);
}

@media (prefers-reduced-motion: reduce) {
  .vd-pet { cursor: default; }
}
}
`;

// Usage:
// <AssistantPet />                                         dog on forest
// <AssistantPet shape="cat" color="lemon" />               cat on lemon
// <AssistantPet background={false} className="w-28" />     assistant empty state, transparent