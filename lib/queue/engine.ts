import {
  Match,
  SavedPlayer,
  Session,
  SessionActionType,
  SessionPlayer,
} from '../types/queue';

export interface ProposedMatch {
  team1: [string, string];
  team2: [string, string];
}

/** Stable key for an unordered pair of player ids. */
const key = (a: string, b: string) => [a, b].sort().join('|');

export interface PairingHistory {
  partnered: Record<string, number>;
  opposed: Record<string, number>;
  lastPartner: Record<string, string>;
}

export function pairingHistory(session: Session): PairingHistory {
  const partnered: Record<string, number> = {};
  const opposed: Record<string, number> = {};
  const lastPartner: Record<string, string> = {};

  for (const match of session.matches) {
    for (const team of [match.team1, match.team2]) {
      const k = key(team[0], team[1]);
      partnered[k] = (partnered[k] ?? 0) + 1;
      lastPartner[team[0]] = team[1];
      lastPartner[team[1]] = team[0];
    }
    for (const a of match.team1) {
      for (const b of match.team2) {
        const k = key(a, b);
        opposed[k] = (opposed[k] ?? 0) + 1;
      }
    }
  }

  return { partnered, opposed, lastPartner };
}

function playersOnCourt(session: Session): Set<string> {
  const busy = new Set<string>();
  for (const matchId of session.courts) {
    if (!matchId) continue;
    const match = session.matches.find(m => m.id === matchId);
    if (match && !match.endedAt) {
      [...match.team1, ...match.team2].forEach(id => busy.add(id));
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

interface Candidate {
  match: ProposedMatch;
  players: SessionPlayer[];
}

export function pickNextMatch(session: Session, _now: number): ProposedMatch | null {
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
    (u, v) =>
      Math.min(...u.map(p => rank.get(p.id)!)) - Math.min(...v.map(p => rank.get(p.id)!)),
  );

  const shortlist: SessionPlayer[][] = [];
  let count = 0;
  for (const unit of allUnits) {
    shortlist.push(unit);
    count += unit.length;
    if (count >= 8) break;
  }

  const groups = [1, 2, 3, 4]
    .flatMap(size => combinations(shortlist, size))
    .filter(group => group.reduce((n, unit) => n + unit.length, 0) === 4);
  if (groups.length === 0) return null;

  const { partnered, opposed, lastPartner } = pairingHistory(session);

  const candidates: Candidate[] = [];
  for (const group of groups) {
    const flat = group.flat();
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
    } else if (pairs.length === 1) {
      candidates.push({
        match: {
          team1: [pairs[0][0].id, pairs[0][1].id],
          team2: [singles[0].id, singles[1].id],
        },
        players: flat,
      });
    } else {
      const [a, b, c, d] = flat;
      candidates.push({ match: { team1: [a.id, b.id], team2: [c.id, d.id] }, players: flat });
      candidates.push({ match: { team1: [a.id, c.id], team2: [b.id, d.id] }, players: flat });
      candidates.push({ match: { team1: [a.id, d.id], team2: [b.id, c.id] }, players: flat });
    }
  }

  // Fairness is a strict filter, never a weight: no amount of partner
  // history can put a player with more games ahead of one with fewer.
  const totalCount = (c: Candidate) => c.players.reduce((n, p) => n + p.queueCount, 0);
  const lowest = Math.min(...candidates.map(totalCount));
  const fair = candidates.filter(c => totalCount(c) === lowest);

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

  const tieBreak = (c: Candidate) =>
    c.players
      .map(p => rank.get(p.id)!)
      .sort((x, y) => x - y)
      .join(',');

  return fair
    .map(c => ({ candidate: c, cost: cost(c) }))
    .sort((x, y) => x.cost - y.cost || tieBreak(x.candidate).localeCompare(tieBreak(y.candidate)))[0]
    .candidate.match;
}

// ---------------------------------------------------------------------------
// Session changes
// ---------------------------------------------------------------------------

function withUndo(previous: Session, next: Session, type: SessionActionType): Session {
  return { ...next, lastAction: { type, previous } };
}

/** Lowest queue count among active players, ignoring one player. */
function groupLevel(session: Session, exceptId?: string): number {
  const counts = session.players
    .filter(p => p.status === 'active' && p.id !== exceptId)
    .map(p => p.queueCount);
  return counts.length > 0 ? Math.min(...counts) : 0;
}

function isOnCourt(session: Session, playerId: string): boolean {
  return session.matches.some(
    m => !m.endedAt && [...m.team1, ...m.team2].includes(playerId),
  );
}

export function createSession(
  players: SessionPlayer[],
  courtCount: number,
  now: number,
): Session {
  return {
    id: `s${now}`,
    startedAt: now,
    courtCount,
    players,
    matches: [],
    courts: Array.from({ length: courtCount }, () => null),
  };
}

/** Call the next match onto a free court. Does nothing when nobody can play. */
export function callMatch(session: Session, courtNumber: number, now: number): Session {
  if (session.courts[courtNumber - 1]) return session;
  const proposal = pickNextMatch(session, now);
  if (!proposal) return session;

  const match: Match = {
    id: `m${session.matches.length + 1}`,
    courtNumber,
    team1: proposal.team1,
    team2: proposal.team2,
    calledAt: now,
  };
  const courts = [...session.courts];
  courts[courtNumber - 1] = match.id;
  return { ...session, matches: [...session.matches, match], courts };
}

/** Call matches onto every free court, in court order. */
export function fillIdleCourts(session: Session, now: number): Session {
  let next = session;
  for (let court = 1; court <= next.courtCount; court++) {
    if (next.courts[court - 1]) continue;
    const called = callMatch(next, court, now);
    if (called === next) break; // nobody available; later courts cannot fill either
    next = called;
  }
  return next;
}

export function finishMatch(
  session: Session,
  matchId: string,
  now: number,
  score?: [number, number],
): Session {
  const match = session.matches.find(m => m.id === matchId);
  if (!match || match.endedAt) return session;

  const playing = new Set([...match.team1, ...match.team2]);
  const matches = session.matches.map(m =>
    m.id === matchId ? { ...m, endedAt: now, ...(score ? { score } : {}) } : m,
  );
  const courts = session.courts.map(id => (id === matchId ? null : id));
  const players = session.players.map(p =>
    playing.has(p.id)
      ? {
          ...p,
          gamesPlayed: p.gamesPlayed + 1,
          queueCount: p.queueCount + 1,
          waitingSince: now,
        }
      : p,
  );

  return withUndo(session, { ...session, matches, courts, players }, 'finishMatch');
}

export function addPlayer(session: Session, saved: SavedPlayer, now: number): Session {
  if (session.players.some(p => p.id === saved.id)) return session;

  const newPlayer: SessionPlayer = {
    id: saved.id,
    name: saved.name,
    color: saved.color,
    status: 'active',
    gamesPlayed: 0,
    queueCount: groupLevel(session),
    waitingSince: now,
    arrivedAt: now,
  };

  return withUndo(
    session,
    { ...session, players: [...session.players, newPlayer] },
    'addPlayer',
  );
}

export function setSittingOut(session: Session, playerId: string, _now: number): Session {
  if (isOnCourt(session, playerId)) {
    throw new Error('Player is on a court');
  }
  const players = session.players.map(p =>
    p.id === playerId ? { ...p, status: 'sitting_out' as const } : p,
  );
  return withUndo(session, { ...session, players }, 'sitOut');
}

export function returnPlayer(session: Session, playerId: string, now: number): Session {
  const level = groupLevel(session, playerId);
  const players = session.players.map(p =>
    p.id === playerId
      ? {
          ...p,
          status: 'active' as const,
          queueCount: Math.max(p.queueCount, level),
          waitingSince: now,
        }
      : p,
  );
  return withUndo(session, { ...session, players }, 'returnPlayer');
}

export function removePlayer(session: Session, playerId: string, _now: number): Session {
  if (isOnCourt(session, playerId)) {
    throw new Error('Player is on a court');
  }
  const players = session.players.map(p =>
    p.id === playerId
      ? { ...p, status: 'left' as const, lockedWith: undefined }
      : p.lockedWith === playerId
        ? { ...p, lockedWith: undefined }
        : p,
  );
  return withUndo(session, { ...session, players }, 'removePlayer');
}

export function lockPair(session: Session, a: string, b: string): Session {
  const players = session.players.map(p =>
    p.id === a ? { ...p, lockedWith: b } : p.id === b ? { ...p, lockedWith: a } : p,
  );
  return withUndo(session, { ...session, players }, 'lockPair');
}

export function unlockPair(session: Session, playerId: string): Session {
  const partnerId = session.players.find(p => p.id === playerId)?.lockedWith;
  const players = session.players.map(p =>
    p.id === playerId || p.id === partnerId ? { ...p, lockedWith: undefined } : p,
  );
  return withUndo(session, { ...session, players }, 'unlockPair');
}

/** Undo the most recent action, including any match it auto-called. */
export function undoLast(session: Session): Session {
  return session.lastAction ? session.lastAction.previous : session;
}

export function canUndo(session: Session): boolean {
  return session.lastAction !== undefined;
}

/** Courts still holding an unfinished match are kept until that match ends. */
export function setCourtCount(session: Session, count: number): Session {
  if (count >= session.courts.length) {
    const courts = [...session.courts];
    while (courts.length < count) courts.push(null);
    return { ...session, courtCount: count, courts };
  }
  const kept: (string | null)[] = [];
  session.courts.forEach((matchId, index) => {
    const busy = matchId
      ? session.matches.some(m => m.id === matchId && !m.endedAt)
      : false;
    if (index < count || busy) kept.push(matchId);
  });
  return { ...session, courtCount: count, courts: kept };
}

export function endSession(session: Session, now: number): Session {
  return { ...session, endedAt: now };
}

export interface QueueExplanation {
  gamesPlayed: number;
  queueCount: number;
  lowestQueueCount: number;
  isAtLowestCount: boolean;
  waitingSince: number;
  lastPartner: string | undefined;
  joinedAtGroupLevel: boolean;
}

export function explainQueuePosition(
  session: Session,
  playerId: string,
): QueueExplanation | null {
  const player = session.players.find(p => p.id === playerId);
  if (!player) return null;

  const active = session.players.filter(p => p.status === 'active');
  const lowest = active.length > 0 ? Math.min(...active.map(p => p.queueCount)) : 0;

  return {
    gamesPlayed: player.gamesPlayed,
    queueCount: player.queueCount,
    lowestQueueCount: lowest,
    isAtLowestCount: player.queueCount === lowest,
    waitingSince: player.waitingSince,
    lastPartner: pairingHistory(session).lastPartner[playerId],
    joinedAtGroupLevel: player.queueCount > player.gamesPlayed,
  };
}
