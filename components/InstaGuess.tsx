"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { Sparkles, Flame, Check, X, RefreshCw, Share2 } from "lucide-react";
import { dl } from "@/lib/media";

/** Well-known public accounts — the daily mystery is picked from here by date. */
const CELEBS: { handle: string; name: string }[] = [
  { handle: "cristiano", name: "Cristiano Ronaldo" },
  { handle: "leomessi", name: "Lionel Messi" },
  { handle: "virat.kohli", name: "Virat Kohli" },
  { handle: "selenagomez", name: "Selena Gomez" },
  { handle: "therock", name: "Dwayne Johnson" },
  { handle: "arianagrande", name: "Ariana Grande" },
  { handle: "kyliejenner", name: "Kylie Jenner" },
  { handle: "beyonce", name: "Beyoncé" },
  { handle: "khaby00", name: "Khaby Lame" },
  { handle: "kimkardashian", name: "Kim Kardashian" },
  { handle: "priyankachopra", name: "Priyanka Chopra" },
  { handle: "narendramodi", name: "Narendra Modi" },
  { handle: "shraddhakapoor", name: "Shraddha Kapoor" },
  { handle: "deepikapadukone", name: "Deepika Padukone" },
  { handle: "aliaabhatt", name: "Alia Bhatt" },
  { handle: "iamsrk", name: "Shah Rukh Khan" },
  { handle: "katrinakaif", name: "Katrina Kaif" },
  { handle: "neymarjr", name: "Neymar Jr" },
  { handle: "kingjames", name: "LeBron James" },
  { handle: "taylorswift", name: "Taylor Swift" },
  { handle: "badgalriri", name: "Rihanna" },
  { handle: "justinbieber", name: "Justin Bieber" },
  { handle: "zendaya", name: "Zendaya" },
  { handle: "vancityreynolds", name: "Ryan Reynolds" },
  { handle: "champagnepapi", name: "Drake" },
  { handle: "gal_gadot", name: "Gal Gadot" },
  { handle: "mrbeast", name: "MrBeast" },
  { handle: "anushkasharma", name: "Anushka Sharma" },
  { handle: "ranveersingh", name: "Ranveer Singh" },
  { handle: "sachintendulkar", name: "Sachin Tendulkar" },
  { handle: "rohitsharma45", name: "Rohit Sharma" },
  { handle: "jhon", name: "Jennifer Lopez" },
];

const STREAK_KEY = "ig.guessStreak";
const DATE_KEY = "ig.guessLastWin";

