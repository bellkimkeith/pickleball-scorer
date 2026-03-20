import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox, View } from 'react-native';
import { useEffect, useState } from 'react';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { ThemeProvider } from '../components/theme/ThemeProvider';
import { useDarkMode } from '../hooks/useDarkMode';
import { useGameStore } from '../store/game-store';
import '../global.css';

LogBox.ignoreLogs(['SafeAreaView has been deprecated']);

export default function RootLayout() {
  const [i18nReady, setI18nReady] = useState(false);
  const settings = useGameStore((state) => state.settings);

  useEffect(() => {
    const initI18n = async () => {
      try {
        const { initI18n: init, changeLanguage: change } = await import('../i18n');
        await init(settings.language);
        setI18nReady(true);
      } catch (e) {
        console.error('Failed to initialize i18n:', e);
        setI18nReady(true);
      }
    };
    initI18n();
  }, []);

  useEffect(() => {
    if (i18nReady && settings.language) {
      import('../i18n').then(({ changeLanguage }) => {
        changeLanguage(settings.language);
      });
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
        <Stack.Screen name="settings" />
      </Stack>
    </View>
  );
}
