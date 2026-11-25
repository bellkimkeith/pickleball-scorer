import { nextBannerLoad, shouldShowStrip, stripView } from '../visibility';

const showing = { hydrated: true, adFree: false, adsBlocked: false, unitId: 'unit' };

describe('shouldShowStrip', () => {
  it('holds the strip for anyone who can be shown ads, even before the ad SDK is ready', () => {
    expect(shouldShowStrip(showing)).toBe(true);
  });

  it('draws nothing until the remembered status has loaded, so a paying user never sees it flash', () => {
    expect(shouldShowStrip({ ...showing, hydrated: false })).toBe(false);
  });

  it('is gone for someone who is ad-free', () => {
    expect(shouldShowStrip({ ...showing, adFree: true })).toBe(false);
  });

  it('is gone when consent rules out ads, rather than leaving an offer that only nags', () => {
    expect(shouldShowStrip({ ...showing, adsBlocked: true })).toBe(false);
  });

  it('is gone when no ad unit is configured, instead of letting the ad SDK throw', () => {
    expect(shouldShowStrip({ ...showing, unitId: '' })).toBe(false);
  });
});

describe('stripView', () => {
  it('shows the offer first and does not even request an ad yet', () => {
    expect(stripView({ promoOver: false, adsReady: true, load: 'loaded' })).toEqual({ mountAd: false, showAd: false });
  });

  it('requests the ad once the offer has had its turn, keeping the offer up while it loads', () => {
    expect(stripView({ promoOver: true, adsReady: true, load: 'loading' })).toEqual({ mountAd: true, showAd: false });
  });

  it('swaps to the ad once it has loaded', () => {
    expect(stripView({ promoOver: true, adsReady: true, load: 'loaded' })).toEqual({ mountAd: true, showAd: true });
  });

  it('keeps the offer when the ad fails (offline, no fill): never an empty box', () => {
    expect(stripView({ promoOver: true, adsReady: true, load: 'failed' })).toEqual({ mountAd: false, showAd: false });
  });

  it('keeps the offer while the ad SDK is still starting', () => {
    expect(stripView({ promoOver: true, adsReady: false, load: 'loading' })).toEqual({ mountAd: false, showAd: false });
  });
});

describe('nextBannerLoad', () => {
  it('shows the ad once it loads', () => {
    expect(nextBannerLoad('loading', 'loaded')).toBe('loaded');
  });

  it('marks a first load that fails', () => {
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
