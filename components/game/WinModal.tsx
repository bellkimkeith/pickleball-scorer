import { View, Text } from 'react-native';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { GameState } from '../../lib/types/game';
import { ScoringRules } from '../../lib/utils/scoring-rules';
import { Ionicons } from '@expo/vector-icons';
import { useDarkMode } from '../../hooks/useDarkMode';

interface WinModalProps {
  visible: boolean;
  gameState: GameState | null;
  onPlayAgain: () => void;
  onExit: () => void;
}

export function WinModal({ visible, gameState, onPlayAgain, onExit }: WinModalProps) {
  const { isDarkMode } = useDarkMode();
  
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

  return (
    <Modal visible={visible} onClose={onExit} dismissable={false}>
      <View className="items-center py-6" accessibilityRole="alert">
        <Ionicons name="trophy" size={80} color="#fbbf24" />

        <Text accessibilityRole="header" className={`text-3xl font-bold mt-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Game Over!
        </Text>

        <Text
          className={`text-xl font-semibold mt-4 ${winnerColorClass}`}
          accessibilityLabel={`${winnerName} wins with a score of ${finalScore}`}
        >
          {winnerName} Wins!
        </Text>

        <View className={`rounded-2xl p-6 mt-6 w-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <Text className={`text-center text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Final Score
          </Text>
          <Text className={`text-center text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {finalScore}
          </Text>
        </View>

        {gameState.gameEndTime && gameState.gameStartTime && (
          <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-4`}>
            Duration: {Math.floor((gameState.gameEndTime - gameState.gameStartTime) / 60000)} min
          </Text>
        )}

        <View className="flex-row gap-3 mt-8 w-full">
          <View className="flex-1">
            <Button title="Exit" onPress={onExit} variant="secondary" />
          </View>
          <View className="flex-1">
            <Button title="Play Again" onPress={onPlayAgain} variant="primary" />
          </View>
        </View>
      </View>
    </Modal>
  );
}
