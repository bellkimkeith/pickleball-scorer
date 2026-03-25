import { View, Text, StyleSheet } from 'react-native';
import { memo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useTranslation } from 'react-i18next';

interface StatsCardProps {
  wins: number;
  losses: number;
  winRate: number;
  streak: number;
  totalGames: number;
}

function StatsCardComponent({
  wins,
  losses,
  winRate,
  streak,
  totalGames,
}: StatsCardProps) {
  const { isDarkMode } = useDarkMode();
  const { t } = useTranslation();

  return (
    <View style={[styles.container, isDarkMode ? styles.containerDark : styles.containerLight]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDarkMode ? styles.titleDark : styles.titleLight]}>
          {t('stats.winLoss', 'Win / Loss')}
        </Text>
        <View style={styles.streakBadge}>
          <Ionicons 
            name={streak > 0 ? 'flame' : 'remove'} 
            size={16} 
            color={streak > 0 ? '#f59e0b' : '#9ca3af'} 
          />
          <Text style={[styles.streakText, isDarkMode ? styles.streakTextDark : styles.streakTextLight]}>
            {streak > 0 ? `${streak} ${t('stats.win', 'Win')}` : streak < 0 ? `${Math.abs(streak)} ${t('stats.loss', 'Loss')}` : '-'}
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#16a34a' }]}>{wins}</Text>
          <Text style={[styles.statLabel, isDarkMode ? styles.statLabelDark : styles.statLabelLight]}>
            {t('stats.win', 'Wins')}
          </Text>
        </View>

        <View style={styles.winRateContainer}>
          <View style={styles.winRateCircle}>
            <Text style={[styles.winRateValue, isDarkMode ? styles.winRateValueDark : styles.winRateValueLight]}>
              {winRate}%
            </Text>
          </View>
          <Text style={[styles.winRateLabel, isDarkMode ? styles.statLabelDark : styles.statLabelLight]}>
            {t('stats.winRate', 'Win Rate')}
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#ea580c' }]}>{losses}</Text>
          <Text style={[styles.statLabel, isDarkMode ? styles.statLabelDark : styles.statLabelLight]}>
            {t('stats.loss', 'Losses')}
          </Text>
        </View>
      </View>

      <View style={[styles.totalGames, isDarkMode ? styles.totalGamesDark : styles.totalGamesLight]}>
        <Text style={[styles.totalGamesText, isDarkMode ? styles.totalGamesTextDark : styles.totalGamesTextLight]}>
          {t('stats.gamesPlayed', 'Games Played')}: {totalGames}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  containerLight: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  containerDark: {
    backgroundColor: '#1f2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  titleLight: {
    color: '#1f2937',
  },
  titleDark: {
    color: '#f3f4f6',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '600',
  },
  streakTextLight: {
    color: '#f59e0b',
  },
  streakTextDark: {
    color: '#fbbf24',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 36,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  statLabelLight: {
    color: '#6b7280',
  },
  statLabelDark: {
    color: '#9ca3af',
  },
  winRateContainer: {
    alignItems: 'center',
  },
  winRateCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  winRateValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  winRateValueLight: {
    color: '#ffffff',
  },
  winRateValueDark: {
    color: '#ffffff',
  },
  winRateLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
  },
  totalGames: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  totalGamesLight: {
    backgroundColor: '#f3f4f6',
  },
  totalGamesDark: {
    backgroundColor: '#374151',
  },
  totalGamesText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  totalGamesTextLight: {
    color: '#6b7280',
  },
  totalGamesTextDark: {
    color: '#9ca3af',
  },
});

export const StatsCard = memo(StatsCardComponent);
