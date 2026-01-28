import { GameState, GameSettings, ServingSide, Player, Team, ScoreEvent, SinglesGameState, DoublesGameState } from '../types/game';

export class ScoringRules {
  /**
   * Determines the serving side based on the serving team's score
   * In pickleball:
   * - Even score = serve from right side
   * - Odd score = serve from left side
   */
  static getServingSide(servingTeamScore: number): ServingSide {
    return servingTeamScore % 2 === 0 ? 'right' : 'left';
  }

  /**
   * Handles point scored by serving team
   * Updates score, checks for side change, maintains server
   */
  static scorePoint(
    gameState: GameState,
    settings: GameSettings
  ): GameState {
    const newState = { ...gameState };

    // Update score based on who is serving
    if (gameState.mode === 'singles') {
      if (gameState.servingPlayer === 1) {
        newState.score1 = gameState.score1 + 1;
      } else {
        newState.score2 = gameState.score2 + 1;
      }
    } else {
      // Doubles
      if (gameState.servingTeam === 1) {
        newState.score1 = gameState.score1 + 1;
      } else {
        newState.score2 = gameState.score2 + 1;
      }
    }

    // Update serving side based on new score
    const servingTeamScore = gameState.mode === 'singles'
      ? (gameState.servingPlayer === 1 ? newState.score1 : newState.score2)
      : (gameState.servingTeam === 1 ? newState.score1 : newState.score2);

    newState.servingSide = this.getServingSide(servingTeamScore);

    // Add to history
    const scoreEvent: ScoreEvent = {
      timestamp: Date.now(),
      servingTeam: gameState.mode === 'singles' ? gameState.servingPlayer : gameState.servingTeam,
      serverNumber: gameState.mode === 'doubles' ? gameState.serverNumber : undefined,
      score1: newState.score1,
      score2: newState.score2,
      pointScored: true,
      rallyWinner: gameState.mode === 'singles' ? gameState.servingPlayer : gameState.servingTeam,
    };

    newState.scoreHistory = [...gameState.scoreHistory, scoreEvent];

    return newState;
  }

  /**
   * Handles side-out (serving team loses rally)
   * In doubles: switch to partner or other team
   * In singles: switch to other player
   */
  static handleSideOut(gameState: GameState): GameState {
    if (gameState.mode === 'singles') {
      const newServingPlayer = gameState.servingPlayer === 1 ? 2 : 1;
      const newServingScore = newServingPlayer === 1 ? gameState.score1 : gameState.score2;

      const scoreEvent: ScoreEvent = {
        timestamp: Date.now(),
        servingTeam: gameState.servingPlayer,
        serverNumber: undefined,
        score1: gameState.score1,
        score2: gameState.score2,
        pointScored: false,
        rallyWinner: gameState.servingPlayer === 1 ? 2 : 1,
      };

      const newState: SinglesGameState = {
        ...gameState,
        servingPlayer: newServingPlayer,
        servingSide: this.getServingSide(newServingScore),
        scoreHistory: [...gameState.scoreHistory, scoreEvent],
      };

      return newState;
    } else {
      const scoreEvent: ScoreEvent = {
        timestamp: Date.now(),
        servingTeam: gameState.servingTeam,
        serverNumber: gameState.serverNumber,
        score1: gameState.score1,
        score2: gameState.score2,
        pointScored: false,
        rallyWinner: gameState.servingTeam === 1 ? 2 : 1,
      };

      if (gameState.serverNumber === 1) {
        // Switch to partner (server #2)
        const newState: DoublesGameState = {
          ...gameState,
          serverNumber: 2,
          servingSide: this.getServingSide(
            gameState.servingTeam === 1 ? gameState.score1 : gameState.score2
          ),
          scoreHistory: [...gameState.scoreHistory, scoreEvent],
        };
        return newState;
      } else {
        // Switch to other team, server #1
        const newServingTeam = gameState.servingTeam === 1 ? 2 : 1;
        const newServingScore = newServingTeam === 1 ? gameState.score1 : gameState.score2;

        const newState: DoublesGameState = {
          ...gameState,
          servingTeam: newServingTeam,
          serverNumber: 1,
          servingSide: this.getServingSide(newServingScore),
          scoreHistory: [...gameState.scoreHistory, scoreEvent],
        };
        return newState;
      }
    }
  }

  /**
   * Checks if the game is over
   */
  static isGameOver(
    score1: number,
    score2: number,
    settings: GameSettings
  ): boolean {
    const { winningScore, winByTwo } = settings;
    const maxScore = Math.max(score1, score2);
    const scoreDiff = Math.abs(score1 - score2);

    if (maxScore < winningScore) return false;
    if (!winByTwo) return maxScore >= winningScore;
    return maxScore >= winningScore && scoreDiff >= 2;
  }

  /**
   * Gets the current server (for display purposes)
   */
  static getCurrentServer(gameState: GameState): Player {
    if (gameState.mode === 'singles') {
      return gameState.servingPlayer === 1 ? gameState.player1 : gameState.player2;
    } else {
      // In doubles, get the current server based on server number
      const servingTeam = gameState.servingTeam === 1 ? gameState.team1 : gameState.team2;
      return servingTeam.players[gameState.serverNumber - 1];
    }
  }

  /**
   * Gets the winning team/player (if game is over)
   */
  static getWinner(gameState: GameState): Player | Team | null {
    if (gameState.mode === 'singles') {
      if (gameState.score1 > gameState.score2) {
        return gameState.player1;
      } else if (gameState.score2 > gameState.score1) {
        return gameState.player2;
      }
    } else {
      if (gameState.score1 > gameState.score2) {
        return gameState.team1;
      } else if (gameState.score2 > gameState.score1) {
        return gameState.team2;
      }
    }
    return null;
  }
}
