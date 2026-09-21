import { memo } from 'react';
import { View, ViewStyle } from 'react-native';
import { COURT, PADDLE_FACE } from '../../lib/theme/tokens';
import { PaddleColor } from '../../lib/types/queue';

export interface MiniCourtProps {
  /** Dots per side: 1 for singles, 2 for doubles. */
  perSide: 1 | 2;
  width?: number;
  height?: number;
  colors?: [PaddleColor, PaddleColor, PaddleColor, PaddleColor];
  style?: ViewStyle;
}

/** Small court line-drawing used as an icon. */
function MiniCourtComponent({
  perSide,
  width = 46,
  height = 32,
  colors = ['ochre', 'coral', 'sky', 'paper'],
  style,
}: MiniCourtProps) {
  const dot = (color: PaddleColor, left: boolean, top?: boolean) => (
    <View
      style={{
        position: 'absolute',
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: PADDLE_FACE[color],
        left: left ? width * 0.16 : undefined,
        right: left ? undefined : width * 0.16,
        top: perSide === 1 ? height / 2 - 3.5 : top ? height * 0.22 : undefined,
        bottom: perSide === 2 && !top ? height * 0.22 : undefined,
      }}
    />
  );

  return (
    <View
      style={[
        {
          width,
          height,
          backgroundColor: COURT.inner,
          borderWidth: 2,
          borderColor: COURT.line,
          borderRadius: 2,
        },
        style,
      ]}
    >
      <View style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, backgroundColor: COURT.line }} />
      {perSide === 1 ? (
        <>
          {dot(colors[0], true)}
          {dot(colors[2], false)}
        </>
      ) : (
        <>
          {dot(colors[0], true, true)}
          {dot(colors[1], true, false)}
          {dot(colors[2], false, true)}
          {dot(colors[3], false, false)}
        </>
      )}
    </View>
  );
}

export const MiniCourt = memo(MiniCourtComponent);
