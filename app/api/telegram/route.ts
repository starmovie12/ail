import { NextRequest, NextResponse } from "next/server";
import { extract, ExtractError } from "@/lib/instagram-extractor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * H6 — Telegram bot webhook (raw Bot API, zero dependencies).
 *
 * Setup (once):
 *   1. Create a bot with @BotFather → copy the token
 *   2. Set env vars: TELEGRAM_BOT_TOKEN=<token>  TELEGRAM_WEBHOOK_SECRET=<any random string>
 *   3. Register the webhook:
 *      curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<your-domain>/api/telegram&secret_token=<SECRET>"
 *
 * Usage: send the bot any Instagram post/reel link → it replies with the media.
 */
const MEDIA_RE = /https?:\/\/(?:www\.)?instagram\.com\/(?:[\w.]+\/)?(?:p|reel|reels|tv)\/[\w-]+\S*/i;

async function tg(method: string, payload: Record<string, unknown>) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(20_000),
  }).catch(() => { /* best-effort — Telegram retries the webhook on failure */ });
}

export async function POST(req: NextRequest) {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    return NextResponse.json({ error: "Bot not configured (TELEGRAM_BOT_TOKEN missing)." }, { status: 503 });
  }
  // Reject calls that don't carry the secret we registered with setWebhook.
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret && req.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let update: { message?: { chat?: { id?: number }; text?: string } };
  try {
    update = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const chatId = update?.message?.chat?.id;
  const text = update?.message?.text ?? "";
  if (!chatId) return NextResponse.json({ ok: true });

  const link = text.match(MEDIA_RE)?.[0];
  if (!link) {
    await tg("sendMessage", {
      chat_id: chatId,
      text: "👋 Send me any public Instagram post or reel link and I'll fetch the media for you.\n\nExample:\nhttps://www.instagram.com/reel/ABC123/",
    });
    return NextResponse.json({ ok: true });
  }

  await tg("sendChatAction", { chat_id: chatId, action: "upload_video" });

  try {
    const result = await extract(link);
    const caption = [
      result.username ? `@${result.username}` : null,
      result.caption ? result.caption.slice(0, 700) : null,
    ].filter(Boolean).join("\n\n").slice(0, 900);

    // Telegram fetches the CDN URL itself — no bytes pass through our server.
    const items = result.media.slice(0, 5);
    for (const m of items) {
      if (m.type === "video") {
        await tg("sendVideo", { chat_id: chatId, video: m.url, caption: items.length === 1 ? caption : undefined });
      } else {
        await tg("sendPhoto", { chat_id: chatId, photo: m.url, caption: items.length === 1 ? caption : undefined });
      }
    }
    if (items.length > 1 && caption) {
      await tg("sendMessage", { chat_id: chatId, text: caption });
    }
    if (result.hashtags.length) {
      await tg("sendMessage", { chat_id: chatId, text: result.hashtags.join(" ") });
    }
  } catch (err) {
    const msg = err instanceof ExtractError
      ? err.message
      : "Something went wrong — please try again in a minute.";
    await tg("sendMessage", { chat_id: chatId, text: `⚠️ ${msg}` });
  }

  return NextResponse.json({ ok: true });
}
