// InstaGrab extension (MV3) — right-click → "Download with InstaGrab".
// The heavy lifting stays on the website; the extension just deep-links into
// the existing /quick-action flow with the URL prefilled.

const SITE = "https://instagrabs.vercel.app";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "instagrab-link",
    title: "Download with InstaGrab",
    contexts: ["link"],
    targetUrlPatterns: ["*://*.instagram.com/*"],
  });
  chrome.contextMenus.create({
    id: "instagrab-page",
    title: "Download this page with InstaGrab",
    contexts: ["page"],
    documentUrlPatterns: ["*://*.instagram.com/*"],
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  const url = info.menuItemId === "instagrab-link" ? info.linkUrl : info.pageUrl;
  if (!url) return;
  chrome.tabs.create({ url: `${SITE}/quick-action?url=${encodeURIComponent(url)}` });
});

// Toolbar button → open the site.
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: SITE });
});
