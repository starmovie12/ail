"use client";
import { useEffect, useState } from "react";
import { AtSign, QrCode, Copy, Check, Download, Link2 } from "lucide-react";

const CLEAN_RE = /[^a-z0-9._]/g;

export default function DmLinkGenerator() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [qr, setQr] = useState<string | null>(null);
  const [copied, setCopied] = useState<"link" | null>(null);

  const handle = username.trim().replace(/^@/, "").toLowerCase().replace(CLEAN_RE, "");
  const link = handle
    ? `https://ig.me/m/${handle}${message.trim() ? `?text=${encodeURIComponent(message.trim())}` : ""}`
    : "";

  useEffect(() => {
    let cancelled = false;
    if (!link) { setQr(null); return; }
    (async () => {
      try {
        const QRCode = (await import("qrcode")).default;
        const url = await QRCode.toDataURL(link, {
          width: 480, margin: 2,
          color: { dark: "#1E1B4B", light: "#F4F6FF" },
        });
        if (!cancelled) setQr(url);
      } catch { if (!cancelled) setQr(null); }
    })();
    return () => { cancelled = true; };
  }, [link]);

  async function copyLink() {
    if (!link) return;
    try { await navigator.clipboard.writeText(link); } catch { return; }
    setCopied("link"); setTimeout(() => setCopied(null), 1400);
  }

  function downloadQr() {
    if (!qr) return;
    const a = document.createElement("a");
    a.href = qr;
    a.download = `instagrab-dm-qr-${handle}.png`;
    a.click();
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "var(--surface)", border: "1px solid var(--line)",
    borderRadius: 14, padding: "13px 16px", fontSize: 15, color: "var(--ink)",
  };

  return (
    <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <span className="label" style={{ display: "block", marginBottom: 8 }}>Your Instagram username</span>
          <div style={{ position: "relative" }}>
            <AtSign size={16} strokeWidth={1.5} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--ink-3)" }} />
            <input value={username} onChange={(e) => setUsername(e.target.value)}
              placeholder="yourhandle" aria-label="Instagram username"
              autoCapitalize="none" autoCorrect="off" spellCheck={false}
              style={{ ...inputStyle, paddingLeft: 38 }} />
          </div>
        </div>
        <div>
          <span className="label" style={{ display: "block", marginBottom: 8 }}>Pre-filled message (optional)</span>
          <input value={message} onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. Hi! I'm interested in a collab" aria-label="Pre-filled message" style={inputStyle} />
        </div>
      </div>

      {link && (
        <div className="card intro-rise" style={{ padding: 20 }}>
          <span className="label" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <Link2 size={13} strokeWidth={1.5} /> Your DM link
          </span>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <code className="well mono" style={{ padding: "12px 14px", fontSize: 13, color: "var(--gold-ink)", flex: "1 1 260px", overflowWrap: "anywhere" }}>{link}</code>
            <button className={`btn btn-secondary gold ${copied === "link" ? "tick" : ""}`} onClick={copyLink} style={{ fontSize: 13 }}>
              {copied === "link" ? <Check size={14} strokeWidth={2} className="coin-in" /> : <Copy size={14} strokeWidth={1.5} />}
              {copied === "link" ? "Copied" : "Copy link"}
            </button>
          </div>

          {qr && (
            <div style={{ display: "flex", gap: 20, alignItems: "center", marginTop: 20, flexWrap: "wrap" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qr} alt={`QR code opening a DM with @${handle}`}
                style={{ width: 160, height: 160, borderRadius: 14, border: "1px solid var(--gold-300)" }} />
              <div style={{ flex: 1, minWidth: 200 }}>
                <span className="label" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <QrCode size={13} strokeWidth={1.5} /> Scan-to-DM QR code
                </span>
                <p style={{ fontSize: "var(--t-small)", color: "var(--ink-2)", marginBottom: 12 }}>
                  Print it on packaging, posters or business cards — scanning opens a DM with you instantly.
                </p>
                <button className="btn btn-secondary gold" onClick={downloadQr} style={{ fontSize: 13 }}>
                  <Download size={14} strokeWidth={1.5} /> Download QR (PNG)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.6 }}>
        ig.me is Instagram&apos;s official DM deep-link domain — the link opens a chat with you in the app.
        Put it in your bio, link-in-bio page, email signature or ads.
      </p>
    </div>
  );
}
