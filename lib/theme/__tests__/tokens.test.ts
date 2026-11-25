import { COURT, PADDLE_FACE, PADDLE_TEXT, contrastRatio } from '../tokens';
import { PADDLE_COLORS } from '../../queue/colors';

describe('design tokens', () => {
  it('has a face and a text color for every paddle color', () => {
    for (const color of PADDLE_COLORS) {
      expect(PADDLE_FACE[color]).toMatch(/^#[0-9a-f]{6}$/i);
      expect(PADDLE_TEXT[color]).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('keeps paddle text readable on its own face', () => {
    for (const color of PADDLE_COLORS) {
      expect(contrastRatio(PADDLE_TEXT[color], PADDLE_FACE[color])).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('keeps body and muted text readable on the court ground', () => {
    expect(contrastRatio(COURT.ink, COURT.outer)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(COURT.inkMuted, COURT.outer)).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps primary button text readable on the line-colored fill', () => {
    expect(contrastRatio(COURT.lineText, COURT.line)).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps names readable on the court surface', () => {
    expect(contrastRatio(COURT.ink, COURT.inner)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(COURT.ink, COURT.kitchen)).toBeGreaterThanOrEqual(4.5);
  });

  it('reserves the ball color for the serving marker only', () => {
    expect(Object.values(PADDLE_FACE)).not.toContain(COURT.ball);
  });

  it('computes known contrast ratios', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 0);
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5);
  });
});
