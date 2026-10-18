import test from "node:test";
import assert from "node:assert/strict";
import { parseEmbedContext } from "./instagram-extractor";
import { parseFacebookHtml, facebookVideoId, candidateUrls } from "./facebook-extractor";

/** Instagram embed page jaisa HTML: data "contextJSON" me double-encoded JSON hota hai. */
function embedHtml(node: unknown) {
  const inner = JSON.stringify({ context: { x: 1 }, gql_data: { shortcode_media: node } });
  const outer = JSON.stringify({ contextJSON: inner }); // → "contextJSON":"{\"context\"…}"
  return `<html><script>requireLazy(["x"],function(){...("init",[],[${outer}]],0)})</script></html>`;
}

test("Instagram embed: double-encoded contextJSON parse hota hai (purana regex fail hota tha)", () => {
  const node = { is_video: true, video_url: "https://scontent.cdninstagram.com/v/a.mp4?x=1&y=2", display_url: "https://scontent.cdninstagram.com/t.jpg", owner: { username: "someone" } };
  const ctx = parseEmbedContext(embedHtml(node));
  assert.equal(ctx.gql_data.shortcode_media.video_url, node.video_url);
  assert.equal(ctx.gql_data.shortcode_media.owner.username, "someone");
  // purana regex is format par match nahi karta:
  assert.equal(/"video_url":\s*"([^"]+)"/.test(embedHtml(node)), false);
});

test("Instagram embed: contextJSON na ho / kharab ho to null (crash nahi)", () => {
  assert.equal(parseEmbedContext("<html>nothing</html>"), null);
  assert.equal(parseEmbedContext('"contextJSON":"{bad json"'), null);
});

test("Facebook: HD/SD + og tags parse", () => {
  const html = `<meta property="og:image" content="https://scontent.fbcdn.net/t.jpg?a=1&amp;b=2"><meta property="og:title" content="My Reel | Facebook">
  <script>{"browser_native_hd_url":"https:\\/\\/video.xx.fbcdn.net\\/v\\/hd.mp4?oh=1\\u0026oe=2","browser_native_sd_url":"https:\\/\\/video.xx.fbcdn.net\\/v\\/sd.mp4"}</script>`;
  const p = parseFacebookHtml(html);
  assert.equal(p.hd, "https://video.xx.fbcdn.net/v/hd.mp4?oh=1&oe=2");
  assert.equal(p.sd, "https://video.xx.fbcdn.net/v/sd.mp4");
  assert.equal(p.thumbnail, "https://scontent.fbcdn.net/t.jpg?a=1&b=2");
  assert.equal(p.title, "My Reel");
});

test("Facebook: sirf thumbnail ho to video null (photo ko video nahi banate)", () => {
  const p = parseFacebookHtml(`<meta property="og:image" content="https://scontent.fbcdn.net/only.jpg">`);
  assert.equal(p.hd, null);
  assert.equal(p.sd, null);
  assert.equal(p.ogVideo, null);
  assert.ok(p.thumbnail);
});

test("Facebook video id alag-alag link shapes se", () => {
  assert.equal(facebookVideoId("https://www.facebook.com/reel/1234567890123456"), "1234567890123456");
  assert.equal(facebookVideoId("https://www.facebook.com/watch/?v=1234567890123456&t=3"), "1234567890123456");
  assert.equal(facebookVideoId("https://www.facebook.com/someuser/videos/1234567890123456/"), "1234567890123456");
  assert.equal(facebookVideoId("https://www.facebook.com/someuser/videos/some-title/1234567890123456/"), "1234567890123456");
  assert.equal(facebookVideoId("https://www.facebook.com/share/r/AbCdEf/"), null);
});

test("Facebook candidates: reel/{id} sabse pehle, duplicates nahi", () => {
  const c = candidateUrls("https://www.facebook.com/watch/?v=1234567890123456");
  assert.equal(c[0].url, "https://www.facebook.com/reel/1234567890123456");
  const keys = c.map((x) => x.url + "|" + x.ua);
  assert.equal(new Set(keys).size, keys.length);
  assert.ok(c.some((x) => x.url.startsWith("https://m.facebook.com/")));
});

import { parseProfileOg } from "./instagram-extractor";

test("Instagram profile OG tags: DP + followers/following/posts + bio", () => {
  const html = `<meta property="og:title" content="Happy Singh (@urshappy) • Instagram photos and videos">
  <meta property="og:description" content="1.2M Followers, 345 Following, 6,789 Posts - Happy Singh (@urshappy) on Instagram: &quot;Hello world&quot;">
  <meta property="og:image" content="https://scontent.cdninstagram.com/v/t51/dp.jpg?a=1&amp;b=2">`;
  const u = parseProfileOg(html, "urshappy");
  assert.equal(u.full_name, "Happy Singh");
  assert.equal(u.profile_pic_url_hd, "https://scontent.cdninstagram.com/v/t51/dp.jpg?a=1&b=2");
  assert.equal(u.edge_followed_by.count, 1_200_000);
  assert.equal(u.edge_follow.count, 345);
  assert.equal(u.edge_owner_to_timeline_media.count, 6789);
  assert.equal(u.biography, "Hello world");
});

test("Instagram profile OG: generic login-page (username nahi) ki image galti se nahi leta", () => {
  const html = `<meta property="og:title" content="Instagram"><meta property="og:image" content="https://static.cdninstagram.com/logo.png">`;
  assert.equal(parseProfileOg(html, "urshappy"), null);
  assert.equal(parseProfileOg("<html></html>", "urshappy"), null);
});
