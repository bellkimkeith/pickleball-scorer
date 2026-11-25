# Free with Banner Ads Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Pickle & Score free, with AdMob banners on calm screens only, and a RevenueCat "remove ads" purchase (monthly or lifetime) that works offline and can be restored.

**Architecture:** One persisted Zustand store (`store/monetization-store.ts`) owns ad-free status, the store offer and the ads-ready flag. It talks to RevenueCat directly and to AdMob through a thin `lib/ads/ads.ts`. A single `AdBanner` component decides from that store whether to draw anything. All IDs and keys live in one JSON file that a release-check script refuses to ship with placeholders.

**Tech Stack:** Expo SDK 55 (CNG, `ios/` and `android/` are generated), React Native 0.83, `react-native-google-mobile-ads@16.5.0`, `react-native-purchases@11.0.4`, Zustand 5 `persist` with AsyncStorage, i18next, Jest (`jest-expo`).

**Spec:** [docs/superpowers/specs/2026-11-25-free-with-ads-design.md](../specs/2026-11-25-free-with-ads-design.md)

## Global Constraints

- Pin `react-native-google-mobile-ads` to exactly `16.5.0` (v17.1+ needs RN 0.86; 17.0.0 is a rewritten API). `react-native-purchases` `^11.0.4`. No `react-native-purchases-ui`, no `expo-tracking-transparency`.
- Banners only on: Home, Stats, Settings main page (anchored at the bottom) and the Open Play summary (inline). Nowhere else.
- No interstitial, rewarded, app-open or native ads; no prompts to remove ads apart from the Home row and the Settings group.
- Entitlement `ad_free`; packages `$rc_lifetime` (`ad_free_lifetime`) and `$rc_monthly` (`ad_free_monthly`); offering `default`.
- Ad request configuration: `maxAdContentRating: MaxAdContentRating.PG`, `tagForChildDirectedTreatment: false`, `tagForUnderAgeOfConsent: false`.
- Development builds (`__DEV__`) always use `TestIds.ADAPTIVE_BANNER`.
- `adFree` only changes when RevenueCat actually answers. Errors never set it to false.
- Screens use inline styles with `COURT` tokens from `lib/theme/tokens.ts`, like every existing screen (not NativeWind classes).
- Every new user-facing string goes in `i18n/en.ts`, `es.ts`, `fr.ts`, `de.ts` under a new `ads` section. The privacy pages stay English-only, as they are today.
- Tests live in `__tests__/` folders and are named `*.test.ts` (see `jest.config.js`). Native modules are mocked in the test files.
- Verification commands: `npm test`, `npx tsc --noEmit --types react,node,jest`, `npm run lint -- --no-cache`.
- iOS simulator runs use iOS 26.3 (Expo 55 crashes on the iOS 27 simulator); this Xcode has no Simulator.app, so drive it with `xcrun simctl`.

## Review Focus

1. **A paying user opens the app offline.** No banner flashes before the stored ad-free status has loaded from disk. Pinned by `shouldShowBanner` returning false while not hydrated (Task 4).
2. **The monthly plan expires or is refunded while the app is open.** Ads come back without a restart. Pinned by the customer-info listener starting ads when `adFree` flips to false (Task 3).
3. **RevenueCat key missing, or the store can't be reached.** The sheet shows "can't reach the store", and nothing crashes. Pinned by `loadOffer` resolving to `'unavailable'` when no key is configured or `getOfferings` throws (Task 2).
4. **Someone double-taps Buy, or pays with Android's deferred payment.** There is one purchase call, and the outcome is `'pending'`, not `'success'`. Pinned by tests in Task 2.
5. **An ad fails to load (offline, no fill).** No empty box. Pinned by the `failed` state in `AdBanner` returning null; checked on device in Task 7 with networking off.

---

### Task 1: Dependencies, config, and the release check

**Files:**
- Modify: `package.json` (deps, `release:check` script), `app.json` (plugin)
- Create: `lib/monetization/config.json`, `lib/monetization/config.ts`, `scripts/check-release-config.js`
- Test: `scripts/__tests__/check-release-config.test.ts`

