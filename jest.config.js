module.exports = {
  preset: 'jest-expo',
  // Homebrew watchman is broken on this machine (missing libfmt); jest does not need it.
  watchman: false,
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|nativewind|react-native-css-interop)',
  ],
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
};
