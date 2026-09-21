# Phase 4: Open Play Screens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Open Play screens on top of the Phase 2 engine and Phase 3 components, so an organizer can run a whole session in the app.

**Architecture:** Three routes under `app/queue/` (check-in, live session, summary) plus a player sheet component. Screens read and write only through `useSessionStore`; no queue logic lives in a screen. The live session links out to the existing doubles scorer and back.

**Tech Stack:** Expo Router, Zustand (`store/session-store.ts`), the `components/court/*` and `components/ui/*` components, i18next.

**Spec:** `docs/superpowers/specs/2026-09-18-open-play-and-redesign-design.md` §6
**Approved mockups:** `.superpowers/brainstorm/36629-1789743181/content/all-screens.html`

## Global Constraints

- Tests (`npm test`), typecheck (`npx tsc --noEmit --types react,node,jest`) and lint (0 errors) stay green.
- Screens hold no queue rules. Anything that decides who plays lives in `lib/queue/engine.ts`.
- All user-visible text goes through i18next in `en`, `es`, `fr` and `de`.
- A court diagram with a `courtLabel` needs about 12pt of space above it, or the pill clips (found in Phase 3).
- Minimum 44pt touch targets; every screen works at 1.3× font scale.
- The old screens keep their current look in this phase; Phase 5 restyles them.

---

### Task 1: Routes and the Home entry

**Files:**
- Create: `app/queue/_layout.tsx`
- Modify: `app/_layout.tsx` (register the `queue` stack screen)
- Modify: `app/index.tsx` (Open Play card: "Run a session", or "Resume session" when one is active)
- Modify: `i18n/en.ts`, `es.ts`, `fr.ts`, `de.ts` (new `openPlay` block)

- [ ] **Step 1:** `app/queue/_layout.tsx` is a `Stack` with `headerShown: false`, matching `app/(game)/_layout.tsx`.
- [ ] **Step 2:** Add `<Stack.Screen name="queue" />` to the root layout.
- [ ] **Step 3:** On Home, add a card above Singles that routes to `/queue`. When `useSessionStore(s => s.activeSession)` is not null it reads "Resume session · N players" and routes to `/queue/session`.
- [ ] **Step 4:** Add the `openPlay` i18n block with every string the next tasks use, in all four languages.
- [ ] **Step 5:** Typecheck, lint, commit.

---

### Task 2: Check-in screen (`app/queue/index.tsx`)

- [ ] **Step 1:** Title "Who's here?", subtitle "Tap paddles to check players in".
- [ ] **Step 2:** "Add a new name" row opens a text input (inline `TextInput` in a `Sheet`); submitting calls `addSavedPlayer` and checks that player in.
- [ ] **Step 3:** Saved players render as a wrapped grid of `md` paddles: checked in are solid, others `ghost`. Tapping toggles. Long-press opens a small sheet with Rename and Delete.
- [ ] **Step 4:** Saved groups render as chips above the grid; tapping one checks in everyone in it.
- [ ] **Step 5:** A `ListGroup` with: Courts (`Stepper`, 1–6, default from `defaultCourtCount`), Fixed pairs (row showing the locked pairs, opens a sheet to lock two checked-in players), and Late arrivals (value "Group level", not editable, with a one-line explanation).
- [ ] **Step 6:** Dock at the bottom: "Start session · N players", disabled below 4 with the hint "Check in at least 4 players".
- [ ] **Step 7:** Starting calls `startSession(ids, courts)`, applies any pairs via `lock`, then `router.replace('/queue/session')`.
- [ ] **Step 8:** Empty state when no saved players exist: a line explaining that names are saved for next time, and the add row.
- [ ] **Step 9:** Typecheck, lint, commit.

---

### Task 3: Live session screen (`app/queue/session.tsx`)

