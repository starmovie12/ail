"use client";
import { useState } from "react";
import { Copy, Check, TrendingUp, Music, Clapperboard } from "lucide-react";

/**
 * U5 — Trend Radar India. Curated evergreen-leaning data, refreshed with the
 * repo — an honest "updated regularly" list, not a fake live feed.
 */
const UPDATED = "July 2026";

const HASHTAG_SETS: { category: string; tags: string[] }[] = [
  { category: "General India reach", tags: ["#india", "#instagramreels", "#reelsindia", "#reelitfeelit", "#reelkarofeelkaro", "#trendingreels", "#viralreels", "#explorepage", "#instadaily", "#reelsinstagram"] },
  { category: "Desi / relatable", tags: ["#desimemes", "#desivibes", "#relatable", "#justindianthings", "#desicomedy", "#indianmemes", "#middleclassmemes", "#sastenakhre", "#bakwaas", "#fun"] },
  { category: "Food India", tags: ["#indianfood", "#streetfoodindia", "#foodblogger", "#delhifood", "#mumbaifood", "#foodreels", "#gharkakhana", "#foodie", "#recipereels", "#desikhana"] },
  { category: "Fashion & beauty", tags: ["#indianfashion", "#ethnicwear", "#sareelove", "#outfitideas", "#grwm", "#indianwedding", "#makeupindia", "#fashionreels", "#stylegram", "#ootdindia"] },
  { category: "Travel India", tags: ["#incredibleindia", "#travelindia", "#indiatravel", "#himachal", "#kashmir", "#goa", "#travelreels", "#mountainlove", "#wanderlust", "#indiatourism"] },
  { category: "Fitness & motivation", tags: ["#fitindia", "#gymmotivation", "#fitnessindia", "#desigym", "#workoutreels", "#transformation", "#hustle", "#motivationhindi", "#selfimprovement", "#discipline"] },
];

const AUDIO_TIPS = [
  "Trending Hindi remix + slow-mo transition — the evergreen combo for fashion and travel reels.",
  "Old Bollywood songs (90s) sped up 1.25× keep resurfacing every few weeks — check the Reels audio page daily.",
  "Dialogue audios from current OTT shows spike within 48 hours of release — early users ride the wave.",
  "Original voiceovers in Hinglish outperform music-only for education and finance niches right now.",
  "Devotional/festival audio spikes predictably before every festival — prep Diwali/Holi content 2 weeks early.",
];

const FORMATS = [
  { name: "Photo-dump carousel with one-line Hinglish captions", note: "High saves, low effort — works in every niche." },
  { name: "\"POV:\" text-overlay reels (2-4 seconds)", note: "Shortest format that still travels; loops inflate watch time." },
  { name: "Street interviews with a twist question", note: "Delhi/Mumbai creators are getting outsized reach with these." },
  { name: "Before/after transformations (fitness, rooms, outfits)", note: "The transition IS the hook — no caption needed." },
  { name: "Mini-vlog 'a day in my life' with desi audio", note: "Relatability engine — comments full of 'same yaar'." },
];

function TagSet({ set }: { set: (typeof HASHTAG_SETS)[number] }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(set.tags.join(" ")); } catch { return; }
    setCopied(true); setTimeout(() => setCopied(false), 1400);
  }
  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 8 }}>
        <b style={{ fontSize: 14 }}>{set.category}</b>
        <button className={`btn btn-secondary gold ${copied ? "tick" : ""}`} onClick={copy} style={{ fontSize: 12 }}>
          {copied ? <Check size={13} strokeWidth={2} className="coin-in" /> : <Copy size={13} strokeWidth={1.5} />}
          {copied ? "Copied" : "Copy set"}
        </button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {set.tags.map((t) => <span key={t} className="chip" style={{ fontSize: 12 }}>{t}</span>)}
      </div>
    </div>
  );
}

export default function TrendingIndia() {
  return (
    <div style={{ width: "100%", maxWidth: 860, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 24 }}>
      <p className="mono" style={{ fontSize: 12, color: "var(--gold-ink)", textAlign: "center" }}>
        Curated by humans · updated regularly · last refresh: {UPDATED}
      </p>

      <div>
        <span className="label" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14, color: "var(--gold-ink)" }}>
          <TrendingUp size={14} strokeWidth={1.5} /> Hashtag sets by category
        </span>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          {HASHTAG_SETS.map((s) => <TagSet key={s.category} set={s} />)}
        </div>
      </div>

      <div>
        <span className="label" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14, color: "var(--gold-ink)" }}>
          <Music size={14} strokeWidth={1.5} /> Audio strategy right now
        </span>
        <div className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          {AUDIO_TIPS.map((tip, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span className="mono" style={{ color: "var(--gold-ink)", fontSize: 12, flexShrink: 0, marginTop: 2 }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ fontSize: "var(--t-small)", color: "var(--ink-2)" }}>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <span className="label" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14, color: "var(--gold-ink)" }}>
          <Clapperboard size={14} strokeWidth={1.5} /> Formats working in India
        </span>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          {FORMATS.map((f) => (
            <div key={f.name} className="well" style={{ padding: 16 }}>
              <b style={{ fontSize: 13.5, display: "block", marginBottom: 4 }}>{f.name}</b>
              <span style={{ fontSize: 12.5, color: "var(--ink-3)" }}>{f.note}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.6 }}>
        Trends move fast — treat this as your starting radar, then verify inside the app (Reels → audio page shows
        the ↗ trending arrow). Found something we missed? It&apos;ll be in the next refresh.
      </p>
    </div>
  );
}
