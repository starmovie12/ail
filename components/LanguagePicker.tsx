"use client";
import { Globe } from "lucide-react";
import { LANGS, useI18n, type Locale } from "@/lib/i18n";

/** Compact language switcher: globe + current code, with a native <select> on top for a11y. */
export default function LanguagePicker() {
  const { lang, setLang, t } = useI18n();
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 6, minHeight: 40, padding: "0 6px" }}>
      <Globe size={18} strokeWidth={1.5} style={{ color: "var(--ink-3)" }} aria-hidden="true" />
      <span className="mono" style={{ fontSize: 12, letterSpacing: ".08em", color: "var(--ink-2)", textTransform: "uppercase" }}>
        {lang}
      </span>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as Locale)}
        aria-label={t("language")}
        style={{ position: "absolute", inset: 0, width: "100%", opacity: 0, cursor: "pointer" }}
      >
        {LANGS.map((l) => (
          <option key={l.code} value={l.code}>{l.name}</option>
        ))}
      </select>
    </span>
  );
}
