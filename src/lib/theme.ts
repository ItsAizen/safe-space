import gsap from 'gsap';

function applyMeta(): void {
  const meta = document.querySelector('meta[name="theme-color"]');
  const light = document.documentElement.classList.contains('light');
  if (meta) meta.setAttribute('content', light ? '#f2ede4' : '#0b0d10');
}

export function initTheme(): void {
  const stored = localStorage.getItem('safe_space_theme');
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  const theme = stored || (prefersLight ? 'light' : 'dark');
  document.documentElement.classList.toggle('light', theme === 'light');
  document.documentElement.classList.toggle('dark', theme !== 'light');

  const sun = document.getElementById('icon-sun');
  const moon = document.getElementById('icon-moon');
  if (sun) sun.classList.toggle('hidden', theme !== 'light');
  if (moon) moon.classList.toggle('hidden', theme === 'light');
  applyMeta();

  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const nowLight = document.documentElement.classList.toggle('light');
    document.documentElement.classList.toggle('dark', !nowLight);
    localStorage.setItem('safe_space_theme', nowLight ? 'light' : 'dark');
    if (sun) sun.classList.toggle('hidden', !nowLight);
    if (moon) moon.classList.toggle('hidden', nowLight);
    applyMeta();
    gsap.fromTo(
      btn,
      { scale: 0.82, rotate: -45 },
      { scale: 1, rotate: 0, duration: 0.55, ease: 'elastic.out(1, 0.5)' },
    );
  });
}
