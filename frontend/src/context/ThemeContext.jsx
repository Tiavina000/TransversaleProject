import { createContext, useContext, useState, useEffect } from 'react';

const THEMES = [
  { key: 'green', label: 'Ministère', icon: '🏛️' },
  { key: 'dark', label: 'Sombre', icon: '🌙' },
  { key: 'light', label: 'Clair', icon: '☀️' },
];

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('eneni_theme') || 'green';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('eneni_theme', theme);
  }, [theme]);

  const setTheme = (t) => setThemeState(t);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