- [ ] **Step 1:** Header: back to Home, "End" (confirmation `Dialog`, then `finishSession()` and `router.replace('/queue/summary')`), title "Open Play", meta line "N players · N courts · N games".
- [ ] **Step 2:** One `CourtDiagram` per court from `activeSession.courts`, showing each match's four players in slot order [team1[0], team1[1], team2[0], team2[1]] with their session colors, the court number, and a live clock that ticks each second from `calledAt`.
- [ ] **Step 3:** Under each court: "Match done" (`line`) and "Score" (`outline`). Match done calls `matchDone(matchId)`. An empty court shows "Waiting for players" and no buttons.
- [ ] **Step 4:** `PaddleRack` below, fed by a `nextUp` selector: the result of `pickNextMatch` for the four, and everyone else available in queue order. Locked pairs pass through `lockedPairs`.
- [ ] **Step 5:** Dock: "Add player" opens the same add sheet, calling `addToSession(name)`.
- [ ] **Step 6:** An "Undo" toolbar item, enabled when `canUndo(activeSession)`, calling `undo()`.
- [ ] **Step 7:** Tapping any player (court or rack) opens the player sheet from Task 4.
- [ ] **Step 8:** If there is no active session (for example after ending one), redirect to `/queue`.
- [ ] **Step 9:** Typecheck, lint, commit.

---

### Task 4: Player sheet (`components/queue/PlayerSheet.tsx`)

- [ ] **Step 1:** Props: `playerId | null`, `onClose`. Reads the player and `explainQueuePosition` from the store.
- [ ] **Step 2:** Header: the player's `lg` paddle, their name, "N games played", and their arrival time; a note line when `joinedAtGroupLevel` explaining they joined at the group's level.
- [ ] **Step 3:** "Why they're next" rows: games in the queue (with "tied at N" when at the lowest count), waiting since, and last partner.
- [ ] **Step 4:** Actions: "Sit out for now" / "Come back" (`sitOut` / `comeBack`), "Lock a partner" (opens a picker of available players) / "Unlock", and "Remove from session" (destructive, with confirmation). While the player is on a court, the first and last are disabled with the reason "On court right now".
- [ ] **Step 5:** Typecheck, lint, commit.

---

### Task 5: Summary screen (`app/queue/summary.tsx`)

- [ ] **Step 1:** Reads `openPlayHistory[0]`. Title "Session over", meta "Xh Ym · N games · N courts".
- [ ] **Step 2:** Fairness card, built from the real numbers: "Everyone here from the start played N or M games", plus one line per late arrival ("Joy arrived at 7:36 and played N").
- [ ] **Step 3:** Every player as a `head` paddle with their games played, ordered by games played descending.
- [ ] **Step 4:** Rows: most frequent partners (from `pairingHistory`, or "nobody repeated" when none), and "Save as group" (opens a name input, calls `saveGroup`).
- [ ] **Step 5:** Dock: "Done" returns Home.
- [ ] **Step 6:** Typecheck, lint, commit.

---

### Task 6: Scorer link

**Files:** `app/(game)/doubles.tsx`, `components/game/WinModal.tsx`, `app/queue/session.tsx`

- [ ] **Step 1:** "Score" navigates to `/(game)/doubles?sessionMatchId=<id>`.
- [ ] **Step 2:** `doubles.tsx` reads `useLocalSearchParams()`. With a `sessionMatchId`, it looks the match up in the active session, calls `startDoublesGame` with the two team names built from the player names ("Maria & Carlo"), and skips the setup step.
- [ ] **Step 3:** `WinModal` takes an optional `onBackToSession` callback. When present, it shows "Back to Open Play" as the primary button; pressing it calls `matchDone(sessionMatchId, [score1, score2])` (scores from `getGameResult`) and routes back to `/queue/session`.
- [ ] **Step 4:** Leaving the scorer without finishing changes nothing in the session.
- [ ] **Step 5:** Typecheck, lint, commit.

---

### Task 7: Run a real session on the device

- [ ] **Step 1:** On the Android emulator, run this script and screenshot each step:
  1. Home → Open Play.
  2. Add 9 players, check them all in, lock one pair, set 2 courts, Start.
  3. Confirm both courts fill and the locked pair appears together.
  4. Match done on court 1; confirm the next four go on and counts rise by 1.
  5. Add a late arrival; confirm they appear in the rack with their real count and are picked soon after.
  6. Open a player sheet; sit that player out; confirm they are skipped; bring them back.
  7. Undo; confirm the previous state returns exactly.
  8. Score a match through the scorer and return with "Back to Open Play"; confirm the score is stored and the match counted once.
  9. End the session; check the summary numbers against what happened.
- [ ] **Step 2:** Kill the app mid-session and reopen it; the session must come back exactly.
- [ ] **Step 3:** Check at 1.3× font scale that the live screen still works.
- [ ] **Step 4:** Fix everything found in one batch, re-verify, commit.
- [ ] **Step 5:** Report to the user with what the run showed, then Phase 5.
