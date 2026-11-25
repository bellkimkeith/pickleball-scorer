import { Platform } from 'react-native';
import mobileAds, {
  AdsConsent,
  AdsConsentInfo,
  AdsConsentPrivacyOptionsRequirementStatus,
  MaxAdContentRating,
  TestIds,
} from 'react-native-google-mobile-ads';
import { MONETIZATION_CONFIG } from '../monetization/config';

export interface AdsStartResult {
  canRequestAds: boolean;
  privacyOptionsRequired: boolean;
}

let started: Promise<AdsStartResult> | null = null;

async function consentInfo(): Promise<AdsConsentInfo | null> {
  try {
    // Shows Google's form only where the law asks for one (EEA, UK, Switzerland).
    return await AdsConsent.gatherConsent();
  } catch {
    // Offline at launch: the choice someone made on an earlier launch still counts.
    try {
      return await AdsConsent.getConsentInfo();
    } catch {
      return null;
    }
  }
}

async function start(): Promise<AdsStartResult> {
  const consent = await consentInfo();
  if (!consent) return { canRequestAds: false, privacyOptionsRequired: false };

  const privacyOptionsRequired =
    consent.privacyOptionsRequirementStatus === AdsConsentPrivacyOptionsRequirementStatus.REQUIRED;
  if (!consent.canRequestAds) return { canRequestAds: false, privacyOptionsRequired };

  try {
    await mobileAds().setRequestConfiguration({
      maxAdContentRating: MaxAdContentRating.PG,
      tagForChildDirectedTreatment: false,
      tagForUnderAgeOfConsent: false,
    });
    await mobileAds().initialize();
    return { canRequestAds: true, privacyOptionsRequired };
  } catch {
    return { canRequestAds: false, privacyOptionsRequired };
  }
}

/** Settles consent and initialises the ad SDK, once per app run. Never rejects. */
export function startAds(): Promise<AdsStartResult> {
  if (!started) started = start();
  return started;
}

/** Reopens Google's consent form from Settings. */
export async function openAdPrivacyChoices(): Promise<void> {
  try {
    await AdsConsent.showPrivacyOptionsForm();
  } catch {
    // Nothing to show, or no connection; the row stays put to try again.
  }
}

export function bannerUnitId(): string {
  if (__DEV__) return TestIds.ADAPTIVE_BANNER;
  const { iosBannerUnitId, androidBannerUnitId } = MONETIZATION_CONFIG.admob;
  return Platform.select({ ios: iosBannerUnitId, android: androidBannerUnitId, default: '' });
}
