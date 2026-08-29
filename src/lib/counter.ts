import gsap from 'gsap';

const MILESTONE = new Date('2026-08-23T00:00:00').getTime();
const PERSIAN = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const toP = (n: number | string): string =>
  String(n).replace(/[0-9]/g, (d) => PERSIAN[+d]);

export function initLiveCounter(): void {
  const root = document.getElementById('live-counter');
  if (!root) return;
  const els = {
    days: root.querySelector('[data-days]') as HTMLElement | null,
    hours: root.querySelector('[data-hours]') as HTMLElement | null,
    minutes: root.querySelector('[data-minutes]') as HTMLElement | null,
    seconds: root.querySelector('[data-seconds]') as HTMLElement | null,
  };

  function tick(prev: Record<string, string>, cur: Record<string, string>): void {
    (Object.keys(els) as (keyof typeof els)[]).forEach((k) => {
      const el = els[k];
      if (el && prev[k] !== cur[k]) {
        el.textContent = cur[k];
        gsap.fromTo(
          el,
          { y: -14, opacity: 0.2 },
          { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out' },
        );
      }
    });
  }

  let prev: Record<string, string> = {
    days: '',
    hours: '',
    minutes: '',
    seconds: '',
  };

  function update(): void {
    const diff = Math.max(0, Date.now() - MILESTONE);
    const s = Math.floor(diff / 1000);
    const days = Math.floor(s / 86400);
    const hours = Math.floor((s % 86400) / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const seconds = s % 60;
    const cur = {
      days: toP(days),
      hours: toP(String(hours).padStart(2, '0')),
      minutes: toP(String(minutes).padStart(2, '0')),
      seconds: toP(String(seconds).padStart(2, '0')),
    };
    tick(prev, cur);
    prev = cur;
  }

  update();
  setInterval(update, 1000);
}
