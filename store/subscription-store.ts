import { create } from 'zustand';
import Purchases, { 
  CustomerInfo,
  LOG_LEVEL,
  PurchasesOfferings,
  PurchasesPackage,
  PACKAGE_TYPE,
} from 'react-native-purchases';
import * as Haptics from 'expo-haptics';

const ENTITLEMENT_ID = 'pro';
const API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || 'your_api_key_here';

export type SubscriptionType = 'monthly' | 'annual' | 'lifetime' | null;

interface SubscriptionStore {
  isPro: boolean;
  subscriptionType: SubscriptionType;
  isLoading: boolean;
  customerInfo: CustomerInfo | null;
  offerings: PurchasesOfferings | null;
  
  initialize: () => Promise<void>;
  checkSubscription: () => Promise<void>;
  purchaseMonthly: () => Promise<boolean>;
  purchaseAnnual: () => Promise<boolean>;
  purchaseLifetime: () => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
}

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
  isPro: false,
  subscriptionType: null,
  isLoading: false,
  customerInfo: null,
  offerings: null,

  initialize: async () => {
    try {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      await Purchases.configure({ apiKey: API_KEY });
      
      Purchases.addCustomerInfoUpdateListener((info) => {
        const hasPro = info.entitlements.active[ENTITLEMENT_ID] !== undefined;
        let subType: SubscriptionType = null;
        
        if (hasPro) {
          const proEntitlement = info.entitlements.active[ENTITLEMENT_ID];
          if (proEntitlement) {
            const productId = proEntitlement.productIdentifier;
            if (productId.includes('lifetime')) {
              subType = 'lifetime';
            } else if (productId.includes('annual') || productId.includes('year')) {
              subType = 'annual';
            } else {
              subType = 'monthly';
            }
          }
        }
        
        set({ 
          isPro: hasPro, 
          subscriptionType: subType,
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
      const hasPro = info.entitlements.active[ENTITLEMENT_ID] !== undefined;
      
      let subType: SubscriptionType = null;
      if (hasPro) {
        const proEntitlement = info.entitlements.active[ENTITLEMENT_ID];
        if (proEntitlement) {
          const productId = proEntitlement.productIdentifier;
          if (productId.includes('lifetime')) {
            subType = 'lifetime';
          } else if (productId.includes('annual') || productId.includes('year')) {
            subType = 'annual';
          } else {
            subType = 'monthly';
          }
        }
      }
      
      set({ 
        isPro: hasPro, 
        subscriptionType: subType,
        customerInfo: info,
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to check subscription:', error);
      set({ isLoading: false });
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
      set({ isLoading: false });
      return true;
    } catch (error: unknown) {
      const purchaseError = error as { code?: string };
      if (purchaseError.code !== 'PURCHASE_CANCELLED') {
        console.error('Purchase failed:', error);
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
      set({ isLoading: false });
      return true;
    } catch (error: unknown) {
      const purchaseError = error as { code?: string };
      if (purchaseError.code !== 'PURCHASE_CANCELLED') {
        console.error('Purchase failed:', error);
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
        p => p.packageType === PACKAGE_TYPE.LIFETIME
      );
      
      if (!lifetimePackage) {
        set({ isLoading: false });
        return false;
      }
      
      await Purchases.purchasePackage(lifetimePackage);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      set({ isLoading: false });
      return true;
    } catch (error: unknown) {
      const purchaseError = error as { code?: string };
      if (purchaseError.code !== 'PURCHASE_CANCELLED') {
        console.error('Purchase failed:', error);
      }
      set({ isLoading: false });
      return false;
    }
  },

  restorePurchases: async () => {
    set({ isLoading: true });
    try {
      const info = await Purchases.restorePurchases();
      const hasPro = info.entitlements.active[ENTITLEMENT_ID] !== undefined;
      
      if (hasPro) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      set({ isPro: hasPro, isLoading: false });
      return hasPro;
    } catch (error) {
      console.error('Restore failed:', error);
      set({ isLoading: false });
      return false;
    }
  },
}));
