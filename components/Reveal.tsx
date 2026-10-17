"use client";
import { useEffect, useRef } from "react";

/** Scroll reveal wrapper (§8.3). Fires once. Pass index for 70ms stagger. */
export default function Reveal({ children, index = 0, as: Tag = "div", className = "", style, id }:
  { children: React.ReactNode; index?: number; as?: React.ElementType; className?: string; style?: React.CSSProperties; id?: string }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }), { threshold: .18, rootMargin: "0px 0px -8% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} id={id} className={`reveal ${className}`} style={{ ...style, ["--i" as string]: index }}>
      {children}
    </Tag>
  );
}
