import { useColorScheme } from 'react-native';
import { useGameStore } from '../store/game-store';

export const useDarkMode = () => {
  const colorScheme = useColorScheme();
  const { theme, updateSettings } = useGameStore((state) => ({
    theme: state.settings.theme,
    updateSettings: state.updateSettings,
  }));

  const effectiveTheme = theme || colorScheme || 'light';
  const isDarkMode = effectiveTheme === 'dark';

  const toggleTheme = () => {
    updateSettings({ theme: isDarkMode ? 'light' : 'dark' });
  };

  const setTheme = (newTheme: 'light' | 'dark') => {
    updateSettings({ theme: newTheme });
  };

  return {
    isDarkMode,
    theme: effectiveTheme,
    toggleTheme,
    setTheme,
  };
};
