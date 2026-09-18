# Open Play queue, paid-app conversion, and Court & Paddle redesign

Date: 2026-09-18
Status: approved design, pending spec review
Related: [PRODUCT.md](../../../PRODUCT.md), direction contract in `.impeccable/surfaces/app-queue-session-tsx.md`, approved mockups in `.superpowers/brainstorm/36629-1789743181/content/all-screens.html` and `.impeccable/mocks/decision/pick.png`

## 1. Goals

1. **Open Play queue.** An organizer runs a pickleball open-play session on one phone. The app calls every match so that everyone present plays the same number of games, whether they win or lose. Partners rotate unless deliberately locked.
2. **Paid app.** The app becomes a one-time paid download (about ₱199 in the Philippines). Everything is included, with no subscriptions, paywall, upgrade prompts, or limits.
3. **Premium redesign.** Every screen moves to the Court & Paddle visual world: courts drawn as real top-down courts, players as paddles, and the queue as a paddle rack.

Non-goals: accounts, cloud sync, sharing a live queue across phones, skill-level matching, singles open play, tablet layouts.

## 2. Build order

The work is one release built in six phases. Each phase gets its own implementation plan and must leave the app working.

| Phase | What | Depends on |
|---|---|---|
| 1 | Remove paywall and subscriptions | none |
| 2 | Queue engine and session store, with automated tests | none |
| 3 | Design tokens and shared components | none |
| 4 | Open Play screens | 2, 3 |
| 5 | Redesign existing screens | 3 |
| 6 | Finish: review against the direction contract, DESIGN.md, release notes | 4, 5 |

## 3. Phase 1: Paid-app conversion

Remove:
- `store/subscription-store.ts`, `components/paywall/PaywallModal.tsx`, `components/paywall/PricingCard.tsx`
- The `react-native-purchases` dependency and the subscription initialization in `app/_layout.tsx`
- Every `isPro` / `useSubscriptionStore` branch in `app/index.tsx`, `app/stats/index.tsx`, `app/settings/index.tsx`, `app/(game)/singles.tsx`, `app/(game)/doubles.tsx`, `components/sounds/SoundboardModal.tsx`, `components/game/WinModal.tsx`, `components/game/ShareCard.tsx`
- The `paywall` and `soundboard.upgrade` strings in all four languages

Change:
- `lib/storage/game-history.ts`: replace the 10-game cap (`MAX_FREE_GAMES`) with a storage cap of 500 games. Stats show all stored games.
- `lib/audio/SoundManager.ts`: merge `FREE_SOUNDS` and `PRO_SOUNDS` into one `SOUNDS` list that holds only the 6 sounds with audio files (airhorn, cheer, whistle, meme1, meme2, meme3). The 11 entries without files are removed. Adding more sounds later is a separate task: royalty-free, licensed for commercial use.

Removing `react-native-purchases` removes a native module, so a new development build is required (`expo run:ios` / `expo run:android` or EAS).

Release considerations (outside the code, but must happen before the paid version ships):
- If any users hold active subscriptions, stop selling the subscription products in App Store Connect and Google Play Console and decide how to treat existing subscribers. This must not be silent: they would otherwise keep being billed for features that are now free.
- Set the app's price tier in both stores.
- Remove or archive the RevenueCat project.

## 4. Phase 2: Queue engine and session store

### 4.1 Data model (`lib/types/queue.ts`)

```ts
type PaddleColor = 'ochre' | 'coral' | 'paper' | 'sky' | 'carbon' | 'lilac' | 'sand' | 'teal';

interface SavedPlayer { id: string; name: string; color: PaddleColor; }
interface SavedGroup  { id: string; name: string; playerIds: string[]; }

type PlayerStatus = 'active' | 'sitting_out' | 'left';

interface SessionPlayer {
  id: string;            // same id as the SavedPlayer
  name: string;
  color: PaddleColor;    // session color; see 4.6
  status: PlayerStatus;
  gamesPlayed: number;   // real games finished; shown to users
  queueCount: number;    // priority count; see 4.3
  waitingSince: number;  // ms timestamp of last match end, arrival, or return
  arrivedAt: number;
  lockedWith?: string;   // partner id when in a fixed pair (symmetric)
}

interface Match {
  id: string;
  courtNumber: number;
  team1: [string, string];
  team2: [string, string];
  calledAt: number;
  endedAt?: number;
  score?: [number, number];   // only when scored in the app
}

interface Session {
  id: string;
  startedAt: number;
  endedAt?: number;
  courtCount: number;                 // 1..6
  players: SessionPlayer[];
  matches: Match[];                   // called and finished, in call order
  courts: (string | null)[];          // match id on each court, or null
  lastAction?: SessionAction;         // for single-step undo, see 4.5
}
```

