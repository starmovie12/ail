# InstaGrab Browser Extension (Manifest V3)

Right-click any Instagram link or post page → **Download with InstaGrab** →
opens the site's quick-action flow with the URL prefilled.

## Install (developer mode)

1. Open `chrome://extensions` (or `edge://extensions`)
2. Enable **Developer mode**
3. **Load unpacked** → select this `extension/` folder

## Notes

- `icon-128.png` is copied from the site's PWA icon (`public/icon-192.png`,
  renamed). Replace with a dedicated 128×128 icon before a Web Store release.
- Update `SITE` in `background.js` if the site moves to a custom domain.
- No content scripts, no host permissions beyond context menus — review-friendly.
