import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import { useGameStore } from '../store/game-store';

export const useDarkMode = () => {
  const { colorScheme } = useNativeWindColorScheme();
  const { theme, updateSettings } = useGameStore((state) => ({
    theme: state.settings.theme,
    updateSettings: state.updateSettings,
  }));

  const effectiveTheme = theme || colorScheme || 'light';
  const isDarkMode = effectiveTheme === 'dark';

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    updateSettings({ theme: newTheme });
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