**Interfaces:**
- Produces: `MONETIZATION_CONFIG` and `ENTITLEMENT_ID = 'ad_free'` from `lib/monetization/config.ts`; `findReleaseProblems(appJson: object, config: MonetizationConfig): string[]` from `scripts/check-release-config.js` (CommonJS, `module.exports`; runs as a CLI when `require.main === module`, exits 1 and prints each problem when the list is non-empty).
- `MonetizationConfig` shape (the JSON file, all strings, empty = not set yet):

```json
{
  "revenueCat": { "iosApiKey": "", "androidApiKey": "" },
  "admob": { "iosBannerUnitId": "", "androidBannerUnitId": "" },
  "privacyPolicyUrl": "",
  "termsOfUseUrl": "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
}
```

- [ ] **Step 1: Install dependencies**

Run: `npx expo install react-native-google-mobile-ads@16.5.0 react-native-purchases`, then make sure `package.json` reads exactly `"react-native-google-mobile-ads": "16.5.0"`.
Expected: both appear in `dependencies`; `npm ls react-native-google-mobile-ads` shows 16.5.0.

- [ ] **Step 2: Add the plugin to `app.json`**

Append to `expo.plugins`:

```json
["react-native-google-mobile-ads", {
  "iosAppId": "ca-app-pub-3940256099942544~1458002511",
  "androidAppId": "ca-app-pub-3940256099942544~3347511713",
  "skAdNetworkItems": ["cstr6suwn9.skadnetwork"]
}]
```

These are Google's sample app IDs. The SDK crashes at launch without an app ID, and the release check rejects these.

- [ ] **Step 3: Write the failing tests** (`scripts/__tests__/check-release-config.test.ts`)

```ts
const { findReleaseProblems } = require('../check-release-config');

const good = {
  revenueCat: { iosApiKey: 'appl_abc', androidApiKey: 'goog_abc' },
  admob: { iosBannerUnitId: 'ca-app-pub-1111111111111111/2222222222', androidBannerUnitId: 'ca-app-pub-1111111111111111/3333333333' },
  privacyPolicyUrl: 'https://example.com/privacy',
  termsOfUseUrl: 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/',
};
const appJson = (ios: string, android: string) => ({
  expo: { plugins: ['expo-router', ['react-native-google-mobile-ads', { iosAppId: ios, androidAppId: android }]] },
});
const realApp = appJson('ca-app-pub-1111111111111111~4444444444', 'ca-app-pub-1111111111111111~5555555555');

it('passes a fully configured release', () => {
  expect(findReleaseProblems(realApp, good)).toEqual([]);
});
it('rejects Google sample app IDs', () => {
  const problems = findReleaseProblems(appJson('ca-app-pub-3940256099942544~1458002511', 'ca-app-pub-3940256099942544~3347511713'), good);
  expect(problems).toHaveLength(2);
});
it('rejects empty or test banner units', () => {
  const config = { ...good, admob: { iosBannerUnitId: '', androidBannerUnitId: 'ca-app-pub-3940256099942544/9214589741' } };
  expect(findReleaseProblems(realApp, config)).toHaveLength(2);
});
it('rejects missing, test-store, or cross-platform RevenueCat keys', () => {
  const config = { ...good, revenueCat: { iosApiKey: 'test_abc', androidApiKey: 'appl_abc' } };
  expect(findReleaseProblems(realApp, config)).toHaveLength(2);
});
it('requires an https privacy policy URL', () => {
  expect(findReleaseProblems(realApp, { ...good, privacyPolicyUrl: '' })).toHaveLength(1);
});
it('fails when the AdMob plugin is missing', () => {
  expect(findReleaseProblems({ expo: { plugins: [] } }, good).length).toBeGreaterThan(0);
});
```

- [ ] **Step 4: Run them to confirm they fail**

Run: `npx jest scripts/__tests__/check-release-config.test.ts`
Expected: FAIL, "Cannot find module '../check-release-config'".

- [ ] **Step 5: Implement `findReleaseProblems` and the CLI in `scripts/check-release-config.js`**

