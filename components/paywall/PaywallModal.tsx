import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Modal } from '../common/Modal';
import { PricingCard } from './PricingCard';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useTranslation } from 'react-i18next';
import { useSubscriptionStore } from '../../store/subscription-store';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
}

export function PaywallModal({ visible, onClose }: PaywallModalProps) {
  const { isDarkMode } = useDarkMode();
  const { t } = useTranslation();
  const { 
    isPro, 
    isLoading, 
    purchaseMonthly, 
    purchaseAnnual, 
    purchaseLifetime,
    restorePurchases 
  } = useSubscriptionStore();

  const handlePurchaseMonthly = useCallback(async () => {
    const success = await purchaseMonthly();
    if (success) {
      Alert.alert('Success', 'You now have Pro access!');
      onClose();
    }
  }, [purchaseMonthly, onClose]);

  const handlePurchaseAnnual = useCallback(async () => {
    const success = await purchaseAnnual();
    if (success) {
      Alert.alert('Success', 'You now have Pro access!');
      onClose();
    }
  }, [purchaseAnnual, onClose]);

  const handlePurchaseLifetime = useCallback(async () => {
    const success = await purchaseLifetime();
    if (success) {
      Alert.alert('Success', 'You now have Pro access!');
      onClose();
    }
  }, [purchaseLifetime, onClose]);

  const handleRestore = useCallback(async () => {
    const restored = await restorePurchases();
    if (restored) {
      Alert.alert('Success', 'Purchases restored!');
      onClose();
    } else {
      Alert.alert('No Purchases Found', 'We couldn\'t find any previous purchases.');
    }
  }, [restorePurchases, onClose]);

  if (isPro) {
    return null;
  }

  return (
    <Modal visible={visible} onClose={onClose} dismissable>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="star" size={32} color="#f59e0b" />
            <Text style={[styles.title, isDarkMode ? styles.titleDark : styles.titleLight]}>
              {t('paywall.title', 'Unlock All Features')}
            </Text>
          </View>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={isDarkMode ? '#f3f4f6' : '#1f2937'} />
          </Pressable>
        </View>

        <Text style={[styles.subtitle, isDarkMode ? styles.subtitleDark : styles.subtitleLight]}>
          {t('paywall.subtitle', 'Get the ultimate pickleball experience')}
        </Text>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Annual Plan - Best Value */}
          <PricingCard
            type="annual"
            price="$17.99/yr"
            pricePerMonth="~$1.50"
            features={[
              '30+ Premium Sounds',
              'Unlimited Stats & Insights',
              'Premium Share Cards',
              'Custom Sound Uploads',
            ]}
            isBestValue={true}
            onSelect={handlePurchaseAnnual}
            isLoading={isLoading}
          />

          {/* Monthly Plan */}
          <PricingCard
            type="monthly"
            price="$2.99/mo"
            features={[
              '7-day Free Trial',
              '30+ Premium Sounds',
              'Unlimited Stats & Insights',
              'Premium Share Cards',
            ]}
            isBestValue={false}
            onSelect={handlePurchaseMonthly}
            isLoading={isLoading}
          />

          {/* Lifetime Plan */}
          <PricingCard
            type="lifetime"
            price="$34.99"
            features={[
              'One-time Purchase',
              'All Pro Features',
              'Future Updates Included',
              'No Subscription Needed',
            ]}
            isBestValue={false}
            onSelect={handlePurchaseLifetime}
            isLoading={isLoading}
          />

          {/* Restore Purchases */}
          <Pressable onPress={handleRestore} style={styles.restoreButton}>
            <Text style={[styles.restoreText, isDarkMode ? styles.restoreTextDark : styles.restoreTextLight]}>
              {t('paywall.restore', 'Restore Purchases')}
            </Text>
          </Pressable>

          {/* Legal */}
          <Text style={[styles.legalText, isDarkMode ? styles.legalTextDark : styles.legalTextLight]}>
            Subscriptions auto-renew. Cancel anytime in Settings. 
            By subscribing, you agree to our Terms of Service.
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  titleLight: {
    color: '#1f2937',
  },
  titleDark: {
    color: '#f3f4f6',
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 24,
  },
  subtitleLight: {
    color: '#6b7280',
  },
  subtitleDark: {
    color: '#9ca3af',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  restoreButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  restoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  restoreTextLight: {
    color: '#16a34a',
  },
  restoreTextDark: {
    color: '#22c55e',
  },
  legalText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 16,
  },
  legalTextLight: {
    color: '#9ca3af',
  },
  legalTextDark: {
    color: '#6b7280',
  },
});
