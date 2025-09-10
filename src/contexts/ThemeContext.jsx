import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize with saved theme or system preference
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('codeArenaTheme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      // Check system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    // Apply theme immediately on mount
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('codeArenaTheme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Only update if no saved theme preference
      const savedTheme = localStorage.getItem('codeArenaTheme');
      if (!savedTheme) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Handle page visibility changes (when computer wakes from sleep)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible, reapply theme to ensure consistency
        const savedTheme = localStorage.getItem('codeArenaTheme');
        if (savedTheme) {
          const shouldBeDark = savedTheme === 'dark';
          if (shouldBeDark !== isDarkMode) {
            setIsDarkMode(shouldBeDark);
          }
        }
      }
    };

    const handleFocus = () => {
      // Also handle window focus (when tab becomes active)
      const savedTheme = localStorage.getItem('codeArenaTheme');
      if (savedTheme) {
        const shouldBeDark = savedTheme === 'dark';
        if (shouldBeDark !== isDarkMode) {
          setIsDarkMode(shouldBeDark);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const value = {
    isDarkMode,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};