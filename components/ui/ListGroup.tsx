import { Ionicons } from '@expo/vector-icons';
import { Children, ReactNode, isValidElement, memo } from 'react';
import { Pressable, Text, View, ViewStyle } from 'react-native';
import { COURT } from '../../lib/theme/tokens';

export interface ListGroupProps {
  header?: string;
  children: ReactNode;
  style?: ViewStyle;
}

export interface ListRowProps {
  label: string;
  value?: string;
  /** Toggle, segmented control, stepper, and so on. */
  right?: ReactNode;
  chevron?: boolean;
  disabled?: boolean;
  /** Explains why the row is disabled, shown under the label. */
  disabledReason?: string;
  destructive?: boolean;
  /** Put a wide control (segmented, for instance) under the label instead of beside it. */
  stacked?: boolean;
  onPress?: () => void;
}

function ListRowComponent({
  label,
  value,
  right,
  chevron = false,
  disabled = false,
  disabledReason,
  destructive = false,
  stacked = false,
  onPress,
}: ListRowProps) {
  const color = destructive ? COURT.danger : COURT.ink;

  const labelBlock = (
    <View style={{ flex: stacked ? undefined : 1 }}>
      <Text style={{ color, fontSize: 17, fontWeight: '500' }}>{label}</Text>
      {disabled && disabledReason && (
        <Text style={{ color: COURT.inkMuted, fontSize: 12, marginTop: 2 }}>{disabledReason}</Text>
      )}
    </View>
  );

  const body = (
    <View
      style={{
        minHeight: 52,
        flexDirection: stacked ? 'column' : 'row',
        alignItems: stacked ? 'stretch' : 'center',
        gap: stacked ? 8 : 12,
        paddingHorizontal: 14,
        paddingVertical: stacked ? 12 : 8,
        opacity: disabled ? 0.55 : 1,
      }}
    >
      {labelBlock}
      {!stacked && value && (
        <Text style={{ color: COURT.inkMuted, fontSize: 15 }} numberOfLines={1}>
          {value}
        </Text>
      )}
      {right && <View style={stacked ? undefined : { flexShrink: 0 }}>{right}</View>}
      {chevron && <Ionicons name="chevron-forward" size={18} color={COURT.inkMuted} />}
    </View>
  );

  if (!onPress || disabled) {
    // A row holding its own control — a toggle, a stepper, a segmented picker —
    // must not become a single accessibility element: on iOS that swallows the
    // control, leaving VoiceOver able to read the label but never reach the
    // thing it labels. Those controls carry their own labels and roles.
    if (right) return <View accessibilityState={{ disabled }}>{body}</View>;

    return (
      <View accessible accessibilityState={{ disabled }} accessibilityLabel={`${label}${value ? `, ${value}` : ''}`}>
        {body}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}${value ? `, ${value}` : ''}`}
      style={({ pressed }) => ({ backgroundColor: pressed ? `${COURT.line}14` : 'transparent' })}
    >
      {body}
    </Pressable>
  );
}

export const ListRow = memo(ListRowComponent);

function ListGroupComponent({ header, children, style }: ListGroupProps) {
  const rows = Children.toArray(children).filter(isValidElement);

  return (
    <View style={style}>
      {header && (
        <Text
          style={{
            color: COURT.inkMuted,
            fontSize: 13,
            fontWeight: '600',
            letterSpacing: 0.4,
            textTransform: 'uppercase',
            paddingHorizontal: 16,
            paddingBottom: 6,
          }}
        >
          {header}
        </Text>
      )}
      <View
        style={{
          backgroundColor: `${COURT.line}0f`,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: `${COURT.line}14`,
          overflow: 'hidden',
        }}
      >
        {rows.map((row, index) => (
          <View key={index}>
            {index > 0 && <View style={{ height: 1, backgroundColor: `${COURT.line}14`, marginLeft: 14 }} />}
            {row}
          </View>
        ))}
      </View>
    </View>
  );
}

export const ListGroup = memo(ListGroupComponent);
