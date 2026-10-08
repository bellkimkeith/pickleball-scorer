const { withAppDelegate, withInfoPlist } = require('expo/config-plugins');

// iOS 27 terminates any app that has not adopted the UIScene lifecycle: UIKit
// raises a runtime issue from _UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption
// and the process dies with EXC_BREAKPOINT before the first frame. React Native
// 0.83 (Expo SDK 55) still creates its UIWindow in the app delegate and ships no
// scene delegate, so the app must supply one.
//
// The scene adopts the window the app delegate already built rather than making
// its own root, which keeps RCTReactNativeFactory's setup untouched. Deep links
// and universal links are forwarded, because in a scene-based app UIKit stops
// calling the app delegate's application(_:open:) and continue(userActivity:).
//
// Remove this plugin once Expo's own AppDelegate adopts UIScene.

const MARKER = 'class SceneDelegate';

const SCENE_DELEGATE = `

/// Added by plugins/with-ios-scene-lifecycle.js — see that file for why.
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = scene as? UIWindowScene else { return }

    // The app delegate builds the window React Native renders into; the scene
    // takes it over so that window has somewhere to appear.
    let appWindow = (UIApplication.shared.delegate as? AppDelegate)?.window
    let sceneWindow = appWindow ?? UIWindow(windowScene: windowScene)
    sceneWindow.windowScene = windowScene
    window = sceneWindow
    sceneWindow.makeKeyAndVisible()

    for context in connectionOptions.urlContexts {
      RCTLinkingManager.application(UIApplication.shared, open: context.url, options: [:])
    }
    for activity in connectionOptions.userActivities {
      RCTLinkingManager.application(UIApplication.shared, continue: activity) { _ in }
    }
  }

  func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    for context in URLContexts {
      RCTLinkingManager.application(UIApplication.shared, open: context.url, options: [:])
    }
  }

  func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
    RCTLinkingManager.application(UIApplication.shared, continue: userActivity) { _ in }
  }
}
`;

const withSceneDelegateClass = config =>
  withAppDelegate(config, cfg => {
    if (cfg.modResults.language !== 'swift') {
      throw new Error(
        '[with-ios-scene-lifecycle] Expected a Swift AppDelegate, got ' + cfg.modResults.language
      );
    }

    if (!cfg.modResults.contents.includes(MARKER)) {
      cfg.modResults.contents += SCENE_DELEGATE;
    }

    return cfg;
  });

const withSceneManifest = config =>
  withInfoPlist(config, cfg => {
    cfg.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: 'Default Configuration',
            UISceneDelegateClassName: '$(PRODUCT_MODULE_NAME).SceneDelegate',
          },
        ],
      },
    };

    return cfg;
  });

module.exports = function withIosSceneLifecycle(config) {
  return withSceneManifest(withSceneDelegateClass(config));
};