### 4.2 Engine (`lib/queue/engine.ts`)

Pure functions with no React or storage, so they can be unit tested:

- `pickNextMatch(session, now): { team1, team2 } | null`
- `callMatch(session, courtNumber, now): Session`, which assigns `pickNextMatch` to the court
- `finishMatch(session, matchId, now, score?): Session`
- `addPlayer(session, player, now)`, `setSittingOut(session, id, now)`, `returnPlayer(session, id, now)`, `removePlayer(session, id, now)`
- `lockPair(session, a, b)`, `unlockPair(session, a)`
- `fillIdleCourts(session, now): Session`, which calls matches on every free court in court order
- `explainQueuePosition(session, playerId)`, which returns the data for the "Why?" sheet
- `pairingHistory(session)`, which returns partner and opponent counts derived from `matches`

### 4.3 Fairness rules

- **Counting.** `finishMatch` adds 1 to `gamesPlayed` and `queueCount` for all four players and sets their `waitingSince` to `now`. Calling a match changes no counts.
- **Late arrival.** `addPlayer` during a session sets `queueCount = max(existing queueCount, minimum queueCount among other active players)`, with a minimum of 0. `gamesPlayed` is not changed. `waitingSince = now`.
- **Return from sitting out.** The same rule as a late arrival.
- **Sitting out and leaving.** Players marked `sitting_out` or `left` are never picked. Their counts are kept.
- **On court.** A player in an unfinished match cannot sit out, be removed, or be locked/unlocked. The controls are disabled with the reason shown.

### 4.4 Picking a match

1. **Units.** Each available player (`active` and not on a court) is a unit. A locked pair is one 2-player unit only when both partners are available. Otherwise each is a single.
2. **Order.** Sort players by `(queueCount, waitingSince, id)` ascending. That index is each player's rank.
3. **Shortlist.** Take units in order until at least 8 players are included, or everyone if fewer.
4. **Candidates.** Every combination of shortlist units that totals exactly 4 players, split into two teams in every valid way. A locked pair is always on one team, and two pairs play each other.
5. **Fairness first.** Keep only the candidates with the smallest `Σ queueCount`. This is a strict filter, not a weight, so no amount of partner history can outrank fairness.
6. **Cost.** For each remaining candidate, add up:
   - `30 × (Σ rank − 6)`: prefer whoever has waited longest.
   - `100 ×` times each team's two players have partnered before, `+ 50` if they partnered in either player's most recent match.
   - `15 ×` times each cross-team pair has opposed before.
7. **Choice.** Pick the lowest cost. Ties go to the candidate whose sorted player ranks come first. The result is deterministic.
8. **Too few players.** If fewer than 4 players are available, return `null`. The court shows "Waiting for players".

Required properties, each covered by tests:
- **Lowest counts first.** No available player is left out while an available player with a higher `queueCount` is picked, except to keep a locked pair together. Tested by simulation with 4–24 players, 1–6 courts and random finish order.
- **Equal games when matches take equal time.** When every match lasts the same time, `max(gamesPlayed) − min(gamesPlayed) ≤ 1` holds after every round of calls, among players present since the start. Uneven match lengths can briefly widen the gap: for example, with 8 players on 2 courts, the first four to finish may be the only ones free. The first property still holds in that case.
- **Late arrivals.** A late arrival is picked no later than the match after the lowest-count players who were already waiting.
- **Locked pairs.** Locked partners are always on the same team, and a locked pair never splits while both are available.
- **Deterministic.** Given the same session, the result is the same.
- **Partner rotation.** Over 20 simulated matches with 8 players on 1 court, the number of repeated partnerships is lower than a baseline that picks the same players but ignores pairing history.

