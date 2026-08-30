document.addEventListener('DOMContentLoaded', function () {
  var LS_KEY = 'ss-memories';
  var CORRECT_PIN = '1234';

  function getMemories() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch (e) { return []; }
  }
  function saveMemories(arr) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(arr)); } catch (e) { }
  }
  function genId() { return 'm_' + Math.floor(Math.random() * 1000000); }
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  function showToast(msg) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(function () { t.classList.remove('show'); }, 2500);
  }

  // === RENDER CARDS ===
  function renderCards() {
    var list = document.getElementById('timeline-list');
    var empty = document.getElementById('timeline-empty');
    if (!list) return;
    list.innerHTML = '';
    var memories = getMemories();
    if (!memories || memories.length === 0) {
      if (empty) empty.style.display = '';
      return;
    }
    if (empty) empty.style.display = 'none';
    memories.sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });

    memories.forEach(function (m) {
      var isMehrdad = m.author === 'mehrdad';
      var accent = isMehrdad ? 'emerald' : 'purple';
      var accentBg = isMehrdad ? 'bg-emerald-500' : 'bg-purple-500';
      var accentText = isMehrdad ? 'text-emerald-400' : 'text-purple-400';

      // Song HTML
      var songHtml = '';
      if (m.song) {
        songHtml = '<div class="mt-2 pt-2 border-t border-white/[0.04]">' +
          '<div class="flex items-center gap-2 text-xs text-white/40">' +
          '<span class="w-2 h-2 rounded-full bg-emerald-500/60 animate-bounce"></span>' +
          '<span>' + esc(m.song) + '</span>' +
          '</div>' +
          '</div>';
      }

      // Mood pills
      var pills = '';
      if (m.mehrdadMood) pills += '<span class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-medium bg-emerald-600/10 border border-emerald-600/20 text-emerald-400 hover:bg-emerald-600/20 mr-1.5">' + esc(m.mehrdadMood) + '</span>';
      if (m.sogolMood) pills += '<span class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-medium bg-purple-600/10 border border-purple-600/20 text-purple-400 hover:bg-purple-600/20 mr-1.5">' + esc(m.sogolMood) + '</span>';
      if (pills) pills = '<div class="flex flex-wrap gap-1 mt-2">' + pills + '</div>';

      var card = document.createElement('div');
      card.className = 'memory-card relative rounded-2xl border border-white/[0.05] bg-white/[0.03] backdrop-blur-xl p-5 shadow-lg shadow-black/10 group';
      card.setAttribute('data-id', m.id);

      // Determine delete button visibility based on card state
      var deleteBtn = '';
      if (m.id) {
        deleteBtn = '<button type="button" class="absolute top-2 right-2 text-white/20 hover:text-red-400 transition-colors duration-200 hover:bg-red-400/10 rounded-full p-1 group-hover:scale-110" aria-label="حذف خاطره" onclick="event.stopPropagation(); deleteMemory(\'' + m.id + '\')">×</button>';
      }

      card.innerHTML =
        '<div class="relative">' +
          deleteBtn +
          '<div class="flex items-start gap-3" style="min-height: 80px;">' +
            '<div class="memory-dot absolute right-2 top-2 w-5 h-5 rounded-full ' + accentBg + ' opacity-80 group-hover:opacity-100 transition-opacity duration-200"></div>' +
            '<div class="flex-1 min-w-0">' +
              '<h3 class="text-[14px] font-semibold text-white/90 group-hover:text-' + accent + '-400 transition-colors duration-200 mb-1.5 leading-tight">' + esc(m.title) + '</h3>' +
              (m.description ? '<p class="text-[12px] text-white/40 line-clamp-2 mb-2 leading-relaxed">' + esc(m.description) + '</p>' : '') +
              '<div class="flex items-center gap-2 text-xs text-white/50">' +
                '<span class="flex-1 truncate">' + formatDateRU(m.createdAt) + '</span>' +
                (m.mehrdadMood || m.sogolMood ? '<span class="flex gap-1">' + pills + '</span>' : '') +
              '</div>' +
            '</div>' +
          '</div>' +
          (m.song ? songHtml : '') +
        '</div>';

      list.appendChild(card);
    });
  }

  function formatDateRU(dateStr) {
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) d = new Date();
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  }

  function deleteMemory(id) {
    var card = document.querySelector('[data-id="' + id + '"]');
    if (!card) return;
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'all 0.3s ease';
    setTimeout(function () {
      card.remove();
      var memories = getMemories().filter(function (m) { return m.id !== id; });
      saveMemories(memories);
      fetch('/api/memories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id })
      }).catch(function () { });
      var ms = getMemories();
      if (ms.length === 0) renderCards();
      showToast('\u062E\u0627\u0637\u0631\u0647 \u062D\u0630\u0641 \u0634\u062f');
    }, 300);
  }

  // === SHOW APP ===
  function showApp() {
    var el = document.getElementById('app-content');
    if (!el) return;
    el.style.opacity = '1';
    el.style.pointerEvents = 'auto';
    renderCards();
  }

  // === PIN ===
  var pinLock = document.getElementById('pin-lock');
  var pinDots = document.querySelectorAll('.pin-dot');
  var pinKeys = document.querySelectorAll('.pin-key');
  var pinError = document.getElementById('pin-error');
  var pinEntered = '';

  function updatePinDots() {
    pinDots.forEach(function (dot, i) {
      if (i < pinEntered.length) {
        dot.style.backgroundColor = '#10b981';
        dot.style.borderColor = '#10b981';
      } else {
        dot.style.backgroundColor = 'transparent';
        dot.style.borderColor = '';
      }
    });
  }

  function unlockPin() {
    sessionStorage.setItem('ss-auth', '1');
    pinLock.style.transition = 'opacity 0.3s ease';
    pinLock.style.opacity = '0';
    setTimeout(function () {
      pinLock.style.display = 'none';
      showApp();
    }, 300);
  }

  pinKeys.forEach(function (key) {
    key.addEventListener('click', function () {
      var digit = this.getAttribute('data-digit');
      var action = this.getAttribute('data-action');
      if (action === 'delete') {
        if (pinEntered.length > 0) {
          pinEntered = pinEntered.slice(0, -1);
          updatePinDots();
        }
        return;
      }
      if (!digit || pinEntered.length >= 4) return;
      pinEntered += digit;
      updatePinDots();
      if (pinEntered.length === 4) {
        setTimeout(function () {
          if (pinEntered === CORRECT_PIN) unlockPin();
          else { pinLock.style.animation = 'shake 0.4s ease'; setTimeout(function() { pinLock.style.animation = ''; }, 400); }
        }, 150);
      }
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key >= '0' && e.key <= '9') {
      var btn = document.querySelector('.pin-key[data-digit="' + e.key + '"]');
      if (btn) btn.click();
    } else if (e.key === 'Backspace') {
      var del = document.querySelector('.pin-key[data-action="delete"]');
      if (del) del.click();
    }
  });

  // === DRAWER ===
  var fab = document.getElementById('fab-add');
  var drawer = document.getElementById('memory-drawer');
  var overlay = document.getElementById('drawer-overlay');
  var closeBtn = document.getElementById('drawer-close');

  function openDrawer() {
    drawer.style.transform = 'translateY(0)';
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'auto';
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    drawer.style.transform = 'translateY(100%)';
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    document.body.style.overflow = '';
  }

  if (fab) fab.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);

  // === FORM ===
  var form = document.getElementById('memory-form');
  var selM = '';
  var selS = '';

  function resetFormDefaults() {
    var now = new Date();
    var di = form.querySelector('[name="date"]');
    var ti = form.querySelector('[name="time"]');
    if (di) di.value = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
    if (ti) ti.value = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  }
  resetFormDefaults();

  document.querySelectorAll('[data-mood]').forEach(function (chip) {
    chip.addEventListener('click', function (e) {
      e.preventDefault();
      var type = this.getAttribute('data-mood');
      var val = this.getAttribute('data-value');
      this.parentElement.querySelectorAll('[data-mood]').forEach(function (s) { s.classList.remove('active'); });
      if (type === 'mehrdad') { selM = selM === val ? '' : val; if (selM) this.classList.add('active'); }
      else { selS = selS === val ? '' : val; if (selS) this.classList.add('active'); }
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var fd = new FormData(form);
    var title = String(fd.get('title') || '').trim();
    if (!title) title = '\u062E\u0627\u0637\u0631\u0647 \u062C\u062F\u06CC\u062F';
    var desc = String(fd.get('description') || '').trim();
    var author = fd.get('author') || 'mehrdad';
    var song = String(fd.get('song') || '').trim() || null;

    var dv = fd.get('date');
    var tv = fd.get('time');
    var md;
    try {
      if (dv && tv) md = new Date(dv + 'T' + tv + ':00');
      else if (dv) md = new Date(dv + 'T12:00:00');
      else md = new Date();
      if (isNaN(md.getTime())) md = new Date();
    } catch (x) { md = new Date(); }

    var payload = {
      id: genId(),
      title: title.slice(0, 120),
      description: desc.slice(0, 1000),
      author: author,
      date: md.toISOString(),
      createdAt: new Date().toISOString(),
      song: song,
      mehrdadMood: selM || null,
      sogolMood: selS || null
    };

    var memories = getMemories();
    memories.push(payload);
    saveMemories(memories);

    fetch('/api/memories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(function () { });

    closeDrawer();
    form.reset();
    selM = '';
    selS = '';
    document.querySelectorAll('.chip.active').forEach(function (c) { c.classList.remove('active'); });
    resetFormDefaults();
    renderCards();
    showToast('\u062E\u0627\u0637\u0631\u0647 \u062B\u0628\u062a \u0634\u062f');
  });

  // === SWIPE ===
  var handle = document.getElementById('drawer-handle');
  if (handle) {
    var startY = 0;
    handle.addEventListener('touchstart', function (e) { startY = e.touches[0].clientY; }, { passive: true });
    handle.addEventListener('touchmove', function (e) {
      if (e.touches[0].clientY - startY > 80) closeDrawer();
    }, { passive: true });
  }

  // === AUTH CHECK ===
  if (sessionStorage.getItem('ss-auth') === '1') {
    pinLock.style.display = 'none';
    showApp();
  }
});