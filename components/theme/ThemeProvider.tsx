import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import { Appearance } from 'react-native';
import { useGameStore } from '../../store/game-store';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { colorScheme, setColorScheme } = useNativeWindColorScheme();
  const { theme, updateSettings } = useGameStore((state) => ({
    theme: state.settings.theme,
    updateSettings: state.updateSettings,
  }));

  // Determine effective theme: user setting takes precedence over system
  const effectiveTheme = theme === 'light' || theme === 'dark' ? theme : colorScheme || 'light';

  // Sync theme with NativeWind and Appearance API
  useEffect(() => {
    setColorScheme(effectiveTheme);
    Appearance.setColorScheme(effectiveTheme);
  }, [effectiveTheme, setColorScheme]);

  const toggleTheme = () => {
    const newTheme = effectiveTheme === 'light' ? 'dark' : 'light';
    updateSettings({ theme: newTheme });
  };

  const setTheme = (newTheme: 'light' | 'dark') => {
    updateSettings({ theme: newTheme });
  };

  return (
    <ThemeContext.Provider value={{ theme: effectiveTheme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
