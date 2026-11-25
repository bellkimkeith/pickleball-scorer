// eslint-disable-next-line @typescript-eslint/no-require-imports
const { findReleaseProblems } = require('../check-release-config');

const good = {
  revenueCat: { iosApiKey: 'appl_abc', androidApiKey: 'goog_abc' },
  admob: {
    iosBannerUnitId: 'ca-app-pub-1111111111111111/2222222222',
    androidBannerUnitId: 'ca-app-pub-1111111111111111/3333333333',
  },
  privacyPolicyUrl: 'https://example.com/privacy',
  termsOfUseUrl: 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/',
};

const appJson = (ios: string, android: string) => ({
  expo: {
    plugins: ['expo-router', ['react-native-google-mobile-ads', { iosAppId: ios, androidAppId: android }]],
  },
});

const realApp = appJson('ca-app-pub-1111111111111111~4444444444', 'ca-app-pub-1111111111111111~5555555555');

describe('release config check', () => {
  it('passes a fully configured release', () => {
    expect(findReleaseProblems(realApp, good)).toEqual([]);
  });

  it('rejects Google sample app IDs', () => {
    const problems = findReleaseProblems(
      appJson('ca-app-pub-3940256099942544~1458002511', 'ca-app-pub-3940256099942544~3347511713'),
      good,
    );
    expect(problems).toHaveLength(2);
  });

  it('rejects empty or test banner units', () => {
    const config = {
      ...good,
      admob: { iosBannerUnitId: '', androidBannerUnitId: 'ca-app-pub-3940256099942544/9214589741' },
    };
    expect(findReleaseProblems(realApp, config)).toHaveLength(2);
  });

  it('rejects missing, test-store, or cross-platform RevenueCat keys', () => {
    const config = { ...good, revenueCat: { iosApiKey: 'test_abc', androidApiKey: 'appl_abc' } };
    expect(findReleaseProblems(realApp, config)).toHaveLength(2);
  });

  it('requires an https privacy policy URL', () => {
    expect(findReleaseProblems(realApp, { ...good, privacyPolicyUrl: '' })).toHaveLength(1);
  });

  it('fails when the AdMob plugin is missing', () => {
    expect(findReleaseProblems({ expo: { plugins: [] } }, good).length).toBeGreaterThan(0);
  });
});
