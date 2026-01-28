import { View, Text } from 'react-native';
import Animated, { SlideInDown, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { ServingSide, ServerNumber } from '../../lib/types/game';

interface ServerIndicatorProps {
  side: ServingSide;
  serverNumber?: ServerNumber;
}

export function ServerIndicator({ side, serverNumber }: ServerIndicatorProps) {
  const pulseStyle = useAnimatedStyle(() => {
    return {
      opacity: withRepeat(withTiming(0.5, { duration: 1000 }), -1, true),
    };
  });

  return (
    <Animated.View entering={SlideInDown} className="flex-row items-center mt-2">
      {/* Pulsing indicator */}
      <Animated.View className="w-3 h-3 bg-accent-yellow rounded-full" style={pulseStyle} />

      <Text className="text-white text-sm font-semibold ml-2">
        Serving {side === 'right' ? 'Right →' : '← Left'}
      </Text>

      {serverNumber && (
        <View className="bg-white/20 rounded-full w-6 h-6 items-center justify-center ml-2">
          <Text className="text-white text-xs font-bold">{serverNumber}</Text>
        </View>
      )}
    </Animated.View>
  );
}
