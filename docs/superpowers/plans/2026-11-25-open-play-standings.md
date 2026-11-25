# Open Play Standings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add standings (W-L and +/-), a quick score on Match done, live standings, best duos, and a shareable standings image to Open Play, in time for v1.2.0.

**Architecture:** Results are calculated on demand from `Match.score`, which the session already stores. Two pure modules do that work (`lib/queue/standings.ts`, `lib/queue/duos.ts`), plus a pure helper for the quick-score maths. Screens only render what those return. The queue engine's picking logic is not touched.

**Tech Stack:** Expo SDK 55, React Native 0.83, TypeScript strict, Zustand (persisted), i18next (en/es/fr/de), Jest (`jest-expo`). New: `react-native-view-shot`, `expo-sharing`.

**Spec:** `docs/superpowers/specs/2026-11-25-open-play-standings-design.md`

## Global Constraints

- Work on `feature/open-play-standings`, branched from `release/v1.2.0` and merged back into it. The owner wants this in v1.2.0, which replaces the spec's v1.3.0 note.
- Results never feed `pickNextMatch` or the fairness card. Existing queue tests must pass unchanged.
- `score[0]` belongs to `team1` and `score[1]` to `team2`.
- +/- reads `+12`, `−3` (U+2212) or `0`, in tabular numerals.
- Standings order: most wins → fewest losses → highest +/- → most points scored → name (`localeCompare`). Ranks are shared on a full tie (1, 2, 2, 4).
- Best duos: at least **3** scored games together; top **5**; ordered by win rate → wins → +/- → games together.
- Share image: 4:5, at most **16** rows, then "+N more"; captured at 1080 × 1350.
- No banner ad in any new sheet or in the image. The summary's inline banner doesn't move.
- Every new string goes in a new top-level `standings` namespace in all four of `i18n/en.ts`, `es.ts`, `fr.ts`, `de.ts`. Plurals use i18next's `_one` / `_other`.
- Styling: inline styles with `COURT` / `PADDLE_FACE` tokens from `lib/theme/tokens.ts`, matching the screens around them. Use the existing `Sheet`, `CourtButton`, `Toggle`, `Stepper`, `ListGroup` / `ListRow`.

## Review Focus

- A phone that already has Open Play data saved has no `askForScores` in storage. After the update it must read as **on**, not off and not undefined. Test: Task 3, step 1.
- Undo straight after a scored Match done must put the match back on court with no score, so the standings drop that game. Test: Task 3, step 1.
- Open the score sheet for court 1, close it, then open it for court 2: nothing chosen for court 1 may carry over. Fixed by keying the sheet on the match ID (Task 3, step 6), and checked by hand in Task 7.
- Capture fails, or the phone has no share target: share as text instead. Never crash and never do nothing. Test: Task 6, step 1.
- A group of 20 or more, with long names: table rows stay on one line, and the share image shows 16 rows then "+4 more". Test: `shareRows` in Task 1, plus the hand check in Task 7.

---

### Task 1: Standings calculation

**Files:**
- Create: `lib/queue/standings.ts`
- Test: `lib/queue/__tests__/standings.test.ts`

**Interfaces:**
- Consumes: `Session`, `Match`, `PaddleColor` from `lib/types/queue.ts`. Test helpers `player()` and `session()` from `lib/queue/__tests__/helpers.ts`.
- Produces:
  ```ts
  export interface StandingRow {
    playerId: string; name: string; color: PaddleColor;
    rank: number | null;          // null = no scored games
    wins: number; losses: number;
    pointsFor: number; pointsAgainst: number; plusMinus: number;
    scoredGames: number; gamesPlayed: number;
  }
  export interface Standings { rows: StandingRow[]; scoredGames: number; finishedGames: number }
  export type ScoredMatch = Match & { score: [number, number]; endedAt: number };
  export function scoredMatches(session: Session): ScoredMatch[];
  export function sessionStandings(session: Session): Standings;
  export function standingsLeaders(standings: Standings): StandingRow[];   // every rank-1 row
  export function formatPlusMinus(value: number): string;
  export function shareRows(standings: Standings, max?: number): { rows: StandingRow[]; more: number }; // ranked rows only, max defaults to 16
  export function standingsText(standings: Standings, heading: string, footer: string): string;
  ```

