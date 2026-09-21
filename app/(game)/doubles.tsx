import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { DoublesGameState } from '../../lib/types/game';
import { PaddleColor } from '../../lib/types/queue';
import { getGameResult } from '../../lib/utils/game-result';
import { ScoringRules } from '../../lib/utils/scoring-rules';
import { useGameStore } from '../../store/game-store';
import { useSessionStore } from '../../store/session-store';

const TEAM_COLORS: PaddleColor[] = ['coral', 'carbon', 'lilac', 'sky'];

export default function DoublesScreen() {
  const router = useRouter();
  const { sessionMatchId } = useLocalSearchParams<{ sessionMatchId?: string }>();
  const activeSession = useSessionStore(state => state.activeSession);
  const matchDone = useSessionStore(state => state.matchDone);
  const savedPlayers = useSessionStore(state => state.savedPlayers);

  const gameState = useGameStore(state => state.gameState) as DoublesGameState | null;
  const settings = useGameStore(state => state.settings);
  const isGameActive = useGameStore(state => state.isGameActive);
  const scorePoint = useGameStore(state => state.scorePoint);
  const sideOut = useGameStore(state => state.sideOut);
  const undoLastAction = useGameStore(state => state.undoLastAction);
  const resetGame = useGameStore(state => state.resetGame);
  const markSidesChanged = useGameStore(state => state.markSidesChanged);
  const startDoublesGame = useGameStore(state => state.startDoublesGame);
  const { t } = useTranslation();

  const [showSetup, setShowSetup] = useState(!sessionMatchId);
  const [showWinModal, setShowWinModal] = useState(false);
  const [showSoundboard, setShowSoundboard] = useState(false);
  const [showSwitchSides, setShowSwitchSides] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  // Starting from an Open Play match: fill both teams in and skip setup.
  useEffect(() => {
    if (!sessionMatchId || !activeSession || gameState) return;
    const match = activeSession.matches.find(m => m.id === sessionMatchId);
    if (!match) return;
    const nameOf = (id: string) => activeSession.players.find(p => p.id === id)?.name ?? '';
    const team1: [string, string] = [nameOf(match.team1[0]), nameOf(match.team1[1])];
    const team2: [string, string] = [nameOf(match.team2[0]), nameOf(match.team2[1])];
    startDoublesGame(team1.join(' & '), team1, team2.join(' & '), team2);
    setShowSetup(false);
  }, [sessionMatchId, activeSession, gameState, startDoublesGame]);

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
      <GameSetup mode="doubles" visible onComplete={() => setShowSetup(false)} onCancel={() => router.back()} />
    );
  }

  const servingTeam = gameState.servingTeam;
  const servingScore = servingTeam === 1 ? gameState.score1 : gameState.score2;
  const receivingScore = servingTeam === 1 ? gameState.score2 : gameState.score1;
  const servingTeamName = servingTeam === 1 ? gameState.team1.name : gameState.team2.name;

  const colorFor = (name: string, fallbackIndex: number): PaddleColor =>
    savedPlayers.find(p => p.name === name)?.color ?? TEAM_COLORS[fallbackIndex];

  const slots: CourtSlots = [
    { id: 't1p1', name: gameState.team1.players[0].name, color: colorFor(gameState.team1.players[0].name, 0) },
    { id: 't1p2', name: gameState.team1.players[1].name, color: colorFor(gameState.team1.players[1].name, 1) },
    { id: 't2p1', name: gameState.team2.players[0].name, color: colorFor(gameState.team2.players[0].name, 2) },
    { id: 't2p2', name: gameState.team2.players[1].name, color: colorFor(gameState.team2.players[1].name, 3) },
  ];

  // The serving player: team side plus which partner is serving.
  const servingId =
    servingTeam === 1
      ? gameState.serverNumber === 1
        ? 't1p1'
        : 't1p2'
      : gameState.serverNumber === 1
        ? 't2p1'
        : 't2p2';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COURT.outer }} edges={['top']}>
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
          serverNumber={settings.gameType === 'rally' ? undefined : gameState.serverNumber}
          caption={
            settings.gameType === 'rally'
              ? `${gameState.team1.name} · ${gameState.team2.name}`
              : `${servingTeamName} · ${gameState.serverNumber === 1 ? t('game.firstServer') : t('game.secondServer')}`
          }
        />
      </View>

      <View style={{ paddingHorizontal: 12, paddingTop: 20 }}>
        <CourtDiagram players={slots} height={260} servingPlayerId={servingId} showServeDiagonal />
      </View>

      <View style={{ flex: 1, justifyContent: 'flex-end', paddingHorizontal: 12, paddingBottom: 12 }}>
        {settings.gameType === 'rally' ? (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <CourtButton
              title={gameState.team1.name}
              subtitle={t('game.pointScored')}
              onPress={() => scorePoint(1)}
              height={96}
              style={{ flex: 1 }}
            />
            <CourtButton
              title={gameState.team2.name}
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
              subtitle={servingTeamName}
              onPress={() => scorePoint()}
              height={96}
              style={{ flex: 1 }}
            />
            <CourtButton
              title={gameState.serverNumber === 1 ? t('game.secondServe') : t('game.sideOut')}
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
        onBackToSession={
          sessionMatchId
            ? () => {
                const result = getGameResult(gameState);
                matchDone(sessionMatchId, [result.score1, result.score2]);
                resetGame();
                router.replace('/queue/session');
              }
            : undefined
        }
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
