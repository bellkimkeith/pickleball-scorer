import { memo } from 'react';
import { Share, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COURT } from '../../lib/theme/tokens';
import { DoublesGameState, GameState, SinglesGameState } from '../../lib/types/game';
import { getGameResult } from '../../lib/utils/game-result';
import { CourtButton } from '../ui/Button';

interface ShareCardProps {
  gameState: GameState;
  winner: 1 | 2;
  /** Hides the share button when the card is only being displayed. */
  showAction?: boolean;
}

const PLATE = '#1f4b7d';

function ShareCardComponent({ gameState, winner, showAction = true }: ShareCardProps) {
  const { t } = useTranslation();
  const { score1, score2 } = getGameResult(gameState);

  const name1 =
    gameState.mode === 'singles'
      ? (gameState as SinglesGameState).player1.name
      : (gameState as DoublesGameState).team1.name;
  const name2 =
    gameState.mode === 'singles'
      ? (gameState as SinglesGameState).player2.name
      : (gameState as DoublesGameState).team2.name;

  const winnerName = winner === 1 ? name1 : name2;
  const loserName = winner === 1 ? name2 : name1;
  const high = Math.max(score1, score2);
  const low = Math.min(score1, score2);

  const minutes =
    gameState.gameEndTime && gameState.gameStartTime
      ? Math.max(1, Math.round((gameState.gameEndTime - gameState.gameStartTime) / 60000))
      : null;

  const date = new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const share = () => {
    const mode = gameState.mode === 'singles' ? t('home.singles') : t('home.doubles');
    Share.share({
      message: `${mode}\n${winnerName} ${high} – ${low} ${loserName}\n\n${t('home.title')}`,
    }).catch(() => {});
  };

  return (
    <View>
      <View
        style={{
          aspectRatio: 4 / 5,
          borderRadius: 18,
          overflow: 'hidden',
          backgroundColor: COURT.inner,
          borderWidth: 3,
          borderColor: COURT.line,
        }}
      >
        {/* court seen from above: net across the middle */}
        <View style={{ position: 'absolute', left: 0, right: 0, top: '36%', bottom: '36%', backgroundColor: COURT.kitchen }} />
        <View style={{ position: 'absolute', left: 0, right: 0, top: '36%', height: 3, backgroundColor: COURT.line }} />
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: '36%', height: 3, backgroundColor: COURT.line }} />
        <View style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 3, backgroundColor: COURT.line }} />
        <View style={{ position: 'absolute', left: '50%', top: 0, height: '36%', width: 3, backgroundColor: COURT.line }} />
        <View style={{ position: 'absolute', left: '50%', bottom: 0, height: '36%', width: 3, backgroundColor: COURT.line }} />

        <View style={{ flex: 1, justifyContent: 'space-between', padding: 18 }}>
          <View style={{ alignSelf: 'flex-start', backgroundColor: PLATE, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 5 }}>
            <Text style={{ color: '#dce8f5', fontSize: 12, fontWeight: '700', letterSpacing: 0.8 }}>
              {date.toUpperCase()} · {(gameState.mode === 'singles' ? t('home.singles') : t('home.doubles')).toUpperCase()}
            </Text>
          </View>

          <Text
            style={{
              color: COURT.ink,
              fontSize: 72,
              fontWeight: '800',
              letterSpacing: -2,
              textAlign: 'center',
              fontVariant: ['tabular-nums'],
              textShadowColor: '#00000066',
              textShadowRadius: 10,
              textShadowOffset: { width: 0, height: 2 },
            }}
          >
            {high}–{low}
          </Text>

          <View style={{ alignSelf: 'flex-start', backgroundColor: PLATE, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 }}>
            <Text style={{ color: COURT.ink, fontSize: 19, fontWeight: '800' }}>{winnerName}</Text>
            <Text style={{ color: '#dce8f5', fontSize: 14 }}>
              {t('winModal.beat', { name: loserName })}
              {minutes ? ` · ${t('winModal.duration', { minutes })}` : ''}
            </Text>
            <Text style={{ color: '#dce8f5', fontSize: 11, marginTop: 8, opacity: 0.8 }}>{t('home.title')}</Text>
          </View>
        </View>
      </View>

      {showAction && (
        <CourtButton title={t('winModal.share')} icon="share-outline" onPress={share} style={{ marginTop: 12 }} />
      )}
    </View>
  );
}

export const ShareCard = memo(ShareCardComponent);
