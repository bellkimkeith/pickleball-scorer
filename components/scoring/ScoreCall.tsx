import { memo } from 'react';
import { Text, View } from 'react-native';
import { COURT } from '../../lib/theme/tokens';

export interface ScoreCallProps {
  /** Serving side's score, shown first, the way the call is spoken. */
  serving: number;
  receiving: number;
  /** Doubles sideout only: server 1 or 2. */
  serverNumber?: 1 | 2;
  caption: string;
}

/** The score the way it is called out: 7–4–2 in doubles, 5–3 otherwise. */
function ScoreCallComponent({ serving, receiving, serverNumber, caption }: ScoreCallProps) {
  const big = {
    fontSize: 92,
    fontWeight: '800' as const,
    letterSpacing: -3,
    lineHeight: 96,
    fontVariant: ['tabular-nums' as const],
  };

  return (
    <View
      accessible
      accessibilityLabel={
        serverNumber ? `${serving} ${receiving} ${serverNumber}. ${caption}` : `${serving} ${receiving}. ${caption}`
      }
    >
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'baseline', gap: 12 }}>
        <Text style={[big, { color: COURT.ink }]}>{serving}</Text>
        <Text style={{ color: COURT.inkMuted, fontSize: 38 }}>–</Text>
        <Text style={[big, { color: '#cfe0d8' }]}>{receiving}</Text>
        {serverNumber !== undefined && (
          <>
            <Text style={{ color: COURT.inkMuted, fontSize: 38 }}>–</Text>
            <Text
              style={{
                color: COURT.ball,
                fontSize: 52,
                fontWeight: '800',
                fontVariant: ['tabular-nums'],
              }}
            >
              {serverNumber}
            </Text>
          </>
        )}
      </View>
      {/* Long names would otherwise run to both edges of the screen. */}
      <Text
        numberOfLines={2}
        style={{
          color: COURT.inkMuted,
          fontSize: 15,
          textAlign: 'center',
          marginTop: 6,
          paddingHorizontal: 20,
        }}
      >
        {caption}
      </Text>
    </View>
  );
}

export const ScoreCall = memo(ScoreCallComponent);
