import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/theme';

const THEME_KEY = '@bodyfit_theme';

interface ThemeColors {
  background: string;
  card: string;
  surface: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  borderLight: string;
  inputBg: string;
  statusBar: 'light' | 'dark';
}

const lightColors: ThemeColors = {
  background: Colors.light,
  card: Colors.lightCard,
  surface: Colors.lightSurface,
  text: Colors.textDark,
  textSecondary: Colors.textGray,
  textTertiary: Colors.textLight,
  border: Colors.border,
  borderLight: Colors.borderLight,
  inputBg: Colors.lightSurface,
  statusBar: 'dark',
};

const darkColors: ThemeColors = {
  background: Colors.dark,
  card: Colors.darkCard,
  surface: Colors.darkSurface,
  text: Colors.textWhite,
  textSecondary: Colors.textLight,
  textTertiary: Colors.textGray,
  border: '#2A3350',
  borderLight: '#1E2A45',
  inputBg: Colors.darkSurface,
  statusBar: 'light',
};

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
  colors: lightColors,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((value) => {
      if (value !== null) {
        setIsDark(value === 'dark');
      }
      setLoaded(true);
    });
  }, []);

  const toggleTheme = () => {
    const newValue = !isDark;
    setIsDark(newValue);
    AsyncStorage.setItem(THEME_KEY, newValue ? 'dark' : 'light');
  };

  const colors = isDark ? darkColors : lightColors;

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
