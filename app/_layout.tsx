import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox, View } from 'react-native';
import { useEffect, useState } from 'react';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { ThemeProvider } from '../components/theme/ThemeProvider';
import { useDarkMode } from '../hooks/useDarkMode';
import { useGameStore } from '../store/game-store';
import { initI18n, changeLanguage } from '../i18n';
import '../global.css';

LogBox.ignoreLogs(['SafeAreaView has been deprecated']);

export default function RootLayout() {
  const [i18nReady, setI18nReady] = useState(false);
  const settings = useGameStore((state) => state.settings);

  useEffect(() => {
    initI18n(settings.language).then(() => {
      setI18nReady(true);
    });
  }, []);

  useEffect(() => {
    if (i18nReady && settings.language) {
      changeLanguage(settings.language);
    }
  }, [settings.language, i18nReady]);


  if (!i18nReady) {
    return null;
  }

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
        <Stack.Screen name="queue" />
        <Stack.Screen name="settings" />
      </Stack>
    </View>
  );
}
