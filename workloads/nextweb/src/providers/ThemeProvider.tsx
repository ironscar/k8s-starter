'use client';

import { createContext, ReactNode, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

type ThemeCtx = {
  theme: Theme;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeCtx>({
  theme: 'light',
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: Readonly<{ children: ReactNode }>) => {
  // create state and handler for theme
  const [theme, setTheme] = useState<Theme>('light');
  const toggleTheme = () => setTheme((prev: Theme) => (prev === 'light' ? 'dark' : 'light'));
  console.log(`ThemeProvider: Current theme is ${theme}`);

  // create effect for updating theme in local storage
  useEffect(() => {
    // set class on root html element which can then use the class from global-css
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // didn't use useMemo as this will only re-render during theme change and has no parent for random re-renders
  return <ThemeContext value={{ theme, toggleTheme }}>{children}</ThemeContext>;
};
