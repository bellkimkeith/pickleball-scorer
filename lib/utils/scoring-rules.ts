import { GameState, GameSettings, ServingSide, ServerNumber, Player, Team, ScoreEvent, SinglesGameState, DoublesGameState } from '../types/game';

interface ServerResult {
  server: 1 | 2;
  serverNumber?: ServerNumber;
  servingSide: ServingSide;
}

interface ScoreResult {
  score1: number;
  score2: number;
}

interface ScoringBehavior {
  canScore: (scoringTeam: 1 | 2, gameState: GameState) => boolean;
  incrementScore: (gameState: GameState, scoringTeam: 1 | 2, scoresSwapped: boolean) => ScoreResult;
  getNextServer: (gameState: GameState, scoringTeam: 1 | 2, newScores: ScoreResult) => ServerResult;
}

const SIDE_OUT_BEHAVIOR: ScoringBehavior = {
  canScore: (scoringTeam, gameState) => {
    const servingTeam = gameState.mode === 'singles' ? gameState.servingPlayer : gameState.servingTeam;
    return scoringTeam === servingTeam;
  },
  incrementScore: (gameState, scoringTeam, scoresSwapped) => {
    if (scoresSwapped) {
      return {
        score1: scoringTeam === 2 ? gameState.score1 + 1 : gameState.score1,
        score2: scoringTeam === 1 ? gameState.score2 + 1 : gameState.score2,
      };
    }
    return {
      score1: scoringTeam === 1 ? gameState.score1 + 1 : gameState.score1,
      score2: scoringTeam === 2 ? gameState.score2 + 1 : gameState.score2,
    };
  },
  getNextServer: (gameState, scoringTeam, newScores) => {
    if (gameState.mode === 'singles') {
      let servingScore: number;
      if (gameState.scoresSwapped) {
        servingScore = gameState.servingPlayer === 1 ? newScores.score2 : newScores.score1;
      } else {
        servingScore = gameState.servingPlayer === 1 ? newScores.score1 : newScores.score2;
      }
      return {
        server: gameState.servingPlayer,
        servingSide: ScoringRules.getServingSide(servingScore),
      };
    } else {
      let servingTeamScore: number;
      if (gameState.scoresSwapped) {
        servingTeamScore = gameState.servingTeam === 1 ? newScores.score2 : newScores.score1;
      } else {
        servingTeamScore = gameState.servingTeam === 1 ? newScores.score1 : newScores.score2;
      }
      return {
        server: gameState.servingTeam,
        serverNumber: gameState.serverNumber,
        servingSide: ScoringRules.getServingSide(servingTeamScore, gameState.serverNumber),
      };
    }
  },
};

const RALLY_BEHAVIOR: ScoringBehavior = {
  canScore: () => true,
  incrementScore: (gameState, scoringTeam, scoresSwapped) => {
    if (scoresSwapped) {
      return {
        score1: scoringTeam === 2 ? gameState.score1 + 1 : gameState.score1,
        score2: scoringTeam === 1 ? gameState.score2 + 1 : gameState.score2,
      };
    }
    return {
      score1: scoringTeam === 1 ? gameState.score1 + 1 : gameState.score1,
      score2: scoringTeam === 2 ? gameState.score2 + 1 : gameState.score2,
    };
  },
  getNextServer: (gameState, scoringTeam, newScores) => {
    const actualScoringTeam = scoringTeam;
    
    if (gameState.mode === 'singles') {
      const servingPlayer = gameState.servingPlayer;
      // Determine which score is the serving team's score based on scoresSwapped
      // Use the NEW scores after the point was scored
      let servingTeamScore: number;
      if (gameState.scoresSwapped) {
        servingTeamScore = actualScoringTeam === 1 ? newScores.score2 : newScores.score1;
      } else {
        servingTeamScore = actualScoringTeam === 1 ? newScores.score1 : newScores.score2;
      }
      
      if (actualScoringTeam !== servingPlayer) {
        return { server: actualScoringTeam, servingSide: 'right' };
      }
      return {
        server: servingPlayer,
        servingSide: ScoringRules.getServingSide(servingTeamScore),
      };
    } else {
      const servingTeam = gameState.servingTeam;
      // Determine which score is the serving team's score based on scoresSwapped
      // Use the NEW scores after the point was scored
      let servingTeamScore: number;
      if (gameState.scoresSwapped) {
        servingTeamScore = actualScoringTeam === 1 ? newScores.score2 : newScores.score1;
      } else {
        servingTeamScore = actualScoringTeam === 1 ? newScores.score1 : newScores.score2;
      }
      
      if (actualScoringTeam !== servingTeam) {
        return { server: actualScoringTeam, serverNumber: 1, servingSide: 'right' };
      }
      return {
        server: servingTeam,
        serverNumber: gameState.serverNumber === 1 ? 2 : 1,
        servingSide: ScoringRules.getServingSide(servingTeamScore, gameState.serverNumber),
      };
    }
  },
};

