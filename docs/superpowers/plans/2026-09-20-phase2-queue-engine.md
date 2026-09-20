# Phase 2: Queue Engine and Session Store Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Open Play queue logic (fair match picking, late arrivals, sit-outs, locked pairs, undo) as pure, tested functions, plus a persisted session store. No UI in this phase.

**Architecture:** `lib/queue/engine.ts` holds pure functions that take a `Session` and return a new `Session`; it never touches React or storage. `store/session-store.ts` is a thin Zustand wrapper with `persist` on AsyncStorage. Tests run on `jest-expo` and cover both the stated rules and simulated sessions.

**Tech Stack:** TypeScript (strict), Zustand 5 + persist, AsyncStorage, jest-expo.

**Spec:** `docs/superpowers/specs/2026-09-18-open-play-and-redesign-design.md` §4

## Global Constraints

- Typecheck with `npx tsc --noEmit --types react,node` (plain `tsc` aborts on the pre-existing `@types/react 2` folder). Lint must stay at 0 errors.
- Engine functions are pure: same inputs give the same outputs, no `Date.now()` inside (time is always a `now` parameter), no randomness.
- Fairness is a strict filter, never a weight (spec §4.4 step 5).
- Cost weights, exactly: waiting `30 × (Σ rank − 6)`, repeat partner `100 ×` previous partnerings `+ 50` if either player's most recent match, repeat opponent `15 ×` per previous opposing pair.
- Paddle colors, in assignment order: `ochre, coral, paper, sky, carbon, lilac, sand, teal`.
- Every test file lives next to its subject under `__tests__/`.

**Verification commands:** `npm test`, `npx tsc --noEmit --types react,node`, `npm run lint`.

---

### Task 1: Test runner + the swapped-score bug

The side-change "swap scores" feature stores `score1`/`score2` in display order, so after a switch `score1` holds player 2's score. `WinModal` compensates, but `saveGame` and `ShareCard` don't, so Stats records the wrong winner. Fix it once, in a shared helper.

**Files:**
- Modify: `package.json` (jest-expo, `test` script)
- Create: `jest.config.js`
- Create: `lib/utils/game-result.ts`
- Create: `lib/utils/__tests__/game-result.test.ts`
- Modify: `lib/storage/game-history.ts`, `components/game/ShareCard.tsx`, `components/game/WinModal.tsx`

**Interfaces:**
- Produces: `getGameResult(game: GameState): { score1: number; score2: number; winner: 1 | 2 }`, where `score1` always belongs to player 1 / team 1 regardless of `scoresSwapped`.

- [ ] **Step 1: Install the runner**

```bash
npm install --save-dev --legacy-peer-deps jest-expo jest @types/jest
```

- [ ] **Step 2: Configure Jest.** Create `jest.config.js`:

```js
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|nativewind|react-native-css-interop)',
  ],
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
};
```

  Add to `package.json` scripts: `"test": "jest"`.

- [ ] **Step 3: Write the failing test.** Create `lib/utils/__tests__/game-result.test.ts`:

```ts
import { getGameResult } from '../game-result';
import { SinglesGameState } from '../../types/game';

function singles(score1: number, score2: number, scoresSwapped: boolean): SinglesGameState {
  return {
    mode: 'singles',
    player1: { id: '1', name: 'Ana' },
    player2: { id: '2', name: 'Bea' },
    score1,
    score2,
    servingPlayer: 1,
    servingSide: 'right',
    sidesChanged: scoresSwapped,
    scoresSwapped,
    gameStartTime: 0,
    scoreHistory: [],
  };
}

describe('getGameResult', () => {
  it('reads scores directly when sides were never swapped', () => {
    expect(getGameResult(singles(11, 7, false))).toEqual({ score1: 11, score2: 7, winner: 1 });
  });

  it('unswaps the scores after a side change', () => {
    // display shows 0 - 11, but player 1 actually won 11 - 0
    expect(getGameResult(singles(0, 11, true))).toEqual({ score1: 11, score2: 0, winner: 1 });
  });

  it('names player 2 the winner when player 2 leads', () => {
    expect(getGameResult(singles(11, 4, true))).toEqual({ score1: 4, score2: 11, winner: 2 });
  });
});
```

- [ ] **Step 4: Run it and watch it fail.** `npm test -- game-result`. Expected: `Cannot find module '../game-result'`.
- [ ] **Step 5: Implement.** Create `lib/utils/game-result.ts`:

```ts
import { GameState } from '../types/game';

export interface GameResult {
  score1: number;
  score2: number;
  winner: 1 | 2;
}

/**
 * Scores are stored in display order, so after a "swap scores" side change
 * score1 belongs to player 2. This returns them in player order.
 */
export function getGameResult(game: GameState): GameResult {
  const swapped = game.scoresSwapped === true;
  const score1 = swapped ? game.score2 : game.score1;
  const score2 = swapped ? game.score1 : game.score2;
  return { score1, score2, winner: score1 > score2 ? 1 : 2 };
}
```

