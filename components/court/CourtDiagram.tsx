import { memo, useMemo } from 'react';
import { Pressable, Text, View, ViewStyle } from 'react-native';
import { COURT, PADDLE_FACE } from '../../lib/theme/tokens';
import { PaddleColor } from '../../lib/types/queue';

export interface CourtSlotPlayer {
  id: string;
  name: string;
  color: PaddleColor;
}

/** Slot order: near-top, near-bottom, far-top, far-bottom. */
export type CourtSlots = [
  CourtSlotPlayer | null,
  CourtSlotPlayer | null,
  CourtSlotPlayer | null,
  CourtSlotPlayer | null,
];

export interface CourtDiagramProps {
  players: CourtSlots;
  courtLabel?: string;
  clock?: string;
  servingPlayerId?: string;
  showServeDiagonal?: boolean;
  height?: number;
  emptyLabel?: string;
  onSlotPress?: (index: number) => void;
  onPlayerPress?: (id: string) => void;
  accessibilityLabel?: string;
  style?: ViewStyle;
}

const LINE = 2;

function SlotLabel({
  player,
  serving,
  align,
  onPress,
}: {
  player: CourtSlotPlayer;
  serving: boolean;
  align: 'left' | 'right';
  onPress?: () => void;
}) {
  const dot = (
    <View
      style={{
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: PADDLE_FACE[player.color],
      }}
    />
  );

  const content = (
    <View
      style={{
        flexDirection: align === 'left' ? 'row' : 'row-reverse',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: serving ? 10 : 0,
        paddingVertical: serving ? 4 : 0,
        borderRadius: 999,
        backgroundColor: serving ? COURT.line : 'transparent',
        maxWidth: 130,
      }}
    >
      {serving ? (
        <View
          style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: COURT.ball }}
        />
      ) : (
        dot
      )}
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        style={{
          color: serving ? COURT.lineText : COURT.ink,
          fontSize: 17,
          fontWeight: '700',
          flexShrink: 1,
        }}
      >
        {player.name}
      </Text>
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${player.name}${serving ? ', serving' : ''}`}
      hitSlop={8}
    >
      {content}
    </Pressable>
  );
}

function EmptySlot({ onPress }: { onPress?: () => void }) {
  const box = (
    <View
      style={{
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: `${COURT.line}80`,
        borderStyle: 'dashed',
      }}
    >
      <Text style={{ color: COURT.ink, fontSize: 15, fontWeight: '600' }}>+ Player</Text>
    </View>
  );
  if (!onPress) return box;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Add a player" hitSlop={8}>
      {box}
    </Pressable>
  );
}

/** Dashes drawn as dots, so no SVG dependency is needed. */
function ServeDiagonal({ fromLeft }: { fromLeft: boolean }) {
  const dots = useMemo(() => Array.from({ length: 9 }, (_, i) => i / 8), []);
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: '28%', right: '28%', top: '30%', bottom: '30%' }}>
      {dots.map(t => (
        <View
          key={t}
          style={{
            position: 'absolute',
            left: `${(fromLeft ? t : 1 - t) * 100}%`,
            top: `${(1 - t) * 100}%`,
            width: 3,
            height: 3,
            borderRadius: 2,
            backgroundColor: COURT.line,
            opacity: 0.75,
          }}
        />
      ))}
    </View>
  );
}

function CourtDiagramComponent({
  players,
  courtLabel,
  clock,
  servingPlayerId,
  showServeDiagonal = false,
  height = 124,
  emptyLabel,
  onSlotPress,
  onPlayerPress,
  accessibilityLabel,
  style,
}: CourtDiagramProps) {
  const isEmpty = players.every(p => p === null);

  const label = useMemo(() => {
    if (accessibilityLabel) return accessibilityLabel;
    if (isEmpty) return `${courtLabel ?? 'Court'}. ${emptyLabel ?? 'Empty'}.`;
    const side = (a: number, b: number) =>
      [players[a]?.name, players[b]?.name].filter(Boolean).join(' and ');
    const parts = [courtLabel, `${side(0, 1)} versus ${side(2, 3)}`];
    if (clock) parts.push(clock);
    return parts.filter(Boolean).join('. ');
  }, [accessibilityLabel, courtLabel, clock, emptyLabel, isEmpty, players]);

  const servingIndex = players.findIndex(p => p && p.id === servingPlayerId);

  const corners: { top?: number; bottom?: number; left?: number; right?: number; align: 'left' | 'right' }[] = [
    { left: 10, top: 14, align: 'left' },
    { left: 10, bottom: 14, align: 'left' },
    { right: 10, top: 14, align: 'right' },
    { right: 10, bottom: 14, align: 'right' },
  ];

  return (
    <View
      accessible={!onSlotPress && !onPlayerPress}
      accessibilityLabel={label}
      style={[
        {
          height,
          borderRadius: 4,
          backgroundColor: COURT.inner,
          borderWidth: LINE,
          borderColor: COURT.line,
        },
        style,
      ]}
    >
      {/* non-volley zones */}
      <View style={{ position: 'absolute', left: '27%', width: '23%', top: 0, bottom: 0, backgroundColor: COURT.kitchen }} />
      <View style={{ position: 'absolute', right: '27%', width: '23%', top: 0, bottom: 0, backgroundColor: COURT.kitchen }} />
      {/* service centre lines */}
      <View style={{ position: 'absolute', left: 0, width: '27%', top: '50%', height: LINE, backgroundColor: COURT.line }} />
      <View style={{ position: 'absolute', right: 0, width: '27%', top: '50%', height: LINE, backgroundColor: COURT.line }} />
      {/* kitchen lines */}
      <View style={{ position: 'absolute', left: '27%', top: 0, bottom: 0, width: LINE, backgroundColor: COURT.line }} />
      <View style={{ position: 'absolute', right: '27%', top: 0, bottom: 0, width: LINE, backgroundColor: COURT.line }} />
      {/* net */}
      <View style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: LINE, marginLeft: -LINE / 2, backgroundColor: COURT.line }} />

      {showServeDiagonal && servingIndex >= 0 && <ServeDiagonal fromLeft={servingIndex < 2} />}

      {isEmpty ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: COURT.ink, fontSize: 15, fontWeight: '600', opacity: 0.85 }}>
            {emptyLabel ?? 'Waiting for players'}
          </Text>
        </View>
      ) : (
        players.map((player, index) => (
          <View key={index} style={{ position: 'absolute', ...corners[index] }}>
            {player ? (
              <SlotLabel
                player={player}
                serving={player.id === servingPlayerId}
                align={corners[index].align}
                onPress={
                  onPlayerPress ? () => onPlayerPress(player.id) : onSlotPress ? () => onSlotPress(index) : undefined
                }
              />
            ) : (
              <EmptySlot onPress={onSlotPress ? () => onSlotPress(index) : undefined} />
            )}
          </View>
        ))
      )}

      {courtLabel && (
        <View
          style={{
            position: 'absolute',
            alignSelf: 'center',
            top: -11,
            backgroundColor: COURT.line,
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 3,
          }}
        >
          <Text style={{ color: COURT.lineText, fontSize: 12, fontWeight: '800', letterSpacing: 0.5 }}>
            {courtLabel}
          </Text>
        </View>
      )}

      {clock && (
        <View
          style={{
            position: 'absolute',
            alignSelf: 'center',
            bottom: 8,
            backgroundColor: '#0f2a4a',
            borderRadius: 6,
            paddingHorizontal: 8,
            paddingVertical: 2,
          }}
        >
          <Text
            style={{
              color: '#dce8f5',
              fontSize: 12,
              fontWeight: '600',
              fontVariant: ['tabular-nums'],
            }}
          >
            {clock}
          </Text>
        </View>
      )}
    </View>
  );
}

export const CourtDiagram = memo(CourtDiagramComponent);
