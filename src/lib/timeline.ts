import gsap from 'gsap';
import { jalaliDate } from './jalali';
import { MEHRDAD_MOODS, SOGOL_MOODS, findMood, AUTHOR_LABEL } from './moods';
import type { Memory } from './types';
import { refresh } from './store';

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[c] as string,
  );
}

function cardHTML(m: Memory): string {
  const jd = jalaliDate(m.createdAt);
  const mm = findMood(MEHRDAD_MOODS, m.mehrdadMood);
  const sm = findMood(SOGOL_MOODS, m.sogolMood);
  const song = m.song
    ? `<div class="mt-2 inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1 text-xs text-ink-soft"><span>🎵</span><span>${escapeHtml(
        m.song,
      )}</span></div>`
    : '';
  return `
  <article class="memory-card relative rounded-3xl glass p-4 shadow-[var(--shadow-card)]" data-id="${m.id}">
    <div class="flex items-center justify-between gap-2">
      <span class="rounded-full bg-surface-2 px-3 py-1 text-xs text-ink-soft">${jd.date} · ${jd.time}</span>
      <span class="text-[11px] text-ink-soft">ثبت توسط ${AUTHOR_LABEL[m.author] ?? m.author}</span>
    </div>
    <h3 class="mt-3 text-base font-bold text-ink">${escapeHtml(m.title)}</h3>
    <p class="mt-1 text-sm leading-relaxed text-ink-soft">${escapeHtml(m.description)}</p>
    ${song}
    <div class="mt-3 flex flex-wrap gap-2">
      <span class="inline-flex items-center gap-1.5 rounded-2xl border border-line bg-surface-2 px-3 py-1.5 text-xs">
        <span class="opacity-70">مهرداد</span><span>${mm ? mm.emoji : ''}</span><span class="text-ink">${
          mm ? mm.label : ''
        }</span>
      </span>
      <span class="inline-flex items-center gap-1.5 rounded-2xl border border-line bg-surface-2 px-3 py-1.5 text-xs">
        <span class="opacity-70">سوگل</span><span>${sm ? sm.emoji : ''}</span><span class="text-ink">${
          sm ? sm.label : ''
        }</span>
      </span>
    </div>
  </article>`;
}

export function initTimeline(): void {
  const list = document.getElementById('timeline-list');
  if (!list) return;
  const empty = document.getElementById('timeline-empty');

  function render(memories: Memory[]): void {
    const sorted = [...memories].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    list.innerHTML = sorted.map(cardHTML).join('');
    if (empty) empty.classList.toggle('hidden', sorted.length > 0);
    gsap.fromTo(
      '.memory-card',
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out' },
    );
  }

  window.addEventListener('memories:updated', (e: Event) => {
    render((e as CustomEvent<Memory[]>).detail || []);
  });

  refresh();
}
