import { Match, Session } from '../../types/queue';
import { bestDuos, DUO_MIN_GAMES, pairResults } from '../duos';
import { pairKey } from '../engine';
import { player, session } from './helpers';

let nextId = 0;
function scored(team1: [string, string], team2: [string, string], score: [number, number]): Match {
  nextId += 1;
  return { id: `m${nextId}`, courtNumber: 1, team1, team2, calledAt: 0, endedAt: 10, score };
}

const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
function night(id: string, matches: Match[], names: Record<string, string> = {}): Session {
  return session(
    ids.map(p => player(p, names[p] ? { name: names[p] } : {})),
    { id, matches },
  );
}

describe('pairKey', () => {
  it('is order-independent', () => {
    expect(pairKey('b', 'a')).toBe(pairKey('a', 'b'));
  });
});

describe('pairResults', () => {
  it('adds up a pair across sessions', () => {
    const results = pairResults([
      night('s1', [scored(['a', 'b'], ['c', 'd'], [11, 7])]),
      night('s2', [scored(['c', 'd'], ['b', 'a'], [11, 8])]),
    ]);
    expect(results[pairKey('a', 'b')]).toEqual({ wins: 1, losses: 1, plusMinus: 1, games: 2 });
    expect(results[pairKey('c', 'd')]).toEqual({ wins: 1, losses: 1, plusMinus: -1, games: 2 });
  });

  it('counts an equal score as a game, not a win or loss', () => {
    const results = pairResults([night('s1', [scored(['a', 'b'], ['c', 'd'], [9, 9])])]);
    expect(results[pairKey('a', 'b')]).toEqual({ wins: 0, losses: 0, plusMinus: 0, games: 1 });
  });

  it('ignores unscored and unfinished matches', () => {
    const s = night('s1', [
      { id: 'x', courtNumber: 1, team1: ['a', 'b'], team2: ['c', 'd'], calledAt: 0, endedAt: 5 },
      { id: 'y', courtNumber: 1, team1: ['a', 'b'], team2: ['c', 'd'], calledAt: 0 },
    ]);
    expect(pairResults([s])).toEqual({});
  });
});

describe('bestDuos', () => {
  it(`leaves out pairs under ${DUO_MIN_GAMES} scored games together`, () => {
    const two = [night('s1', [scored(['a', 'b'], ['c', 'd'], [11, 7]), scored(['a', 'b'], ['e', 'f'], [11, 7])])];
    expect(bestDuos(two, [])).toEqual([]);

    const three = [
      night('s2', [scored(['a', 'b'], ['g', 'h'], [11, 2])]),
      ...two,
    ];
    const duos = bestDuos(three, []);
    expect(duos).toHaveLength(1);
    expect(duos[0]).toMatchObject({ ids: ['a', 'b'], wins: 3, losses: 0, games: 3, plusMinus: 17, winRate: 1 });
  });

  it('orders by win rate, then wins, then +/-, then games', () => {
    const matches = [
      // a+b: 3–1 (75%).
      scored(['a', 'b'], ['g', 'h'], [11, 9]),
      scored(['a', 'b'], ['g', 'h'], [11, 9]),
      scored(['a', 'b'], ['g', 'h'], [11, 9]),
      scored(['a', 'b'], ['g', 'h'], [9, 11]),
      // c+d: 3–0, +3 (100%).
      scored(['c', 'd'], ['g', 'h'], [11, 10]),
      scored(['c', 'd'], ['g', 'h'], [11, 10]),
      scored(['c', 'd'], ['g', 'h'], [11, 10]),
      // e+f: 3–0, +30 (100%, better +/-).
      scored(['e', 'f'], ['g', 'h'], [11, 1]),
      scored(['e', 'f'], ['g', 'h'], [11, 1]),
      scored(['e', 'f'], ['g', 'h'], [11, 1]),
    ];
    const order = bestDuos([night('s1', matches)], []).map(d => d.ids.join('+'));
    expect(order.slice(0, 3)).toEqual(['e+f', 'c+d', 'a+b']);
  });

  it('prefers more wins at an equal win rate', () => {
    const matches = [
      ...Array.from({ length: 4 }, () => scored(['a', 'b'], ['g', 'h'], [11, 9])),
      ...Array.from({ length: 3 }, () => scored(['c', 'd'], ['g', 'h'], [11, 9])),
    ];
    const order = bestDuos([night('s1', matches)], []).map(d => d.ids.join('+'));
    expect(order.slice(0, 2)).toEqual(['a+b', 'c+d']);
  });

  it('returns at most 5 by default', () => {
    const pairs: [string, string][] = [['a', 'b'], ['a', 'c'], ['a', 'd'], ['b', 'c'], ['b', 'd'], ['c', 'd']];
    const matches = pairs.flatMap(pair => Array.from({ length: 3 }, () => scored(pair, ['g', 'h'], [11, 5])));
    // g+h also qualify, so there are 7 pairs in all.
    expect(bestDuos([night('s1', matches)], [])).toHaveLength(5);
    expect(bestDuos([night('s1', matches)], [], 10)).toHaveLength(7);
  });

  it("uses the current saved name, falling back to the newest session's name", () => {
    const matches = Array.from({ length: 3 }, () => scored(['a', 'b'], ['g', 'h'], [11, 5]));
    const newest = night('s2', [], { b: 'Bea' });
    const oldest = night('s1', matches, { a: 'Old A', b: 'Old B' });
    const [duo] = bestDuos([newest, oldest], [{ id: 'a', name: 'Ana', color: 'sky' }]);
    expect(duo.names).toEqual(['Ana', 'Bea']);
  });
});
