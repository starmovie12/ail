"use client";

import { useEffect, useState } from "react";
import { Poppins, Yellowtail } from "next/font/google";
import "./SplashScreen.css";
import {
  APP_NAME_A, APP_NAME_B, TAGLINE_1, TAGLINE_2, SCRIPT_LINE,
  SHOW_MS, FADE_MS, ONCE_PER_SESSION, SPLASH_KEY,
} from "./splashConfig";

/* ==========================================================================
   OMNIGRAB — SPLASH SCREEN
   App khulte hi dikhne wali full-screen intro screen (design reference photo
   ke hisaab se). Pure CSS + inline SVG — koi image file ki zarurat nahi.
   Text / timing / "kab dikhe" ki settings: components/splashConfig.ts
   ========================================================================== */

const sans = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--os-sans",
  display: "swap",
});
const script = Yellowtail({
  subsets: ["latin"],
  weight: "400",
  variable: "--os-script",
  display: "swap",
});

/* ── data ─────────────────────────────────────────────────────────────── */
type Glyph =
  | "instagram" | "youtube" | "whatsapp" | "tiktok" | "snapchat" | "x"
  | "facebook" | "threads" | "pinterest" | "printer" | "gallery";

interface Tile {
  k: Glyph;
  x: number;      // % of stage width (centre)
  y: number;      // % of stage height (centre)
  rot: number;    // deg
  c1: string;     // gradient top-left
  c2: string;     // gradient bottom-right
  cm?: string;    // optional middle colour (3-stop gradient)
  glow: string;   // outer glow colour
}

const TILES: Tile[] = [
  { k: "instagram", x: 43.6, y: 10.4, rot: -5,  c1: "#8B3DFF", cm: "#F0306E", c2: "#FFB41F", glow: "rgba(236,72,153,.75)" },
  { k: "youtube",   x: 66.4, y: 13.2, rot: 10,  c1: "#FF4545", c2: "#C20000", glow: "rgba(255,40,40,.7)" },
  { k: "whatsapp",  x: 24.7, y: 19.7, rot: -12, c1: "#46E04A", c2: "#07951A", glow: "rgba(40,220,70,.7)" },
  { k: "tiktok",    x: 83.6, y: 23.6, rot: 14,  c1: "#262633", c2: "#000000", glow: "rgba(37,244,238,.6)" },
  { k: "snapchat",  x: 11.9, y: 35.7, rot: -16, c1: "#FFF53F", c2: "#F2B800", glow: "rgba(255,225,0,.65)" },
  { k: "x",         x: 89.5, y: 45.6, rot: 8,   c1: "#23232E", c2: "#000000", glow: "rgba(150,170,255,.55)" },
  { k: "facebook",  x: 12.0, y: 56.0, rot: -9,  c1: "#3A86FF", c2: "#0A3ED0", glow: "rgba(40,120,255,.75)" },
  { k: "threads",   x: 88.4, y: 66.0, rot: 7,   c1: "#23232E", c2: "#000000", glow: "rgba(160,120,255,.55)" },
  { k: "pinterest", x: 13.8, y: 75.7, rot: -12, c1: "#F2303B", c2: "#A8000F", glow: "rgba(255,40,60,.7)" },
  { k: "printer",   x: 80.4, y: 82.6, rot: 14,  c1: "#7A5BFF", c2: "#3523D2", glow: "rgba(110,80,255,.8)" },
  { k: "gallery",   x: 23.4, y: 90.3, rot: -10, c1: "#5B5BFF", c2: "#2424C2", glow: "rgba(70,90,255,.8)" },
];

// Deterministic "stars" (random nahi — taaki SSR/hydration mismatch na ho)
const STARS = [
  [6, 12, 1], [14, 4, 2], [27, 9, 1], [38, 3, 1], [52, 7, 2], [63, 2, 1], [77, 8, 1], [90, 5, 2],
  [95, 18, 1], [4, 27, 2], [93, 33, 1], [8, 47, 1], [96, 52, 2], [5, 64, 1], [94, 71, 1],
  [18, 83, 2], [34, 78, 1], [68, 76, 1], [88, 88, 2], [47, 95, 1], [10, 94, 1],
];

