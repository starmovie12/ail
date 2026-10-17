OmniGrab Splash Screen — kya karna hai
1) components/ ke 3 files apne project ki components/ folder mein copy karo:
     SplashScreen.tsx, SplashScreen.css, splashConfig.ts
2) app/layout.tsx replace karo (ya sirf 3 line jodo — neeche dekho)
3) npm run dev  ->  http://localhost:3000

layout.tsx mein sirf yeh jodna hai:
  import SplashScreen from "@/components/SplashScreen";
  import { SPLASH_GUARD_SCRIPT } from "@/components/splashConfig";
  <head> ke andar:   <script dangerouslySetInnerHTML={{ __html: SPLASH_GUARD_SCRIPT }} />
  <body> ke sabse upar:   <SplashScreen />
