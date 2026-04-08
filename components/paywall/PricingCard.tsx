import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { memo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useDarkMode } from '../../hooks/useDarkMode';

interface PricingCardProps {
  type: 'weekly' | 'monthly' | 'annual' | 'lifetime';
  price: string;
  pricePerMonth?: string;
  description?: string;
  features: string[];
  isFeatured?: boolean;
  isBestValue?: boolean;
  onSelect: () => void;
  isLoading?: boolean;
}

function PricingCardComponent({
  type,
  price,
  pricePerMonth,
  description,
  features,
  isFeatured = false,
  isBestValue = false,
  onSelect,
  isLoading = false,
}: PricingCardProps) {
  const { isDarkMode } = useDarkMode();

  const getTitle = () => {
    switch (type) {
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'annual': return 'Annual';
      case 'lifetime': return 'Lifetime';
    }
  };

  const getButtonText = () => {
    if (isLoading) return 'Loading...';
    if (type === 'lifetime') return 'Get Lifetime';
    return 'Start Free Trial';
  };

  return (
    <Pressable
      onPress={onSelect}
      disabled={isLoading}
      style={({ pressed }) => [
        styles.container,
        isBestValue ? styles.containerBest : isDarkMode ? styles.containerDark : styles.containerLight,
        pressed && styles.pressed,
      ]}
    >
      {isBestValue && (
        <View style={styles.bestValueBadge}>
          <Text style={styles.bestValueText}>★ BEST VALUE</Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={[styles.title, isBestValue ? styles.titleBest : isDarkMode ? styles.titleDark : styles.titleLight]}>
          {getTitle()}
        </Text>
        {description && (
          <Text style={[styles.description, isBestValue ? styles.descriptionBest : isDarkMode ? styles.descriptionDark : styles.descriptionLight]}>
            {description}
          </Text>
        )}
      </View>

      <View style={styles.priceRow}>
        <Text style={[styles.price, isBestValue ? styles.priceBest : isDarkMode ? styles.priceDark : styles.priceLight]}>
          {price}
        </Text>
        {pricePerMonth && (
          <Text style={[styles.priceSub, isBestValue ? styles.priceSubBest : isDarkMode ? styles.priceSubDark : styles.priceSubLight]}>
            {pricePerMonth}
          </Text>
        )}
      </View>

      <View style={[styles.divider, isBestValue ? styles.dividerBest : isDarkMode ? styles.dividerDark : styles.dividerLight]} />

      <View style={styles.features}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <View style={[styles.checkDot, isBestValue ? styles.checkDotBest : styles.checkDotDefault]}>
              <Ionicons name="checkmark" size={10} color={isBestValue ? '#166534' : '#22c55e'} />
            </View>
            <Text style={[styles.featureText, isBestValue ? styles.featureTextBest : isDarkMode ? styles.featureTextDark : styles.featureTextLight]}>
              {feature}
            </Text>
          </View>
        ))}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          isBestValue ? styles.buttonBest : styles.buttonDefault,
          pressed && styles.buttonPressed,
        ]}
        onPress={onSelect}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={isBestValue ? '#166534' : '#ffffff'} />
        ) : (
          <Text style={[styles.buttonText, isBestValue ? styles.buttonTextBest : styles.buttonTextDefault]}>
            {getButtonText()}
          </Text>
        )}
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 18,
    position: 'relative',
  },
  containerLight: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  containerDark: {
    backgroundColor: '#1f2937',
    borderWidth: 1.5,
    borderColor: '#374151',
  },
  containerBest: {
    backgroundColor: '#22c55e',
    borderWidth: 0,
  },
  pressed: {
    opacity: 0.92,
  },
  bestValueBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  bestValueText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  header: {
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  titleLight: {
    color: '#111827',
  },
  titleDark: {
    color: '#f9fafb',
  },
  titleBest: {
    color: '#ffffff',
  },
  description: {
    fontSize: 12,
    marginTop: 2,
  },
  descriptionLight: {
    color: '#6b7280',
  },
  descriptionDark: {
    color: '#9ca3af',
  },
  descriptionBest: {
    color: '#dcfce7',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  price: {
    fontSize: 32,
    fontWeight: '800',
  },
  priceLight: {
    color: '#111827',
  },
  priceDark: {
    color: '#f9fafb',
  },
  priceBest: {
    color: '#ffffff',
  },
  priceSub: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  priceSubLight: {
    color: '#6b7280',
  },
  priceSubDark: {
    color: '#9ca3af',
  },
  priceSubBest: {
    color: '#dcfce7',
  },
  divider: {
    height: 1,
    marginBottom: 10,
  },
  dividerLight: {
    backgroundColor: '#e5e7eb',
  },
  dividerDark: {
    backgroundColor: '#374151',
  },
  dividerBest: {
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  features: {
    marginBottom: 14,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  checkDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkDotDefault: {
    backgroundColor: '#dcfce7',
  },
  checkDotBest: {
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  featureText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  featureTextLight: {
    color: '#374151',
  },
  featureTextDark: {
    color: '#e5e7eb',
  },
  featureTextBest: {
    color: '#ffffff',
  },
  button: {
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDefault: {
    backgroundColor: '#22c55e',
  },
  buttonBest: {
    backgroundColor: '#ffffff',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  buttonTextDefault: {
    color: '#ffffff',
  },
  buttonTextBest: {
    color: '#15803d',
  },
});

export const PricingCard = memo(PricingCardComponent);
