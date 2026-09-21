import { defaultSoundName, validateCustomSound } from '../custom-sounds';

const base = { name: 'airhorn.mp3', durationMs: 2000, bytes: 100_000, existingCount: 0 };

describe('custom sound limits', () => {
  it('accepts a short, small, supported file', () => {
    expect(validateCustomSound(base)).toEqual({ ok: true });
  });

  it('rejects a clip longer than five seconds and says how long it is', () => {
    expect(validateCustomSound({ ...base, durationMs: 8200 })).toEqual({
      ok: false,
      reason: 'tooLong',
      seconds: 8.2,
      limitSeconds: 5,
    });
  });

  it('accepts a clip of exactly five seconds', () => {
    expect(validateCustomSound({ ...base, durationMs: 5000 })).toEqual({ ok: true });
  });

  it('rejects a file over 2 MB', () => {
    const result = validateCustomSound({ ...base, bytes: 3 * 1024 * 1024 });
    expect(result).toMatchObject({ ok: false, reason: 'tooBig', limitMegabytes: 2 });
  });

  it('rejects an unsupported format', () => {
    expect(validateCustomSound({ ...base, name: 'clip.ogg' })).toMatchObject({
      ok: false,
      reason: 'badFormat',
      extension: 'ogg',
    });
  });

  it('accepts every documented format', () => {
    for (const extension of ['mp3', 'm4a', 'aac', 'wav']) {
      expect(validateCustomSound({ ...base, name: `clip.${extension}` })).toEqual({ ok: true });
    }
  });

  it('rejects more than 24 custom sounds', () => {
    expect(validateCustomSound({ ...base, existingCount: 24 })).toEqual({
      ok: false,
      reason: 'tooMany',
      limit: 24,
    });
  });

  it('names a sound after its file', () => {
    expect(defaultSoundName('my clip.mp3')).toBe('my clip');
    expect(defaultSoundName('a-very-long-file-name-that-goes-on.wav')).toHaveLength(20);
    expect(defaultSoundName('.mp3')).toBe('Sound');
  });
});
