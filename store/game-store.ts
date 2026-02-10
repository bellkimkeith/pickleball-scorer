import { create } from 'zustand';
import { GameState, GameSettings } from '../lib/types/game';
import { ScoringRules } from '../lib/utils/scoring-rules';
import { DEFAULT_GAME_SETTINGS } from '../lib/constants/game-config';
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
  markSidesChanged: () => void;
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
            scoreHistory: newHistory,
          },
          isGameActive: true,
        });
      }
    }
  },

  markSidesChanged: () => {
    const { gameState } = get();
    if (!gameState) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    set({ gameState: { ...gameState, sidesChanged: true } });
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
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }));
  },
}));
