import { nextBannerLoad, shouldShowBanner } from '../visibility';

describe('shouldShowBanner', () => {
  it('shows a banner only once the status is loaded, the person is not ad-free, and ads are ready', () => {
    expect(shouldShowBanner({ hydrated: true, adFree: false, adsReady: true, unitId: 'unit' })).toBe(true);
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
    expect(shouldShowBanner({ hydrated, adFree, adsReady, unitId: 'unit' })).toBe(false);
  });

  it('hides it when no ad unit is configured, instead of letting the ad SDK throw', () => {
    expect(shouldShowBanner({ hydrated: true, adFree: false, adsReady: true, unitId: '' })).toBe(false);
  });
});

describe('nextBannerLoad', () => {
  it('shows the ad once it loads', () => {
    expect(nextBannerLoad('loading', 'loaded')).toBe('loaded');
  });

  it('draws nothing when the first load fails', () => {
    expect(nextBannerLoad('loading', 'failed')).toBe('failed');
  });

  it('keeps a showing ad when an automatic refresh fails', () => {
    expect(nextBannerLoad('loaded', 'failed')).toBe('loaded');
  });

  it('tries again after a failure when the screen or app comes back', () => {
    expect(nextBannerLoad('failed', 'retry')).toBe('loading');
  });

  it('leaves a loading or showing ad alone on retry', () => {
    expect(nextBannerLoad('loaded', 'retry')).toBe('loaded');
    expect(nextBannerLoad('loading', 'retry')).toBe('loading');
  });
});
