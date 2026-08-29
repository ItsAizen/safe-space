// Add Memory Modal Logic
const MEHRDAD_MOODS = [
  { value: 'ریلکس / خفن', label: 'ریلکس / خفن', emoji: '😎' },
  { value: 'خسته', label: 'خسته', emoji: '🫠' },
  { value: 'پشم‌ریزون', label: 'پشم‌ریزون', emoji: '🤯' },
  { value: 'چای به دست', label: 'چای به دست', emoji: '🍵' },
];

const SOGOL_MOODS = [
  { value: 'گرگی / مود', label: 'گرگی / مود', emoji: '🐺' },
  { value: 'مظلوم', label: 'مظلوم', emoji: '🥺' },
  { value: 'در حال پاره شدن', label: 'در حال پاره شدن', emoji: '😂' },
  { value: 'شکر‌لازم', label: 'شکر‌لازم', emoji: '🍧' },
];

(() => {
  const backdrop = document.getElementById('add-memory-modal');
  const drawer = backdrop.querySelector('.modal-drawer');
  const form = document.getElementById('memory-form');
  const closeBtn = document.getElementById('close-modal');
  const dateInput = document.getElementById('date');
  const timeInput = document.getElementById('time');
  const moodMehrdadGrid = document.getElementById('mood-mehrdad');
  const moodSogolGrid = document.getElementById('mood-sogol');
  const moodMehrdadInput = document.getElementById('mood-mehrdad-input');
  const moodSogolInput = document.getElementById('mood-sogol-input');

  let onSubmitCallback = null;

  const initMoodGrid = (grid, hiddenInput, defaultValue) => {
    const chips = grid.querySelectorAll('.mood-chip');
    chips.forEach(chip => {
      if (chip.dataset.mood === defaultValue) {
        chip.classList.add('selected');
        chip.setAttribute('aria-checked', 'true');
      }
      chip.addEventListener('click', () => {
        chips.forEach(c => {
          c.classList.remove('selected');
          c.setAttribute('aria-checked', 'false');
        });
        chip.classList.add('selected');
        chip.setAttribute('aria-checked', 'true');
        hiddenInput.value = chip.dataset.mood;
      });
    });
  };

  const open = (callback) => {
    onSubmitCallback = callback;
    resetForm();
    backdrop.classList.add('open');
    drawer.classList.add('open');
    document.body.style.overflow = 'hidden';
    dateInput.focus();
  };

  const close = () => {
    backdrop.classList.remove('open');
    drawer.classList.remove('open');
    document.body.style.overflow = '';
    onSubmitCallback = null;
  };

  const resetForm = () => {
    form.reset();
    const now = new Date();
    const jalali = toJalali(now);
    dateInput.value = jalali;
    timeInput.value = now.toTimeString().slice(0, 5);

    moodMehrdadInput.value = MEHRDAD_MOODS[0].value;
    moodSogolInput.value = SOGOL_MOODS[0].value;

    initMoodGrid(moodMehrdadGrid, moodMehrdadInput, MEHRDAD_MOODS[0].value);
    initMoodGrid(moodSogolGrid, moodSogolInput, SOGOL_MOODS[0].value);
  };

  const toJalali = (date) => {
    try {
      const jDate = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date);
      return jDate.replace(/\//g, '/');
    } catch {
      const year = date.getFullYear() - 621;
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}/${month}/${day}`;
    }
  };

  dateInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4) + '/' + value.slice(4);
    if (value.length > 7) value = value.slice(0, 7) + '/' + value.slice(7, 9);
    e.target.value = value.slice(0, 10);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    if (onSubmitCallback) onSubmitCallback(formData);
    close();
  });

  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.classList.contains('open')) close();
  });

  window.openAddMemoryModal = open;
})();