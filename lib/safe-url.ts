/**
 * Cobalt instance URL validator — SSRF se bachav (PRD §16.2). SERVER-SIDE ONLY.
 * Rules: sirf https · ≤ 200 chars · credentials nahi · hostname public IP par resolve ho ·
 * block: localhost, 127/8, 10/8, 172.16/12, 192.168/16, 169.254/16 (cloud metadata), ::1, fc00::/7 …
 * Invalid ho to null — caller chupchap server default (COBALT_INSTANCE) par chala jaye.
 */
import net from "node:net";

export function isPrivateIp(ip: string): boolean {
  let v = ip.trim().toLowerCase();
  if (v.startsWith("[") && v.endsWith("]")) v = v.slice(1, -1);
  const mapped = v.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) v = mapped[1];
  if (net.isIPv4(v)) {
    const [a, b, c] = v.split(".").map(Number);
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;       // CGNAT
    if (a === 192 && b === 0 && c === 0) return true;
    if (a === 198 && (b === 18 || b === 19)) return true;
    if (a >= 224) return true;                                // multicast / reserved
    return false;
  }
  if (net.isIPv6(v)) {
    if (v === "::" || v === "::1") return true;
    if (/^f[cd]/.test(v)) return true;                        // fc00::/7
    if (/^fe[89ab]/.test(v)) return true;                     // fe80::/10
    return false;
  }
  return false;
}

/** DNS ke bina wale saare checks. URL object ya null. */
export function precheckCobaltUrl(raw: unknown): URL | null {
  if (typeof raw !== "string") return null;
  const s = raw.trim();
  if (!s || s.length > 200) return null;
  let u: URL;
  try { u = new URL(s); } catch { return null; }
  if (u.protocol !== "https:") return null;
  if (u.username || u.password) return null;
  const host = u.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (!host) return null;
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal") || host.endsWith(".lan")) return null;
  if (net.isIP(host) && isPrivateIp(host)) return null;
  if (!net.isIP(host) && !host.includes(".")) return null;    // single-label (intranet) host
  return u;
}

/** Poora check (DNS ke saath). Safe origin string (trailing slash ke bina) ya null. */
export async function validateCobaltInstance(raw: unknown): Promise<string | null> {
  const u = precheckCobaltUrl(raw);
  if (!u) return null;
  const host = u.hostname.replace(/^\[|\]$/g, "");
  if (!net.isIP(host)) {
    try {
      const { lookup } = await import("node:dns/promises");
      const addrs = await lookup(host, { all: true });
      if (!addrs.length || addrs.some((a) => isPrivateIp(a.address))) return null;
    } catch {
      return null;
    }
  }
  return `${u.origin}${u.pathname.replace(/\/+$/, "")}`;
}
