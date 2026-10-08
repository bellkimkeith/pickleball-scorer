import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Paddle } from '../../components/court/Paddle';
import { NameInputSheet } from '../../components/queue/NameInputSheet';
import { CourtButton } from '../../components/ui/Button';
import { ListGroup, ListRow } from '../../components/ui/ListGroup';
import { pairingHistory } from '../../lib/queue/engine';
import { COURT, PADDLE_FACE } from '../../lib/theme/tokens';
import { useSessionStore } from '../../store/session-store';

function clockTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function duration(from: number, to: number): string {
  const minutes = Math.max(0, Math.round((to - from) / 60000));
  const hours = Math.floor(minutes / 60);
  return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
}

export default function SummaryScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
  const session = useSessionStore(state =>
    sessionId
      ? state.openPlayHistory.find(entry => entry.id === sessionId)
      : state.openPlayHistory[0],
  );
  const saveGroup = useSessionStore(state => state.saveGroup);
  const [namingGroup, setNamingGroup] = useState(false);

  const players = useMemo(
    () => (session ? [...session.players].sort((a, b) => b.gamesPlayed - a.gamesPlayed) : []),
    [session],
  );

  const topPairs = useMemo(() => {
    if (!session) return [] as { a: string; b: string; count: number }[];
    const { partnered } = pairingHistory(session);
    const byId = new Map(session.players.map(p => [p.id, p.name]));
    return Object.entries(partnered)
      .filter(([, count]) => count > 1)
      .sort((x, y) => y[1] - x[1])
      .slice(0, 3)
      .map(([key, count]) => {
        const [a, b] = key.split('|');
        return { a: byId.get(a) ?? a, b: byId.get(b) ?? b, count };
      });
  }, [session]);

  if (!session) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ color: COURT.inkMuted, fontSize: 16 }}>{t('stats.noGames')}</Text>
          <CourtButton title={t('openPlay.done')} onPress={() => router.replace('/')} style={{ marginTop: 16 }} />
        </View>
      </SafeAreaView>
    );
  }

  const onTime = session.players.filter(p => p.queueCount === p.gamesPlayed);
  const late = session.players.filter(p => p.queueCount > p.gamesPlayed);
  const counts = onTime.map(p => p.gamesPlayed);
  const min = counts.length > 0 ? Math.min(...counts) : 0;
  const max = counts.length > 0 ? Math.max(...counts) : 0;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <StatusBar style="light" />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        <Text style={{ color: COURT.ink, fontSize: 34, fontWeight: '700', paddingHorizontal: 16, paddingTop: 18 }}>
          {t('openPlay.summaryTitle')}
        </Text>
        <Text style={{ color: COURT.inkMuted, fontSize: 15, paddingHorizontal: 16, paddingTop: 2, paddingBottom: 16 }}>
          {t('openPlay.summaryMeta', {
            duration: duration(session.startedAt, session.endedAt ?? Date.now()),
            games: t('openPlay.gamesCount', { count: session.matches.filter(m => m.endedAt).length }),
            courts: t('openPlay.courtsCount', { count: session.courtCount }),
          })}
        </Text>

        <View
          style={{
            marginHorizontal: 12,
            padding: 16,
            borderRadius: 14,
            backgroundColor: COURT.line,
          }}
        >
          <Text style={{ color: COURT.lineText, fontSize: 22, fontWeight: '800', lineHeight: 28 }}>
            {min === max
              ? t('openPlay.fairnessSame', { count: min })
              : t('openPlay.fairnessRange', { min, max })}
          </Text>
          {late.map(player => (
            <Text key={player.id} style={{ color: '#3d5a4e', fontSize: 14, marginTop: 6, lineHeight: 20 }}>
              {t('openPlay.fairnessLate', {
                name: player.name,
                time: clockTime(player.arrivedAt),
                count: player.gamesPlayed,
              })}
            </Text>
          ))}
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 12, paddingTop: 18 }}>
          {players.map(player => (
            <Paddle
              key={player.id}
              name={player.name}
              color={player.color}
              games={player.gamesPlayed}
              size="head"
            />
          ))}
        </View>

        <Text style={{ color: COURT.ink, fontSize: 17, fontWeight: '700', paddingHorizontal: 16, paddingTop: 22, paddingBottom: 8 }}>
          {t('openPlay.everyone')}
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
          {players.map((player, index) => (
            <View key={player.id}>
              {index > 0 && <View style={{ height: 1, backgroundColor: `${COURT.line}14`, marginLeft: 14 }} />}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, height: 48 }}>
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: PADDLE_FACE[player.color],
                  }}
                />
                <Text style={{ color: COURT.ink, fontSize: 16, flex: 1 }} numberOfLines={1}>
                  {player.name}
                </Text>
                {player.queueCount > player.gamesPlayed && (
                  <Text style={{ color: COURT.inkMuted, fontSize: 13 }}>
                    {t('openPlay.arrived', { time: clockTime(player.arrivedAt) })}
                  </Text>
                )}
                <Text
                  style={{
                    color: COURT.ink,
                    fontSize: 16,
                    fontWeight: '700',
                    fontVariant: ['tabular-nums'],
                    minWidth: 22,
                    textAlign: 'right',
                  }}
                >
                  {player.gamesPlayed}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <ListGroup style={{ marginHorizontal: 12, marginTop: 20 }}>
          <ListRow
            stacked
            label={t('openPlay.frequentPartners')}
            value={
              topPairs.length === 0
                ? t('openPlay.noRepeats')
                : topPairs
                    .map(pair => t('openPlay.repeatedPair', { a: pair.a, b: pair.b, count: pair.count }))
                    .join(', ')
            }
          />
          <ListRow label={t('openPlay.saveGroup')} chevron onPress={() => setNamingGroup(true)} />
        </ListGroup>
      </ScrollView>

      <View style={{ padding: 16, paddingBottom: 30 }}>
        <CourtButton title={t('openPlay.done')} onPress={() => router.replace('/')} height={52} />
      </View>

      <NameInputSheet
        visible={namingGroup}
        title={t('openPlay.saveGroup')}
        placeholder={t('openPlay.groupNamePlaceholder')}
        confirmLabel={t('openPlay.saveGroup')}
        onSubmit={name => {
          saveGroup(
            name,
            session.players.map(p => p.id),
          );
          setNamingGroup(false);
        }}
        onClose={() => setNamingGroup(false)}
      />
    </SafeAreaView>
  );
}
