import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SimpleToolLanding from "@/components/SimpleToolLanding";
import AiTool from "@/components/AiTool";
import { AI_TOOLS, aiToolBySlug } from "@/lib/ai-tools";

export function generateStaticParams() {
  return AI_TOOLS.map((t) => ({ tool: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ tool: string }> }): Promise<Metadata> {
  const { tool } = await params;
  const def = aiToolBySlug(tool);
  if (!def) return {};
  return {
    title: def.seoTitle,
    description: def.seoDesc,
    alternates: { canonical: `/ai/${def.slug}` },
  };
}

export default async function Page({ params }: { params: Promise<{ tool: string }> }) {
  const { tool } = await params;
  const def = aiToolBySlug(tool);
  if (!def) notFound();

  return (
    <SimpleToolLanding
      eyebrow={def.eyebrow}
      h1={<>{def.h1[0]}<em className="gilded">{def.h1[1]}</em>.</>}
      lead={def.lead}
      tool={<AiTool def={def} />}
      faq={def.faq}
    >
      {def.prose.map((s) => (
        <div key={s.h}>
          <h2>{s.h}</h2>
          <p>{s.p}</p>
        </div>
      ))}
    </SimpleToolLanding>
  );
}
