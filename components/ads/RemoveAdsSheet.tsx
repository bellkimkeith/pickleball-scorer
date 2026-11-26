import * as Haptics from 'expo-haptics';
import { memo, useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Platform, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MONETIZATION_CONFIG } from '../../lib/monetization/config';
import { AdFreePlan } from '../../lib/monetization/entitlement';
import { COURT } from '../../lib/theme/tokens';
import { AdFreeOption, PurchaseOutcome, useMonetizationStore } from '../../store/monetization-store';
import { CourtButton } from '../ui/Button';
import { Sheet } from '../ui/Sheet';

export interface RemoveAdsSheetProps {
  visible: boolean;
  onClose: () => void;
}

const CLOSE_AFTER_THANKS_MS = 1600;

const PURCHASE_MESSAGE: Record<PurchaseOutcome, string | null> = {
  success: 'ads.thanks',
  cancelled: null,
  pending: 'ads.pending',
  notFound: 'ads.nothingToRestore',
  unavailable: 'ads.unavailable',
  error: 'ads.error',
};

const RESTORE_MESSAGE: Record<PurchaseOutcome, string | null> = {
  ...PURCHASE_MESSAGE,
  error: 'ads.unavailable',
};

function PlanCard({
  option,
  disabled,
  onPress,
}: {
  option: AdFreeOption;
  disabled: boolean;
  onPress: (plan: AdFreePlan) => void;
}) {
  const { t } = useTranslation();
  const lifetime = option.plan === 'lifetime';
  const color = lifetime ? COURT.lineText : COURT.ink;
  const name = t(lifetime ? 'ads.lifetime' : 'ads.monthly');
  const note = t(lifetime ? 'ads.lifetimeNote' : 'ads.monthlyNote');
  const price = lifetime ? option.priceString : t('ads.perMonth', { price: option.priceString });

  return (
    <Pressable
      onPress={() => onPress(option.plan)}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${price}. ${note}`}
      accessibilityState={{ disabled }}
    >
      {/* The look sits on a View inside the Pressable, never on the Pressable:
          NativeWind drops a Pressable's function style, which left these cards
          without their fill (DESIGN.md, Buttons > Implementation). */}
      {({ pressed }) => (
        <View
          style={{
            minHeight: 64,
            borderRadius: 14,
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            opacity: disabled ? 0.45 : 1,
            transform: [{ scale: pressed && !disabled ? 0.98 : 1 }],
            ...(lifetime
              ? { backgroundColor: COURT.line }
              : { backgroundColor: COURT.deep, borderWidth: 1, borderColor: `${COURT.line}1f` }),
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color, fontSize: 18, fontWeight: '800' }}>{name}</Text>
            <Text style={{ color, fontSize: 13, fontWeight: '600', opacity: 0.75, marginTop: 2 }}>{note}</Text>
          </View>
          <Text style={{ color, fontSize: 18, fontWeight: '800', fontVariant: ['tabular-nums'] }}>{price}</Text>
        </View>
      )}
    </Pressable>
  );
}

function RemoveAdsSheetComponent({ visible, onClose }: RemoveAdsSheetProps) {
  const { t } = useTranslation();
  const offer = useMonetizationStore(state => state.offer);
  const purchasing = useMonetizationStore(state => state.purchasing);
  const loadOffer = useMonetizationStore(state => state.loadOffer);
  const purchase = useMonetizationStore(state => state.purchase);
  const restore = useMonetizationStore(state => state.restore);
  const [message, setMessage] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setMessage(null);
    setDone(false);
    loadOffer();
  }, [visible, loadOffer]);

  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(onClose, CLOSE_AFTER_THANKS_MS);
    return () => clearTimeout(timer);
  }, [done, onClose]);

  const settle = (outcome: PurchaseOutcome, messages: Record<PurchaseOutcome, string | null>) => {
    const key = messages[outcome];
    setMessage(key ? t(key) : null);
    if (outcome === 'success') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setDone(true);
    }
  };

  const busy = purchasing || done;
  const { privacyPolicyUrl, termsOfUseUrl } = MONETIZATION_CONFIG;

  return (
    <Sheet visible={visible} onClose={onClose} title={t('ads.title')}>
      <View style={{ gap: 12, paddingBottom: 6 }}>
        <Text style={{ color: COURT.inkMuted, fontSize: 15, lineHeight: 21 }}>{t('ads.subtitle')}</Text>

        {(offer.status === 'idle' || offer.status === 'loading') && (
          <ActivityIndicator color={COURT.ink} style={{ paddingVertical: 24 }} />
        )}

        {offer.status === 'unavailable' && (
          <View style={{ gap: 10, paddingVertical: 6 }}>
            <Text style={{ color: COURT.ink, fontSize: 16, lineHeight: 22 }}>{t('ads.unavailable')}</Text>
            <CourtButton title={t('ads.retry')} variant="deep" onPress={loadOffer} />
          </View>
        )}

        {offer.status === 'ready' &&
          offer.options.map(option => (
            <PlanCard
              key={option.plan}
              option={option}
              disabled={busy}
              onPress={async plan => settle(await purchase(plan), PURCHASE_MESSAGE)}
            />
          ))}

        {message && (
          <Text
            accessibilityLiveRegion="polite"
            accessibilityRole="alert"
            style={{ color: COURT.ink, fontSize: 15, lineHeight: 21, textAlign: 'center' }}
          >
            {message}
          </Text>
        )}

        <CourtButton
          title={t('ads.restore')}
          variant="outline"
          height={44}
          disabled={busy}
          onPress={async () => settle(await restore(), RESTORE_MESSAGE)}
        />

        <Text style={{ color: COURT.inkMuted, fontSize: 12, lineHeight: 17, textAlign: 'center' }}>
          {t(Platform.OS === 'ios' ? 'ads.legalIos' : 'ads.legalAndroid')}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 18 }}>
          <Text
            accessibilityRole="link"
            onPress={() => Linking.openURL(termsOfUseUrl).catch(() => {})}
            style={{ color: COURT.ink, fontSize: 13, textDecorationLine: 'underline', paddingVertical: 6 }}
          >
            {t('ads.terms')}
          </Text>
          {privacyPolicyUrl !== '' && (
            <Text
              accessibilityRole="link"
              onPress={() => Linking.openURL(privacyPolicyUrl).catch(() => {})}
              style={{ color: COURT.ink, fontSize: 13, textDecorationLine: 'underline', paddingVertical: 6 }}
            >
              {t('ads.privacy')}
            </Text>
          )}
        </View>
      </View>
    </Sheet>
  );
}

export const RemoveAdsSheet = memo(RemoveAdsSheetComponent);
