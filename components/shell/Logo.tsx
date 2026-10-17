import Link from "next/link";
import { BRAND } from "@/lib/brand";

/** InstaGrab logo — dark tile, gradient border, viewfinder + download arrow (Nav.tsx se). */
export function LogoMark() {
  return (
    <svg
      width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true"
      style={{
        width: "clamp(34px, 20px + 3vw, 44px)", height: "clamp(34px, 20px + 3vw, 44px)",
        borderRadius: "clamp(10px, 6px + 1vw, 13px)", boxShadow: "0 4px 18px rgb(var(--c-violet-2-rgb) / 0.45)", flexShrink: 0,
      }}
    >
      <defs>
        <linearGradient id="ig_logo_stroke" x1="0" y1="44" x2="44" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22E4FF" /><stop offset="0.5" stopColor="#6366F1" /><stop offset="1" stopColor="#D946EF" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="42" height="42" rx="12" fill="#050B24" stroke="url(#ig_logo_stroke)" strokeWidth="2" />
      <path d="M12 17V14.5C12 13.12 13.12 12 14.5 12H17M27 12H29.5C30.88 12 32 13.12 32 14.5V17M32 27V29.5C32 30.88 30.88 32 29.5 32H27M17 32H14.5C13.12 32 12 30.88 12 29.5V27" stroke="url(#ig_logo_stroke)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 16.5V26M22 26L18 22M22 26L26 22" stroke="url(#ig_logo_stroke)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Logo + website naam; tap = Home. Naam `lib/brand.ts` se. */
export default function Logo() {
  return (
    <Link href="/" aria-label={`${BRAND.name} home`} className="gh__brand">
      <LogoMark />
      <span className="gh__name">{BRAND.nameParts[0]}<span>{BRAND.nameParts[1]}</span></span>
    </Link>
  );
}
