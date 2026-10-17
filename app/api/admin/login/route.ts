import { NextRequest, NextResponse } from "next/server";
import { adminEnabled, checkPassword, makeToken, verifyToken, ADMIN_COOKIE, COOKIE_OPTIONS } from "@/lib/admin-auth";
import { kvConfigured } from "@/lib/runtime-config";
import { isRateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET → current session status (used by the admin page to decide what to show). */
export async function GET(req: NextRequest) {
  const authed = verifyToken(req.cookies.get(ADMIN_COOKIE)?.value);
  return NextResponse.json({ enabled: adminEnabled(), authed, kvConfigured: kvConfigured() });
}

/** POST { password } → set the signed session cookie on success. */
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  // Brute-force guard: 5 attempts per IP per minute.
  if (isRateLimited("adminlogin:" + ip, 5)) {
    return NextResponse.json({ error: "Too many attempts — wait a minute." }, { status: 429 });
  }
  if (!adminEnabled()) {
    return NextResponse.json(
      { error: "Admin is not set up yet — the site owner must set the ADMIN_PASSWORD environment variable (min 6 characters)." },
      { status: 503 }
    );
  }
  let password = "";
  try {
    const body = await req.json();
    password = String(body?.password ?? "");
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!checkPassword(password)) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, makeToken(), COOKIE_OPTIONS);
  return res;
}

/** DELETE → log out (clear the cookie). */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 });
  return res;
}