### 4.5 Session flow and undo

- **Start.** The session is created from the checked-in players, and `fillIdleCourts` runs.
- **Match done.** `finishMatch`, then `callMatch` on the same court.
- **After changes.** Adding a player, a player returning, or changing the number of courts runs `fillIdleCourts`.
- **Undo.** Available after the most recent action only (Match done, add, remove, sit out, return, lock). It restores the session exactly as it was before that action, including cancelling a match that was auto-called. One level of undo is enough for courtside mistakes.
- **End session.** Sets `endedAt`, keeps the session in history (`openPlayHistory`, newest first, capped at 50), and shows the summary.

### 4.6 Paddle colors

- New saved players get the next color in order (ochre, coral, paper, sky, carbon, lilac, sand, teal), cycling.
- At check-in, if a player's saved color is already taken in the session and an unused color exists, the session uses the next unused color. Their saved color is unchanged.
- With more than 8 players, colors repeat. Names are always shown, so color is only a finding aid.

### 4.7 Store (`store/session-store.ts`)

- A Zustand store with `persist` middleware on AsyncStorage (`createJSONStorage`). It holds `savedPlayers`, `savedGroups`, `activeSession`, `openPlayHistory` and Open Play defaults (`defaultCourtCount`).
- It is written after every action, so a session survives the app being killed or the phone locking.
- Actions are thin wrappers around the engine functions. All the logic lives in the engine.

### 4.8 Tests

- Add `jest-expo` and a `test` script.
- Engine unit tests and simulation tests for 4.3–4.5, plus a store test for persistence round-trip (mocked AsyncStorage).
- No UI snapshot tests.

## 5. Phase 3: Design system

### 5.1 Tokens (Tailwind theme, plus `lib/theme/tokens.ts` for non-NativeWind use)

| Token | Value | Use |
|---|---|---|
| `court-outer` | `#2d5a48` | screen ground |
| `court-outer-deep` | `#1f4134` | rack, toolbars |
| `court-surface` | `#23473a` | sheets and dialogs |
| `court-inner` | `#2c5c93` | court surface |
| `court-kitchen` | `#3a6aa3` | non-volley zone |
| `court-line` | `#f4f6f2` | lines, primary button fill, selected states |
| `ink` | `#f4f6f2` | primary text |
| `ink-muted` | `#b9cfc5` | secondary text |
| `deep` | `#10231c` | secondary button fill |
| `danger` | `#ffb4a6` | End, Remove |
| `ball` | `#e9e24a` | serving ball only |
| paddle colors | ochre `#e3a33b`, coral `#e0634a`, paper `#f2efe8`, sky `#8fc3e6`, carbon `#2f3130`, lilac `#b9a6e0`, sand `#d9c39a`, teal `#4fb3a5` | player identity only |

- Every paddle color has a matching dark text color with at least 4.5:1 contrast. Secondary text on the green ground meets 4.5:1.
- The ground carries a faint grit texture (a subtle dot pattern), only on the full-screen ground.
- **One appearance.** The court world is the same whether the phone is in light or dark mode, and the existing Dark Mode setting is removed. The status bar is light.
- **Type.** The system font (SF Pro / Roboto) with platform text styles, respecting Dynamic Type and font scale. Scores use tabular numerals. No custom display font.

### 5.2 Shared components (`components/court/`, `components/ui/`)

- `CourtDiagram`: a top-down court with kitchens, service lines and net, and four optional player slots with paddle-color dots. Options: serving player (ball marker, pill highlight), clock on the net, court-number pill, a dashed serve diagonal, a size variant, and tap-to-fill slots in setup mode. It has one accessibility label describing the court.
- `Paddle`: face, grip with games count, and name. Sizes `lg` (rack), `md` (check-in), `head` (small queue head, summary). States: normal, outlined (next up), ghost (not checked in), taped (locked pair).
- `PaddleRack`: the next four as `lg` paddles under a NEXT UP tab, and everyone else waiting as `head` paddles in queue order. The rack wraps and doesn't scroll sideways.
- `ui/Button` with variants `line` (primary), `deep` (secondary), `outline` and `danger-text`. Heights are 48–52pt, with haptic feedback on press.
- `ui/ListGroup` and `ListRow` for grouped rows with value and chevron, `ui/Segmented`, `ui/Toggle` (line track, green knob when on), `ui/Stepper`, `ui/Sheet` (bottom sheet), `ui/Dialog` (in-world alert), `ui/Toolbar` (scorer bottom bar).
- Icons are Ionicons (already installed), in one weight. No emoji used as icons.

