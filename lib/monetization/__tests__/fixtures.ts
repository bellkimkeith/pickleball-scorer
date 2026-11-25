import type { CustomerInfo } from 'react-native-purchases';

/** A CustomerInfo carrying only what the app reads: active entitlements and the management link. */
export function customerInfo(
  active: Record<string, { expirationDate: string | null; productIdentifier?: string }> = {},
  managementURL: string | null = null,
): CustomerInfo {
  return {
    entitlements: { active, all: active, verification: 'NOT_REQUESTED' },
    managementURL,
  } as unknown as CustomerInfo;
}
