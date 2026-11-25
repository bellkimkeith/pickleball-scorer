import type { CustomerInfo } from 'react-native-purchases';
import { ENTITLEMENT_ID } from './config';

export type AdFreePlan = 'lifetime' | 'monthly';

export interface AdFreeStatus {
  adFree: boolean;
  plan: AdFreePlan | null;
  /** The store's page for managing a subscription, when RevenueCat knows it. */
  managementUrl: string | null;
}

/** A lifetime purchase never expires; the monthly subscription always has an expiry. */
export function statusFromCustomerInfo(info: CustomerInfo): AdFreeStatus {
  const entitlement = info.entitlements.active[ENTITLEMENT_ID];
  if (!entitlement) {
    return { adFree: false, plan: null, managementUrl: null };
  }
  return {
    adFree: true,
    plan: entitlement.expirationDate === null ? 'lifetime' : 'monthly',
    managementUrl: info.managementURL ?? null,
  };
}
