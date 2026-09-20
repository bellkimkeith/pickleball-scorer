import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { COURT } from '../../lib/theme/tokens';

export interface ToolbarItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  danger?: boolean;
}

export interface ToolbarProps {
  items: ToolbarItem[];
  /** Extra bottom padding for the home indicator. */
  bottomInset?: number;
}

function ToolbarComponent({ items, bottomInset = 24 }: ToolbarProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: COURT.outerDeep,
        paddingTop: 12,
        paddingBottom: bottomInset,
        borderTopWidth: 1,
        borderTopColor: `${COURT.line}14`,
      }}
    >
      {items.map(item => {
        const color = item.danger ? COURT.danger : COURT.ink;
        return (
          <Pressable
            key={item.label}
            onPress={() => {
              if (item.disabled) return;
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              item.onPress();
            }}
            disabled={item.disabled}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            accessibilityState={{ disabled: item.disabled }}
            style={{
              minWidth: 60,
              minHeight: 44,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              opacity: item.disabled ? 0.4 : 1,
            }}
          >
            <Ionicons name={item.icon} size={24} color={color} />
            <Text style={{ color, fontSize: 12, fontWeight: '600' }}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const Toolbar = memo(ToolbarComponent);
