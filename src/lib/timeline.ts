import gsap from 'gsap';
import { jalaliDate } from './jalali';
import { MEHRDAD_MOODS, SOGOL_MOODS, findMood, AUTHOR_LABEL, type Mood } from './moods';
import type { Memory } from './types';
import { refresh, deleteMemory } from './store';

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

function moodPill(name: string, m?: Mood): string {
  if (!m) return '';
  return `<span class="pill"><span class="opacity-60">${name}</span><span>${m.emoji}</span><span class="text-ink">${m.label}</span></span>`;
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
  <article class="memory-card glass p-5" data-id="${m.id}">
    <button class="del-btn" aria-label="حذف" data-act="open">
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke-linecap="round" stroke-linejoin="round"></path>
        <path d="M10 11v6M14 11v6" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
    </button>
    <div class="del-pop" data-id="${m.id}">
      <span class="text-[11px] text-ink-soft">حذف شود؟</span>
      <button class="btn-danger" data-act="confirm">حذف</button>
      <button class="btn-ghost" data-act="cancel">لغو</button>
    </div>

    <div class="flex items-center justify-end pr-9">
      <span class="pill">${jd.date} · ${jd.time}</span>
    </div>

    <h3 class="mt-3 text-base font-bold text-ink">${escapeHtml(m.title)}</h3>
    <p class="mt-1 text-sm leading-relaxed text-ink-soft">${escapeHtml(m.description)}</p>
    ${song}

    <div class="mt-3 flex flex-wrap gap-2">
      ${moodPill('مهرداد', mm)}
      ${moodPill('سوگل', sm)}
    </div>

    <div class="mt-3 flex items-center justify-start">
      <span class="meta-tag">ثبت توسط ${AUTHOR_LABEL[m.author] ?? m.author}</span>
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
      { y: 26, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.55, stagger: 0.08, ease: 'power3.out' },
    );
  }

  list.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const card = target.closest('.memory-card') as HTMLElement | null;
    if (!card) return;
    const id = card.dataset.id;
    const pop = card.querySelector('.del-pop') as HTMLElement | null;

    const open = target.closest('[data-act="open"]');
    const confirmBtn = target.closest('[data-act="confirm"]');
    const cancelBtn = target.closest('[data-act="cancel"]');

    if (open && id && pop) {
      list.querySelectorAll('.del-pop.open').forEach((p) => {
        if (p !== pop) p.classList.remove('open');
      });
      pop.classList.add('open');
      gsap.fromTo(pop, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.25, ease: 'back.out(2)' });
      return;
    }
    if (cancelBtn && pop) {
      pop.classList.remove('open');
      return;
    }
    if (confirmBtn && id) {
      pop?.classList.remove('open');
      gsap.to(card, {
        opacity: 0,
        y: -18,
        scale: 0.97,
        duration: 0.35,
        ease: 'power2.in',
        onComplete: () => deleteMemory(id),
      });
    }
  });

  window.addEventListener('memories:updated', (e: Event) => {
    render((e as CustomEvent<Memory[]>).detail || []);
  });

  refresh();
}
