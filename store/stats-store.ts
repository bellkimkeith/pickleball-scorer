import { create } from 'zustand';
import { 
  GameRecord, 
  getRecentGames, 
  clearGameHistory,
  getWinLossStats,
  getCurrentStreak 
} from '../lib/storage/game-history';

interface StatsStore {
  recentGames: GameRecord[];
  isLoading: boolean;
  wins: number;
  losses: number;
  totalGames: number;
  winRate: number;
  currentStreak: number;

  loadHistory: () => Promise<void>;
  saveGameRecord: (record: GameRecord) => Promise<void>;
  clearHistory: () => Promise<void>;
}

export const useStatsStore = create<StatsStore>((set, get) => ({
  recentGames: [],
  isLoading: false,
  wins: 0,
  losses: 0,
  totalGames: 0,
  winRate: 0,
  currentStreak: 0,

  loadHistory: async () => {
    set({ isLoading: true });
    try {
      const games = await getRecentGames(10);
      const stats = await getWinLossStats(games);
      const streak = await getCurrentStreak(games);

      set({
        recentGames: games,
        wins: stats.wins,
        losses: stats.losses,
        totalGames: stats.totalGames,
        winRate: stats.winRate,
        currentStreak: streak,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
      set({ isLoading: false });
    }
  },

  saveGameRecord: async (record: GameRecord) => {
    try {
      const existing = await getRecentGames(10);
      const games = [record, ...existing];
      
      const gamesToSave = games.slice(0, 10);
      const GAME_HISTORY_KEY = '@pickleball_game_history';
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem(GAME_HISTORY_KEY, JSON.stringify(gamesToSave));
      
      await get().loadHistory();
    } catch (error) {
      console.error('Failed to save game record:', error);
    }
  },

  clearHistory: async () => {
    try {
      await clearGameHistory();
      set({
        recentGames: [],
        wins: 0,
        losses: 0,
        totalGames: 0,
        winRate: 0,
        currentStreak: 0,
      });
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  },
}));