The rules: the Google test publisher `ca-app-pub-3940256099942544` is rejected anywhere. App IDs must match `^ca-app-pub-\d{16}~\d{10}$` and unit IDs `^ca-app-pub-\d{16}/\d{10}$`. The iOS key starts `appl_` and the Android key starts `goog_`. The privacy URL starts `https://`. Each problem is one plain sentence naming the field. The CLI reads `app.json` and `lib/monetization/config.json` from the repo root. Add `"release:check": "node scripts/check-release-config.js"` to `package.json`.

- [ ] **Step 6: Create `lib/monetization/config.json`** (the shape above, empty values) **and `lib/monetization/config.ts`**, which exports `MONETIZATION_CONFIG` (the JSON, typed as `MonetizationConfig`) and `ENTITLEMENT_ID`.

- [ ] **Step 7: Run the tests and the CLI**

Run: `npx jest scripts/__tests__/check-release-config.test.ts && npm run release:check`
Expected: tests PASS. The CLI exits 1, listing the two sample app IDs, two banner units, two RevenueCat keys and the privacy URL (7 problems).

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json app.json lib/monetization scripts
git commit -m "build(ads): add AdMob and RevenueCat, with a release check that refuses placeholder IDs"
```

---

### Task 2: Ad-free status and purchases (store)

**Files:**
- Create: `lib/monetization/entitlement.ts`, `store/monetization-store.ts`
- Test: `lib/monetization/__tests__/entitlement.test.ts`, `store/__tests__/monetization-store.test.ts`

**Interfaces:**
- Consumes: `MONETIZATION_CONFIG`, `ENTITLEMENT_ID` (Task 1).
- Produces:

```ts
// lib/monetization/entitlement.ts
export type AdFreePlan = 'lifetime' | 'monthly';
export interface AdFreeStatus { adFree: boolean; plan: AdFreePlan | null; managementUrl: string | null }
export function statusFromCustomerInfo(info: CustomerInfo): AdFreeStatus;

// store/monetization-store.ts
export type PurchaseOutcome = 'success' | 'cancelled' | 'pending' | 'unavailable' | 'error';
export interface AdFreeOption { plan: AdFreePlan; priceString: string; pkg: PurchasesPackage }
export type OfferState =
  | { status: 'idle' | 'loading' | 'unavailable' }
  | { status: 'ready'; options: AdFreeOption[] };   // lifetime first, then monthly
