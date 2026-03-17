import { View, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '../../store/game-store';
import { ScoreDisplay } from '../../components/scoring/ScoreDisplay';
import { ScoreButton } from '../../components/scoring/ScoreButton';
import { GameControls } from '../../components/scoring/GameControls';
import { GameSetup } from '../../components/game/GameSetup';
import { WinModal } from '../../components/game/WinModal';
import { ScoringRules } from '../../lib/utils/scoring-rules';
import { SinglesGameState } from '../../lib/types/game';

export default function SinglesScreen() {
  const router = useRouter();
  const gameState = useGameStore((state) => state.gameState);
  const settings = useGameStore((state) => state.settings);
  const isGameActive = useGameStore((state) => state.isGameActive);
  const scorePoint = useGameStore((state) => state.scorePoint);
  const sideOut = useGameStore((state) => state.sideOut);
  const undoLastAction = useGameStore((state) => state.undoLastAction);
  const resetGame = useGameStore((state) => state.resetGame);
  const markSidesChanged = useGameStore((state) => state.markSidesChanged);

  const [showSetup, setShowSetup] = useState(true);
  const [showWinModal, setShowWinModal] = useState(false);

  // Check if game is over
  useEffect(() => {
    if (
      gameState &&
      !isGameActive &&
      ScoringRules.isGameOver(gameState.score1, gameState.score2, settings)
    ) {
      setShowWinModal(true);
    }
  }, [gameState, isGameActive, settings]);

  // Check if sides should change
  useEffect(() => {
    if (
      gameState &&
      isGameActive &&
      !gameState.sidesChanged &&
      ScoringRules.shouldChangeSides(
        gameState.score1,
        gameState.score2,
        settings,
        gameState.sidesChanged
      )
    ) {
      if (settings.swapScoresOnSideChange) {
        Alert.alert(
          'Switch Sides',
          `Score reached ${settings.sideChangeAt}. Time to switch sides!`,
          [
            { text: 'Switch', onPress: () => markSidesChanged(true) },
            { text: "Don't Switch", onPress: () => markSidesChanged(false) },
          ]
        );
      } else {
        markSidesChanged(false);
      }
    }
  }, [gameState, isGameActive, markSidesChanged, settings]);

  const handleEndGame = () => {
    Alert.alert('End Game', 'Are you sure you want to end this game?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End Game',
        style: 'destructive',
        onPress: () => {
          resetGame();
          router.back();
        },
      },
    ]);
  };

  const handlePlayAgain = () => {
    setShowWinModal(false);
    setShowSetup(true);
    resetGame();
  };

  const handleExit = () => {
    resetGame();
    router.back();
  };

  if (showSetup || !gameState) {
    return (
      <GameSetup
        mode="singles"
        visible={true}
        onComplete={() => setShowSetup(false)}
        onCancel={() => router.back()}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="light" />

      {/* Score Display */}
      <View className="px-6 pb-8">
        <ScoreDisplay gameState={gameState} />
      </View>

      {/* Action Buttons */}
      <View className="flex-1 px-6 justify-center gap-4">
        {settings.gameType === 'rally' ? (
          <>
            <ScoreButton
              title={`${(gameState as SinglesGameState).player1.name} Scores`}
              icon="checkmark-circle"
              onPress={() => scorePoint(1)}
              color="green"
            />
            <ScoreButton
              title={`${(gameState as SinglesGameState).player2.name} Scores`}
              icon="checkmark-circle"
              onPress={() => scorePoint(2)}
              color="orange"
            />
          </>
        ) : (
          <>
            <ScoreButton
              title="Point Scored"
              icon="checkmark-circle"
              onPress={() => scorePoint()}
              color="green"
            />
            <ScoreButton title="Side Out" icon="swap-horizontal" onPress={sideOut} color="orange" />
          </>
        )}
      </View>

      {/* Game Controls */}
      <GameControls
        onUndo={undoLastAction}
        onSettings={() => router.push('/settings')}
        onEndGame={handleEndGame}
        canUndo={gameState.scoreHistory.length > 0}
      />

      {/* Win Modal */}
      <WinModal
        visible={showWinModal}
        gameState={gameState}
        onPlayAgain={handlePlayAgain}
        onExit={handleExit}
      />
    </SafeAreaView>
  );
}