- [ ] **Step 6: Run the test.** `npm test -- game-result`. Expected: 3 passing.
- [ ] **Step 7: Use it in the three consumers.**
  - `lib/storage/game-history.ts`: in `saveGame`, replace the `score1`, `score2` and `winner` fields with values from `getGameResult(gameState)`.
  - `components/game/ShareCard.tsx`: derive `const { score1, score2, winner: resultWinner } = getGameResult(gameState);` and use those in the rendered score and in `handleShare`'s message instead of `gameState.score1` / `gameState.score2`.
  - `components/game/WinModal.tsx`: replace the local `scoresSwapped` / `isWinnerTeam1` calculation with `const { winner: winnerValue } = getGameResult(gameState);` and `const isWinnerTeam1 = winnerValue === 1;`, keeping the rest.
- [ ] **Step 8:** Run `npm test`, the typecheck, and lint. All clean.
- [ ] **Step 9: Commit**

```bash
git add -A && git commit -m "fix: record the correct winner and score after a side change"
```

---

### Task 2: Queue types and colors

**Files:**
- Create: `lib/types/queue.ts`
- Create: `lib/queue/colors.ts`
- Create: `lib/queue/__tests__/colors.test.ts`

**Interfaces:**
- Produces: every type in spec §4.1, plus `PADDLE_COLORS: readonly PaddleColor[]`, `nextColorForRoster(saved: SavedPlayer[]): PaddleColor` and `sessionColor(saved: PaddleColor, taken: PaddleColor[]): PaddleColor`.

- [ ] **Step 1:** Create `lib/types/queue.ts` with exactly the types listed in spec §4.1 (`PaddleColor`, `SavedPlayer`, `SavedGroup`, `PlayerStatus`, `SessionPlayer`, `Match`, `Session`), plus:

```ts
export type SessionAction =
  | { type: 'finishMatch'; previous: Session }
  | { type: 'addPlayer'; previous: Session }
  | { type: 'removePlayer'; previous: Session }
  | { type: 'sitOut'; previous: Session }
  | { type: 'returnPlayer'; previous: Session }
  | { type: 'lockPair'; previous: Session }
  | { type: 'unlockPair'; previous: Session };
```

  `Session.lastAction?: SessionAction` holds the whole previous session, which makes undo exact and is cheap at this size.

- [ ] **Step 2: Write the failing test.** Create `lib/queue/__tests__/colors.test.ts`:

```ts
import { PADDLE_COLORS, nextColorForRoster, sessionColor } from '../colors';

describe('paddle colors', () => {
  it('assigns colors in order for a new roster', () => {
    expect(nextColorForRoster([])).toBe('ochre');
    expect(nextColorForRoster([{ id: '1', name: 'A', color: 'ochre' }])).toBe('coral');
  });

  it('cycles once every color is used', () => {
    const roster = PADDLE_COLORS.map((color, i) => ({ id: String(i), name: 'P', color }));
    expect(nextColorForRoster(roster)).toBe('ochre');
  });

  it('keeps the saved color when it is free in the session', () => {
    expect(sessionColor('sky', ['ochre'])).toBe('sky');
  });

  it('picks the first unused color when the saved one is taken', () => {
    expect(sessionColor('ochre', ['ochre'])).toBe('coral');
  });

  it('falls back to the saved color when every color is taken', () => {
    expect(sessionColor('ochre', [...PADDLE_COLORS])).toBe('ochre');
  });
});
```

- [ ] **Step 3:** Run `npm test -- colors`. Expected: module not found.
- [ ] **Step 4: Implement** `lib/queue/colors.ts`:

```ts
import { PaddleColor, SavedPlayer } from '../types/queue';

export const PADDLE_COLORS: readonly PaddleColor[] = [
  'ochre', 'coral', 'paper', 'sky', 'carbon', 'lilac', 'sand', 'teal',
] as const;

export function nextColorForRoster(saved: SavedPlayer[]): PaddleColor {
  return PADDLE_COLORS[saved.length % PADDLE_COLORS.length];
}

export function sessionColor(saved: PaddleColor, taken: PaddleColor[]): PaddleColor {
  if (!taken.includes(saved)) return saved;
  return PADDLE_COLORS.find(c => !taken.includes(c)) ?? saved;
}
```

- [ ] **Step 5:** `npm test -- colors` passes. Commit: `git commit -am "feat: queue types and paddle color assignment"`

---

### Task 3: Picking the next match

