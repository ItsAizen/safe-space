// Main App Logic
(() => {
  const appContent = document.getElementById('app-content');
  const timelineContainer = document.getElementById('timeline-container');
  const addMemoryBtn = document.getElementById('add-memory-btn');
  const fabBtn = document.getElementById('fab-add-memory');

  let memories = [];

  const renderTimeline = () => {
    if (!timelineContainer) return;
    timelineContainer.innerHTML = '';

    fetch('/api/memories')
      .then(r => r.json())
      .then(data => {
        memories = data;
        renderMemories(data);
      })
      .catch(err => {
        console.error('Failed to load memories:', err);
        renderMemories([]);
      });
  };

  const escapeHtml = (str) => {
    return str.replace(/[&<>"']/g, c => ({ '&': '&', '<': '<', '>': '>', '"': '"', "'": ''' }[c]));
  };

  const renderMemories = (data) => {
    if (!timelineContainer) return;

    if (data.length === 0) {
      timelineContainer.innerHTML = `
        <div class="glass-lg p-12 rounded-2xl text-center relative" role="status">
          <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--color-accent)]/10 flex items-center justify-center">
            <svg class="w-8 h-8 text-[var(--color-accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <h3 class="text-heading font-semibold text-[var(--color-text)]">هنوز خاطره‌ای ثبت نشده</h3>
          <p class="mt-2 text-body text-[var(--color-text-muted)]">اولین خاطره مشترک‌تان را بسازید</p>
        </div>
      `;
      return;
    }

    timelineContainer.innerHTML = data.map((memory, index) => `
      <article class="timeline-card glass-lg rounded-2xl overflow-hidden relative group animate-fade-in" style="animation-delay: ${index * 80}ms" data-id="${memory.id}" role="listitem">
        <div class="absolute inset-y-0 right-6 w-0.5 bg-gradient-to-b from-transparent via-[var(--color-border)] to-transparent" aria-hidden="true">
          ${index === data.length - 1 ? '<div class="absolute bottom-0 right-[-3px] w-7 h-7 rounded-full bg-[var(--color-accent)] border-2 border-[var(--color-bg-elevated)] shadow-[0_0_12px_rgba(16,185,129,0.4)]" aria-hidden="true"></div>' : ''}
        </div>
        <div class="relative p-5 pr-14">
          <header class="flex items-center justify-between gap-3 mb-4">
            <div class="flex items-center gap-2.5">
              <time class="text-micro font-medium text-[var(--color-accent)] px-2.5 py-1 rounded-full glass border border-[var(--color-border)] whitespace-nowrap" datetime="${memory.date}">
                ${memory.time} - ${memory.date}
              </time>
              <span class="text-micro font-medium px-2.5 py-1 rounded-full glass border border-[var(--color-border)] text-[var(--color-text-muted)] whitespace-nowrap">
                ثبت توسط ${memory.author === 'mehrdad' ? 'مهرداد' : 'سوگل'}
              </span>
            </div>
            <button type="button" class="btn btn-ghost p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity focus-ring delete-btn" data-delete="${memory.id}" aria-label="حذف خاطره: ${escapeHtml(memory.title)}">
              <svg class="w-5 h-5 text-[var(--color-text-subtle)] hover:text-red-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </header>
          <h3 class="text-heading font-semibold text-[var(--color-text)] mb-2">${escapeHtml(memory.title)}</h3>
          <p class="text-body text-[var(--color-text-muted)] mb-4 leading-relaxed">${escapeHtml(memory.description)}</p>
          ${memory.song ? `
            <div class="flex items-center gap-2 text-body-sm text-[var(--color-text-muted)] mb-4">
              <span class="flex items-center gap-1.5">
                <svg class="w-4 h-4 text-[var(--color-accent)] animate-pulse-glow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M9 18V5l12-2v13"></path>
                  <circle cx="6" cy="18" r="3"></circle>
                  <circle cx="18" cy="16" r="3"></circle>
                </svg>
                <span>${escapeHtml(memory.song)}</span>
              </span>
            </div>
          ` : ''}
          <div class="flex flex-wrap items-center gap-2">
            <span class="mood-badge glass px-3 py-1.5 rounded-full border border-[var(--color-border)] flex items-center gap-1.5">
              <span class="text-body-sm" aria-hidden="true">😎</span>
              <span class="text-body-sm font-medium text-[var(--color-text)]">مهرداد: ${escapeHtml(memory.moodMehrdad)}</span>
            </span>
            <span class="mood-badge glass px-3 py-1.5 rounded-full border border-[var(--color-border)] flex items-center gap-1.5">
              <span class="text-body-sm" aria-hidden="true">🐺</span>
              <span class="text-body-sm font-medium text-[var(--color-text)]">سوگل: ${escapeHtml(memory.moodSogol)}</span>
            </span>
          </div>
        </div>
      </article>
    `).join('');

    timelineContainer.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', handleDelete);
    });
  };

  const handleDelete = async (e) => {
    const btn = e.currentTarget;
    const id = btn.dataset.delete;
    if (!id) return;

    if (!confirm('آیا مطمئنید می‌خواهید این خاطره حذف شود؟')) return;

    try {
      const res = await fetch(`/api/memories?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        renderTimeline();
      } else {
        alert('خطا در حذف خاطره');
      }
    } catch {
      alert('خطا در ارتباط با سرور');
    }
  };

  const openModal = () => {
    const openFn = window.openAddMemoryModal;
    if (openFn) {
      openFn(async (formData) => {
        try {
          const res = await fetch('/api/memories', {
            method: 'POST',
            body: formData,
          });
          if (res.ok) {
            renderTimeline();
          } else {
            alert('خطا در ذخیره خاطره');
          }
        } catch {
          alert('خطا در ارتباط با سرور');
        }
      });
    }
  };

  addMemoryBtn?.addEventListener('click', openModal);
  fabBtn?.addEventListener('click', openModal);

  // Auto-render timeline on load (no PIN lock)
  if (appContent) appContent.hidden = false;
  renderTimeline();

  document.addEventListener('memory-delete', (e) => {
    const id = e.detail?.id;
    if (id) {
      fetch(`/api/memories?id=${id}`, { method: 'DELETE' })
        .then(() => renderTimeline())
        .catch(() => alert('خطا در حذف'));
    }
  });
})();