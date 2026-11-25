/**
 * Refuses a store build while any ad or purchase setting is still a
 * placeholder, or still one of Google's sample IDs (which earn nothing).
 *
 *   npm run release:check
 */
const fs = require('fs');
const path = require('path');

const GOOGLE_TEST_PUBLISHER = 'ca-app-pub-3940256099942544';
const APP_ID = /^ca-app-pub-\d{16}~\d{10}$/;
const UNIT_ID = /^ca-app-pub-\d{16}\/\d{10}$/;

function checkAdMobId(value, pattern, label, problems) {
  if (!value) {
    problems.push(`${label} is not set.`);
  } else if (value.includes(GOOGLE_TEST_PUBLISHER)) {
    problems.push(`${label} is one of Google's sample IDs; use your own from AdMob.`);
  } else if (!pattern.test(value)) {
    problems.push(`${label} does not look like an AdMob ID: ${value}`);
  }
}

function checkKey(value, prefix, label, problems) {
  if (!value) {
    problems.push(`${label} is not set.`);
  } else if (!value.startsWith(prefix)) {
    problems.push(`${label} should start with "${prefix}" (a public RevenueCat SDK key for that store).`);
  }
}

function findReleaseProblems(appJson, config) {
  const problems = [];
  const plugins = (appJson && appJson.expo && appJson.expo.plugins) || [];
  const adsPlugin = plugins.find(
    entry => Array.isArray(entry) && entry[0] === 'react-native-google-mobile-ads',
  );

  if (!adsPlugin) {
    problems.push('app.json has no react-native-google-mobile-ads plugin.');
  } else {
    const options = adsPlugin[1] || {};
    checkAdMobId(options.iosAppId, APP_ID, 'app.json iosAppId', problems);
    checkAdMobId(options.androidAppId, APP_ID, 'app.json androidAppId', problems);
  }

  checkAdMobId(config.admob.iosBannerUnitId, UNIT_ID, 'iOS banner unit ID', problems);
  checkAdMobId(config.admob.androidBannerUnitId, UNIT_ID, 'Android banner unit ID', problems);
  checkKey(config.revenueCat.iosApiKey, 'appl_', 'RevenueCat iOS key', problems);
  checkKey(config.revenueCat.androidApiKey, 'goog_', 'RevenueCat Android key', problems);

  if (!config.privacyPolicyUrl || !config.privacyPolicyUrl.startsWith('https://')) {
    problems.push('privacyPolicyUrl must be the https address of the hosted privacy policy.');
  }

  return problems;
}

module.exports = { findReleaseProblems };

if (require.main === module) {
  const root = path.join(__dirname, '..');
  const appJson = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'));
  const config = JSON.parse(
    fs.readFileSync(path.join(root, 'lib/monetization/config.json'), 'utf8'),
  );
  const problems = findReleaseProblems(appJson, config);

  if (problems.length > 0) {
    console.error(`Not ready for a store build (${problems.length}):`);
    problems.forEach(problem => console.error(`  - ${problem}`));
    console.error('Fill these in app.json and lib/monetization/config.json (see docs/RELEASE.md).');
    process.exit(1);
  }
  console.log('Release config looks complete.');
}
