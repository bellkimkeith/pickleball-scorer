import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { PADDLE_FACE_PATH, PADDLE_GUARD_WIDTH, PADDLE_HANDLE_PATH } from '../../lib/theme/paddle-shape';
import { COURT, PADDLE_FACE, PADDLE_GRIP, PADDLE_GRIP_TEXT, PADDLE_TEXT } from '../../lib/theme/tokens';
import { PaddleColor } from '../../lib/types/queue';

export type PaddleSize = 'lg' | 'md' | 'head';

export interface PaddleProps {
  name: string;
  color: PaddleColor;
  games?: number;
  size?: PaddleSize;
  /** Next up: a line-white outline around the paddle. */
  outlined?: boolean;
  /** Not checked in: hollow face. */
  ghost?: boolean;
  /** Small line under the name, e.g. "late" or "sitting out". */
  note?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
}

/**
 * The rack shows the whole paddle; the smaller sizes crop below the neck so the
 * face (which carries the name) stays big enough to read.
 */
const SIZES: Record<
  PaddleSize,
  { width: number; font: number; noteFont: number; gripFont: number; boxHeight: number; numberOnFace: boolean }
> = {
  lg: { width: 68, font: 13, noteFont: 9, gripFont: 11, boxHeight: 200, numberOnFace: false },
  md: { width: 64, font: 13, noteFont: 8, gripFont: 10, boxHeight: 150, numberOnFace: true },
  head: { width: 48, font: 10, noteFont: 7, gripFont: 9, boxHeight: 150, numberOnFace: true },
};

const GUARD = '#17181a';

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
  const { t } = useTranslation();
  const dims = SIZES[size];
  // 80 units wide is the paddle's own width inside the 200 box.
  const scale = dims.width / 92;
  const height = dims.boxHeight * scale;

  const faceColor = ghost ? 'transparent' : PADDLE_FACE[color];
  const textColor = ghost ? COURT.inkMuted : PADDLE_TEXT[color];
  const guardColor = ghost ? `${COURT.line}66` : GUARD;

  const body = (
    <View style={[{ width: dims.width, height }, style]}>
      <Svg width={dims.width} height={height} viewBox={`54 12 92 ${dims.boxHeight}`}>
        <Path d={PADDLE_HANDLE_PATH} fill={ghost ? 'transparent' : PADDLE_GRIP} stroke={ghost ? guardColor : 'none'} strokeWidth={3} />
        <Path
          d={PADDLE_FACE_PATH}
          fill={guardColor}
          stroke={guardColor}
          strokeWidth={PADDLE_GUARD_WIDTH}
          strokeLinejoin="round"
        />
        <Path d={PADDLE_FACE_PATH} fill={faceColor} />
        {outlined && (
          <Path
            d={PADDLE_FACE_PATH}
            fill="none"
            stroke={COURT.line}
            strokeWidth={PADDLE_GUARD_WIDTH + 5}
            strokeLinejoin="round"
            opacity={0.9}
          />
        )}
        <Path d={PADDLE_FACE_PATH} fill={faceColor} />
      </Svg>

      {/* name on the face */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: (74 - 12) * scale - dims.font,
          alignItems: 'center',
          paddingHorizontal: 4,
        }}
      >
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ color: textColor, fontSize: dims.font, fontWeight: '700' }}
        >
          {name}
        </Text>
        {note && (
          <Text numberOfLines={1} style={{ color: textColor, fontSize: dims.noteFont, fontWeight: '600', opacity: 0.75 }}>
            {note}
          </Text>
        )}
      </View>

      {/* games played, on the handle */}
      {games !== undefined && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: dims.numberOnFace
              ? (74 - 12) * scale + dims.font * 0.6
              : (156 - 12) * scale - dims.gripFont * 0.7,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: ghost
                ? COURT.inkMuted
                : dims.numberOnFace
                  ? PADDLE_TEXT[color]
                  : PADDLE_GRIP_TEXT,
              fontSize: dims.gripFont,
              fontWeight: '800',
              fontVariant: ['tabular-nums'],
            }}
          >
            {games}
          </Text>
        </View>
      )}
    </View>
  );

  if (!onPress && !onLongPress) return body;

  const label = [
    name,
    games !== undefined ? t('openPlay.gamesCount', { count: games }) : null,
    outlined ? t('openPlay.nextUp') : null,
    ghost ? t('openPlay.notCheckedIn') : null,
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
      android_ripple={{ color: `${COURT.line}22`, borderless: true }}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      {body}
    </Pressable>
  );
}

export const Paddle = memo(PaddleComponent);
