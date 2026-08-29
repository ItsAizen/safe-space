import gsap from 'gsap';

export function initParticles(): void {
  const root = document.getElementById('ambient');
  if (!root) return;
  const count = 14;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('span');
    p.className = 'ambient-dot';
    root.appendChild(p);
    const size = gsap.utils.random(3, 9);
    gsap.set(p, {
      width: size,
      height: size,
      xPercent: -50,
      yPercent: -50,
      left: gsap.utils.random(0, 100) + '%',
      top: gsap.utils.random(0, 100) + '%',
      opacity: gsap.utils.random(0.15, 0.5),
    });
    gsap.to(p, {
      top: '-10%',
      left: '+=' + gsap.utils.random(-10, 10) + '%',
      opacity: 0,
      duration: gsap.utils.random(7, 13),
      repeat: -1,
      delay: gsap.utils.random(0, 6),
      ease: 'sine.inOut',
      onRepeat() {
        gsap.set(p, {
          top: gsap.utils.random(85, 110) + '%',
          left: gsap.utils.random(0, 100) + '%',
          opacity: gsap.utils.random(0.15, 0.5),
        });
      },
    });
  }
}
