import { View, Text } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { GameState } from '../../lib/types/game';
import { ServerIndicator } from './ServerIndicator';

interface ScoreDisplayProps {
  gameState: GameState | null;
}

export function ScoreDisplay({ gameState }: ScoreDisplayProps) {
  if (!gameState) return null;

  // When scores are swapped, the actual score values in state have already been exchanged
  // So we just use them directly. Team names also need to be swapped to match.
  const displayScore1 = gameState.score1;
  const displayScore2 = gameState.score2;
   
  const displayTeam1Name = gameState.scoresSwapped 
    ? (gameState.mode === 'singles' ? gameState.player2.name : gameState.team2.name)
    : (gameState.mode === 'singles' ? gameState.player1.name : gameState.team1.name);
    
  const displayTeam2Name = gameState.scoresSwapped 
    ? (gameState.mode === 'singles' ? gameState.player1.name : gameState.team1.name)
    : (gameState.mode === 'singles' ? gameState.player2.name : gameState.team2.name);

  // Serving team logic needs to account for swapped scores
  const actualServingTeam = gameState.mode === 'singles' ? gameState.servingPlayer : gameState.servingTeam;
  // When scores are swapped, the serving team is already swapped in the state
  // So the indicator should be shown for the actual serving team
  const displayServingTeam = actualServingTeam;
    
  // Swap background colors when scores are swapped
  const team1BgClass = gameState.scoresSwapped ? 'bg-team2' : 'bg-team1';
  const team2BgClass = gameState.scoresSwapped ? 'bg-team1' : 'bg-team2';
    
  const serverNumber = gameState.mode === 'doubles' ? gameState.serverNumber : undefined;
  const showArrow = gameState.mode === 'doubles';

  return (
    <View
      className="rounded-3xl overflow-hidden shadow-2xl"
      accessibilityRole="summary"
      accessibilityLabel={`Score: ${displayTeam1Name} ${displayScore1}, ${displayTeam2Name} ${displayScore2}`}
    >
      <Animated.View entering={FadeIn} exiting={FadeOut}>
        <View className="flex-row justify-between items-center">
          {/* Team 1 (display) */}
          <View className={`flex-1 items-center ${team1BgClass} p-6 pb-8`}>
            <Text className="text-white text-lg font-semibold mb-2">{displayTeam1Name}</Text>
            <Animated.Text
              key={`score1-${displayScore1}`}
              entering={FadeIn}
              className="text-white text-8xl font-bold"
            >
              {displayScore1}
            </Animated.Text>
            {displayServingTeam === 1 ? (
              <ServerIndicator side={gameState.servingSide} serverNumber={serverNumber} showArrow={showArrow} />
            ) : (
              <View className="h-8" />
            )}
          </View>

          {/* Divider */}
          <View className="w-1 h-32 bg-white/30" />

          {/* Team 2 (display) */}
          <View className={`flex-1 items-center ${team2BgClass} p-6 pb-8`}>
            <Text className="text-white text-lg font-semibold mb-2">{displayTeam2Name}</Text>
            <Animated.Text
              key={`score2-${displayScore2}`}
              entering={FadeIn}
              className="text-white text-8xl font-bold"
            >
              {displayScore2}
            </Animated.Text>
            {displayServingTeam === 2 ? (
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
