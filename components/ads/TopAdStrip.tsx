import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { memo, useCallback, useEffect, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { bannerUnitId } from '../../lib/ads/ads';
import { BannerLoad, PROMO_MS, nextBannerLoad, shouldShowStrip, stripView } from '../../lib/ads/visibility';
import { COURT } from '../../lib/theme/tokens';
import { useMonetizationStore } from '../../store/monetization-store';
import { RemoveAdsSheet } from './RemoveAdsSheet';

/** A standard 320x50 banner with 4pt above and below: the offer and the ad share exactly this slot. */
const SLOT_HEIGHT = 58;
const SWAP_MS = 240;

/**
 * The one ad surface in the app: a fixed strip at the very top of a calm
 * screen (home, stats, settings, session summary), above everything you tap
 * and never over it. It opens with our own "Go ad-free" offer and hands the
 * same slot to a banner once the offer has had its turn and an ad has loaded.
 * The slot never changes height and is never empty, so nothing below it moves.
 *
 * Replaces the screen's top safe-area edge: render it first inside a
 * SafeAreaView whose edges are ['bottom']. When there is no strip it leaves
 * exactly the status-bar inset behind.
 */
function TopAdStripComponent() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const hydrated = useMonetizationStore(state => state.hydrated);
  const adFree = useMonetizationStore(state => state.adFree);
  const adsBlocked = useMonetizationStore(state => state.adsBlocked);
  const adsReady = useMonetizationStore(state => state.adsReady);
  const unitId = bannerUnitId();
  const visible = shouldShowStrip({ hydrated, adFree, adsBlocked, unitId });

  const [promoOver, setPromoOver] = useState(false);
  const [load, setLoad] = useState<BannerLoad>('loading');
  const [sheetOpen, setSheetOpen] = useState(false);
  const { mountAd, showAd } = stripView({ promoOver, adsReady, load });

  // The offer's turn: once each time this screen opens (once per launch on home,
  // which stays mounted under everything else). A strip that disappears, because
  // someone went ad-free, starts over from the offer if it ever comes back.
  useEffect(() => {
    if (!visible) {
      setPromoOver(false);
      setLoad('loading');
      return;
    }
    if (promoOver) return;
    const timer = setTimeout(() => setPromoOver(true), PROMO_MS);
    return () => clearTimeout(timer);
  }, [visible, promoOver]);

  // An ad that failed (offline, no fill) leaves the offer up and tries again when
  // the screen comes back into view or the app returns to the foreground.
  const retry = useCallback(() => setLoad(current => nextBannerLoad(current, 'retry')), []);
  useFocusEffect(retry);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') retry();
    });
    return () => subscription.remove();
  }, [retry]);

  const adShown = useSharedValue(0);
  useEffect(() => {
    adShown.value = reduceMotion
      ? (showAd ? 1 : 0)
      : withTiming(showAd ? 1 : 0, { duration: SWAP_MS, easing: Easing.out(Easing.exp) });
  }, [showAd, reduceMotion, adShown]);
  const adStyle = useAnimatedStyle(() => ({ opacity: adShown.value }));
  const offerStyle = useAnimatedStyle(() => ({ opacity: 1 - adShown.value }));

  const openOffer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSheetOpen(true);
  };

  return (
    <>
      {visible ? (
        <View style={[styles.strip, { paddingTop: insets.top }]}>
          <View style={styles.slot}>
            {mountAd && (
              <Animated.View style={[StyleSheet.absoluteFill, styles.center, adStyle]}>
                <BannerAd
                  unitId={unitId}
                  size={BannerAdSize.BANNER}
                  onAdLoaded={() => setLoad(current => nextBannerLoad(current, 'loaded'))}
                  onAdFailedToLoad={() => setLoad(current => nextBannerLoad(current, 'failed'))}
                />
              </Animated.View>
            )}
            <Animated.View
              style={[StyleSheet.absoluteFill, offerStyle]}
              pointerEvents={showAd ? 'none' : 'auto'}
              accessibilityElementsHidden={showAd}
              importantForAccessibility={showAd ? 'no-hide-descendants' : 'auto'}
            >
              <Pressable
                onPress={openOffer}
                accessibilityRole="button"
                accessibilityLabel={t('ads.stripOffer')}
                accessibilityHint={t('ads.stripHint')}
                style={styles.fill}
              >
                {({ pressed }) => (
                  <View style={[styles.offer, pressed && styles.pressed]}>
                    <View style={styles.badge}>
                      <Ionicons name="ban" size={18} color={COURT.lineText} />
                    </View>
                    <Text style={styles.offerText} numberOfLines={1} maxFontSizeMultiplier={1.3}>
                      {t('ads.stripOffer')}
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color={COURT.ink} />
                  </View>
                )}
              </Pressable>
            </Animated.View>
          </View>
        </View>
      ) : (
        <View style={{ height: insets.top }} />
      )}
      {/* Outside the strip: a purchase removes the strip, and the sheet must
          stay up long enough to say thank you. */}
      <RemoveAdsSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  strip: {
    backgroundColor: COURT.outerDeep,
    borderBottomWidth: 1,
    borderBottomColor: `${COURT.line}14`,
  },
  slot: { height: SLOT_HEIGHT },
  center: { alignItems: 'center', justifyContent: 'center' },
  fill: { flex: 1 },
  offer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  pressed: { opacity: 0.7 },
  badge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COURT.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerText: { flex: 1, color: COURT.ink, fontSize: 16, fontWeight: '700' },
});

export const TopAdStrip = memo(TopAdStripComponent);
