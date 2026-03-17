export type GameMode = 'singles' | 'doubles';

export type ServingSide = 'left' | 'right';

export type ServerNumber = 1 | 2; // For doubles only

export interface Player {
  id: string;
  name: string;
}

export interface Team {
  id: string;
  name: string;
  players: [Player, Player];
}

export interface SinglesGameState {
  mode: 'singles';
  player1: Player;
  player2: Player;
  score1: number;
  score2: number;
  servingPlayer: 1 | 2;
  servingSide: ServingSide;
  sidesChanged: boolean;
  scoresSwapped: boolean;
  gameStartTime: number;
  gameEndTime?: number;
  scoreHistory: ScoreEvent[];
}

export interface DoublesGameState {
  mode: 'doubles';
  team1: Team;
  team2: Team;
  score1: number;
  score2: number;
  servingTeam: 1 | 2;
  serverNumber: ServerNumber;
  servingSide: ServingSide;
  sidesChanged: boolean;
  scoresSwapped: boolean;
  gameStartTime: number;
  gameEndTime?: number;
  scoreHistory: ScoreEvent[];
}

export type GameState = SinglesGameState | DoublesGameState;

export interface ScoreEvent {
  timestamp: number;
  servingTeam: 1 | 2;
  serverNumber?: ServerNumber;
  servingSide?: ServingSide;
  score1: number;
  score2: number;
  pointScored: boolean;
  rallyWinner?: 1 | 2;
  scoresSwapped: boolean;
  sidesChanged?: boolean;
}

export type GameType = 'sideout' | 'rally';

export type ThemeMode = 'light' | 'dark';

export interface GameSettings {
  winningScore: 11 | 15 | 21;
  winByTwo: boolean;
  sideChangeAt: number;
  swapScoresOnSideChange: boolean;
  gameType: GameType;
  theme: ThemeMode;
}
