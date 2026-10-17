import type { Metadata } from "next";
import HistoryScreen from "@/components/HistoryScreen";

export const metadata: Metadata = {
  title: "Recent Grabs — Private, On-Device History | InstaGrab",
  description: "Your InstaGrab download history — stored only in your browser, visible only to you.",
  alternates: { canonical: "/history" },
  robots: { index: false, follow: true },
};

export default function Page() {
  return <HistoryScreen />;
}
