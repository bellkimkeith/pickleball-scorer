# Release checklist

For release 1.2.0: Open Play, the Court & Paddle design, and the switch to a
**free app with banner ads and a paid way to remove them** (monthly or
lifetime). The live app is the free v1.1.0. The ₱199 paid version planned in
September never shipped, so nobody has paid for anything yet.

Design record: `docs/superpowers/specs/2026-11-25-free-with-ads-design.md`.

## 1. Before you build

- [ ] `npm test`: 112 tests pass (queue engine, fairness simulations, tokens, sounds, stores, ads, purchases, release check, strings).
- [ ] `npx tsc --noEmit --types react,node,jest` is clean.
      (Plain `npx tsc` aborts on a stray `node_modules/@types/react 2` folder on this machine. Deleting that folder or reinstalling `node_modules` fixes it.)
- [ ] `npm run lint -- --no-cache` shows 0 errors. The `--no-cache` matters: a stale cache reports phantom parse errors.
- `.npmrc` sets `legacy-peer-deps=true` so `npm install` and EAS Build's `npm ci` get past the old `jest-expo` 57 peer conflict (it wants React Native 0.86). Remove it once `jest-expo` matches SDK 55.
- [ ] `grep -rn "isPro\|PaywallModal" app components store lib` returns nothing.
- [ ] **`npm run release:check` passes.** It refuses a store build while any
      AdMob ID is Google's sample, a banner unit or RevenueCat key is empty, or
      the privacy policy URL is missing. Fill these in `app.json` (AdMob app IDs)
      and `lib/monetization/config.json` (everything else), as section 2 below explains.
- [ ] Bump `version` in `app.json` (and `ios.buildNumber` / `android.versionCode`).
- [ ] Icons and splash regenerate cleanly: `node scripts/generate-icons.mjs`.

## 2. Accounts and store setup

### AdMob (https://admob.google.com)
- [ ] Add the app twice, iOS and Android (link each to its store listing once it is live).
      Copy each **app ID** (`ca-app-pub-…~…`) into `app.json` →
      `react-native-google-mobile-ads` → `iosAppId` / `androidAppId`.
- [ ] Create one **adaptive banner** ad unit per platform. Copy the unit IDs
      (`ca-app-pub-…/…`) into `lib/monetization/config.json` → `admob`.
- [ ] Publish **app-ads.txt** at the root of the developer website listed in
      both stores (for example `https://bellkimkeith.com/app-ads.txt`), using
      the line AdMob gives you. Without it, fill rates drop.
- [ ] Blocking controls → max ad content rating **PG** (the app also asks for this in code).
- [ ] Privacy & messaging → create a **GDPR message** (European regulations) for
      both apps. Without one, users in the EEA, UK and Switzerland get no consent
      form and see only limited ads.
- [ ] Leave mediation off.

### RevenueCat (https://app.revenuecat.com)
- [ ] Create a project with an App Store app and a Play Store app.
- [ ] Entitlement **`ad_free`**.
- [ ] Products `ad_free_lifetime` and `ad_free_monthly`, both attached to `ad_free`.
- [ ] Offering **`default`** (set as current) with the packages
      **`$rc_lifetime`** → `ad_free_lifetime` and **`$rc_monthly`** → `ad_free_monthly`.
      The app finds the packages by these identifiers.
- [ ] Copy the public SDK keys (`appl_…`, `goog_…`) into
      `lib/monetization/config.json` → `revenueCat`. They are public by design.
- [ ] App Store: upload an In-App Purchase key (App Store Connect → Users and
      Access → Integrations) to RevenueCat. Google Play: give RevenueCat a
      service-account JSON with financial-data access.