**Files:**
- Create: `lib/queue/engine.ts`
- Create: `lib/queue/__tests__/pick.test.ts`
- Create: `lib/queue/__tests__/helpers.ts` (test fixtures)

**Interfaces:**
- Consumes: types from Task 2.
- Produces: `pickNextMatch(session: Session, now: number): { team1: [string, string]; team2: [string, string] } | null`, plus `pairingHistory(session: Session): { partnered: Record<string, number>; opposed: Record<string, number>; lastPartner: Record<string, string> }` where the keys are `"a|b"` with ids sorted.

- [ ] **Step 1: Test fixtures.** Create `lib/queue/__tests__/helpers.ts`:

```ts
import { Session, SessionPlayer } from '../../types/queue';

export function player(id: string, over: Partial<SessionPlayer> = {}): SessionPlayer {
  return {
    id,
    name: id.toUpperCase(),
    color: 'ochre',
    status: 'active',
    gamesPlayed: 0,
    queueCount: 0,
    waitingSince: 0,
    arrivedAt: 0,
    ...over,
  };
}

export function session(players: SessionPlayer[], over: Partial<Session> = {}): Session {
  return {
    id: 's1',
    startedAt: 0,
    courtCount: 1,
    players,
    matches: [],
    courts: [null],
    ...over,
  };
}
```

- [ ] **Step 2: Write the failing tests.** Create `lib/queue/__tests__/pick.test.ts`:

```ts
import { pickNextMatch } from '../engine';
import { player, session } from './helpers';

const ids = (m: { team1: [string, string]; team2: [string, string] } | null) =>
  m ? [...m.team1, ...m.team2].sort() : null;

describe('pickNextMatch', () => {
  it('returns null with fewer than four available players', () => {
    expect(pickNextMatch(session([player('a'), player('b'), player('c')]), 100)).toBeNull();
  });

  it('picks the four players with the fewest games', () => {
    const s = session([
      player('a', { queueCount: 0, gamesPlayed: 0 }),
      player('b', { queueCount: 0, gamesPlayed: 0 }),
      player('c', { queueCount: 0, gamesPlayed: 0 }),
      player('d', { queueCount: 0, gamesPlayed: 0 }),
      player('e', { queueCount: 3, gamesPlayed: 3 }),
      player('f', { queueCount: 3, gamesPlayed: 3 }),
    ]);
    expect(ids(pickNextMatch(s, 100))).toEqual(['a', 'b', 'c', 'd']);
  });

  it('breaks count ties by who has waited longest', () => {
    const s = session([
      player('a', { waitingSince: 10 }),
      player('b', { waitingSince: 20 }),
      player('c', { waitingSince: 30 }),
      player('d', { waitingSince: 40 }),
      player('e', { waitingSince: 90 }),
    ]);
    expect(ids(pickNextMatch(s, 100))).toEqual(['a', 'b', 'c', 'd']);
  });

  it('skips players who are sitting out or have left', () => {
    const s = session([
      player('a'), player('b'), player('c'),
      player('d', { status: 'sitting_out' }),
      player('e', { status: 'left' }),
      player('f'),
    ]);
    expect(ids(pickNextMatch(s, 100))).toEqual(['a', 'b', 'c', 'f']);
  });

  it('never picks a player who is already on a court', () => {
    const s = session(
      [player('a'), player('b'), player('c'), player('d'), player('e'), player('f'), player('g'), player('h')],
      {
        courtCount: 2,
        courts: ['m1', null],
        matches: [{ id: 'm1', courtNumber: 1, team1: ['a', 'b'], team2: ['c', 'd'], calledAt: 0 }],
      },
    );
    expect(ids(pickNextMatch(s, 100))).toEqual(['e', 'f', 'g', 'h']);
  });

  it('keeps a locked pair on the same team', () => {
    const s = session([
      player('a', { lockedWith: 'b' }),
      player('b', { lockedWith: 'a' }),
      player('c'), player('d'),
    ]);
    const m = pickNextMatch(s, 100)!;
    const together = (t: [string, string]) => t.includes('a') && t.includes('b');
    expect(together(m.team1) || together(m.team2)).toBe(true);
  });

  it('prefers partners who have not played together', () => {
    // a+b partnered twice already; with a,b,c,d available the split should avoid pairing them
    const s = session(
      [player('a'), player('b'), player('c'), player('d')],
      {
        matches: [
          { id: 'm1', courtNumber: 1, team1: ['a', 'b'], team2: ['c', 'd'], calledAt: 0, endedAt: 1 },
          { id: 'm2', courtNumber: 1, team1: ['a', 'b'], team2: ['c', 'd'], calledAt: 2, endedAt: 3 },
        ],
      },
    );
    const m = pickNextMatch(s, 100)!;
    const together = (t: [string, string]) => t.includes('a') && t.includes('b');
    expect(together(m.team1) || together(m.team2)).toBe(false);
  });

  it('is deterministic', () => {
    const s = session([player('a'), player('b'), player('c'), player('d'), player('e')]);
    expect(pickNextMatch(s, 100)).toEqual(pickNextMatch(s, 100));
  });

  it('never leaves out an available player with a lower count', () => {
    const s = session([
      player('a', { queueCount: 0 }),
      player('b', { queueCount: 1 }),
      player('c', { queueCount: 1 }),
      player('d', { queueCount: 1 }),
      player('e', { queueCount: 1 }),
    ]);
    expect(ids(pickNextMatch(s, 100))).toContain('a');
  });
});
```

