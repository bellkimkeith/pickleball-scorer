import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox } from 'react-native';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import '../global.css';

LogBox.ignoreLogs(['SafeAreaView has been deprecated']);

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(game)" />
          <Stack.Screen name="settings" />
        </Stack>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
