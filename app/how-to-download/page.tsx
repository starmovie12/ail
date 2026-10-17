import type { Metadata } from "next";
import Link from "next/link";
import { TextQuote, Download, GalleryHorizontalEnd, ShieldCheck } from "lucide-react";
import FAQ from "@/components/FAQ";
import JsonLd from "@/components/JsonLd";
import Reveal from "@/components/Reveal";
import AdFrame from "@/components/AdFrame";
import LegalFoot from "@/components/LegalFoot";
import { PlatformTile } from "@/components/PlatformIcons";
import { PLATFORMS } from "@/lib/platforms";
import { QUARTET } from "@/lib/copy";
import { BLOG_POSTS } from "@/lib/blog-posts";
import { DEFAULT_FAQ, faqJsonLd, howToJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "How to Download Instagram, Facebook, TikTok & More — Step by Step | InstaGrab",
  description: "Learn how to copy a link and download public Instagram, Facebook, TikTok, YouTube thumbnails, Pinterest, X and Threads media in HD — no login, nothing stored.",
  alternates: { canonical: "/how-to-download" },
};

const ICONS: Record<string, React.ElementType> = { TextQuote, Download, GalleryHorizontalEnd, ShieldCheck };

const COPY_STEPS: Record<string, string[]> = {
  instagram: ["Open the reel, post or story in the Instagram app.", "Tap the paper-plane / Share button.", "Tap Copy link."],
  facebook: ["Open the video or reel on Facebook.", "Tap Share (arrow icon).", "Tap Copy link."],
  tiktok: ["Open the video in TikTok.", "Tap Share → Copy link.", "Short vm.tiktok.com links work too."],
  pinterest: ["Open the pin.", "Tap the Share icon.", "Choose Copy link."],
  x: ["Open the post.", "Tap the Share icon.", "Choose Copy link."],
  threads: ["Open the thread post.", "Tap the Share (paper-plane) icon.", "Choose Copy link."],
  youtube: ["Open the video or Short.", "Tap Share.", "Tap Copy link."],
};

const PROBLEMS: [string, string][] = [
  ["Link expired or story gone", "Stories disappear after 24 hours and some CDN links expire. Fetch again from the original post."],
  ["Rate limit / “try again”", "We cap requests per minute to stay fast for everyone. A countdown shows when you can retry."],
  ["Private account", "Only public content can be downloaded. Private accounts stay private."],
  ["Facebook / TikTok sometimes fail", "These platforms hide media behind login walls, so extraction is best-effort. You always get an honest error — never a fake button."],
];

