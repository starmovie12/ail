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

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (isRateLimited(ip, IG_CONFIG.rateLimitPerMinute)) {
    return NextResponse.json(
      { error: "Too many requests — please wait a minute and try again." },
      { status: 429 }
    );
  }

  let type = "";
  let username = "";
  let highlightId = "";
  try {
    const body = await req.json();
    type = String(body?.type ?? "");
    username = String(body?.username ?? "");
    highlightId = String(body?.highlightId ?? "");
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    switch (type) {
      case "dp": {
        const profile = await extractProfile(username);
        return NextResponse.json(profile);
      }
      case "feed": {
        return NextResponse.json(await extractProfileFeed(username));
      }
      case "stories": {
        return NextResponse.json(await extractStories(username));
      }
      case "highlights": {
        return NextResponse.json(await extractHighlights(username));
      }
      case "highlight-items": {
        return NextResponse.json({ items: await extractHighlightItems(highlightId) });
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
