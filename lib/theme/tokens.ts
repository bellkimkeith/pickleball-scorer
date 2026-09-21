import { PaddleColor } from '../types/queue';

/**
 * Court & Paddle palette. One appearance: the world looks the same whether the
 * phone is in light or dark mode.
 */
export const COURT = {
  /** Outer-court green: the screen ground. */
  outer: '#2d5a48',
  /** Deeper green for racks and toolbars. */
  outerDeep: '#1f4134',
  /** Sheets and dialogs. */
  surface: '#23473a',
  /** Court surface. */
  inner: '#2c5c93',
  /** Non-volley zone. */
  kitchen: '#3a6aa3',
  /** 2-inch line white: also the primary button fill. */
  line: '#f4f6f2',
  /** Text on a line-colored fill. */
  lineText: '#1d3d31',
  ink: '#f4f6f2',
  inkMuted: '#b9cfc5',
  /** Secondary button fill. */
  deep: '#10231c',
  /** End, remove, and other destructive labels. */
  danger: '#ffb4a6',
  /** The serving marker, and nothing else. */
  ball: '#e9e24a',
} as const;

export const PADDLE_FACE: Record<PaddleColor, string> = {
  ochre: '#e3a33b',
  coral: '#e0634a',
  paper: '#f2efe8',
  sky: '#8fc3e6',
  carbon: '#2f3130',
  lilac: '#9d8fc4',
  sand: '#cbb389',
  teal: '#3f9e91',
};

/** Text drawn on a paddle face; each pair clears 4.5:1. */
export const PADDLE_TEXT: Record<PaddleColor, string> = {
  ochre: '#2b1d05',
  coral: '#2a0c05',
  paper: '#1d2a24',
  sky: '#0d2638',
  carbon: '#f1f1ef',
  lilac: '#150e26',
  sand: '#241c0d',
  teal: '#04201a',
};

/** Grip wrap under the paddle face. */
export const PADDLE_GRIP = '#191919';
export const PADDLE_GRIP_TEXT = '#ffffff';

function channel(value: number): number {
  const srgb = value / 255;
  return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG relative contrast ratio, 1 (identical) to 21 (black on white). */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}