- [ ] **Step 1: Create the branch**

Run: `git checkout -b feature/open-play-standings release/v1.2.0`
Expected: `Switched to a new branch 'feature/open-play-standings'`

- [ ] **Step 2: Write the failing tests** in `standings.test.ts`. Build matches as literal `Match` objects (`{ id, courtNumber: 1, team1: ['a','b'], team2: ['c','d'], calledAt: 0, endedAt: 10, score: [11, 7] }`). Use players `a`–`h` from `player()` with `gamesPlayed` set.
  - `credits both partners with the team's result and points`: a → `wins 1, losses 0, pointsFor 11, pointsAgainst 7, plusMinus 4, scoredGames 1`; c → `losses 1, plusMinus -4`.
  - `reads score[0] as team1 even when team2 won`: score `[5, 11]` → c and d have the win.
  - `ignores matches on court and matches finished without a score`: one scored, one finished without a score, one with no `endedAt` → `scoredGames 1, finishedGames 2`. `gamesPlayed` comes from the player record.
  - `orders by wins, then fewer losses, then +/-, then points scored, then name`: four players set up to differ on each key in turn. Assert the `playerId` order.
  - `a late arrival at 1–0 ranks below a player at 6–1`.
  - `shares a rank on a full tie`: ranks `[1, 2, 2, 4]`.
  - `lists players without scored games last with rank null`.
  - `keeps the results of a player who left`: `status: 'left'` still has their wins.
  - `counts an equal score toward games but as neither win nor loss`: `[9, 9]` → `wins 0, losses 0, scoredGames 1, plusMinus 0`.
  - `standingsLeaders returns every rank-1 row`.
  - `formatPlusMinus`: `12 → '+12'`, `-3 → '−3'`, `0 → '0'`.
  - `shareRows caps at 16 ranked rows and counts the rest`: 20 ranked plus 2 unranked → `rows.length 16, more 4`.
  - `standingsText`: heading line, then one `"1. A 2–0 +8"` line per ranked row (en dash `–`), then the footer line.

- [ ] **Step 3: Run the tests to make sure they fail**

Run: `npx jest lib/queue/__tests__/standings.test.ts`
Expected: FAIL, `Cannot find module '../standings'`

- [ ] **Step 4: Implement `lib/queue/standings.ts`.** A tally pass over `scoredMatches`, then a sort. Rank is `index + 1` unless the row ties the previous one on (wins, losses, plusMinus, pointsFor), in which case it takes the previous rank. Rows with `scoredGames === 0` get `rank: null` and come after the rest, ordered by name. Skip match player IDs missing from `session.players`.

- [ ] **Step 5: Run the tests to make sure they pass**

Run: `npx jest lib/queue/__tests__/standings.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add lib/queue/standings.ts lib/queue/__tests__/standings.test.ts
git commit -m "feat(open-play): calculate standings from saved match scores"
```

### Task 2: Pair records and best duos

**Files:**
- Create: `lib/queue/duos.ts`
- Modify: `lib/queue/engine.ts:15` (export the pair key)
- Test: `lib/queue/__tests__/duos.test.ts`

**Interfaces:**
- Consumes: `scoredMatches` (Task 1). `SavedPlayer` and `Session`.
- Produces:
  ```ts
  // engine.ts
  export function pairKey(a: string, b: string): string;   // the existing `key`, exported; internal uses unchanged
  // duos.ts
  export const DUO_MIN_GAMES = 3;
  export interface PairResult { wins: number; losses: number; plusMinus: number; games: number }
  export function pairResults(sessions: Session[]): Record<string, PairResult>;   // keyed by pairKey
  export interface DuoRecord {
    ids: [string, string]; names: [string, string];
    wins: number; losses: number; plusMinus: number; games: number;
    winRate: number;   // 0..1
  }
  /** `sessions` newest first. */
  export function bestDuos(sessions: Session[], savedPlayers: SavedPlayer[], limit?: number, minGames?: number): DuoRecord[];
  ```