export default function Page() {
  const guides = BLOG_POSTS.slice(0, 6);
  return (
    <>
      <JsonLd data={howToJsonLd()} />
      <JsonLd data={faqJsonLd(DEFAULT_FAQ)} />
      <main className="htd">
        <div className="container" style={{ maxWidth: 760 }}>
          <section className="htd-hero">
            <h1>Download any media in <em className="gilded">3 steps</em></h1>
            <ol className="htd-steps">
              <li><b>1</b> Copy the link</li><li><b>2</b> Paste it</li><li><b>3</b> Download</li>
            </ol>
          </section>

          <section><h2>How to copy the link</h2>
            {PLATFORMS.map((p) => (
              <details key={p.id} className="htd-acc">
                <summary><PlatformTile name={p.iconKey} size={32} showLabel={false} /> {p.name}</summary>
                <ol>{(COPY_STEPS[p.id] ?? []).map((s) => <li key={s}>{s}</li>)}</ol>
              </details>
            ))}
          </section>

          <section><h2>What can be downloaded</h2>
            <div className="htd-tablewrap">
              <table className="htd-table">
                <thead><tr><th scope="col">Platform</th><th scope="col">Formats</th><th scope="col">Notes</th></tr></thead>
                <tbody>
                  {PLATFORMS.map((p) => (
                    <tr key={p.id}>
                      <th scope="row"><Link href={p.route}>{p.name}</Link></th>
                      <td>{p.pills.filter((x) => x.id !== "auto").map((x) => x.label).join(" · ")}</td>
                      <td>{p.id === "youtube" ? "Thumbnails only" : p.backend.includes("best-effort") || p.id === "threads" ? "Best-effort, public only" : "Public content"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section><h2>How auto-detect works</h2>
            <p>Paste any link on Home and InstaGrab recognises the app and the kind (Reel, Story, Video…) on your device, then opens the right page and starts fetching. You can still pick Story / Video / Photo manually, and switch back to Auto anytime.</p>
          </section>

          <section><h2>Where files are saved</h2>
            <ul>
              <li><b>Android:</b> your Downloads folder / Gallery.</li>
              <li><b>iPhone:</b> the Files app. To keep it in Photos, tap Share → <i>Save Video</i> / <i>Save Image</i>.</li>
              <li><b>Desktop:</b> your browser&apos;s Downloads folder.</li>
            </ul>
          </section>

          <section><h2>Install as an app</h2>
            <ul>
              <li><b>Android Chrome:</b> menu → Install app.</li>
              <li><b>iPhone Safari:</b> Share → Add to Home Screen.</li>
              <li><b>Desktop Chrome / Edge:</b> install icon in the address bar.</li>
            </ul>
          </section>

          <section><h2>Private accounts &amp; stories</h2>
            <p>Only public content downloads. For accounts you follow, an optional Instagram Session ID can be added in <Link href="/settings">Settings → Advanced</Link>. It works like your login — never share it, and use a separate account if you can.</p>
          </section>

          <section><h2>If something goes wrong</h2>
            <dl className="htd-dl">{PROBLEMS.map(([t, d]) => <div key={t}><dt>{t}</dt><dd>{d}</dd></div>)}</dl>
          </section>

          <section><h2>Why InstaGrab</h2>
            <div className="htd-why">
              {QUARTET.map((f) => { const Icon = ICONS[f.icon]; return (
                <div key={f.t} className="card" style={{ padding: 16 }}><span className="medallion" style={{ marginBottom: 10 }}><Icon size={22} strokeWidth={1.6} /></span><b>{f.t}</b><p>{f.d}</p></div>
              ); })}
            </div>
          </section>
        </div>

        <FAQ />

        <div className="container" style={{ maxWidth: 760 }}>
          <section><h2>Creator guides</h2>
            <ul className="htd-guides">
              {guides.map((g) => <li key={g.slug}><Link href={`/blog/${g.slug}`}><b>{g.title}</b><span>{g.description}</span></Link></li>)}
            </ul>
          </section>
          <p className="htd-disc">Not affiliated with Instagram™ / Meta. Download only content you own or have permission to use. See <Link href="/privacy-policy">Privacy</Link>, <Link href="/terms">Terms</Link> and <Link href="/dmca">DMCA</Link>.</p>
          <Reveal><AdFrame slotH={110} /></Reveal>
          <div className="htd-cta"><Link href="/?focus=1">Ab try karein</Link></div>
        </div>
      </main>
      <LegalFoot />
      <style>{`
        .htd { padding: 8px 0 24px; } .htd section { margin-top: 28px; } .htd h2 { font-size: clamp(1.2rem, 1rem + .8vw, 1.5rem); margin: 0 0 12px; }
        .htd p, .htd li, .htd dd { color: var(--ink-2); line-height: 1.65; font-size: 15.5px; }
        .htd-hero h1 { font-size: clamp(1.7rem, 1.2rem + 2.4vw, 2.6rem); line-height: 1.1; margin: 8px 0 16px; }
        .htd-steps { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .htd-steps li { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 14px 8px; border-radius: 18px; background: var(--bg-surface); border: 1px solid var(--line-strong); font-weight: 700; color: var(--ink); text-align: center; font-size: 14px; }
        .htd-steps b { width: 32px; height: 32px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: var(--on-accent); background: var(--gradient-button); }
        .htd-acc { border: 1px solid var(--line); border-radius: 16px; margin-bottom: 8px; background: var(--bg-surface); }
        .htd-acc summary { display: flex; align-items: center; gap: 12px; min-height: 52px; padding: 8px 14px; cursor: pointer; font-weight: 700; color: var(--ink); }
        .htd-acc ol { margin: 0; padding: 0 18px 14px 36px; }
        .htd-tablewrap { overflow-x: auto; border: 1px solid var(--line); border-radius: 16px; }
        .htd-table { width: 100%; border-collapse: collapse; font-size: 14px; min-width: 460px; }
        .htd-table th, .htd-table td { padding: 12px 14px; text-align: start; border-top: 1px solid var(--line); color: var(--ink-2); vertical-align: top; }
        .htd-table thead th { border-top: 0; color: var(--ink-3); font-size: 12px; text-transform: uppercase; letter-spacing: .06em; }
        .htd-table tbody th a { color: var(--gold-ink); font-weight: 700; text-decoration: none; }
        .htd-dl { margin: 0; display: grid; gap: 12px; } .htd-dl dt { font-weight: 700; color: var(--ink); } .htd-dl dd { margin: 2px 0 0; }
        .htd-why { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); } .htd-why p { font-size: 14px; margin: 6px 0 0; }
        .htd-guides { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }
        .htd-guides a { display: flex; flex-direction: column; gap: 4px; padding: 14px; border-radius: 16px; text-decoration: none; color: var(--ink); background: var(--bg-surface); border: 1px solid var(--line); }
        .htd-guides span { font-size: 13.5px; color: var(--ink-3); }
        .htd-disc { font-size: 12.5px !important; color: var(--ink-3) !important; margin-top: 24px; } .htd-disc a { color: var(--gold-ink); }
        .htd-cta { position: sticky; bottom: calc(var(--sab) + 12px); display: flex; justify-content: center; margin-top: 20px; }
        .htd-cta a { display: inline-flex; align-items: center; min-height: 52px; padding: 0 32px; border-radius: 999px; font-weight: 800; font-size: 16px; text-decoration: none; color: var(--on-accent); background: var(--gradient-button); box-shadow: var(--shadow-md); }
      `}</style>
    </>
  );
}
