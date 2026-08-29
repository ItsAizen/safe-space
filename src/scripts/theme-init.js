(function() {
  'use strict';

  const THEME_KEY = 'theme';
  const DARK_CLASS = 'dark';
  const LIGHT_CLASS = 'light';

  function getInitialTheme(): 'dark' | 'light' {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {}

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme: 'dark' | 'light') {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {}
  }

  const initialTheme = getInitialTheme();
  applyTheme(initialTheme);

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (!saved) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    } catch {}
  });
})();