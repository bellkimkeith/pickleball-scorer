import { Match, PaddleColor, Session } from '../types/queue';

/**
 * Open Play results, worked out from the scores the session already stores.
 * Nothing here is saved: standings are recalculated whenever a screen needs
 * them, so Undo and past sessions need no extra care. Results never reach
 * the queue engine; who plays next stays a matter of fairness only.
 */

export interface StandingRow {
  playerId: string;
  name: string;
  color: PaddleColor;
  /** 1-based and shared on a full tie; null when the player has no scored games. */
  rank: number | null;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  plusMinus: number;
  scoredGames: number;
  /** Every finished game, scored or not: the fairness number. */
  gamesPlayed: number;
}

export interface Standings {
  rows: StandingRow[];
  /** Finished matches that carry a score. */
  scoredGames: number;
  /** All finished matches. */
  finishedGames: number;
}

export type ScoredMatch = Match & { score: [number, number]; endedAt: number };

export const SHARE_ROW_LIMIT = 16;

export function scoredMatches(session: Session): ScoredMatch[] {
  return session.matches.filter(
    (m): m is ScoredMatch => m.endedAt !== undefined && m.score !== undefined,
  );
}

/** Two rows that tie on every ranking key share a rank. */
function sameRecord(a: StandingRow, b: StandingRow): boolean {
  return (
    a.wins === b.wins &&
    a.losses === b.losses &&
    a.plusMinus === b.plusMinus &&
    a.pointsFor === b.pointsFor
  );
}

function byRecord(a: StandingRow, b: StandingRow): number {
  return (
    b.wins - a.wins ||
    a.losses - b.losses ||
    b.plusMinus - a.plusMinus ||
    b.pointsFor - a.pointsFor ||
    a.name.localeCompare(b.name)
  );
}

export function sessionStandings(session: Session): Standings {
  const rows = new Map<string, StandingRow>(
    session.players.map(p => [
      p.id,
      {
        playerId: p.id,
        name: p.name,
        color: p.color,
        rank: null,
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        plusMinus: 0,
        scoredGames: 0,
        gamesPlayed: p.gamesPlayed,
      },
    ]),
  );

  const scored = scoredMatches(session);
  for (const match of scored) {
    const [points1, points2] = match.score;
    const sides: [string[], number, number][] = [
      [match.team1, points1, points2],
      [match.team2, points2, points1],
    ];
    for (const [team, scoredPoints, conceded] of sides) {
      for (const id of team) {
        const row = rows.get(id);
        if (!row) continue;
        row.scoredGames += 1;
        row.pointsFor += scoredPoints;
        row.pointsAgainst += conceded;
        row.plusMinus += scoredPoints - conceded;
        if (scoredPoints > conceded) row.wins += 1;
        else if (scoredPoints < conceded) row.losses += 1;
      }
    }
  }

  const all = [...rows.values()];
  const ranked = all.filter(r => r.scoredGames > 0).sort(byRecord);
  ranked.forEach((row, index) => {
    const previous = ranked[index - 1];
    row.rank = previous && sameRecord(previous, row) ? previous.rank : index + 1;
  });
  const unranked = all
    .filter(r => r.scoredGames === 0)
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    rows: [...ranked, ...unranked],
    scoredGames: scored.length,
    finishedGames: session.matches.filter(m => m.endedAt !== undefined).length,
  };
}

export function standingsLeaders(standings: Standings): StandingRow[] {
  return standings.rows.filter(r => r.rank === 1);
}

export function formatPlusMinus(value: number): string {
  if (value > 0) return `+${value}`;
  if (value < 0) return `−${Math.abs(value)}`;
  return '0';
}

export function formatRecord(row: Pick<StandingRow, 'wins' | 'losses'>): string {
  return `${row.wins}–${row.losses}`;
}

/** The ranked rows that fit on the share image, and how many were left off. */
export function shareRows(
  standings: Standings,
  max: number = SHARE_ROW_LIMIT,
): { rows: StandingRow[]; more: number } {
  const ranked = standings.rows.filter(r => r.rank !== null);
  return { rows: ranked.slice(0, max), more: Math.max(0, ranked.length - max) };
}

/** Plain-text standings, for sharing when an image can't be made. */
export function standingsText(standings: Standings, heading: string, footer: string): string {
  const lines = standings.rows
    .filter(r => r.rank !== null)
    .map(r => `${r.rank}. ${r.name} ${formatRecord(r)} ${formatPlusMinus(r.plusMinus)}`);
  return [heading, ...lines, '', footer].join('\n');
}
