import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CourtDiagram, CourtSlots } from '../../components/court/CourtDiagram';
import { GameSetup } from '../../components/game/GameSetup';
import { WinModal } from '../../components/game/WinModal';
import { ScoreCall } from '../../components/scoring/ScoreCall';
import { SoundboardModal } from '../../components/sounds/SoundboardModal';
import { CourtButton } from '../../components/ui/Button';
import { Dialog } from '../../components/ui/Dialog';
import { Toolbar } from '../../components/ui/Toolbar';
import { COURT } from '../../lib/theme/tokens';
import { SinglesGameState } from '../../lib/types/game';
import { PaddleColor } from '../../lib/types/queue';
import { ScoringRules } from '../../lib/utils/scoring-rules';
import { useGameStore } from '../../store/game-store';
import { useSessionStore } from '../../store/session-store';

const FALLBACK: PaddleColor[] = ['coral', 'sky'];

export default function SinglesScreen() {
  const router = useRouter();
  const savedPlayers = useSessionStore(state => state.savedPlayers);

  const gameState = useGameStore(state => state.gameState) as SinglesGameState | null;
  const settings = useGameStore(state => state.settings);
  const isGameActive = useGameStore(state => state.isGameActive);
  const scorePoint = useGameStore(state => state.scorePoint);
  const sideOut = useGameStore(state => state.sideOut);
  const undoLastAction = useGameStore(state => state.undoLastAction);
  const resetGame = useGameStore(state => state.resetGame);
  const markSidesChanged = useGameStore(state => state.markSidesChanged);
  const { t } = useTranslation();

  const [showSetup, setShowSetup] = useState(true);
  const [showWinModal, setShowWinModal] = useState(false);
  const [showSoundboard, setShowSoundboard] = useState(false);
  const [showSwitchSides, setShowSwitchSides] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  useEffect(() => {
    if (gameState && !isGameActive && ScoringRules.isGameOver(gameState.score1, gameState.score2, settings)) {
      setShowWinModal(true);
    }
  }, [gameState, isGameActive, settings]);

  useEffect(() => {
    if (
      gameState &&
      isGameActive &&
      !gameState.sidesChanged &&
      ScoringRules.shouldChangeSides(gameState.score1, gameState.score2, settings, gameState.sidesChanged)
    ) {
      setShowSwitchSides(true);
    }
  }, [gameState, isGameActive, settings]);

  if (showSetup || !gameState) {
    return (
      <GameSetup mode="singles" visible onComplete={() => setShowSetup(false)} onCancel={() => router.back()} />
    );
  }

  const servingPlayer = gameState.servingPlayer;
  const servingScore = servingPlayer === 1 ? gameState.score1 : gameState.score2;
  const receivingScore = servingPlayer === 1 ? gameState.score2 : gameState.score1;
  const servingName = servingPlayer === 1 ? gameState.player1.name : gameState.player2.name;

  const colorFor = (name: string, index: number): PaddleColor =>
    savedPlayers.find(p => p.name === name)?.color ?? FALLBACK[index];

  // In singles the server stands right on an even score, left on an odd one.
  const serverOnTop = gameState.servingSide === 'right';
  const p1 = { id: 'p1', name: gameState.player1.name, color: colorFor(gameState.player1.name, 0) };
  const p2 = { id: 'p2', name: gameState.player2.name, color: colorFor(gameState.player2.name, 1) };

  const slots: CourtSlots =
    servingPlayer === 1
      ? [serverOnTop ? p1 : null, serverOnTop ? null : p1, p2, null]
      : [p1, null, serverOnTop ? p2 : null, serverOnTop ? null : p2];

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <StatusBar style="light" />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 6 }}>
        <Text style={{ color: COURT.inkMuted, fontSize: 15 }}>
          {t('game.gameTo')} {settings.winningScore}
        </Text>
        <Text style={{ color: COURT.inkMuted, fontSize: 15 }}>
          {settings.gameType === 'rally' ? t('game.rally') : t('game.sideout')}
        </Text>
      </View>

      <View style={{ paddingTop: 12 }}>
        <ScoreCall
          serving={settings.gameType === 'rally' ? gameState.score1 : servingScore}
          receiving={settings.gameType === 'rally' ? gameState.score2 : receivingScore}
          caption={
            settings.gameType === 'rally'
              ? `${gameState.player1.name} · ${gameState.player2.name}`
              : t('game.servingFrom', {
                  name: servingName,
                  side: gameState.servingSide === 'right' ? t('game.right') : t('game.left'),
                })
          }
        />
      </View>

      <View style={{ paddingHorizontal: 12, paddingTop: 20 }}>
        <CourtDiagram
          players={slots}
          height={260}
          servingPlayerId={servingPlayer === 1 ? 'p1' : 'p2'}
          showServeDiagonal
        />
      </View>

      <View style={{ flex: 1, justifyContent: 'flex-end', paddingHorizontal: 12, paddingBottom: 12 }}>
        {settings.gameType === 'rally' ? (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <CourtButton
              title={gameState.player1.name}
              subtitle={t('game.pointScored')}
              onPress={() => scorePoint(1)}
              height={96}
              style={{ flex: 1 }}
            />
            <CourtButton
              title={gameState.player2.name}
              subtitle={t('game.pointScored')}
              onPress={() => scorePoint(2)}
              variant="deep"
              height={96}
              style={{ flex: 1 }}
            />
          </View>
        ) : (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <CourtButton
              title={t('game.pointScored')}
              subtitle={servingName}
              onPress={() => scorePoint()}
              height={96}
              style={{ flex: 1 }}
            />
            <CourtButton
              title={t('game.sideOut')}
              subtitle={t('game.fault')}
              onPress={sideOut}
              variant="deep"
              height={96}
              style={{ flex: 1 }}
            />
          </View>
        )}
      </View>

      <Toolbar
        items={[
          { icon: 'musical-notes', label: t('soundboard.title'), onPress: () => setShowSoundboard(true) },
          {
            icon: 'arrow-undo',
            label: t('game.undo'),
            onPress: undoLastAction,
            disabled: gameState.scoreHistory.length === 0,
          },
          { icon: 'settings-outline', label: t('common.settings'), onPress: () => router.push('/settings') },
          { icon: 'stop-circle', label: t('common.end'), onPress: () => setShowEndConfirm(true), danger: true },
        ]}
      />

      <WinModal
        visible={showWinModal}
        gameState={gameState}
        onPlayAgain={() => {
          setShowWinModal(false);
          setShowSetup(true);
          resetGame();
        }}
        onExit={() => {
          resetGame();
          router.back();
        }}
      />

      <SoundboardModal visible={showSoundboard} onClose={() => setShowSoundboard(false)} />

      <Dialog
        visible={showSwitchSides}
        title={t('game.switchSides')}
        message={t('game.switchSidesMessage', { score: settings.sideChangeAt })}
        illustration={<CourtDiagram players={[null, null, null, null]} height={70} emptyLabel="⇄" style={{ width: 170 }} />}
        confirmLabel={t('game.switch')}
        cancelLabel={t('game.dontSwitch')}
        onConfirm={() => {
          markSidesChanged(true);
          setShowSwitchSides(false);
        }}
        onCancel={() => {
          markSidesChanged(false);
          setShowSwitchSides(false);
        }}
      />

      <Dialog
        visible={showEndConfirm}
        title={t('game.endGameConfirm')}
        message={t('game.endGameMessage')}
        confirmLabel={t('game.endGame')}
        cancelLabel={t('common.cancel')}
        onConfirm={() => {
          setShowEndConfirm(false);
          resetGame();
          router.back();
        }}
        onCancel={() => setShowEndConfirm(false)}
        destructive
      />
    </SafeAreaView>
  );
}
