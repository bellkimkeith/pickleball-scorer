import { Match } from '../../types/queue';
import {
  formatPlusMinus,
  sessionStandings,
  shareRows,
  standingsLeaders,
  standingsText,
} from '../standings';
import { player, session } from './helpers';

let nextId = 0;
function match(
  team1: [string, string],
  team2: [string, string],
  score?: [number, number],
  ended = true,
): Match {
  nextId += 1;
  return {
    id: `m${nextId}`,
    courtNumber: 1,
    team1,
    team2,
    calledAt: 0,
    ...(ended ? { endedAt: 10 } : {}),
    ...(score ? { score } : {}),
  };
}

const ids = (rows: { playerId: string }[]) => rows.map(r => r.playerId);
const four = () => ['a', 'b', 'c', 'd'].map(id => player(id, { gamesPlayed: 1 }));

describe('sessionStandings', () => {
  it("credits both partners with the team's result and points", () => {
    const { rows } = sessionStandings(session(four(), { matches: [match(['a', 'b'], ['c', 'd'], [11, 7])] }));
    const a = rows.find(r => r.playerId === 'a')!;
    const c = rows.find(r => r.playerId === 'c')!;
    expect(a).toMatchObject({ wins: 1, losses: 0, pointsFor: 11, pointsAgainst: 7, plusMinus: 4, scoredGames: 1 });
    expect(rows.find(r => r.playerId === 'b')).toMatchObject({ wins: 1, plusMinus: 4 });
    expect(c).toMatchObject({ wins: 0, losses: 1, pointsFor: 7, pointsAgainst: 11, plusMinus: -4 });
  });

  it('reads score[0] as team1 even when team2 won', () => {
    const { rows } = sessionStandings(session(four(), { matches: [match(['a', 'b'], ['c', 'd'], [5, 11])] }));
    expect(rows.find(r => r.playerId === 'c')).toMatchObject({ wins: 1, losses: 0, plusMinus: 6 });
    expect(rows.find(r => r.playerId === 'd')).toMatchObject({ wins: 1, losses: 0 });
    expect(rows.find(r => r.playerId === 'a')).toMatchObject({ wins: 0, losses: 1, plusMinus: -6 });
  });

  it('ignores matches on court and matches finished without a score', () => {
    const players = ['a', 'b', 'c', 'd'].map(id => player(id, { gamesPlayed: 2 }));
    const result = sessionStandings(
      session(players, {
        matches: [
          match(['a', 'b'], ['c', 'd'], [11, 7]),
          match(['a', 'c'], ['b', 'd']),
          match(['a', 'd'], ['b', 'c'], undefined, false),
        ],
      }),
    );
    expect(result.scoredGames).toBe(1);
    expect(result.finishedGames).toBe(2);
    const a = result.rows.find(r => r.playerId === 'a')!;
    expect(a).toMatchObject({ wins: 1, losses: 0, scoredGames: 1, gamesPlayed: 2 });
  });

  it('orders by wins, then fewer losses, then +/-, then points scored, then name', () => {
    // w: 2 wins. x and y: 1 win, 0 losses; x has the better +/-.
    // z and v: 1 win, 1 loss, same +/-; z scored more points.
    // u and t tie on everything, so their names decide.
    const players = ['w', 'x', 'y', 'z', 'v', 'u', 't', 'o', 'p', 'q', 'r'].map(id => player(id));
    const matches = [
      match(['w', 'o'], ['p', 'q'], [11, 0]),
      match(['w', 'r'], ['p', 'q'], [11, 0]),
      match(['x', 'o'], ['p', 'q'], [11, 1]),
      match(['y', 'r'], ['p', 'q'], [11, 9]),
      match(['z', 'o'], ['p', 'q'], [20, 18]),
      match(['z', 'r'], ['p', 'q'], [10, 12]),
      match(['v', 'o'], ['p', 'q'], [11, 9]),
      match(['v', 'r'], ['p', 'q'], [9, 11]),
      match(['u', 't'], ['p', 'q'], [11, 5]),
      match(['u', 't'], ['p', 'q'], [5, 11]),
    ];
    const ranked = sessionStandings(session(players, { matches })).rows;
    const order = ids(ranked).filter(id => ['w', 'x', 'y', 'z', 'v', 'u', 't'].includes(id));
    expect(order).toEqual(['w', 'x', 'y', 'z', 'v', 't', 'u']);
  });

  it('ranks a late arrival at 1–0 below a player at 6–1', () => {
    const players = ['a', 'b', 'c', 'd', 'late'].map(id => player(id));
    const matches = [
      ...Array.from({ length: 6 }, () => match(['a', 'b'], ['c', 'd'], [11, 3])),
      match(['c', 'd'], ['a', 'b'], [11, 3]),
      match(['late', 'c'], ['b', 'd'], [11, 9]),
    ];
    const rows = sessionStandings(session(players, { matches })).rows;
    const rankOf = (id: string) => rows.find(r => r.playerId === id)!.rank!;
    expect(rankOf('a')).toBeLessThan(rankOf('late'));
  });

  it('shares a rank on a full tie', () => {
    const players = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(id => player(id));
    const matches = [
      match(['a', 'e'], ['g', 'h'], [11, 2]),
      match(['b', 'f'], ['g', 'h'], [11, 5]),
      match(['c', 'd'], ['g', 'h'], [11, 5]),
    ];
    const rows = sessionStandings(session(players, { matches })).rows;
    const top = rows.filter(r => ['a', 'b', 'c', 'e'].includes(r.playerId) || r.playerId === 'd' || r.playerId === 'f');
    expect(top.map(r => r.rank)).toEqual([1, 1, 3, 3, 3, 3]);
    expect(rows.find(r => r.playerId === 'g')!.rank).toBe(7);
  });

  it('gives ranks 1, 2, 2, 4 when the middle two tie', () => {
    const players = ['a', 'b', 'c', 'd', 'x', 'y'].map(id => player(id));
    const matches = [
      match(['a', 'x'], ['y', 'd'], [11, 0]),
      match(['b', 'c'], ['x', 'd'], [11, 6]),
    ];
    const rows = sessionStandings(session(players, { matches })).rows;
    const pick = ['a', 'b', 'c', 'x'].map(id => rows.find(r => r.playerId === id)!.rank);
    // a: 1–0 +11. b and c: 1–0 +5, tied. x: 1–1, next.
    expect(pick).toEqual([1, 2, 2, 4]);
  });

  it('lists players without scored games last with rank null', () => {
    const players = [...four(), player('e', { gamesPlayed: 1 })];
    const rows = sessionStandings(session(players, { matches: [match(['a', 'b'], ['c', 'd'], [11, 7])] })).rows;
    expect(rows[rows.length - 1]).toMatchObject({ playerId: 'e', rank: null, wins: 0, losses: 0, gamesPlayed: 1 });
    expect(rows.slice(0, 4).every(r => r.rank !== null)).toBe(true);
  });

  it('keeps the results of a player who left', () => {
    const players = [player('a', { status: 'left' }), player('b'), player('c'), player('d')];
    const rows = sessionStandings(session(players, { matches: [match(['a', 'b'], ['c', 'd'], [11, 7])] })).rows;
    expect(rows.find(r => r.playerId === 'a')).toMatchObject({ wins: 1, rank: 1 });
  });

  it('counts an equal score toward games but as neither win nor loss', () => {
    const { rows } = sessionStandings(session(four(), { matches: [match(['a', 'b'], ['c', 'd'], [9, 9])] }));
    expect(rows.find(r => r.playerId === 'a')).toMatchObject({ wins: 0, losses: 0, scoredGames: 1, plusMinus: 0 });
  });
});

