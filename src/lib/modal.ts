import gsap from 'gsap';
import { MEHRDAD_MOODS, SOGOL_MOODS } from './moods';
import { jalaliDate } from './jalali';
import { createMemory } from './store';
import type { Memory } from './types';

function moodChips(list: typeof MEHRDAD_MOODS, name: string, selected: string): string {
  return list
    .map(
      (m) => `
    <button type="button" class="mood-chip rounded-2xl border border-line px-3 py-2 text-xs transition ${
      m.key === selected ? 'mood-chip-active' : 'opacity-70'
    }" data-mood="${m.key}" data-group="${name}">
      <span class="ms-1">${m.emoji}</span>${m.label}
    </button>`,
    )
    .join('');
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function initAddModal(): void {
  const fab = document.getElementById('fab');
  const drawer = document.getElementById('add-drawer');
  const backdrop = document.getElementById('add-backdrop');
  const form = document.getElementById('add-form') as HTMLFormElement | null;
  const dateInput = form?.querySelector('input[name="date"]') as HTMLInputElement | null;
  const timeInput = form?.querySelector('input[name="time"]') as HTMLInputElement | null;
  const preview = document.getElementById('date-preview');
  if (!fab || !drawer) return;

  const state = { mehrdad: 'relax', sogol: 'wolf', author: 'mehrdad' };

  function bindChips(): void {
    drawer.querySelectorAll('.mood-chip').forEach((node) => {
      const b = node as HTMLElement;
      b.addEventListener('click', () => {
        const group = b.dataset.group as 'mehrdad' | 'sogol';
        state[group] = b.dataset.mood as string;
        renderChips();
        gsap.fromTo(b, { scale: 0.9 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
      });
    });
  }

  function renderChips(): void {
    const m = document.getElementById('mehrdad-moods');
    const s = document.getElementById('sogol-moods');
    if (m) m.innerHTML = moodChips(MEHRDAD_MOODS, 'mehrdad', state.mehrdad);
    if (s) s.innerHTML = moodChips(SOGOL_MOODS, 'sogol', state.sogol);
    bindChips();
  }

  function updatePreview(): void {
    if (!preview || !dateInput || !timeInput) return;
    const date = dateInput.value || '';
    const time = timeInput.value || '00:00';
    let iso: string;
    if (date) {
      iso = new Date(`${date}T${time}:00`).toISOString();
    } else {
      iso = new Date().toISOString();
    }
    const jd = jalaliDate(iso);
    preview.textContent = `تاریخ انتخابی: ${jd.date} · ${jd.time}`;
  }

  function seedDateTime(): void {
    if (!dateInput || !timeInput) return;
    const d = new Date();
    dateInput.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    timeInput.value = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    updatePreview();
  }

  function open(): void {
    drawer.classList.remove('hidden');
    seedDateTime();
    requestAnimationFrame(() => {
      if (backdrop) gsap.to(backdrop, { opacity: 1, duration: 0.3 });
      gsap.fromTo(drawer, { y: '100%' }, { y: 0, duration: 0.5, ease: 'power3.out' });
    });
  }

  function close(): void {
    if (backdrop) gsap.to(backdrop, { opacity: 0, duration: 0.25 });
    gsap.to(drawer, {
      y: '100%',
      duration: 0.4,
      ease: 'power3.in',
      onComplete: () => drawer.classList.add('hidden'),
    });
  }

  fab.addEventListener('click', () => {
    gsap.fromTo(fab, { scale: 0.9 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
    open();
  });
  backdrop?.addEventListener('click', close);
  document.getElementById('add-cancel')?.addEventListener('click', close);

  dateInput?.addEventListener('input', updatePreview);
  timeInput?.addEventListener('input', updatePreview);

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const date = String(data.get('date') || '');
    const time = String(data.get('time') || '');
    let createdAt: string | undefined;
    if (date) {
      createdAt = new Date(`${date}T${time || '00:00'}:00`).toISOString();
    }
    const memory: Omit<Memory, 'id' | 'createdAt'> & { createdAt?: string } = {
      title: String(data.get('title') || '').trim(),
      description: String(data.get('description') || '').trim(),
      song: String(data.get('song') || '').trim() || undefined,
      mehrdadMood: state.mehrdad,
      sogolMood: state.sogol,
      author: state.author as 'mehrdad' | 'sogol',
      createdAt,
    };
    if (!memory.title || !memory.description) {
      gsap.fromTo(form, { x: -8 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' });
      return;
    }
    const btn = form.querySelector('button[type="submit"]') as HTMLButtonElement | null;
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'در حال ثبت…';
    }
    await createMemory(memory);
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'ثبت خاطره';
    }
    form.reset();
    close();
  });

  drawer.querySelectorAll('input[name="author"]').forEach((node) => {
    node.addEventListener('change', (e) => {
      state.author = (e.target as HTMLInputElement).value as 'mehrdad' | 'sogol';
    });
  });

  renderChips();
}
