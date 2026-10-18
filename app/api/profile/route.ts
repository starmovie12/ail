import { NextRequest, NextResponse } from "next/server";
import {
  extractProfile,
  extractProfileFeed,
  extractStories,
  extractHighlights,
  extractHighlightItems,
  ExtractError,
} from "@/lib/instagram-extractor";
import { isRateLimited } from "@/lib/rate-limit";
import { IG_CONFIG } from "@/lib/instagram-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function statusFor(code: string): number {
  switch (code) {
    case "INVALID_USERNAME":
      return 400;
    case "PRIVATE":
    case "NOT_FOUND":
    case "NO_STORIES":
    case "NO_HIGHLIGHTS":
      return 404;
    default:
      return 503;
  }
}

type ProfileRequest = {
  type: string;
  username: string;
  highlightId: string;
  sessionId: string | null;
};

async function handle(req: NextRequest, r: ProfileRequest) {
  const ip = clientIp(req);
  if (isRateLimited(ip, IG_CONFIG.rateLimitPerMinute)) {
    return NextResponse.json(
      { error: "Too many requests — please wait a minute and try again." },
      { status: 429 }
    );
  }
  const { type, username, highlightId, sessionId } = r;

  try {
    switch (type) {
      case "dp": {
        const profile = await extractProfile(username, { sessionId });
        return NextResponse.json(profile);
      }
      case "feed": {
        return NextResponse.json(await extractProfileFeed(username, { sessionId }));
      }
      case "stories": {
        return NextResponse.json(await extractStories(username, { sessionId }));
      }
      case "highlights": {
        return NextResponse.json(await extractHighlights(username, { sessionId }));
      }
      case "highlight-items": {
        return NextResponse.json({ items: await extractHighlightItems(highlightId, { sessionId }) });
      }
      default:
        return NextResponse.json({ error: "Unknown request type." }, { status: 400 });
    }
  } catch (err) {
    if (err instanceof ExtractError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: statusFor(err.code) });
    }
    console.error("profile route failed:", err);
    return NextResponse.json(
      { error: "Something went wrong on our side. Please try again." },
      { status: 500 }
    );
  }
}

/** GET /api/profile?username=xyz  (purana GoldenBar flow pehle GET try karta hai) → DP/profile */
export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username") ?? "";
  return handle(req, { type: "dp", username, highlightId: "", sessionId: null });
}

export async function POST(req: NextRequest) {
  let type = "";
  let username = "";
  let highlightId = "";
  let sessionId: string | null = null;
  try {
    const body = await req.json();
    username = String(body?.username ?? "");
    highlightId = String(body?.highlightId ?? "");
    // Purana GoldenBar sirf { username } bhejta hai (type nahi) — usse DP maano.
    type = String(body?.type ?? "") || (username ? "dp" : "");
    // Session ID: sirf POST body, log/store/echo nahi
    if (typeof body?.sessionId === "string" && body.sessionId.length <= 600) sessionId = body.sessionId;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  return handle(req, { type, username, highlightId, sessionId });
}