- [ ] **Step 1: Write the failing tests** in `duos.test.ts`:
  - `pairResults adds up a pair across sessions`: a+b win 11–7 in one session and lose 8–11 in another → `{ wins 1, losses 1, plusMinus 1, games 2 }` under `pairKey('a','b')`.
  - `pairResults counts an equal score as a game, not a win or loss`.
  - `bestDuos leaves out pairs under 3 scored games together`: 2 games → `[]`; 3 games → one record.
  - `bestDuos orders by win rate, then wins, then +/-, then games`.
  - `bestDuos returns at most 5 by default`.
  - `bestDuos uses the current saved name, falling back to the newest session's name`: a saved player renamed to "Ana" → "Ana". A player who isn't saved → the name in `sessions[0]`, not in an older session.
  - `pairKey is order-independent`: `pairKey('b','a') === pairKey('a','b')`.

- [ ] **Step 2: Run the tests to make sure they fail**

Run: `npx jest lib/queue/__tests__/duos.test.ts`
Expected: FAIL, `Cannot find module '../duos'`

- [ ] **Step 3: Implement.** In `engine.ts`, rename `const key` to `export function pairKey` and update its uses in the file. Write `duos.ts` on top of `scoredMatches`.

- [ ] **Step 4: Run all queue tests**

Run: `npx jest lib/queue`
Expected: PASS (the engine tests are unchanged)

- [ ] **Step 5: Commit**

```bash
git add lib/queue/duos.ts lib/queue/engine.ts lib/queue/__tests__/duos.test.ts
git commit -m "feat(open-play): pair records across sessions for best duos"
```

### Task 3: Quick score on Match done, with the Ask for scores setting

**Files:**
- Create: `lib/queue/quick-score.ts`, `components/queue/QuickScoreSheet.tsx`, `lib/queue/__tests__/quick-score.test.ts`, `i18n/__tests__/standings-strings.test.ts`
- Modify: `store/session-store.ts` (state + interface), `store/__tests__/session-store.test.ts`, `lib/queue/__tests__/session.test.ts`, `app/queue/session.tsx` (Match done), `app/settings/index.tsx:132-146` (Open Play group), `i18n/{en,es,fr,de}.ts`

**Interfaces:**
- Consumes: `GameSettings['winningScore' | 'winByTwo']` from `useGameStore(s => s.settings)`. `matchDone(matchId, score?)` from the session store.
- Produces:
  ```ts
  // quick-score.ts
  export function suggestedWinnerPoints(loserPoints: number, rules: { winningScore: number; winByTwo: boolean }): number;
  export function scoreInTeamOrder(winner: 1 | 2, winnerPoints: number, loserPoints: number): [number, number];
  export function canSaveScore(winnerPoints: number, loserPoints: number): boolean;
  // session-store.ts
  askForScores: boolean;   // default true, persisted; written with useSessionStore.setState({ askForScores })
  // QuickScoreSheet.tsx
  export interface QuickScoreSheetProps {
    match: Match | null;   // null = hidden
    courtNumber: number;
    teamNames: [string, string];   // team1, team2, e.g. "Ana & Ben"
    onSave: (score: [number, number]) => void;
    onSkip: () => void;
    onClose: () => void;
  }
  ```
- Strings (en, under `standings`): `askForScores: 'Ask for scores'`, `whoWon: 'Court {{number}} · Who won?'`, `losingPoints: "Losing team's points"`, `winnerPoints: "Winning team's points"`, `saveScore: 'Save score'`, `skip: 'Skip'`.

