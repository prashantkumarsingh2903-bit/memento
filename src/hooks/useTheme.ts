import { useState, useEffect } from 'react';
import { storageService } from '../services/storage/storageService';

export function useTheme() {
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>(() => {
    const profile = storageService.getProfile();
    return profile.theme || 'system';
  });

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = () => {
      const isDark =
        theme === 'dark' ||
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme);
    storageService.updateProfile({ theme: newTheme });
  };

  return { theme, setTheme };
}
