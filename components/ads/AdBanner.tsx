import { useFocusEffect } from 'expo-router';
import { memo, useCallback, useEffect, useState } from 'react';
import { AppState, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { bannerUnitId } from '../../lib/ads/ads';
import { BannerLoad, nextBannerLoad, shouldShowBanner } from '../../lib/ads/visibility';
import { COURT } from '../../lib/theme/tokens';
import { useMonetizationStore } from '../../store/monetization-store';

export interface AdBannerProps {
  /**
   * `anchored`: pinned under a screen's scroll area, below everything you tap.
   * `inline`: inside scrolling content, between things you only read.
   */
  placement: 'anchored' | 'inline';
}

/**
 * Banners live only on calm screens (home, stats, settings, session summary),
 * never courtside. Draws nothing until an ad has actually loaded, and nothing
 * at all if loading fails, so there is never an empty box.
 */
function AdBannerComponent({ placement }: AdBannerProps) {
  const hydrated = useMonetizationStore(state => state.hydrated);
  const adFree = useMonetizationStore(state => state.adFree);
  const adsReady = useMonetizationStore(state => state.adsReady);
  const [load, setLoad] = useState<BannerLoad>('loading');
  const unitId = bannerUnitId();

  // A banner that never loaded (offline, no fill) tries again when its screen
  // comes back into view or the app returns to the foreground. Home stays
  // mounted under every other screen, so focus is what brings its ad back.
  const retry = useCallback(() => setLoad(current => nextBannerLoad(current, 'retry')), []);
  useFocusEffect(retry);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') retry();
    });
    return () => subscription.remove();
  }, [retry]);

  if (!shouldShowBanner({ hydrated, adFree, adsReady, unitId }) || load === 'failed') return null;

  const anchored = placement === 'anchored';
  const loaded = load === 'loaded';

  return (
    <View
      style={
        loaded
          ? {
              alignItems: 'center',
              ...(anchored
                ? { borderTopWidth: 1, borderTopColor: `${COURT.line}14`, paddingTop: 8 }
                : { marginVertical: 18 }),
            }
          : // Collapsed while loading: the ad needs to be mounted to load, but must not hold space.
            { height: 0, overflow: 'hidden', alignItems: 'center' }
      }
    >
      <BannerAd
        unitId={unitId}
        // Inline stays a small fixed 320x50 banner: an inline *adaptive* one grows
        // to a quarter of the screen, which is not the small ad this app promises.
        size={anchored ? BannerAdSize.ANCHORED_ADAPTIVE_BANNER : BannerAdSize.BANNER}
        onAdLoaded={() => setLoad(current => nextBannerLoad(current, 'loaded'))}
        onAdFailedToLoad={() => setLoad(current => nextBannerLoad(current, 'failed'))}
      />
    </View>
  );
}

export const AdBanner = memo(AdBannerComponent);
