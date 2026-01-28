import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View className="pb-8 px-6 flex-row justify-between items-start">
        <View>
          <Text className="text-4xl font-bold text-gray-900">Pickleball Scorer</Text>
          <Text className="text-base text-gray-400 mt-1">Start a new match</Text>
        </View>
        <Pressable
          onPress={() => router.push('/settings')}
          className="p-2 -mr-2 -mt-1"
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

      {/* Mode Selection */}
      <View className="px-6 gap-4">
        <Pressable
          onPress={() => router.push('/(game)/singles')}
          className="bg-white rounded-3xl p-8 shadow-lg active:scale-95"
        >
          <View className="flex-row items-center">
            <View className="bg-primary-100 w-16 h-16 rounded-2xl items-center justify-center">
              <Ionicons name="person" size={32} color="#16a34a" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-2xl font-bold text-gray-900">Singles</Text>
              <Text className="text-gray-600">1v1 Match</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
          </View>
        </Pressable>

        <Pressable
          onPress={() => router.push('/(game)/doubles')}
          className="bg-white rounded-3xl p-8 shadow-lg active:scale-95"
        >
          <View className="flex-row items-center">
            <View className="bg-secondary-100 w-16 h-16 rounded-2xl items-center justify-center">
              <Ionicons name="people" size={32} color="#2563eb" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-2xl font-bold text-gray-900">Doubles</Text>
              <Text className="text-gray-600">2v2 Match</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
          </View>
        </Pressable>
      </View>

    </SafeAreaView>
  );
}
