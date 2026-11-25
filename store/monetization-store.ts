import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Purchases, { PURCHASES_ERROR_CODE, PurchasesPackage } from 'react-native-purchases';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { MONETIZATION_CONFIG } from '../lib/monetization/config';
import { AdFreePlan, AdFreeStatus, statusFromCustomerInfo } from '../lib/monetization/entitlement';

/**
 * `notFound`: RevenueCat answered, and this store account owns no ad-free purchase.
 * `unavailable`: no answer at all (no key, offline, the store is down), so nothing is known.
 */
export type PurchaseOutcome = 'success' | 'cancelled' | 'pending' | 'notFound' | 'unavailable' | 'error';

export interface AdFreeOption {
  plan: AdFreePlan;
  /** The store's own localised price, e.g. "₱249.00". */
  priceString: string;
  pkg: PurchasesPackage;
}

export type OfferState =
  | { status: 'idle' | 'loading' | 'unavailable' }
  | { status: 'ready'; options: AdFreeOption[] };

interface MonetizationState extends AdFreeStatus {
  /** The remembered ad-free status has loaded from disk. Until then, no ad is drawn. */
  hydrated: boolean;
  purchasesConfigured: boolean;
  /** Consent is settled and the ad SDK is initialised. */
  adsReady: boolean;
  /** Google requires an entry point to change ad consent for this person. */
  privacyOptionsRequired: boolean;
  offer: OfferState;
  purchasing: boolean;

  configurePurchases: () => boolean;
  refresh: () => Promise<void>;
  loadOffer: () => Promise<void>;
  purchase: (plan: AdFreePlan) => Promise<PurchaseOutcome>;
  /** `success`, or `notFound` when RevenueCat answers without the entitlement. */
  restore: () => Promise<PurchaseOutcome>;
}

const PACKAGE_PLAN: Record<string, AdFreePlan> = {
  $rc_lifetime: 'lifetime',
  $rc_monthly: 'monthly',
};
const PLAN_ORDER: AdFreePlan[] = ['lifetime', 'monthly'];

function apiKeyForPlatform(): string {
  const { iosApiKey, androidApiKey } = MONETIZATION_CONFIG.revenueCat;
  if (Platform.OS === 'ios') return iosApiKey;
  if (Platform.OS === 'android') return androidApiKey;
  return '';
}

const NO_ANSWER_CODES: string[] = [
  PURCHASES_ERROR_CODE.NETWORK_ERROR,
  PURCHASES_ERROR_CODE.OFFLINE_CONNECTION_ERROR,
  PURCHASES_ERROR_CODE.STORE_PROBLEM_ERROR,
];

function outcomeFromError(error: unknown): PurchaseOutcome {
  const { userCancelled, code } = (error ?? {}) as { userCancelled?: boolean; code?: string };
  if (userCancelled || code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) return 'cancelled';
  if (code === PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR) return 'pending';
  if (code && NO_ANSWER_CODES.includes(code)) return 'unavailable';
  return 'error';
}

export const useMonetizationStore = create<MonetizationState>()(
  persist(
    (set, get) => ({
      adFree: false,
      plan: null,
      managementUrl: null,
      hydrated: false,
      purchasesConfigured: false,
      adsReady: false,
      privacyOptionsRequired: false,
      offer: { status: 'idle' },
      purchasing: false,

      configurePurchases: () => {
        if (get().purchasesConfigured) return true;
        const apiKey = apiKeyForPlatform();
        if (!apiKey) return false;
        try {
          Purchases.configure({ apiKey });
          // Purchases, restores, renewals, expiries and refunds all arrive here.
          Purchases.addCustomerInfoUpdateListener(info => set(statusFromCustomerInfo(info)));
          set({ purchasesConfigured: true });
          return true;
        } catch {
          return false;
        }
      },

      refresh: async () => {
        if (!get().purchasesConfigured) return;
        try {
          set(statusFromCustomerInfo(await Purchases.getCustomerInfo()));
        } catch {
          // Offline or the store is down: keep what we remembered. Only a real
          // answer from RevenueCat may take ad-free away.
        }
      },

      loadOffer: async () => {
        if (!get().purchasesConfigured) {
          set({ offer: { status: 'unavailable' } });
          return;
        }
        set({ offer: { status: 'loading' } });
        try {
          const offerings = await Purchases.getOfferings();
          const offering = offerings.current ?? offerings.all.default;
          const options = (offering?.availablePackages ?? [])
            .filter(pkg => PACKAGE_PLAN[pkg.identifier])
            .map(pkg => ({ plan: PACKAGE_PLAN[pkg.identifier], priceString: pkg.product.priceString, pkg }))
            .sort((a, b) => PLAN_ORDER.indexOf(a.plan) - PLAN_ORDER.indexOf(b.plan));
          set({ offer: options.length > 0 ? { status: 'ready', options } : { status: 'unavailable' } });
        } catch {
          set({ offer: { status: 'unavailable' } });
        }
      },

      purchase: async plan => {
        if (get().purchasing) return 'error';
        if (!get().purchasesConfigured) return 'unavailable';
        const offer = get().offer;
        const option = offer.status === 'ready' ? offer.options.find(o => o.plan === plan) : undefined;
        if (!option) return 'unavailable';

        set({ purchasing: true });
        try {
          const { customerInfo } = await Purchases.purchasePackage(option.pkg);
          const status = statusFromCustomerInfo(customerInfo);
          if (!status.adFree) return 'pending';
          set(status);
          return 'success';
        } catch (error) {
          return outcomeFromError(error);
        } finally {
          set({ purchasing: false });
        }
      },

      restore: async () => {
        if (!get().purchasesConfigured) return 'unavailable';
        try {
          const status = statusFromCustomerInfo(await Purchases.restorePurchases());
          set(status);
          return status.adFree ? 'success' : 'notFound';
        } catch (error) {
          // Offline must never read as "you never bought it".
          const outcome = outcomeFromError(error);
          return outcome === 'error' ? 'unavailable' : outcome;
        }
      },
    }),
    {
      name: 'monetization',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({ adFree: state.adFree, plan: state.plan, managementUrl: state.managementUrl }),
      // Runs after AsyncStorage answers (always later than the store's creation),
      // on success and on a failed read alike, so ads are never held back forever.
      onRehydrateStorage: () => () => {
        useMonetizationStore.setState({ hydrated: true });
      },
    },
  ),
);
