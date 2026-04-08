import { Pressable, Text, View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { SoundItem } from '../../lib/audio/SoundManager';
import { useDarkMode } from '../../hooks/useDarkMode';
import { memo, useCallback } from 'react';

interface SoundButtonProps {
  sound: SoundItem;
  onPress: (soundId: string) => void;
  isLocked?: boolean;
  onLockPress?: () => void;
  isSelected?: boolean;
  teamNumber?: 1 | 2;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SOUND_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  airhorn: 'megaphone',
  cheer: 'happy',
  whistle: 'flag',
  meme1: 'game-controller',
  meme2: 'musical-notes',
  meme3: 'sparkles',
  crowd: 'people',
  applause: 'hand-left',
  boom: 'flash',
  bell: 'notifications',
  horn: 'car',
  buzzer: 'alert-circle',
  laugh1: 'happy-outline',
  laugh2: 'happy-outline',
  wow: 'star',
  noice: 'thumbs-up',
  yeet: 'arrow-forward-circle',
  fail: 'close-circle',
  trombone: 'musical-note',
  rimshot: 'musical-notes',
  sad: 'sad',
  village: 'home',
  taco: 'restaurant',
  viking: 'shield',
};

function SoundButtonComponent({
  sound,
  onPress,
  isLocked = false,
  onLockPress,
  isSelected = false,
  teamNumber,
}: SoundButtonProps) {
  const { isDarkMode } = useDarkMode();
  const pressed = useSharedValue(0);
  const scale = useSharedValue(1);

  const teamColors: Record<1 | 2, string> = {
    1: '#3b82f6',
    2: '#ef4444',
  };

  const handlePress = useCallback(() => {
    if (isLocked && onLockPress) {
      onLockPress();
    } else {
      onPress(sound.id);
    }
  }, [isLocked, onLockPress, onPress, sound.id]);

  const handlePressIn = useCallback(() => {
    pressed.set(withTiming(1, { duration: 100 }));
    scale.set(withSpring(0.9, { damping: 15, stiffness: 400 }));
  }, [pressed, scale]);

  const handlePressOut = useCallback(() => {
    pressed.set(withTiming(0, { duration: 100 }));
    scale.set(withSpring(1, { damping: 15, stiffness: 400 }));
  }, [pressed, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
    opacity: 1 - pressed.get() * 0.2,
  }));

  const iconName = SOUND_ICONS[sound.id] || 'musical-note';
  const categoryColors: Record<string, string> = {
    hype: '#ef4444',
    classic: '#3b82f6',
    meme: '#a855f7',
  };
  const accentColor = teamNumber ? teamColors[teamNumber] : (categoryColors[sound.category] || '#16a34a');

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        animatedStyle,
        isSelected && { borderColor: accentColor, borderWidth: 3 },
        isDarkMode ? styles.containerDark : styles.containerLight,
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: isLocked ? '#6b7280' : accentColor },
        ]}
      >
        <Ionicons
          name={isLocked ? 'lock-closed' : iconName}
          size={28}
          color="#ffffff"
        />
      </View>
      <Text
        style={[
          styles.label,
          isDarkMode ? styles.labelDark : styles.labelLight,
          isLocked && styles.labelLocked,
        ]}
        numberOfLines={1}
      >
        {sound.name}
      </Text>
      {isLocked && (
        <View style={styles.proBadge}>
          <Text style={styles.proBadgeText}>PRO</Text>
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 16,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  containerLight: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  containerDark: {
    backgroundColor: '#1f2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  labelLight: {
    color: '#1f2937',
  },
  labelDark: {
    color: '#f3f4f6',
  },
  labelLocked: {
    color: '#9ca3af',
  },
  proBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  proBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export const SoundButton = memo(SoundButtonComponent);
