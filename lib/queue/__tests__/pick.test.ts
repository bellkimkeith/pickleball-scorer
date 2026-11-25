import { pickNextMatch, ProposedMatch } from '../engine';
import { player, session } from './helpers';

const ids = (m: ProposedMatch | null) => (m ? [...m.team1, ...m.team2].sort() : null);

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
      player('a'),
      player('b'),
      player('c'),
      player('d', { status: 'sitting_out' }),
      player('e', { status: 'left' }),
      player('f'),
    ]);
    expect(ids(pickNextMatch(s, 100))).toEqual(['a', 'b', 'c', 'f']);
  });

  it('never picks a player who is already on a court', () => {
    const s = session(
      ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(id => player(id)),
      {
        courtCount: 2,
        courts: ['m1', null],
        matches: [
          { id: 'm1', courtNumber: 1, team1: ['a', 'b'], team2: ['c', 'd'], calledAt: 0 },
        ],
      },
    );
    expect(ids(pickNextMatch(s, 100))).toEqual(['e', 'f', 'g', 'h']);
  });

  it('keeps a locked pair on the same team', () => {
    const s = session([
      player('a', { lockedWith: 'b' }),
      player('b', { lockedWith: 'a' }),
      player('c'),
      player('d'),
    ]);
    const m = pickNextMatch(s, 100)!;
    const together = (t: [string, string]) => t.includes('a') && t.includes('b');
    expect(together(m.team1) || together(m.team2)).toBe(true);
  });

  it('prefers partners who have not played together', () => {
    const s = session(['a', 'b', 'c', 'd'].map(id => player(id)), {
      matches: [
        { id: 'm1', courtNumber: 1, team1: ['a', 'b'], team2: ['c', 'd'], calledAt: 0, endedAt: 1 },
        { id: 'm2', courtNumber: 1, team1: ['a', 'b'], team2: ['c', 'd'], calledAt: 2, endedAt: 3 },
      ],
    });
    const m = pickNextMatch(s, 100)!;
    const together = (t: [string, string]) => t.includes('a') && t.includes('b');
    expect(together(m.team1) || together(m.team2)).toBe(false);
  });

  it('is deterministic', () => {
    const s = session(['a', 'b', 'c', 'd', 'e'].map(id => player(id)));
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
