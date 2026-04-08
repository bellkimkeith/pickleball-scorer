import { create } from 'zustand';
import Purchases, { 
  CustomerInfo,
  LOG_LEVEL,
  PurchasesOfferings,
  PurchasesPackage,
  PACKAGE_TYPE,
} from 'react-native-purchases';
import * as Haptics from 'expo-haptics';

const API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || 'your_api_key_here';

const ENTITLEMENTS = {
  weekly: 'pro_weekly',
  monthly: 'pro_monthly',
  annual: 'pro_annual',
  lifetime: 'pro_lifetime',
};

export type SubscriptionTier = 'weekly' | 'monthly' | 'annual' | 'lifetime' | null;

interface SubscriptionState {
  isPro: boolean;
  subscriptionTier: SubscriptionTier;
  isLoading: boolean;
  customerInfo: CustomerInfo | null;
  offerings: PurchasesOfferings | null;
  
  initialize: () => Promise<void>;
  checkSubscription: () => Promise<void>;
  purchaseWeekly: () => Promise<boolean>;
  purchaseMonthly: () => Promise<boolean>;
  purchaseAnnual: () => Promise<boolean>;
  purchaseLifetime: () => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
}

const getTierFromProductId = (productId: string): SubscriptionTier => {
  const id = productId.toLowerCase();
  if (id.includes('lifetime')) {
    return 'lifetime';
  }
  if (id.includes('annual') || id.includes('year') || id.includes('yr')) {
    return 'annual';
  }
  if (id.includes('monthly') || id.includes('month')) {
    return 'monthly';
  }
  if (id.includes('weekly') || id.includes('week')) {
    return 'weekly';
  }
  return 'monthly';
};

const checkEntitlement = (customerInfo: CustomerInfo): { isPro: boolean; tier: SubscriptionTier } => {
  for (const [tier, entitlementId] of Object.entries(ENTITLEMENTS)) {
    if (customerInfo.entitlements.active[entitlementId]) {
      const productId = customerInfo.entitlements.active[entitlementId]?.productIdentifier;
      return { 
        isPro: true, 
        tier: getTierFromProductId(productId || '') 
      };
    }
  }
  return { isPro: false, tier: null };
};

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  isPro: false,
  subscriptionTier: null,
  isLoading: false,
  customerInfo: null,
  offerings: null,

  initialize: async () => {
    try {
      Purchases.setLogLevel(LOG_LEVEL.INFO);
      await Purchases.configure({ 
        apiKey: API_KEY,
        appUserID: undefined,
      });
      
      Purchases.addCustomerInfoUpdateListener((info) => {
        const { isPro, tier } = checkEntitlement(info);
        set({ 
          isPro, 
          subscriptionTier: tier,
          customerInfo: info 
        });
      });
      
      await get().checkSubscription();
    } catch (error) {
      console.error('Failed to initialize purchases:', error);
    }
  },

  checkSubscription: async () => {
    set({ isLoading: true });
    try {
      const info = await Purchases.getCustomerInfo();
      const { isPro, tier } = checkEntitlement(info);
      
      set({ 
        isPro, 
        subscriptionTier: tier,
        customerInfo: info,
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to check subscription:', error);
      set({ isLoading: false });
    }
  },

  purchaseWeekly: async () => {
    set({ isLoading: true });
    try {
      const offerings = await Purchases.getOfferings();
      const weeklyPackage = offerings.current?.availablePackages.find(
        p => p.packageType === PACKAGE_TYPE.WEEKLY
      );
      
      if (!weeklyPackage) {
        console.log('Weekly package not found, trying CUSTOM type');
        const customPackage = offerings.current?.availablePackages.find(
          p => p.packageType === PACKAGE_TYPE.CUSTOM || 
               p.packageType.toString().toLowerCase().includes('week')
        );
        if (!customPackage) {
          set({ isLoading: false });
          return false;
        }
        await Purchases.purchasePackage(customPackage);
      } else {
        await Purchases.purchasePackage(weeklyPackage);
      }
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      const info = await Purchases.getCustomerInfo();
      const { isPro, tier } = checkEntitlement(info);
      set({ isPro, subscriptionTier: tier, isLoading: false });
      return true;
    } catch (error: unknown) {
      const purchaseError = error as { code?: string };
      if (purchaseError.code !== 'PURCHASE_CANCELLED') {
        console.error('Weekly purchase failed:', error);
      }
      set({ isLoading: false });
      return false;
    }
  },

  purchaseMonthly: async () => {
    set({ isLoading: true });
    try {
      const offerings = await Purchases.getOfferings();
      const monthlyPackage = offerings.current?.availablePackages.find(
        p => p.packageType === PACKAGE_TYPE.MONTHLY
      );
      
      if (!monthlyPackage) {
        set({ isLoading: false });
        return false;
      }
      
      await Purchases.purchasePackage(monthlyPackage);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      const info = await Purchases.getCustomerInfo();
      const { isPro, tier } = checkEntitlement(info);
      set({ isPro, subscriptionTier: tier, isLoading: false });
      return true;
    } catch (error: unknown) {
      const purchaseError = error as { code?: string };
      if (purchaseError.code !== 'PURCHASE_CANCELLED') {
        console.error('Monthly purchase failed:', error);
      }
      set({ isLoading: false });
      return false;
    }
  },

  purchaseAnnual: async () => {
    set({ isLoading: true });
    try {
      const offerings = await Purchases.getOfferings();
      const annualPackage = offerings.current?.availablePackages.find(
        p => p.packageType === PACKAGE_TYPE.ANNUAL
      );
      
      if (!annualPackage) {
        set({ isLoading: false });
        return false;
      }
      
      await Purchases.purchasePackage(annualPackage);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      const info = await Purchases.getCustomerInfo();
      const { isPro, tier } = checkEntitlement(info);
      set({ isPro, subscriptionTier: tier, isLoading: false });
      return true;
    } catch (error: unknown) {
      const purchaseError = error as { code?: string };
      if (purchaseError.code !== 'PURCHASE_CANCELLED') {
        console.error('Annual purchase failed:', error);
      }
      set({ isLoading: false });
      return false;
    }
  },

  purchaseLifetime: async () => {
    set({ isLoading: true });
    try {
      const offerings = await Purchases.getOfferings();
      const lifetimePackage = offerings.current?.availablePackages.find(
        (p) => {
          const productId = p.packageType.toString().toLowerCase();
          return p.packageType === PACKAGE_TYPE.CUSTOM || 
                 productId.includes('lifetime');
        }
      );
      
      if (!lifetimePackage) {
        set({ isLoading: false });
        return false;
      }
      
      await Purchases.purchasePackage(lifetimePackage);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      const info = await Purchases.getCustomerInfo();
      const { isPro, tier } = checkEntitlement(info);
      set({ isPro, subscriptionTier: tier, isLoading: false });
      return true;
    } catch (error: unknown) {
      const purchaseError = error as { code?: string };
      if (purchaseError.code !== 'PURCHASE_CANCELLED') {
        console.error('Lifetime purchase failed:', error);
      }
      set({ isLoading: false });
      return false;
    }
  },

  restorePurchases: async () => {
    set({ isLoading: true });
    try {
      const info = await Purchases.restorePurchases();
      const { isPro, tier } = checkEntitlement(info);
      
      if (isPro) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      set({ isPro, subscriptionTier: tier, isLoading: false });
      return isPro;
    } catch (error) {
      console.error('Restore failed:', error);
      set({ isLoading: false });
      return false;
    }
  },
}));