interface MonetizationState extends AdFreeStatus {
  hydrated: boolean;              // persisted store finished loading
  purchasesConfigured: boolean;
  adsReady: boolean;              // Task 3 sets it
  privacyOptionsRequired: boolean;// Task 3 sets it
  offer: OfferState;
  purchasing: boolean;
  configurePurchases: () => boolean;           // false when no key for this platform
  refresh: () => Promise<void>;
  loadOffer: () => Promise<void>;
  purchase: (plan: AdFreePlan) => Promise<PurchaseOutcome>;
  restore: () => Promise<PurchaseOutcome>;     // 'success' only if ad-free afterwards; 'error' with no entitlement found
}
export const useMonetizationStore: UseBoundStore<...>;
```

Only `adFree`, `plan` and `managementUrl` are persisted (`partialize`), under the AsyncStorage name `monetization`. `hydrated` is set in `onRehydrateStorage`.

- [ ] **Step 1: Write the failing entitlement tests**

Build `CustomerInfo` fixtures with a helper that fills only `entitlements.active` and `managementURL`.
- `statusFromCustomerInfo` with no `ad_free` in `active` → `{ adFree: false, plan: null, managementUrl: null }`
- `ad_free` with `expirationDate: null` → `{ adFree: true, plan: 'lifetime', ... }`
- `ad_free` with `expirationDate: '2026-12-25T00:00:00Z'` and `managementURL: 'https://apps.apple.com/account/subscriptions'` → `{ adFree: true, plan: 'monthly', managementUrl: 'https://apps.apple.com/account/subscriptions' }`
- An active entitlement with a different id (`pro`) → `adFree: false`

- [ ] **Step 2: Run them to confirm they fail**, then implement `statusFromCustomerInfo`. Run again: PASS.

- [ ] **Step 3: Write the failing store tests** (`store/__tests__/monetization-store.test.ts`)

Mock `react-native-purchases` with a `jest.mock` factory: default export with `configure`, `getCustomerInfo`, `getOfferings`, `purchasePackage`, `restorePurchases`, `addCustomerInfoUpdateListener`, `setLogLevel` as `jest.fn()`, plus `PURCHASES_ERROR_CODE` with `PURCHASE_CANCELLED_ERROR: '1'` and `PAYMENT_PENDING_ERROR: '20'`, and `LOG_LEVEL`. Mock AsyncStorage as `session-store.test.ts` does. Mock `lib/monetization/config` per test to supply or blank the keys. Reset the store state in `beforeEach`.

- `refresh keeps adFree true when getCustomerInfo rejects` (start `adFree: true`, reject with a network error → still `true`)
- `refresh sets adFree false when RevenueCat answers without the entitlement`
- `loadOffer is unavailable when no key is configured` (blank keys → `offer.status === 'unavailable'`, `getOfferings` not called)
- `loadOffer is unavailable when getOfferings throws`
- `loadOffer lists lifetime before monthly with store price strings` (offering `current.availablePackages` given monthly first → options `['lifetime','monthly']`, `priceString` from `product.priceString`)
- `purchase success marks ad-free` (`purchasePackage` resolves `{ customerInfo }` with `ad_free` → `'success'`, `adFree: true`)
- `purchase cancelled changes nothing` (reject `{ userCancelled: true, code: '1' }` → `'cancelled'`)
- `purchase pending is not success` (reject `{ code: '20' }` → `'pending'`, `adFree` unchanged)
- `purchase resolving without the entitlement is pending` (resolves with no `ad_free` → `'pending'`)
- `a second purchase while one is running is ignored` (two calls without awaiting → `purchasePackage` called once; the second returns `'error'`)
- `restore with no entitlement returns error and keeps adFree false`

- [ ] **Step 4: Run them to confirm they fail**

Run: `npx jest store/__tests__/monetization-store.test.ts`
Expected: FAIL, the module can't be found.

- [ ] **Step 5: Implement `store/monetization-store.ts`**

`configurePurchases` picks the key with `Platform.OS`. With an empty key it returns false and leaves `purchasesConfigured` false. Otherwise it calls `Purchases.configure({ apiKey })` once, registers `addCustomerInfoUpdateListener` (which applies `statusFromCustomerInfo`), and returns true. Every Purchases call is wrapped in try/catch. `loadOffer` and `purchase` return `'unavailable'` when not configured. The `purchasing` flag guards re-entry.

- [ ] **Step 6: Run all tests**

Run: `npm test`
Expected: all PASS (the existing 53 plus the new ones).

- [ ] **Step 7: Commit**

```bash
git add lib/monetization store/monetization-store.ts store/__tests__/monetization-store.test.ts
git commit -m "feat(ads): remember ad-free status on the phone and buy or restore it through RevenueCat"
```

---

### Task 3: Consent, ad SDK start-up, and boot order

**Files:**
- Create: `lib/ads/ads.ts`, `lib/monetization/boot.ts`
- Modify: `app/_layout.tsx` (call `bootMonetization()` once i18n is ready)
- Test: `lib/ads/__tests__/ads.test.ts`, `lib/monetization/__tests__/boot.test.ts`

**Interfaces:**
- Consumes: `useMonetizationStore` (Task 2).
- Produces:

```ts
// lib/ads/ads.ts
export interface AdsStartResult { canRequestAds: boolean; privacyOptionsRequired: boolean }
export function startAds(): Promise<AdsStartResult>;      // never rejects; returns canRequestAds false on any error; runs at most once (memoised promise)
export function openAdPrivacyChoices(): Promise<void>;     // AdsConsent.showPrivacyOptionsForm(), errors swallowed
export function bannerUnitId(): string;                    // TestIds.ADAPTIVE_BANNER in __DEV__, else MONETIZATION_CONFIG.admob[platform]

