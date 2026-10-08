import { useEffect, useState } from 'react';
import { AccessibilityInfo, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { PaddleColor } from '../../lib/types/queue';
import { Paddle } from './Paddle';

export interface FlightPlayer {
  id: string;
  name: string;
  color: PaddleColor;
  games: number;
  /** Where the paddle sits in the rack right now, in screen coordinates. */
  from: { x: number; y: number };
  /** The court slot it is going to, in screen coordinates. */
  to: { x: number; y: number };
}

export interface PaddleFlightProps {
  players: FlightPlayer[];
  onDone: () => void;
}

/**
 * The session's one authored moment: when a match is called, the four paddles
 * leave the rack and travel to their places on the court. Drawn in an overlay
 * above the screen so it can cross from one section to the other.
 *
 * Reduce Motion skips it entirely.
 */
export function PaddleFlight({ players, onDone }: PaddleFlightProps) {
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then(value => alive && setReduceMotion(value))
      .catch(() => alive && setReduceMotion(false));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) onDone();
  }, [reduceMotion, onDone]);

  if (reduceMotion !== false || players.length === 0) return null;

  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
      {players.map((player, index) => (
        <FlyingPaddle
          key={player.id}
          player={player}
          delay={index * 70}
          onDone={index === players.length - 1 ? onDone : undefined}
        />
      ))}
    </View>
  );
}

function FlyingPaddle({
  player,
  delay,
  onDone,
}: {
  player: FlightPlayer;
  delay: number;
  onDone?: () => void;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }, finished => {
        if (finished && onDone) runOnJS(onDone)();
      }),
    );
  }, [delay, onDone, progress]);

  const style = useAnimatedStyle(() => {
    const t = progress.value;
    return {
      position: 'absolute',
      left: player.from.x + (player.to.x - player.from.x) * t,
      top: player.from.y + (player.to.y - player.from.y) * t,
      opacity: t > 0.8 ? (1 - t) / 0.2 : 1,
      transform: [{ scale: 1 - 0.35 * t }],
    };
  });

  return (
    <Animated.View style={style}>
      <Paddle name={player.name} color={player.color} games={player.games} size="head" />
    </Animated.View>
  );
}
