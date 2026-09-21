import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScoreCall } from '../../components/scoring/ScoreCall';
import { COURT } from '../../lib/theme/tokens';

export default function RulesScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const paragraph = (bold: string, rest: string) => (
    <Text style={{ color: '#e4ece7', fontSize: 17, lineHeight: 26, marginBottom: 16 }}>
      <Text style={{ fontWeight: '700', color: COURT.ink }}>{bold} </Text>
      {rest}
    </Text>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COURT.outer }} edges={['top']}>
      <StatusBar style="light" />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          hitSlop={10}
          style={{ paddingHorizontal: 16, paddingTop: 6, alignSelf: 'flex-start' }}
        >
          <Text style={{ color: COURT.ink, fontSize: 17 }}>‹ {t('common.back')}</Text>
        </Pressable>

        <Text style={{ color: COURT.ink, fontSize: 34, fontWeight: '700', paddingHorizontal: 16, paddingTop: 4, paddingBottom: 18 }}>
          {t('settings.rules')}
        </Text>

        <View style={{ paddingHorizontal: 16 }}>
          {paragraph(t('rules.servingOnlyTitle'), t('rules.servingOnlyBody'))}

          <View
            style={{
              backgroundColor: `${COURT.line}0f`,
              borderRadius: 14,
              paddingVertical: 18,
              marginBottom: 20,
            }}
          >
            <ScoreCall serving={7} receiving={4} serverNumber={2} caption={t('rules.callExplained')} />
          </View>

          {paragraph(t('rules.bothServeTitle'), t('rules.bothServeBody'))}
          {paragraph(t('rules.sidesTitle'), t('rules.sidesBody'))}
          {paragraph(t('rules.rallyTitle'), t('rules.rallyBody'))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
