OmniGrab Splash Screen — kya karna hai

Zip ke andar folders project jaise hi hain. Zip extract karke `app`, `components`
aur `public` folders ko apne project ke root (jahan package.json hai) mein paste
karo. "Replace / Merge" puche to Yes.

  components/SplashScreen.tsx   - splash component
  components/SplashScreen.css   - splash design + animation
  components/splashConfig.ts    - text / timing / settings
  app/layout.tsx                - splash yahan jura hai
  public/icon-192.png           - NAYA OmniGrab app icon
  public/icon-512.png           - NAYA OmniGrab app icon (Android ki pehli system
                                  screen yahi icon dikhati hai)

Phir:  npm run dev   (ya deploy karo)

Zaruri: phone mein PWA ka icon turant nahi badalta. Purana app (home-screen
icon) hata do, site dobara kholo aur "Install / Add to Home screen" karo.

layout.tsx mein agar apne changes hain to sirf yeh jodo:
  import SplashScreen from "@/components/SplashScreen";
  import { SPLASH_GUARD_SCRIPT } from "@/components/splashConfig";
  <head> ke andar:        <script dangerouslySetInnerHTML={{ __html: SPLASH_GUARD_SCRIPT }} />
  <body> ke sabse upar:   <SplashScreen />