- [ ] **Step 3:** `npm test -- pick`. Expected: module not found.
- [ ] **Step 4: Implement** `lib/queue/engine.ts` with the algorithm from spec §4.4:

```ts
import { Match, Session, SessionPlayer } from '../types/queue';

export interface ProposedMatch {
  team1: [string, string];
  team2: [string, string];
}

const key = (a: string, b: string) => [a, b].sort().join('|');

export function pairingHistory(session: Session) {
  const partnered: Record<string, number> = {};
  const opposed: Record<string, number> = {};
  const lastPartner: Record<string, string> = {};
  for (const m of session.matches) {
    for (const team of [m.team1, m.team2]) {
      partnered[key(team[0], team[1])] = (partnered[key(team[0], team[1])] ?? 0) + 1;
      lastPartner[team[0]] = team[1];
      lastPartner[team[1]] = team[0];
    }
    for (const a of m.team1) {
      for (const b of m.team2) {
        opposed[key(a, b)] = (opposed[key(a, b)] ?? 0) + 1;
      }
    }
  }
  return { partnered, opposed, lastPartner };
}

function playersOnCourt(session: Session): Set<string> {
  const busy = new Set<string>();
  for (const id of session.courts) {
    if (!id) continue;
    const match = session.matches.find(m => m.id === id);
    if (match && !match.endedAt) {
      [...match.team1, ...match.team2].forEach(p => busy.add(p));
    }
  }
  return busy;
}

export function availablePlayers(session: Session): SessionPlayer[] {
  const busy = playersOnCourt(session);
  return session.players.filter(p => p.status === 'active' && !busy.has(p.id));
}

/** Locked pairs count as one unit; everyone else is a single. */
function units(available: SessionPlayer[]): SessionPlayer[][] {
  const byId = new Map(available.map(p => [p.id, p]));
  const used = new Set<string>();
  const result: SessionPlayer[][] = [];
  for (const p of available) {
    if (used.has(p.id)) continue;
    const partner = p.lockedWith ? byId.get(p.lockedWith) : undefined;
    if (partner && !used.has(partner.id)) {
      used.add(p.id);
      used.add(partner.id);
      result.push([p, partner]);
    } else {
      used.add(p.id);
      result.push([p]);
    }
  }
  return result;
}

function combinations<T>(items: T[], pick: number): T[][] {
  if (pick === 0) return [[]];
  const out: T[][] = [];
  items.forEach((item, i) => {
    for (const rest of combinations(items.slice(i + 1), pick - 1)) {
      out.push([item, ...rest]);
    }
  });
  return out;
}

export function pickNextMatch(session: Session, now: number): ProposedMatch | null {
  const available = availablePlayers(session);
  if (available.length < 4) return null;

  const ordered = [...available].sort(
    (a, b) =>
      a.queueCount - b.queueCount ||
      a.waitingSince - b.waitingSince ||
      a.id.localeCompare(b.id),
  );
  const rank = new Map(ordered.map((p, i) => [p.id, i]));

  const allUnits = units(ordered).sort(
    (u, v) => Math.min(...u.map(p => rank.get(p.id)!)) - Math.min(...v.map(p => rank.get(p.id)!)),
  );
  const shortlist: SessionPlayer[][] = [];
  let count = 0;
  for (const unit of allUnits) {
    shortlist.push(unit);
    count += unit.length;
    if (count >= 8) break;
  }

  const groups = combinations(shortlist, 1)
    .concat(combinations(shortlist, 2), combinations(shortlist, 3), combinations(shortlist, 4))
    .filter(g => g.reduce((n, u) => n + u.length, 0) === 4);
  if (groups.length === 0) return null;

  const { partnered, opposed, lastPartner } = pairingHistory(session);

  type Candidate = { match: ProposedMatch; players: SessionPlayer[] };
  const candidates: Candidate[] = [];
  for (const group of groups) {
    const flat = group.flat();
    if (group.some(u => u.length === 2)) {
      const pairs = group.filter(u => u.length === 2);
      const singles = group.filter(u => u.length === 1).flat();
      if (pairs.length === 2) {
        candidates.push({
          match: {
            team1: [pairs[0][0].id, pairs[0][1].id],
            team2: [pairs[1][0].id, pairs[1][1].id],
          },
          players: flat,
        });
      } else {
        candidates.push({
          match: {
            team1: [pairs[0][0].id, pairs[0][1].id],
            team2: [singles[0].id, singles[1].id],
          },
          players: flat,
        });
      }
    } else {
      const [a, b, c, d] = flat;
      candidates.push({ match: { team1: [a.id, b.id], team2: [c.id, d.id] }, players: flat });
      candidates.push({ match: { team1: [a.id, c.id], team2: [b.id, d.id] }, players: flat });
      candidates.push({ match: { team1: [a.id, d.id], team2: [b.id, c.id] }, players: flat });
    }
  }

  // Fairness is a strict filter, not a weight.
  const total = (c: Candidate) => c.players.reduce((n, p) => n + p.queueCount, 0);
  const lowest = Math.min(...candidates.map(total));
  const fair = candidates.filter(c => total(c) === lowest);

  const cost = (c: Candidate): number => {
    let score = 30 * (c.players.reduce((n, p) => n + rank.get(p.id)!, 0) - 6);
    for (const team of [c.match.team1, c.match.team2]) {
      const k = key(team[0], team[1]);
      score += 100 * (partnered[k] ?? 0);
      if (lastPartner[team[0]] === team[1]) score += 50;
    }
    for (const a of c.match.team1) {
      for (const b of c.match.team2) {
        score += 15 * (opposed[key(a, b)] ?? 0);
      }
    }
    return score;
  };

  const tieBreak = (c: Candidate) => c.players.map(p => rank.get(p.id)!).sort((x, y) => x - y).join(',');
  return fair
    .map(c => ({ c, cost: cost(c) }))
    .sort((x, y) => x.cost - y.cost || tieBreak(x.c).localeCompare(tieBreak(y.c)))[0].c.match;
}
```

