import test from "node:test";
import assert from "node:assert/strict";
import { resolveRoute } from "./router";
import { extractLinks, normalizeLink, detectUsername } from "./detect";

const G = { allowBareUsername: true };
const app = (raw: string, o = {}) => {
  const r = resolveRoute(raw, o);
  assert.equal(r.type, "app", `${raw} → ${JSON.stringify(r)}`);
  return r as Extract<ReturnType<typeof resolveRoute>, { type: "app" }>;
};

// §7.6.2 — har row
test("instagram reel / reels", () => {
  const a = app("https://www.instagram.com/reel/Cabc123/"); assert.equal(a.path, "/instagram-downloader"); assert.equal(a.kind, "reel");
  assert.equal(app("https://instagram.com/reels/Cabc123/").kind, "reel");
  assert.equal(app("https://www.instagram.com/someuser/reel/Cabc123/").kind, "reel");
});
test("instagram story + highlights check first", () => {
  assert.equal(app("https://www.instagram.com/stories/john/3456789/").kind, "story");
  assert.equal(app("https://www.instagram.com/stories/highlights/17912345678/").kind, "highlights");
});
test("instagram post, tv, profile", () => {
  assert.equal(app("https://www.instagram.com/p/Cxyz987/").kind, "post");
  assert.equal(app("https://www.instagram.com/tv/Cxyz987/").kind, "video");
  const p = app("https://www.instagram.com/some.user/"); assert.equal(p.kind, "profile"); assert.equal(p.url, "@some.user");
});
test("@username and bare username", () => {
  assert.equal(app("@john_doe").kind, "profile");
  assert.equal(app("john_doe", G).kind, "profile");
  assert.equal(resolveRoute("john_doe", { allowBareUsername: false }).type, "notlink"); // paste-event
  assert.equal(resolveRoute("hello world", G).type, "notlink");
  assert.equal(resolveRoute("12345", G).type, "notlink"); // ≥1 letter
});
test("facebook rows", () => {
  assert.equal(app("https://www.facebook.com/reel/123456").kind, "reel");
  assert.equal(app("https://www.facebook.com/watch/?v=123").kind, "video");
  assert.equal(app("https://www.facebook.com/someone/videos/123/").kind, "video");
  assert.equal(app("https://fb.watch/abcDEF/").kind, "video");
  assert.equal(app("https://www.facebook.com/photo/?fbid=123").kind, "photo");
  assert.equal(app("https://www.facebook.com/photo.php?fbid=123").kind, "photo");
  assert.equal(app("https://www.facebook.com/share/r/1AbCd/").kind, "reel");
  assert.equal(app("https://m.facebook.com/watch?v=1").path, "/facebook-downloader");
});
test("facebook stories / albums unsupported", () => {
  assert.equal(resolveRoute("https://www.facebook.com/stories/123/abc").type, "unsupported");
  assert.equal(resolveRoute("https://www.facebook.com/media/set/?set=a.123").type, "unsupported");
  assert.equal(resolveRoute("https://www.facebook.com/someone/photos/a.123/456/").type, "unsupported");
});
test("tiktok, pinterest, x, threads, youtube", () => {
  assert.equal(app("https://www.tiktok.com/@user/video/7123456789").path, "/tiktok-downloader");
  assert.equal(app("https://vm.tiktok.com/ZMabc/").kind, "video");
  assert.equal(app("https://vt.tiktok.com/ZSabc/").path, "/tiktok-downloader");
  assert.equal(app("https://in.pinterest.com/pin/123/").path, "/pinterest-downloader");
  assert.equal(app("https://www.pinterest.co.uk/pin/123/").path, "/pinterest-downloader");
  assert.equal(app("https://pin.it/abc").path, "/pinterest-downloader");
  assert.equal(app("https://x.com/user/status/123").path, "/twitter-downloader");
  assert.equal(app("https://twitter.com/user/status/123").path, "/twitter-downloader");
  assert.equal(app("https://www.threads.net/@user/post/Cabc").path, "/threads-downloader");
  assert.equal(app("https://www.threads.com/@user/post/Cabc").path, "/threads-downloader");
  const y = app("https://youtu.be/dQw4w9WgXcQ"); assert.equal(y.path, "/youtube-thumbnail-downloader"); assert.equal(y.kind, "thumbnail"); assert.equal(y.note, "youtube-thumb-only");
  assert.equal(app("https://www.youtube.com/watch?v=dQw4w9WgXcQ").kind, "thumbnail");
  assert.equal(app("https://www.youtube.com/shorts/dQw4w9WgXcQ").kind, "thumbnail");
});
test("soon platforms", () => {
  for (const [u, id] of [
    ["https://www.snapchat.com/add/user", "snapchat"], ["https://www.reddit.com/r/x/comments/1", "reddit"], ["https://redd.it/abc", "reddit"],
    ["https://www.linkedin.com/posts/x", "linkedin"], ["https://t.me/channel/1", "telegram"], ["https://www.twitch.tv/x", "twitch"], ["https://vimeo.com/123", "vimeo"],
  ] as const) {
    const r = resolveRoute(u); assert.equal(r.type, "soon"); assert.equal((r as { platform: string }).platform, id);
  }
});
// §7.6.3 — normalize
test("share-text me link", () => {
  const r = app("Dekh ye reel 🔥 https://instagram.com/reel/Cabc123/?igsh=MXh4 pagal hai!");
  assert.equal(r.kind, "reel"); assert.ok(!r.url.includes("igsh"));
});
test("scheme-less links", () => {
  assert.equal(app("instagram.com/p/xyz").kind, "post");
  assert.equal(app("fb.watch/abc").kind, "video");
  assert.equal(app("www.tiktok.com/@u/video/1").path, "/tiktok-downloader");
});
test("only http/https; bad schemes rejected", () => {
  for (const s of ["javascript:alert(1)", "data:text/html,<b>x</b>", "file:///etc/passwd", "intent://scan/#Intent;end", "JAVASCRIPT:alert(1)"]) {
    assert.deepEqual(resolveRoute(s, G), { type: "rejected", reason: "scheme" }, s);
  }
});
test("lookalike domains never match", () => {
  for (const s of ["https://instagram.com.evil.com/reel/abc", "https://notinstagram.com/p/abc", "https://evilfacebook.com/watch", "https://x.com.attacker.io/a/status/1", "https://fakeyoutube.com/watch?v=abcdefghijk", "instagram.com.evil.com"]) {
    const r = resolveRoute(s, G); assert.notEqual(r.type, "app", s); assert.notEqual(r.type, "soon", s);
  }
});
test("dropbox / fedex are not X (A19)", () => {
  assert.equal(resolveRoute("https://www.dropbox.com/s/abc/file.mp4").type, "unknown");
  assert.equal(resolveRoute("https://www.fedex.com/track").type, "unknown");
  assert.equal(resolveRoute("dropbox.com/s/abc").type, "unknown");
});
test("wrapper links unwrap one level", () => {
  const fb = app("https://l.facebook.com/l.php?u=" + encodeURIComponent("https://www.facebook.com/reel/999") + "&h=AT0");
  assert.equal(fb.kind, "reel");
  const ig = app("https://l.instagram.com/?u=" + encodeURIComponent("https://www.instagram.com/p/Cabc/") + "&e=AT");
  assert.equal(ig.platform, "instagram");
  // wrapper ke andar unknown → unknown
  assert.equal(resolveRoute("https://l.facebook.com/l.php?u=" + encodeURIComponent("https://evil.example/x")).type, "unknown");
});
test("tracking params stripped, v kept", () => {
  const n = normalizeLink("https://www.youtube.com/watch?v=abcdefghijk&si=XYZ&feature=share&utm_source=a");
  assert.ok("url" in n); if ("url" in n) { assert.equal(n.url.searchParams.get("v"), "abcdefghijk"); assert.equal(n.url.searchParams.get("si"), null); assert.equal(n.url.searchParams.get("utm_source"), null); }
  const f = normalizeLink("https://www.facebook.com/watch/?v=1&fbclid=abc"); if ("url" in f) assert.equal(f.url.searchParams.get("fbclid"), null);
});
test("trailing punctuation removed", () => {
  assert.deepEqual(extractLinks("(https://instagram.com/p/abc/)."), ["https://instagram.com/p/abc/"]);
  assert.deepEqual(extractLinks("link: https://x.com/u/status/1!"), ["https://x.com/u/status/1"]);
  assert.equal(app("https://www.instagram.com/p/abc/,").kind, "post");
});
test("self link rejected", () => {
  assert.deepEqual(resolveRoute("https://instagrabs.vercel.app/tools"), { type: "rejected", reason: "self" });
  assert.deepEqual(resolveRoute("https://my.site.com/x", { selfHosts: ["my.site.com"] }), { type: "rejected", reason: "self" });
});
test("empty / notlink / unknown", () => {
  assert.equal(resolveRoute("").type, "empty"); assert.equal(resolveRoute("   ").type, "empty");
  assert.equal(resolveRoute("this is just some random text").type, "notlink");
  assert.equal(resolveRoute("https://bit.ly/abc").type, "unknown");
  assert.equal(resolveRoute("https://t.co/abc").type, "unknown");
  assert.equal(resolveRoute("bit.ly/abc").type, "unknown");
});
test("multi links", () => {
  const b = resolveRoute("https://instagram.com/p/aaa/ https://instagram.com/reel/bbb/");
  assert.equal(b.type, "batch"); if (b.type === "batch") assert.equal(b.urls.length, 2);
  const mixed = app("https://instagram.com/p/aaa/ https://www.tiktok.com/@u/video/1");
  assert.equal(mixed.platform, "instagram"); assert.equal(mixed.extraLinks, 1);
  const many = Array.from({ length: 25 }, (_, i) => `https://instagram.com/p/code${i}/`).join(" ");
  const bm = resolveRoute(many); assert.equal(bm.type, "batch"); if (bm.type === "batch") { assert.equal(bm.urls.length, 20); assert.equal(bm.truncated, true); }
  // duplicate link batch nahi banata
  assert.equal(resolveRoute("https://instagram.com/p/aaa/ https://instagram.com/p/aaa/").type, "app");
});
test("detectUsername edge", () => {
  assert.equal(detectUsername("@a", false), "a");
  assert.equal(detectUsername("john.doe", true), "john.doe");
  assert.equal(detectUsername("john.doe", false), null);
  assert.equal(detectUsername("fedex.com", true), null);
});
