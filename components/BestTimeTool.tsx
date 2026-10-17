"use client";
import { useMemo, useState } from "react";
import { CalendarClock, Sparkles } from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type Region = { id: string; label: string };
const REGIONS: Region[] = [
  { id: "india", label: "India (IST)" },
  { id: "us", label: "USA (ET)" },
  { id: "europe", label: "Europe (CET)" },
  { id: "global", label: "Global mix" },
];

type NicheShift = { id: string; label: string; shift: number; weekendBoost: boolean };
const NICHES: NicheShift[] = [
  { id: "general", label: "General / Lifestyle", shift: 0, weekendBoost: false },
  { id: "fitness", label: "Fitness & Health", shift: -2, weekendBoost: true },
  { id: "food", label: "Food & Cooking", shift: 1, weekendBoost: true },
  { id: "business", label: "Business & Finance", shift: -1, weekendBoost: false },
  { id: "entertainment", label: "Entertainment & Memes", shift: 2, weekendBoost: true },
  { id: "fashion", label: "Fashion & Beauty", shift: 1, weekendBoost: true },
  { id: "education", label: "Education", shift: 0, weekendBoost: false },
  { id: "travel", label: "Travel", shift: 0, weekendBoost: true },
];

/**
 * Base engagement-by-hour curves per region (0–23, higher = better), built
 * from published posting-time studies: commute + lunch + evening peaks for
 * India; lunch + late-evening for the US; similar shape shifted for Europe.
 */
const CURVES: Record<string, number[]> = {
  india:  [1,0,0,0,0,1,2,4,5,5,4,6,8,7,5,4,5,6,7,9,10,9,6,3],
  us:     [2,1,0,0,0,1,3,5,6,6,7,8,9,8,6,5,5,6,7,8,9,8,5,3],
  europe: [1,0,0,0,0,1,3,5,7,7,6,7,9,8,6,5,6,7,9,9,8,6,4,2],
  global: [2,1,1,0,0,1,3,5,6,6,6,7,8,8,6,5,5,6,8,9,9,8,5,3],
};

function fmtHour(h: number): string {
  const hh = ((h % 24) + 24) % 24;
  const ampm = hh < 12 ? "AM" : "PM";
  const disp = hh % 12 === 0 ? 12 : hh % 12;
  return `${disp} ${ampm}`;
}

/** Day-of-week multiplier — midweek is strongest on Instagram, Sunday softest. */
const DAY_WEIGHT = [1.0, 1.05, 1.1, 1.08, 1.0, 0.9, 0.85];

export default function BestTimeTool() {
  const [region, setRegion] = useState("india");
  const [niche, setNiche] = useState("general");

  const plan = useMemo(() => {
    const curve = CURVES[region] ?? CURVES.global;
    const n = NICHES.find((x) => x.id === niche) ?? NICHES[0];
    const shifted = curve.map((_, h) => curve[(((h - n.shift) % 24) + 24) % 24]);

    const days = DAYS.map((day, di) => {
      let weight = DAY_WEIGHT[di];
      if (n.weekendBoost && di >= 5) weight += 0.25;
      const scored = shifted.map((v, h) => ({ h, score: v * weight }));
      const top = [...scored].sort((a, b) => b.score - a.score).slice(0, 3).sort((a, b) => a.h - b.h);
      return { day, top, weight };
    });

    const golden = days
      .flatMap((d) => d.top.map((t) => ({ day: d.day, h: t.h, score: t.score })))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return { days, golden };
  }, [region, niche]);

  const selStyle: React.CSSProperties = {
    width: "100%", background: "var(--surface)", border: "1px solid var(--line)",
    borderRadius: 14, padding: "13px 16px", fontSize: 15, color: "var(--ink)", appearance: "auto",
  };

  return (
    <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="card" style={{ padding: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <div>
          <span className="label" style={{ display: "block", marginBottom: 8 }}>Audience location</span>
          <select value={region} onChange={(e) => setRegion(e.target.value)} aria-label="Audience region" style={selStyle}>
            {REGIONS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </div>
        <div>
          <span className="label" style={{ display: "block", marginBottom: 8 }}>Your niche</span>
          <select value={niche} onChange={(e) => setNiche(e.target.value)} aria-label="Content niche" style={selStyle}>
            {NICHES.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
          </select>
        </div>
      </div>

      <div className="card intro-rise" style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Sparkles size={16} strokeWidth={1.5} style={{ color: "var(--gold-ink)" }} />
          <span className="label" style={{ color: "var(--gold-ink)" }}>Golden windows this week</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 22 }}>
          {plan.golden.map((g, i) => (
            <div key={i} className="well" style={{ padding: 14, textAlign: "center", borderColor: i === 0 ? "var(--gold-300)" : undefined }}>
              <div className="mono" style={{ fontSize: 20, fontWeight: 700 }}>{g.day} · {fmtHour(g.h)}</div>
              <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{i === 0 ? "Best slot of the week" : `#${i + 1} window`}</div>
            </div>
          ))}
        </div>

        <span className="label" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <CalendarClock size={15} strokeWidth={1.5} /> Day-by-day plan
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {plan.days.map((d) => (
            <div key={d.day} style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span className="mono" style={{ width: 42, fontSize: 13, fontWeight: 700, color: "var(--ink-2)" }}>{d.day}</span>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {d.top.map((t) => <span key={t.h} className="chip">{fmtHour(t.h)}</span>)}
              </div>
            </div>
          ))}
        </div>

        <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 20, lineHeight: 1.6 }}>
          Built from published posting-time studies, adjusted for your niche and audience timezone.
          Your own audience is the final judge — test these windows for 2 weeks and keep what wins.
          Pair this with the profile audit to see when your posts actually land.
        </p>
      </div>
    </div>
  );
}