- [ ] **Step 5:** `npm test -- pick`. All 9 pass. Fix the implementation, never the expectations, if one fails.
- [ ] **Step 6:** Typecheck and lint clean. Commit: `git commit -am "feat: fair next-match picking for open play"`

---

### Task 4: Session changes and undo

**Files:**
- Modify: `lib/queue/engine.ts`
- Create: `lib/queue/__tests__/session.test.ts`

**Interfaces:**
- Produces: `createSession`, `callMatch`, `finishMatch`, `fillIdleCourts`, `addPlayer`, `setSittingOut`, `returnPlayer`, `removePlayer`, `lockPair`, `unlockPair`, `undoLast`, `setCourtCount`, `endSession`, `explainQueuePosition`.

- [ ] **Step 1: Write the failing tests.** Create `lib/queue/__tests__/session.test.ts`:

```ts
import {
  addPlayer, callMatch, endSession, explainQueuePosition,
  fillIdleCourts, finishMatch, lockPair, removePlayer, returnPlayer,
  setSittingOut, undoLast,
} from '../engine';
import { player, session } from './helpers';

describe('session changes', () => {
  it('fills every idle court in court order', () => {
    const s = fillIdleCourts(
      session(
        ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(id => player(id)),
        { courtCount: 2, courts: [null, null] },
      ),
      100,
    );
    expect(s.courts.filter(Boolean)).toHaveLength(2);
    expect(s.matches).toHaveLength(2);
    const onCourt = s.matches.flatMap(m => [...m.team1, ...m.team2]);
    expect(new Set(onCourt).size).toBe(8);
  });

  it('counts a game only when the match is finished', () => {
    let s = callMatch(session(['a', 'b', 'c', 'd'].map(id => player(id))), 1, 100);
    expect(s.players.every(p => p.gamesPlayed === 0)).toBe(true);
    s = finishMatch(s, s.matches[0].id, 500);
    expect(s.players.every(p => p.gamesPlayed === 1 && p.queueCount === 1)).toBe(true);
    expect(s.players.every(p => p.waitingSince === 500)).toBe(true);
    expect(s.courts[0]).toBeNull();
  });

  it('stores the score when a match was scored in the app', () => {
    let s = callMatch(session(['a', 'b', 'c', 'd'].map(id => player(id))), 1, 100);
    s = finishMatch(s, s.matches[0].id, 500, [11, 7]);
    expect(s.matches[0].score).toEqual([11, 7]);
  });

  it('queues a late arrival at the group level without changing games played', () => {
    const s = addPlayer(
      session([
        player('a', { queueCount: 3, gamesPlayed: 3 }),
        player('b', { queueCount: 4, gamesPlayed: 4 }),
      ]),
      { id: 'z', name: 'Zoe', color: 'sky' },
      900,
    );
    const zoe = s.players.find(p => p.id === 'z')!;
    expect(zoe.queueCount).toBe(3);
    expect(zoe.gamesPlayed).toBe(0);
    expect(zoe.waitingSince).toBe(900);
    expect(zoe.arrivedAt).toBe(900);
  });

  it('starts the first player of an empty session at zero', () => {
    const s = addPlayer(session([]), { id: 'z', name: 'Zoe', color: 'sky' }, 900);
    expect(s.players[0].queueCount).toBe(0);
  });

  it('returns a player from a break at the group level', () => {
    let s = session([
      player('a', { queueCount: 5, gamesPlayed: 5 }),
      player('b', { queueCount: 2, gamesPlayed: 2, status: 'sitting_out' }),
    ]);
    s = returnPlayer(s, 'b', 700);
    const b = s.players.find(p => p.id === 'b')!;
    expect(b.status).toBe('active');
    expect(b.queueCount).toBe(5);
    expect(b.gamesPlayed).toBe(2);
  });

  it('refuses to sit out or remove a player who is on a court', () => {
    const s = callMatch(session(['a', 'b', 'c', 'd'].map(id => player(id))), 1, 100);
    expect(() => setSittingOut(s, 'a', 200)).toThrow(/on a court/i);
    expect(() => removePlayer(s, 'a', 200)).toThrow(/on a court/i);
  });

  it('locks and unlocks a pair symmetrically', () => {
    let s = lockPair(session([player('a'), player('b')]), 'a', 'b');
    expect(s.players.map(p => p.lockedWith)).toEqual(['b', 'a']);
    s = unlockPair(s, 'a');
    expect(s.players.map(p => p.lockedWith)).toEqual([undefined, undefined]);
  });

  it('undoes the last finish exactly, including the match it triggered', () => {
    let s = fillIdleCourts(session(['a', 'b', 'c', 'd', 'e', 'f'].map(id => player(id))), 100);
    const before = s;
    const finished = finishMatch(s, s.matches[0].id, 500);
    const afterCall = fillIdleCourts(finished, 500);
    const undone = undoLast(afterCall);
    expect(undone.players).toEqual(before.players);
    expect(undone.courts).toEqual(before.courts);
    expect(undone.matches).toEqual(before.matches);
  });

  it('explains why a player is next', () => {
    const s = session([
      player('a', { queueCount: 2, gamesPlayed: 2, waitingSince: 300 }),
      player('b', { queueCount: 3, gamesPlayed: 3, waitingSince: 100 }),
    ]);
    const why = explainQueuePosition(s, 'a');
    expect(why).toEqual({
      gamesPlayed: 2,
      queueCount: 2,
      lowestQueueCount: 2,
      isAtLowestCount: true,
      waitingSince: 300,
      lastPartner: undefined,
      joinedAtGroupLevel: false,
    });
  });

  it('ends a session', () => {
    expect(endSession(session([player('a')]), 999).endedAt).toBe(999);
  });
});
```

