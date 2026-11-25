import { PADDLE_COLORS, nextColorForRoster, sessionColor } from '../colors';

describe('paddle colors', () => {
  it('assigns colors in order for a new roster', () => {
    expect(nextColorForRoster([])).toBe('ochre');
    expect(nextColorForRoster([{ id: '1', name: 'A', color: 'ochre' }])).toBe('coral');
  });

  it('cycles once every color is used', () => {
    const roster = PADDLE_COLORS.map((color, i) => ({ id: String(i), name: 'P', color }));
    expect(nextColorForRoster(roster)).toBe('ochre');
  });

  it('keeps the saved color when it is free in the session', () => {
    expect(sessionColor('sky', ['ochre'])).toBe('sky');
  });

  it('picks the first unused color when the saved one is taken', () => {
    expect(sessionColor('ochre', ['ochre'])).toBe('coral');
  });

  it('falls back to the saved color when every color is taken', () => {
    expect(sessionColor('ochre', [...PADDLE_COLORS])).toBe('ochre');
  });
});
