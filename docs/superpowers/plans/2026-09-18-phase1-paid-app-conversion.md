# Phase 1: Paid-App Conversion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove every subscription, paywall, upgrade prompt and free-tier limit so the app works as a one-time paid download.

**Architecture:** This is purely a removal. Delete the RevenueCat store and paywall components, strip every `isPro` branch, lift the 10-game history cap to 500, and collapse the sound catalog to the 6 sounds that have audio files. No visual redesign happens in this phase; screens keep their current look minus the Pro elements.

**Tech Stack:** Expo SDK 55, React Native 0.83, TypeScript, Zustand, NativeWind, i18next.

**Spec:** `docs/superpowers/specs/2026-09-18-open-play-and-redesign-design.md` §3

## Global Constraints

- The app works after every task (typecheck and lint pass with no new errors).
- Baseline: `npx tsc --noEmit` reports only `TS2688: Cannot find type definition file for 'react 2'` (a stray duplicate folder in `node_modules/@types`, pre-existing, out of scope). `npm run lint` reports 0 errors and 5 warnings.
- Stored history cap: 500 games.
- Sounds kept: airhorn, cheer, whistle, meme1, meme2, meme3.
- There's no test runner yet (it arrives in Phase 2), so each task is verified by typecheck, lint, and a `grep` that proves the removed symbol is gone.

**Verification commands used throughout:**
- Typecheck: `npx tsc --noEmit 2>&1 | grep -v "react 2'" | grep -v "Entry point for implicit type library 'react 2'" | grep -v "The file is in the program because" | grep "error" || echo "TYPECHECK CLEAN"`
- Lint: `npm run lint 2>&1 | tail -3`, expecting `0 errors`

---

### Task 1: Lift the game-history cap

**Files:**
- Modify: `lib/storage/game-history.ts`
- Modify: `store/stats-store.ts`

**Interfaces:**
- Produces: `export const MAX_STORED_GAMES = 500` in `lib/storage/game-history.ts`. `getRecentGames(limit = MAX_STORED_GAMES)`.

- [ ] **Step 1:** In `lib/storage/game-history.ts`, replace `const MAX_FREE_GAMES = 10;` with `export const MAX_STORED_GAMES = 500;`. Replace the three uses: `getRecentGames(MAX_FREE_GAMES + 1)` becomes `getRecentGames(MAX_STORED_GAMES)`, `games.slice(0, MAX_FREE_GAMES)` becomes `games.slice(0, MAX_STORED_GAMES)`, and the default parameter `limit: number = MAX_FREE_GAMES` becomes `limit: number = MAX_STORED_GAMES`.
- [ ] **Step 2:** In `store/stats-store.ts`, import `MAX_STORED_GAMES` and `saveGame`-independent helpers. Change `loadHistory` to `getRecentGames(MAX_STORED_GAMES)`. Replace the body of `saveGameRecord`'s `try` block with:

```ts
      const existing = await getRecentGames(MAX_STORED_GAMES);
      const gamesToSave = [record, ...existing].slice(0, MAX_STORED_GAMES);
      await AsyncStorage.setItem(GAME_HISTORY_KEY, JSON.stringify(gamesToSave));
      await get().loadHistory();
```

  Export `GAME_HISTORY_KEY` from `game-history.ts`, and import it plus `AsyncStorage` at the top of `stats-store.ts` (replacing the inline `require`).
- [ ] **Step 3:** Run: `grep -rn "MAX_FREE_GAMES\|getRecentGames(10)\|slice(0, 10)" lib store`. Expected: no output.
- [ ] **Step 4:** Run the typecheck. Expected: `TYPECHECK CLEAN`.
- [ ] **Step 5:** Commit: `git commit -am "feat: store up to 500 games of history (remove free-tier cap)"`

---

### Task 2: One sound catalog, no locks

**Files:**
- Modify: `lib/audio/SoundManager.ts`
- Modify: `components/sounds/SoundButton.tsx`
- Modify: `components/sounds/SoundboardModal.tsx`

