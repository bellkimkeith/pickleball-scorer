import { StatusBar } from 'expo-status-bar';
import { Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../../components/ui/BackButton';
import { privacySections } from '../../lib/privacy/sections';
import { COURT } from '../../lib/theme/tokens';

const SECTIONS = privacySections(Platform.OS === 'ios' ? 'ios' : 'android');

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
