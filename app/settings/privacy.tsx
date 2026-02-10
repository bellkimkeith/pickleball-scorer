import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <StatusBar style="dark" />
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
          <Text className="text-3xl font-bold text-gray-900">Privacy Policy</Text>
        </View>

        <View className="px-6 pb-8">
          <View className="bg-white rounded-2xl p-6 mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Privacy Policy for Pickleball Scorer
            </Text>
            <Text className="text-sm text-gray-500 mb-4">Last updated: February 9, 2026</Text>

            <Text className="text-base text-gray-700 mb-4">
              Pickleball Scorer is a fully offline application. Your privacy is important to us, and
              we want to be transparent about our practices.
            </Text>

            <Text className="text-lg font-semibold text-gray-900 mb-2">Data Collection</Text>
            <Text className="text-base text-gray-700 mb-4">
              This app does not collect, store, transmit, or share any personal data or usage
              information. All game data (scores, player names, and settings) is stored locally on
              your device and is never sent to any server.
            </Text>

            <Text className="text-lg font-semibold text-gray-900 mb-2">Network Usage</Text>
            <Text className="text-base text-gray-700 mb-4">
              This app does not make any network requests. It functions entirely offline and does not
              require an internet connection.
            </Text>

            <Text className="text-lg font-semibold text-gray-900 mb-2">Analytics</Text>
            <Text className="text-base text-gray-700 mb-4">
              This app does not use any analytics services, tracking tools, or advertising
              frameworks.
            </Text>

            <Text className="text-lg font-semibold text-gray-900 mb-2">Third-Party Services</Text>
            <Text className="text-base text-gray-700 mb-4">
              This app does not integrate with any third-party services that collect user data.
            </Text>

            <Text className="text-lg font-semibold text-gray-900 mb-2">
              Children&apos;s Privacy
            </Text>
            <Text className="text-base text-gray-700 mb-4">
              This app is safe for users of all ages. Since no data is collected, there are no
              concerns regarding children&apos;s privacy.
            </Text>

            <Text className="text-lg font-semibold text-gray-900 mb-2">Contact</Text>
            <Text className="text-base text-gray-700">
              If you have any questions about this privacy policy, please contact us through the App
              Store developer contact information.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
