import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox, View } from 'react-native';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { ThemeProvider } from '../components/theme/ThemeProvider';
import { useDarkMode } from '../hooks/useDarkMode';
import '../global.css';

LogBox.ignoreLogs(['SafeAreaView has been deprecated']);

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <ThemedApp />
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

function ThemedApp() {
  const { isDarkMode } = useDarkMode();
  
  return (
    <View style={{ flex: 1, backgroundColor: isDarkMode ? '#111827' : '#f9fafb' }}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
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
    </View>
  );
}
