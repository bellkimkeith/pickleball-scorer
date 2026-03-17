import { View, Text, ScrollView, Pressable, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useGameStore } from '../../store/game-store';
import { AVAILABLE_WINNING_SCORES, getAvailableSideChangeOptions } from '../../lib/constants/game-config';
import { useDarkMode } from '../../hooks/useDarkMode';

export default function SettingsScreen() {
  const router = useRouter();
  const settings = useGameStore((state) => state.settings);
  const updateSettings = useGameStore((state) => state.updateSettings);
  const { isDarkMode } = useDarkMode();

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
          Settings
        </Text>
      </View>

      <View className="px-6">
        {/* Dark Mode Toggle */}
        <View className={`rounded-2xl p-4 mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Dark Mode
              </Text>
              <Text className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Use dark theme for the app
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

        {/* Game Type */}
        <View className={`rounded-2xl p-4 mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <Text className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Scoring Type
          </Text>
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => updateSettings({ gameType: 'rally' })}
              accessibilityLabel="Set rally scoring"
              accessibilityRole="button"
              accessibilityState={{ selected: settings.gameType === 'rally' }}
              className={`flex-1 py-3 rounded-xl ${
                settings.gameType === 'rally' ? 'bg-primary-500' : isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
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
                Rally
              </Text>
            </Pressable>
            <Pressable
              onPress={() => updateSettings({ gameType: 'sideout' })}
              accessibilityLabel="Set sideout scoring"
              accessibilityRole="button"
              accessibilityState={{ selected: settings.gameType === 'sideout' }}
              className={`flex-1 py-3 rounded-xl ${
                settings.gameType === 'sideout' ? 'bg-primary-500' : isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
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
                Sideout
              </Text>
            </Pressable>
          </View>
          <Text className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {settings.gameType === 'rally'
              ? 'Point scored by whoever wins the rally'
              : 'Only serving team can score a point'}
          </Text>
        </View>

        {/* Winning Score */}
        <View className={`rounded-2xl p-4 mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <Text className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Winning Score
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
                  settings.winningScore === score ? 'bg-primary-500' : isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
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
            Set the score needed to win the game
          </Text>
        </View>

        {/* Win by 2 Toggle */}
        <View className={`rounded-2xl p-4 mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Win by 2
              </Text>
              <Text className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Require a 2-point margin to win
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
            Side Change At Score
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
                  settings.sideChangeAt === score ? 'bg-primary-500' : isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
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
                  {score === 0 ? 'Off' : score}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {settings.sideChangeAt === 0
              ? 'No automatic side change'
              : `Players change sides at ${settings.sideChangeAt} points`}
          </Text>
        </View>

        {/* Swap Scores on Side Change Toggle */}
        <View className={`rounded-2xl p-4 mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Swap Scores on Side Change
              </Text>
              <Text className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Swap scores with colors when switching sides
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
                Pickleball Rules
              </Text>
              <Text className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                Official pickleball scoring: Only the serving team can score. In doubles, both
                partners serve before side-out (except at start of game).
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
                Privacy Policy
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </View>
        </Pressable>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}
