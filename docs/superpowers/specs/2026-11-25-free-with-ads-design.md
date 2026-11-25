# Free with banner ads, and paying to remove them

Date: 2026-11-25
Status: approach set by the owner; the detailed calls below are Claude's and can be overridden
Supersedes: goal 2 ("Paid app") and section 3's release notes in [2026-09-18-open-play-and-redesign-design.md](2026-09-18-open-play-and-redesign-design.md)

## 1. Intent

Pickle & Score ships free instead of at ₱199. A small banner ad earns money, placed so it never gets in the way of play. People who don't want ads pay to remove them, either monthly or once for life. The lifetime price is set so it is clearly the better deal.

Nobody has paid for the app yet: the live store version is the free v1.1.0, and the ₱199 version never shipped. Switching models therefore carries no customer baggage.

## 2. Goals, non-goals, anti-goals

Goals
- Every feature stays free. Removing ads is the only thing anyone can buy.
- Banners appear only on calm screens, never where people tap during play.
- Paying removes every ad immediately, on both platforms, including when offline.
- The purchase can be restored on a new phone.

Non-goals
- Interstitial, rewarded, app-open or native ads. Ad mediation. Analytics.
- Accounts. Purchases are tied to the store account (Apple ID / Google account) through RevenueCat's anonymous user.
- Selling anything other than "remove ads".

Anti-goals (any of these counts as failure, even if everything works)
- A banner near the scorer buttons, the live session controls, or any primary action button, where a sweaty tap can hit it.
- Pop-ups, countdowns or repeated prompts nagging people to remove ads.
- An empty grey box where an ad failed to load.
- Someone who paid seeing an ad, even for a moment at launch or while offline.
- A feature that only works for people who paid.

## 3. Approaches considered

**Where the banner goes**
1. *Calm screens only* (chosen): Home, Stats, Settings, and inside the session summary. These get less screen time, so they earn less, but they carry no risk of accidental taps and they keep the app pleasant.
2. *Courtside screens too*: a banner on the scorer and the live session. Most screen time happens there, so it would earn far more. But the big buttons are tapped between rallies with sweaty hands, which brings accidental taps. Those annoy players and are what gets AdMob accounts suspended. Rejected. If revenue needs to grow later, the first thing to try is a banner at the *top* of the live session screen, well away from the court buttons.

**Ad network**
1. *Google AdMob via `react-native-google-mobile-ads`* (chosen): the best fill rate in the Philippines and worldwide, Google's own consent form for EU/UK users built in, and an Expo config plugin. v17 needs React Native 0.86 (0.83 only via 17.0.0, the first release of a rewritten API), so **pin 16.5.0**.
2. AppLovin MAX / Unity: adds mediation complexity this app doesn't need.

**Purchases**
1. *RevenueCat (`react-native-purchases` 11)* (chosen): one API for StoreKit and Play Billing, receipt validation on its servers, a cached ad-free status for offline use, restore, and a free tier until US$2.5k a month in revenue. The old, unshipped paywall branch already used it.
2. *Talking to the stores directly (`expo-iap` / `react-native-iap`)*: no third party, but receipt validation, subscription expiry and restore would all be ours to build. Rejected.
3. RevenueCat's ready-made paywall screens: rejected, because they won't match the Court & Paddle look.

## 4. The design

### 4.1 Where ads appear

| Screen | Ad | Placement |
|---|---|---|
| Home | yes | anchored adaptive banner pinned to the bottom, below the scroll area |
| Stats | yes | same |
| Settings (main page) | yes | same |
| Open Play session summary | yes | a standard 320×50 banner inline in the scroll content, between the fairness card and the paddle row. Its place must not depend on group size, or a big group pushes it onto the Done button on a small phone. Not an inline *adaptive* banner: on device that grew to a quarter of the screen |
| Singles / doubles scorer, game-over | no | courtside |
| Open Play check-in, live session | no | courtside; the check-in's Start button sits at the bottom |
| Rules, privacy, any sheet or dialog | no | |

Banner rules:
- Draw nothing until an ad has loaded. Never draw an empty slot. If loading fails (offline, no fill), the banner disappears.
- A hairline divider and an 8pt gap separate the banner from the content above it. The bottom safe area stays below it.
- One banner unit per platform. Ads limited to content rated PG. Not treated as child-directed.

### 4.2 Consent and tracking
- On launch, while the person still sees ads, run Google's consent flow (`AdsConsent.gatherConsent()`). It only shows a form where the law requires one (EEA, UK, Switzerland). Then initialise the ads SDK.
- **No Apple tracking prompt.** iOS shows ads without the advertising identifier. This gives up some revenue in exchange for one less pop-up, and keeps the "Data used to track you" store label empty. If revenue matters more later, add `expo-tracking-transparency` and ask once.
- When Google says privacy options are required (`privacyOptionsRequirementStatus === REQUIRED`), Settings shows an "Ad privacy choices" row that reopens the form.
- If the person is ad-free, the ads SDK is never initialised and makes no network requests.

