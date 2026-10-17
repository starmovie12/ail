"use client";
import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Download, Trophy } from "lucide-react";

const W = 1080, H = 1080;

function certId(): string {
  const rand = crypto.getRandomValues(new Uint32Array(2));
  return (rand[0].toString(36) + rand[1].toString(36)).toUpperCase().slice(0, 10);
}

function draw(canvas: HTMLCanvasElement, winner: string, prize: string, host: string, id: string) {
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#F4F6FF"; ctx.fillRect(0, 0, W, H);
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#22E4FF"); g.addColorStop(0.5, "#6366F1"); g.addColorStop(1, "#D946EF");
  ctx.strokeStyle = g; ctx.lineWidth = 8; ctx.strokeRect(32, 32, W - 64, H - 64);
  ctx.lineWidth = 1.5; ctx.strokeRect(52, 52, W - 104, H - 104);

  ctx.textAlign = "center";
  ctx.fillStyle = "#4F46E5";
  ctx.font = "600 26px Georgia, serif";
  ctx.fillText("O F F I C I A L   G I V E A W A Y   R E S U L T", W / 2, 150);

  ctx.font = "700 110px Georgia, serif";
  ctx.fillText("🏆", W / 2, 300);

  ctx.fillStyle = "#414C78";
  ctx.font = "400 30px Georgia, serif";
  ctx.fillText("The winner is", W / 2, 390);

  ctx.fillStyle = "#0B1030";
  ctx.font = "700 72px Georgia, serif";
  const name = "@" + (winner || "winner").replace(/^@/, "");
  ctx.fillText(name.length > 24 ? name.slice(0, 23) + "…" : name, W / 2, 480);

  if (prize.trim()) {
    ctx.fillStyle = "#4F46E5";
    ctx.font = "600 34px Georgia, serif";
    ctx.fillText(prize.trim().slice(0, 50), W / 2, 560);
  }

  ctx.strokeStyle = g; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(240, 640); ctx.lineTo(W - 240, 640); ctx.stroke();

  ctx.fillStyle = "#414C78"; ctx.font = "400 26px Georgia, serif";
  ctx.fillText(`Drawn randomly ${host.trim() ? "by @" + host.trim().replace(/^@/, "") : ""} on ${new Date().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}`, W / 2, 700);

  ctx.fillStyle = "#8C8478"; ctx.font = "500 22px monospace";
  ctx.fillText(`Certificate ID: ${id}`, W / 2, 760);

  ctx.fillStyle = "#414C78"; ctx.font = "400 22px Georgia, serif";
  ctx.fillText("Picked with a cryptographically random draw — every entry had an equal chance.", W / 2, 880);
  ctx.fillStyle = "#4F46E5"; ctx.font = "600 24px Georgia, serif";
  ctx.fillText("Verified draw · InstaGrab giveaway tools", W / 2, 950);
}

function CertificateInner() {
  const params = useSearchParams();
  const [winner, setWinner] = useState(params.get("winner") ?? "");
  const [prize, setPrize] = useState("");
  const [host, setHost] = useState("");
  const [id] = useState(certId);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) draw(canvasRef.current, winner, prize, host, id);
  }, [winner, prize, host, id]);

  function download() {
    const canvas = document.createElement("canvas");
    draw(canvas, winner, prize, host, id);
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `winner-certificate-${id}.png`;
    a.click();
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "var(--surface)", border: "1px solid var(--line)",
    borderRadius: 12, padding: "11px 14px", fontSize: 14, color: "var(--ink)",
  };

  return (
    <div style={{ width: "100%", maxWidth: 860, margin: "0 auto", textAlign: "left", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
      <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        {([["Winner's username", winner, setWinner, "@lucky_winner"],
          ["Prize (optional)", prize, setPrize, "₹2000 Amazon voucher"],
          ["Your handle (optional)", host, setHost, "@yourbrand"]] as [string, string, (v: string) => void, string][]).map(([label, val, set, ph]) => (
          <div key={label}>
            <span className="label" style={{ display: "block", marginBottom: 6, fontSize: 10 }}>{label}</span>
            <input value={val} onChange={(e) => set(e.target.value)} placeholder={ph} aria-label={label} style={inputStyle} />
          </div>
        ))}
        <div className="well" style={{ padding: 12 }}>
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>Certificate ID (unique to this draw)</span>
          <b className="mono" style={{ display: "block", fontSize: 15, color: "var(--gold-ink)", marginTop: 2 }}>{id}</b>
        </div>
        <button className="btn btn-molten" onClick={download} style={{ height: 50, justifyContent: "center" }}>
          <Download size={16} strokeWidth={1.5} /> Download certificate PNG
        </button>
      </div>
      <div>
        <span className="label" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <Trophy size={13} strokeWidth={1.5} /> Live preview
        </span>
        <canvas ref={canvasRef} style={{ width: "100%", height: "auto", borderRadius: 18, border: "1px solid var(--line)", display: "block" }} />
      </div>
    </div>
  );
}

export default function WinnerCertificate() {
  return (
    <Suspense fallback={null}>
      <CertificateInner />
    </Suspense>
  );
}
