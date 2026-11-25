# Phase 5: Redesign the Existing Screens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move every remaining screen into the Court & Paddle world, add custom sounds, and retire the old look.

**Architecture:** Screens are rebuilt on the Phase 3 components (`CourtDiagram`, `Paddle`, `CourtButton`, `ListGroup`, `Segmented`, `Toggle`, `Stepper`, `Sheet`, `Dialog`, `Toolbar`). Scoring rules, the game store and the stats store keep working as they are: this is a skin-and-layout change, plus the custom-sound feature. NativeWind classes are replaced with token styles on these screens, because the world needs exact colors.

**Tech Stack:** As before, plus `expo-document-picker` and `expo-file-system` for custom sounds.

**Spec:** `docs/superpowers/specs/2026-09-18-open-play-and-redesign-design.md` §7
**Approved mockups:** `.superpowers/brainstorm/36629-1789743181/content/all-screens.html`

## Global Constraints

- Tests, typecheck (`--types react,node,jest`) and lint (0 errors) stay green after every task.
- Behaviour stays the same unless the spec says otherwise. Scoring rules are untouched.
- `Pressable` style callbacks are dropped under NativeWind: visual styles go on an inner `View` (learned in Phase 3 and 4).
- A `CourtDiagram` with a `courtLabel` needs ~12pt of space above it.
- All copy goes through i18next in four languages; counts use plural keys.
- One appearance only. The Dark Mode setting is removed.

---

### Task 1: Home

- [ ] Rebuild `app/index.tsx` on the court ground: large title, settings icon, the Open Play court card (already built), Singles and Doubles tiles with small court line-drawings, then rows for match history and saved players. Remove the "Features" list.
- [ ] Delete the NativeWind color classes from this screen; use tokens.
- [ ] Typecheck, lint, screenshot, commit.

### Task 2: Game setup

- [ ] Replace `components/game/GameSetup.tsx` with a court-based setup: a `Segmented` for scoring type with its description, a `CourtDiagram` in setup mode (tap a slot to name a player), a chip row of saved players, a "Game to" row, and a Start dock.
- [ ] Names typed here are saved as players (`addSavedPlayer`), so they appear in Open Play too.
- [ ] Singles uses two slots, doubles four.
- [ ] Typecheck, lint, screenshot, commit.

### Task 3: Scorers and in-game dialogs

- [ ] Rebuild `app/(game)/doubles.tsx` and `app/(game)/singles.tsx` on the court ground: the call (`7–4–2` in doubles sideout, `5–3` otherwise) with a caption naming the server, a `CourtDiagram` with the server marked and the serve diagonal, two large buttons (Point / Side out, or one per team in rally mode), and a `Toolbar` with Sounds, Undo, Settings and End.
- [ ] Replace the `Alert.alert` side-change prompt with the in-app `Dialog`, and the End Game alert with a `Dialog`.
- [ ] Keep every existing call into the game store unchanged.
- [ ] Typecheck, lint, screenshot both, commit.

### Task 4: Game over and share card

- [ ] Replace `WinModal` with a full-screen result in the court world: winner, final score, duration, player chips, then Share / Play again / Back to Open Play.
- [ ] Rebuild `ShareCard` as a portrait court seen from above with the score on the net, the date and mode, teams and duration, and the app name. Text sits on court-colored plates so no line crosses it.
- [ ] Typecheck, lint, screenshot, commit.

### Task 5: Soundboard and custom sounds

- [ ] `npx expo install expo-document-picker expo-file-system`.
- [ ] Extend `SoundManager` with custom sounds: `addCustomSound(uri, name)`, `removeCustomSound(id)`, `renameCustomSound(id, name)`, and a merged `allSounds()`. Custom files are copied into the app's document directory; metadata (`id`, `name`, `fileUri`, `durationMs`) persists in the game store settings.
- [ ] Validation before saving: at most 5 seconds, at most 2 MB, mp3/m4a/aac/wav, at most 24 custom sounds. Duration is read by loading the file. A rejected file shows a message naming the limit.
- [ ] Rebuild the soundboard as a `Sheet`: All / Hype / Classic / Meme / Mine segmented control, sounds as paddle-face tiles, an "Add sound" tile in Mine, long-press to rename or delete, and per-team sound rows.
- [ ] A missing or unreadable file renders the tile as unavailable instead of crashing.
- [ ] Unit-test the validation rules (pure function `validateCustomSound({durationMs, bytes, name})`).
- [ ] Typecheck, lint, test, screenshot, commit.

### Task 6: Stats

- [ ] Rebuild `app/stats/index.tsx`: a sentence summary ("You've won 12 of your last 20", with the current streak), a strip of the last 20 results (filled = win), a recent-games list with W/L marker, score, opponents and date, and an Open Play sessions list from `openPlayHistory` (tapping one opens the summary screen for it).
- [ ] `app/queue/summary.tsx` takes an optional `sessionId` param so a past session can be shown.
- [ ] Typecheck, lint, screenshot, commit.

### Task 7: Settings, rules, privacy

- [ ] Rebuild `app/settings/index.tsx` with `ListGroup`s: Scoring (type, winning score, win by 2, switch sides at, swap scores), Open Play (default courts, late arrivals), App (language, rules, privacy policy). Remove the Dark Mode row and the theme setting it wrote.
- [ ] New `app/settings/rules.tsx`: a readable page explaining the score call, with an illustrated example.
- [ ] Restyle `app/settings/privacy.tsx` as a calm text page.
- [ ] Typecheck, lint, screenshot, commit.

### Task 8: Retire the old look

- [ ] Delete `components/common/Button.tsx`, `IconButton.tsx`, `components/scoring/ScoreButton.tsx`, `ScoreDisplay.tsx`, `ServerIndicator.tsx`, `GameControls.tsx`, `components/stats/StatsCard.tsx` and `components/theme/ThemeProvider.tsx` once nothing imports them.
- [ ] Remove `useDarkMode` and the `theme` setting; keep `Modal.tsx` only if still used.
- [ ] Remove the legacy Tailwind colors (`primary`, `secondary`, `accent`, `team1`, `team2`, `bg-dark`, `bg-light`) once no screen uses them.
- [ ] Update the splash and adaptive icon background in `app.json` from `#22c55e` to `#2d5a48`.
- [ ] `grep` for `isDarkMode`, `className="bg-gray`, `text-gray` to confirm nothing is left.
- [ ] Full run: tests, typecheck, lint, app launch, screenshot every screen.
- [ ] Commit, then report to the user.