### 5.3 Motion

- **Signature.** On Match done, the four outlined paddles slide from the rack onto the court's player slots (Reanimated layout transitions on one screen), and the rack settles.
- **Everywhere else.** Standard platform push, sheet and fade.
- **Reduce Motion.** Every animation becomes a crossfade.

## 6. Phase 4: Open Play screens

Routes: `app/queue/index.tsx` (check-in), `app/queue/session.tsx` (live), `app/queue/summary.tsx` (end), with the player sheet opened from the live screen.

1. **Check-in ("Who's here?")**
   - Saved players shown as `md` paddles: filled when checked in, ghost when not. Tap to toggle.
   - "Add a new name" creates a saved player.
   - Saved groups show as chips; tapping one checks in all its players.
   - Rows for Courts (stepper, 1–6, defaulting to `defaultCourtCount`), Fixed pairs, and Late arrivals (shows the rule; the rule itself is not configurable in this release).
   - The Start button shows the player count and is disabled below 4 players.
2. **Live session**
   - Large title and a live meta line (players, courts, games).
   - One `CourtDiagram` per court, each with Match done (primary) and Score.
   - An empty court shows "Waiting for players".
   - Below the courts, the `PaddleRack` and an Add player dock.
   - The navigation bar has End (with confirmation) and Undo (enabled when possible).
   - If an active session exists, the Home Open Play card resumes it.
3. **Player sheet (tap any paddle or court name)**
   - Shows games played, arrival time, and whether the player was queued at the group level.
   - "Why next" rows come from `explainQueuePosition`.
   - Actions: Sit out / Return, Lock a partner / Unlock, Remove from session.
4. **Summary**
   - A fairness sentence based on the actual numbers ("Everyone here from the start played 6 or 7 games"), with late arrivals explained individually.
   - All players as `head` paddles with their counts.
   - Rows: most frequent partners, and "Save as group" (creates a `SavedGroup`).
   - Share summary (image, same pipeline as the share card) and Done.
5. **Scoring link**
   - Score opens `/(game)/doubles?sessionMatchId=<id>`. The game starts with both teams prefilled and the setup step is skipped.
   - The Game over screen's primary button is "Back to Open Play". It calls `finishMatch` with the score and returns to the live screen.
   - Leaving the scorer without finishing changes nothing in the session.

## 7. Phase 5: Redesign existing screens

Every screen keeps its current behavior unless noted.

- **Home:** A large title with the settings icon. The Open Play hero is drawn as a court (it resumes if a session is active). Singles and Doubles tiles have small court icons. Rows for Match history and Saved players. The Pro banner is removed.
- **Game setup** (replaces `GameSetup`): a Sideout/Rally segmented control with a description, a `CourtDiagram` in setup mode (tap a slot to name or pick a player), a saved-player chip row, a "Game to" row, and a Start game dock. New names become saved players.
- **Doubles and singles scorers:**
  - The call is shown large ("7–4–2" in doubles sideout, "5–3" in singles and rally) with a caption naming the server.
  - `CourtDiagram` shows the players in position, with the server's ball and serve diagonal.
  - Two 96pt buttons: Point (for the serving team; in rally mode, one button per team) and Side out / 2nd serve.
  - `Toolbar` with Sounds, Undo, Settings and End.
  - All existing scoring rules are unchanged.
