"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Reveal from "./Reveal";
import { DEFAULT_FAQ, type QA } from "@/lib/seo";

export type { QA };

export default function FAQ({ items = DEFAULT_FAQ }: { items?: QA[] }) {
  const [open, setOpen] = useState<number>(-1);
  return (
    <section id="faq" className="section" style={{ paddingTop: 0 }}>
      <div className="container" style={{ maxWidth: 760 }}>
        <Reveal>
          <span className="label">FAQ</span>
          <h2 style={{ marginTop: 12, marginBottom: 32 }}>Quiet answers.</h2>
        </Reveal>
        <Reveal>
          <div style={{ borderTop: "1px solid var(--line)" }}>
            {items.map((item, i) => (
              <div key={i} style={{ borderBottom: "1px solid var(--line)" }}>
                <button
                  onClick={() => setOpen(open === i ? -1 : i)}
                  aria-expanded={open === i}
                  style={{
                    display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between",
                    gap: 16, padding: "18px 4px", background: "none", border: "none", cursor: "pointer",
                    fontWeight: 600, fontSize: "var(--t-body)", textAlign: "left",
                  }}>
                  {item.q}
                  <ChevronDown size={20} strokeWidth={1.5} style={{
                    flexShrink: 0, color: "var(--ink-3)",
                    transform: open === i ? "rotate(180deg)" : "none",
                    transition: "transform 300ms var(--ease-hinge)",
                  }} />
                </button>
                <div className={`expander ${open === i ? "open" : ""}`}>
                  <div>
                    <p style={{ color: "var(--ink-2)", padding: "0 4px 18px", fontSize: "var(--t-small)", maxWidth: "60ch" }}>{item.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
