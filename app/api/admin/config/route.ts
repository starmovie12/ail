import { NextRequest, NextResponse } from "next/server";
import { verifyToken, ADMIN_COOKIE } from "@/lib/admin-auth";
import { IG_CONFIG } from "@/lib/instagram-config";
import {
  getConfigOverride,
  saveConfigOverride,
  kvConfigured,
  STRING_FIELDS,
  type ConfigOverride,
} from "@/lib/runtime-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function guard(req: NextRequest): NextResponse | null {
  if (!verifyToken(req.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  return null;
}

/** GET → the current override plus the built-in defaults (so the form can show both). */
export async function GET(req: NextRequest) {
  const denied = guard(req);
  if (denied) return denied;

  const override = await getConfigOverride();
  // Only expose the fields the panel edits; never leak unrelated secrets.
  const defaults: Record<string, string | number | boolean> = {};
  for (const f of STRING_FIELDS) defaults[f] = (IG_CONFIG as Record<string, unknown>)[f] as string ?? "";
  defaults.useFallbackApi = IG_CONFIG.useFallbackApi;

  return NextResponse.json({ override, defaults, kvConfigured: kvConfigured() });
}

/** POST → save the override object. */
export async function POST(req: NextRequest) {
  const denied = guard(req);
  if (denied) return denied;

  if (!kvConfigured()) {
    return NextResponse.json(
      { error: "Storage isn't set up — the owner must add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in Vercel." },
      { status: 503 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const clean: ConfigOverride = {};
  for (const f of STRING_FIELDS) {
    const v = body[f];
    if (typeof v === "string" && v.trim()) clean[f] = v.trim().slice(0, 2000);
  }
  if (typeof body.useFallbackApi === "boolean") clean.useFallbackApi = body.useFallbackApi;

  const ok = await saveConfigOverride(clean);
  if (!ok) return NextResponse.json({ error: "Couldn't save — storage unreachable." }, { status: 502 });
  return NextResponse.json({ ok: true, saved: clean });
}
