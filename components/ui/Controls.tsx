import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COURT } from '../../lib/theme/tokens';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
}

function SegmentedInner<T extends string>({ options, value, onChange, accessibilityLabel }: SegmentedProps<T>) {
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      style={{
        flexDirection: 'row',
        backgroundColor: `${COURT.line}14`,
        borderRadius: 10,
        padding: 3,
      }}
    >
      {options.map(option => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            style={{
              flex: 1,
              minHeight: 38,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              backgroundColor: selected ? COURT.line : 'transparent',
            }}
          >
            <Text
              style={{
                color: selected ? COURT.lineText : COURT.inkMuted,
                fontSize: 14,
                fontWeight: '600',
              }}
              numberOfLines={1}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const Segmented = memo(SegmentedInner) as typeof SegmentedInner;

export interface ToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  accessibilityLabel: string;
  disabled?: boolean;
}

function ToggleComponent({ value, onChange, accessibilityLabel, disabled = false }: ToggleProps) {
  return (
    <Pressable
      onPress={() => {
        if (disabled) return;
        Haptics.selectionAsync().catch(() => {});
        onChange(!value);
      }}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled }}
      hitSlop={8}
      style={{
        width: 51,
        height: 31,
        borderRadius: 999,
        padding: 2,
        justifyContent: 'center',
        backgroundColor: value ? COURT.line : `${COURT.line}26`,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <View
        style={{
          width: 27,
          height: 27,
          borderRadius: 999,
          backgroundColor: value ? COURT.outer : '#dfe7e2',
          alignSelf: value ? 'flex-end' : 'flex-start',
        }}
      />
    </Pressable>
  );
}

export const Toggle = memo(ToggleComponent);

export interface StepperProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  accessibilityLabel: string;
}

function StepperComponent({ value, min, max, onChange, accessibilityLabel }: StepperProps) {
  const { t } = useTranslation();
  const step = (delta: number) => {
    const next = value + delta;
    if (next < min || next > max) return;
    Haptics.selectionAsync().catch(() => {});
    onChange(next);
  };

  const button = (icon: 'remove' | 'add', delta: number, disabled: boolean, label: string) => (
    <Pressable
      onPress={() => step(delta)}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={{
        width: 44,
        height: 38,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.35 : 1,
      }}
    >
      <Ionicons name={icon} size={20} color={COURT.ink} />
    </Pressable>
  );

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: `${COURT.line}14`,
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      {button('remove', -1, value <= min, t('common.fewer'))}
      <Text
        style={{
          color: COURT.ink,
          fontSize: 17,
          fontWeight: '700',
          minWidth: 32,
          textAlign: 'center',
          fontVariant: ['tabular-nums'],
        }}
      >
        {value}
      </Text>
      {button('add', 1, value >= max, t('common.more'))}
    </View>
  );
}

export const Stepper = memo(StepperComponent);
