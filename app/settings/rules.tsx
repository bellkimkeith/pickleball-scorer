import { StatusBar } from 'expo-status-bar';
import { ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScoreCall } from '../../components/scoring/ScoreCall';
import { BackButton } from '../../components/ui/BackButton';
import { COURT } from '../../lib/theme/tokens';

export default function RulesScreen() {
  const { t } = useTranslation();

  const paragraph = (bold: string, rest: string) => (
    <Text style={{ color: '#e4ece7', fontSize: 17, lineHeight: 26, marginBottom: 16 }}>
      <Text style={{ fontWeight: '700', color: COURT.ink }}>{bold} </Text>
      {rest}
    </Text>
  );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <StatusBar style="light" />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <BackButton />

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
