export interface StripGate {
  /** The remembered ad-free status has loaded from disk. */
  hydrated: boolean;
  adFree: boolean;
  /** Consent rules out ads for this person (EEA, UK, Switzerland). */
  adsBlocked: boolean;
  /** Empty when no AdMob unit is configured; the ad SDK throws on an empty unit. */
  unitId: string;
}

/**
 * The top ad strip holds its place for anyone who can be shown ads, from the
 * first frame, so nothing below it jumps when the ad SDK finishes starting.
 */
export function shouldShowStrip({ hydrated, adFree, adsBlocked, unitId }: StripGate): boolean {
  return hydrated && !adFree && !adsBlocked && unitId !== '';
}

/** How long the "Go ad-free" offer holds the strip before an ad is requested. */
export const PROMO_MS = 4000;

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

export interface StripPhase {
  /** The offer has been up for PROMO_MS. */
  promoOver: boolean;
  /** Consent is settled and the ad SDK is running. */
  adsReady: boolean;
  load: BannerLoad;
}

/**
 * The offer comes first. Only once it has had its turn is an ad requested, and
 * the offer stays up until that ad has actually loaded, so the slot is never
 * empty and an ad is never hidden behind anything.
 */
export function stripView({ promoOver, adsReady, load }: StripPhase): { mountAd: boolean; showAd: boolean } {
  const mountAd = promoOver && adsReady && load !== 'failed';
  return { mountAd, showAd: mountAd && load === 'loaded' };
}