function dayIndex(): number {
  return Math.floor(Date.now() / 86_400_000);
}
/** Deterministic small shuffle seeded by the day, so options are stable all day. */
function seededOptions(answerIdx: number, seed: number): number[] {
  const pool = CELEBS.map((_, i) => i).filter((i) => i !== answerIdx);
  for (let i = pool.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const j = seed % (i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const opts = [answerIdx, ...pool.slice(0, 3)];
  // stable shuffle of the 4 finalists
  for (let i = opts.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const j = seed % (i + 1);
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }
  return opts;
}

export default function InstaGuess() {
  const day = dayIndex();
  const answerIdx = day % CELEBS.length;
  const answer = CELEBS[answerIdx];
  const options = seededOptions(answerIdx, day);

  const [pic, setPic] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [solvedToday, setSolvedToday] = useState(false);
  const [streak, setStreak] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [shared, setShared] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const correct = picked === answerIdx;
  const done = picked !== null;

  const loadPic = useCallback(async () => {
    setLoading(true); setFailed(false);
    try {
      const res = await fetch("/api/profile", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "dp", username: answer.handle }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.profilePicHd) setPic(json.profilePicHd);
      else setFailed(true);
    } catch { setFailed(true); }
    finally { setLoading(false); }
  }, [answer.handle]);

  useEffect(() => {
    try {
      const s = parseInt(localStorage.getItem(STREAK_KEY) || "0", 10) || 0;
      const last = parseInt(localStorage.getItem(DATE_KEY) || "0", 10) || 0;
      if (last === day) { setSolvedToday(true); setPicked(answerIdx); setReveal(true); }
      // reset streak if a day was fully skipped
      setStreak(last === day || last === day - 1 ? s : (last === 0 ? s : 0));
    } catch {}
    loadPic();
  }, [day, answerIdx, loadPic]);

  // Draw + blur the DP through our same-origin proxy (no canvas tainting).
  useEffect(() => {
    if (!pic) return;
    const cv = canvasRef.current; if (!cv) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const ctx = cv.getContext("2d"); if (!ctx) return;
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.save();
      ctx.filter = reveal ? "none" : "blur(22px)";
      // draw slightly overscanned so the blur has no transparent edge
      ctx.drawImage(img, -24, -24, cv.width + 48, cv.height + 48);
      ctx.restore();
    };
    img.onerror = () => setFailed(true);
    img.src = dl(pic, "guess");
  }, [pic, reveal]);

  function pick(i: number) {
    if (done || loading || failed) return;
    setPicked(i);
    setReveal(true);
    if (i === answerIdx) {
      try {
        const last = parseInt(localStorage.getItem(DATE_KEY) || "0", 10) || 0;
        const next = last === day - 1 ? streak + 1 : 1;
        localStorage.setItem(STREAK_KEY, String(next));
        localStorage.setItem(DATE_KEY, String(day));
        setStreak(next);
      } catch {}
      setSolvedToday(true);
    } else {
      try { localStorage.setItem(STREAK_KEY, "0"); localStorage.setItem(DATE_KEY, String(day)); } catch {}
      setStreak(0); setSolvedToday(true);
    }
  }

  async function share() {
    const text = correct
      ? `🎯 I guessed today's InstaGuess! 🔥 ${streak}-day streak. Can you beat it?`
      : `😅 Missed today's InstaGuess. Think you can do better?`;
    try { await navigator.clipboard.writeText(`${text}\n→ InstaGrab`); setShared(true); setTimeout(() => setShared(false), 1400); } catch {}
  }

  return (
    <div style={{ width: "100%", maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span className="label" style={{ color: "var(--gold-ink)" }}>Today&apos;s mystery DP</span>
        <span className="chip" style={{ gap: 6, borderColor: streak > 0 ? "var(--gold-400)" : undefined }}>
          <Flame size={13} strokeWidth={1.5} style={{ color: streak > 0 ? "var(--molten)" : "var(--ink-3)" }} />
          <b>{streak}</b> day streak
        </span>
      </div>

      <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <div style={{ width: 220, height: 220, borderRadius: "50%", overflow: "hidden", border: "3px solid var(--gold-300)", background: "var(--surface-2)", position: "relative", display: "grid", placeItems: "center" }}>
          {loading && <RefreshCw size={26} strokeWidth={1.5} className="coin-in" style={{ color: "var(--ink-3)" }} />}
          {failed && !loading && (
            <span style={{ textAlign: "center", color: "var(--ink-3)", fontSize: 13, padding: 16 }}>
              Aaj ki photo load nahi hui — retry karo.
            </span>
          )}
          <canvas ref={canvasRef} width={220} height={220}
            style={{ width: "100%", height: "100%", display: loading || failed ? "none" : "block" }} />
        </div>
        {done && (
          <div className="intro-rise" style={{ textAlign: "center", marginTop: 12 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 15, fontWeight: 700, color: correct ? "var(--gold-ink)" : "var(--err)" }}>
              {correct ? <Check size={16} strokeWidth={2.5} /> : <X size={16} strokeWidth={2.5} />}
              {correct ? "Sahi! 🎉" : "Oops!"}
            </span>
            <p style={{ marginTop: 4, color: "var(--ink-2)", fontSize: 14 }}>It was <b>{answer.name}</b> (@{answer.handle})</p>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {options.map((i) => {
          const isAns = i === answerIdx;
          const isPicked = picked === i;
          const border = done ? (isAns ? "var(--gold-400)" : isPicked ? "var(--err)" : "var(--line)") : "var(--line)";
          return (
            <button key={i} onClick={() => pick(i)} disabled={done || loading || failed}
              className="card" style={{
                padding: "14px 12px", textAlign: "center", cursor: done ? "default" : "pointer",
                borderColor: border, borderWidth: 1.5, background: done && isAns ? "color-mix(in srgb, var(--gold-300) 16%, var(--surface))" : "var(--surface)",
                fontSize: 14, fontWeight: 600, color: "var(--ink)", opacity: done && !isAns && !isPicked ? 0.55 : 1,
              }}>
              {CELEBS[i].name}
            </button>
          );
        })}
      </div>

      {done && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          <button className={`btn btn-secondary gold ${shared ? "tick" : ""}`} onClick={share} style={{ fontSize: 13 }}>
            {shared ? <Check size={14} strokeWidth={2} className="coin-in" /> : <Share2 size={14} strokeWidth={1.5} />}
            {shared ? "Copied!" : "Share result"}
          </button>
          <span className="mono" style={{ fontSize: 12, color: "var(--ink-3)", alignSelf: "center" }}>
            {solvedToday ? "Kal nayi photo aayegi — streak banao! 🔥" : ""}
          </span>
        </div>
      )}
      {failed && !done && (
        <button className="btn btn-molten" onClick={loadPic} style={{ justifyContent: "center" }}>
          <RefreshCw size={15} strokeWidth={1.5} /> Retry
        </button>
      )}

      <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.6, textAlign: "center", display: "flex", gap: 6, alignItems: "center", justifyContent: "center" }}>
        <Sparkles size={12} strokeWidth={1.5} /> One puzzle a day · streak saved on this device
      </p>
    </div>
  );
}
