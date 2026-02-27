'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';

type Theme = 'light' | 'dark';

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }): JSX.Element {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const fromStorage = localStorage.getItem('erp-theme') as Theme | null;
    if (fromStorage === 'light' || fromStorage === 'dark') {
      setTheme(fromStorage);
      document.documentElement.classList.toggle('dark', fromStorage === 'dark');
      return;
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme: Theme = prefersDark ? 'dark' : 'light';
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      toggleTheme: () => {
        const nextTheme: Theme = theme === 'light' ? 'dark' : 'light';
        setTheme(nextTheme);
        localStorage.setItem('erp-theme', nextTheme);
        document.documentElement.classList.toggle('dark', nextTheme === 'dark');
      }
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeMode(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used inside ThemeProvider');
  }
  return context;
}