// lib/monetization/boot.ts
export function bootMonetization(): Promise<void>;         // waits for hydration, configures purchases, refreshes, starts ads unless ad-free; subscribes so ads start later if adFree flips to false
```

- [ ] **Step 1: Write the failing tests**

`ads.test.ts` mocks `react-native-google-mobile-ads`: default export `() => ({ initialize, setRequestConfiguration })`, plus `AdsConsent.gatherConsent`, `AdsConsentPrivacyOptionsRequirementStatus`, `MaxAdContentRating`, `TestIds`.
- `startAds gathers consent, sets PG and not child-directed, then initialises` (assert `setRequestConfiguration` called with `{ maxAdContentRating: 'PG', tagForChildDirectedTreatment: false, tagForUnderAgeOfConsent: false }` and `initialize` called after `gatherConsent`)
- `startAds does not initialise when consent says ads can't be requested` (`canRequestAds: false` → `initialize` not called, result `canRequestAds: false`)
- `startAds reports privacy options required` (`privacyOptionsRequirementStatus: 'REQUIRED'` → `true`)
- `startAds resolves canRequestAds false when gatherConsent throws`
- `startAds only runs once` (two calls → `gatherConsent` called once)

`boot.test.ts` mocks `../../ads/ads` and drives `useMonetizationStore` state directly:
- `ad-free users never start ads` (hydrated, `adFree: true`, `refresh` leaves it true → `startAds` not called)
- `ads start for everyone else and mark adsReady` (`startAds` resolves `canRequestAds: true` → `adsReady: true`)
- `ads start when ad-free ends mid-session` (boot with `adFree: true`, then `setState({ adFree: false })` → `startAds` called)

- [ ] **Step 2: Run them to confirm they fail**, then implement both files.

- [ ] **Step 3: Wire `bootMonetization()` into `app/_layout.tsx`**

Call it from the existing effect, after `setI18nReady(true)`. Don't await it in render, and never block the first screen on it.

- [ ] **Step 4: Run all checks**

Run: `npm test && npx tsc --noEmit --types react,node,jest`
Expected: all PASS, no type errors.

- [ ] **Step 5: Commit**

```bash
git add lib/ads lib/monetization app/_layout.tsx
git commit -m "feat(ads): ask for consent where the law needs it and start ads only for people who see them"
```

---

### Task 4: The banner and where it goes

**Files:**
- Create: `components/ads/AdBanner.tsx`, `lib/ads/visibility.ts`
- Modify: `app/index.tsx`, `app/stats/index.tsx`, `app/settings/index.tsx`, `app/queue/summary.tsx`
- Test: `lib/ads/__tests__/visibility.test.ts`

**Interfaces:**
- Consumes: `useMonetizationStore` fields `hydrated`, `adFree`, `adsReady` (Tasks 2–3); `bannerUnitId()` (Task 3).
- Produces: `shouldShowBanner(s: { hydrated: boolean; adFree: boolean; adsReady: boolean }): boolean`; `<AdBanner placement="anchored" | "inline" />`.

- [ ] **Step 1: Write the failing test**: `shouldShowBanner` is true only for `{ hydrated: true, adFree: false, adsReady: true }`. Assert false for the other seven combinations, written as a table.

- [ ] **Step 2: Run it to confirm it fails**, implement it, and run it again: PASS.

- [ ] **Step 3: Implement `AdBanner`**

Return `null` unless `shouldShowBanner` is true. Local state `'loading' | 'loaded' | 'failed'`: `'failed'` returns `null` (no empty box), and the wrapper stays collapsed (height 0, `overflow: 'hidden'`) until `onAdLoaded`. `anchored` uses `BannerAdSize.ANCHORED_ADAPTIVE_BANNER`, has a 1px top divider in `${COURT.line}14` and `paddingTop: 8`, and is centred. `inline` uses `BannerAdSize.INLINE_ADAPTIVE_BANNER` with `maxHeight={250}`, `marginVertical: 18`, and no divider. `unitId={bannerUnitId()}`.

- [ ] **Step 4: Place it**

- `app/index.tsx`, `app/stats/index.tsx`, `app/settings/index.tsx`: `<AdBanner placement="anchored" />` as the last child of the `SafeAreaView`, after the `ScrollView` (and before the Settings `Sheet`). The bottom safe-area edge stays below it.
- `app/queue/summary.tsx`: `<AdBanner placement="inline" />` between the paddle row and the "Everyone" heading.
- Confirm with grep that `AdBanner` appears in exactly these four files: `grep -rln "<AdBanner" app components | sort`.