const NEON_GRAD = "url(#os-neon)";

/* ── glyphs (24×24 box) ───────────────────────────────────────────────── */
const X_PATH = "M18.2 3h3.1l-6.8 7.7L22.5 21h-6.2l-4.9-6.3L5.8 21H2.7l7.3-8.3L2.2 3h6.4l4.4 5.8L18.2 3zm-1.1 16.2h1.7L7.7 4.7H5.9l11.2 14.5z";
const FB_PATH = "M13.5 21v-8h2.7l.4-3.2h-3.1V7.8c0-.9.3-1.5 1.6-1.5h1.7V3.4c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v2.4H7.7V13h2.7v8h3.1z";
const TT_PATH = "M16.6 3h-3.1v12.2a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.5a5.7 5.7 0 1 0 4.9 5.7V9.1a6.6 6.6 0 0 0 3.8 1.2V7.2A3.9 3.9 0 0 1 16.6 3z";
const PIN_PATH = "M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z";
const THREADS_PATH = "M18.263 11.097c-.03-3.486-1.92-5.586-5.111-5.586-2.13 0-3.922.963-4.863 2.499l2.062 1.438c.535-.843 1.272-1.543 2.628-1.543 1.528 0 2.318.85 2.544 2.431a15 15 0 0 0-2.236-.173c-4.125 0-6.068 1.867-6.068 4.336s1.943 3.99 4.804 3.99c3.139 0 5.013-2.115 5.781-4.735.798.361 1.348 1.204 1.348 2.47 0 3.387-3.907 5.232-7.22 5.232-4.885 0-8.077-3.207-8.077-8.424 0-6.392 4.223-10.487 9.9-10.487 3.808 0 5.69 1.671 6.97 3.914l2.108-1.475C21.44 2.078 18.331 0 13.663 0 6.227 0 1.168 5.277 1.168 12.934c0 7 4.953 11.066 10.856 11.066 4.878 0 9.809-2.846 9.809-7.716 0-2.545-1.46-4.231-3.569-5.187m-6.33 4.855c-1.077 0-2.026-.512-2.026-1.453 0-1.483 1.822-1.934 3.606-1.934.678 0 1.34.045 1.927.173-.422 1.927-1.671 3.215-3.508 3.214Z";

