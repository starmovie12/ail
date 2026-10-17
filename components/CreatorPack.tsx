"use client";
import { useState } from "react";
import { Package, Check, AlertTriangle } from "lucide-react";
import type { ExtractResult } from "@/lib/extract-ui";

function proxied(url: string) {
  return `/api/download?url=${encodeURIComponent(url)}&name=pack`;
}

/**
 * U4 — Creator Pack: one click bundles the media + audio + thumbnail +
 * caption.txt + hashtags.txt into a single ZIP. Repost workflow in one tap.
 */
export default function CreatorPack({ data }: { data: ExtractResult }) {
  const [state, setState] = useState<"idle" | "packing" | "done" | "error">("idle");

  async function pack() {
    if (state === "packing") return;
    setState("packing");
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      const main = data.slides[0];
      const base = `instagrab-${data.shortcode}`;

      async function add(name: string, url: string) {
        const res = await fetch(proxied(url));
        if (!res.ok) throw new Error("fetch failed");
        zip.file(name, await res.blob());
      }

      // Media: single post → one file; carousel → every slide.
      if (data.slides.length > 1) {
        for (let i = 0; i < data.slides.length; i++) {
          const s = data.slides[i];
          await add(`${base}-slide-${i + 1}.${s.type === "video" ? "mp4" : "jpg"}`, s.url);
        }
      } else if (main) {
        await add(`${base}.${main.type === "video" ? "mp4" : "jpg"}`, main.url);
      }
      if (main?.audioUrl) await add(`${base}-audio.m4a`, main.audioUrl);
      if (data.thumbnail) await add(`${base}-thumbnail.jpg`, data.thumbnail);

      if (data.caption) zip.file("caption.txt", data.caption);
      if (data.hashtags.length) zip.file("hashtags.txt", data.hashtags.join(" "));
      zip.file(
        "info.txt",
        `Source: instagram.com/p/${data.shortcode}\nAuthor: @${data.username}\nType: ${data.kind}\nPacked by InstaGrab — download only content you own or have permission to use.`
      );

      const blob = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${base}-creator-pack.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 30_000);
      setState("done");
      setTimeout(() => setState("idle"), 2500);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  }

  return (
    <button className={`btn btn-secondary ${state === "done" ? "gold tick" : ""}`} onClick={pack}
      disabled={state === "packing"} title="Video + audio + thumbnail + caption + hashtags in one ZIP">
      {state === "done" ? <Check size={16} strokeWidth={2} className="coin-in" />
        : state === "error" ? <AlertTriangle size={16} strokeWidth={1.5} />
        : <Package size={16} strokeWidth={1.5} />}
      {state === "packing" ? "Packing…" : state === "done" ? "Pack saved!" : state === "error" ? "Failed — retry" : "Creator Pack (ZIP)"}
    </button>
  );
}
