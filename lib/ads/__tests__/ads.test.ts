const mockInitialize = jest.fn();
const mockSetRequestConfiguration = jest.fn();
const mockGatherConsent = jest.fn();
const mockGetConsentInfo = jest.fn();

jest.mock('react-native-google-mobile-ads', () => ({
  __esModule: true,
  default: () => ({
    initialize: (...args: unknown[]) => mockInitialize(...args),
    setRequestConfiguration: (...args: unknown[]) => mockSetRequestConfiguration(...args),
  }),
  AdsConsent: {
    gatherConsent: (...args: unknown[]) => mockGatherConsent(...args),
    getConsentInfo: (...args: unknown[]) => mockGetConsentInfo(...args),
    showPrivacyOptionsForm: jest.fn(),
  },
  AdsConsentPrivacyOptionsRequirementStatus: { REQUIRED: 'REQUIRED', NOT_REQUIRED: 'NOT_REQUIRED', UNKNOWN: 'UNKNOWN' },
  MaxAdContentRating: { G: 'G', PG: 'PG', T: 'T', MA: 'MA' },
  TestIds: { ADAPTIVE_BANNER: 'google-test-adaptive-banner' },
}));

type AdsModule = typeof import('../ads');
let ads: AdsModule;

const consent = (canRequestAds: boolean, privacy = 'NOT_REQUIRED') => ({
  status: 'OBTAINED',
  canRequestAds,
  privacyOptionsRequirementStatus: privacy,
  isConsentFormAvailable: true,
});

describe('startAds', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    ads = require('../ads');
    mockInitialize.mockResolvedValue([]);
    mockSetRequestConfiguration.mockResolvedValue(undefined);
  });

  it('gathers consent, sets PG and not child-directed, then initialises', async () => {
    mockGatherConsent.mockResolvedValue(consent(true));
    await expect(ads.startAds()).resolves.toEqual({ canRequestAds: true, privacyOptionsRequired: false });
    expect(mockSetRequestConfiguration).toHaveBeenCalledWith({
      maxAdContentRating: 'PG',
      tagForChildDirectedTreatment: false,
      tagForUnderAgeOfConsent: false,
    });
    expect(mockInitialize.mock.invocationCallOrder[0]).toBeGreaterThan(
      mockGatherConsent.mock.invocationCallOrder[0],
    );
  });

  it("does not initialise when consent says ads can't be requested", async () => {
    mockGatherConsent.mockResolvedValue(consent(false));
    await expect(ads.startAds()).resolves.toMatchObject({ canRequestAds: false });
    expect(mockInitialize).not.toHaveBeenCalled();
  });

  it('reports privacy options required', async () => {
    mockGatherConsent.mockResolvedValue(consent(true, 'REQUIRED'));
    await expect(ads.startAds()).resolves.toMatchObject({ privacyOptionsRequired: true });
  });

  it('resolves canRequestAds false when gathering consent fails and none is on file', async () => {
    mockGatherConsent.mockRejectedValue(new Error('offline'));
    mockGetConsentInfo.mockRejectedValue(new Error('offline'));
    await expect(ads.startAds()).resolves.toEqual({ canRequestAds: false, privacyOptionsRequired: false });
    expect(mockInitialize).not.toHaveBeenCalled();
  });

  it('uses consent from an earlier launch when gathering fails offline', async () => {
    mockGatherConsent.mockRejectedValue(new Error('offline'));
    mockGetConsentInfo.mockResolvedValue(consent(true));
    await expect(ads.startAds()).resolves.toMatchObject({ canRequestAds: true });
    expect(mockInitialize).toHaveBeenCalledTimes(1);
  });

  it('only runs once', async () => {
    mockGatherConsent.mockResolvedValue(consent(true));
    await Promise.all([ads.startAds(), ads.startAds()]);
    await ads.startAds();
    expect(mockGatherConsent).toHaveBeenCalledTimes(1);
  });

  it("uses Google's test banner in development", () => {
    expect(ads.bannerUnitId()).toBe('google-test-adaptive-banner');
  });
});
