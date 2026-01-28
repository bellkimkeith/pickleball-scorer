import { View, Text, ScrollView, Pressable, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useGameStore } from '../../store/game-store';
import { AVAILABLE_WINNING_SCORES } from '../../lib/constants/game-config';

export default function SettingsScreen() {
  const router = useRouter();
  const settings = useGameStore((state) => state.settings);
  const updateSettings = useGameStore((state) => state.updateSettings);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView className="flex-1">

      {/* Header */}
      <View className="pb-6 px-6 flex-row items-center">
        <Pressable onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={28} color="#374151" />
        </Pressable>
        <Text className="text-3xl font-bold text-gray-900">Settings</Text>
      </View>

      <View className="px-6">
        {/* Winning Score */}
        <View className="bg-white rounded-2xl p-4 mb-4">
          <Text className="text-lg font-semibold mb-3 text-gray-900">Winning Score</Text>
          <View className="flex-row gap-2">
            {AVAILABLE_WINNING_SCORES.map((score) => (
              <Pressable
                key={score}
                onPress={() => updateSettings({ winningScore: score })}
                className={`flex-1 py-3 rounded-xl ${
                  settings.winningScore === score ? 'bg-primary-500' : 'bg-gray-100'
                }`}
                style={({ pressed }) => ({
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                })}
              >
                <Text
                  className={`text-center font-semibold ${
                    settings.winningScore === score ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {score}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text className="text-sm text-gray-600 mt-2">
            Set the score needed to win the game
          </Text>
        </View>

        {/* Win by 2 Toggle */}
        <View className="bg-white rounded-2xl p-4 mb-4">
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900">Win by 2</Text>
              <Text className="text-sm text-gray-600 mt-1">
                Require a 2-point margin to win
              </Text>
            </View>
            <Switch
              value={settings.winByTwo}
              onValueChange={(value) => updateSettings({ winByTwo: value })}
              trackColor={{ false: '#d1d5db', true: '#16a34a' }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Side Change At */}
        <View className="bg-white rounded-2xl p-4 mb-4">
          <Text className="text-lg font-semibold mb-3 text-gray-900">Side Change At Score</Text>
          <View className="flex-row gap-2">
            {[0, 6, 11].map((score) => (
              <Pressable
                key={score}
                onPress={() => updateSettings({ sideChangeAt: score })}
                className={`flex-1 py-3 rounded-xl ${
                  settings.sideChangeAt === score ? 'bg-primary-500' : 'bg-gray-100'
                }`}
                style={({ pressed }) => ({
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                })}
              >
                <Text
                  className={`text-center font-semibold ${
                    settings.sideChangeAt === score ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {score === 0 ? 'Off' : score}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text className="text-sm text-gray-600 mt-2">
            {settings.sideChangeAt === 0
              ? 'No automatic side change'
              : `Players change sides at ${settings.sideChangeAt} points`}
          </Text>
        </View>

        {/* Info Section */}
        <View className="bg-blue-50 rounded-2xl p-4 mb-6">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={24} color="#2563eb" />
            <View className="flex-1 ml-3">
              <Text className="text-sm text-blue-900 font-semibold mb-1">Pickleball Rules</Text>
              <Text className="text-sm text-blue-800">
                Official pickleball scoring: Only the serving team can score. In doubles, both
                partners serve before side-out (except at start of game).
              </Text>
            </View>
          </View>
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}
