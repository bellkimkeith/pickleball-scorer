const { withProjectBuildGradle } = require('expo/config-plugins');

// react-native-google-mobile-ads 16.5.0 pins play-services-ads 25.4.0, which
// Google compiled with Kotlin 2.3. Expo SDK 55 / React Native 0.83 compile with
// Kotlin 2.1, and a Kotlin compiler only reads metadata up to one version ahead
// of itself, so the AdMob module's own Kotlin fails with "Module was compiled
// with an incompatible version of Kotlin ... 2.3.0, expected version is 2.1.0".
//
// The module only calls the SDK's Java-facing API, so skipping the metadata
// version check for that one module is safe; every other module keeps the
// check. The library offers no way to pin an older play-services-ads, and
// Expo 55's KSP table has no entry for a newer Kotlin. Drop this plugin once the
// project's Kotlin reaches 2.2 or later.

const MARKER = 'with-android-admob-kotlin';

const BLOCK = `
// Injected by plugins/${MARKER}.js — see that file for why.
subprojects { subproject ->
  if (subproject.name == 'react-native-google-mobile-ads') {
    subproject.tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile).configureEach {
      compilerOptions.freeCompilerArgs.add('-Xskip-metadata-version-check')
    }
  }
}
`;

function addAdMobKotlinFlag(contents) {
  if (contents.includes(MARKER)) return contents;
  return contents + BLOCK;
}

const withAndroidAdMobKotlin = config =>
  withProjectBuildGradle(config, mod => {
    mod.modResults.contents = addAdMobKotlinFlag(mod.modResults.contents);
    return mod;
  });

module.exports = withAndroidAdMobKotlin;
module.exports.addAdMobKotlinFlag = addAdMobKotlinFlag;
