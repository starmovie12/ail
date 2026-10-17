import type { Metadata } from "next";
import { Suspense } from "react";
import ToolsScreen from "@/components/ToolsScreen";
import { TOOL_COUNT } from "@/lib/registry";

export const metadata: Metadata = {
  title: "All Tools — Instagram, Facebook, TikTok Downloaders & Creator Tools",
  description: `Browse all ${TOOL_COUNT} free tools: Instagram, Facebook, TikTok, YouTube, Pinterest, X and Threads downloaders, AI caption & hashtag generators, analytics, photo studio and more.`,
  alternates: { canonical: "/tools" },
};

export default function Page() {
  return <Suspense fallback={null}><ToolsScreen /></Suspense>;
}
