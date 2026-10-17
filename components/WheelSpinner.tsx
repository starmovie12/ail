"use client";
import { useEffect, useRef, useState } from "react";
import { RotateCw, Trash2, Trophy } from "lucide-react";

const COLORS = ["#22E4FF", "#7C3AED", "#38BDF8", "#4F46E5", "#D946EF", "#6366F1"];

function drawWheel(canvas: HTMLCanvasElement, names: string[], angle: number) {
  const ctx = canvas.getContext("2d")!;
  const size = canvas.width;
  const c = size / 2, r = c - 8;
  ctx.clearRect(0, 0, size, size);
  const seg = (Math.PI * 2) / names.length;

  names.forEach((name, i) => {
    const start = angle + i * seg;
    ctx.beginPath();
    ctx.moveTo(c, c);
    ctx.arc(c, c, r, start, start + seg);
    ctx.closePath();
    ctx.fillStyle = COLORS[i % COLORS.length];
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,.12)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Label
    ctx.save();
    ctx.translate(c, c);
    ctx.rotate(start + seg / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = i % COLORS.length === 0 || i % COLORS.length === 2 ? "#050B24" : "#FFFFFF";
    ctx.font = `600 ${Math.max(11, Math.min(18, 320 / names.length))}px system-ui, sans-serif`;
    const label = name.length > 16 ? name.slice(0, 15) + "…" : name;
    ctx.fillText(label, r - 14, 5);
    ctx.restore();
  });

  // Hub
  ctx.beginPath();
  ctx.arc(c, c, 26, 0, Math.PI * 2);
  ctx.fillStyle = "#F4F6FF";
  ctx.fill();
  ctx.strokeStyle = "#4F46E5";
  ctx.lineWidth = 3;
  ctx.stroke();
}

export default function WheelSpinner() {
  const [text, setText] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef(0);
  const rafRef = useRef(0);

  const names = [...new Set(text.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean))];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (names.length >= 2) drawWheel(canvas, names, angleRef.current);
    else {
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [text]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  function spin() {
    if (spinning || names.length < 2) return;
    setSpinning(true); setWinner(null);
    const canvas = canvasRef.current!;
    // Crypto-random target angle → provably unbiased pick.
    const rand = crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;
    const target = angleRef.current + Math.PI * 2 * (5 + rand * 3); // 5-8 full turns
    const start = angleRef.current;
    const t0 = performance.now();
    const dur = 4200;

    function frame(t: number) {
      const p = Math.min(1, (t - t0) / dur);
      const ease = 1 - Math.pow(1 - p, 4); // strong ease-out, casino feel
      angleRef.current = start + (target - start) * ease;
      drawWheel(canvas, names, angleRef.current);
      if (p < 1) rafRef.current = requestAnimationFrame(frame);
      else {
        // Pointer sits at angle 0 (3 o'clock) — find the segment under it.
        const seg = (Math.PI * 2) / names.length;
        const normalized = ((-angleRef.current) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        const idx = Math.floor(normalized / seg) % names.length;
        const win = names[idx];
        setWinner(win);
        setHistory((h) => [win, ...h].slice(0, 10));
        setSpinning(false);
      }
    }
    rafRef.current = requestAnimationFrame(frame);
  }

  return (
    <div style={{ width: "100%", maxWidth: 860, margin: "0 auto", textAlign: "left", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="label">Entrants — one per line (or comma-separated)</span>
          {names.length > 0 && <span className="mono" style={{ fontSize: 12, color: "var(--ink-3)" }}>{names.length} names</span>}
        </div>
        <textarea
          value={text} onChange={(e) => setText(e.target.value)}
          placeholder={"@priya_23\n@rahul.wanders\n@meme_wali_didi\n…"}
          aria-label="Entrant names" rows={10}
          style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 16, fontSize: 14, color: "var(--ink)", resize: "vertical", lineHeight: 1.7, fontFamily: "var(--font-mono)" }}
        />
        <button className="btn btn-molten" onClick={spin} disabled={spinning || names.length < 2} style={{ height: 50, justifyContent: "center" }}>
          <RotateCw size={18} strokeWidth={1.5} className={spinning ? "coin-in" : undefined} />
          {spinning ? "Spinning…" : names.length < 2 ? "Add at least 2 names" : "Spin the wheel"}
        </button>
        {history.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span className="label">Past winners</span>
              <button className="btn btn-ghost" onClick={() => setHistory([])} style={{ fontSize: 12, minHeight: 30 }}>
                <Trash2 size={12} strokeWidth={1.5} /> Clear
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {history.map((h, i) => <span key={i} className="chip">{h}</span>)}
            </div>
          </div>
        )}
      </div>

      <div style={{ textAlign: "center" }}>
        <div style={{ position: "relative", display: "inline-block", maxWidth: "100%" }}>
          <canvas ref={canvasRef} width={420} height={420}
            style={{ width: "100%", maxWidth: 420, height: "auto", display: "block" }} />
          {names.length >= 2 && (
            <span aria-hidden="true" style={{
              position: "absolute", right: -6, top: "50%", transform: "translateY(-50%)",
              width: 0, height: 0, borderTop: "12px solid transparent", borderBottom: "12px solid transparent",
              borderRight: "22px solid var(--molten)", filter: "drop-shadow(0 1px 2px rgba(0,0,0,.3))",
            }} />
          )}
          {names.length < 2 && (
            <div className="card" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-3)", fontSize: "var(--t-small)", borderRadius: "50%" }}>
              Paste names to build the wheel
            </div>
          )}
        </div>
        {winner && (
          <div className="card intro-rise" style={{ padding: 20, marginTop: 16, borderColor: "var(--gold-300)" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, color: "var(--gold-ink)", fontWeight: 700, fontSize: 20 }}>
              <Trophy size={22} strokeWidth={1.5} /> {winner}
            </div>
            <div className="label" style={{ marginTop: 6 }}>Winner! 🎉</div>
          </div>
        )}
      </div>
    </div>
  );
}
