/**
 * Admin authentication — a single owner, protected by a password held ONLY in
 * an environment variable (never in code or the client). A successful login
 * gets an HMAC-signed, httpOnly cookie; every admin API call re-verifies it.
 *
 * Env vars (set in Vercel → Settings → Environment Variables):
 *   ADMIN_PASSWORD         (required)  — your login password
 *   ADMIN_SESSION_SECRET   (optional)  — random string for signing; falls back
 *                                        to the password if unset
 */
import { createHmac, timingSafeEqual } from "node:crypto";

const PASSWORD = process.env.ADMIN_PASSWORD ?? "";
const SECRET = process.env.ADMIN_SESSION_SECRET || PASSWORD || "insecure-fallback";

export const ADMIN_COOKIE = "ig_admin";
const MAX_AGE_DAYS = 7;

/** Admin is only usable once a password has been configured. */
export function adminEnabled(): boolean {
  return PASSWORD.length >= 6;
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function checkPassword(input: string): boolean {
  return adminEnabled() && typeof input === "string" && safeEqual(input, PASSWORD);
}

function sign(expiry: number): string {
  return createHmac("sha256", SECRET).update(String(expiry)).digest("hex");
}

/** Issue a fresh session token: "<expiryMs>.<hmac>". */
export function makeToken(): string {
  const expiry = Date.now() + MAX_AGE_DAYS * 86_400_000;
  return `${expiry}.${sign(expiry)}`;
}

export function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const dot = token.lastIndexOf(".");
  if (dot < 1) return false;
  const expiry = Number(token.slice(0, dot));
  const sig = token.slice(dot + 1);
  if (!Number.isFinite(expiry) || Date.now() > expiry) return false;
  return safeEqual(sig, sign(expiry));
}

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "strict" as const,
  path: "/",
  maxAge: MAX_AGE_DAYS * 86_400,
};
