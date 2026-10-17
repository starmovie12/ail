"use client";

/**
 * Adsterra 300×250 iframe banner. The vendor script uses document.write, which
 * would blow away a React page — so we sandbox it inside an <iframe srcDoc>,
 * where document.write is harmless and scoped. Fixed reserved size = zero CLS.
 */
const AD_KEY = "133f9e4d0783d62b59648f9dda9c5954";

const DOC = `<!doctype html><html><head><meta charset="utf-8">
<style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}</style></head>
<body>
<script type="text/javascript">
  atOptions = { key: '${AD_KEY}', format: 'iframe', height: 250, width: 300, params: {} };
</script>
<script type="text/javascript" src="https://www.highperformanceformat.com/${AD_KEY}/invoke.js"></script>
</body></html>`;

export default function AdBanner300({ label = "Advertisement" }: { label?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, margin: "8px auto", width: 300, maxWidth: "100%" }}>
      <span className="mono" style={{ fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-3)" }}>{label}</span>
      <iframe
        title="Sponsored"
        srcDoc={DOC}
        width={300}
        height={250}
        scrolling="no"
        loading="lazy"
        style={{ border: "1px solid var(--line)", borderRadius: 12, width: 300, maxWidth: "100%", height: 250, display: "block", background: "var(--surface-2)" }}
      />
    </div>
  );
}
