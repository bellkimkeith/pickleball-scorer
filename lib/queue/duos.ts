import { SavedPlayer, Session } from '../types/queue';
import { pairKey } from './engine';
import { scoredMatches } from './standings';

/**
 * Partner records. The queue avoids repeat partners on purpose, so within one
 * night most pairs play together once; a pair's record only means something
 * once it spans several sessions, hence the minimum number of games.
 */

export const DUO_MIN_GAMES = 3;
export const DUO_LIMIT = 5;

export interface PairResult {
  wins: number;
  losses: number;
  plusMinus: number;
  games: number;
}

export interface DuoRecord {
  ids: [string, string];
  names: [string, string];
  wins: number;
  losses: number;
  plusMinus: number;
  games: number;
  /** 0..1 */
  winRate: number;
}

/** Scored results of every partner pair, keyed by `pairKey`. */
export function pairResults(sessions: Session[]): Record<string, PairResult> {
  const results: Record<string, PairResult> = {};
  for (const session of sessions) {
    for (const match of scoredMatches(session)) {
      const [points1, points2] = match.score;
      const sides: [[string, string], number, number][] = [
        [match.team1, points1, points2],
        [match.team2, points2, points1],
      ];
      for (const [team, scored, conceded] of sides) {
        const k = pairKey(team[0], team[1]);
        const result = (results[k] ??= { wins: 0, losses: 0, plusMinus: 0, games: 0 });
        result.games += 1;
        result.plusMinus += scored - conceded;
        if (scored > conceded) result.wins += 1;
        else if (scored < conceded) result.losses += 1;
      }
    }
  }
  return results;
}

/**
 * The best partner pairs across sessions. `sessions` must be newest first, so
 * a player who is no longer saved shows the name they last played under.
 */
export function bestDuos(
  sessions: Session[],
  savedPlayers: SavedPlayer[],
  limit: number = DUO_LIMIT,
  minGames: number = DUO_MIN_GAMES,
): DuoRecord[] {
  const nameOf = (id: string): string => {
    const saved = savedPlayers.find(p => p.id === id);
    if (saved) return saved.name;
    for (const session of sessions) {
      const player = session.players.find(p => p.id === id);
      if (player) return player.name;
    }
    return id;
  };

  return Object.entries(pairResults(sessions))
    .filter(([, result]) => result.games >= minGames)
    .map(([k, result]): DuoRecord => {
      const [a, b] = k.split('|') as [string, string];
      return {
        ids: [a, b],
        names: [nameOf(a), nameOf(b)],
        ...result,
        winRate: result.wins / result.games,
      };
    })
    .sort(
      (x, y) =>
        y.winRate - x.winRate ||
        y.wins - x.wins ||
        y.plusMinus - x.plusMinus ||
        y.games - x.games ||
        x.names.join(' ').localeCompare(y.names.join(' ')),
    )
    .slice(0, limit);
}
