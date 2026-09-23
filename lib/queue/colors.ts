import { PaddleColor, SavedPlayer } from '../types/queue';

export const PADDLE_COLORS: readonly PaddleColor[] = [
  'ochre',
  'coral',
  'paper',
  'sky',
  'carbon',
  'lilac',
  'sand',
  'teal',
  'rose',
  'plum',
  'moss',
  'ice',
] as const;

/**
 * Next colour for a newly saved player, cycling once every colour is used.
 *
 * Twelve of them: a session of eight on two courts never repeats, and a busy
 * session of twelve still gives everyone their own paddle.
 */
export function nextColorForRoster(saved: SavedPlayer[]): PaddleColor {
  return PADDLE_COLORS[saved.length % PADDLE_COLORS.length];
}

/** Keep a player's saved colour unless it is already taken in this session. */
export function sessionColor(saved: PaddleColor, taken: PaddleColor[]): PaddleColor {
  if (!taken.includes(saved)) return saved;
  return PADDLE_COLORS.find(color => !taken.includes(color)) ?? saved;
}
