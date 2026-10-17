import { NextRequest, NextResponse } from "next/server";
import { extract, ExtractError } from "@/lib/instagram-extractor";
import { callGemini, AiError } from "@/lib/ai";
import { isRateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Reel → text transcript (the tool nobody else on the internet has):
 * extract the reel's audio track, send it to Gemini as inline audio, return
 * the spoken script. Hindi/English/Hinglish all come back faithfully.
 */
const MAX_AUDIO_BYTES = 15 * 1024 * 1024; // Gemini inline limit is ~20MB; stay safe

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  // Transcription is the most expensive call on the site — keep it tight.
  if (isRateLimited("transcribe:" + ip, 3)) {
    return NextResponse.json(
      { error: "Transcription is rate-limited — please wait a minute between reels." },
      { status: 429 }
    );
  }

  let url = "";
  try {
    const body = await req.json();
    url = String(body?.url ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!url) return NextResponse.json({ error: "Paste a reel link first." }, { status: 400 });

  try {
    const result = await extract(url);
    const media = result.media.find((m) => m.type === "video") ?? result.media[0];
    if (!media) return NextResponse.json({ error: "No media found at that link." }, { status: 404 });

    // Prefer the audio-only DASH track (small); fall back to the video file.
    const srcUrl = media.audioUrl ?? (media.type === "video" ? media.url : null);
    if (!srcUrl) {
      return NextResponse.json({ error: "This post has no audio to transcribe — is it a photo?" }, { status: 400 });
    }
    const mimeType = media.audioUrl ? "audio/mp4" : "video/mp4";

    const upstream = await fetch(srcUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });
    if (!upstream.ok) {
      return NextResponse.json({ error: "The media link expired — try extracting again." }, { status: 502 });
    }
    const len = Number(upstream.headers.get("content-length") ?? 0);
    if (len > MAX_AUDIO_BYTES) {
      return NextResponse.json({ error: "This reel's audio is too large to transcribe (limit ~15MB)." }, { status: 413 });
    }
    const buf = Buffer.from(await upstream.arrayBuffer());
    if (buf.byteLength > MAX_AUDIO_BYTES) {
      return NextResponse.json({ error: "This reel's audio is too large to transcribe (limit ~15MB)." }, { status: 413 });
    }

    const text = await callGemini([
      { inlineData: { mimeType, data: buf.toString("base64") } },
      {
        text: `Transcribe everything spoken in this Instagram reel, faithfully and completely.
Rules:
- Keep the original language exactly: Hindi stays Hindi (Devanagari), English stays English, Hinglish stays mixed as spoken.
- If Hindi is spoken, ALSO add a second section "ROMANIZED:" with the same transcript in Latin script.
- Use natural punctuation and paragraph breaks between beats.
- If there is no speech (music only), reply exactly: NO_SPEECH
- Output only the transcript (plus the ROMANIZED section when applicable) — no commentary.`,
      },
    ]);

    if (text.trim() === "NO_SPEECH") {
      return NextResponse.json({ error: "No speech detected — this reel seems to be music-only." }, { status: 422 });
    }

    return NextResponse.json({
      transcript: text,
      username: result.username,
      caption: result.caption,
      thumbnail: result.thumbnail,
    });
  } catch (err) {
    if (err instanceof ExtractError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    if (err instanceof AiError) {
      return NextResponse.json({ error: err.message }, { status: err.code === "NO_KEY" ? 503 : 502 });
    }
    console.error("transcribe failed:", err);
    return NextResponse.json({ error: "Something went wrong — please try again." }, { status: 500 });
  }
}
