"use client";
import { useMemo, useState } from "react";
import { Copy, Check, Link2 } from "lucide-react";

const FIELDS: { id: string; label: string; ph: string; required?: boolean }[] = [
  { id: "url", label: "Destination URL", ph: "https://yourstore.in/product", required: true },
  { id: "source", label: "utm_source", ph: "instagram", required: true },
  { id: "medium", label: "utm_medium", ph: "bio / story / reel / dm" },
  { id: "campaign", label: "utm_campaign", ph: "diwali_sale" },
  { id: "content", label: "utm_content", ph: "reel_2_cta" },
];

export default function UtmBuilder() {
  const [v, setV] = useState<Record<string, string>>({ source: "instagram", medium: "bio" });
  const [copied, setCopied] = useState(false);

  const built = useMemo(() => {
    const raw = (v.url ?? "").trim();
    if (!raw) return null;
    let url: URL;
    try { url = new URL(raw.startsWith("http") ? raw : "https://" + raw); } catch { return null; }
    const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, "_");
    if (v.source?.trim()) url.searchParams.set("utm_source", norm(v.source));
    if (v.medium?.trim()) url.searchParams.set("utm_medium", norm(v.medium));
    if (v.campaign?.trim()) url.searchParams.set("utm_campaign", norm(v.campaign));
    if (v.content?.trim()) url.searchParams.set("utm_content", norm(v.content));
    return url.toString();
  }, [v]);

  async function copy() {
    if (!built) return;
    try { await navigator.clipboard.writeText(built); } catch { return; }
    setCopied(true); setTimeout(() => setCopied(false), 1400);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "var(--surface)", border: "1px solid var(--line)",
    borderRadius: 12, padding: "11px 14px", fontSize: 14, color: "var(--ink)",
  };

  return (
    <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="card" style={{ padding: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        {FIELDS.map((f) => (
          <div key={f.id} style={{ gridColumn: f.id === "url" ? "1 / -1" : undefined }}>
            <span className="label" style={{ display: "block", marginBottom: 6, fontSize: 10 }}>
              {f.label}{f.required ? " *" : ""}
            </span>
            <input value={v[f.id] ?? ""} onChange={(e) => setV((p) => ({ ...p, [f.id]: e.target.value }))}
              placeholder={f.ph} aria-label={f.label} style={inputStyle} />
          </div>
        ))}
      </div>

      {built && (
        <div className="card intro-rise" style={{ padding: 20 }}>
          <span className="label" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <Link2 size={13} strokeWidth={1.5} /> Tracking link, ready
          </span>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <code className="well mono" style={{ padding: "12px 14px", fontSize: 13, color: "var(--gold-ink)", flex: "1 1 260px", overflowWrap: "anywhere" }}>{built}</code>
            <button className={`btn btn-secondary gold ${copied ? "tick" : ""}`} onClick={copy} style={{ fontSize: 13 }}>
              {copied ? <Check size={14} strokeWidth={2} className="coin-in" /> : <Copy size={14} strokeWidth={1.5} />}
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
        </div>
      )}

      <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.6 }}>
        UTM parameters show up in Google Analytics (Acquisition → Traffic) so you can see exactly which
        Instagram placement — bio, story, reel, DM — actually sends buyers. Spaces become underscores automatically.
      </p>
    </div>
  );
}
