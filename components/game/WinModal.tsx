import { useEffect, useState } from 'react';
import { ImageBackground, Modal, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COURT, PADDLE_FACE } from '../../lib/theme/tokens';
import { DoublesGameState, GameState, SinglesGameState } from '../../lib/types/game';
import { PaddleColor } from '../../lib/types/queue';
import { GameRecord } from '../../lib/storage/game-history';
import { getGameResult } from '../../lib/utils/game-result';
import { ScoringRules } from '../../lib/utils/scoring-rules';
import { useSessionStore } from '../../store/session-store';
import { useStatsStore } from '../../store/stats-store';
import { CourtButton } from '../ui/Button';
import { ShareCard } from './ShareCard';

interface WinModalProps {
  visible: boolean;
  gameState: GameState | null;
  onPlayAgain: () => void;
  onExit: () => void;
  /** Shown as the primary action when the game came from an Open Play session. */
  onBackToSession?: () => void;
}

export function WinModal({ visible, gameState, onPlayAgain, onExit, onBackToSession }: WinModalProps) {
  const { t } = useTranslation();
  const { saveGameRecord, loadHistory } = useStatsStore();
  const savedPlayers = useSessionStore(state => state.savedPlayers);
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    if (visible && gameState && gameState.gameStartTime && gameState.gameEndTime) {
      const winner = ScoringRules.getWinner(gameState);
      if (winner) {
        const result = getGameResult(gameState);
        const record: GameRecord = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
          date: Date.now(),
          mode: gameState.mode,
          player1:
            gameState.mode === 'singles'
              ? (gameState as SinglesGameState).player1.name
              : (gameState as DoublesGameState).team1.name,
          player2:
            gameState.mode === 'singles'
              ? (gameState as SinglesGameState).player2.name
              : (gameState as DoublesGameState).team2.name,
          score1: result.score1,
          score2: result.score2,
          winner: result.winner,
          duration: Math.floor((gameState.gameEndTime - gameState.gameStartTime) / 1000),
        };
        saveGameRecord(record).then(() => loadHistory());
      }
    }
  }, [visible, gameState, saveGameRecord, loadHistory]);

  useEffect(() => {
    if (!visible) setShowCard(false);
  }, [visible]);

  if (!gameState) return null;

  const { score1, score2, winner } = getGameResult(gameState);
  const high = Math.max(score1, score2);
  const low = Math.min(score1, score2);

  const winnerName =
    gameState.mode === 'singles'
      ? (gameState as SinglesGameState)[winner === 1 ? 'player1' : 'player2'].name
      : (gameState as DoublesGameState)[winner === 1 ? 'team1' : 'team2'].name;
  const loserName =
    gameState.mode === 'singles'
      ? (gameState as SinglesGameState)[winner === 1 ? 'player2' : 'player1'].name
      : (gameState as DoublesGameState)[winner === 1 ? 'team2' : 'team1'].name;

  const minutes =
    gameState.gameEndTime && gameState.gameStartTime
      ? Math.max(1, Math.round((gameState.gameEndTime - gameState.gameStartTime) / 60000))
      : null;

  const winningPlayers =
    gameState.mode === 'doubles'
      ? (gameState as DoublesGameState)[winner === 1 ? 'team1' : 'team2'].players.map(p => p.name)
      : [winnerName];

  const colorOf = (name: string, fallback: PaddleColor): PaddleColor =>
    savedPlayers.find(p => p.name === name)?.color ?? fallback;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onExit}>
      <ImageBackground
        source={require('../../assets/textures/court-grit.png')}
        resizeMode="repeat"
        style={{ flex: 1, backgroundColor: COURT.outer }}
      >
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 30, flexGrow: 1 }}>
          {/* A long name is shrunk to fit rather than broken mid-word, which is
              what Android did to it ("Fernandez-Rodrigue / z"). */}
          <Text
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.45}
            textBreakStrategy="simple"
            style={{ color: COURT.ink, fontSize: 40, fontWeight: '800', paddingTop: 30 }}
          >
            {gameState.mode === 'doubles'
              ? t('winModal.winsPair', { name: winnerName })
              : t('winModal.wins', { name: winnerName })}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 14, marginTop: 22 }}>
            <Text
              style={{
                color: COURT.ink,
                fontSize: 104,
                fontWeight: '800',
                letterSpacing: -4,
                lineHeight: 104,
                fontVariant: ['tabular-nums'],
              }}
            >
              {high}
            </Text>
            <Text style={{ color: COURT.inkMuted, fontSize: 42 }}>–</Text>
            <Text
              style={{
                color: '#9fb8ad',
                fontSize: 104,
                fontWeight: '800',
                letterSpacing: -4,
                lineHeight: 104,
                fontVariant: ['tabular-nums'],
              }}
            >
              {low}
            </Text>
          </View>

          {minutes && (
            <Text style={{ color: COURT.inkMuted, fontSize: 15, marginTop: 10 }}>
              {t('winModal.duration', { minutes })}
            </Text>
          )}

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 18 }}>
            {winningPlayers.map((name, index) => (
              <View
                key={name}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  height: 36,
                  paddingHorizontal: 12,
                  borderRadius: 999,
                  backgroundColor: `${COURT.line}14`,
                }}
              >
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: PADDLE_FACE[colorOf(name, index === 0 ? 'coral' : 'carbon')],
                  }}
                />
                <Text style={{ color: COURT.ink, fontSize: 15, fontWeight: '600' }}>{name}</Text>
              </View>
            ))}
            <View style={{ justifyContent: 'center' }}>
              <Text style={{ color: COURT.inkMuted, fontSize: 15 }}>
                {t('winModal.beat', { name: loserName })}
              </Text>
            </View>
          </View>

          {showCard && (
            <View style={{ marginTop: 22 }}>
              <ShareCard gameState={gameState} winner={winner} />
            </View>
          )}

          <View style={{ flex: 1 }} />

          <View style={{ gap: 10, marginTop: 24 }}>
            {onBackToSession && <CourtButton title={t('openPlay.backToOpenPlay')} onPress={onBackToSession} height={52} />}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <CourtButton
                title={t('winModal.share')}
                variant={onBackToSession ? 'deep' : 'line'}
                onPress={() => setShowCard(current => !current)}
                height={52}
                style={{ flex: 1 }}
              />
              <CourtButton
                title={t('winModal.playAgain')}
                variant="deep"
                onPress={onPlayAgain}
                height={52}
                style={{ flex: 1 }}
              />
            </View>
            {!onBackToSession && <CourtButton title={t('common.exit')} variant="outline" onPress={onExit} height={48} />}
          </View>
        </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </Modal>
  );
}
