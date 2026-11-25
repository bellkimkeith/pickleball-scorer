# Open Play standings, best duos, and a shareable standings image

Date: 2026-11-25
Status: draft for the owner's approval. The owner chose the three features; the owner asked Claude to decide the rest, so every detailed call below is Claude's and can be overridden.
Builds on: [2026-09-18-open-play-and-redesign-design.md](2026-09-18-open-play-and-redesign-design.md) (Open Play) and [2026-11-25-free-with-ads-design.md](2026-11-25-free-with-ads-design.md) (where ads may go)

## 1. Intent

Open Play currently ends by showing how many games each person played. Nothing says who won. This spec adds results:

1. **Standings.** Each player's wins, losses and +/- (points won minus points lost), ranked. Shown on the session summary and live during the session.
2. **Best duos.** The win rate of each partner pair, built up across sessions.
3. **Shareable standings image.** A picture of the night's standings to post in the group chat.

Why (Claude's reading; the owner didn't say): a regular group wants bragging rights and something to talk about after the night. Standings are for fun. They never change who plays next. Fair rotation stays the point of Open Play.

## 2. Goals, non-goals, anti-goals

Goals
- Any finished game can be given a score in two or three taps, without opening the full scorer.
- Every session with at least one scored game shows standings, including past sessions already on the phone.
- A pair's record covers enough games together to mean something.
- The standings image reads well as a chat attachment, with no app UI or ads in it.