- **Switch sides:** an in-world `Dialog` with a court diagram showing the change of ends. "Switched" / "Not this game" map to the existing `markSidesChanged` choices.
- **Game over** (replaces `WinModal`): a full screen with the winner, the final score, duration, and player chips. Buttons: Share, Play again, and "Back to Open Play" when launched from a session.
- **Share card** (restyles `ShareCard`): a portrait court seen from above, with the score on the net, the date and mode, the teams and duration, and the app name. Text sits on court-colored plates so lines never cross it. Save image and Share.
- **Soundboard:** a sheet with an All/Hype/Classic/Meme/Mine segmented control, sounds as paddle-face tiles, and per-team point sound rows (existing `team1Sound` / `team2Sound` settings, which can point to built-in or custom sounds).
- **Custom sounds ("Mine"):**
  - **Adding.** An "Add sound" tile opens the system file picker (`expo-document-picker`, audio types). The file is copied into the app's own document storage (`expo-file-system`), so it keeps working if the original is moved or deleted. The user names it (default: the file name without extension, max 20 characters).
  - **Limits:** at most 5 seconds long, at most 2 MB, formats mp3 / m4a / aac / wav, and at most 24 custom sounds. Duration is read by loading the file with `expo-audio` before it's saved. A file that breaks a limit is rejected with a message naming the limit ("That clip is 8 seconds. Sounds can be up to 5 seconds."). Nothing is trimmed automatically.
  - **Managing.** Long-press a custom tile to rename or delete it. Deleting a sound that's assigned to a team resets that team's sound to none.
  - **Storage.** Metadata (`id`, `name`, `fileUri`, `durationMs`) is kept in the persisted settings. Custom sounds stay on the device, are never uploaded, and aren't included in share images.
  - **Playback** uses the same `SoundManager` path as built-in sounds. A missing or unreadable file shows the tile as unavailable instead of crashing.
- **Stats:**
  - A sentence summary ("You've won 12 of your last 20", with the current streak).
  - A strip of the last 20 results (filled = win).
  - Recent games list with W/L marker, score, opponents and date.
  - An Open Play sessions list from `openPlayHistory`.
- **Settings:** grouped into Scoring (scoring type, winning score segmented 11/15/21, win by 2, switch sides at, swap scores), Open Play (default courts, late arrivals rule shown), and App (language, rules, privacy policy). The Dark Mode and Pro rows are removed.
- **Rules:** a new readable page explaining how the score is called, with an illustrated call. The **privacy policy** is restyled as a calm text page.
- **Brand assets:** the splash and adaptive icon background change from `#22c55e` to `court-outer`. A new app icon is out of scope for this spec.

The app name stays as it is today (`Pickle & Score` in `app.json`, "Pickleball Scorer" as the home title). Unifying the two is a separate decision.

## 8. Internationalization

All new copy goes into `i18n/en.ts`, `es.ts`, `fr.ts` and `de.ts`. Summary and "why" sentences are built from i18n templates with counts (pluralization via i18next), never by joining strings in code.

## 9. Accessibility

- Touch targets are at least 44pt (iOS) and 48dp (Android).
- Dynamic Type / font scale are supported. The court and rack truncate names with an ellipsis and never overlap.
- Screen-reader labels:
  - Each court is read as a sentence, for example "Court 1, Maria and Carlo versus Bea and Jun, 8 minutes".
  - Each paddle reads its name, games played, and next-up or locked status.
- Reduce Motion is honored everywhere.
- Contrast meets the thresholds in 5.1, and must be checked in direct sunlight on a real device before release.

## 10. Error and edge cases

- Fewer than 4 available players: the court shows "Waiting for players" and nothing is picked.
- Reducing the court count while those courts are in use: the courts are removed only after their matches finish. The stepper shows "Court 3 closes after this match".
- Duplicate names at check-in: allowed. Players are identified by id, and the sheet shows the color to tell them apart.
- A corrupt or unreadable persisted state: the store resets to empty and a one-line notice appears. The app must not crash.
- The app is killed during a scored session game: the session is intact, and the scored game is lost (the scorer doesn't persist today; unchanged).

## 11. Verification

- `npm test` passes (engine and store).
- `npm run lint` and `npx tsc --noEmit` are clean.
- Manual run on the iOS Simulator and an Android emulator:
  - A full session with 9 players and 2 courts, including a late arrival, a sit-out and return, a locked pair, one scored match, undo, and ending with the summary.
  - Screenshots of every screen are captured for the finish review.
- The Impeccable finish review against the direction contract, then DESIGN.md recorded from the built app.
