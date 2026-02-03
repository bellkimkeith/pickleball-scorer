import { GameState, GameSettings, ServingSide, ServerNumber, Player, Team, ScoreEvent, SinglesGameState, DoublesGameState } from '../types/game';

export class ScoringRules {
  /**
   * Determines the serving side based on the serving team's score
   *
   * NOTE: This method is primarily used for singles mode.
   * In doubles, serving sides alternate when scoring rather than being calculated from score.
   *
   * In singles:
   * - Even score = right side
   * - Odd score = left side
   */
  static getServingSide(servingTeamScore: number, serverNumber: ServerNumber = 1): ServingSide {
    const isEven = servingTeamScore % 2 === 0;
    if (serverNumber === 1) {
      return isEven ? 'right' : 'left';
    } else {
      return isEven ? 'left' : 'right';
    }
  }

  /**
   * Handles point scored by serving team
   * Updates score, checks for side change, maintains server
   */
  static scorePoint(
    gameState: GameState,
    settings: GameSettings
  ): GameState {
    if (gameState.mode === 'singles') {
      // Singles: explicitly create new state to ensure proper updates
      const newScore1 = gameState.servingPlayer === 1 ? gameState.score1 + 1 : gameState.score1;
      const newScore2 = gameState.servingPlayer === 2 ? gameState.score2 + 1 : gameState.score2;
      const servingTeamScore = gameState.servingPlayer === 1 ? newScore1 : newScore2;

      const scoreEvent: ScoreEvent = {
        timestamp: Date.now(),
        servingTeam: gameState.servingPlayer,
        serverNumber: undefined,
        score1: newScore1,
        score2: newScore2,
        pointScored: true,
        rallyWinner: gameState.servingPlayer,
      };

      const newState: SinglesGameState = {
        ...gameState,
        score1: newScore1,
        score2: newScore2,
        servingSide: this.getServingSide(servingTeamScore),
        scoreHistory: [...gameState.scoreHistory, scoreEvent],
      };

      return newState;
    } else {
      // Doubles: explicitly create new state to ensure proper updates
      const newScore1 = gameState.servingTeam === 1 ? gameState.score1 + 1 : gameState.score1;
      const newScore2 = gameState.servingTeam === 2 ? gameState.score2 + 1 : gameState.score2;
      const servingTeamScore = gameState.servingTeam === 1 ? newScore1 : newScore2;

      const scoreEvent: ScoreEvent = {
        timestamp: Date.now(),
        servingTeam: gameState.servingTeam,
        serverNumber: gameState.serverNumber,
        score1: newScore1,
        score2: newScore2,
        pointScored: true,
        rallyWinner: gameState.servingTeam,
      };

      const newState: DoublesGameState = {
        ...gameState,
        score1: newScore1,
        score2: newScore2,
        servingSide: gameState.servingSide === 'right' ? 'left' : 'right',  // Alternate sides when scoring
        scoreHistory: [...gameState.scoreHistory, scoreEvent],
      };

      return newState;
    }
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
          servingSide: gameState.servingSide === 'right' ? 'left' : 'right',  // Server 2 serves from opposite side
          scoreHistory: [...gameState.scoreHistory, scoreEvent],
        };
        return newState;
      } else {
        // Switch to other team, server #1
        // Per pickleball rules: new possession ALWAYS starts with Server 1 on the RIGHT
        const newServingTeam = gameState.servingTeam === 1 ? 2 : 1;

        const newState: DoublesGameState = {
          ...gameState,
          servingTeam: newServingTeam,
          serverNumber: 1,
          servingSide: 'right',  // Fixed: new possession always starts right
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