### 4.3 What can be bought
- RevenueCat entitlement `ad_free`, in the `default` offering:
  - `$rc_lifetime` → non-consumable `ad_free_lifetime`
  - `$rc_monthly` → auto-renewing subscription `ad_free_monthly` (Apple subscription group "Ad-free")
- Suggested prices (set in the stores, not in code): **₱49 a month and ₱249 for lifetime** (about US$0.99 and US$4.99). Lifetime costs about five months of the monthly price, which is what makes it the obvious pick. The app always shows the store's localised price strings.
- Plan type comes from the entitlement: no expiration date means lifetime; any expiration date means monthly.

### 4.4 Ad-free status, offline
- A persisted Zustand store (`store/monetization-store.ts`, AsyncStorage) remembers `adFree` and `plan`.
- Until that store has loaded from disk, no banner is drawn, so a paying user never sees a flash of ads at launch.
- `adFree` changes only when RevenueCat actually answers. A network error or timeout never sets it to false.
- RevenueCat's customer-info listener updates the store live: a purchase, a restore, an expiry or a refund.

### 4.5 Ways in
- **Home:** one row, "Remove ads", in the existing list (next to Stats and Saved players). Hidden once ad-free.
- **Settings:** an "Ads" group.
  - Not yet ad-free: "Remove ads" (opens the sheet), "Restore purchases".
  - Ad-free: "Ad-free" with the value "Lifetime" or "Monthly". On monthly, add "Manage subscription", which opens `customerInfo.managementURL`, or the store's subscriptions page if that is missing.
  - "Ad privacy choices", only when 4.2 says it is required.
- Nothing else. No prompts after games or sessions, and no "remove ads" label next to the banner.

### 4.6 The Remove Ads sheet (uses the existing `Sheet`)

```
 Go ad-free
 Every feature stays free. This only removes the banners.

 ┌──────────────────────────────────────┐
 │ Lifetime                       ₱249  │  ← line (white) button, "Best value · pay once"
 └──────────────────────────────────────┘
 ┌──────────────────────────────────────┐
 │ Monthly                    ₱49/month │  ← deep button, "Cancel anytime"
 └──────────────────────────────────────┘
            Restore purchases

 Monthly renews automatically until you cancel it in your
 App Store / Google Play settings.   Terms of Use · Privacy Policy
```

States: loading the prices (spinner), store unreachable ("Can't reach the store. Check your connection and try again." plus Retry), purchasing (buttons disabled), done ("You're ad-free. Thanks for supporting Pickle & Score." then the sheet closes on its own), cancelled (says nothing), pending (Android's deferred payment: "Your payment is pending. Ads will disappear once it goes through."), other error (one-line message). Terms of Use is Apple's standard EULA. The privacy link uses the hosted policy URL.

### 4.7 Configuration
- `lib/monetization/config.ts` holds the RevenueCat public SDK keys (iOS, Android), the AdMob banner unit IDs (iOS, Android), and the hosted privacy policy URL. None of these is secret. Development builds always use Google's test banner unit.
- `app.json` → the `react-native-google-mobile-ads` plugin carries the AdMob app IDs, plus `skAdNetworkItems` (Google's `cstr6suwn9.skadnetwork`).
- `scripts/check-release-config.mjs` (`npm run release:check`) fails if any of these is still a placeholder or one of Google's sample/test IDs. RELEASE.md makes it a required step.
- Missing RevenueCat key at runtime: purchasing is unavailable and the sheet shows the store-unreachable state. The app must not crash.

### 4.8 Documents that change
- `app/settings/privacy.tsx` and `privacy-policy-page.jsx`: rewrite for ads (Google AdMob, what it collects, consent, ad privacy choices, purchases via App Store / Google Play / RevenueCat, and that ad-free means no ad network requests).
- `PRODUCT.md`: positioning, pricing, and principle 3 ("Paid means complete" becomes "Free means complete: every feature free; ads stay out of play; one quiet way to remove them").
- The 2026-09-18 spec: mark goal 2 as superseded by this document.
- `docs/RELEASE.md`: rewrite sections 1–3 for free plus ads (AdMob account and app-ads.txt, RevenueCat project, store products and prices, privacy labels and data safety form, Play target audience 18+, advertising ID declaration).
- `CHANGELOG.md`: entry for this release.
- New strings in all four languages (en, es, fr, de).

## 5. Left to the builder
- Exact copy wording, as long as it stays plain and short.
- Whether the banner wrapper reuses `COURT.outerDeep` or stays on the textured ground.
- Test structure, as long as the entitlement mapping, the offline rule, and the purchase outcomes are covered by unit tests with the native modules mocked.
