"use client";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<string>("light");
  useEffect(() => { setTheme(document.documentElement.dataset.theme ?? "light"); }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;
    root.classList.add("theming");
    root.dataset.theme = next;
    try { localStorage.setItem("ig-theme", next); } catch {}
    setTheme(next);
    setTimeout(() => root.classList.remove("theming"), 350);
  }

  return (
    <button className="btn-icon" onClick={toggle} aria-label="Toggle theme">
      {theme === "dark" ? <Sun size={20} strokeWidth={1.5} /> : <Moon size={20} strokeWidth={1.5} />}
    </button>
  );
}
