import { View, Text, Pressable, StyleSheet } from 'react-native';
import { memo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useDarkMode } from '../../hooks/useDarkMode';

interface PricingCardProps {
  type: 'monthly' | 'annual' | 'lifetime';
  price: string;
  pricePerMonth?: string;
  features: string[];
  isBestValue?: boolean;
  onSelect: () => void;
  isLoading?: boolean;
}

const CHECK_ICONS: (keyof typeof Ionicons.glyphMap)[] = [
  'checkmark-circle',
  'checkmark-circle',
  'checkmark-circle',
];

function PricingCardComponent({
  type,
  price,
  pricePerMonth,
  features,
  isBestValue = false,
  onSelect,
  isLoading = false,
}: PricingCardProps) {
  const { isDarkMode } = useDarkMode();

  const getTitle = () => {
    switch (type) {
      case 'monthly': return 'Monthly';
      case 'annual': return 'Annual';
      case 'lifetime': return 'Lifetime';
    }
  };

  return (
    <Pressable
      onPress={onSelect}
      disabled={isLoading}
      style={[
        styles.container,
        isBestValue && styles.containerBestValue,
        isDarkMode ? styles.containerDark : styles.containerLight,
      ]}
    >
      {isBestValue && (
        <View style={styles.bestValueBadge}>
          <Text style={styles.bestValueText}>BEST VALUE</Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={[styles.title, isDarkMode ? styles.titleDark : styles.titleLight]}>
          {getTitle()}
        </Text>
        <View style={styles.priceContainer}>
          <Text style={[styles.price, isDarkMode ? styles.priceDark : styles.priceLight]}>
            {price}
          </Text>
          {pricePerMonth && (
            <Text style={[styles.pricePerMonth, isDarkMode ? styles.pricePerMonthDark : styles.pricePerMonthLight]}>
              {pricePerMonth}/mo
            </Text>
          )}
        </View>
      </View>

      <View style={styles.features}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Ionicons
              name={CHECK_ICONS[index % CHECK_ICONS.length] || 'checkmark-circle'}
              size={20}
              color={isBestValue ? '#ffffff' : '#16a34a'}
            />
            <Text style={[
              styles.featureText,
              isBestValue ? styles.featureTextBest : isDarkMode ? styles.featureTextDark : styles.featureTextLight
            ]}>
              {feature}
            </Text>
          </View>
        ))}
      </View>

      <Pressable
        style={[
          styles.button,
          isBestValue ? styles.buttonBestValue : styles.buttonLight,
        ]}
        onPress={onSelect}
        disabled={isLoading}
      >
        <Text style={[styles.buttonText, isBestValue ? styles.buttonTextBest : styles.buttonTextLight]}>
          {isLoading ? 'Loading...' : type === 'lifetime' ? 'Get Lifetime' : 'Subscribe'}
        </Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  containerLight: {
    backgroundColor: '#ffffff',
  },
  containerDark: {
    backgroundColor: '#1f2937',
  },
  containerBestValue: {
    backgroundColor: '#16a34a',
    borderWidth: 2,
    borderColor: '#16a34a',
  },
  bestValueBadge: {
    position: 'absolute',
    top: -12,
    left: '50%',
    marginLeft: -50,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bestValueText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  titleLight: {
    color: '#1f2937',
  },
  titleDark: {
    color: '#f3f4f6',
  },
  priceContainer: {
    alignItems: 'center',
  },
  price: {
    fontSize: 36,
    fontWeight: '800',
  },
  priceLight: {
    color: '#1f2937',
  },
  priceDark: {
    color: '#f3f4f6',
  },
  pricePerMonth: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  pricePerMonthLight: {
    color: '#6b7280',
  },
  pricePerMonthDark: {
    color: '#9ca3af',
  },
  features: {
    marginBottom: 20,
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  featureTextLight: {
    color: '#1f2937',
  },
  featureTextDark: {
    color: '#f3f4f6',
  },
  featureTextBest: {
    color: '#ffffff',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonLight: {
    backgroundColor: '#16a34a',
  },
  buttonBestValue: {
    backgroundColor: '#ffffff',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  buttonTextLight: {
    color: '#ffffff',
  },
  buttonTextBest: {
    color: '#16a34a',
  },
});

export const PricingCard = memo(PricingCardComponent);