**Interfaces:**
- Produces: `export const SOUNDS: SoundItem[]` (6 items). `SoundItem` becomes `{ id: string; name: string; category: 'hype' | 'classic' | 'meme' }` with no `isPro`. `SoundManager.preloadAll(): Promise<void>` replaces `preloadAllFreeSounds` / `preloadAllProSounds`. `SoundboardModal` props become `{ visible: boolean; onClose: () => void }`. `SoundButton` loses `isLocked` / `onLockPress`.

- [ ] **Step 1:** In `SoundManager.ts`:
  - Delete `isPro` from `SoundItem`.
  - Rename `FREE_SOUNDS` to `SOUNDS` and drop each `isPro: false`.
  - Delete `PRO_SOUNDS` and `ALL_SOUNDS`.
  - Replace `preloadAllFreeSounds` and `preloadAllProSounds` with:

```ts
  async preloadAll(): Promise<void> {
    await this.preloadSounds(SOUNDS.map(s => s.id));
  }
```

- [ ] **Step 2:** Run `grep -rn "preloadAllFreeSounds\|preloadAllProSounds\|ALL_SOUNDS\|FREE_SOUNDS\|PRO_SOUNDS" app components lib store hooks`. Update every caller outside `SoundboardModal` to `SOUNDS` / `preloadAll()`. Only SoundboardModal should remain for the next step.
- [ ] **Step 3:** In `SoundButton.tsx`, delete the `isLocked` and `onLockPress` props, their defaults, the lock branch in the press handler, the `isLocked ?` color and icon ternaries (keep the unlocked value), the `isLocked && styles.labelLocked` entry, the `{isLocked && (...)}` overlay block, and the now-unused `labelLocked` style and any lock-overlay styles.
- [ ] **Step 4:** In `SoundboardModal.tsx`:
  - Import `SOUNDS` instead of `FREE_SOUNDS, PRO_SOUNDS`.
  - Remove the `isPro` and `onUpgradePress` props and the `handleLockPress` callback.
  - The preload effect becomes `if (visible) SoundManager.preloadAll();` with deps `[visible]`.
  - `filteredSounds` uses `SOUNDS` with deps `[activeCategory]`.
  - Remove the `isLocked` / `onLockPress` attributes from all four `SoundButton` usages.
  - Delete the `{/* Pro Upgrade Banner */}` block and its `proBanner*` styles.
  - Remove the `Ionicons` import if nothing else uses it.
- [ ] **Step 5:** Typecheck. Expected: errors only in `app/(game)/singles.tsx` and `doubles.tsx` about `isPro` / `onUpgradePress` on `SoundboardModal`. These are fixed in Task 3, so don't commit yet.

---

### Task 3: Strip Pro UI from screens

**Files:**
- Modify: `app/(game)/singles.tsx`, `app/(game)/doubles.tsx`
- Modify: `components/game/WinModal.tsx`, `components/game/ShareCard.tsx`
- Modify: `app/index.tsx`, `app/settings/index.tsx`, `app/stats/index.tsx`

**Interfaces:**
- Consumes: the `SoundboardModal` props from Task 2.
- Produces: `ShareCard` props become `{ gameState: GameState; winner: 1 | 2 }`.

