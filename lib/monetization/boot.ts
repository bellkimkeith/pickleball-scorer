import { useMonetizationStore } from '../../store/monetization-store';
import { startAds } from '../ads/ads';

let booted = false;
let adsStarting = false;

function whenHydrated(): Promise<void> {
  if (useMonetizationStore.getState().hydrated) return Promise.resolve();
  return new Promise(resolve => {
    const unsubscribe = useMonetizationStore.subscribe(state => {
      if (state.hydrated) {
        unsubscribe();
        resolve();
      }
    });
  });
}

async function startAdsIfShown(): Promise<void> {
  if (useMonetizationStore.getState().adFree || adsStarting) return;
  adsStarting = true;
  const result = await startAds();
  useMonetizationStore.setState({
    adsReady: result.canRequestAds,
    privacyOptionsRequired: result.privacyOptionsRequired,
  });
}

/**
 * Called once at launch. Waits for the remembered ad-free status so a paying
 * user never sees an ad flash, then checks with RevenueCat in the background
 * and starts ads only for people who see them.
 */
export async function bootMonetization(): Promise<void> {
  if (booted) return;
  booted = true;

  await whenHydrated();
  const store = useMonetizationStore.getState();
  if (store.configurePurchases()) {
    // Not awaited: offline this can take a while, and the remembered status already decides.
    void store.refresh();
  }

  // A monthly plan that lapses or is refunded brings ads back without a restart.
  useMonetizationStore.subscribe((state, previous) => {
    if (previous.adFree && !state.adFree) void startAdsIfShown();
  });

  await startAdsIfShown();
}
