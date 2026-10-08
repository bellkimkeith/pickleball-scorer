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
