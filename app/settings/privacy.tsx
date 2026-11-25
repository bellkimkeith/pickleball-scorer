import { StatusBar } from 'expo-status-bar';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../../components/ui/BackButton';
import { COURT } from '../../lib/theme/tokens';

const SECTIONS: { heading: string; body: string }[] = [
  {
    heading: 'What the app keeps',
    body: 'Everything the app saves (scores, player names, sessions, custom sounds and settings) stays on your device. There are no accounts, and none of it is sent anywhere.',
  },
  {
    heading: 'Advertising',
    body: 'The free version shows small banner ads from Google AdMob on a few screens (home, stats, settings and the Open Play summary), never while you score. To choose and measure ads, Google’s software may collect your IP address and the approximate location it implies, information about your device and the app, how you interact with ads, and on Android the device’s advertising ID. Google handles this under its own policy: policies.google.com/technologies/ads. Ads are limited to content rated PG.',
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
    body: 'Removing ads is an in-app purchase, monthly or lifetime, handled by the App Store or Google Play. The app never sees your payment details. Our purchase service, RevenueCat, receives an anonymous app user ID, your purchase history and basic device information so it can confirm and restore your ad-free status. It is not used for advertising.',
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

export default function PrivacyPolicyScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <StatusBar style="light" />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <BackButton />

        <Text style={{ color: COURT.ink, fontSize: 34, fontWeight: '700', paddingHorizontal: 16, paddingTop: 4 }}>
          {t('settings.privacyPolicy')}
        </Text>
        <Text style={{ color: COURT.inkMuted, fontSize: 14, paddingHorizontal: 16, paddingTop: 4, paddingBottom: 18 }}>
          Last updated: 25 November 2026
        </Text>

        <View style={{ paddingHorizontal: 16 }}>
          <Text style={{ color: '#e4ece7', fontSize: 17, lineHeight: 26, marginBottom: 20 }}>
            Pickle & Score keeps your games on your phone. The free version shows small ads; this page explains exactly what that involves.
          </Text>

          {SECTIONS.map(section => (
            <View key={section.heading} style={{ marginBottom: 20 }}>
              <Text style={{ color: COURT.ink, fontSize: 18, fontWeight: '700', marginBottom: 6 }}>
                {section.heading}
              </Text>
              <Text style={{ color: '#e4ece7', fontSize: 16, lineHeight: 24 }}>{section.body}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
