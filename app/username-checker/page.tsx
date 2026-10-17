import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import UsernameChecker from "@/components/UsernameChecker";

export const metadata: Metadata = {
  title: "Instagram Username Checker — Is It Available? | InstaGrab",
  description:
    "Check if an Instagram username is available in seconds, free. Get instant availability plus smart alternative handle suggestions if it's taken. No login needed.",
  alternates: { canonical: "/username-checker" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Username checker"
      h1={<>Is your dream <em className="gilded">@handle</em> free?</>}
      lead="Type a username, get an instant answer — and smart alternatives when it's taken."
      tool={<UsernameChecker />}
      faq={[
        { q: "How accurate is the check?", a: "We look for a live public profile on that handle. “Available” means no active account answers to it right now — Instagram may still hold recently-deleted or reserved names, so the app has the final word." },
        { q: "What are Instagram's username rules?", a: "Up to 30 characters: letters, numbers, dots and underscores. No spaces, no consecutive dots, and it can't start or end with a dot." },
        { q: "The name I want is taken — what now?", a: "Tap our suggestions (the.name, name.official, name_in …) — each one is checkable with a single tap. Prefixes and suffixes that keep your brand word intact work best for search." },
        { q: "Can I claim an inactive username?", a: "Instagram doesn't hand over inactive handles on request, except for trademark cases via their official process. Your practical move is a strong variant of the name." },
      ]}
    >
      <h2>Check before you brand</h2>
      <p>Your handle is your brand&apos;s address. Before you print it on a business card or buy the matching domain, check it here — and check the variants you&apos;d accept, because the difference between <em>@brand</em> and <em>@brand.official</em> matters less than you think and costs nothing to test.</p>
      <h2>What makes a good Instagram username</h2>
      <p>Short, spellable, and searchable. Avoid strings of underscores and trailing dots-and-digits that read like spam. If your exact word is taken, keep it intact and add a clean modifier: <em>the.</em>, <em>.co</em>, <em>_in</em> for Indian brands, or your niche keyword.</p>
      <h2>One tap to re-check</h2>
      <p>Every suggestion this tool shows is tappable — it fills the box and runs the check instantly, so you can burn through ten candidates in under a minute.</p>
    </SimpleToolLanding>
  );
}
