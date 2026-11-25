import { statusFromCustomerInfo } from '../entitlement';
import { customerInfo } from './fixtures';

describe('statusFromCustomerInfo', () => {
  it('is not ad-free without the ad_free entitlement', () => {
    expect(statusFromCustomerInfo(customerInfo())).toEqual({
      adFree: false,
      plan: null,
      managementUrl: null,
    });
  });

  it('reads an entitlement that never expires as lifetime', () => {
    expect(statusFromCustomerInfo(customerInfo({ ad_free: { expirationDate: null } }))).toEqual({
      adFree: true,
      plan: 'lifetime',
      managementUrl: null,
    });
  });

  it('reads an entitlement with an expiry as monthly, with its management link', () => {
    const info = customerInfo(
      { ad_free: { expirationDate: '2026-12-25T00:00:00Z' } },
      'https://apps.apple.com/account/subscriptions',
    );
    expect(statusFromCustomerInfo(info)).toEqual({
      adFree: true,
      plan: 'monthly',
      managementUrl: 'https://apps.apple.com/account/subscriptions',
    });
  });

  it('ignores other entitlements', () => {
    expect(statusFromCustomerInfo(customerInfo({ pro: { expirationDate: null } })).adFree).toBe(false);
  });
});
