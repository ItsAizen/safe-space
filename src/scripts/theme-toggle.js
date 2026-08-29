// Theme Toggle Logic
(() => {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  const sunIcon = btn.querySelector('.sun-icon');
  const moonIcon = btn.querySelector('.moon-icon');
  const thumb = btn.querySelector('.toggle-thumb');
  const track = btn.querySelector('.toggle-track');

  const updateUI = (isDark) => {
    btn.setAttribute('aria-pressed', isDark.toString());
    if (isDark) {
      sunIcon.style.transform = 'rotate(90deg) scale(0)';
      sunIcon.style.opacity = '0';
      moonIcon.style.transform = 'rotate(0deg) scale(1)';
      moonIcon.style.opacity = '1';
      thumb.style.transform = 'translateX(28px)';
      track.style.background = 'rgba(16, 185, 129, 0.2)';
    } else {
      sunIcon.style.transform = 'rotate(0deg) scale(1)';
      sunIcon.style.opacity = '1';
      moonIcon.style.transform = 'rotate(-90deg) scale(0)';
      moonIcon.style.opacity = '0';
      thumb.style.transform = 'translateX(0)';
      track.style.background = 'rgba(255, 255, 255, 0.08)';
    }
  };

  const applyTheme = (theme) => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
    updateUI(theme === 'dark');
  };

  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme ?? (prefersDark ? 'dark' : 'light');
  applyTheme(initialTheme);

  btn.addEventListener('click', () => {
    const current = document.documentElement.dataset.theme;
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
})();