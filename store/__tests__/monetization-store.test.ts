import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases from 'react-native-purchases';
import { customerInfo } from '../../lib/monetization/__tests__/fixtures';
import { useMonetizationStore } from '../monetization-store';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

jest.mock('react-native-purchases', () => ({
  __esModule: true,
  default: {
    configure: jest.fn(),
    getCustomerInfo: jest.fn(),
    getOfferings: jest.fn(),
    purchasePackage: jest.fn(),
    restorePurchases: jest.fn(),
    addCustomerInfoUpdateListener: jest.fn(),
  },
  PURCHASES_ERROR_CODE: {
    PURCHASE_CANCELLED_ERROR: '1',
    STORE_PROBLEM_ERROR: '2',
    NETWORK_ERROR: '10',
    PAYMENT_PENDING_ERROR: '20',
    OFFLINE_CONNECTION_ERROR: '35',
  },
}));

const mockConfig = {
  revenueCat: { iosApiKey: '', androidApiKey: '' },
  admob: { iosBannerUnitId: '', androidBannerUnitId: '' },
  privacyPolicyUrl: '',
  termsOfUseUrl: '',
};
// A getter: the mocked module is built before `mockConfig` is initialised.
jest.mock('../../lib/monetization/config', () => ({
  get MONETIZATION_CONFIG() {
    return mockConfig;
  },
  ENTITLEMENT_ID: 'ad_free',
}));

const P = jest.mocked(Purchases);
const adFreeLifetime = customerInfo({ ad_free: { expirationDate: null } });

function pkg(identifier: '$rc_lifetime' | '$rc_monthly', priceString: string) {
  return { identifier, product: { priceString } };
}

function configure() {
  mockConfig.revenueCat = { iosApiKey: 'appl_x', androidApiKey: 'goog_x' };
  expect(useMonetizationStore.getState().configurePurchases()).toBe(true);
}

async function configureWithOffer() {
  configure();
  P.getOfferings.mockResolvedValue({
    current: { availablePackages: [pkg('$rc_monthly', '₱49.00'), pkg('$rc_lifetime', '₱249.00')] },
    all: {},
  } as never);
  await useMonetizationStore.getState().loadOffer();
}

