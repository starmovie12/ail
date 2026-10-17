"use client";
import { useMemo, useState } from "react";
import { Copy, Check, Eraser, ShieldAlert } from "lucide-react";
import { isBannedHashtag } from "@/lib/banned-hashtags";

const LIMIT = 30;

function parse(input: string) {
  const raw = input.match(/#?[\p{L}\p{N}_]+/gu) ?? [];
  const seen = new Set<string>();
  const unique: string[] = [];
  let duplicates = 0;
  for (const r of raw) {
    const tag = "#" + r.replace(/^#/, "").toLowerCase();
    if (tag.length < 2) continue;
    if (seen.has(tag)) { duplicates++; continue; }
    seen.add(tag); unique.push(tag);
  }
  const banned = unique.filter((t) => isBannedHashtag(t));
  const clean = unique.filter((t) => !isBannedHashtag(t));
  return { total: raw.length, unique, duplicates, banned, clean };
}

export default function HashtagCounter() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const r = useMemo(() => parse(text), [text]);

  const overLimit = r.clean.length > LIMIT;
  const output = r.clean.slice(0, LIMIT).join(" ");

  async function copyClean() {
    if (!output) return;
    try { await navigator.clipboard.writeText(output); } catch { return; }
    setCopied(true); setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span className="label">Paste your hashtag list</span>
          {text && (
            <button className="btn btn-ghost" onClick={() => setText("")} style={{ fontSize: 12, minHeight: 32 }}>
              <Eraser size={13} strokeWidth={1.5} /> Clear
            </button>
          )}
        </div>
        <textarea
          value={text} onChange={(e) => setText(e.target.value)}
          placeholder="#reels #viral #trending #viral #instagood …"
          aria-label="Hashtags input" rows={5}
          style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 16, fontSize: 15, color: "var(--ink)", resize: "vertical", lineHeight: 1.6 }}
        />
      </div>

      {r.unique.length > 0 && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 12 }}>
            {([
              ["Unique tags", r.unique.length, r.unique.length > LIMIT ? "var(--err)" : undefined],
              ["Duplicates removed", r.duplicates, r.duplicates ? "var(--warn)" : undefined],
              ["Risky / banned", r.banned.length, r.banned.length ? "var(--err)" : "var(--ok)"],
              ["Clean & ready", Math.min(r.clean.length, LIMIT), "var(--ok)"],
            ] as [string, number, string | undefined][]).map(([k, v, color]) => (
              <div key={k} className="well" style={{ padding: 14, textAlign: "center" }}>
                <div className="mono" style={{ fontSize: 20, fontWeight: 700, color }}>{v}</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{k}</div>
              </div>
            ))}
          </div>

          {r.banned.length > 0 && (
            <div className="card" style={{ padding: 18, borderColor: "color-mix(in srgb, var(--err) 40%, var(--line))", borderWidth: 1.5 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--err)", fontWeight: 600, marginBottom: 12 }}>
                <ShieldAlert size={18} strokeWidth={1.5} /> Dropped from the clean set
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {r.banned.map((t) => (
                  <span key={t} className="chip" style={{ borderColor: "color-mix(in srgb, var(--err) 50%, var(--line))", color: "var(--err)" }}>{t}</span>
                ))}
              </div>
            </div>
          )}

          {output && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span className="label">
                  Cleaned set{overLimit ? ` — trimmed to Instagram’s ${LIMIT}-tag limit` : ""}
                </span>
                <button className={`btn btn-secondary gold ${copied ? "tick" : ""}`} onClick={copyClean} style={{ fontSize: 13 }}>
                  {copied ? <Check size={14} strokeWidth={2} className="coin-in" /> : <Copy size={14} strokeWidth={1.5} />}
                  {copied ? "Copied" : "Copy clean set"}
                </button>
              </div>
              <div className="well" style={{ padding: 16, fontSize: "var(--t-small)", color: "var(--ink-2)", lineHeight: 1.8, userSelect: "all" }}>
                {output}
              </div>
            </div>
          )}
        </>
      )}

      <p className="mono" style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.6 }}>
        Instagram allows up to {LIMIT} hashtags per post — duplicates and over-limit tags are silently a wasted slot.
        This cleaner dedupes, drops known risky tags, and trims to {LIMIT} so every tag counts.
      </p>
    </div>
  );
}
