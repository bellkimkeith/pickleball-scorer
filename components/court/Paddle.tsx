import { memo } from 'react';
import { Pressable, Text, View, ViewStyle } from 'react-native';
import { COURT, PADDLE_FACE, PADDLE_GRIP, PADDLE_GRIP_TEXT, PADDLE_TEXT } from '../../lib/theme/tokens';
import { PaddleColor } from '../../lib/types/queue';

export type PaddleSize = 'lg' | 'md' | 'head';

export interface PaddleProps {
  name: string;
  color: PaddleColor;
  games?: number;
  size?: PaddleSize;
  /** Next up: a line-white outline around the face. */
  outlined?: boolean;
  /** Not checked in: hollow face. */
  ghost?: boolean;
  /** Small line under the name, e.g. "late" or "sitting out". */
  note?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
}

const SIZES: Record<PaddleSize, { width: number; face: number; grip: number; font: number; radius: number }> = {
  lg: { width: 62, face: 104, grip: 58, font: 15, radius: 26 },
  md: { width: 62, face: 76, grip: 0, font: 13, radius: 22 },
  head: { width: 42, face: 54, grip: 0, font: 11, radius: 16 },
};

function PaddleComponent({
  name,
  color,
  games,
  size = 'lg',
  outlined = false,
  ghost = false,
  note,
  onPress,
  onLongPress,
  style,
}: PaddleProps) {
  const dims = SIZES[size];
  const face = ghost ? 'transparent' : PADDLE_FACE[color];
  const text = ghost ? COURT.inkMuted : PADDLE_TEXT[color];
  const showGripNumber = dims.grip > 0 && games !== undefined;

  const body = (
    <View style={[{ width: dims.width }, style]}>
      <View
        style={{
          height: dims.face,
          borderRadius: dims.radius,
          borderBottomLeftRadius: dims.radius * 0.7,
          borderBottomRightRadius: dims.radius * 0.7,
          backgroundColor: face,
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: size === 'head' ? 6 : 10,
          paddingHorizontal: 4,
          borderWidth: ghost ? 1.5 : 0,
          borderColor: `${COURT.line}66`,
          ...(outlined
            ? {
                borderWidth: 2,
                borderColor: COURT.line,
              }
            : {}),
        }}
      >
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ color: text, fontSize: dims.font, fontWeight: '700' }}
        >
          {name}
        </Text>
        {note && (
          <Text numberOfLines={1} style={{ color: text, fontSize: 10, fontWeight: '600', opacity: 0.75 }}>
            {note}
          </Text>
        )}
        {!showGripNumber && games !== undefined && (
          <Text
            style={{
              color: text,
              fontSize: 10,
              fontWeight: '800',
              opacity: 0.8,
              fontVariant: ['tabular-nums'],
            }}
          >
            {games}
          </Text>
        )}
      </View>

      {dims.grip > 0 && (
        <View
          style={{
            width: 20,
            height: dims.grip,
            alignSelf: 'center',
            borderBottomLeftRadius: 6,
            borderBottomRightRadius: 6,
            backgroundColor: PADDLE_GRIP,
            alignItems: 'center',
            paddingTop: 6,
          }}
        >
          {showGripNumber && (
            <Text
              style={{
                color: PADDLE_GRIP_TEXT,
                fontSize: 11,
                fontWeight: '800',
                fontVariant: ['tabular-nums'],
              }}
            >
              {games}
            </Text>
          )}
        </View>
      )}
    </View>
  );

  if (!onPress && !onLongPress) return body;

  const label = [
    name,
    games !== undefined ? `${games} games` : null,
    outlined ? 'next up' : null,
    ghost ? 'not checked in' : null,
    note,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      {body}
    </Pressable>
  );
}

export const Paddle = memo(PaddleComponent);
