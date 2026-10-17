/* ==========================================================================
   OMNIGRAB SPLASH — settings (yahin se badlo)
   Yeh file "use client" nahi hai, taaki layout.tsx (server component) isse
   seedha import kar sake.
   ========================================================================== */

export const APP_NAME_A = "Omni";              // title ka pehla hissa (safed)
export const APP_NAME_B = "Grab";              // title ka doosra hissa (gradient)
export const TAGLINE_1 = "Download & Extract Anything";
export const TAGLINE_2 = "from Every Social App";
export const SCRIPT_LINE = "Grab More. Do More.";

export const SHOW_MS = 2800;                   // splash kitni der dikhe (ms)
export const FADE_MS = 500;                    // gayab hone ka animation (ms)

/** true => sirf installed app (PWA / home-screen) mein dikhe, browser tab mein nahi */
export const ONLY_IN_INSTALLED_APP = false;
/** true => ek session mein sirf ek baar; false => har page-load par */
export const ONCE_PER_SESSION = true;

export const SPLASH_KEY = "og.splashShown";

/** <head> mein inline chalti hai — pehle paint se pehle decide karti hai ki
 *  splash dikhana hai ya nahi (dobara aane par ek frame ka flash nahi hota). */
export const SPLASH_GUARD_SCRIPT =
  "(function(){try{var d=document.documentElement;var skip=false;" +
  (ONLY_IN_INSTALLED_APP
    ? "if(!(matchMedia('(display-mode: standalone)').matches||navigator.standalone))skip=true;"
    : "") +
  (ONCE_PER_SESSION ? `if(sessionStorage.getItem('${SPLASH_KEY}'))skip=true;` : "") +
  "if(skip)d.classList.add('os-skip');}catch(e){}})();";
