import {
  addPlayer,
  callMatch,
  endSession,
  explainQueuePosition,
  fillIdleCourts,
  finishMatch,
  lockPair,
  removePlayer,
  returnPlayer,
  setSittingOut,
  undoLast,
  unlockPair,
} from '../engine';
import { player, session } from './helpers';

describe('session changes', () => {
  it('fills every idle court in court order', () => {
    const s = fillIdleCourts(
      session(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(id => player(id)), {
        courtCount: 2,
        courts: [null, null],
      }),
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
    const before = fillIdleCourts(
      session(['a', 'b', 'c', 'd', 'e', 'f'].map(id => player(id))),
      100,
    );
    const finished = finishMatch(before, before.matches[0].id, 500);
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
    expect(explainQueuePosition(s, 'a')).toEqual({
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