- [ ] **Step 2:** `npm test -- session`. Expected: failures for the missing exports.
- [ ] **Step 3: Implement** the functions in `lib/queue/engine.ts`. Rules:
  - `createSession(players, courtCount, now)` builds a `Session` with `courts` of length `courtCount` filled with `null`.
  - `callMatch(session, courtNumber, now)` runs `pickNextMatch`; when it returns `null` the session is returned unchanged. Otherwise it appends a `Match` with `id = \`m${session.matches.length + 1}\`` and sets `courts[courtNumber - 1]`.
  - `finishMatch(session, matchId, now, score?)` sets `endedAt` and optional `score`, clears the court, and for the four players adds 1 to `gamesPlayed` and `queueCount` and sets `waitingSince = now`. It records `lastAction = { type: 'finishMatch', previous: sessionBeforeTheChange }`.
  - `fillIdleCourts(session, now)` calls `callMatch` for each `null` court in order, stopping when `pickNextMatch` returns `null`. It does not touch `lastAction`, so a finish plus its auto-call undo as one step.
  - `addPlayer`, `setSittingOut`, `returnPlayer`, `removePlayer`, `lockPair`, `unlockPair` each record `lastAction` the same way.
  - `addPlayer` and `returnPlayer` set `queueCount = max(own, minimum queueCount among other active players)`, using 0 when there are none.
  - `setSittingOut` and `removePlayer` throw `new Error('Player is on a court')` when the player is in an unfinished match.
  - `undoLast(session)` returns `session.lastAction.previous` when present, otherwise the session unchanged.
  - `setCourtCount(session, count)` grows `courts` with `null`s, or, when shrinking, keeps any court that still holds an unfinished match and removes the rest.
  - `endSession(session, now)` sets `endedAt`.
  - `explainQueuePosition(session, id)` returns exactly the shape asserted in the test. `joinedAtGroupLevel` is `true` when `queueCount > gamesPlayed`.
