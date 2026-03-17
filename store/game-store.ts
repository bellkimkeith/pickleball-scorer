import { create } from 'zustand';
import { GameState, GameSettings, SinglesGameState, DoublesGameState } from '../lib/types/game';
import { ScoringRules } from '../lib/utils/scoring-rules';
import { DEFAULT_GAME_SETTINGS, getDefaultSideChangeAt } from '../lib/constants/game-config';
import * as Haptics from 'expo-haptics';

interface GameStore {
  // State
  gameState: GameState | null;
  settings: GameSettings;
  isGameActive: boolean;

  // Actions
  startSinglesGame: (player1Name: string, player2Name: string) => void;
  startDoublesGame: (
    team1Name: string,
    team1Players: [string, string],
    team2Name: string,
    team2Players: [string, string]
  ) => void;
  scorePoint: () => void;
  sideOut: () => void;
  undoLastAction: () => void;
  resetGame: () => void;
  markSidesChanged: (swapScores: boolean) => void;
  endGame: () => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: null,
  settings: DEFAULT_GAME_SETTINGS,
  isGameActive: false,

  startSinglesGame: (player1Name, player2Name) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    set({
      gameState: {
        mode: 'singles',
        player1: { id: '1', name: player1Name },
        player2: { id: '2', name: player2Name },
        score1: 0,
        score2: 0,
        servingPlayer: 1,
        servingSide: 'right',
        sidesChanged: false,
        scoresSwapped: false,
        gameStartTime: Date.now(),
        scoreHistory: [],
      },
      isGameActive: true,
    });
  },

  startDoublesGame: (team1Name, team1Players, team2Name, team2Players) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    set({
      gameState: {
        mode: 'doubles',
        team1: {
          id: '1',
          name: team1Name,
          players: [
            { id: '1-1', name: team1Players[0] },
            { id: '1-2', name: team1Players[1] },
          ],
        },
        team2: {
          id: '2',
          name: team2Name,
          players: [
            { id: '2-1', name: team2Players[0] },
            { id: '2-2', name: team2Players[1] },
          ],
        },
        score1: 0,
        score2: 0,
        servingTeam: 1,
        serverNumber: 1,
        servingSide: 'right',
        sidesChanged: false,
        scoresSwapped: false,
        gameStartTime: Date.now(),
        scoreHistory: [],
      },
      isGameActive: true,
    });
  },

  scorePoint: () => {
    const { gameState, settings } = get();
    if (!gameState) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newState = ScoringRules.scorePoint(gameState, settings);

    // Check for game over
    if (ScoringRules.isGameOver(newState.score1, newState.score2, settings)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      set({ gameState: { ...newState, gameEndTime: Date.now() }, isGameActive: false });
    } else {
      set({ gameState: newState });
    }
  },

  sideOut: () => {
    const { gameState } = get();
    if (!gameState) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const newState = ScoringRules.handleSideOut(gameState);
    set({ gameState: newState });
  },

  undoLastAction: () => {
    const { gameState } = get();
    if (!gameState || gameState.scoreHistory.length === 0) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Remove the last event from history
    const newHistory = gameState.scoreHistory.slice(0, -1);

    if (newHistory.length === 0) {
      // Reset to initial state
      if (gameState.mode === 'singles') {
        set({
          gameState: {
            ...gameState,
            score1: 0,
            score2: 0,
            servingPlayer: 1,
            servingSide: 'right',
            sidesChanged: false,
            scoresSwapped: false,
            scoreHistory: [],
          },
          isGameActive: true,
        });
      } else {
        set({
          gameState: {
            ...gameState,
            score1: 0,
            score2: 0,
            servingTeam: 1,
            serverNumber: 1,
            servingSide: 'right',
            sidesChanged: false,
            scoresSwapped: false,
            scoreHistory: [],
          },
          isGameActive: true,
        });
      }
    } else {
      // Restore previous state from last event
      const lastEvent = newHistory[newHistory.length - 1];
      const { settings } = get();
      const restoredSidesChanged = ScoringRules.shouldChangeSides(
        lastEvent.score1,
        lastEvent.score2,
        settings,
        false
      );

      if (gameState.mode === 'singles') {
        set({
          gameState: {
            ...gameState,
            score1: lastEvent.score1,
            score2: lastEvent.score2,
            servingPlayer: lastEvent.servingTeam as 1 | 2,
            servingSide: ScoringRules.getServingSide(
              lastEvent.servingTeam === 1 ? lastEvent.score1 : lastEvent.score2
            ),
            sidesChanged: restoredSidesChanged,
            scoresSwapped: lastEvent.scoresSwapped || false,
            scoreHistory: newHistory,
          },
          isGameActive: true,
        });
      } else {
        set({
          gameState: {
            ...gameState,
            score1: lastEvent.score1,
            score2: lastEvent.score2,
            servingTeam: lastEvent.servingTeam,
            serverNumber: lastEvent.serverNumber || 1,
            servingSide: ScoringRules.getServingSide(
              lastEvent.servingTeam === 1 ? lastEvent.score1 : lastEvent.score2,
              lastEvent.serverNumber || 1
            ),
            sidesChanged: restoredSidesChanged,
            scoresSwapped: lastEvent.scoresSwapped || false,
            scoreHistory: newHistory,
          },
          isGameActive: true,
        });
      }
    }
  },

  markSidesChanged: (swapScores: boolean) => {
    const { gameState, settings } = get();
    if (!gameState) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    
    if (swapScores && settings.swapScoresOnSideChange) {
      // Actually swap the scores in the game state
      if (gameState.mode === 'singles') {
        // For singles: swap score1 and score2, and swap serving player (1<->2)
        set((state) => {
          if (!state.gameState) return state;
          const singlesState = state.gameState as SinglesGameState;
          const newServingPlayer = singlesState.servingPlayer === 1 ? 2 : 1;
          const newServingScore = newServingPlayer === 1 ? singlesState.score2 : singlesState.score1;
          return {
            gameState: {
              ...singlesState,
              score1: singlesState.score2,
              score2: singlesState.score1,
              servingPlayer: newServingPlayer,
              servingSide: ScoringRules.getServingSide(newServingScore),
              sidesChanged: true,
              scoresSwapped: true,
            },
          };
        });
      } else {
        // For doubles: swap score1 and score2, and swap serving team (1<->2)
        // This is for the "swap scores" feature which swaps colors/values displayed
        set((state) => {
          if (!state.gameState) return state;
          const doublesState = state.gameState as DoublesGameState;
          const newServingTeam = doublesState.servingTeam === 1 ? 2 : 1;
          // After swapping scores, the new serving team's score is in the opposite position
          // Team 1's original score is score1, Team 2's original score is score2
          // After swap: score1 = Team 2's score, score2 = Team 1's score
          // If newServingTeam = 1, their score is in score2 (which is doublesState.score1)
          // If newServingTeam = 2, their score is in score1 (which is doublesState.score2)
          const newServingScore = newServingTeam === 1 ? doublesState.score1 : doublesState.score2;
          return {
            gameState: {
              ...doublesState,
              score1: doublesState.score2,
              score2: doublesState.score1,
              servingTeam: newServingTeam,
              servingSide: ScoringRules.getServingSide(newServingScore, doublesState.serverNumber),
              sidesChanged: true,
              scoresSwapped: true,
            },
          };
        });
      }
    } else {
      // Don't swap scores, just mark sides as changed
      // But we need to update the serving side to reflect the new court position
      if (gameState.mode === 'singles') {
        const servingScore = gameState.servingPlayer === 1 ? gameState.score1 : gameState.score2;
        set({ 
          gameState: { 
            ...gameState, 
            servingSide: ScoringRules.getServingSide(servingScore),
            sidesChanged: true, 
            scoresSwapped: false 
          } 
        });
      } else {
        const servingScore = gameState.servingTeam === 1 ? gameState.score1 : gameState.score2;
        set({ 
          gameState: { 
            ...gameState, 
            servingSide: ScoringRules.getServingSide(servingScore, gameState.serverNumber),
            sidesChanged: true, 
            scoresSwapped: false 
          } 
        });
      }
    }
  },

  resetGame: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    set({ gameState: null, isGameActive: false });
  },

  endGame: () => {
    const { gameState } = get();
    if (!gameState) return;

    set({
      gameState: { ...gameState, gameEndTime: Date.now() },
      isGameActive: false,
    });
  },

  updateSettings: (newSettings) => {
    set((state) => {
      const updatedSettings = { ...state.settings, ...newSettings };
      
      // If winningScore changed, update sideChangeAt to the default for that score
      if (newSettings.winningScore && newSettings.winningScore !== state.settings.winningScore) {
        updatedSettings.sideChangeAt = getDefaultSideChangeAt(newSettings.winningScore);
      }
      
      // Validate sideChangeAt doesn't exceed winningScore
      if (updatedSettings.sideChangeAt > updatedSettings.winningScore) {
        updatedSettings.sideChangeAt = updatedSettings.winningScore;
      }
      
      return { settings: updatedSettings };
    });
  },
}));
