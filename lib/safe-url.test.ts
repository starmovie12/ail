import test from "node:test";
import assert from "node:assert/strict";
import { isPrivateIp, precheckCobaltUrl } from "./safe-url";

test("private IPs", () => {
  for (const ip of ["127.0.0.1", "10.1.2.3", "172.16.0.1", "172.31.255.255", "192.168.1.1", "169.254.169.254", "0.0.0.0", "::1", "fc00::1", "fd12::1", "fe80::1", "::ffff:127.0.0.1", "100.64.0.1"])
    assert.equal(isPrivateIp(ip), true, ip);
  for (const ip of ["8.8.8.8", "1.1.1.1", "172.32.0.1", "2606:4700::1111"]) assert.equal(isPrivateIp(ip), false, ip);
});
test("cobalt precheck blocks", () => {
  for (const u of ["http://localhost", "https://localhost:9000", "http://169.254.169.254", "https://169.254.169.254/latest/meta-data", "https://127.0.0.1", "https://[::1]/", "https://10.0.0.5", "https://192.168.0.10",
    "https://user:pass@cobalt.example.com", "ftp://cobalt.example.com", "javascript:alert(1)", "https://intranet", "https://svc.internal", "x".repeat(300), "", 5 as unknown as string])
    assert.equal(precheckCobaltUrl(u), null, String(u));
  assert.ok(precheckCobaltUrl("https://cobalt.yourdomain.com"));
});