- [ ] **Step 5: Run checks and commit**

Run: `npm test && npx tsc --noEmit --types react,node,jest && npm run lint -- --no-cache`
Expected: PASS, 0 errors.

```bash
git add components/ads lib/ads app/index.tsx app/stats/index.tsx app/settings/index.tsx app/queue/summary.tsx
git commit -m "feat(ads): a banner on home, stats, settings and the session summary, never courtside"
```

---

### Task 5: Remove Ads sheet, entry points, and strings

**Files:**
- Create: `components/ads/RemoveAdsSheet.tsx`
- Modify: `app/index.tsx` (Home row), `app/settings/index.tsx` (Ads group), `i18n/en.ts`, `i18n/es.ts`, `i18n/fr.ts`, `i18n/de.ts`
- Test: `i18n/__tests__/ads-strings.test.ts`

**Interfaces:**
- Consumes: `useMonetizationStore` (`offer`, `loadOffer`, `purchase`, `restore`, `purchasing`, `adFree`, `plan`, `managementUrl`, `privacyOptionsRequired`); `openAdPrivacyChoices()` (Task 3); `MONETIZATION_CONFIG.privacyPolicyUrl` / `termsOfUseUrl`; the existing `Sheet`, `CourtButton`, `ListGroup`, `ListRow`.
- Produces: `<RemoveAdsSheet visible onClose />`.

- [ ] **Step 1: Write the failing string test**: for each of `es`, `fr`, `de`, the set of keys under `ads` (flattened, so plural suffixes included) equals the set in `en`, and no value is empty.

- [ ] **Step 2: Run it to confirm it fails**, then add the `ads` section to all four languages. English copy:

```
ads.removeAds: 'Remove ads'
ads.title: 'Go ad-free'
ads.subtitle: 'Every feature stays free. This only removes the banners.'
ads.lifetime: 'Lifetime'
ads.lifetimeNote: 'Best value · pay once'
ads.monthly: 'Monthly'
ads.monthlyNote: 'Cancel anytime'
ads.perMonth: '{{price}}/month'
ads.restore: 'Restore purchases'
ads.legal: 'Monthly renews automatically until you cancel it in your App Store or Google Play settings.'
ads.terms: 'Terms of Use'
ads.privacy: 'Privacy Policy'
ads.unavailable: "Can't reach the store. Check your connection and try again."
ads.retry: 'Try again'
ads.thanks: "You're ad-free. Thanks for supporting Pickle & Score."
ads.pending: 'Your payment is pending. Ads will disappear once it goes through.'
ads.error: "That didn't go through. Nothing was charged."
ads.nothingToRestore: 'No ad-free purchase found for this account.'
ads.group: 'Ads'
ads.adFree: 'Ad-free'
ads.planLifetime: 'Lifetime'
ads.planMonthly: 'Monthly'
ads.manage: 'Manage subscription'
ads.privacyChoices: 'Ad privacy choices'
```

Run the test again: PASS.

- [ ] **Step 3: Build `RemoveAdsSheet`** following the spec 4.6 sketch.
  - On open, call `loadOffer()` and show an `ActivityIndicator` while loading.
  - Lifetime is a `line` `CourtButton` with `subtitle={t('ads.lifetimeNote')}`. Monthly is `deep`.
  - Outcomes:
    - `success`: show `ads.thanks`, a success haptic, close after 1.6 s
    - `cancelled`: nothing
    - `pending`: `ads.pending`
    - `unavailable`: the unavailable state with Retry
    - `error`: `ads.error`
  - Restore: `success` behaves like a purchase; `error` shows `ads.nothingToRestore`.
  - Buttons are disabled while `purchasing`.
  - The legal line and both links open with `Linking.openURL`. Hide the Privacy Policy link if its URL is empty.

