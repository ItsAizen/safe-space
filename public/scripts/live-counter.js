// Live Counter Logic
(() => {
  const MILESTONE = new Date('2026-08-23T00:00:00+03:30').getTime();

  const values = {
    days: document.querySelector('[data-unit="days"] .counter-value'),
    hours: document.querySelector('[data-unit="hours"] .counter-value'),
    minutes: document.querySelector('[data-unit="minutes"] .counter-value'),
    seconds: document.querySelector('[data-unit="seconds"] .counter-value'),
  };

  const pad = (n, len = 2) => String(n).padStart(len, '0');

  const update = () => {
    const now = Date.now();
    const diff = now - MILESTONE;
    if (diff < 0) return;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (values.days) values.days.textContent = pad(days, 1);
    if (values.hours) values.hours.textContent = pad(hours);
    if (values.minutes) values.minutes.textContent = pad(minutes);
    if (values.seconds) values.seconds.textContent = pad(seconds);

    [values.days, values.hours, values.minutes, values.seconds].forEach(el => {
      if (el) el.classList.add('animate-scale-in');
      setTimeout(() => el?.classList.remove('animate-scale-in'), 200);
    });
  };

  update();
  let interval = setInterval(update, 1000);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearInterval(interval);
    else interval = setInterval(update, 1000);
  });
})();