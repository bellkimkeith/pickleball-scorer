import { StatusBar } from 'expo-status-bar';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../../components/ui/BackButton';
import { COURT } from '../../lib/theme/tokens';

const SECTIONS: { heading: string; body: string }[] = [
  {
    heading: 'Data collection',
    body: 'This app does not collect, store, transmit or share any personal data or usage information. Everything it saves (scores, player names, sessions, custom sounds and settings) stays on your device.',
  },
  {
    heading: 'Network usage',
    body: 'The app makes no network requests. It works entirely offline and never needs an internet connection.',
  },
  {
    heading: 'Analytics and advertising',
    body: 'There are no analytics services, tracking tools or advertising frameworks in this app.',
  },
  {
    heading: 'Your audio files',
    body: 'If you add your own soundboard clips, the system file picker asks you to choose a file, and a copy is saved inside the app on your device. Those clips are never uploaded, shared or included in the images you share.',
  },
  {
    heading: 'Device permissions',
    body: 'The app does not use your camera, contacts or location. The only time it touches your files is when you pick an audio clip yourself.',
  },
  {
    heading: 'Sharing',
    body: 'When you share a result, your phone’s own share sheet handles it, and you choose where it goes. The app sends nothing on its own.',
  },
  {
    heading: 'Payment',
    body: 'The app is a one-time purchase handled by the App Store or Google Play. It contains no subscriptions or in-app purchases, and the app never sees your payment details.',
  },
  {
    heading: 'Children’s privacy',
    body: 'The app is safe for all ages. Since no data is collected, there are no concerns regarding children’s privacy.',
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
          Last updated: 21 September 2026
        </Text>

        <View style={{ paddingHorizontal: 16 }}>
          <Text style={{ color: '#e4ece7', fontSize: 17, lineHeight: 26, marginBottom: 20 }}>
            Pickleball Scorer runs entirely on your phone. This page explains exactly what that means.
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
