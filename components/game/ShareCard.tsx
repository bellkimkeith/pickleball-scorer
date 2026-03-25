import { View, Text, Pressable, StyleSheet, Share } from 'react-native';
import { memo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useDarkMode } from '../../hooks/useDarkMode';
import { GameState, SinglesGameState, DoublesGameState } from '../../lib/types/game';

interface ShareCardProps {
  gameState: GameState;
  winner: 1 | 2;
  isPro?: boolean;
}

function ShareCardComponent({ gameState, winner, isPro = false }: ShareCardProps) {
  const { isDarkMode } = useDarkMode();

  const getPlayer1Name = () => {
    if (gameState.mode === 'singles') {
      return (gameState as SinglesGameState).player1.name;
    }
    return (gameState as DoublesGameState).team1.name;
  };

  const getPlayer2Name = () => {
    if (gameState.mode === 'singles') {
      return (gameState as SinglesGameState).player2.name;
    }
    return (gameState as DoublesGameState).team2.name;
  };

  const getWinnerName = () => {
    return winner === 1 ? getPlayer1Name() : getPlayer2Name();
  };

  const handleShare = async () => {
    const mode = gameState.mode === 'singles' ? 'Singles' : 'Doubles';
    const message = `🎾 Pickle & Score\n\n${mode} Match\n${getPlayer1Name()} ${gameState.score1} - ${gameState.score2} ${getPlayer2Name()}\n\nWinner: ${getWinnerName()}!`;
    
    try {
      await Share.share({
        message,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <View style={[styles.container, isDarkMode ? styles.containerDark : styles.containerLight]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="tennisball" size={24} color="#16a34a" />
          <Text style={[styles.appName, isDarkMode ? styles.appNameDark : styles.appNameLight]}>
            Pickle & Score
          </Text>
        </View>
        <Text style={[styles.date, isDarkMode ? styles.dateDark : styles.dateLight]}>
          {formatDate()}
        </Text>
      </View>

      {/* Match Info */}
      <View style={styles.matchInfo}>
        <Text style={[styles.matchType, isDarkMode ? styles.matchTypeDark : styles.matchTypeLight]}>
          {gameState.mode === 'singles' ? 'Singles Match' : 'Doubles Match'}
        </Text>
      </View>

      {/* Score Display */}
      <View style={styles.scoreContainer}>
        <View style={styles.playerSection}>
          <View style={[
            styles.playerAvatar,
            winner === 1 ? styles.playerAvatarWinner : isDarkMode ? styles.playerAvatarDark : styles.playerAvatarLight
          ]}>
            <Ionicons 
              name={gameState.mode === 'singles' ? 'person' : 'people'} 
              size={20} 
              color={winner === 1 ? '#ffffff' : isDarkMode ? '#f3f4f6' : '#1f2937'} 
            />
          </View>
          <Text style={[
            styles.playerName, 
            winner === 1 && styles.playerNameWinner,
            isDarkMode ? styles.playerNameDark : styles.playerNameLight
          ]}>
            {getPlayer1Name()}
          </Text>
        </View>

        <View style={styles.scoreDisplay}>
          <Text style={[styles.score, winner === 1 ? styles.scoreWinner : isDarkMode ? styles.scoreDark : styles.scoreLight]}>
            {gameState.score1}
          </Text>
          <Text style={[styles.scoreDivider, isDarkMode ? styles.scoreDividerDark : styles.scoreDividerLight]}>
            -
          </Text>
          <Text style={[styles.score, winner === 2 ? styles.scoreWinner : isDarkMode ? styles.scoreDark : styles.scoreLight]}>
            {gameState.score2}
          </Text>
        </View>

        <View style={styles.playerSection}>
          <View style={[
            styles.playerAvatar,
            winner === 2 ? styles.playerAvatarWinner : isDarkMode ? styles.playerAvatarDark : styles.playerAvatarLight
          ]}>
            <Ionicons 
              name={gameState.mode === 'singles' ? 'person' : 'people'} 
              size={20} 
              color={winner === 2 ? '#ffffff' : isDarkMode ? '#f3f4f6' : '#1f2937'} 
            />
          </View>
          <Text style={[
            styles.playerName, 
            winner === 2 && styles.playerNameWinner,
            isDarkMode ? styles.playerNameDark : styles.playerNameLight
          ]}>
            {getPlayer2Name()}
          </Text>
        </View>
      </View>

      {/* Winner Banner */}
      <View style={styles.winnerBanner}>
        <Ionicons name="trophy" size={20} color="#f59e0b" />
        <Text style={styles.winnerText}>
          {getWinnerName()} Wins!
        </Text>
      </View>

      {/* Share Button */}
      <Pressable 
        onPress={handleShare} 
        style={({ pressed }) => [
          styles.shareButton,
          pressed && styles.shareButtonPressed
        ]}
      >
        <Ionicons name="share-outline" size={20} color="#ffffff" />
        <Text style={styles.shareButtonText}>Share Match</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    marginTop: 16,
  },
  containerLight: {
    backgroundColor: '#ffffff',
  },
  containerDark: {
    backgroundColor: '#1f2937',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appName: {
    fontSize: 16,
    fontWeight: '700',
  },
  appNameLight: {
    color: '#1f2937',
  },
  appNameDark: {
    color: '#f3f4f6',
  },
  date: {
    fontSize: 12,
    fontWeight: '500',
  },
  dateLight: {
    color: '#6b7280',
  },
  dateDark: {
    color: '#9ca3af',
  },
  matchInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  matchType: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  matchTypeLight: {
    color: '#16a34a',
  },
  matchTypeDark: {
    color: '#22c55e',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  playerSection: {
    alignItems: 'center',
    flex: 1,
  },
  playerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  playerAvatarLight: {
    backgroundColor: '#f3f4f6',
  },
  playerAvatarDark: {
    backgroundColor: '#374151',
  },
  playerAvatarWinner: {
    backgroundColor: '#16a34a',
  },
  playerName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  playerNameLight: {
    color: '#1f2937',
  },
  playerNameDark: {
    color: '#f3f4f6',
  },
  playerNameWinner: {
    color: '#16a34a',
  },
  scoreDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  score: {
    fontSize: 48,
    fontWeight: '800',
  },
  scoreLight: {
    color: '#1f2937',
  },
  scoreDark: {
    color: '#f3f4f6',
  },
  scoreWinner: {
    color: '#16a34a',
  },
  scoreDivider: {
    fontSize: 36,
    fontWeight: '500',
  },
  scoreDividerLight: {
    color: '#d1d5db',
  },
  scoreDividerDark: {
    color: '#4b5563',
  },
  winnerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fef3c7',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  winnerText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400e',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  shareButtonPressed: {
    backgroundColor: '#15803d',
  },
  shareButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export const ShareCard = memo(ShareCardComponent);
