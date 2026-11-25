// eslint-disable-next-line @typescript-eslint/no-require-imports
const { addAdMobKotlinFlag } = require('../with-android-admob-kotlin');

const ROOT_GRADLE = `buildscript {
  dependencies {
    classpath('org.jetbrains.kotlin:kotlin-gradle-plugin')
  }
}

apply plugin: "expo-root-project"
`;

describe('addAdMobKotlinFlag', () => {
  it('lets only the AdMob module read newer Kotlin metadata', () => {
    const patched = addAdMobKotlinFlag(ROOT_GRADLE);
    expect(patched.startsWith(ROOT_GRADLE)).toBe(true);
    expect(patched).toContain("subproject.name == 'react-native-google-mobile-ads'");
    expect(patched).toContain("freeCompilerArgs.add('-Xskip-metadata-version-check')");
  });

  it('adds the block once, however many times prebuild runs', () => {
    const twice = addAdMobKotlinFlag(addAdMobKotlinFlag(ROOT_GRADLE));
    expect(twice.split('-Xskip-metadata-version-check').length - 1).toBe(1);
  });
});