- [ ] **Step 1: Game screens.** In both `singles.tsx` and `doubles.tsx`, remove the `useSubscriptionStore` import, the `isPro` const, the `handleUpgradePress` function, and the `isPro={isPro}` / `onUpgradePress={handleUpgradePress}` props on `SoundboardModal`.
- [ ] **Step 2: WinModal and ShareCard.** In `WinModal.tsx`, remove the `useSubscriptionStore` import, the `isPro` const, and `isPro={isPro}` on `ShareCard`. In `ShareCard.tsx`, remove `isPro?: boolean` from the props, drop it from the destructuring, and remove any `isPro`-conditional rendering (keep the non-Pro branch's content only where it is the watermark-free default; if a branch showed extra Pro-only styling, keep that styling for everyone). Grep `isPro` in the file afterwards; expect none.
- [ ] **Step 3: Home.**
  - In `app/index.tsx`, remove the `useSubscriptionStore` and `PaywallModal` imports, the `isPro` const, and the `showPaywall` state.
  - Delete the `{/* Pro Badge - if not Pro */}` block, the `{!isPro && (<View ...>PRO</View>)}` badge on the Soundboard feature row, and the `<PaywallModal .../>` element.
  - Remove `useState` from the React import if it's unused.
- [ ] **Step 4: Settings.**
  - In `app/settings/index.tsx`, remove the `useSubscriptionStore` and `PaywallModal` imports, `isPro`, and `showPaywall`.
  - Delete the `{/* Pro Upgrade Section */}` block, the `{/* Current Plan (if Pro) */}` block, and the `<PaywallModal .../>` element.
  - Keep `useState` (still used by `switchKey`).
- [ ] **Step 5: Stats.**
  - In `app/stats/index.tsx`, remove the `useSubscriptionStore` import and `isPro`.
  - Delete the `{!isPro && (<Pressable ...>Upgrade</Pressable>)}` link in the section header.
  - Change `recentGames.slice(0, isPro ? undefined : 5).map(` to `recentGames.map(`.
  - Delete the `{!isPro && recentGames.length > 5 && (...)}` banner.
  - Delete the `upgradeLink`, `upgradeBanner`, `upgradeBannerContent` and `upgradeBannerText` styles.
- [ ] **Step 6:** Run: `grep -rn "isPro\|onUpgradePress\|PaywallModal\|showPaywall" app components`. Expected: no output.
- [ ] **Step 7:** Typecheck (`TYPECHECK CLEAN`) and lint (`0 errors`).
- [ ] **Step 8:** Commit (Tasks 2 and 3 together, since Task 2 alone doesn't typecheck): `git commit -am "feat: unlock all sounds and remove Pro UI from every screen"`

---

### Task 4: Delete the subscription system

**Files:**
- Delete: `store/subscription-store.ts`, `components/paywall/PaywallModal.tsx`, `components/paywall/PricingCard.tsx`
- Modify: `app/_layout.tsx`, `i18n/en.ts`, `package.json`, `package-lock.json`

- [ ] **Step 1:** In `app/_layout.tsx`, remove the `useSubscriptionStore` import, the `initializeSubscriptions` const, and the `useEffect` that calls it.
- [ ] **Step 2:** `git rm store/subscription-store.ts components/paywall/PaywallModal.tsx components/paywall/PricingCard.tsx`
- [ ] **Step 3:** In `i18n/en.ts`, delete the whole `paywall: { ... }` block and the `upgrade` key under `soundboard`. Run `grep -n "paywall\|upgrade" i18n/*.ts`; expect no output.
- [ ] **Step 4:** `npm uninstall react-native-purchases`
- [ ] **Step 5:** Run: `grep -rn "subscription-store\|react-native-purchases\|RevenueCat\|REVENUECAT\|components/paywall" app components store lib hooks app.json package.json eas.json`. Expected: no output. If `app.json` or `eas.json` lists a RevenueCat plugin or the env var, remove that entry.
- [ ] **Step 6:** Typecheck (`TYPECHECK CLEAN`) and lint (`0 errors`).
- [ ] **Step 7:** Commit: `git add -A app components store i18n package.json package-lock.json app.json eas.json && git commit -m "feat: remove RevenueCat subscriptions and paywall (app is now paid upfront)"`

---

### Task 5: Verify on device

- [ ] **Step 1:** Rebuild the native dev client (a native module was removed): `npx expo run:ios` (and `npx expo run:android` when an emulator is available).
- [ ] **Step 2:** Manual checks:
  - Home shows no Upgrade banner or PRO badge.
  - Settings has no Pro section.
  - The soundboard shows exactly 6 sounds, none locked, and each plays.
  - Stats lists more than 5 games when more exist.
  - Finishing a game still saves it to Stats.
  - The share card still renders in the win modal.
- [ ] **Step 3:** Report results to the user before Phase 2.