### App Store Connect
- [ ] The **Paid Apps agreement** is signed and banking/tax are filled in (in-app purchases need it, even in a free app).
- [ ] App price: **Free**. Don't set ₱199.
- [ ] In-app purchase **`ad_free_lifetime`**, non-consumable, "Remove ads for life".
- [ ] Subscription group **"Ad-free"** with the auto-renewable **`ad_free_monthly`** (1 month).
- [ ] Prices (suggested): **₱49 a month, ₱249 lifetime** (about US$0.99 and US$4.99), with the equivalents elsewhere.
- [ ] Each product needs a review screenshot (the Remove Ads sheet) and a display name / description in every language you list.
- [ ] Submit the two in-app purchases **with** the app version. First-time IAPs must ride along with a binary.
- [ ] **App Privacy:** follow Google's guide for the Mobile Ads SDK
      (https://developers.google.com/admob/ios/privacy/data-disclosure). Add
      RevenueCat's items: Purchase History and a User ID / Device ID, used for
      App Functionality, linked to the user, not for tracking. **Tracking: No.**
      The app shows no tracking prompt. Answer this knowingly: the Google SDK's own
      privacy manifest lists Device ID as used for tracking, and Xcode's privacy
      report will show that. Without tracking permission iOS blocks those
      tracking domains and withholds the advertising identifier, so the app does
      not track. If App Review disagrees, the fallback is the tracking prompt
      described in spec section 4.2.
- [ ] Privacy policy URL: the hosted page built from `privacy-policy-page.jsx` (deploy it first). Put the same URL in `config.json` → `privacyPolicyUrl`.
- [ ] **Terms of Use (EULA) link in the App Store metadata.** Apple requires it
      for auto-renewable subscriptions, and a missing one is a common Guideline
      3.1.2 rejection. Showing it in the app is not enough. Add this line to the
      end of the App Description: "Terms of Use:
      https://www.apple.com/legal/internet-services/itunes/dev/stdeula/", or
      enter a custom EULA in App Store Connect.
- [ ] Age rating questionnaire: answer Yes to advertising. The rating stays 4+ with PG-limited ads.

### Google Play Console
- [ ] App price: **Free**.
- [ ] One-time product **`ad_free_lifetime`**. Subscription **`ad_free_monthly`** with a monthly auto-renewing base plan.
- [ ] Prices as above.
- [ ] **Ads declaration: Yes, the app contains ads.**
- [ ] **Advertising ID declaration:** used for advertising. The AdMob SDK adds the `AD_ID` permission.
- [ ] **Data safety:** follow Google's guide (https://developers.google.com/admob/android/privacy/play-data-disclosure), plus RevenueCat's purchase history and app user ID.
- [ ] **Target audience: 18+** (or 13+). Picking any age under 13 brings in the Families policy.

### Store listing (both)
- [ ] Description: free, every feature included; small ads that stay out of play; remove them monthly or once for life. Lead with Open Play (fair rotation). Remove any "no ads" or "one-time purchase" wording from earlier drafts.
- [ ] New screenshots. The strongest set: the live session with two courts and
      the paddle rack, the session summary ("everyone played 6 or 7 games"), the
      doubles scorer, check-in, and stats. **Shoot them on an ad-free build**
      (set `adFree` or leave the units empty) so no test ad appears.

## 3. Build and submit (EAS)

The project is linked to Expo as `@bellkimkeith/pickleball-scorer`. Builds run in
Expo's cloud, and production builds run `npm run release:check` first
(`eas-build-pre-install` in `package.json`), so a build with placeholder IDs
fails before anything is uploaded.

- [ ] **Android upload key, before the first Android build.** Play only accepts
      builds signed with the upload key that 1.1.0 used, and that key is not on
      this Mac. Upload it with `eas credentials` → Android → production →
      Keystore → upload an existing keystore. If it is lost, ask Play Console
      for an upload-key reset (App integrity), then let EAS make a new one.
      Letting EAS generate a fresh key without doing either gets the upload rejected.
- [ ] **iOS credentials:** run the first `eas build --platform ios --profile production`
      in your own terminal. It asks you to log in to Apple once, then makes and
      stores the distribution certificate and provisioning profile.
- [ ] Build: `eas build --platform all --profile production`. Version numbers
      come from EAS (`appVersionSource: remote`, `autoIncrement`), starting from
      app.json (iOS build 1, Android versionCode 2, then counting up).
- [ ] **Submit iOS:** `eas submit --platform ios --latest`. The first run asks
      for an App Store Connect API key: pick the one Expo already stores for
      your other app, or let it create one. This uploads the build. **Submitting
      for review is still a click in App Store Connect:** pick the build, attach
      both in-app purchases to this version, and press Submit for Review.
- [ ] **Submit Android:** save a Google Play service-account key as
      `google-play-service-account.json` in the repo root (git-ignored), then run
      `eas submit --platform android --latest`. It uploads to the production
      track as a **draft**, so you check the release in Play Console and press
      "Send for review".
- [ ] **Sandbox purchases on a real device before submitting:**
  - iOS: a Sandbox Apple ID (Settings → Developer → Sandbox Account). Android: a licence-tester account on an internal-testing track.
  - Buy lifetime: the banners disappear at once and stay gone after a relaunch in airplane mode.
  - Buy monthly on a fresh install: Settings shows "Ad-free · Monthly" and "Manage subscription" opens the store's page.
  - Cancel in the middle of a purchase: nothing changes and no message appears.
  - Delete the app, reinstall, and Restore purchases: ad-free again.
  - Let a sandbox monthly lapse (it renews every few minutes): the banners come back without a restart.
- [ ] **EU consent:** add your device as an AdMob test device, then check that the GDPR form shows and that Settings → Ads → "Ad privacy choices" reopens it.
- [ ] Android: the adaptive icon relies on `iconBackground` `#2d5a48` in
      `android/app/src/main/res/values/colors.xml`. Confirm the launcher icon
      looks right on a real device, not only the emulator.
- [ ] iOS: the icon must carry no alpha channel at all. App Store Connect
      rejects one that does (ITMS-90717), however opaque its pixels look.
      `scripts/generate-icons.mjs` flattens it. Check with
      `sips -g hasAlpha assets/icon.png`: it must say `no`.
- [ ] A release build still carries expo-dev-client's
      `NSLocalNetworkUsageDescription` ("Expo Dev Launcher uses the local
      network…") and, on Android, `SYSTEM_ALERT_WINDOW`. The launcher's code is
      *not* in the release APK, so nothing uses them. Decide whether to strip
      the strings before App Review reads them.
- [ ] App Review notes: "Free app with banner ads. The in-app purchases only remove ads; every feature is free. Purchases: Settings → Ads → Remove ads."

## 4. Test on real hardware

Release builds of both platforms were driven through every screen on 8 October
2026 — the Android `assembleRelease` APK on a Pixel 7 Pro emulator and an iOS
Release build on an iPhone 17 Pro simulator (iOS 26.3), plus a launch check on
iOS 27. Settings and all four languages, singles, doubles in both scoring modes,
the whole Open Play lifecycle, kill-and-resume, twelve players with long names,
and large type all passed. The report and screenshots live beside the repo in
`pickleball-scorer-qa-2026-09-23/`.

**Ads and purchases, 25 November 2026.** Debug builds of `feature/free-with-ads` were
driven with Maestro on the iPhone 17 Pro simulator (iOS 26.3) and the Pixel 7 Pro
emulator (API 34), using Google's test ads. Flows and screenshots live beside the repo in
`pickleball-scorer-qa-2026-11-25/`. Verified on both platforms, unless a check names one:
- A test banner is pinned at the bottom of Home, Stats and Settings, and a small 320×50 banner sits inline in the Open Play summary.
- No banner appears on the singles and doubles setup or scorer, Open Play check-in, the live session, Rules or Privacy.
- With no RevenueCat keys, Remove ads shows "Can't reach the store…" with Try again, Restore explains the same, and nothing crashes.
- Ad-free (simulated, iOS): no banner anywhere, no "Remove ads" row on Home, and Settings shows "Ad-free · Lifetime".
- Offline (airplane mode, Android): a banner that cannot load leaves no box and no gap.

Not covered by simulators, and so left for a device: real ad fill with your own units, sandbox purchases and restore, a monthly plan lapsing, and the EU consent form.

Build notes from the run:
- The repo sits in an iCloud-synced folder, so `xcodebuild -derivedDataPath ios/build` fails code signing ("resource fork, Finder information, or similar detritus not allowed"). Use the default DerivedData.
- `expo run:android` takes the AVD name (`Pixel_7_Pro_API_34`), not `emulator-5554`.

What a simulator cannot answer, and a phone still has to:

- [ ] A real outdoor session in sunlight: can you read the court and the rack at
      arm's length?
- [ ] VoiceOver / TalkBack on the live session screen: each court reads as a
      sentence, each paddle says its name and games played. (The settings rows
      were fixed on 8 October so their toggles, steppers and segmented pickers
      are reachable at all; confirm by ear on a device.)
- [ ] Custom sounds: add a clip, assign it to a team, hear it on a point; try a
      too-long clip and check the message names the limit. The file picker is
      the one path automation could not drive.
- [ ] Haptics on a real device — the simulator has none.
- [ ] The launcher icon on a real Android device, not only the emulator.

## 5. Known gaps to decide on

- The soundboard ships with 6 built-in sounds; the other 11 names were removed
  because they never had audio files. Add licensed clips later if you want more.
- The app is single-device: no accounts, no sync, no sharing a live queue.
- Check-in lets you set more courts than the people present can fill, so a court
  can sit empty for the whole session.
- Stats counts every Open Play match as the phone owner's own win or loss, and
  in their streak, though the organiser may not have been playing.
- The Rules page says both partners serve "except for the very first serve",
  while the scorer opens a doubles game at 0-0-1 and offers "2nd Serve". The
  scoring behaviour predates this branch; the contradiction is new because the
  page is new.

## 6. After release

- [ ] Watch the first sessions: the fairness rules are the product, so any
      report of "someone kept sitting out" deserves the session's numbers.
- [ ] Watch AdMob's Policy center for the first weeks. Invalid-click warnings
      mean a banner sits too close to something people tap.
- [ ] Revenue lever, if banners earn too little: a banner at the *top* of the
      live session screen, away from the court buttons (see the design doc).
- [ ] `docs/superpowers/specs/2026-09-18-open-play-and-redesign-design.md` is the
      design record; `DESIGN.md` is the visual system. Keep both current.
