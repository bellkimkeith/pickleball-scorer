import { View, Text, ScrollView, Pressable, Switch } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../store/game-store';
import { AVAILABLE_WINNING_SCORES, getAvailableSideChangeOptions } from '../../lib/constants/game-config';
import { useDarkMode } from '../../hooks/useDarkMode';
import { Language } from '../../lib/types/game';
import { changeLanguage, SUPPORTED_LANGUAGES } from '../../i18n';
import { useSubscriptionStore } from '../../store/subscription-store';
import { PaywallModal } from '../../components/paywall/PaywallModal';

export default function SettingsScreen() {
  const router = useRouter();
  const settings = useGameStore((state) => state.settings);
  const updateSettings = useGameStore((state) => state.updateSettings);
  const { isDarkMode } = useDarkMode();
  const { t, i18n } = useTranslation();
  const isPro = useSubscriptionStore((state) => state.isPro);
  const [showPaywall, setShowPaywall] = useState(false);
  const effectiveLanguage = settings.language ?? i18n.language;

  const handleLanguageChange = async (language: Language) => {
    await changeLanguage(language);
    updateSettings({ language });
  };

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`} edges={['top']}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <ScrollView className="flex-1">

      {/* Header */}
      <View className="pb-6 px-6 flex-row items-center">
        <Pressable
          onPress={() => router.back()}
          className="mr-4"
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={28} color="#374151" />
        </Pressable>
        <Text className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {t('settings.title')}
        </Text>
      </View>

      <View className="px-6">
        {/* Pro Upgrade Section */}
        {!isPro && (
          <Pressable
            onPress={() => setShowPaywall(true)}
            className="rounded-2xl p-5 mb-4 bg-amber-500"
            accessibilityLabel="Upgrade to Pro"
            accessibilityRole="button"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <Ionicons name="star" size={28} color="#ffffff" />
                <View>
                  <Text className="text-white text-lg font-bold">Upgrade to Pro</Text>
                  <Text className="text-white/80 text-sm">Unlock all features & remove limits</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#ffffff" />
            </View>
          </Pressable>
        )}

        {/* Current Plan (if Pro) */}
        {isPro && (
          <View className={`rounded-2xl p-5 mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <View className="flex-row items-center gap-3">
              <View className="bg-amber-500 w-10 h-10 rounded-xl items-center justify-center">
                <Ionicons name="star" size={24} color="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Pro Active
                </Text>
                <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Thank you for supporting us!
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Sound Settings */}
        <View className={`rounded-2xl p-4 mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <Text className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Sound Settings
          </Text>
          
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-1">
              <Text className={`text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Auto-sounds on Score
              </Text>
              <Text className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Play sound when point is scored
              </Text>
            </View>
            <Switch
              value={settings.autoSoundsEnabled ?? false}
              onValueChange={(value) => updateSettings({ autoSoundsEnabled: value })}
              trackColor={{ false: '#d1d5db', true: '#16a34a' }}
              thumbColor="#ffffff"
              accessibilityLabel="Toggle auto-sounds on score"
            />
          </View>

          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className={`text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Auto-sounds on Side Out
              </Text>
              <Text className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Play sound on side out
              </Text>
            </View>
            <Switch
              value={settings.autoSoundsOnSideOut ?? false}
              onValueChange={(value) => updateSettings({ autoSoundsOnSideOut: value })}
              trackColor={{ false: '#d1d5db', true: '#16a34a' }}
              thumbColor="#ffffff"
              accessibilityLabel="Toggle auto-sounds on side out"
            />
          </View>
        </View>

        {/* Dark Mode Toggle */}
        <View className={`rounded-2xl p-4 mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {t('settings.darkMode')}
              </Text>
              <Text className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('settings.darkModeDesc')}
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={(value) => updateSettings({ theme: value ? 'dark' : 'light' })}
              trackColor={{ false: '#d1d5db', true: '#f97316' }}
              thumbColor="#ffffff"
              accessibilityLabel="Toggle dark mode"
            />
          </View>
        </View>

        {/* Language Selection */}
        <View className={`rounded-2xl p-4 mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <Text className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('settings.language')}
          </Text>
          <View className="flex-row gap-2">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <Pressable
                key={lang}
                onPress={() => handleLanguageChange(lang)}
                accessibilityLabel={`Set language to ${lang}`}
                accessibilityRole="button"
                accessibilityState={{ selected: effectiveLanguage === lang }}
                className={`flex-1 py-3 rounded-xl ${
                  effectiveLanguage === lang ? 'bg-green-500' : isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}
                style={({ pressed }) => ({
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                })}
              >
                <Text
                  className={`text-center font-semibold ${
                    effectiveLanguage === lang ? 'text-white' : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  {t(`languages.${lang}`)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Game Type */}
        <View className={`rounded-2xl p-4 mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <Text className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('settings.scoringType')}
          </Text>
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => updateSettings({ gameType: 'rally' })}
              accessibilityLabel="Set rally scoring"
              accessibilityRole="button"
              accessibilityState={{ selected: settings.gameType === 'rally' }}
              className={`flex-1 py-3 rounded-xl ${
                settings.gameType === 'rally' ? 'bg-green-500' : isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.95 : 1 }],
              })}
            >
              <Text
                className={`text-center font-semibold ${
                  settings.gameType === 'rally' ? 'text-white' : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                {t('game.rally')}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => updateSettings({ gameType: 'sideout' })}
              accessibilityLabel="Set sideout scoring"
              accessibilityRole="button"
              accessibilityState={{ selected: settings.gameType === 'sideout' }}
              className={`flex-1 py-3 rounded-xl ${
                settings.gameType === 'sideout' ? 'bg-green-500' : isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.95 : 1 }],
              })}
            >
              <Text
                className={`text-center font-semibold ${
                  settings.gameType === 'sideout' ? 'text-white' : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                {t('game.sideout')}
              </Text>
            </Pressable>
          </View>
          <Text className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {settings.gameType === 'rally' ? t('game.rallyDesc') : t('game.sideoutDesc')}
          </Text>
        </View>

        {/* Winning Score */}
        <View className={`rounded-2xl p-4 mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <Text className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('settings.winningScore')}
          </Text>
          <View className="flex-row gap-2">
            {AVAILABLE_WINNING_SCORES.map((score) => (
              <Pressable
                key={score}
                onPress={() => updateSettings({ winningScore: score })}
                accessibilityLabel={`Set winning score to ${score}`}
                accessibilityRole="button"
                accessibilityState={{ selected: settings.winningScore === score }}
                className={`flex-1 py-3 rounded-xl ${
                  settings.winningScore === score ? 'bg-green-500' : isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}
                style={({ pressed }) => ({
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                })}
              >
                <Text
                  className={`text-center font-semibold ${
                    settings.winningScore === score ? 'text-white' : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  {score}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('settings.winningScoreDesc')}
          </Text>
        </View>

        {/* Win by 2 Toggle */}
        <View className={`rounded-2xl p-4 mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {t('settings.winByTwo')}
              </Text>
              <Text className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('settings.winByTwoDesc')}
              </Text>
            </View>
            <Switch
              value={settings.winByTwo}
              onValueChange={(value) => updateSettings({ winByTwo: value })}
              trackColor={{ false: '#d1d5db', true: '#16a34a' }}
              thumbColor="#ffffff"
              accessibilityLabel="Win by 2 points required"
            />
          </View>
        </View>

        {/* Side Change At */}
        <View className={`rounded-2xl p-4 mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <Text className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('settings.sideChangeAt')}
          </Text>
          <View className="flex-row gap-2">
            {getAvailableSideChangeOptions(settings.winningScore).map((score) => (
              <Pressable
                key={score}
                onPress={() => updateSettings({ sideChangeAt: score })}
                accessibilityLabel={score === 0 ? 'Disable side change' : `Change sides at score ${score}`}
                accessibilityRole="button"
                accessibilityState={{ selected: settings.sideChangeAt === score }}
                className={`flex-1 py-3 rounded-xl ${
                  settings.sideChangeAt === score ? 'bg-green-500' : isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}
                style={({ pressed }) => ({
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                })}
              >
                <Text
                  className={`text-center font-semibold ${
                    settings.sideChangeAt === score ? 'text-white' : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  {score === 0 ? t('common.off') : score}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {settings.sideChangeAt === 0
              ? t('settings.sideChangeAtDesc.off')
              : t('settings.sideChangeAtDesc.at', { score: settings.sideChangeAt })}
          </Text>
        </View>

        {/* Swap Scores on Side Change Toggle */}
        <View className={`rounded-2xl p-4 mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {t('settings.swapScores')}
              </Text>
              <Text className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('settings.swapScoresDesc')}
              </Text>
            </View>
            <Switch
              value={settings.swapScoresOnSideChange}
              onValueChange={(value) => updateSettings({ swapScoresOnSideChange: value })}
              trackColor={{ false: '#d1d5db', true: '#16a34a' }}
              thumbColor="#ffffff"
              accessibilityLabel="Swap scores on side change"
            />
          </View>
        </View>

        {/* Info Section */}
        <View className={`rounded-2xl p-4 mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={24} color={isDarkMode ? '#60a5fa' : '#2563eb'} />
            <View className="flex-1 ml-3">
              <Text className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-blue-200' : 'text-blue-900'}`}>
                {t('settings.rules')}
              </Text>
              <Text className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                {t('settings.rulesDesc')}
              </Text>
            </View>
          </View>
        </View>

        {/* Privacy Policy */}
        <Pressable
          onPress={() => router.push('/settings/privacy')}
          className={`rounded-2xl p-4 mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
          accessibilityLabel="View Privacy Policy"
          accessibilityRole="button"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="shield-checkmark-outline" size={24} color="#374151" />
              <Text className={`text-lg font-semibold ml-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {t('settings.privacyPolicy')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </View>
        </Pressable>
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
