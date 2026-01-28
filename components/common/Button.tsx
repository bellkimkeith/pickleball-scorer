import { Pressable, Text, View } from 'react-native';
import { ReactNode } from 'react';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  icon?: ReactNode;
  className?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  icon,
  className = '',
}: ButtonProps) {
  const variantClasses = {
    primary: 'bg-primary-500 active:bg-primary-600',
    secondary: 'bg-secondary-500 active:bg-secondary-600',
    danger: 'bg-red-500 active:bg-red-600',
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`rounded-2xl p-4 ${variantClasses[variant]} ${
        disabled ? 'opacity-50' : ''
      } ${className}`}
      style={({ pressed }) => ({
        transform: [{ scale: pressed && !disabled ? 0.95 : 1 }],
      })}
    >
      <View className="flex-row items-center justify-center">
        {icon && <View className="mr-2">{icon}</View>}
        <Text className="text-white text-lg font-bold">{title}</Text>
      </View>
    </Pressable>
  );
}
