"use client";
import { useI18n } from "@/lib/i18n";

/**
 * Neon card ke sabse neeche wali strip (photo jaisi):
 *   ── (halki dandi)  [shield-lock]  No login · Public content only · Links are never stored  (halki dandi) ──
 * Text i18n ke `trust` key se aata hai (" · " se split karke dots accent colour mein).
 * Styles: app/globals.css ke `.gb-neon .gbn-foot*`.
 */
export default function TrustFootBar() {
  const { t } = useI18n();
  const parts = t("trust").split(" · ");

  return (
    <div className="gbn-foot" role="note">
      <span className="gbn-foot__rule gbn-foot__rule--l" aria-hidden="true" />
      <p className="gbn-foot__text">
        <svg
          className="gbn-foot__icon"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 2.5 4.5 5.5v5.7c0 4.6 3.1 8.5 7.5 10.3 4.4-1.8 7.5-5.7 7.5-10.3V5.5L12 2.5Z" />
          <rect x="9" y="10.8" width="6" height="4.8" rx="1" fill="currentColor" fillOpacity=".25" />
          <path d="M10.3 10.8V9.6a1.7 1.7 0 0 1 3.4 0v1.2" />
        </svg>
        {parts.map((p, i) => (
          <span key={i} className="gbn-foot__part">
            {i > 0 && <span className="gbn-foot__dot" aria-hidden="true">·</span>}
            {p}
          </span>
        ))}
      </p>
      <span className="gbn-foot__rule gbn-foot__rule--r" aria-hidden="true" />
    </div>
  );
}
