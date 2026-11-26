export interface PrivacySection {
  heading: string;
  body: string;
}

/**
 * The in-app privacy policy, worded per platform: App Review rejects iOS apps
 * that name other platforms (guideline 2.3.10), and the advertising ID line
 * only applies to Android, where the app never asks iOS for its identifier.
 */
export function privacySections(os: 'ios' | 'android'): PrivacySection[] {
  return [
    {
      heading: 'What the app keeps',
      body: 'Everything the app saves (scores, player names, sessions, custom sounds and settings) stays on your device. There are no accounts, and none of it is sent anywhere.',
    },
    {
      heading: 'Advertising',
      body: `The free version shows small banner ads from Google AdMob on a few screens (home, stats, settings and the Open Play summary), never while you score. To choose and measure ads, Google’s software may collect your IP address and the approximate location it implies, information about your device and the app, how you interact with ads${os === 'android' ? ' and the device’s advertising ID' : ''}. Google handles this under its own policy: policies.google.com/technologies/ads. Ads are limited to content rated PG.`,
    },
    {
      heading: 'Your consent',
      body: 'In the EEA, the UK and Switzerland the app asks for your consent before showing personalised ads. You can change your choice at any time under Settings → Ads → Ad privacy choices.',
    },
    {
      heading: 'Tracking on iPhone',
      body: 'The app does not ask to track you, and it never gets the iPhone’s advertising identifier.',
    },
    {
      heading: 'Removing ads',
      body: `Removing ads is an in-app purchase, monthly or lifetime, handled by ${os === 'ios' ? 'the App Store' : 'Google Play'}. The app never sees your payment details. Our purchase service, RevenueCat, receives an anonymous app user ID, your purchase history and basic device information so it can confirm and restore your ad-free status. It is not used for advertising.`,
    },
    {
      heading: 'When you are ad-free',
      body: 'Once you are ad-free, the app stops asking for and showing ads.',
    },
    {
      heading: 'Network usage',
      body: 'The app goes online only to load ads and to check or make purchases. Scoring, Open Play and everything else work fully offline.',
    },
    {
      heading: 'Your audio files',
      body: 'If you add your own soundboard clips, the system file picker asks you to choose a file, and a copy is saved inside the app on your device. Those clips are never uploaded, shared or included in the images you share.',
    },
    {
      heading: 'Device permissions',
      body: 'The app does not use your camera, contacts or precise location. The only time it touches your files is when you pick an audio clip yourself.',
    },
    {
      heading: 'Sharing',
      body: 'When you share a result, your phone’s own share sheet handles it, and you choose where it goes. The app sends nothing on its own.',
    },
    {
      heading: 'Children',
      body: 'The app is not directed at children under 13, and its ads are limited to content rated PG.',
    },
    {
      heading: 'Contact',
      body: 'For questions about this policy, use the developer contact details on the app’s store listing.',
    },
  ];
}
