import { Session, SessionPlayer } from '../types/queue';

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