- [ ] **Step 4:** `npm test -- session` passes. Typecheck and lint clean.
- [ ] **Step 5:** Commit: `git commit -am "feat: open play session actions with single-step undo"`

---

### Task 5: Simulated sessions

**Files:**
- Create: `lib/queue/__tests__/simulation.test.ts`

- [ ] **Step 1: Write the tests.**

```ts
import { addPlayer, fillIdleCourts, finishMatch, pickNextMatch } from '../engine';
import { player, session } from './helpers';

function run(playerCount: number, courtCount: number, rounds: number) {
  let s = session(
    Array.from({ length: playerCount }, (_, i) => player(`p${i}`)),
    { courtCount, courts: Array(courtCount).fill(null) },
  );
  let now = 0;
  s = fillIdleCourts(s, now);
  for (let i = 0; i < rounds; i++) {
    const live = s.matches.find(m => !m.endedAt);
    if (!live) break;
    now += 600;
    s = finishMatch(s, live.id, now);
    s = fillIdleCourts(s, now);
  }
  return s;
}

describe('simulated sessions', () => {
  it('keeps everyone within one game when matches take the same time (one court)', () => {
    const s = run(8, 1, 20);
    const counts = s.players.map(p => p.gamesPlayed);
    expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1);
  });

  it('never picks a higher count while a lower one waits', () => {
    for (const [players, courts] of [[5, 1], [9, 2], [13, 3], [24, 6]] as const) {
      let s = session(
        Array.from({ length: players }, (_, i) => player(`p${i}`)),
        { courtCount: courts, courts: Array(courts).fill(null) },
      );
      let now = 0;
      s = fillIdleCourts(s, now);
      for (let i = 0; i < 30; i++) {
        const live = s.matches.find(m => !m.endedAt);
        if (!live) break;
        now += 600;
        s = finishMatch(s, live.id, now);
        const proposal = pickNextMatch(s, now);
        if (proposal) {
          const chosen = [...proposal.team1, ...proposal.team2];
          const chosenMax = Math.max(...chosen.map(id => s.players.find(p => p.id === id)!.queueCount));
          const leftOut = s.players
            .filter(p => p.status === 'active' && !chosen.includes(p.id))
            .filter(p => !s.matches.some(m => !m.endedAt && [...m.team1, ...m.team2].includes(p.id)));
          for (const p of leftOut) {
            expect(p.queueCount).toBeGreaterThanOrEqual(chosenMax);
          }
        }
        s = fillIdleCourts(s, now);
      }
    }
  });

  it('repeats partners less often than ignoring history would', () => {
    const s = run(8, 1, 20);
    const counts: Record<string, number> = {};
    for (const m of s.matches) {
      for (const t of [m.team1, m.team2]) {
        const k = [...t].sort().join('|');
        counts[k] = (counts[k] ?? 0) + 1;
      }
    }
    const repeats = Object.values(counts).filter(n => n > 1).length;
    const distinctPairs = Object.keys(counts).length;
    expect(distinctPairs).toBeGreaterThanOrEqual(10);
    expect(repeats).toBeLessThan(distinctPairs);
  });

  it('gives a late arrival the same rate as everyone else from arrival', () => {
    let s = run(8, 1, 8);
    const now = 10_000;
    s = addPlayer(s, { id: 'late', name: 'Late', color: 'sky' }, now);
    const before = s.players.find(p => p.id === 'late')!.queueCount;
    let t = now;
    for (let i = 0; i < 8; i++) {
      const live = s.matches.find(m => !m.endedAt);
      if (!live) break;
      t += 600;
      s = finishMatch(s, live.id, t);
      s = fillIdleCourts(s, t);
    }
    const late = s.players.find(p => p.id === 'late')!;
    const others = s.players.filter(p => p.id !== 'late');
    expect(late.queueCount).toBeGreaterThan(before);
    const spread = Math.max(...others.map(p => p.queueCount)) - late.queueCount;
    expect(Math.abs(spread)).toBeLessThanOrEqual(1);
  });
});
```

- [ ] **Step 2:** `npm test -- simulation`. If a property fails, fix the engine, not the property, unless the property contradicts spec §4.4; then stop and report.
- [ ] **Step 3:** Commit: `git commit -am "test: simulated open play sessions for fairness and rotation"`

---

### Task 6: Persisted session store

**Files:**
- Create: `store/session-store.ts`
- Create: `store/__tests__/session-store.test.ts`

