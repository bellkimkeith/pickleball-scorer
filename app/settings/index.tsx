import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Linking, Platform, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopAdStrip } from '../../components/ads/TopAdStrip';
import { RemoveAdsSheet } from '../../components/ads/RemoveAdsSheet';
import { Dialog } from '../../components/ui/Dialog';
import { Segmented, Stepper, Toggle } from '../../components/ui/Controls';
import { BackButton } from '../../components/ui/BackButton';
import { ListGroup, ListRow } from '../../components/ui/ListGroup';
import { Sheet } from '../../components/ui/Sheet';
import { CourtButton } from '../../components/ui/Button';
import { changeLanguage } from '../../i18n';
import { openAdPrivacyChoices } from '../../lib/ads/ads';
import { MAX_COURTS } from '../../lib/queue/engine';
import { COURT } from '../../lib/theme/tokens';
import { Language } from '../../lib/types/game';
import { useGameStore } from '../../store/game-store';
import { useMonetizationStore } from '../../store/monetization-store';
import { useSessionStore } from '../../store/session-store';

const LANGUAGES: Language[] = ['en', 'es', 'fr', 'de'];

const STORE_SUBSCRIPTIONS_URL = Platform.select({
  ios: 'https://apps.apple.com/account/subscriptions',
  default: 'https://play.google.com/store/account/subscriptions',
});

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const settings = useGameStore(state => state.settings);
  const updateSettings = useGameStore(state => state.updateSettings);
  const defaultCourtCount = useSessionStore(state => state.defaultCourtCount);
  const askForScores = useSessionStore(state => state.askForScores);
  const [languageOpen, setLanguageOpen] = useState(false);
  const adFree = useMonetizationStore(state => state.adFree);
  const plan = useMonetizationStore(state => state.plan);
  const managementUrl = useMonetizationStore(state => state.managementUrl);
  const privacyOptionsRequired = useMonetizationStore(state => state.privacyOptionsRequired);
  const restore = useMonetizationStore(state => state.restore);
  const [removeAdsOpen, setRemoveAdsOpen] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);

  const restorePurchases = async () => {
    const outcome = await restore();
    if (outcome === 'notFound') setRestoreMessage(t('ads.nothingToRestore'));
    else if (outcome === 'unavailable' || outcome === 'error') setRestoreMessage(t('ads.unavailable'));
    else if (outcome === 'pending') setRestoreMessage(t('ads.pending'));
    // success needs no message: this group turns into "Ad-free" on its own.
  };

  const setDefaultCourts = (count: number) => useSessionStore.setState({ defaultCourtCount: count });

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <TopAdStrip />
      <StatusBar style="light" />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <BackButton />

        <Text style={{ color: COURT.ink, fontSize: 34, fontWeight: '700', paddingHorizontal: 16, paddingTop: 4, paddingBottom: 18 }}>
          {t('settings.title')}
        </Text>

        <ListGroup header={t('settings.scoring')} style={{ marginHorizontal: 12 }}>
          <ListRow
            label={t('settings.scoringType')}
            stacked
            right={
              <Segmented
                options={[
                  { value: 'sideout', label: t('game.sideout') },
                  { value: 'rally', label: t('game.rally') },
                ]}
                value={settings.gameType}
                onChange={value => updateSettings({ gameType: value })}
                accessibilityLabel={t('settings.scoringType')}
              />
            }
          />
          <ListRow
            label={t('settings.winningScore')}
            stacked
            right={
              <Segmented
                options={[
                  { value: '11', label: '11' },
                  { value: '15', label: '15' },
                  { value: '21', label: '21' },
                ]}
                value={String(settings.winningScore)}
                onChange={value => updateSettings({ winningScore: Number(value) as 11 | 15 | 21 })}
                accessibilityLabel={t('settings.winningScore')}
              />
            }
          />
          <ListRow
            label={t('settings.winByTwo')}
            right={
              <Toggle
                value={settings.winByTwo}
                onChange={value => updateSettings({ winByTwo: value })}
                accessibilityLabel={t('settings.winByTwo')}
              />
            }
          />
          <ListRow
            label={t('settings.sideChangeAt')}
            right={
              <Stepper
                value={settings.sideChangeAt}
                min={0}
                max={settings.winningScore}
                onChange={value => updateSettings({ sideChangeAt: value })}
                accessibilityLabel={t('settings.sideChangeAt')}
              />
            }
          />
          <ListRow
            label={t('settings.swapScores')}
            right={
              <Toggle
                value={settings.swapScoresOnSideChange}
                onChange={value => updateSettings({ swapScoresOnSideChange: value })}
                accessibilityLabel={t('settings.swapScores')}
              />
            }
          />
        </ListGroup>

        <ListGroup header={t('openPlay.title')} style={{ marginHorizontal: 12, marginTop: 20 }}>
          <ListRow
            label={t('settings.defaultCourts')}
            right={
              <Stepper
                value={defaultCourtCount}
                min={1}
                max={MAX_COURTS}
                onChange={setDefaultCourts}
                accessibilityLabel={t('settings.defaultCourts')}
              />
            }
          />
          <ListRow
            label={t('standings.askForScores')}
            right={
              <Toggle
                value={askForScores}
                onChange={value => useSessionStore.setState({ askForScores: value })}
                accessibilityLabel={t('standings.askForScores')}
              />
            }
          />
          <ListRow label={t('openPlay.lateArrivals')} value={t('openPlay.lateArrivalsValue')} />
        </ListGroup>

        <ListGroup header={t('settings.sounds')} style={{ marginHorizontal: 12, marginTop: 20 }}>
          <ListRow
            label={t('settings.autoSounds')}
            right={
              <Toggle
                value={settings.autoSoundsEnabled ?? false}
                onChange={value => updateSettings({ autoSoundsEnabled: value })}
                accessibilityLabel={t('settings.autoSounds')}
              />
            }
          />
          <ListRow
            label={t('settings.autoSoundsSideOut')}
            right={
              <Toggle
                value={settings.autoSoundsOnSideOut ?? false}
                onChange={value => updateSettings({ autoSoundsOnSideOut: value })}
                accessibilityLabel={t('settings.autoSoundsSideOut')}
              />
            }
          />
        </ListGroup>

        <ListGroup header={t('ads.group')} style={{ marginHorizontal: 12, marginTop: 20 }}>
          {adFree ? (
            <ListRow
              label={t('ads.adFree')}
              value={t(plan === 'monthly' ? 'ads.planMonthly' : 'ads.planLifetime')}
            />
          ) : (
            <ListRow label={t('ads.removeAds')} chevron onPress={() => setRemoveAdsOpen(true)} />
          )}
          {adFree && plan === 'monthly' && (
            <ListRow
              label={t('ads.manage')}
              chevron
              onPress={() => Linking.openURL(managementUrl ?? STORE_SUBSCRIPTIONS_URL).catch(() => {})}
            />
          )}
          {!adFree && <ListRow label={t('ads.restore')} chevron onPress={restorePurchases} />}
          {privacyOptionsRequired && (
            <ListRow label={t('ads.privacyChoices')} chevron onPress={openAdPrivacyChoices} />
          )}
        </ListGroup>

        <ListGroup header={t('settings.app')} style={{ marginHorizontal: 12, marginTop: 20 }}>
          <ListRow
            label={t('settings.language')}
            value={t(`languages.${settings.language ?? 'en'}`)}
            chevron
            onPress={() => setLanguageOpen(true)}
          />
          <ListRow label={t('settings.rules')} chevron onPress={() => router.push('/settings/rules')} />
          <ListRow label={t('settings.privacyPolicy')} chevron onPress={() => router.push('/settings/privacy')} />
        </ListGroup>
      </ScrollView>

      <RemoveAdsSheet visible={removeAdsOpen} onClose={() => setRemoveAdsOpen(false)} />

      <Dialog
        visible={restoreMessage !== null}
        title={t('ads.restore')}
        message={restoreMessage ?? undefined}
        confirmLabel={t('common.done')}
        onConfirm={() => setRestoreMessage(null)}
      />

      <Sheet visible={languageOpen} onClose={() => setLanguageOpen(false)} title={t('settings.language')}>
        <View style={{ gap: 8, paddingBottom: 10 }}>
          {LANGUAGES.map(language => (
            <CourtButton
              key={language}
              title={t(`languages.${language}`)}
              variant={settings.language === language ? 'line' : 'deep'}
              onPress={() => {
                updateSettings({ language });
                changeLanguage(language);
                setLanguageOpen(false);
              }}
            />
          ))}
        </View>
      </Sheet>
    </SafeAreaView>
  );
}
