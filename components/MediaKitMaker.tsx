"use client";
import { useRef, useState } from "react";
import { FileText, Download } from "lucide-react";

type Kit = {
  name: string; handle: string; niche: string; city: string;
  followers: string; er: string; avgLikes: string; avgReach: string;
  audience: string; email: string;
  ratePost: string; rateStory: string; rateReel: string;
};

const EMPTY: Kit = {
  name: "", handle: "", niche: "", city: "",
  followers: "", er: "", avgLikes: "", avgReach: "",
  audience: "", email: "",
  ratePost: "", rateStory: "", rateReel: "",
};

const W = 1080, H = 1350; // 4:5 — posts well, prints well

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number): number {
  const words = text.split(/\s+/);
  let line = "", yy = y;
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, yy); line = w; yy += lh;
    } else line = test;
  }
  if (line) ctx.fillText(line, x, yy);
  return yy + lh;
}

function draw(canvas: HTMLCanvasElement, k: Kit) {
  const ctx = canvas.getContext("2d")!;
  canvas.width = W; canvas.height = H;

  // Ivory paper + gold frame (the InstaGrab editorial look)
  ctx.fillStyle = "#F4F6FF"; ctx.fillRect(0, 0, W, H);
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#22E4FF"); g.addColorStop(0.5, "#6366F1"); g.addColorStop(1, "#D946EF");
  ctx.strokeStyle = g; ctx.lineWidth = 6; ctx.strokeRect(28, 28, W - 56, H - 56);
  ctx.lineWidth = 1.5; ctx.strokeRect(44, 44, W - 88, H - 88);

  const gold = "#4F46E5", ink = "#0B1030", ink2 = "#414C78";
  ctx.textBaseline = "alphabetic";

  // Label
  ctx.fillStyle = gold; ctx.font = "600 26px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("M E D I A   K I T", W / 2, 130);

  // Name + handle
  ctx.fillStyle = ink; ctx.font = "700 76px Georgia, serif";
  ctx.fillText(k.name || "Your Name", W / 2, 230);
  ctx.fillStyle = ink2; ctx.font = "400 34px Georgia, serif";
  ctx.fillText(`@${(k.handle || "username").replace(/^@/, "")}`, W / 2, 285);

  // Niche · city
  ctx.fillStyle = gold; ctx.font = "600 30px Georgia, serif";
  ctx.fillText([k.niche || "Creator", k.city].filter(Boolean).join("  ·  "), W / 2, 345);

  // Divider
  ctx.strokeStyle = g; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(200, 390); ctx.lineTo(W - 200, 390); ctx.stroke();

  // Stat grid (2×2)
  const stats: [string, string][] = [
    [k.followers || "—", "FOLLOWERS"],
    [(k.er ? k.er + "%" : "—"), "ENGAGEMENT RATE"],
    [k.avgLikes || "—", "AVG LIKES"],
    [k.avgReach || "—", "AVG REACH"],
  ];
  stats.forEach(([v, label], i) => {
    const cx = i % 2 === 0 ? W / 2 - 220 : W / 2 + 220;
    const cy = 500 + Math.floor(i / 2) * 190;
    ctx.fillStyle = ink; ctx.font = "700 64px Georgia, serif";
    ctx.fillText(v, cx, cy);
    ctx.fillStyle = ink2; ctx.font = "500 22px Georgia, serif";
    ctx.fillText(label, cx, cy + 40);
  });

  // Audience line
  let y = 940;
  if (k.audience) {
    ctx.fillStyle = gold; ctx.font = "600 24px Georgia, serif";
    ctx.fillText("A U D I E N C E", W / 2, y); y += 44;
    ctx.fillStyle = ink2; ctx.font = "400 28px Georgia, serif";
    y = wrap(ctx, k.audience, W / 2, y, W - 300, 38) + 10;
  } else y = 960;

  // Rates
  const rates = [
    k.ratePost && `Post ${k.ratePost}`,
    k.rateReel && `Reel ${k.rateReel}`,
    k.rateStory && `Story ${k.rateStory}`,
  ].filter(Boolean) as string[];
  if (rates.length) {
    ctx.fillStyle = gold; ctx.font = "600 24px Georgia, serif";
    ctx.fillText("C O L L A B   R A T E S", W / 2, y + 20);
    ctx.fillStyle = ink; ctx.font = "700 40px Georgia, serif";
    ctx.fillText(rates.join("   ·   "), W / 2, y + 80);
    y += 130;
  }

  // Contact footer
  ctx.strokeStyle = g; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(200, H - 180); ctx.lineTo(W - 200, H - 180); ctx.stroke();
  ctx.fillStyle = ink; ctx.font = "600 32px Georgia, serif";
  ctx.fillText(k.email || "your@email.com", W / 2, H - 120);
  ctx.fillStyle = ink2; ctx.font = "400 20px Georgia, serif";
  ctx.fillText("Made free with InstaGrab", W / 2, H - 75);
}