function GlyphArt({ name }: { name: Glyph }) {
  switch (name) {
    case "instagram":
      return (
        <g stroke="#fff" strokeWidth="2.1" fill="none" strokeLinecap="round">
          <rect x="3.3" y="3.3" width="17.4" height="17.4" rx="5.2" />
          <circle cx="12" cy="12" r="4.1" />
          <circle cx="17.3" cy="6.7" r=".7" fill="#fff" />
        </g>
      );
    case "youtube":
      return (
        <g>
          <rect x="2" y="5.2" width="20" height="13.6" rx="4.4" fill="#fff" />
          <path d="M10 8.9v6.2l5.4-3.1L10 8.9z" fill="#E60000" />
        </g>
      );
    case "whatsapp":
      return (
        <g>
          <path d="M12 3.2a8.7 8.7 0 0 0-7.5 13.1L3.2 20.8l4.6-1.2A8.7 8.7 0 1 0 12 3.2z" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
          <path d="M9.2 7.9c-.5.4-.8 1.1-.4 2.2 1 2.2 2.5 3.7 4.7 4.7 1.1.4 1.8.1 2.1-.4l.5-1-1.9-1.1-.8.8c-1.1-.4-2.2-1.5-2.6-2.6l.8-.8-1.1-1.9z" fill="#fff" />
        </g>
      );
    case "tiktok":
      return (
        <g transform="translate(12 12) scale(.92) translate(-12 -12)">
          <path d={TT_PATH} fill="#25F4EE" transform="translate(-.9 .5)" />
          <path d={TT_PATH} fill="#FE2C55" transform="translate(.9 -.4)" />
          <path d={TT_PATH} fill="#fff" />
        </g>
      );
    case "snapchat":
      return (
        <path
          d="M12 3.6c-2.9 0-4.6 2.1-4.6 4.9v2.1c-.5.2-1.2.4-1.2 1s.7.8 1.4 1c-.3 1.1-1.6 2.3-3 2.5.1.6 1.2.9 2.4 1.1.1.4.2.8.5 1 .5.2 1.1-.3 1.9-.3.8 0 1.5 1.2 2.6 1.2s1.8-1.2 2.6-1.2c.8 0 1.4.5 1.9.3.3-.2.4-.6.5-1 1.2-.2 2.3-.5 2.4-1.1-1.4-.2-2.7-1.4-3-2.5.7-.2 1.4-.4 1.4-1s-.7-.8-1.2-1V8.5c0-2.8-1.7-4.9-4.6-4.9z"
          fill="#fff" stroke="#14141a" strokeWidth="1.3" strokeLinejoin="round"
          transform="translate(12 12) scale(1.1) translate(-12 -12)"
        />
      );
    case "x":
      return <path d={X_PATH} fill="#fff" transform="translate(12 12) scale(.9) translate(-12 -12)" />;
    case "facebook":
      return <path d={FB_PATH} fill="#fff" transform="translate(12 12) scale(1.3) translate(-12 -12)" />;
    case "threads":
      return <path d={THREADS_PATH} fill="#fff" transform="translate(2.9 2.9) scale(.76)" />;
    case "pinterest":
      return <path d={PIN_PATH} fill="#fff" transform="translate(2.9 2.9) scale(.76)" />;
    case "printer":
      return (
        <g strokeLinejoin="round" strokeLinecap="round">
          <path d="M7.4 3.6h9.2v4.6H7.4z" fill="#fff" />
          <rect x="3" y="8.4" width="18" height="8.6" rx="2.6" fill="#fff" />
          <rect x="7" y="13.4" width="10" height="7" rx="1.2" fill="#fff" stroke="#3523D2" strokeWidth="1.5" />
          <path d="M9.4 16.2h5.2M9.4 18.2h3.4" stroke="#3523D2" strokeWidth="1.3" fill="none" />
          <circle cx="17.7" cy="10.9" r=".9" fill="#3523D2" />
        </g>
      );
    case "gallery":
      return (
        <g fill="none" stroke="#fff" strokeWidth="1.9" strokeLinejoin="round" strokeLinecap="round">
          <rect x="3.3" y="3.8" width="17.4" height="16.4" rx="3.2" />
          <circle cx="9" cy="9.4" r="1.8" fill="#fff" stroke="none" />
          <path d="M4.2 17.4l4.9-4.9 3.1 3.1 2.7-2.7 4.9 4.9" />
        </g>
      );
  }
}

/* ── small svgs ───────────────────────────────────────────────────────── */
function Sparkle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id={`os-sp-${className}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#22E4FF" />
        </linearGradient>
      </defs>
      <path
        d="M12 0C12.9 7.2 16.8 11.1 24 12 16.8 12.9 12.9 16.8 12 24 11.1 16.8 7.2 12.9 0 12 7.2 11.1 11.1 7.2 12 0Z"
        fill={`url(#os-sp-${className})`}
        stroke="#0b1f3a"
        strokeWidth=".5"
      />
    </svg>
  );
}

