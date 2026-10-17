import type { Metadata } from "next";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import BestTimeTool from "@/components/BestTimeTool";

export const metadata: Metadata = {
  title: "Best Time to Post on Instagram — India & Global (Free Tool) | InstaGrab",
  description:
    "Find the best time to post on Instagram for your niche and audience — India (IST), USA, Europe or global. Day-by-day golden windows, free, no login.",
  alternates: { canonical: "/best-time-to-post" },
};

export default function Page() {
  return (
    <SimpleToolLanding
      eyebrow="Best time to post"
      h1={<>Post when your audience is <em className="gilded">actually awake</em>.</>}
      lead="Pick your niche and where your audience lives — get golden posting windows for every day of the week."
      tool={<BestTimeTool />}
      faq={[
        { q: "What's the best time to post on Instagram in India?", a: "For most Indian audiences: 12–1 PM (lunch scroll) and 7–10 PM (prime time) IST work best, with Wednesday and Thursday the strongest days. Use the tool above to adjust for your niche." },
        { q: "Does posting time really matter?", a: "Yes — the first hour decides how far Instagram pushes your post. Posting when your audience is online front-loads early engagement, which signals the algorithm to widen distribution." },
        { q: "Where does this data come from?", a: "From published posting-time studies of millions of posts, adjusted for audience timezone and niche behaviour (fitness audiences are up early, entertainment peaks late). Your own insights are the final judge — test and iterate." },
        { q: "How do I find MY personal best time?", a: "Run our profile audit — it reads when your recent posts actually landed and where they cluster. Combine that with these windows and test for two weeks." },
      ]}
    >
      <h2>Why the first hour decides everything</h2>
      <p>Instagram tests your post on a slice of your followers before deciding whether to push it wider. If that slice is asleep, the test fails no matter how good the content is. Posting inside your audience&apos;s active windows is the cheapest reach boost that exists.</p>
      <h2>India-first timing</h2>
      <p>Most posting-time advice online is written for US audiences. Indian scrolling peaks are different — a strong lunch spike around <strong>12–1 PM IST</strong> and a long evening block from <strong>7 to 10 PM</strong>. This tool has a dedicated India mode instead of a lazy timezone conversion.</p>
      <h2>Test, don&apos;t guess</h2>
      <p>Use the golden windows above as your starting grid, post consistently for two weeks, then check which slots won in your insights. Keep the winners, replace the losers. Consistency in a good window beats perfection in a random one.</p>
    </SimpleToolLanding>
  );
}