const FIELDS: { id: keyof Kit; label: string; ph: string; half?: boolean }[] = [
  { id: "name", label: "Name / brand", ph: "Priya Sharma", half: true },
  { id: "handle", label: "Instagram handle", ph: "priya.bakes", half: true },
  { id: "niche", label: "Niche", ph: "Home baking & desserts", half: true },
  { id: "city", label: "City (optional)", ph: "Pune", half: true },
  { id: "followers", label: "Followers", ph: "24.5K", half: true },
  { id: "er", label: "Engagement rate %", ph: "4.2", half: true },
  { id: "avgLikes", label: "Avg likes", ph: "1,100", half: true },
  { id: "avgReach", label: "Avg reach", ph: "18K", half: true },
  { id: "audience", label: "Audience one-liner (optional)", ph: "78% women 18-34 · top cities Mumbai, Pune, Delhi" },
  { id: "ratePost", label: "Post rate (optional)", ph: "₹8,000", half: true },
  { id: "rateReel", label: "Reel rate (optional)", ph: "₹12,000", half: true },
  { id: "rateStory", label: "Story rate (optional)", ph: "₹3,000", half: true },
  { id: "email", label: "Contact email", ph: "collab@priyabakes.in", half: true },
];

export default function MediaKitMaker() {
  const [kit, setKit] = useState<Kit>(EMPTY);
  const [preview, setPreview] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function set(id: keyof Kit, v: string) { setKit((p) => ({ ...p, [id]: v })); }

  function render() {
    const canvas = canvasRef.current ?? document.createElement("canvas");
    draw(canvas, kit);
    setPreview(canvas.toDataURL("image/png"));
  }

  function download() {
    const canvas = document.createElement("canvas");
    draw(canvas, kit);
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `${(kit.handle || "media-kit").replace(/^@/, "")}-media-kit.png`;
    a.click();
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "var(--surface)", border: "1px solid var(--line)",
    borderRadius: 12, padding: "11px 14px", fontSize: 14, color: "var(--ink)",
  };

  return (
    <div style={{ width: "100%", maxWidth: 960, margin: "0 auto", textAlign: "left", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {FIELDS.map((f) => (
            <div key={f.id} style={{ gridColumn: f.half ? undefined : "1 / -1" }}>
              <span className="label" style={{ display: "block", marginBottom: 6, fontSize: 10 }}>{f.label}</span>
              <input value={kit[f.id]} onChange={(e) => set(f.id, e.target.value)} placeholder={f.ph}
                aria-label={f.label} style={inputStyle} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button className="btn btn-secondary gold" onClick={render} style={{ flex: 1, justifyContent: "center" }}>
            <FileText size={16} strokeWidth={1.5} /> Preview
          </button>
          <button className="btn btn-molten" onClick={download} style={{ flex: 1, justifyContent: "center" }}>
            <Download size={16} strokeWidth={1.5} /> Download PNG
          </button>
        </div>
      </div>

      <div>
        <canvas ref={canvasRef} style={{ display: "none" }} />
        {preview ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={preview} alt="Media kit preview" className="card intro-rise"
            style={{ width: "100%", borderRadius: 20, display: "block", padding: 0 }} />
        ) : (
          <div className="card" style={{ padding: 24, aspectRatio: "4/5", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", color: "var(--ink-3)", fontSize: "var(--t-small)" }}>
            Fill the form and hit Preview —<br />your gold-framed media kit appears here.
          </div>
        )}
      </div>
    </div>
  );
}