function HeroIcon() {
  return (
    <svg viewBox="0 0 100 100" className="os-hero__svg" aria-hidden="true">
      <defs>
        <linearGradient id="os-neon" gradientUnits="userSpaceOnUse" x1="12" y1="0" x2="88" y2="0">
          <stop offset="0" stopColor="#22E4FF" />
          <stop offset=".5" stopColor="#5AA8FF" />
          <stop offset="1" stopColor="#E255F0" />
        </linearGradient>
        <linearGradient id="os-arrow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#22E4FF" />
          <stop offset=".55" stopColor="#7DB8FF" />
          <stop offset="1" stopColor="#E255F0" />
        </linearGradient>
      </defs>
      <g fill="none" stroke={NEON_GRAD} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 34V22Q12 14 20 14H32" />
        <path d="M68 14H80Q88 14 88 22V34" />
        <path d="M12 66V78Q12 86 20 86H32" />
        <path d="M88 66V78Q88 86 80 86H68" />
      </g>
      <path
        d="M44 25H56V46H66L50 63 34 46H44Z"
        fill="url(#os-arrow)" stroke="url(#os-arrow)" strokeWidth="4" strokeLinejoin="round"
      />
      <path
        d="M35 67V72Q35 77 40 77H60Q65 77 65 72V67"
        fill="none" stroke="url(#os-arrow)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

function Rings() {
  return (
    <svg className="os-rings" viewBox="0 0 941 720" aria-hidden="true" preserveAspectRatio="none">
      <defs>
        <linearGradient id="os-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#22E4FF" stopOpacity=".85" />
          <stop offset=".55" stopColor="#6366F1" stopOpacity=".55" />
          <stop offset="1" stopColor="#E255F0" stopOpacity=".85" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#os-ring)" strokeLinecap="round">
        <ellipse className="os-ring os-ring--a" cx="470" cy="415" rx="415" ry="215" strokeWidth="2" strokeDasharray="520 90" />
        <ellipse className="os-ring os-ring--b" cx="470" cy="415" rx="330" ry="285" strokeWidth="1.6" strokeDasharray="380 120" />
        <ellipse className="os-ring os-ring--c" cx="470" cy="415" rx="450" ry="300" strokeWidth="1.2" strokeDasharray="700 140" opacity=".7" />
      </g>
    </svg>
  );
}

function FeatureIcons({ i }: { i: 0 | 1 | 2 }) {
  if (i === 0)
    return (
      <svg viewBox="0 0 24 24" className="os-feat__ico" aria-hidden="true">
        <path d="M13.5 1.5 4.2 13.2h6.1l-1.6 9.3 9.4-12.2h-6.2l1.6-8.8z" fill="#22E4FF" stroke="#22E4FF" strokeWidth="1" strokeLinejoin="round" />
      </svg>
    );
  if (i === 1)
    return (
      <svg viewBox="0 0 24 24" className="os-feat__ico" aria-hidden="true">
        <path d="M12 2.2 4 5.4v6.2c0 5 3.4 8.6 8 10.2 4.6-1.6 8-5.2 8-10.2V5.4l-8-3.2z" fill="#9B4DFF" />
        <path d="M12 2.2v19.6c-4.6-1.6-8-5.2-8-10.2V5.4l8-3.2z" fill="#6D28D9" />
        <path d="M12 2.2 4 5.4v6.2c0 5 3.4 8.6 8 10.2 4.6-1.6 8-5.2 8-10.2V5.4l-8-3.2z" fill="none" stroke="#C084FC" strokeWidth="1" strokeLinejoin="round" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" className="os-feat__ico os-feat__ico--wide" aria-hidden="true">
      <defs>
        <linearGradient id="os-cloud" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#38BDF8" />
          <stop offset="1" stopColor="#1D6BFF" />
        </linearGradient>
      </defs>
      <path d="M6.6 20a5.2 5.2 0 0 1-.9-10.3A6.4 6.4 0 0 1 18 9.3a5.4 5.4 0 0 1-.6 10.7H6.6z" fill="url(#os-cloud)" />
      <path d="M12 10.5v6.2M9.4 14.2l2.6 2.6 2.6-2.6" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── component ────────────────────────────────────────────────────────── */
export default function SplashScreen() {
  const [phase, setPhase] = useState<"show" | "hide" | "gone">("show");

  useEffect(() => {
    const root = document.documentElement;

    // Layout ki inline script ne skip-class laga di => splash mat dikhao.
    if (root.classList.contains("os-skip")) {
      setPhase("gone");
      return;
    }
    try {
      if (ONCE_PER_SESSION) sessionStorage.setItem(SPLASH_KEY, "1");
    } catch { /* storage unavailable — koi baat nahi */ }

    root.classList.add("os-lock"); // splash ke dauraan scroll band
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t1 = window.setTimeout(() => setPhase("hide"), reduce ? 900 : SHOW_MS);
    const t2 = window.setTimeout(() => setPhase("gone"), (reduce ? 900 : SHOW_MS) + FADE_MS);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    if (phase === "gone") document.documentElement.classList.remove("os-lock");
  }, [phase]);

  if (phase === "gone") return null;

  const skip = () => setPhase((p) => (p === "show" ? "hide" : p));

  return (
    <div
      className={`os ${sans.variable} ${script.variable} ${phase === "hide" ? "os--hide" : ""}`}
      role="status"
      aria-label={`${APP_NAME_A}${APP_NAME_B} khul raha hai`}
      onClick={skip}
      onTransitionEnd={(e) => {
        if (e.target === e.currentTarget && phase === "hide") setPhase("gone");
      }}
    >
      {/* corner neon arcs + stars (full-screen layer) */}
      <span className="os-arc os-arc--tl" aria-hidden="true" />
      <span className="os-arc os-arc--tr" aria-hidden="true" />
      <span className="os-arc os-arc--bl" aria-hidden="true" />
      <span className="os-arc os-arc--br" aria-hidden="true" />
      <div className="os-stars" aria-hidden="true">
        {STARS.map(([x, y, s], i) => (
          <i key={i} style={{ left: `${x}%`, top: `${y}%`, ["--s" as string]: s, ["--d" as string]: `${(i % 7) * 0.35}s` }} />
        ))}
      </div>

      <div className="os-canvas">
        {/* bottom planet horizon */}
        <div className="os-planet" aria-hidden="true" />

        {/* orbit + tiles + centre icon */}
        <div className="os-stage">
          <span className="os-aura" aria-hidden="true" />
          <Rings />

          <div className="os-hero">
            <div className="os-hero__ring">
              <div className="os-hero__glass">
                <HeroIcon />
              </div>
            </div>
            <Sparkle className="os-hero__spark" />
          </div>

          {TILES.map((t, i) => (
            <div
              key={t.k}
              className="os-tile"
              style={{
                left: `${t.x}%`,
                top: `${t.y}%`,
                ["--i" as string]: i,
                ["--rot" as string]: `${t.rot}deg`,
                ["--c1" as string]: t.c1,
                ["--c2" as string]: t.c2,
                ...(t.cm ? { ["--cm" as string]: t.cm } : {}),
                ["--glow" as string]: t.glow,
              }}
            >
              <div className="os-tile__pop">
                <div className="os-tile__face">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <GlyphArt name={t.k} />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* brand name */}
        <h1 className="os-title">
          <span className="os-title__a">{APP_NAME_A}</span>
          <span className="os-title__b">{APP_NAME_B}</span>
          <Sparkle className="os-title__spark" />
        </h1>

        <p className="os-sub">
          {TAGLINE_1}
          <br />
          {TAGLINE_2}
        </p>

        <ul className="os-feats">
          <li className="os-feat os-feat--fast"><FeatureIcons i={0} />Fast</li>
          <li className="os-feat__sep" aria-hidden="true" />
          <li className="os-feat os-feat--secure"><FeatureIcons i={1} />Secure</li>
          <li className="os-feat__sep" aria-hidden="true" />
          <li className="os-feat os-feat--hd"><FeatureIcons i={2} />HD Quality</li>
        </ul>

        <div className="os-script">
          <span>{SCRIPT_LINE}</span>
          <i aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
