/**
 * Brand — naam, tagline, logo text aur theme colours EK hi jagah (PRD §3.1, D1).
 * OmniGrab me badalna ho to sirf yahin ki values (aur manifest/SEO strings) badlo.
 * Colours app/tokens.css ke tokens se aate hain (cyan → violet → magenta).
 */
export const BRAND = {
  name: "InstaGrab",
  /** Logo me do hisse: plain + gradient */
  nameParts: ["Insta", "Grab"] as const,
  tagline: "All-in-One Social Downloader & Creator Super-App",
  short: "InstaGrab",
  bgDark: "#050B24",
  bgLight: "#F4F6FF",
  copyright: "© 2026 InstaGrab · Made for creators",
  disclaimer:
    "InstaGrab is not affiliated with Instagram™ or Meta. We do not host any content. All content belongs to its respective owners. Download only content you own or have permission to use.",
} as const;
