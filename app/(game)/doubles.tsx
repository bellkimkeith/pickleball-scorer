import { View, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../store/game-store';
import { ScoreDisplay } from '../../components/scoring/ScoreDisplay';
import { ScoreButton } from '../../components/scoring/ScoreButton';
import { GameControls } from '../../components/scoring/GameControls';
import { GameSetup } from '../../components/game/GameSetup';
import { WinModal } from '../../components/game/WinModal';
import { SoundboardModal } from '../../components/sounds/SoundboardModal';
import { ScoringRules } from '../../lib/utils/scoring-rules';
import { DoublesGameState } from '../../lib/types/game';
import { useDarkMode } from '../../hooks/useDarkMode';

export default function DoublesScreen() {
  const router = useRouter();
  const gameState = useGameStore((state) => state.gameState);
  const settings = useGameStore((state) => state.settings);
  const isGameActive = useGameStore((state) => state.isGameActive);
  const scorePoint = useGameStore((state) => state.scorePoint);
  const sideOut = useGameStore((state) => state.sideOut);
  const undoLastAction = useGameStore((state) => state.undoLastAction);
  const resetGame = useGameStore((state) => state.resetGame);
  const markSidesChanged = useGameStore((state) => state.markSidesChanged);
  const { isDarkMode } = useDarkMode();
  const { t } = useTranslation();

  const [showSetup, setShowSetup] = useState(true);
  const [showWinModal, setShowWinModal] = useState(false);
  const [showSoundboard, setShowSoundboard] = useState(false);

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
          t('game.switchSides'),
          t('game.switchSidesMessage', { score: settings.sideChangeAt }),
          [
            { text: t('game.switch'), onPress: () => markSidesChanged(true) },
            { text: t('game.dontSwitch'), onPress: () => markSidesChanged(false) },
          ]
        );
      } else {
        markSidesChanged(false);
      }
    }
  }, [gameState, isGameActive, markSidesChanged, settings, t]);

  const handleEndGame = () => {
    Alert.alert(t('game.endGameConfirm'), t('game.endGameMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('game.endGame'),
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
        mode="doubles"
        visible={true}
        onComplete={() => setShowSetup(false)}
        onCancel={() => router.back()}
      />
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      {/* Score Display */}
      <View className="px-6 pb-8">
        <ScoreDisplay gameState={gameState} />
      </View>

      {/* Action Buttons */}
      <View className="flex-1 px-6 justify-center gap-4">
        {settings.gameType === 'rally' ? (
          <>
            <ScoreButton
              title={`${(gameState as DoublesGameState).team1.name} ${t('game.scores')}`}
              icon="checkmark-circle"
              onPress={() => scorePoint(1)}
              color="green"
            />
            <ScoreButton
              title={`${(gameState as DoublesGameState).team2.name} ${t('game.scores')}`}
              icon="checkmark-circle"
              onPress={() => scorePoint(2)}
              color="orange"
            />
          </>
        ) : (
          <>
            <ScoreButton
              title={t('game.pointScored')}
              icon="checkmark-circle"
              onPress={() => scorePoint()}
              color="green"
            />
            <ScoreButton
              title={gameState.mode === 'doubles' && gameState.serverNumber === 1 ? t('game.secondServe') : t('game.sideOut')}
              icon="swap-horizontal"
              onPress={sideOut}
              color="orange"
            />
          </>
        )}
      </View>

      {/* Game Controls */}
      <GameControls
        onUndo={undoLastAction}
        onSettings={() => router.push('/settings')}
        onEndGame={handleEndGame}
        onSoundboard={() => setShowSoundboard(true)}
        canUndo={gameState.scoreHistory.length > 0}
      />

      {/* Win Modal */}
      <WinModal
        visible={showWinModal}
        gameState={gameState}
        onPlayAgain={handlePlayAgain}
        onExit={handleExit}
      />

      <SoundboardModal
        visible={showSoundboard}
        onClose={() => setShowSoundboard(false)}
      />
    </SafeAreaView>
  );
}
