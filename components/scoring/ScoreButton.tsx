import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface ScoreButtonProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color: 'green' | 'orange' | 'blue';
}

export function ScoreButton({ title, icon, onPress, color }: ScoreButtonProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const colorClasses = {
    green: 'bg-primary-500 active:bg-primary-600',
    orange: 'bg-accent-orange active:bg-orange-600',
    blue: 'bg-blue-500 active:bg-blue-600',
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityLabel={title}
      accessibilityRole="button"
      className={`rounded-2xl p-6 shadow-lg ${colorClasses[color]}`}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.95 : 1 }],
      })}
    >
      <View className="flex-row items-center justify-center">
        <Ionicons name={icon} size={32} color="white" />
        <Text className="text-white text-2xl font-bold ml-3">{title}</Text>
      </View>
    </Pressable>
  );
}
