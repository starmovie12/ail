/** Ek hi event namespace (PRD §15.4). Purane dead `omnigrab:*` listeners hata diye gaye. */
export const EV = {
  historyUpdated: "ig:history-updated",
  settingsUpdated: "ig:settings-updated",
} as const;

export function emit(name: string, detail?: unknown) {
  if (typeof window === "undefined") return;
  try { window.dispatchEvent(new CustomEvent(name, { detail })); } catch { /* ignore */ }
}

export function on(name: string, fn: (e: Event) => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(name, fn);
  return () => window.removeEventListener(name, fn);
}