- [ ] **Step 4: Entry points**
  - Home (`app/index.tsx`): a third `ListRow` in the existing `ListGroup`, `label={t('ads.removeAds')}`, `chevron`, which opens the sheet. Render it only when `!adFree`.
  - Settings (`app/settings/index.tsx`): a `ListGroup header={t('ads.group')}` between Sounds and App.
    - Not ad-free: rows `ads.removeAds` (opens the sheet) and `ads.restore` (calls `restore()`; on `'error'` shows `ads.nothingToRestore` in the existing `Dialog`).
    - Ad-free: row `ads.adFree` with value `ads.planLifetime` or `ads.planMonthly`. On monthly, add `ads.manage`, which opens `managementUrl ?? (Platform.OS === 'ios' ? 'https://apps.apple.com/account/subscriptions' : 'https://play.google.com/store/account/subscriptions')`.
    - Always, when `privacyOptionsRequired`: `ads.privacyChoices`, which calls `openAdPrivacyChoices()`.

- [ ] **Step 5: Run checks and commit**

Run: `npm test && npx tsc --noEmit --types react,node,jest && npm run lint -- --no-cache`
Expected: PASS, 0 errors.

```bash
git add components/ads app/index.tsx app/settings/index.tsx i18n
git commit -m "feat(ads): a quiet way to go ad-free, monthly or for life, in four languages"
```

---

### Task 6: Privacy, product docs, and the release checklist

**Files:**
- Modify: `app/settings/privacy.tsx`, `privacy-policy-page.jsx`, `PRODUCT.md`, `docs/superpowers/specs/2026-09-18-open-play-and-redesign-design.md`, `docs/RELEASE.md`, `CHANGELOG.md`

- [ ] **Step 1: Rewrite the privacy sections** in both privacy files, with the same wording in each. Update "Last updated" to 25 November 2026. Sections:
  - Data collection: the app itself still stores everything on the device.
  - Advertising: Google AdMob shows banners. It may collect device identifiers, IP-derived coarse location, ad interactions and diagnostics, under Google's policy (link `https://policies.google.com/technologies/ads`). EU/UK users are asked for consent and can change it under Settings → Ads. No Apple tracking prompt: iOS ads don't use the advertising identifier.
  - Purchases: handled by the App Store or Google Play. RevenueCat records an anonymous ID and purchase history so the ad-free status can be restored. The app never sees payment details.
  - Ad-free: with ad-free, the ad SDK never starts and makes no requests.
  - Network usage: only for ads and purchases. Everything else works offline.
  - Keep the audio-files, sharing and contact sections.

- [ ] **Step 2: `PRODUCT.md`**
  - Positioning: change the line "A paid, one-time purchase app…" to say the app is free, with banners on calm screens and a paid way to remove them (monthly or lifetime).
  - Pricing: free; remove ads at ₱49 a month or ₱249 lifetime (suggested).
  - Principle 3: "Free means complete: every feature is free; ads stay out of play; one quiet way to remove them."
  - Stack line: Expo SDK 55, React Native 0.83.

- [ ] **Step 3: Old spec.** Under goal 2 in the 2026-09-18 spec, add: "Superseded on 2026-11-25 by [2026-11-25-free-with-ads-design.md](2026-11-25-free-with-ads-design.md)."