export class ScoringRules {
  static getServingSide(servingTeamScore: number, serverNumber: ServerNumber = 1): ServingSide {
    const isEven = servingTeamScore % 2 === 0;
    if (serverNumber === 1) {
      return isEven ? 'right' : 'left';
    } else {
      return isEven ? 'left' : 'right';
    }
  }

  static scorePoint(
    gameState: GameState,
    settings: GameSettings,
    scoringTeam?: 1 | 2
  ): GameState {
    const team = scoringTeam ?? (gameState.mode === 'singles' ? gameState.servingPlayer : gameState.servingTeam);
    const behavior = settings.gameType === 'sideout' ? SIDE_OUT_BEHAVIOR : RALLY_BEHAVIOR;

    if (!behavior.canScore(team, gameState)) {
      return this.handleSideOut(gameState);
    }

    if (gameState.mode === 'singles') {
      return this.scorePointSingles(gameState, behavior, team);
    } else {
      return this.scorePointDoubles(gameState, behavior, team);
    }
  }

  private static scorePointSingles(
    gameState: SinglesGameState,
    behavior: ScoringBehavior,
    team: 1 | 2
  ): SinglesGameState {
    const newScores = behavior.incrementScore(gameState, team, gameState.scoresSwapped);
    const serverResult = behavior.getNextServer(gameState, team, newScores);

    const scoreEvent: ScoreEvent = {
      timestamp: Date.now(),
      servingTeam: serverResult.server,
      serverNumber: undefined,
      score1: newScores.score1,
      score2: newScores.score2,
      pointScored: true,
      rallyWinner: team,
      scoresSwapped: gameState.scoresSwapped,
    };

    return {
      ...gameState,
      servingPlayer: serverResult.server,
      score1: newScores.score1,
      score2: newScores.score2,
      servingSide: serverResult.servingSide,
      scoresSwapped: gameState.scoresSwapped,
      scoreHistory: [...gameState.scoreHistory, scoreEvent],
    };
  }

  private static scorePointDoubles(
    gameState: DoublesGameState,
    behavior: ScoringBehavior,
    team: 1 | 2
  ): DoublesGameState {
    const newScores = behavior.incrementScore(gameState, team, gameState.scoresSwapped);
    const serverResult = behavior.getNextServer(gameState, team, newScores);

    const scoreEvent: ScoreEvent = {
      timestamp: Date.now(),
      servingTeam: serverResult.server,
      serverNumber: serverResult.serverNumber,
      score1: newScores.score1,
      score2: newScores.score2,
      pointScored: true,
      rallyWinner: team,
      scoresSwapped: gameState.scoresSwapped,
    };

    return {
      ...gameState,
      servingTeam: serverResult.server,
      serverNumber: serverResult.serverNumber!,
      score1: newScores.score1,
      score2: newScores.score2,
      servingSide: serverResult.servingSide,
      scoresSwapped: gameState.scoresSwapped,
      scoreHistory: [...gameState.scoreHistory, scoreEvent],
    };
  }

