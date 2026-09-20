import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { memo } from 'react';
import { Pressable, Text, View, ViewStyle } from 'react-native';
import { COURT } from '../../lib/theme/tokens';

export type ButtonVariant = 'line' | 'deep' | 'outline' | 'dangerText';

export interface CourtButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  /** Small line above the title, e.g. "Rally won by". */
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  height?: number;
  haptic?: boolean;
  style?: ViewStyle;
}

function backgroundFor(variant: ButtonVariant): ViewStyle {
  switch (variant) {
    case 'line':
      return { backgroundColor: COURT.line };
    case 'deep':
      return { backgroundColor: COURT.deep, borderWidth: 1, borderColor: `${COURT.line}1f` };
    case 'outline':
      return { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: `${COURT.line}8c` };
    case 'dangerText':
      return { backgroundColor: 'transparent' };
  }
}

function textColorFor(variant: ButtonVariant): string {
  switch (variant) {
    case 'line':
      return COURT.lineText;
    case 'dangerText':
      return COURT.danger;
    default:
      return COURT.ink;
  }
}

function CourtButtonComponent({
  title,
  onPress,
  variant = 'line',
  subtitle,
  icon,
  disabled = false,
  height = 50,
  haptic = true,
  style,
}: CourtButtonProps) {
  const color = textColorFor(variant);

  const handlePress = () => {
    if (disabled) return;
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        {
          height,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 16,
          opacity: disabled ? 0.45 : 1,
          transform: [{ scale: pressed && !disabled ? 0.97 : 1 }],
        },
        backgroundFor(variant),
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {icon && <Ionicons name={icon} size={20} color={color} />}
        <View style={{ alignItems: 'center' }}>
          {subtitle && (
            <Text style={{ color, fontSize: 13, fontWeight: '600', opacity: 0.7 }} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
          <Text style={{ color, fontSize: 16, fontWeight: '700' }} numberOfLines={1}>
            {title}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export const CourtButton = memo(CourtButtonComponent);
