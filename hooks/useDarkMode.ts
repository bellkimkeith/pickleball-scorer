import { useCallback } from 'react';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import { useGameStore } from '../store/game-store';

export const useDarkMode = () => {
  const { colorScheme } = useNativeWindColorScheme();
  const theme = useGameStore((state) => state.settings.theme);
  const updateSettings = useGameStore((state) => state.updateSettings);

  const effectiveTheme = theme || colorScheme || 'light';
  const isDarkMode = effectiveTheme === 'dark';

  const toggleTheme = useCallback(() => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    updateSettings({ theme: newTheme });
  }, [isDarkMode, updateSettings]);

  const setTheme = useCallback((newTheme: 'light' | 'dark') => {
    updateSettings({ theme: newTheme });
  }, [updateSettings]);

  return {
    isDarkMode,
    theme: effectiveTheme,
    toggleTheme,
    setTheme,
  };
};
