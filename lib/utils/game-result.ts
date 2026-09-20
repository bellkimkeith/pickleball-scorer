import { GameState } from '../types/game';

export interface GameResult {
  score1: number;
  score2: number;
  winner: 1 | 2;
}

/**
 * Scores are stored in display order, so after a "swap scores" side change
 * score1 belongs to player 2. This returns them in player order.
 */
export function getGameResult(game: GameState): GameResult {
  const swapped = game.scoresSwapped === true;
  const score1 = swapped ? game.score2 : game.score1;
  const score2 = swapped ? game.score1 : game.score2;
  return { score1, score2, winner: score1 > score2 ? 1 : 2 };
}
