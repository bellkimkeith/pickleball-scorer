import { GameSettings } from '../types/game';

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  winningScore: 11,
  winByTwo: true,
  sideChangeAt: 6,
};

export const AVAILABLE_WINNING_SCORES = [11, 15, 21] as const;
