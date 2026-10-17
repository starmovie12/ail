import type { Metadata } from "next";
import { Suspense } from "react";
import QuickAction from "@/components/QuickAction";

export const metadata: Metadata = {
  title: "Quick Download — InstaGrab",
  description: "Instant Instagram download.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <QuickAction />
    </Suspense>
  );
}
