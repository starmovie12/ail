OmniGrab Splash Screen — kya karna hai

Zip extract karke `app`, `components` aur `public` folders ko apne project ke
root (jahan package.json hai) mein paste karo. "Replace / Merge" puche to Yes.

  components/SplashScreen.tsx      splash component
  components/SplashScreen.css      splash design + animation
  components/splashConfig.ts       text / timing / settings
  app/layout.tsx                   splash yahan jura hai
  public/manifest.webmanifest      icons ki list badli hai (neeche dekho)
  public/icon-blank-192/512.png    TRANSPARENT icons  -> Android ki pehli system
                                   screen par koi icon nahi dikhta
  public/icon-maskable-192/512.png ASLI OmniGrab icon -> sirf home-screen icon
  public/icon-192/512.png          OmniGrab icon (extension / baaki jagah ke liye)

Phir deploy karo (ya npm run dev).

ZARURI (phone par):
 1) Purana installed app / home-screen icon HATA do (uninstall).
 2) Chrome mein site kholo, thodi der ruko, phir "Install app / Add to Home
    screen" karo. Naya manifest tabhi lagta hai.
 3) Chrome ka cache purana ho to: Chrome > Settings > Site settings > is site ka
    data clear karo, phir install karo.

layout.tsx mein agar apne changes hain to sirf yeh jodo:
  import SplashScreen from "@/components/SplashScreen";
  import { SPLASH_GUARD_SCRIPT } from "@/components/splashConfig";
  <head> ke andar:        <script dangerouslySetInnerHTML={{ __html: SPLASH_GUARD_SCRIPT }} />
  <body> ke sabse upar:   <SplashScreen />
