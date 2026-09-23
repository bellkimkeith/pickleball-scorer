const {
  withDangerousMod,
  withPodfileProperties,
  withXcodeProject,
} = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

// The iOS floor for this app, in one place.
//
// 16.0 rather than 15.1 because expo-router 55.0.7 does not compile below it:
// ios/LinkPreview/LinkPreviewNativeActionView.swift assigns `UIAction.subtitle`
// (iOS 16+) without an availability guard, even though ExpoRouter.podspec still
// declares `:ios => '15.1'`. Upstream guards `.keepsMenuPresented` three lines
// above and missed this one. Revisit when expo-router fixes it.
const DEPLOYMENT_TARGET = '16.0';

// Two separate problems, one knob:
//
// 1. `ios.deploymentTarget` feeds the generated Podfile's `platform :ios` line,
//    which is what raises the floor to 16.0 for every pod.
// 2. Xcode 26+ refuses to build anything targeting below iOS 15.0, and
//    react_native_post_install only sets IPHONEOS_DEPLOYMENT_TARGET at the
//    *project* level. CocoaPods writes an explicit target-level value onto
//    resource bundle targets, copied from each pod's own podspec (SDWebImage 9.0,
//    RNSVG 12.4, RNCAsyncStorage 13.4). Target-level wins, so those bundles stay
//    below the floor and fail the build. The post_install hook below raises them.

const MARKER = 'min_ios_deployment_target';

const ANCHOR = `      :ccache_enabled => ccache_enabled?(podfile_properties),
    )
`;

const PATCH = `
    # Injected by plugins/with-ios-deployment-target.js — see that file for why.
    min_ios_deployment_target = podfile_properties['ios.deploymentTarget'] || '${DEPLOYMENT_TARGET}'
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        existing = config.build_settings['IPHONEOS_DEPLOYMENT_TARGET']
        next if existing.nil? # inherits the project-level value, which is already correct
        if existing.to_f < min_ios_deployment_target.to_f
          config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = min_ios_deployment_target
        end
      end
    end
`;

function withPodfilePostInstall(config) {
  return withDangerousMod(config, [
    'ios',
    (cfg) => {
      const podfile = path.join(cfg.modRequest.platformProjectRoot, 'Podfile');
      const contents = fs.readFileSync(podfile, 'utf8');

      if (contents.includes(MARKER)) {
        return cfg;
      }

      if (!contents.includes(ANCHOR)) {
        throw new Error(
          '[with-ios-deployment-target] Could not find the react_native_post_install call in ' +
            'ios/Podfile. The Expo Podfile template has changed — update the ANCHOR in ' +
            'plugins/with-ios-deployment-target.js.'
        );
      }

      fs.writeFileSync(podfile, contents.replace(ANCHOR, ANCHOR + PATCH));
      return cfg;
    },
  ]);
}

// The generated app project keeps the Expo template's own default, so without this
// the app target links 16.0 pod objects into a 15.1 binary.
function withAppTargetDeploymentTarget(config) {
  return withXcodeProject(config, (cfg) => {
    const buildConfigs = cfg.modResults.pbxXCBuildConfigurationSection();
    for (const key of Object.keys(buildConfigs)) {
      const entry = buildConfigs[key];
      if (entry && typeof entry === 'object' && entry.buildSettings) {
        if (entry.buildSettings.IPHONEOS_DEPLOYMENT_TARGET) {
          entry.buildSettings.IPHONEOS_DEPLOYMENT_TARGET = DEPLOYMENT_TARGET;
        }
      }
    }
    return cfg;
  });
}

module.exports = function withIosDeploymentTarget(config) {
  config = withPodfileProperties(config, (cfg) => {
    cfg.modResults['ios.deploymentTarget'] = DEPLOYMENT_TARGET;
    return cfg;
  });
  config = withAppTargetDeploymentTarget(config);
  return withPodfilePostInstall(config);
};
