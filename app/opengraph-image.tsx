import { ImageResponse } from "next/og";

export const alt = "InstaGrab — Download anything from Instagram, beautifully";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#050B24",
          backgroundImage: "radial-gradient(ellipse 900px 500px at 50% 10%, rgba(124,58,237,.45), transparent 65%), radial-gradient(ellipse 700px 400px at 12% 0%, rgba(34,228,255,.22), transparent 70%)",
          color: "#F1F5FF",
          fontSize: 72,
          textAlign: "center",
        }}
      >
        <svg width="96" height="96" viewBox="0 0 32 32" fill="none">
          <rect x="1.5" y="1.5" width="29" height="29" rx="8" stroke="#22E4FF" strokeWidth="1.8" />
          <path d="M13 11.5l8 4.5-8 4.5v-9z" stroke="#22E4FF" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
        <div style={{ display: "flex", marginTop: 40, fontWeight: 700 }}>
          Download anything from Instagram
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 16,
            fontSize: 40,
            color: "#22E4FF",
          }}
        >
          Reels · Photos · Stories · Captions · Hashtags
        </div>
        <div style={{ display: "flex", marginTop: 48, fontSize: 28, color: "#8E9AC4", letterSpacing: 4 }}>
          INSTAGRAB — THE GOLD STANDARD
        </div>
      </div>
    ),
    { ...size }
  );
}
