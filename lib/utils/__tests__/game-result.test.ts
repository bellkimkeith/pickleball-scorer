import { getGameResult } from '../game-result';
import { SinglesGameState } from '../../types/game';

function singles(score1: number, score2: number, scoresSwapped: boolean): SinglesGameState {
  return {
    mode: 'singles',
    player1: { id: '1', name: 'Ana' },
    player2: { id: '2', name: 'Bea' },
    score1,
    score2,
    servingPlayer: 1,
    servingSide: 'right',
    sidesChanged: scoresSwapped,
    scoresSwapped,
    gameStartTime: 0,
    scoreHistory: [],
  };
}

describe('getGameResult', () => {
  it('reads scores directly when sides were never swapped', () => {
    expect(getGameResult(singles(11, 7, false))).toEqual({ score1: 11, score2: 7, winner: 1 });
  });

  it('unswaps the scores after a side change', () => {
    // display shows 0 - 11, but player 1 actually won 11 - 0
    expect(getGameResult(singles(0, 11, true))).toEqual({ score1: 11, score2: 0, winner: 1 });
  });

  it('names player 2 the winner when player 2 leads', () => {
    expect(getGameResult(singles(11, 4, true))).toEqual({ score1: 4, score2: 11, winner: 2 });
  });
});
