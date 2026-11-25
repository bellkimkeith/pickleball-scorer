import config from './config.json';

/**
 * Ad and purchase settings. None of these is secret: RevenueCat's public SDK
 * keys and AdMob IDs ship inside the app anyway. Empty means "not set up yet";
 * `npm run release:check` refuses a store build until every value is real.
 */
export interface MonetizationConfig {
  revenueCat: { iosApiKey: string; androidApiKey: string };
  admob: { iosBannerUnitId: string; androidBannerUnitId: string };
  privacyPolicyUrl: string;
  termsOfUseUrl: string;
}

export const MONETIZATION_CONFIG: MonetizationConfig = config;

/** The RevenueCat entitlement that removes ads. */
export const ENTITLEMENT_ID = 'ad_free';
