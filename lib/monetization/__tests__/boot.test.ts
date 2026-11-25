const mockStartAds = jest.fn();

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

jest.mock('react-native-purchases', () => ({
  __esModule: true,
  default: {
    configure: jest.fn(),
    getCustomerInfo: jest.fn(),
    addCustomerInfoUpdateListener: jest.fn(),
  },
  PURCHASES_ERROR_CODE: {},
}));

jest.mock('../../ads/ads', () => ({
  startAds: (...args: unknown[]) => mockStartAds(...args),
}));

type Store = typeof import('../../../store/monetization-store')['useMonetizationStore'];
let store: Store;
let bootMonetization: () => Promise<void>;

const flush = () => new Promise(resolve => setImmediate(resolve));

describe('bootMonetization', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetModules();
    store = require('../../../store/monetization-store').useMonetizationStore;
    bootMonetization = require('../boot').bootMonetization;
    await flush(); // let the persisted state finish loading
    mockStartAds.mockResolvedValue({ canRequestAds: true, privacyOptionsRequired: true });
  });

  it('never starts ads for someone who is ad-free', async () => {
    store.setState({ hydrated: true, adFree: true, plan: 'lifetime' });
    await bootMonetization();
    expect(mockStartAds).not.toHaveBeenCalled();
    expect(store.getState().adsReady).toBe(false);
  });

  it('starts ads for everyone else and marks them ready', async () => {
    store.setState({ hydrated: true, adFree: false });
    await bootMonetization();
    expect(mockStartAds).toHaveBeenCalledTimes(1);
    expect(store.getState()).toMatchObject({ adsReady: true, privacyOptionsRequired: true });
  });

  it('starts ads when ad-free ends mid-session', async () => {
    store.setState({ hydrated: true, adFree: true, plan: 'monthly' });
    await bootMonetization();
    expect(mockStartAds).not.toHaveBeenCalled();

    store.setState({ adFree: false, plan: null });
    await flush();
    expect(mockStartAds).toHaveBeenCalledTimes(1);
    expect(store.getState().adsReady).toBe(true);
  });

  it('waits for the remembered status before deciding', async () => {
    store.setState({ hydrated: false, adFree: false });
    const booting = bootMonetization();
    await flush();
    expect(mockStartAds).not.toHaveBeenCalled();

    store.setState({ hydrated: true, adFree: true });
    await booting;
    expect(mockStartAds).not.toHaveBeenCalled();
  });
});