- [ ] **Step 1: Write the failing tests.**
  - `quick-score.test.ts`:
    - `suggestedWinnerPoints`: `(7, {11, true}) → 11`, `(10, {11, true}) → 12`, `(11, {11, true}) → 13`, `(10, {11, false}) → 11`, `(13, {15, true}) → 15`, `(14, {15, true}) → 16`, `(19, {21, true}) → 21`.
    - `scoreInTeamOrder(2, 11, 7)` → `[7, 11]`; `(1, 12, 10)` → `[12, 10]`.
    - `canSaveScore`: `(11, 7)` true, `(11, 11)` false, `(7, 11)` false, `(0, 0)` false.
  - `session-store.test.ts`: add `askForScores: true` to the `beforeEach` reset.
    - `asks for scores by default`.
    - `keeps asking for scores after loading data saved before the setting existed`: write `{ state: { defaultCourtCount: 3 }, version: 0 }` to `@pickleball_open_play` in AsyncStorage, `await useSessionStore.persist.rehydrate()`, then expect `askForScores === true` and `defaultCourtCount === 3`.
  - `session.test.ts`: `undo after a scored Match done puts the match back with no score`. `finishMatch(s, id, 500, [11, 7])` then `undoLast` → match has no `endedAt` and no `score`, and it's on `courts[0]` again.
  - `standings-strings.test.ts`: the same shape as `ads-strings.test.ts`, for the `standings` namespace. English has keys, and es/fr/de have exactly the English keys, none empty.

- [ ] **Step 2: Run them to make sure the new ones fail**

Run: `npx jest lib/queue/__tests__/quick-score.test.ts store/__tests__/session-store.test.ts i18n/__tests__/standings-strings.test.ts lib/queue/__tests__/session.test.ts`
Expected: FAIL. Missing module `../quick-score`, `askForScores` undefined, and `standings` strings missing. The undo test may already pass, which is fine: it pins existing behaviour.

- [ ] **Step 3: Implement `lib/queue/quick-score.ts`.** With win by 2: `max(winningScore, loser + 2)`. Without: `max(winningScore, loser + 1)`.

- [ ] **Step 4: Add `askForScores: true` to the session store** (interface and initial state, beside `defaultCourtCount`).

- [ ] **Step 5: Add the six strings to all four locale files**, in a new `standings` namespace after `openPlay`.

