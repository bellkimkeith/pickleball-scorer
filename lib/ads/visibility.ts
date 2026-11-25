export interface BannerGate {
  /** The remembered ad-free status has loaded from disk. */
  hydrated: boolean;
  adFree: boolean;
  /** Consent is settled and the ad SDK is running. */
  adsReady: boolean;
}

export function shouldShowBanner({ hydrated, adFree, adsReady }: BannerGate): boolean {
  return hydrated && !adFree && adsReady;
}