  static handleSideOut(gameState: GameState): GameState {
    if (gameState.mode === 'singles') {
      const newServingPlayer = gameState.servingPlayer === 1 ? 2 : 1;
      let newServingScore: number;
      if (gameState.scoresSwapped) {
        // score1 = player2's score, score2 = player1's score
        newServingScore = newServingPlayer === 1 ? gameState.score2 : gameState.score1;
      } else {
        newServingScore = newServingPlayer === 1 ? gameState.score1 : gameState.score2;
      }

      const scoreEvent: ScoreEvent = {
        timestamp: Date.now(),
        servingTeam: gameState.servingPlayer,
        serverNumber: undefined,
        score1: gameState.score1,
        score2: gameState.score2,
        pointScored: false,
        rallyWinner: gameState.servingPlayer === 1 ? 2 : 1,
        scoresSwapped: gameState.scoresSwapped,
      };

      return {
        ...gameState,
        servingPlayer: newServingPlayer,
        servingSide: this.getServingSide(newServingScore),
        scoreHistory: [...gameState.scoreHistory, scoreEvent],
      };
    } else {
      const scoreEvent: ScoreEvent = {
        timestamp: Date.now(),
        servingTeam: gameState.servingTeam,
        serverNumber: gameState.serverNumber,
        score1: gameState.score1,
        score2: gameState.score2,
        pointScored: false,
        rallyWinner: gameState.servingTeam === 1 ? 2 : 1,
        scoresSwapped: gameState.scoresSwapped,
      };

      if (gameState.serverNumber === 1) {
        return {
          ...gameState,
          serverNumber: 2,
          servingSide: gameState.servingSide === 'right' ? 'left' : 'right',
          scoreHistory: [...gameState.scoreHistory, scoreEvent],
        };
      } else {
        const newServingTeam = gameState.servingTeam === 1 ? 2 : 1;
        return {
          ...gameState,
          servingTeam: newServingTeam,
          serverNumber: 1,
          servingSide: 'right',
          scoreHistory: [...gameState.scoreHistory, scoreEvent],
        };
      }
    }
  }

  static isGameOver(score1: number, score2: number, settings: GameSettings): boolean {
    const { winningScore, winByTwo } = settings;
    const maxScore = Math.max(score1, score2);
    const scoreDiff = Math.abs(score1 - score2);

    if (maxScore < winningScore) return false;
    if (!winByTwo) return maxScore >= winningScore;
    return maxScore >= winningScore && scoreDiff >= 2;
  }

  static getCurrentServer(gameState: GameState): Player {
    if (gameState.mode === 'singles') {
      return gameState.servingPlayer === 1 ? gameState.player1 : gameState.player2;
    } else {
      const servingTeam = gameState.servingTeam === 1 ? gameState.team1 : gameState.team2;
      return servingTeam.players[gameState.serverNumber - 1];
    }
  }

  static shouldChangeSides(
    score1: number,
    score2: number,
    settings: GameSettings,
    sidesAlreadyChanged: boolean
  ): boolean {
    if (settings.sideChangeAt === 0) return false;
    if (sidesAlreadyChanged) return false;
    return score1 >= settings.sideChangeAt || score2 >= settings.sideChangeAt;
  }

  static getWinner(gameState: GameState): Player | Team | null {
    const scoresSwapped = gameState.scoresSwapped || false;

    if (gameState.mode === 'singles') {
      if (scoresSwapped) {
        if (gameState.score1 > gameState.score2) {
          return gameState.player2;
        } else if (gameState.score2 > gameState.score1) {
          return gameState.player1;
        }
      } else {
        if (gameState.score1 > gameState.score2) {
          return gameState.player1;
        } else if (gameState.score2 > gameState.score1) {
          return gameState.player2;
        }
      }
    } else {
      if (scoresSwapped) {
        if (gameState.score1 > gameState.score2) {
          return gameState.team2;
        } else if (gameState.score2 > gameState.score1) {
          return gameState.team1;
        }
      } else {
        if (gameState.score1 > gameState.score2) {
          return gameState.team1;
        } else if (gameState.score2 > gameState.score1) {
          return gameState.team2;
        }
      }
    }
    return null;
  }
}