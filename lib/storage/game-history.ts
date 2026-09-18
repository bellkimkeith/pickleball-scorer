import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState } from '../types/game';

export const GAME_HISTORY_KEY = '@pickleball_game_history';
export const MAX_STORED_GAMES = 500;

export interface GameRecord {
  id: string;
  date: number;
  mode: 'singles' | 'doubles';
  player1: string;
  player2: string;
  score1: number;
  score2: number;
  winner: 1 | 2;
  duration: number;
}

export async function saveGame(gameState: GameState): Promise<GameRecord> {
  const record: GameRecord = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    date: Date.now(),
    mode: gameState.mode,
    player1: gameState.mode === 'singles' 
      ? (gameState as any).player1.name 
      : (gameState as any).team1.name,
    player2: gameState.mode === 'singles' 
      ? (gameState as any).player2.name 
      : (gameState as any).team2.name,
    score1: gameState.score1,
    score2: gameState.score2,
    winner: gameState.score1 > gameState.score2 ? 1 : 2,
    duration: gameState.gameEndTime && gameState.gameStartTime
      ? Math.floor((gameState.gameEndTime - gameState.gameStartTime) / 1000)
      : 0,
  };

  try {
    const existing = await getRecentGames(MAX_STORED_GAMES);
    const games = [record, ...existing];
    
    const gamesToSave = games.slice(0, MAX_STORED_GAMES);
    await AsyncStorage.setItem(GAME_HISTORY_KEY, JSON.stringify(gamesToSave));
    
    return record;
  } catch (error) {
    console.error('Failed to save game:', error);
    throw error;
  }
}

export async function getRecentGames(limit: number = MAX_STORED_GAMES): Promise<GameRecord[]> {
  try {
    const data = await AsyncStorage.getItem(GAME_HISTORY_KEY);
    if (!data) return [];
    
    const games: GameRecord[] = JSON.parse(data);
    return games.slice(0, limit);
  } catch (error) {
    console.error('Failed to get game history:', error);
    return [];
  }
}

export async function clearGameHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(GAME_HISTORY_KEY);
  } catch (error) {
    console.error('Failed to clear game history:', error);
    throw error;
  }
}

export async function getWinLossStats(games: GameRecord[]): Promise<{
  wins: number;
  losses: number;
  totalGames: number;
  winRate: number;
}> {
  const totalGames = games.length;
  let wins = 0;
  let losses = 0;

  for (const game of games) {
    if (game.winner === 1) {
      wins++;
    } else {
      losses++;
    }
  }

  return {
    wins,
    losses,
    totalGames,
    winRate: totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0,
  };
}

export async function getCurrentStreak(games: GameRecord[]): Promise<number> {
  if (games.length === 0) return 0;

  let streak = 0;
  const firstGame = games[0];
  
  for (const game of games) {
    if (game.winner === firstGame.winner) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
