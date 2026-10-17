import test from "node:test";
import assert from "node:assert/strict";
import { __snapsaveInternals as S } from "./instagram-extractor";

/* Test helpers: SnapSave jaise packed JS BANATE hain (decoder ka ulta), phir decoder se wapas nikalte hain. */

/** packer #1  function(h,u,n,t,e,r) ka encoder */
function packHunter(plain: string, n: string, t: number, e: number): string {
  const bytes = Buffer.from(plain, "utf8").toString("latin1");
  let h = "";
  for (const ch of bytes) {
    const v = ch.charCodeAt(0) + t;
    h += v.toString(e).split("").map((d) => n[Number(d)]).join("") + n[e];
  }
  return `eval(function(h,u,n,t,e,r){/* decoder body */}("${h}",0,"${n}",${t},${e},0))`;
}

const SCRIPT = (html: string) =>
  `document.getElementById("download-section").innerHTML = ${JSON.stringify(html)}; document.getElementById("inputData").remove();`;

const IG_HTML =
  `<div class="download-items"><div class="download-items__thumb"><img src="https://scontent.cdninstagram.com/t/1.jpg?a=1&amp;b=2"></div>` +
  `<div class="download-items__btn"><a href="https://d.rapidcdn.app/v2?token=abc&amp;dl=1"><i class="icon-dlvideo"></i> Download Video</a></div></div>` +
  `<div class="download-items"><div class="download-items__thumb"><img src="https://scontent.cdninstagram.com/t/2.jpg"></div>` +
  `<div class="download-items__btn"><a href="https://d.rapidcdn.app/v2?token=img2">Download Photo</a></div></div>`;

const FB_HTML =
  `<article class="media"><img src="https://scontent.xx.fbcdn.net/thumb.jpg"></article><span class="video-des">Mera vīdeo 🎬</span>` +
  `<table class="table"><tbody>` +
  `<tr><td>720p (HD)</td><td>No render</td><td><a href="https://d.rapidcdn.app/v2?token=hd">Download</a></td></tr>` +
  `<tr><td>360p (SD)</td><td>No render</td><td><a href="https://d.rapidcdn.app/v2?token=sd">Download</a></td></tr>` +
  `<tr><td>Audio</td><td>-</td><td><a href="javascript:void(0)">Render</a></td></tr>` +
  `</tbody></table>`;

test("hunter packer round-trip (unicode safe)", () => {
  const plain = 'a "quoted" <b>héllo 🎬</b>';
  const packed = packHunter(plain, "mTsfpUMdb", 17, 8);
  assert.equal(S.unpackSnapScript(packed), plain);
});

test("Instagram result: 1 video + 1 photo, entities decoded, no eval needed", () => {
  const raw = packHunter(SCRIPT(IG_HTML), "mTsfpUMdb", 23, 8);
  const html = S.snapHtmlFromResponse(raw);
  const { media } = S.parseSnapHtml(html, "grabflow", "ABC123");
  assert.equal(media.length, 2);
  assert.equal(media[0].type, "video");
  assert.equal(media[0].url, "https://d.rapidcdn.app/v2?token=abc&dl=1");
  assert.equal(media[0].thumbnail, "https://scontent.cdninstagram.com/t/1.jpg?a=1&b=2");
  assert.equal(media[0].filename, "grabflow_ABC123_1.mp4");
  assert.equal(media[1].type, "image");
  assert.equal(media[1].filename, "grabflow_ABC123_2.jpg");
});

test("Facebook result: ek video, HD+SD qualities, javascript: link skip", () => {
  const raw = packHunter(SCRIPT(FB_HTML), "mTsfpUMdb", 31, 8);
  const { media, caption } = S.parseSnapHtml(S.snapHtmlFromResponse(raw), "facebook", "123");
  assert.equal(media.length, 1);
  assert.equal(media[0].type, "video");
  assert.equal(media[0].url, "https://d.rapidcdn.app/v2?token=hd");
  assert.deepEqual(media[0].qualities?.map((q) => q.label), ["720p (HD)", "360p (SD)"]);
  assert.equal(caption, "Mera vīdeo 🎬");
});

test("Dean Edwards packer (p,a,c,k,e,d)", () => {
  const packed = `eval(function(p,a,c,k,e,d){}('0.1("2")',62,3,'document|getElementById|x'.split('|'),0,{}))`;
  assert.equal(S.unpackSnapScript(packed), 'document.getElementById("x")');
});

test("plain (unpacked) HTML response bhi chalta hai", () => {
  const { media } = S.parseSnapHtml(S.snapHtmlFromResponse(IG_HTML), "grabflow", "X");
  assert.equal(media.length, 2);
});

test("malicious / garbage response crash nahi karta aur kuch execute nahi hota", () => {
  (globalThis as Record<string, unknown>).__pwned = false;
  const evil = `eval(function(h,u,n,t,e,r){}("zzz",0,"abc",1,2,0)); globalThis.__pwned = true;`;
  const out = S.snapHtmlFromResponse(evil);
  assert.equal(typeof out, "string");
  assert.equal((globalThis as Record<string, unknown>).__pwned, false);
  assert.deepEqual(S.parseSnapHtml("", "x", "y").media, []);
});