describe('monetization store', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    mockConfig.revenueCat = { iosApiKey: '', androidApiKey: '' };
    useMonetizationStore.setState({
      adFree: false,
      plan: null,
      managementUrl: null,
      hydrated: true,
      purchasesConfigured: false,
      adsReady: false,
      privacyOptionsRequired: false,
      offer: { status: 'idle' },
      purchasing: false,
    });
  });

  it('refresh keeps adFree true when getCustomerInfo rejects', async () => {
    configure();
    useMonetizationStore.setState({ adFree: true, plan: 'lifetime' });
    P.getCustomerInfo.mockRejectedValue(new Error('network'));
    await useMonetizationStore.getState().refresh();
    expect(useMonetizationStore.getState().adFree).toBe(true);
  });

  it('refresh sets adFree false when RevenueCat answers without the entitlement', async () => {
    configure();
    useMonetizationStore.setState({ adFree: true, plan: 'monthly' });
    P.getCustomerInfo.mockResolvedValue(customerInfo());
    await useMonetizationStore.getState().refresh();
    expect(useMonetizationStore.getState()).toMatchObject({ adFree: false, plan: null });
  });

  it('loadOffer is unavailable when no key is configured', async () => {
    expect(useMonetizationStore.getState().configurePurchases()).toBe(false);
    await useMonetizationStore.getState().loadOffer();
    expect(useMonetizationStore.getState().offer.status).toBe('unavailable');
    expect(P.getOfferings).not.toHaveBeenCalled();
    expect(P.configure).not.toHaveBeenCalled();
  });

  it('loadOffer is unavailable when getOfferings throws', async () => {
    configure();
    P.getOfferings.mockRejectedValue(new Error('offline'));
    await useMonetizationStore.getState().loadOffer();
    expect(useMonetizationStore.getState().offer.status).toBe('unavailable');
  });

  it('loadOffer lists lifetime before monthly with store price strings', async () => {
    await configureWithOffer();
    const offer = useMonetizationStore.getState().offer;
    expect(offer.status).toBe('ready');
    if (offer.status !== 'ready') return;
    expect(offer.options.map(o => [o.plan, o.priceString])).toEqual([
      ['lifetime', '₱249.00'],
      ['monthly', '₱49.00'],
    ]);
  });

  it('purchase success marks ad-free', async () => {
    await configureWithOffer();
    P.purchasePackage.mockResolvedValue({ customerInfo: adFreeLifetime } as never);
    await expect(useMonetizationStore.getState().purchase('lifetime')).resolves.toBe('success');
    expect(useMonetizationStore.getState()).toMatchObject({ adFree: true, plan: 'lifetime', purchasing: false });
  });

  it('purchase cancelled changes nothing', async () => {
    await configureWithOffer();
    P.purchasePackage.mockRejectedValue({ userCancelled: true, code: '1' });
    await expect(useMonetizationStore.getState().purchase('monthly')).resolves.toBe('cancelled');
    expect(useMonetizationStore.getState().adFree).toBe(false);
  });

  it('purchase pending is not success', async () => {
    await configureWithOffer();
    P.purchasePackage.mockRejectedValue({ userCancelled: false, code: '20' });
    await expect(useMonetizationStore.getState().purchase('lifetime')).resolves.toBe('pending');
    expect(useMonetizationStore.getState().adFree).toBe(false);
  });

  it('purchase resolving without the entitlement is pending', async () => {
    await configureWithOffer();
    P.purchasePackage.mockResolvedValue({ customerInfo: customerInfo() } as never);
    await expect(useMonetizationStore.getState().purchase('lifetime')).resolves.toBe('pending');
  });

  it('a second purchase while one is running is ignored', async () => {
    await configureWithOffer();
    let finish: (value: unknown) => void = () => {};
    P.purchasePackage.mockReturnValue(new Promise(resolve => { finish = resolve; }) as never);
    const first = useMonetizationStore.getState().purchase('lifetime');
    await expect(useMonetizationStore.getState().purchase('lifetime')).resolves.toBe('error');
    finish({ customerInfo: adFreeLifetime });
    await expect(first).resolves.toBe('success');
    expect(P.purchasePackage).toHaveBeenCalledTimes(1);
  });

  it('purchase without a configured store is unavailable', async () => {
    await expect(useMonetizationStore.getState().purchase('lifetime')).resolves.toBe('unavailable');
  });

  it('restore that RevenueCat answers with no entitlement is notFound', async () => {
    configure();
    P.restorePurchases.mockResolvedValue(customerInfo());
    await expect(useMonetizationStore.getState().restore()).resolves.toBe('notFound');
    expect(useMonetizationStore.getState().adFree).toBe(false);
  });

  it.each([
    ['offline', '35'],
    ['a network error', '10'],
    ['a store problem', '2'],
  ])('restore during %s is unavailable, never notFound', async (_label, code) => {
    configure();
    P.restorePurchases.mockRejectedValue({ userCancelled: false, code });
    await expect(useMonetizationStore.getState().restore()).resolves.toBe('unavailable');
  });

  it('purchase during a network error is unavailable', async () => {
    await configureWithOffer();
    P.purchasePackage.mockRejectedValue({ userCancelled: false, code: '10' });
    await expect(useMonetizationStore.getState().purchase('monthly')).resolves.toBe('unavailable');
  });

  it('restore that finds the purchase marks ad-free', async () => {
    configure();
    P.restorePurchases.mockResolvedValue(adFreeLifetime);
    await expect(useMonetizationStore.getState().restore()).resolves.toBe('success');
    expect(useMonetizationStore.getState().adFree).toBe(true);
  });

  it('a customer-info update from RevenueCat applies immediately', () => {
    configure();
    const listener = P.addCustomerInfoUpdateListener.mock.calls[0][0];
    listener(adFreeLifetime);
    expect(useMonetizationStore.getState()).toMatchObject({ adFree: true, plan: 'lifetime' });
  });
});
