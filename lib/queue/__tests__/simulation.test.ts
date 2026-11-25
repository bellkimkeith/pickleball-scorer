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
    for (const [players, courts] of [
      [5, 1],
      [9, 2],
      [13, 3],
      [24, 6],
    ] as const) {
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
          const chosenMax = Math.max(
            ...chosen.map(id => s.players.find(p => p.id === id)!.queueCount),
          );
          const leftOut = s.players
            .filter(p => p.status === 'active' && !chosen.includes(p.id))
            .filter(
              p =>
                !s.matches.some(
                  m => !m.endedAt && [...m.team1, ...m.team2].includes(p.id),
                ),
            );
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
