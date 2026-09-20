import { View, Text, Pressable, StyleSheet, Share } from 'react-native';
import { memo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { getGameResult } from '../../lib/utils/game-result';
import { useDarkMode } from '../../hooks/useDarkMode';
import { GameState, SinglesGameState, DoublesGameState } from '../../lib/types/game';

interface ShareCardProps {
  gameState: GameState;
  winner: 1 | 2;
}

function ShareCardComponent({ gameState, winner }: ShareCardProps) {
  const { score1, score2 } = getGameResult(gameState);
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
    const message = `🎾 Pickle & Score\n\n${mode} Match\n${getPlayer1Name()} ${score1} - ${score2} ${getPlayer2Name()}\n\nWinner: ${getWinnerName()}!`;
    
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
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, isDarkMode ? styles.iconContainerDark : styles.iconContainerLight]}>
            <Ionicons name="tennisball" size={18} color={isDarkMode ? '#22c55e' : '#16a34a'} />
          </View>
          <View>
            <Text style={[styles.appName, isDarkMode ? styles.appNameDark : styles.appNameLight]}>
              Pickle & Score
            </Text>
            <Text style={[styles.date, isDarkMode ? styles.dateDark : styles.dateLight]}>
              {formatDate()}
            </Text>
          </View>
        </View>
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
          <Text 
            style={[
              styles.playerName, 
              winner === 1 && styles.playerNameWinner,
              isDarkMode ? styles.playerNameDark : styles.playerNameLight
            ]}
          >
            {getPlayer1Name()}
          </Text>
        </View>

        <View style={styles.scoreDisplay}>
          <Text style={[styles.score, winner === 1 ? styles.scoreWinner : isDarkMode ? styles.scoreDark : styles.scoreLight]}>
            {score1}
          </Text>
          <Text style={[styles.scoreDivider, isDarkMode ? styles.scoreDividerDark : styles.scoreDividerLight]}>
            -
          </Text>
          <Text style={[styles.score, winner === 2 ? styles.scoreWinner : isDarkMode ? styles.scoreDark : styles.scoreLight]}>
            {score2}
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
          <Text 
            style={[
              styles.playerName, 
              winner === 2 && styles.playerNameWinner,
              isDarkMode ? styles.playerNameDark : styles.playerNameLight
            ]}
          >
            {getPlayer2Name()}
          </Text>
        </View>
      </View>

      {/* Winner Banner */}
      <View style={[styles.winnerBanner, isDarkMode ? styles.winnerBannerDark : styles.winnerBannerLight]}>
        <View style={[styles.winnerBannerContent, isDarkMode ? styles.winnerBannerContentDark : styles.winnerBannerContentLight]}>
          <Ionicons name="trophy" size={18} color={isDarkMode ? '#fbbf24' : '#d97706'} />
          <Text style={[styles.winnerText, isDarkMode ? styles.winnerTextDark : styles.winnerTextLight]}>
            {getWinnerName()} Wins!
          </Text>
        </View>
      </View>

      {/* Share Button */}
      <Pressable 
        onPress={handleShare} 
        style={({ pressed }) => [
          styles.shareButton,
          pressed && styles.shareButtonPressed
        ]}
      >
        <View style={styles.shareButtonContent}>
          <Ionicons name="share-outline" size={20} color="#ffffff" />
          <Text style={styles.shareButtonText}>Share Match</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  containerLight: {
    borderColor: '#e5e7eb',
  },
  containerDark: {
    borderColor: '#4b5563',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerLight: {
    backgroundColor: '#dcfce7',
  },
  iconContainerDark: {
    backgroundColor: '#14532d',
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
    marginBottom: 12,
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
    justifyContent: 'center',
    marginBottom: 8,
  },
  playerSection: {
    alignItems: 'center',
    flex: 1,
    minWidth: 80,
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
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
    fontSize: 12,
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
    fontSize: 36,
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
    fontSize: 28,
    fontWeight: '500',
  },
  scoreDividerLight: {
    color: '#d1d5db',
  },
  scoreDividerDark: {
    color: '#4b5563',
  },
  winnerBanner: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  winnerBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  winnerBannerContentLight: {
    backgroundColor: '#fef3c7',
  },
  winnerBannerContentDark: {
    backgroundColor: '#78350f',
  },
  winnerBannerLight: {
    backgroundColor: '#fef3c7',
  },
  winnerBannerDark: {
    backgroundColor: '#451a03',
  },
  winnerText: {
    fontSize: 16,
    fontWeight: '700',
  },
  winnerTextLight: {
    color: '#92400e',
  },
  winnerTextDark: {
    color: '#fef3c7',
  },
  shareButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
    minWidth: 200,
    alignSelf: 'center',
  },
  shareButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  shareButtonPressed: {
    opacity: 0.7,
  },
  shareButtonIcon: {
    marginRight: 10,
  },
  shareButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export const ShareCard = memo(ShareCardComponent);
