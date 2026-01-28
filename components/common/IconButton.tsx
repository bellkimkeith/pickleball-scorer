import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  label?: string;
  color?: string;
  disabled?: boolean;
}

export function IconButton({
  icon,
  onPress,
  label,
  color = 'gray',
  disabled = false,
}: IconButtonProps) {
  const colorClasses = {
    gray: 'text-gray-700',
    red: 'text-red-500',
    green: 'text-primary-600',
    blue: 'text-secondary-600',
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`items-center ${disabled ? 'opacity-50' : ''}`}
      style={({ pressed }) => ({
        transform: [{ scale: pressed && !disabled ? 0.9 : 1 }],
      })}
    >
      <View className="items-center">
        <Ionicons
          name={icon}
          size={28}
          color={
            color === 'gray'
              ? '#374151'
              : color === 'red'
              ? '#ef4444'
              : color === 'green'
              ? '#16a34a'
              : '#2563eb'
          }
        />
        {label && (
          <Text className={`text-xs mt-1 ${colorClasses[color as keyof typeof colorClasses] || 'text-gray-700'}`}>
            {label}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
