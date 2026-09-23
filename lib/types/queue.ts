export type PaddleColor =
  | 'ochre'
  | 'coral'
  | 'paper'
  | 'sky'
  | 'carbon'
  | 'lilac'
  | 'sand'
  | 'teal'
  | 'rose'
  | 'plum'
  | 'moss'
  | 'ice';

export interface SavedPlayer {
  id: string;
  name: string;
  color: PaddleColor;
}

export interface SavedGroup {
  id: string;
  name: string;
  playerIds: string[];
}

export type PlayerStatus = 'active' | 'sitting_out' | 'left';

export interface SessionPlayer {
  id: string;
  name: string;
  /** Session colour; may differ from the saved colour when that one is taken. */
  color: PaddleColor;
  status: PlayerStatus;
  /** Real games finished. This is what players see. */
  gamesPlayed: number;
  /** Priority count used for picking. Raised on arrival or return. */
  queueCount: number;
  /** Last match end, arrival, or return. */
  waitingSince: number;
  arrivedAt: number;
  /** Partner id when locked into a fixed pair (always symmetric). */
  lockedWith?: string;
}

export interface Match {
  id: string;
  courtNumber: number;
  team1: [string, string];
  team2: [string, string];
  calledAt: number;
  endedAt?: number;
  /** Only set when the match was scored in the app. */
  score?: [number, number];
}

export type SessionActionType =
  | 'finishMatch'
  | 'addPlayer'
  | 'removePlayer'
  | 'sitOut'
  | 'returnPlayer'
  | 'lockPair'
  | 'unlockPair';

export interface SessionAction {
  type: SessionActionType;
  /** The whole session before the action, so undo is exact. */
  previous: Session;
}

export interface Session {
  id: string;
  startedAt: number;
  endedAt?: number;
  /** 1..6 */
  courtCount: number;
  players: SessionPlayer[];
  /** Called and finished matches, in call order. */
  matches: Match[];
  /** Match id on each court, or null when the court is free. */
  courts: (string | null)[];
  lastAction?: SessionAction;
}
