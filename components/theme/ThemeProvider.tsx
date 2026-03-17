import React, { createContext, useContext, ReactNode, useEffect, useMemo, useCallback } from 'react';
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
  const theme = useGameStore((state) => state.settings.theme);
  const updateSettings = useGameStore((state) => state.updateSettings);

  // Determine effective theme: user setting takes precedence over system
  const effectiveTheme = useMemo(() => {
    return theme === 'light' || theme === 'dark' ? theme : colorScheme || 'light';
  }, [theme, colorScheme]);

  // Sync theme with NativeWind and Appearance API on mount
  useEffect(() => {
    // Only set if different from current color scheme
    if (effectiveTheme !== colorScheme) {
      setColorScheme(effectiveTheme);
      Appearance.setColorScheme(effectiveTheme);
    }
  }, []); // run only on mount

  const toggleTheme = useCallback(() => {
    const newTheme = effectiveTheme === 'light' ? 'dark' : 'light';
    updateSettings({ theme: newTheme });
    setColorScheme(newTheme);
    Appearance.setColorScheme(newTheme);
  }, [effectiveTheme, updateSettings, setColorScheme]);

  const setTheme = useCallback((newTheme: 'light' | 'dark') => {
    updateSettings({ theme: newTheme });
    setColorScheme(newTheme);
    Appearance.setColorScheme(newTheme);
  }, [updateSettings, setColorScheme]);

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
