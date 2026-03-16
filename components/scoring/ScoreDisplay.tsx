import { View, Text } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { GameState } from '../../lib/types/game';
import { ServerIndicator } from './ServerIndicator';

interface ScoreDisplayProps {
  gameState: GameState | null;
}

export function ScoreDisplay({ gameState }: ScoreDisplayProps) {
  if (!gameState) return null;

  const { score1, score2 } = gameState;

  const team1Name =
    gameState.mode === 'singles' ? gameState.player1.name : gameState.team1.name;
  const team2Name =
    gameState.mode === 'singles' ? gameState.player2.name : gameState.team2.name;

  const servingTeam = gameState.mode === 'singles' ? gameState.servingPlayer : gameState.servingTeam;
  const serverNumber = gameState.mode === 'doubles' ? gameState.serverNumber : undefined;
  const showArrow = gameState.mode === 'doubles';

  return (
    <View
      className="rounded-3xl overflow-hidden shadow-2xl"
      accessibilityRole="summary"
      accessibilityLabel={`Score: ${team1Name} ${score1}, ${team2Name} ${score2}`}
    >
      <Animated.View entering={FadeIn} exiting={FadeOut}>
        <View className="flex-row justify-between items-center">
          {/* Team 1 */}
          <View className="flex-1 items-center bg-team1 p-6 pb-8">
            <Text className="text-white text-lg font-semibold mb-2">{team1Name}</Text>
            <Animated.Text
              key={`score1-${score1}`}
              entering={FadeIn}
              className="text-white text-8xl font-bold"
            >
              {score1}
            </Animated.Text>
            {servingTeam === 1 ? (
              <ServerIndicator side={gameState.servingSide} serverNumber={serverNumber} showArrow={showArrow} />
            ) : (
              <View className="h-8" />
            )}
          </View>

          {/* Divider */}
          <View className="w-1 h-32 bg-white/30" />

          {/* Team 2 */}
          <View className="flex-1 items-center bg-team2 p-6 pb-8">
            <Text className="text-white text-lg font-semibold mb-2">{team2Name}</Text>
            <Animated.Text
              key={`score2-${score2}`}
              entering={FadeIn}
              className="text-white text-8xl font-bold"
            >
              {score2}
            </Animated.Text>
            {servingTeam === 2 ? (
              <ServerIndicator side={gameState.servingSide} serverNumber={serverNumber} showArrow={showArrow} />
            ) : (
              <View className="h-8" />
            )}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
