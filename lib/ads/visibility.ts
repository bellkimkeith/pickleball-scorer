export interface BannerGate {
  /** The remembered ad-free status has loaded from disk. */
  hydrated: boolean;
  adFree: boolean;
  /** Consent is settled and the ad SDK is running. */
  adsReady: boolean;
  /** Empty when no AdMob unit is configured; the ad SDK throws on an empty unit. */
  unitId: string;
}

export function shouldShowBanner({ hydrated, adFree, adsReady, unitId }: BannerGate): boolean {
  return hydrated && !adFree && adsReady && unitId !== '';
}

export type BannerLoad = 'loading' | 'loaded' | 'failed';
/** `retry`: the screen regained focus or the app came back to the foreground. */
export type BannerEvent = 'loaded' | 'failed' | 'retry';

export function nextBannerLoad(current: BannerLoad, event: BannerEvent): BannerLoad {
  switch (event) {
    case 'loaded':
      return 'loaded';
    case 'failed':
      // A failed automatic refresh leaves the previous ad on screen; keep showing it.
      return current === 'loaded' ? 'loaded' : 'failed';
    case 'retry':
      return current === 'failed' ? 'loading' : current;
  }
}
