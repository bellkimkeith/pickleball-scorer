/**
 * The maths behind the quick score on Match done: the organizer taps who won
 * and the losing team's points, and the winner's points follow from the
 * scoring settings.
 */

export interface QuickScoreRules {
  winningScore: number;
  winByTwo: boolean;
}

export function suggestedWinnerPoints(loserPoints: number, rules: QuickScoreRules): number {
  return Math.max(rules.winningScore, loserPoints + (rules.winByTwo ? 2 : 1));
}

/** The score as the session stores it: team 1's points first. */
export function scoreInTeamOrder(
  winner: 1 | 2,
  winnerPoints: number,
  loserPoints: number,
): [number, number] {
  return winner === 1 ? [winnerPoints, loserPoints] : [loserPoints, winnerPoints];
}

export function canSaveScore(winnerPoints: number, loserPoints: number): boolean {
  return winnerPoints > loserPoints;
}
