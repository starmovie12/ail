"use client";
import Logo from "./Logo";
import ThemeToggle from "@/components/ThemeToggle";
import LanguagePicker from "@/components/LanguagePicker";

/** PRD §5 — left: Logo + naam · right: sirf Language + Light/Dark. Aur kuch nahi. */
export default function GlobalHeader() {
  return (
    <header className="gh" role="banner">
      <div className="gh__in">
        <Logo />
        <div className="gh__right">
          <span className="gh__lang"><LanguagePicker /></span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
