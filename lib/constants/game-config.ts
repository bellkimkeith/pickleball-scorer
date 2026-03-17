import { GameSettings } from '../types/game';

export const AVAILABLE_WINNING_SCORES = [11, 15, 21] as const;

/**
 * Calculates the default side change score based on the winning score.
 * Standard pickleball tournament rules:
 * - 11-point game: change at 6
 * - 15-point game: change at 8
 * - 21-point game: change at 11
 */
export function getDefaultSideChangeAt(winningScore: number): number {
  switch (winningScore) {
    case 11:
      return 6;
    case 15:
      return 8;
    case 21:
      return 11;
    default:
      return Math.floor(winningScore / 2);
  }
}

/**
 * Gets available side change options for a given winning score.
 * Returns options like [0, 6] for 11-point games,
 * [0, 8] for 15-point games, [0, 11] for 21-point games.
 */
export function getAvailableSideChangeOptions(winningScore: number): number[] {
  const sideChangeScore = getDefaultSideChangeAt(winningScore);
  return [0, sideChangeScore];
}

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  winningScore: 11,
  winByTwo: true,
  sideChangeAt: getDefaultSideChangeAt(11),
  swapScoresOnSideChange: true,
  gameType: 'sideout',
};