Non-goals
- Using results to pick matches: skill levels, or "winners stay on". The queue engine stays untouched.
- Player profiles (one player's record across sessions). The best duos code prepares for them, but profiles come later.
- Editing an old score. A wrong score can be fixed with Undo right after Match done, the same as any other action today.
- Turning the existing single-game share card into an image. It's easy once the libraries are in, but it's a separate change.
- Saving straight to Photos. The system share sheet already offers "Save Image".
- Singles open play, sync, or more than one phone.

Anti-goals (any of these counts as failure, even if everything works)
- Results change who is called next, or change the fairness card.
- Match done becomes a chore for organizers who don't care about scores. Skip must be one tap, and a setting turns the prompt off.
- A late arrival who went 1–0 ranks above someone who went 6–1.
- A "best duo" based on a single game.
- A banner ad inside any new sheet or in the image, or next to their buttons.

## 3. Approaches considered

**How standings are calculated**
1. *Calculated from saved scores whenever needed* (chosen). Each finished match already stores its score in team order: `Match.score` in `lib/types/queue.ts`, written at `app/(game)/doubles.tsx` when the full scorer finishes an Open Play match. A pure function turns a session's matches into standings. No new stored data, no migration, past sessions get standings, and Undo needs no new work.
2. *Running totals on each player*, like `gamesPlayed`. Cheaper to read, but it stores the scores twice, past sessions would need their totals filled in, and every Undo would have to reverse it. Rejected. A group has at most about 24 players and a few dozen games, so recalculating is effectively free.

**Getting scores for courts nobody scored in the app**
1. *Match done asks for the score, with Skip* (chosen). One phone can't run the full scorer on every court, so most scores will come from here.
2. *Leave Match done alone.* Only courts scored with the full scorer would count, so most players would have few or no results. Rejected.
3. *Require a score.* The next match on that court couldn't start whenever nobody remembers the score. Rejected.

**How long a period best duos covers**
1. *All Open Play sessions on the phone* (chosen). The queue deliberately avoids repeat partners: every time two players have already partnered adds 100 to a lineup's cost (`lib/queue/engine.ts`). So within one night, most pairs play together once, and their record that night is 1–0 or 0–1. Across weeks with a regular group, the records grow.
2. *Per session only.* Rejected for the reason above. The summary's existing "Frequent partners" row still shows that night's record for a pair (4.6).

**Ranking order**
1. *Most wins, then fewest losses, then +/-* (chosen). It's the order people know from round robins, and a late arrival at 1–0 can't rank above someone at 6–1.
2. *Win %.* Fairer when players have played different numbers of games, but it rewards tiny samples. Rejected for standings. Best duos uses it, because there a minimum number of games together rules out tiny samples.

**Making the image**
1. *Draw a card off-screen and capture it* with `react-native-view-shot`, then share the file with `expo-sharing` (chosen). Note: today's game share card is drawn on screen, but its Share button sends plain text (`Share.share({ message })` in `components/game/ShareCard.tsx`). The app can't capture images yet. Both libraries are native modules, so this needs a new native build. That's no extra burden, since the app has no over-the-air updates anyway.
2. *Plain-text standings* through the existing `Share.share`. No new libraries and it works everywhere, but it isn't what the owner asked for. It's kept as the fallback when capture or sharing fails.

## 4. The design

### 4.1 Standings rules (`lib/queue/standings.ts`, pure, unit-tested)

- A **scored game** is a match with both `endedAt` and `score`. Matches still on court, and matches ended without a score, don't count toward W-L or +/-.
- `score[0]` belongs to `team1` and `score[1]` to `team2`, the order the doubles scorer writes today (via `getGameResult`).
- Each player on the winning team gets a win, and each player on the losing team gets a loss. Every player is credited with their team's points scored and points conceded. **+/-** = points scored − points conceded.
- If both sides have the same score, the game counts toward +/- but as neither a win nor a loss. Neither way of entering a score allows this, so it's only a guard.
- **Order:** most wins → fewest losses → highest +/- → most points scored → name (locale compare). Players equal on wins, losses, +/- and points scored share a rank (1, 2, 2, 4).
- Players with no scored games come after everyone ranked, without a rank number.
- Players who left mid-session keep their results.
- The function also returns `scoredGames` and `finishedGames`, for the caption.

### 4.2 Quick score on Match done

When **Ask for scores** is on (4.7), tapping **Match done** on a court opens a sheet (the existing `Sheet`) instead of finishing the match straight away.

```
 Court 1 · Who won?
 ┌──────────────────┐  ┌──────────────────┐
 │  Ana & Ben       │  │  Cy & Dee        │      team1 left, team2 right
 └──────────────────┘  └──────────────────┘
 Losing team's points
  0  1  2  3  4  5  6  7  8  9  10
              11 – 7          (− / + on each side)
 [        Save score        ]        Skip
```

- Tap the winning team, then the losing team's points. The winner's points fill in from the scoring settings (`winningScore`, `winByTwo` in the game store): `winningScore`, or the loser's points + 2 when `winByTwo` is on and the loser reached `winningScore − 1` or more (10 → 12–10).
- Each side has a − / + stepper, for games played to a different target. **Save score** is disabled unless the winner has more points.
- The chips run from 0 to `winningScore − 1`. A higher losing score (13–11) is set with the stepper.
- **Save score** calls `matchDone(matchId, score)` with the score in team order. **Skip** calls `matchDone(matchId)` exactly as Match done does today. Closing the sheet any other way leaves the match on court.
- The paddle flight to the freed court starts after the sheet closes, with positions measured at that moment.
- The **Score** button (the full scorer) is unchanged. The full scorer goes on saving its games to the personal "on this phone" history. Quick-score games are kept only in the session, not added to that history.
- Undo after Match done puts the match back on court with no score, as it does today.

### 4.3 Standings on the session summary

When the session has at least one scored game, the "Everyone" list becomes the standings table. Otherwise it stays exactly as today (sorted by games played).

```
 Standings                              Share
 From 14 of 18 games · 4 had no score
  1  ● Ana          5–1    +17     6
  2  ● Ben          5–1     +9     6
  3  ● Cy           4–2     +6     6
  …
     ● Eve           –      –      2
```

- Columns: rank, colour dot, name, W–L, +/-, games played. Games played stays because it's the fairness number. The "arrived 7:40" note stays.
- +/- reads `+12`, `−3` (a true minus sign, U+2212) or `0`, in tabular numerals.
- The caption appears only when some finished games have no score.
- **Share** sits in the header row, well away from the inline banner, with the paddles in between (the ads spec keeps banners away from action buttons).
- The fairness card, the paddles and the banner position are unchanged.
- Screen readers read each row as one phrase, for example "1st, Ana, 5 wins, 1 loss, plus 17, 6 games".

Past sessions opened from Stats show the same table, because it's calculated from their saved scores.

### 4.4 Live standings during the session

- Once the session has a scored game, a single tappable row appears under the session's meta line: "Standings · Ana leads, 4–0 ›". When players are tied: "Ana and Ben lead, 4–0".
- Tapping it opens a sheet with the same table as 4.3, without Share.
- Nothing else on the live screen changes. The sheet has no ad.

### 4.5 Best duos (Stats screen)

- A new **Best duos** section on Stats, after "Open Play sessions".
- Built from every session in `openPlayHistory` plus the active one, grouped by pair of player IDs. Session players use their saved player's ID, so a pair stays the same pair across sessions.
- A pair qualifies after **3 or more scored games together**. The section shows the top 5, ordered by win % → wins → +/- → games together. Each row reads: "Ana & Ben · 7–2 · 78% · +31".
- Names come from the current saved players, so a rename shows up. A deleted player falls back to their name in the most recent session they played.
- When no pair qualifies, the section shows: "Pairs show up here after 3 scored games together."
- It covers the last 50 sessions, because that's all the phone keeps (`MAX_SESSIONS_KEPT` in `store/session-store.ts`).
- Locked pairs count the same as any other pair.

### 4.6 Frequent partners row on the summary

The existing row ("Ana & Ben ×3") adds the pair's record that night when they had scored games together: "Ana & Ben ×3 (2–1)".

### 4.7 Setting

- Settings → Open Play gets **Ask for scores**, a `Toggle`, **on** by default. It's stored, and kept across restarts, in the session store next to `defaultCourtCount`.
- When it's off, Match done finishes the match at once, as it does today.

### 4.8 Shareable standings image

- The **Share** button sits in the summary's standings header (4.3), shown only when there's at least one scored game.
- A portrait 4:5 card in the same style as the game share card: court colours, with text on court-coloured plates so court lines never cross it.
  - Top plate: date · "Open Play" · duration · games · courts.
  - The ranked table: rank, name, W–L, +/-. The top three get a stronger plate. Up to 16 rows; any more players become "+N more".
  - Players without scored games are left off. The caption from 4.3 appears when some games went unscored.
  - The app name at the bottom.
- The card is drawn off-screen at 1080 px wide, captured to a PNG in the cache folder with `react-native-view-shot`, and handed to the system share sheet with `expo-sharing`. The share sheet covers Messenger, Viber, WhatsApp and Save Image.
- If capture or sharing fails, the app shares the same standings as text through `Share.share`.
- No ads in the image.

### 4.9 Text, data, and build

- All new text in English, Spanish, French and German (`i18n/*.ts`).
- No change to stored data shapes. `Match.score` already exists and is optional.
- Add the new libraries with `npx expo install react-native-view-shot expo-sharing`, so the versions match SDK 55. Both need a new native build. Check them on the iOS and Android dev builds.
- Branching: `release/v1.2.0` is mid-release. Do this work on a new feature branch for v1.3.0, from `main` once v1.2.0 is merged.

### 4.10 Tests

- Unit: standings order, shared ranks, unscored games, players who left, equal scores, mapping the score to team order, the caption counts.
- Unit: duo records across sessions, the 3-game threshold, renamed and deleted players.
- Unit: the quick-score fill-in (a loss on 7 → 11–7, on 10 → 12–10, win by 2 off, 15 and 21 targets).
- The existing queue engine tests pass unchanged, which shows results never reach the code that picks matches.
- On a device: Match done → score → standings; Skip; the setting off; sharing the image into a chat app on both platforms.

## 5. Left to the builder

- How the components are split (for example `StandingsTable`, `QuickScoreSheet`, `StandingsShareCard`), and the styling within the existing Court & Paddle tokens.
- How the off-screen card is mounted for capture.
- The Spanish, French and German wording.
- Whether the live standings row animates when the leader changes (subtle or not at all).
