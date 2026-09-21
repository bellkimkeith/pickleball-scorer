import { memo } from 'react';
import { Text, View } from 'react-native';
import { COURT } from '../../lib/theme/tokens';
import { PaddleColor } from '../../lib/types/queue';
import { Paddle } from './Paddle';

export interface RackPlayer {
  id: string;
  name: string;
  color: PaddleColor;
  games: number;
  note?: string;
}

export interface PaddleRackProps {
  /** The four who go on next, as full-size paddles. */
  next: RackPlayer[];
  /** Everyone else waiting, in queue order, as small heads. */
  waiting: RackPlayer[];
  /** Pairs locked together; tape is drawn when both are in `next`. */
  lockedPairs?: [string, string][];
  onPlayerPress?: (id: string) => void;
  emptyLabel?: string;
  /** Shown in place of the NEXT UP tab when no full match can be called yet. */
  notEnoughLabel?: string;
}

function Tape() {
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 48,
        left: -22,
        width: 44,
        height: 14,
        borderRadius: 2,
        backgroundColor: '#e9d8a6',
        opacity: 0.92,
        transform: [{ rotate: '-6deg' }],
        zIndex: 2,
      }}
    />
  );
}

function PaddleRackComponent({
  next,
  waiting,
  lockedPairs = [],
  onPlayerPress,
  emptyLabel = 'Nobody is waiting',
  notEnoughLabel,
}: PaddleRackProps) {
  const isEmpty = next.length === 0 && waiting.length === 0;
  const lockedWith = new Map<string, string>();
  for (const [a, b] of lockedPairs) {
    lockedWith.set(a, b);
    lockedWith.set(b, a);
  }

  return (
    <View
      style={{
        backgroundColor: COURT.outerDeep,
        borderRadius: 14,
        paddingHorizontal: 10,
        paddingTop: 14,
        paddingBottom: 12,
      }}
    >
      <View
        style={{
          position: 'absolute',
          left: 10,
          top: 0,
          backgroundColor: COURT.line,
          borderBottomLeftRadius: 6,
          borderBottomRightRadius: 6,
          paddingHorizontal: 8,
          paddingVertical: 2,
        }}
      >
        <Text style={{ color: COURT.lineText, fontSize: 11, fontWeight: '800', letterSpacing: 0.6 }}>
          {next.length === 0 && notEnoughLabel ? notEnoughLabel : 'NEXT UP'}
        </Text>
      </View>

      {isEmpty ? (
        <View style={{ paddingVertical: 28, alignItems: 'center' }}>
          <Text style={{ color: COURT.inkMuted, fontSize: 15, fontWeight: '600' }}>{emptyLabel}</Text>
        </View>
      ) : (
        <>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
            {next.map((player, index) => {
              const partner = lockedWith.get(player.id);
              const tapedToPrevious =
                index > 0 && partner !== undefined && next[index - 1]?.id === partner;
              return (
                <View key={player.id}>
                  {tapedToPrevious && <Tape />}
                  <Paddle
                    name={player.name}
                    color={player.color}
                    games={player.games}
                    note={player.note}
                    outlined
                    onPress={onPlayerPress ? () => onPlayerPress(player.id) : undefined}
                  />
                </View>
              );
            })}
          </View>

          {waiting.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
              {waiting.map(player => (
                <Paddle
                  key={player.id}
                  name={player.name}
                  color={player.color}
                  games={player.games}
                  note={player.note}
                  size="head"
                  onPress={onPlayerPress ? () => onPlayerPress(player.id) : undefined}
                />
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
}

export const PaddleRack = memo(PaddleRackComponent);