**Interfaces:**
- Produces: `useSessionStore` with state `{ savedPlayers, savedGroups, activeSession, openPlayHistory, defaultCourtCount }` and actions `startSession(playerIds, courtCount)`, `addSavedPlayer(name)`, `renameSavedPlayer(id, name)`, `deleteSavedPlayer(id)`, `saveGroup(name, playerIds)`, `deleteGroup(id)`, `matchDone(matchId, score?)`, `scoreMatch(matchId)`, `addToSession(name)`, `sitOut(id)`, `comeBack(id)`, `removeFromSession(id)`, `lock(a, b)`, `unlock(a)`, `setCourts(n)`, `undo()`, `finishSession()`.

- [ ] **Step 1: Write the failing test.** Create `store/__tests__/session-store.test.ts`:

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSessionStore } from '../session-store';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

describe('session store', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    useSessionStore.setState({
      savedPlayers: [], savedGroups: [], activeSession: null,
      openPlayHistory: [], defaultCourtCount: 2,
    });
  });

  it('saves new players with distinct colors', () => {
    const { addSavedPlayer } = useSessionStore.getState();
    addSavedPlayer('Ana');
    addSavedPlayer('Bea');
    const saved = useSessionStore.getState().savedPlayers;
    expect(saved.map(p => p.name)).toEqual(['Ana', 'Bea']);
    expect(saved[0].color).not.toBe(saved[1].color);
  });

  it('starts a session and fills the courts', () => {
    const s = useSessionStore.getState();
    ['a', 'b', 'c', 'd', 'e'].forEach(n => s.addSavedPlayer(n));
    const ids = useSessionStore.getState().savedPlayers.map(p => p.id);
    useSessionStore.getState().startSession(ids, 1);
    const session = useSessionStore.getState().activeSession!;
    expect(session.players).toHaveLength(5);
    expect(session.matches).toHaveLength(1);
  });

  it('finishes a match, counts it, and calls the next one', () => {
    const s = useSessionStore.getState();
    ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].forEach(n => s.addSavedPlayer(n));
    const ids = useSessionStore.getState().savedPlayers.map(p => p.id);
    useSessionStore.getState().startSession(ids, 1);
    const first = useSessionStore.getState().activeSession!.matches[0];
    useSessionStore.getState().matchDone(first.id, [11, 7]);
    const after = useSessionStore.getState().activeSession!;
    expect(after.matches[0].score).toEqual([11, 7]);
    expect(after.matches).toHaveLength(2);
    expect(after.players.filter(p => p.gamesPlayed === 1)).toHaveLength(4);
  });

  it('moves a finished session into history', () => {
    const s = useSessionStore.getState();
    ['a', 'b', 'c', 'd'].forEach(n => s.addSavedPlayer(n));
    const ids = useSessionStore.getState().savedPlayers.map(p => p.id);
    useSessionStore.getState().startSession(ids, 1);
    useSessionStore.getState().finishSession();
    expect(useSessionStore.getState().activeSession).toBeNull();
    expect(useSessionStore.getState().openPlayHistory).toHaveLength(1);
  });

  it('writes the session to storage so it survives a restart', async () => {
    const s = useSessionStore.getState();
    ['a', 'b', 'c', 'd'].forEach(n => s.addSavedPlayer(n));
    const ids = useSessionStore.getState().savedPlayers.map(p => p.id);
    useSessionStore.getState().startSession(ids, 1);
    await new Promise(r => setTimeout(r, 0));
    const raw = await AsyncStorage.getItem('@pickleball_open_play');
    expect(raw).toContain('"activeSession"');
  });
});
```

- [ ] **Step 2:** `npm test -- session-store`. Expected: module not found.
- [ ] **Step 3: Implement** `store/session-store.ts`: a Zustand store created with `persist(..., { name: '@pickleball_open_play', storage: createJSONStorage(() => AsyncStorage) })`. Every action delegates to the engine, passes `Date.now()` as `now`, and calls `fillIdleCourts` after `matchDone`, `addToSession`, `comeBack`, `setCourts` and `startSession`. `addSavedPlayer` uses `nextColorForRoster`; `startSession` uses `sessionColor` to keep session colors distinct. `finishSession` calls `endSession`, unshifts it into `openPlayHistory` (capped at 50) and sets `activeSession` to `null`.
- [ ] **Step 4:** `npm test` (everything), typecheck, lint. All clean.
- [ ] **Step 5:** Commit: `git commit -am "feat: persisted open play session store"`

---

### Task 7: Phase report

- [ ] **Step 1:** Run the full suite once more and note the test count.
- [ ] **Step 2:** Report to the user: tests added, rules covered, anything that surprised you, and confirm Phase 3 (design tokens and components) is next.
