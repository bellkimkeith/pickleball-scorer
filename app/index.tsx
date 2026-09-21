import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MiniCourt } from '../components/court/MiniCourt';
import { ListGroup, ListRow } from '../components/ui/ListGroup';
import { COURT } from '../lib/theme/tokens';
import { useSessionStore } from '../store/session-store';
import { useStatsStore } from '../store/stats-store';

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const activeSession = useSessionStore(state => state.activeSession);
  const savedPlayers = useSessionStore(state => state.savedPlayers);
  const totalGames = useStatsStore(state => state.totalGames);
  const loadHistory = useStatsStore(state => state.loadHistory);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const modeTile = (
    label: string,
    description: string,
    perSide: 1 | 2,
    onPress: () => void,
  ) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}. ${description}`}
      style={{ flex: 1 }}
    >
      <View
        style={{
          height: 128,
          borderRadius: 16,
          backgroundColor: `${COURT.line}10`,
          borderWidth: 1,
          borderColor: `${COURT.line}1f`,
          padding: 14,
          justifyContent: 'space-between',
        }}
      >
        <MiniCourt perSide={perSide} />
        <View>
          <Text style={{ color: COURT.ink, fontSize: 19, fontWeight: '700' }}>{label}</Text>
          <Text style={{ color: COURT.inkMuted, fontSize: 13 }}>{description}</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COURT.outer }} edges={['top']}>
      <StatusBar style="light" />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 16, paddingTop: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: COURT.ink, fontSize: 34, fontWeight: '800', lineHeight: 38 }}>
              {t('home.title')}
            </Text>
            <Text style={{ color: COURT.inkMuted, fontSize: 15, marginTop: 2 }}>{t('home.subtitle')}</Text>
          </View>
          <Pressable
            onPress={() => router.push('/settings')}
            accessibilityRole="button"
            accessibilityLabel={t('settings.title')}
            hitSlop={10}
            style={{ padding: 4 }}
          >
            <Ionicons name="settings-outline" size={26} color={COURT.ink} />
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 12, paddingTop: 18 }}>
          <Pressable
            onPress={() => router.push(activeSession ? '/queue/session' : '/queue')}
            accessibilityRole="button"
            accessibilityLabel={activeSession ? t('openPlay.resume') : t('openPlay.homeCard')}
          >
            <View
              style={{
                height: 160,
                justifyContent: 'flex-end',
                padding: 16,
                borderRadius: 20,
                overflow: 'hidden',
                backgroundColor: COURT.inner,
                borderWidth: 2,
                borderColor: COURT.line,
              }}
            >
              <View style={{ position: 'absolute', left: '27%', width: '23%', top: 0, bottom: 0, backgroundColor: COURT.kitchen }} />
              <View style={{ position: 'absolute', right: '27%', width: '23%', top: 0, bottom: 0, backgroundColor: COURT.kitchen }} />
              <View style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, backgroundColor: COURT.line }} />
              <View style={{ position: 'absolute', left: 0, width: '27%', top: '50%', height: 2, backgroundColor: COURT.line }} />
              <View style={{ position: 'absolute', right: 0, width: '27%', top: '50%', height: 2, backgroundColor: COURT.line }} />
              <View style={{ alignSelf: 'flex-start', backgroundColor: '#1f4b7d', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 }}>
                <Text style={{ color: COURT.ink, fontSize: 24, fontWeight: '800' }}>
                  {activeSession ? t('openPlay.resume') : t('openPlay.homeCard')}
                </Text>
                <Text style={{ color: '#dce8f5', fontSize: 14, marginTop: 2 }}>
                  {activeSession
                    ? t('openPlay.resumeDesc', {
                        count: activeSession.players.filter(p => p.status !== 'left').length,
                        courts: activeSession.courtCount,
                      })
                    : t('openPlay.homeCardDesc')}
                </Text>
              </View>
            </View>
          </Pressable>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 12, paddingTop: 12 }}>
          {modeTile(t('home.singles'), t('home.singlesDesc'), 1, () => router.push('/(game)/singles'))}
          {modeTile(t('home.doubles'), t('home.doublesDesc'), 2, () => router.push('/(game)/doubles'))}
        </View>

        <ListGroup style={{ marginHorizontal: 12, marginTop: 16 }}>
          <ListRow
            label={t('stats.title')}
            value={t('openPlay.gamesCount', { count: totalGames })}
            chevron
            onPress={() => router.push('/stats')}
          />
          <ListRow
            label={t('home.savedPlayers')}
            value={String(savedPlayers.length)}
            chevron
            onPress={() => router.push('/queue')}
          />
        </ListGroup>
      </ScrollView>
    </SafeAreaView>
  );
}
