import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Modal } from '../common/Modal';
import { PricingCard } from './PricingCard';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useSubscriptionStore } from '../../store/subscription-store';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
}

export function PaywallModal({ visible, onClose }: PaywallModalProps) {
  const { isDarkMode } = useDarkMode();
  const { 
    isPro, 
    isLoading, 
    purchaseWeekly,
    purchaseMonthly, 
    purchaseAnnual,
    purchaseLifetime,
    restorePurchases 
  } = useSubscriptionStore();

  const handlePurchaseWeekly = useCallback(async () => {
    const success = await purchaseWeekly();
    if (success) {
      Alert.alert('🎉 Success!', 'You now have Pro access!');
      onClose();
    }
  }, [purchaseWeekly, onClose]);

  const handlePurchaseMonthly = useCallback(async () => {
    const success = await purchaseMonthly();
    if (success) {
      Alert.alert('🎉 Success!', 'You now have Pro access!');
      onClose();
    }
  }, [purchaseMonthly, onClose]);

  const handlePurchaseAnnual = useCallback(async () => {
    const success = await purchaseAnnual();
    if (success) {
      Alert.alert('🎉 Success!', 'You now have Pro access!');
      onClose();
    }
  }, [purchaseAnnual, onClose]);

  const handlePurchaseLifetime = useCallback(async () => {
    const success = await purchaseLifetime();
    if (success) {
      Alert.alert('🎉 Success!', 'You now have lifetime Pro access!');
      onClose();
    }
  }, [purchaseLifetime, onClose]);

  const handleRestore = useCallback(async () => {
    const restored = await restorePurchases();
    if (restored) {
      Alert.alert('✅ Restored!', 'Your purchases have been restored.');
      onClose();
    } else {
      Alert.alert('No Purchases Found', 'We couldn\'t find any previous purchases to restore.');
    }
  }, [restorePurchases, onClose]);

  if (isPro) {
    return null;
  }

  return (
    <Modal visible={visible} onClose={onClose} dismissable>
      <View style={styles.container}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={[styles.iconContainer, isDarkMode ? styles.iconContainerDark : styles.iconContainerLight]}>
              <Ionicons name="trophy" size={32} color="#ffffff" />
            </View>
            <Text style={[styles.title, isDarkMode ? styles.titleDark : styles.titleLight]}>
              Go Pro
            </Text>
            <Text style={[styles.subtitle, isDarkMode ? styles.subtitleDark : styles.subtitleLight]}>
              Unlock your full potential on the court
            </Text>
          </View>

          {/* Feature Pills */}
          <View style={styles.featurePills}>
            {[
              { icon: 'musical-notes', text: 'Premium Sounds' },
              { icon: 'analytics', text: 'Advanced Stats' },
              { icon: 'share', text: 'Share Cards' },
            ].map((item, index) => (
              <View key={index} style={[styles.pill, isDarkMode ? styles.pillDark : styles.pillLight]}>
                <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={14} color="#22c55e" />
                <Text style={[styles.pillText, isDarkMode ? styles.pillTextDark : styles.pillTextLight]}>
                  {item.text}
                </Text>
              </View>
            ))}
          </View>

          {/* Pricing Plans - Order: Weekly -> Monthly -> Annual (Best Value) -> Lifetime */}
          <View style={styles.plansContainer}>
            {/* Weekly Plan */}
            <PricingCard
              type="weekly"
              price="$1.99"
              pricePerMonth="/week"
              description="Billed weekly"
              features={[
                '7-day Free Trial',
                '30+ Premium Sounds',
                'Unlimited Stats',
                'Premium Share Cards',
              ]}
              isFeatured={false}
              isBestValue={false}
              onSelect={handlePurchaseWeekly}
              isLoading={isLoading}
            />

            {/* Monthly Plan */}
            <PricingCard
              type="monthly"
              price="$4.99"
              pricePerMonth="/month"
              description="Billed monthly"
              features={[
                '7-day Free Trial',
                '30+ Premium Sounds',
                'Unlimited Stats',
                'Premium Share Cards',
              ]}
              isFeatured={false}
              isBestValue={false}
              onSelect={handlePurchaseMonthly}
              isLoading={isLoading}
            />

            {/* Annual Plan - Best Value */}
            <PricingCard
              type="annual"
              price="$29.99"
              pricePerMonth="$2.50/month"
              description="Billed annually • Save 50%"
              features={[
                '30+ Premium Sounds',
                'Unlimited Stats',
                'Premium Share Cards',
                'Custom Sound Uploads',
                'Priority Support',
              ]}
              isFeatured={true}
              isBestValue={true}
              onSelect={handlePurchaseAnnual}
              isLoading={isLoading}
            />

            {/* Lifetime Plan */}
            <PricingCard
              type="lifetime"
              price="$49.99"
              pricePerMonth=""
              description="One-time payment"
              features={[
                'All Pro Features Forever',
                'Never Pay Again',
                'All Future Updates',
                'Lifetime Support',
              ]}
              isFeatured={false}
              isBestValue={false}
              onSelect={handlePurchaseLifetime}
              isLoading={isLoading}
            />
          </View>

          {/* Restore Link */}
          <Pressable onPress={handleRestore} style={styles.restoreButton}>
            <Ionicons name="refresh" size={16} color={isDarkMode ? '#22c55e' : '#16a34a'} />
            <Text style={[styles.restoreText, isDarkMode ? styles.restoreTextDark : styles.restoreTextLight]}>
              {' '}Restore Purchases
            </Text>
          </Pressable>

          {/* Legal */}
          <Text style={[styles.legalText, isDarkMode ? styles.legalTextDark : styles.legalTextLight]}>
            Subscriptions auto-renew. Cancel anytime.{'\n'}
            By subscribing, you agree to our Terms of Service & Privacy Policy.
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
  scrollContent: {
    paddingBottom: 24,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  iconContainerLight: {
    backgroundColor: '#22c55e',
  },
  iconContainerDark: {
    backgroundColor: '#16a34a',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
  },
  titleLight: {
    color: '#111827',
  },
  titleDark: {
    color: '#f9fafb',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  subtitleLight: {
    color: '#6b7280',
  },
  subtitleDark: {
    color: '#9ca3af',
  },
  featurePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 28,
    paddingHorizontal: 16,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    gap: 6,
  },
  pillLight: {
    backgroundColor: '#f3f4f6',
  },
  pillDark: {
    backgroundColor: '#374151',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  pillTextLight: {
    color: '#374151',
  },
  pillTextDark: {
    color: '#e5e7eb',
  },
  plansContainer: {
    paddingHorizontal: 16,
    gap: 14,
  },
  restoreButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    marginTop: 12,
  },
  restoreText: {
    fontSize: 15,
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
    paddingHorizontal: 24,
  },
  legalTextLight: {
    color: '#9ca3af',
  },
  legalTextDark: {
    color: '#6b7280',
  },
});
