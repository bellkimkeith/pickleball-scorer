# Release checklist

For the release that turns Pickle & Score into a one-time paid app with Open
Play and the Court & Paddle design. The live app is the free v1.1.0; this
release is the first to carry Open Play, the new design, and a price.

## 1. Before you build

- [ ] `npm test` — 53 tests pass (queue engine, fairness simulations, tokens, sounds, store).
- [ ] `npx tsc --noEmit --types react,node,jest` — clean.
      (Plain `npx tsc` aborts on a stray `node_modules/@types/react 2` folder on this machine; deleting that folder or reinstalling `node_modules` fixes it properly.)
- [ ] `npm run lint -- --no-cache` — 0 errors. The `--no-cache` matters: a stale cache reports phantom parse errors.
- [ ] `grep -rn "isPro\|PaywallModal\|react-native-purchases" app components store lib` — no results.
- [ ] Bump `version` in `app.json` (and `ios.buildNumber` / `android.versionCode`).
- [ ] Icons and splash regenerate cleanly: `node scripts/generate-icons.mjs`.

## 2. Store setup

Verified from the repository on 22 September 2026: **the paywall was never
shipped.** The subscription code lived only on the
`feature/phase1-soundboard-stats-paywall` branch, never reached `main`, is
absent from the `v1.1.0` tag, and the RevenueCat key was never filled in (the
store fell back to the literal `your_api_key_here`). What is live is a free app
at version 1.1.0. So there are no subscribers to migrate and nothing to stop
selling.

- [ ] Set the price in both stores (₱199 or the local equivalent). Note that on
      both stores, people who already downloaded the free version keep it for
      free; only new downloads pay.
- [ ] Delete the RevenueCat project if one was ever created; nothing in the app
      talks to it.
- [ ] Update the store description: no subscriptions, no ads, works offline,
      one-time purchase. Lead with Open Play (fair rotation).
- [ ] New screenshots. The strongest set: the live session with two courts and
      the paddle rack, the session summary ("everyone played 6 or 7 games"),
      the doubles scorer, check-in, and stats.
- [ ] **Privacy questionnaires:** the app collects nothing, makes no network
      requests, and has no analytics or ads. The only file access is the audio
      clip a user picks for a custom sound, which is copied into the app and
      never leaves the device. `app/settings/privacy.tsx` says exactly this and
      should match what you file.

## 3. Build and submit

- [ ] `eas.json` still carries placeholder Apple credentials; fill them in
      before `eas submit`.
- [ ] Build: `eas build --platform ios` and `eas build --platform android`
      (or `npx expo run:*` locally for a last device check).
- [ ] Android: the new adaptive icon relies on `iconBackground` `#2d5a48` in
      `android/app/src/main/res/values/colors.xml`. Confirm the launcher icon
      looks right on a real device, not only the emulator.
- [ ] iOS: the icon must carry no alpha channel at all — App Store Connect
      rejects one that does (ITMS-90717), however opaque its pixels look. This
      was wrong until 8 October 2026: sharp wrote RGBA even though the artwork
      paints a full background. `scripts/generate-icons.mjs` now flattens the
      icon and the favicon; Android's adaptive foreground keeps its alpha, as it
      must. Check with `sips -g hasAlpha assets/icon.png` — it must say `no`.
- [ ] A release build still carries expo-dev-client's
      `NSLocalNetworkUsageDescription` ("Expo Dev Launcher uses the local
      network…") and, on Android, `SYSTEM_ALERT_WINDOW`. The launcher's code is
      *not* in the release APK, so nothing uses them; decide whether to strip
      the strings before App Review reads them.

## 4. Test on real hardware

Release builds of both platforms were driven through every screen on 8 October
2026 — the Android `assembleRelease` APK on a Pixel 7 Pro emulator and an iOS
Release build on an iPhone 17 Pro simulator (iOS 26.3), plus a launch check on
iOS 27. Settings and all four languages, singles, doubles in both scoring modes,
the whole Open Play lifecycle, kill-and-resume, twelve players with long names,
and large type all passed. The report and screenshots live beside the repo in
`pickleball-scorer-qa-2026-09-23/`.

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
- [ ] `docs/superpowers/specs/2026-09-18-open-play-and-redesign-design.md` is the
      design record; `DESIGN.md` is the visual system. Keep both current.
