import { canSaveScore, scoreInTeamOrder, suggestedWinnerPoints } from '../quick-score';

describe('suggestedWinnerPoints', () => {
  const to11 = { winningScore: 11, winByTwo: true };

  it('is the winning score for an ordinary loss', () => {
    expect(suggestedWinnerPoints(7, to11)).toBe(11);
    expect(suggestedWinnerPoints(0, to11)).toBe(11);
  });

  it('goes past the winning score to win by 2', () => {
    expect(suggestedWinnerPoints(10, to11)).toBe(12);
    expect(suggestedWinnerPoints(11, to11)).toBe(13);
  });

  it('needs only one more point when win by 2 is off', () => {
    expect(suggestedWinnerPoints(10, { winningScore: 11, winByTwo: false })).toBe(11);
  });

  it('follows games to 15 and 21', () => {
    expect(suggestedWinnerPoints(13, { winningScore: 15, winByTwo: true })).toBe(15);
    expect(suggestedWinnerPoints(14, { winningScore: 15, winByTwo: true })).toBe(16);
    expect(suggestedWinnerPoints(19, { winningScore: 21, winByTwo: true })).toBe(21);
  });
});

describe('scoreInTeamOrder', () => {
  it('puts team 1 first whoever won', () => {
    expect(scoreInTeamOrder(2, 11, 7)).toEqual([7, 11]);
    expect(scoreInTeamOrder(1, 12, 10)).toEqual([12, 10]);
  });
});

describe('canSaveScore', () => {
  it('needs the winner ahead', () => {
    expect(canSaveScore(11, 7)).toBe(true);
    expect(canSaveScore(11, 11)).toBe(false);
    expect(canSaveScore(7, 11)).toBe(false);
    expect(canSaveScore(0, 0)).toBe(false);
  });
});
