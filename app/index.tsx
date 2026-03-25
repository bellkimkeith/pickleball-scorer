import { View, Text, Pressable, ScrollView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useDarkMode } from '../hooks/useDarkMode';
import { useSubscriptionStore } from '../store/subscription-store';
import { PaywallModal } from '../components/paywall/PaywallModal';

export default function HomeScreen() {
  const router = useRouter();
  const { isDarkMode } = useDarkMode();
  const { t } = useTranslation();
  const isPro = useSubscriptionStore((state) => state.isPro);
  const [showPaywall, setShowPaywall] = useState(false);

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`} edges={['top']}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View className="pb-6 px-6 flex-row justify-between items-start">
          <View className="flex-1">
            <Text className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {t('home.title')}
            </Text>
            <Text className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-400'} mt-1`}>
              {t('home.subtitle')}
            </Text>
          </View>
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => router.push('/settings')}
              className="p-2 -mr-2 -mt-1"
              accessibilityLabel="Open settings"
              accessibilityRole="button"
            >
              {({ pressed }) => (
                <Ionicons
                  name="settings-outline"
                  size={26}
                  color={pressed ? '#16a34a' : '#9ca3af'}
                />
              )}
            </Pressable>
          </View>
        </View>

        {/* Pro Badge - if not Pro */}
        {!isPro && (
          <Pressable
            onPress={() => setShowPaywall(true)}
            className="mx-6 mb-4 p-4 rounded-2xl bg-amber-500 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-3">
              <Ionicons name="star" size={24} color="#ffffff" />
              <View>
                <Text className="text-white font-bold text-base">Upgrade to Pro</Text>
                <Text className="text-white/80 text-sm">Unlock all features</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ffffff" />
          </Pressable>
        )}

        {/* Mode Selection */}
        <View className="px-6 gap-4">
          <Pressable
            onPress={() => router.push('/(game)/singles')}
            className={`rounded-3xl p-8 shadow-lg active:scale-95 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            accessibilityLabel="Start singles match, 1 versus 1"
            accessibilityRole="button"
          >
            <View className="flex-row items-center">
              <View className="bg-green-100 w-16 h-16 rounded-2xl items-center justify-center">
                <Ionicons name="person" size={32} color="#16a34a" />
              </View>
              <View className="ml-4 flex-1">
                <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {t('home.singles')}
                </Text>
                <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('home.singlesDesc')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
            </View>
          </Pressable>

          <Pressable
            onPress={() => router.push('/(game)/doubles')}
            className={`rounded-3xl p-8 shadow-lg active:scale-95 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            accessibilityLabel="Start doubles match, 2 versus 2"
            accessibilityRole="button"
          >
            <View className="flex-row items-center">
              <View className="bg-orange-100 w-16 h-16 rounded-2xl items-center justify-center">
                <Ionicons name="people" size={32} color="#ea580c" />
              </View>
              <View className="ml-4 flex-1">
                <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {t('home.doubles')}
                </Text>
                <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('home.doublesDesc')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
            </View>
          </Pressable>
        </View>

        {/* Stats Card */}
        <View className="px-6 mt-6">
          <Pressable
            onPress={() => router.push('/stats')}
            className={`rounded-2xl p-5 shadow-lg active:scale-95 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            accessibilityLabel="View match statistics"
            accessibilityRole="button"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-4">
                <View className="bg-blue-100 w-12 h-12 rounded-xl items-center justify-center">
                  <Ionicons name="bar-chart" size={24} color="#3b82f6" />
                </View>
                <View>
                  <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {t('stats.title', 'Stats')}
                  </Text>
                  <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('stats.recentGames', 'View your match history')}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </View>
          </Pressable>
        </View>

        {/* Features Section */}
        <View className="px-6 mt-6">
          <Text className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Features
          </Text>
          
          <View className="gap-3">
            {/* Soundboard Feature */}
            <View className={`rounded-xl p-4 flex-row items-center gap-3 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <View className="bg-red-100 w-10 h-10 rounded-xl items-center justify-center">
                <Ionicons name="musical-notes" size={20} color="#ef4444" />
              </View>
              <View className="flex-1">
                <Text className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Soundboard
                </Text>
                <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Add hype sounds to your matches
                </Text>
              </View>
              {!isPro && (
                <View className="bg-amber-500 px-2 py-1 rounded-md">
                  <Text className="text-white text-xs font-bold">PRO</Text>
                </View>
              )}
            </View>

            {/* Stats Feature */}
            <View className={`rounded-xl p-4 flex-row items-center gap-3 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <View className="bg-blue-100 w-10 h-10 rounded-xl items-center justify-center">
                <Ionicons name="stats-chart" size={20} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Stats Tracking
                </Text>
                <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Track your wins and losses
                </Text>
              </View>
            </View>

            {/* Share Feature */}
            <View className={`rounded-xl p-4 flex-row items-center gap-3 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <View className="bg-green-100 w-10 h-10 rounded-xl items-center justify-center">
                <Ionicons name="share-social" size={20} color="#16a34a" />
              </View>
              <View className="flex-1">
                <Text className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Share Match
                </Text>
                <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Share your victories with friends
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Paywall Modal */}
      <PaywallModal 
        visible={showPaywall} 
        onClose={() => setShowPaywall(false)} 
      />
    </SafeAreaView>
  );
}
