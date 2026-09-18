import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useStatsStore } from '../../store/stats-store';
import { StatsCard } from '../../components/stats/StatsCard';
import { useDarkMode } from '../../hooks/useDarkMode';
import { GameRecord } from '../../lib/storage/game-history';

export default function StatsScreen() {
  const router = useRouter();
  const { isDarkMode } = useDarkMode();
  const { t } = useTranslation();
  
  const {
    recentGames,
    wins,
    losses,
    winRate,
    currentStreak,
    totalGames,
    loadHistory,
  } = useStatsStore();
  

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  const renderGameItem = (game: GameRecord, index: number) => {
    const isWin = game.winner === 1;
    
    return (
      <View 
        key={game.id || index} 
        style={[
          styles.gameItem,
          isDarkMode ? styles.gameItemDark : styles.gameItemLight
        ]}
      >
        <View style={styles.gameInfo}>
          <Text style={[styles.gameMode, isDarkMode ? styles.gameModeDark : styles.gameModeLight]}>
            {game.mode === 'singles' ? 'Singles' : 'Doubles'}
          </Text>
          <Text style={[styles.gameDate, isDarkMode ? styles.gameDateDark : styles.gameDateLight]}>
            {formatDate(game.date)}
          </Text>
        </View>
        
        <View style={styles.gameScore}>
          <Text style={[styles.playerName, isDarkMode ? styles.playerNameDark : styles.playerNameLight]}>
            {game.player1}
          </Text>
          <View style={styles.scoreContainer}>
            <Text style={[styles.score, isWin ? styles.scoreWin : styles.scoreLoss]}>
              {game.score1}
            </Text>
            <Text style={[styles.scoreSeparator, isDarkMode ? styles.scoreSeparatorDark : styles.scoreSeparatorLight]}>
              -
            </Text>
            <Text style={[styles.score, !isWin ? styles.scoreWin : styles.scoreLoss]}>
              {game.score2}
            </Text>
          </View>
          <Text style={[styles.playerName, isDarkMode ? styles.playerNameDark : styles.playerNameLight]}>
            {game.player2}
          </Text>
        </View>

        <View style={[
          styles.resultBadge,
          isWin ? styles.resultBadgeWin : styles.resultBadgeLoss
        ]}>
          <Text style={styles.resultBadgeText}>
            {isWin ? 'W' : 'L'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`} edges={['top']}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#f3f4f6' : '#1f2937'} />
          </Pressable>
          <Text style={[styles.title, isDarkMode ? styles.titleDark : styles.titleLight]}>
            {t('stats.title', 'Stats')}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Stats Card */}
        <StatsCard
          wins={wins}
          losses={losses}
          winRate={winRate}
          streak={currentStreak}
          totalGames={totalGames}
        />

        {/* Recent Games */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, isDarkMode ? styles.sectionTitleDark : styles.sectionTitleLight]}>
            {t('stats.recentGames', 'Recent Games')}
          </Text>
        </View>

        {recentGames.length === 0 ? (
          <View style={[styles.emptyState, isDarkMode ? styles.emptyStateDark : styles.emptyStateLight]}>
            <Ionicons name="tennisball-outline" size={48} color={isDarkMode ? '#4b5563' : '#9ca3af'} />
            <Text style={[styles.emptyText, isDarkMode ? styles.emptyTextDark : styles.emptyTextLight]}>
              {t('stats.noGames', 'No games yet')}
            </Text>
            <Text style={[styles.emptySubtext, isDarkMode ? styles.emptySubtextDark : styles.emptySubtextLight]}>
              Play your first match to see stats here
            </Text>
          </View>
        ) : (
          <View style={styles.gamesList}>
            {recentGames.map((game, index) => 
              renderGameItem(game, index)
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  titleLight: {
    color: '#1f2937',
  },
  titleDark: {
    color: '#f3f4f6',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionTitleLight: {
    color: '#1f2937',
  },
  sectionTitleDark: {
    color: '#f3f4f6',
  },
  gamesList: {
    gap: 12,
  },
  gameItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  gameItemLight: {
    backgroundColor: '#ffffff',
  },
  gameItemDark: {
    backgroundColor: '#1f2937',
  },
  gameInfo: {
    marginRight: 12,
  },
  gameMode: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  gameModeLight: {
    color: '#16a34a',
  },
  gameModeDark: {
    color: '#22c55e',
  },
  gameDate: {
    fontSize: 12,
    marginTop: 2,
  },
  gameDateLight: {
    color: '#6b7280',
  },
  gameDateDark: {
    color: '#9ca3af',
  },
  gameScore: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  playerNameLight: {
    color: '#1f2937',
  },
  playerNameDark: {
    color: '#f3f4f6',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  score: {
    fontSize: 20,
    fontWeight: '800',
  },
  scoreWin: {
    color: '#16a34a',
  },
  scoreLoss: {
    color: '#ea580c',
  },
  scoreSeparator: {
    fontSize: 16,
    fontWeight: '500',
  },
  scoreSeparatorLight: {
    color: '#9ca3af',
  },
  scoreSeparatorDark: {
    color: '#6b7280',
  },
  resultBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultBadgeWin: {
    backgroundColor: '#16a34a',
  },
  resultBadgeLoss: {
    backgroundColor: '#ea580c',
  },
  resultBadgeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    borderRadius: 20,
  },
  emptyStateLight: {
    backgroundColor: '#ffffff',
  },
  emptyStateDark: {
    backgroundColor: '#1f2937',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyTextLight: {
    color: '#1f2937',
  },
  emptyTextDark: {
    color: '#f3f4f6',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  emptySubtextLight: {
    color: '#6b7280',
  },
  emptySubtextDark: {
    color: '#9ca3af',
  },
});
