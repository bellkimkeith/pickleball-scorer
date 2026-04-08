import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ShareCard } from './ShareCard';
import { GameState, DoublesGameState } from '../../lib/types/game';
import { ScoringRules } from '../../lib/utils/scoring-rules';
import { Ionicons } from '@expo/vector-icons';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useSubscriptionStore } from '../../store/subscription-store';
import { useEffect } from 'react';
import { useStatsStore } from '../../store/stats-store';
import { GameRecord } from '../../lib/storage/game-history';

interface WinModalProps {
  visible: boolean;
  gameState: GameState | null;
  onPlayAgain: () => void;
  onExit: () => void;
}

export function WinModal({ visible, gameState, onPlayAgain, onExit }: WinModalProps) {
  const { isDarkMode } = useDarkMode();
  const { t } = useTranslation();
  const isPro = useSubscriptionStore((state) => state.isPro);
  const { saveGameRecord, loadHistory } = useStatsStore();
  
  useEffect(() => {
    if (visible && gameState && gameState.gameStartTime && gameState.gameEndTime) {
      const winner = ScoringRules.getWinner(gameState);
      if (winner) {
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
          duration: Math.floor((gameState.gameEndTime - gameState.gameStartTime) / 1000),
        };
        
        saveGameRecord(record).then(() => loadHistory());
      }
    }
  }, [visible, gameState, saveGameRecord, loadHistory]);
  
  if (!gameState) return null;

  const winner = ScoringRules.getWinner(gameState);
  const winnerName = winner
    ? 'name' in winner
      ? winner.name
      : 'Unknown'
    : 'Tie';

  const scoresSwapped = gameState.scoresSwapped || false;
  const isWinnerTeam1 = scoresSwapped 
    ? gameState.score2 > gameState.score1 
    : gameState.score1 > gameState.score2;
  const winnerColorClass = isWinnerTeam1 ? 'text-team1' : 'text-team2';

  const finalScore = `${gameState.score1} - ${gameState.score2}`;

  const isDoubles = gameState.mode === 'doubles';
  const doublesState = isDoubles ? (gameState as DoublesGameState) : null;
  const winningPlayers = isDoubles && doublesState
    ? (isWinnerTeam1 ? doublesState.team1.players : doublesState.team2.players)
    : null;

  const winnerValue = isWinnerTeam1 ? 1 : 2;

  return (
    <Modal visible={visible} onClose={onExit} dismissable={false}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="items-center py-4" accessibilityRole="alert">
          <Ionicons name="trophy" size={60} color="#fbbf24" />

          <Text accessibilityRole="header" className={`text-2xl font-bold mt-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('winModal.gameOver')}
          </Text>

          {winningPlayers && (
            <Text className={`text-base font-medium mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {winningPlayers[0].name} & {winningPlayers[1].name}
            </Text>
          )}

          {gameState.gameEndTime && gameState.gameStartTime && (
            <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-4`}>
              {t('winModal.duration', { minutes: Math.floor((gameState.gameEndTime - gameState.gameStartTime) / 60000) })}
            </Text>
          )}

          {/* Share Card */}
          <View className="mt-4">
            <ShareCard
              gameState={gameState}
              winner={winnerValue}
              isPro={isPro}
            />
          </View>

          <View className="flex-row gap-3 mt-8 w-full">
            <View className="flex-1">
              <Button title={t('common.exit')} onPress={onExit} variant="secondary" />
            </View>
            <View className="flex-1">
              <Button title={t('winModal.playAgain')} onPress={onPlayAgain} variant="primary" />
            </View>
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
}
