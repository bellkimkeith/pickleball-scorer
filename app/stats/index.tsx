import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton } from '../../components/ui/BackButton';
import { ListGroup, ListRow } from '../../components/ui/ListGroup';
import { GameRecord } from '../../lib/storage/game-history';
import { COURT } from '../../lib/theme/tokens';
import { useSessionStore } from '../../store/session-store';
import { useStatsStore } from '../../store/stats-store';

function dayLabel(timestamp: number, todayLabel: string): string {
  const date = new Date(timestamp);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return todayLabel;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function duration(from: number, to: number): string {
  const minutes = Math.max(0, Math.round((to - from) / 60000));
  const hours = Math.floor(minutes / 60);
  return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
}

export default function StatsScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const recentGames = useStatsStore(state => state.recentGames);
  const currentStreak = useStatsStore(state => state.currentStreak);
  const loadHistory = useStatsStore(state => state.loadHistory);
  const openPlayHistory = useSessionStore(state => state.openPlayHistory);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const lastTwenty = useMemo(() => recentGames.slice(0, 20), [recentGames]);
  const wonOfLast = lastTwenty.filter(game => game.winner === 1).length;

  const streakLine =
    lastTwenty.length === 0
      ? null
      : recentGames[0]?.winner === 1
        ? t('stats.streakWins', { count: currentStreak })
        : t('stats.streakLosses', { count: currentStreak });

  const gameRow = (game: GameRecord) => {
    const won = game.winner === 1;
    return (
      <View
        key={game.id}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingHorizontal: 14,
          height: 52,
        }}
      >
        <View
          style={{
            width: 26,
            height: 26,
            borderRadius: 7,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: won ? COURT.line : 'transparent',
            borderWidth: won ? 0 : 1.5,
            borderColor: `${COURT.line}40`,
          }}
        >
          <Text style={{ color: won ? COURT.lineText : COURT.inkMuted, fontSize: 13, fontWeight: '800' }}>
            {won ? t('stats.winShort') : t('stats.lossShort')}
          </Text>
        </View>
        <Text style={{ color: COURT.ink, fontSize: 16, fontWeight: '600', fontVariant: ['tabular-nums'] }}>
          {game.score1}–{game.score2}
        </Text>
        <Text style={{ color: COURT.inkMuted, fontSize: 15, flex: 1 }} numberOfLines={1}>
          {t('stats.versus', { name: game.player2 })}
        </Text>
        <Text style={{ color: COURT.inkMuted, fontSize: 14 }}>{dayLabel(game.date, t('stats.today'))}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <StatusBar style="light" />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <BackButton />

        <Text style={{ color: COURT.ink, fontSize: 34, fontWeight: '700', paddingHorizontal: 16, paddingTop: 4 }}>
          {t('stats.title')}
        </Text>
        <Text style={{ color: COURT.inkMuted, fontSize: 15, paddingHorizontal: 16, paddingTop: 2, paddingBottom: 16 }}>
          {t('stats.onThisPhone')}
        </Text>

        {lastTwenty.length === 0 ? (
          <View style={{ marginHorizontal: 12, padding: 20, borderRadius: 14, backgroundColor: `${COURT.line}0f` }}>
            <Text style={{ color: COURT.ink, fontSize: 17, fontWeight: '600' }}>{t('stats.noGames')}</Text>
            <Text style={{ color: COURT.inkMuted, fontSize: 15, marginTop: 4 }}>{t('stats.noGamesDesc')}</Text>
          </View>
        ) : (
          <View
            style={{
              marginHorizontal: 12,
              padding: 16,
              borderRadius: 14,
              backgroundColor: `${COURT.line}0f`,
              borderWidth: 1,
              borderColor: `${COURT.line}14`,
            }}
          >
            <Text style={{ color: COURT.ink, fontSize: 20, fontWeight: '700', lineHeight: 27 }}>
              {t('stats.wonOfLast', { won: wonOfLast, total: lastTwenty.length })}
              {streakLine ? ` ` : ''}
              {streakLine && <Text style={{ color: COURT.inkMuted, fontWeight: '600' }}>{streakLine}</Text>}
            </Text>

            <View style={{ flexDirection: 'row', gap: 3, marginTop: 14 }}>
              {[...lastTwenty].reverse().map(game => (
                <View
                  key={game.id}
                  style={{
                    flex: 1,
                    height: 22,
                    borderRadius: 3,
                    backgroundColor: game.winner === 1 ? COURT.line : 'transparent',
                    borderWidth: game.winner === 1 ? 0 : 1.5,
                    borderColor: `${COURT.line}55`,
                  }}
                />
              ))}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
              <Text style={{ color: COURT.inkMuted, fontSize: 12 }}>
                {t('stats.gamesAgo', { count: lastTwenty.length })}
              </Text>
              <Text style={{ color: COURT.inkMuted, fontSize: 12 }}>{t('stats.latest')}</Text>
            </View>
          </View>
        )}

        {recentGames.length > 0 && (
          <>
            <Text style={{ color: COURT.ink, fontSize: 17, fontWeight: '700', paddingHorizontal: 16, paddingTop: 22, paddingBottom: 8 }}>
              {t('stats.recentGames')}
            </Text>
            <View
              style={{
                marginHorizontal: 12,
                borderRadius: 14,
                backgroundColor: `${COURT.line}0f`,
                borderWidth: 1,
                borderColor: `${COURT.line}14`,
                overflow: 'hidden',
              }}
            >
              {recentGames.slice(0, 20).map((game, index) => (
                <View key={game.id}>
                  {index > 0 && <View style={{ height: 1, backgroundColor: `${COURT.line}14`, marginLeft: 14 }} />}
                  {gameRow(game)}
                </View>
              ))}
            </View>
          </>
        )}

        {openPlayHistory.length > 0 && (
          <>
            <Text style={{ color: COURT.ink, fontSize: 17, fontWeight: '700', paddingHorizontal: 16, paddingTop: 22, paddingBottom: 8 }}>
              {t('stats.openPlaySessions')}
            </Text>
            <ListGroup style={{ marginHorizontal: 12 }}>
              {openPlayHistory.slice(0, 10).map(session => (
                <ListRow
                  key={session.id}
                  label={dayLabel(session.startedAt, t('stats.today'))}
                  value={`${t('openPlay.playersCount', { count: session.players.length })} · ${duration(
                    session.startedAt,
                    session.endedAt ?? session.startedAt,
                  )}`}
                  chevron
                  onPress={() => router.push(`/queue/summary?sessionId=${session.id}`)}
                />
              ))}
            </ListGroup>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
