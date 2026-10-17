import type { Metadata } from "next";
import SettingsScreen from "@/components/SettingsScreen";

export const metadata: Metadata = {
  title: "Settings | InstaGrab",
  description: "Language, theme, download preferences and app install.",
  alternates: { canonical: "/settings" },
  robots: { index: false, follow: true },
};

export default function Page() {
  return <SettingsScreen />;
}
