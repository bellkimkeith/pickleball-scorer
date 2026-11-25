import { shouldShowBanner } from '../visibility';

describe('shouldShowBanner', () => {
  it('shows a banner only once the status is loaded, the person is not ad-free, and ads are ready', () => {
    expect(shouldShowBanner({ hydrated: true, adFree: false, adsReady: true })).toBe(true);
  });

  it.each([
    [false, false, false],
    [false, false, true], // remembered status not loaded yet: a paying user must not see a flash
    [false, true, false],
    [false, true, true],
    [true, false, false], // consent not settled or SDK not started
    [true, true, false],
    [true, true, true], // ad-free
  ])('hides it for hydrated=%s adFree=%s adsReady=%s', (hydrated, adFree, adsReady) => {
    expect(shouldShowBanner({ hydrated, adFree, adsReady })).toBe(false);
  });
});