- [ ] **Step 4: Rewrite `docs/RELEASE.md`** for this release. Keep sections 4–6, and carry over the still-true parts of sections 1–3 (icon alpha, dev-client strings, eas.json credentials). New steps:
  - **AdMob:** create the app for iOS and for Android and one adaptive banner unit each. Put the app IDs in `app.json` and the unit IDs in `lib/monetization/config.json`. Publish `app-ads.txt` on the developer website listed in both stores. Set the blocking controls' max content rating to PG. Leave mediation off.
  - **RevenueCat:** create a project, apps for iOS and Android, the entitlement `ad_free`, and the `default` offering with `$rc_lifetime` and `$rc_monthly`. Put the public SDK keys in the config file.
  - **App Store Connect:** non-consumable `ad_free_lifetime` and auto-renewable `ad_free_monthly` in the subscription group "Ad-free". Paid Apps agreement signed. In-App Purchase key uploaded to RevenueCat.
  - **Google Play Console:** one-time product `ad_free_lifetime` and subscription `ad_free_monthly` (monthly base plan). Service account credentials given to RevenueCat.
  - **Prices:** ₱49 a month and ₱249 lifetime (suggested), with equivalents in other regions.
  - **App price:** Free in both stores. Don't set ₱199.
  - **Privacy:** fill in Apple's App Privacy answers and Google's Data safety form for AdMob (Google publishes its own guide for each) and for RevenueCat (purchase history, an anonymous user ID). Tracking: No. Play's Ads declaration: Yes. Advertising ID: used for advertising. Target audience: 18+.
  - **Store description:** free; every feature included; small ads that stay out of play; remove them monthly or for life.
  - **`npm run release:check` must pass** before any store build.
  - **Sandbox tests on a device:** buy lifetime, buy monthly, cancel, restore on a reinstall, airplane mode after buying (no ads), and an EU consent check (debug geography).
  - **Test step 1:** replace the "53 tests" count with the new total, and replace the paywall grep with `grep -rn "isPro\|PaywallModal" app components store lib`.

- [ ] **Step 5: `CHANGELOG.md`:** add a `[1.2.0] - unreleased` entry covering Open Play, the redesign, the free-with-ads model and the remove-ads purchase.

- [ ] **Step 6: Verify and commit**

Run: `grep -n "no ads\|No ads\|one-time paid\|₱199" PRODUCT.md docs/RELEASE.md app/settings/privacy.tsx privacy-policy-page.jsx`
Expected: no line still describes the app as paid or ad-free by default.

```bash
git add app/settings/privacy.tsx privacy-policy-page.jsx PRODUCT.md docs CHANGELOG.md
git commit -m "docs: privacy, product and release checklist for the free-with-ads release"
```

---

### Task 7: Native builds and on-device verification

**Files:**
- Modify: only what the builds prove wrong. Each fix is its own commit.

- [ ] **Step 1: Regenerate native projects**

Run: `npx expo prebuild --clean`
Expected: it finishes. `ios/PickleScore/Info.plist` (or the generated app folder) contains `GADApplicationIdentifier` and `SKAdNetworkItems` with `cstr6suwn9.skadnetwork`. `android/app/src/main/AndroidManifest.xml` contains `com.google.android.gms.ads.APPLICATION_ID`.

- [ ] **Step 2: iOS build on an iOS 26.3 simulator**

Run: `npx expo run:ios --device "<iOS 26.3 simulator name>"`, booting it with `xcrun simctl` first.
Expected: it launches. Google's test banner ("Test Ad") shows at the bottom of Home, Stats and Settings, and inline on an Open Play summary. There's none on the singles and doubles scorers, the game-over sheet, check-in, the live session, Rules or Privacy. Take a screenshot of each with `xcrun simctl io booted screenshot`.

- [ ] **Step 3: Android build on the Pixel 7 Pro emulator**

Run: `npx expo run:android`
Expected: the same placements as on iOS. Take screenshots with `adb exec-out screencap -p`.

- [ ] **Step 4: Offline and no-key behaviour**

- With networking off (Android `adb shell svc wifi disable && adb shell svc data disable`), relaunch. Expected: no banner and no empty gap.
- Open Remove Ads (the RevenueCat keys are still empty). Expected: "Can't reach the store…" with Try again, and no crash.

- [ ] **Step 5: Ad-free path, simulated**

In a dev build, set `useMonetizationStore.setState({ adFree: true, plan: 'lifetime' })` (temporarily, from a dev-only effect that is not committed), then relaunch. Expected: no banners anywhere. Home has no "Remove ads" row. Settings shows "Ad-free · Lifetime". Revert the temporary change.

- [ ] **Step 6: Final checks**

Run: `npm test && npx tsc --noEmit --types react,node,jest && npm run lint -- --no-cache`
Expected: all PASS, 0 lint errors. `npm run release:check` still fails, listing only the account-side values the owner has to fill in.

- [ ] **Step 7: Commit any fixes, and record the QA** in `docs/RELEASE.md` §4: what was verified on which build, and what is still left for real hardware (real ad fill, sandbox purchases, EU consent form).
