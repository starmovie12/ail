"use client";
import { useMemo, useState } from "react";
import { ShieldCheck, ShieldAlert, Copy, Check } from "lucide-react";
import { isBannedHashtag } from "@/lib/banned-hashtags";

function parseTags(input: string): string[] {
  const raw = input.match(/#?[\p{L}\p{N}_]+/gu) ?? [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of raw) {
    const tag = "#" + r.replace(/^#/, "").toLowerCase();
    if (tag.length < 2 || seen.has(tag)) continue;
    seen.add(tag); out.push(tag);
  }
  return out;
}

export default function HashtagChecker() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const tags = useMemo(() => parseTags(text), [text]);
  const flagged = tags.filter((t) => isBannedHashtag(t));
  const safe = tags.filter((t) => !isBannedHashtag(t));

  async function copySafe() {
    if (!safe.length) return;
    try { await navigator.clipboard.writeText(safe.join(" ")); } catch { return; }
    setCopied(true); setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span className="label">Paste your hashtags</span>
          {tags.length > 0 && <span className="mono" style={{ fontSize: 12, color: "var(--ink-3)" }}>{tags.length} tags</span>}
        </div>
        <textarea
          value={text} onChange={(e) => setText(e.target.value)}
          placeholder="#travel #wanderlust #photography #single …"
          aria-label="Hashtags input" rows={5}
          style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 16, fontSize: 15, color: "var(--ink)", resize: "vertical", lineHeight: 1.6 }}
        />
      </div>

      {tags.length > 0 && (
        <>
          {flagged.length > 0 ? (
            <div className="card" style={{ padding: 18, borderColor: "color-mix(in srgb, var(--err) 40%, var(--line))", borderWidth: 1.5 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--err)", fontWeight: 600, marginBottom: 12 }}>
                <ShieldAlert size={18} strokeWidth={1.5} /> {flagged.length} risky / banned
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {flagged.map((t) => (
                  <span key={t} className="chip" style={{ borderColor: "color-mix(in srgb, var(--err) 50%, var(--line))", color: "var(--err)" }}>{t}</span>
                ))}
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: 18, display: "inline-flex", alignItems: "center", gap: 8, color: "var(--ok)", fontWeight: 600 }}>
              <ShieldCheck size={18} strokeWidth={1.5} /> All clear — none of these are on the known banned list.
            </div>
          )}

          {safe.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span className="label">{safe.length} safe to use</span>
                <button className={`btn btn-secondary gold ${copied ? "tick" : ""}`} onClick={copySafe} style={{ fontSize: 13 }}>
                  {copied ? <Check size={14} strokeWidth={2} className="coin-in" /> : <Copy size={14} strokeWidth={1.5} />}
                  {copied ? "Copied" : "Copy safe tags"}
                </button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {safe.map((t) => <span key={t} className="chip">{t}</span>)}
              </div>
            </div>
          )}
        </>
      )}

      <p className="mono" style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.6 }}>
        Instagram never publishes an official banned list and it changes often, so treat flags as
        &ldquo;risky — best avoided,&rdquo; not a guarantee. When in doubt, drop the tag.
      </p>
    </div>
  );
}
