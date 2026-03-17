import React, { createContext, useContext, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
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
  const colorScheme = useColorScheme();
  const { theme, updateSettings } = useGameStore((state) => ({
    theme: state.settings.theme,
    updateSettings: state.updateSettings,
  }));

  const effectiveTheme = theme === 'light' || theme === 'dark' ? theme : colorScheme || 'light';

  const toggleTheme = () => {
    updateSettings({ theme: effectiveTheme === 'light' ? 'dark' : 'light' });
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
