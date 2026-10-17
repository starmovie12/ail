"use client";
import { ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function TrustLine() {
  const { t } = useI18n();
  return (
    <p className="mono" style={{
      display: "flex", alignItems: "center", gap: 8, justifyContent: "center",
      fontSize: 13, color: "var(--ink-3)",
    }}>
      <ShieldCheck size={16} strokeWidth={1.5} style={{ color: "var(--gold-ink)" }} aria-hidden="true" />
      {t("trust")}
    </p>
  );
}
