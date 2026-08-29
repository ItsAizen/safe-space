import gsap from 'gsap';

const PIN = '1234';
const SKEY = 'safe_space_auth';

export function initPinLock(): void {
  const lock = document.getElementById('pin-lock');
  const app = document.getElementById('app');
  if (!lock) return;
  const dots = lock.querySelectorAll('.pin-dot');
  const keys = lock.querySelectorAll('.pin-key');
  let entry = '';

  function reveal(): void {
    if (app) {
      app.classList.remove('hidden');
      gsap.from(app, { opacity: 0, y: 24, duration: 0.6, ease: 'power2.out' });
    }
    gsap.to(lock, {
      y: '-100%',
      opacity: 0,
      duration: 0.6,
      ease: 'power3.inOut',
      onComplete: () => lock.classList.add('hidden'),
    });
  }

  function setDots(): void {
    dots.forEach((d, i) => d.classList.toggle('pin-dot-filled', i < entry.length));
  }

  function verify(): void {
    if (entry === PIN) {
      sessionStorage.setItem(SKEY, '1');
      setTimeout(reveal, 180);
    } else {
      gsap.fromTo(
        lock,
        { x: -10 },
        { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.2)' },
      );
      setTimeout(() => {
        entry = '';
        setDots();
      }, 450);
    }
  }

  function push(v: string): void {
    if (entry.length < 4) {
      entry += v;
      setDots();
      if (entry.length === 4) verify();
    }
  }

  function del(): void {
    entry = entry.slice(0, -1);
    setDots();
  }

  keys.forEach((node) => {
    const k = node as HTMLElement;
    k.addEventListener('click', () => {
      const v = k.dataset.val;
      if (v === 'del') del();
      else if (v) push(v);
      gsap.fromTo(k, { scale: 0.9 }, { scale: 1, duration: 0.25, ease: 'back.out(2)' });
    });
  });

  if (sessionStorage.getItem(SKEY) === '1') {
    lock.classList.add('hidden');
    app?.classList.remove('hidden');
  }
}