describe('standingsLeaders', () => {
  it('returns every rank-1 row', () => {
    const standings = sessionStandings(session(four(), { matches: [match(['a', 'b'], ['c', 'd'], [11, 7])] }));
    expect(ids(standingsLeaders(standings)).sort()).toEqual(['a', 'b']);
  });

  it('returns nobody when nothing is scored', () => {
    expect(standingsLeaders(sessionStandings(session(four())))).toEqual([]);
  });
});

describe('formatPlusMinus', () => {
  it('signs positive, uses a true minus for negative, and leaves zero bare', () => {
    expect(formatPlusMinus(12)).toBe('+12');
    expect(formatPlusMinus(-3)).toBe('−3');
    expect(formatPlusMinus(0)).toBe('0');
  });
});

describe('shareRows', () => {
  it('caps at 16 ranked rows and counts the rest', () => {
    const players = Array.from({ length: 22 }, (_, i) => player(`p${i}`));
    const matches = Array.from({ length: 5 }, (_, i) =>
      match([`p${i * 4}`, `p${i * 4 + 1}`], [`p${i * 4 + 2}`, `p${i * 4 + 3}`], [11, i]),
    );
    const standings = sessionStandings(session(players, { matches }));
    // 20 players have a scored game, 2 do not.
    const { rows, more } = shareRows(standings);
    expect(rows).toHaveLength(16);
    expect(more).toBe(4);
    expect(rows.every(r => r.rank !== null)).toBe(true);
  });

  it('shows everyone ranked when there are 16 or fewer', () => {
    const standings = sessionStandings(session(four(), { matches: [match(['a', 'b'], ['c', 'd'], [11, 7])] }));
    expect(shareRows(standings)).toEqual({ rows: standings.rows, more: 0 });
  });
});

describe('standingsText', () => {
  it('lists the ranked players between a heading and a footer', () => {
    const players = [...four(), player('e')];
    const standings = sessionStandings(
      session(players, { matches: [match(['a', 'b'], ['c', 'd'], [11, 3]), match(['a', 'b'], ['c', 'd'], [11, 3])] }),
    );
    expect(standingsText(standings, 'Open Play standings', 'Pickleball Scorer')).toBe(
      [
        'Open Play standings',
        '1. A 2–0 +16',
        '1. B 2–0 +16',
        '3. C 0–2 −16',
        '3. D 0–2 −16',
        '',
        'Pickleball Scorer',
      ].join('\n'),
    );
  });
});