- [ ] **Step 6: Build `QuickScoreSheet`** on `Sheet` with **no title** (Sheet's title row brings a "Done" button, which would read as "match done"). Children, top to bottom:
  - the `whoWon` heading
  - two team buttons side by side (`CourtButton`, `variant="line"` when picked, `"outline"` otherwise)
  - the `losingPoints` label
  - chips `0` … `winningScore − 1` in a wrapping row
  - a score line `11–7` with a `Stepper` for each side (winner `min 1, max 99`; loser `min 0, max 98`)
  - **Save score** (`disabled={!picked || !canSaveScore(...)}`)
  - **Skip** (`variant="outline"`)

  Choosing a chip sets the loser's points and resets the winner's to `suggestedWinnerPoints`. Changing the winner's stepper by hand sticks until another chip is chosen. The parent renders it with `key={match?.id ?? 'none'}`, so state never carries from one court to another. Closing by the backdrop or the Android back button calls `onClose` only.

- [ ] **Step 7: Wire Match done in `app/queue/session.tsx`.**
  - Add state `scoring: { match: Match; courtIndex: number } | null`.
  - Add `finishCourt(courtIndex, matchId, score?)`. It reads `rack.next` at call time, calls `matchDone(matchId, score)`, then `flyPaddlesToCourt(courtIndex, travelling)`.
  - Match done: if `askForScores`, call `setScoring(...)`; otherwise call `finishCourt(index, match.id)`.
  - `onSave`: `setScoring(null)`, then `finishCourt(..., score)`. `onSkip`: the same with no score. `onClose`: `setScoring(null)` only.
  - Team names: `"${a.name} & ${b.name}"` from `byId`.

- [ ] **Step 8: Add the setting.** In `app/settings/index.tsx`, put an **Ask for scores** `ListRow` with a `Toggle` in the Open Play group, after Default courts. It reads and writes `useSessionStore` `askForScores` via `setState`, like `setDefaultCourts`.

- [ ] **Step 9: Run everything**

Run: `npx jest && npx tsc --noEmit`
Expected: all tests PASS, tsc exits 0

- [ ] **Step 10: Commit**

```bash
git add lib/queue/quick-score.ts lib/queue/__tests__/quick-score.test.ts components/queue/QuickScoreSheet.tsx store/session-store.ts store/__tests__/session-store.test.ts lib/queue/__tests__/session.test.ts app/queue/session.tsx app/settings/index.tsx i18n
git commit -m "feat(open-play): quick score on Match done, with an Ask for scores setting"
```

### Task 4: Standings on the summary and live during play

**Files:**
- Create: `components/queue/StandingsTable.tsx`
- Modify: `app/queue/summary.tsx` (the Everyone list, the frequent partners row), `app/queue/session.tsx` (the row under the meta line, plus a sheet), `i18n/{en,es,fr,de}.ts`

**Interfaces:**
- Consumes: `sessionStandings`, `standingsLeaders`, `formatPlusMinus` (Task 1). `pairResults`, `pairKey` (Task 2).
- Produces:
  ```ts
  export interface StandingsTableProps {
    standings: Standings;
    noteFor?: (playerId: string) => string | undefined;   // e.g. "arrived 7:40"
  }
  ```
- Strings (en, `standings`):
  - `title: 'Standings'`
  - `captionPartial: 'From {{scored}} of {{total}} games · {{missing}} had no score'`
  - `columnRecord: 'W–L'`, `columnPlusMinus: '+/−'`, `columnGames: 'G'`
  - `rowA11y: 'Rank {{rank}}: {{name}}. Won {{wins}}, lost {{losses}}, plus-minus {{plusMinus}}, {{games}} games.'`
  - `unrankedA11y: '{{name}}: no scored games, {{games}} games.'`
  - `leadsOne: 'Standings · {{name}} leads, {{record}}'`, `leadsTwo: 'Standings · {{a}} and {{b}} lead, {{record}}'`, `leadsMany: 'Standings · {{count}} tied for first, {{record}}'`
  - `repeatedPairRecord: '{{a}} & {{b}} ({{count}}×, {{record}})'`

- [ ] **Step 1: Add the strings to all four locale files**

Run: `npx jest i18n`
Expected: PASS (the Task 3 test catches a missing translation)

- [ ] **Step 2: Build `StandingsTable`.**
  - Show the caption only when `scoredGames < finishedGames`.
  - A muted column header row.
  - One 48 px row per `StandingRow`, laid out like today's Everyone rows: rank (blank when null), colour dot, name (`numberOfLines={1}`, `flex: 1`), note, W–L, `formatPlusMinus`, games. Numbers in `tabular-nums`, right-aligned, fixed widths. Unranked rows show `–` for W–L and +/-.
  - Each row is `accessible` with a label from `rowA11y` or `unrankedA11y`.

- [ ] **Step 3: Update the summary.**
  - `const standings = useMemo(() => sessionStandings(session), [session])`.
  - When `standings.scoredGames > 0`: a header row with the `title` on the left (Task 6 adds Share on the right), then `StandingsTable` with `noteFor` returning `openPlay.arrived` for late players.
  - Otherwise, the current Everyone block exactly as it is.
  - Frequent partners: look up `pairResults([session])[pairKey(a, b)]`. When it has `games > 0`, use `repeatedPairRecord` with `record` as `"2–1"`. Otherwise use the existing `repeatedPair`. `topPairs` needs to carry the IDs.

- [ ] **Step 4: Add live standings to the session screen.**
  - Compute `sessionStandings(session)` in render. It's cheap.
  - When `scoredGames > 0`, show a `Pressable` row under the meta text: muted 15 pt, `›` at the end. Its text picks `leadsOne`, `leadsTwo` or `leadsMany` by the number of leaders, with `record` = the leaders' `wins–losses`.
  - It opens a `Sheet` titled `title` containing `StandingsTable`. Add no ad.

- [ ] **Step 5: Run everything**

Run: `npx jest && npx tsc --noEmit`
Expected: PASS, exit 0

- [ ] **Step 6: Commit**

```bash
git add components/queue/StandingsTable.tsx app/queue/summary.tsx app/queue/session.tsx i18n
git commit -m "feat(open-play): standings on the summary and live during the session"
```

### Task 5: Best duos on Stats

**Files:**
- Modify: `app/stats/index.tsx` (a new section after Open Play sessions), `i18n/{en,es,fr,de}.ts`

**Interfaces:**
- Consumes: `bestDuos`, `DUO_MIN_GAMES` (Task 2). `formatPlusMinus` (Task 1). `useSessionStore` `activeSession`, `openPlayHistory`, `savedPlayers`.
- Strings (en, `standings`): `bestDuos: 'Best duos'`, `duosEmpty: 'Pairs show up here after {{count}} scored games together.'`, `duoName: '{{a}} & {{b}}'`, `duoValue: '{{record}} · {{rate}}% · {{plusMinus}}'`.

- [ ] **Step 1: Add the strings to all four locales**, then run `npx jest i18n`. Expected: PASS.

- [ ] **Step 2: Add the section.**
  - Show it when `activeSession` or any of `openPlayHistory` exists.
  - `bestDuos([activeSession, ...openPlayHistory].filter(Boolean), savedPlayers)` in a `useMemo`.
  - Each record becomes a `ListRow` with label `duoName`, and value `duoValue` with `rate` = `Math.round(winRate * 100)`.
  - When there are none, show the `duosEmpty` text (`count: DUO_MIN_GAMES`) in the same muted card style as the Stats empty state.

- [ ] **Step 3: Run everything**

Run: `npx jest && npx tsc --noEmit`
Expected: PASS, exit 0

- [ ] **Step 4: Commit**

```bash
git add app/stats/index.tsx i18n
git commit -m "feat(stats): best duos across Open Play sessions"
```

### Task 6: Shareable standings image

**Files:**
- Create: `lib/share/share-image.ts`, `lib/share/__tests__/share-image.test.ts`, `components/queue/StandingsShareCard.tsx`
- Modify: `package.json` / `package-lock.json` (via `npx expo install`), `app/queue/summary.tsx` (Share, plus a preview sheet), `i18n/{en,es,fr,de}.ts`

**Interfaces:**
- Consumes: `shareRows`, `standingsText`, `formatPlusMinus` (Task 1). The `Standings` type.
- Produces:
  ```ts
  // share-image.ts
  export type ShareOutcome = 'image' | 'text';
  /** Captures `view` as a 1080×1350 PNG and opens the share sheet; shares `fallbackMessage` as text if anything fails. */
  export async function shareViewAsImage(view: View | null, fallbackMessage: string): Promise<ShareOutcome>;
  // StandingsShareCard.tsx — forwardRef<View, StandingsShareCardProps>
  export interface StandingsShareCardProps { standings: Standings; meta: string }   // meta = "Tue, Nov 25 · 2h 10m · 18 games · 2 courts"
  ```
- Strings (en, `standings`): `share: 'Share'`, `shareTitle: 'Share standings'`, `shareImage: 'Share image'`, `cardTitle: 'Open Play standings'`, `moreCount: '+{{count}} more'`.

- [ ] **Step 1: Install the libraries, then write the failing tests**

Run: `npx expo install react-native-view-shot expo-sharing`
Expected: both added to `dependencies` at versions for SDK 55.

In `share-image.test.ts`, `jest.mock('react-native-view-shot', () => ({ captureRef: jest.fn() }))`, `jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(), shareAsync: jest.fn() }))`, and `jest.spyOn(Share, 'share')`:
  - `shares the captured PNG when sharing is available`: `captureRef` gets `{ format: 'png', width: 1080, height: 1350, result: 'tmpfile' }`. `shareAsync` gets the uri with `mimeType: 'image/png'`. Returns `'image'`, and `Share.share` isn't called.
  - `falls back to text when capture throws`: `Share.share` gets `{ message }`, returns `'text'`.
  - `falls back to text when sharing is unavailable`.
  - `falls back to text when there is no view`.

- [ ] **Step 2: Run them to make sure they fail**

Run: `npx jest lib/share`
Expected: FAIL, `Cannot find module '../share-image'`

- [ ] **Step 3: Implement `shareViewAsImage`.**

- [ ] **Step 4: Run them to make sure they pass**

Run: `npx jest lib/share`
Expected: PASS

- [ ] **Step 5: Add the five strings to all four locales**

- [ ] **Step 6: Build `StandingsShareCard`** in the court style of `components/game/ShareCard.tsx`: `aspectRatio: 4/5`, the court lines, plates `#1f4b7d` with `#dce8f5` text, and `collapsable={false}` on the root.
  - Top plate: `cardTitle` and `meta`.
  - One plate holding `shareRows(standings).rows`: rank, name (`numberOfLines={1}`), W–L, +/-. Rows 1–3 get a lighter plate.
  - `moreCount` when `more > 0`.
  - `captionPartial` when some games went unscored.
  - `home.title` at the bottom.

- [ ] **Step 7: Add Share on the summary.**
  - The standings header gets a **Share** text button on the right.
  - It opens a `Sheet` titled `shareTitle`, showing `StandingsShareCard` (ref) and a **Share image** `CourtButton`.
  - Share image calls `shareViewAsImage(ref.current, standingsText(standings, heading, t('home.title')))`. `heading` is `cardTitle` plus the date.
  - (Mounting choice from spec §5: a preview on screen captures reliably on both platforms, where an off-screen view can come out blank on iOS. It also shows people what they're about to post.)

- [ ] **Step 8: Run everything**

Run: `npx jest && npx tsc --noEmit && npx expo lint`
Expected: PASS, exit 0. Lint shows no new warnings beyond the known `ServerIndicator.tsx` one.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json lib/share components/queue/StandingsShareCard.tsx app/queue/summary.tsx i18n
git commit -m "feat(open-play): share the standings as an image"
```

### Task 7: Check it on the simulator and emulator, then update the release docs

**Files:**
- Modify: `docs/RELEASE.md` (§1 test count, §1 intro, store screenshots, §4 checks), `docs/superpowers/specs/2026-11-25-open-play-standings-design.md` (status, the v1.2.0 target, the share preview)

- [ ] **Step 1: Build iOS.** Run `npx expo prebuild --platform ios` then `pod install`, so the new native modules link. Then build headless with `xcodebuild -workspace ios/PickleScore.xcworkspace -scheme PickleScore -configuration Debug -destination 'platform=iOS Simulator,id=<udid>' build`, using the default DerivedData (never `ios/build`). Install and launch with `xcrun simctl`.
Expected: `** BUILD SUCCEEDED **`, and the app launches.

- [ ] **Step 2: Build Android.** Run `npx expo run:android --device Pixel_7_Pro_API_34`.
Expected: the app installs and launches.

- [ ] **Step 3: Check by hand on both platforms**, with screenshots:
  1. Start a session with 8 players and 2 courts.
  2. Match done → sheet → pick a team → chip 7 → Save. The court refills and the paddles fly.
  3. Match done → Skip.
  4. Open court 1's sheet, close it, open court 2's: nothing is picked.
  5. The live row reads "Standings · … leads, 1–0"; its sheet shows the table and no ad.
  6. Undo straight after a scored Match done: the standings drop that game.
  7. Settings → Ask for scores off: Match done finishes at once.
  8. End the session: the summary shows the standings, the caption, and frequent partners with a record. The banner is still above the paddles.
  9. Share → preview → Share image: the system sheet offers the PNG.
  10. Stats → Best duos shows its empty state.
  11. Switch the language to German and check the new screens fit.

- [ ] **Step 4: Update `docs/RELEASE.md`.**
  - §1: the new test count.
  - The intro line: add standings, best duos and sharing standings.
  - Store listing: suggest a standings screenshot.
  - §4: add a device checklist item for sharing the image into Messenger or Viber on a real phone.

- [ ] **Step 5: Update the spec.**
  - Status: approved by the owner on 2026-11-25.
  - §4.9 branching: ships in v1.2.0.
  - §4.8: Share opens a preview sheet with Share image, and why.

- [ ] **Step 6: Commit**

```bash
git add docs/RELEASE.md docs/superpowers/specs/2026-11-25-open-play-standings-design.md docs/superpowers/plans/2026-11-25-open-play-standings.md
git commit -m "docs: standings in the v1.2.0 release checklist and design record"
```
