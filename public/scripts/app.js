document.addEventListener('DOMContentLoaded', function () {
  var LS_KEY = 'ss-memories';
  var CORRECT_PIN = '1234';

  function getMemories() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch (e) { return []; }
  }
  function saveMemories(arr) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(arr)); } catch (e) { }
  }
  function genId() {
    return 'm_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }
  function esc(s) {
    var d = document.createElement('div'); d.textContent = s; return d.innerHTML;
  }

  function toJalali(dateStr) {
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) d = new Date();
    var gy = d.getFullYear(), gm = d.getMonth() + 1, gd = d.getDate();
    var g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    var gy2 = gm > 2 ? gy + 1 : gy;
    var days = 355666 + 365 * gy + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) + gd + g_d_m[gm - 1];
    var jy = -1595 + 33 * Math.floor(days / 12053); days %= 12053;
    jy += 4 * Math.floor(days / 1461); days %= 1461;
    if (days > 365) { jy += Math.floor((days - 1) / 365); days = (days - 1) % 365; }
    var jm, jd;
    if (days < 186) { jm = 1 + Math.floor(days / 31); jd = 1 + days % 31; }
    else { jm = 7 + Math.floor((days - 186) / 30); jd = 1 + (days - 186) % 30; }
    var p = function (n) { return String(n).replace(/\d/g, function (d) { return '\u06F0\u06F1\u06F2\u06F3\u06F4\u06F5\u06F6\u06F7\u06F8\u06F9'[d]; }); };
    return p(jy) + '/' + p(String(jm).padStart(2, '0')) + '/' + p(String(jd).padStart(2, '0'));
  }

  function formatTime(dateStr) {
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) d = new Date();
    var p = function (n) { return String(n).replace(/\d/g, function (d) { return '\u06F0\u06F1\u06F2\u06F3\u06F4\u06F5\u06F6\u06F7\u06F8\u06F9'[d]; }); };
    return p(d.getHours().toString().padStart(2, '0')) + ':' + p(d.getMinutes().toString().padStart(2, '0'));
  }

  function showToast(msg) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(function () { t.classList.remove('show'); }, 2500);
  }

  // === RENDER ===
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
      var authorLabel = isMehrdad ? '\u0645\u0647\u0631\u062F\u0627\u062F' : '\u0633\u0648\u06AF\u0644';
      var authorDotColor = isMehrdad ? 'bg-emerald-400' : 'bg-purple-400';
      var authorTextColor = isMehrdad ? 'text-emerald-400/70' : 'text-purple-400/70';

      var songHtml = '';
      if (m.song) {
        songHtml = '<div class="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5" style="background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.12);">' +
          '<div class="audio-wave"><span></span><span></span><span></span><span></span><span></span></div>' +
          '<span class="text-xs" style="color:rgba(16,185,129,0.7);">' + esc(m.song) + '</span></div>';
      }

      var moodHtml = '';
      var pills = '';
      if (m.mehrdadMood) pills += '<span class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium" style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.15);color:rgba(16,185,129,0.8);">' + esc(m.mehrdadMood) + ' \u0645\u0647\u0631\u062F\u0627\u062F</span>';
      if (m.sogolMood) pills += '<span class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium" style="background:rgba(168,85,247,0.08);border:1px solid rgba(168,85,247,0.15);color:rgba(168,85,247,0.8);">' + esc(m.sogolMood) + ' \u0633\u0648\u06AF\u0644</span>';
      if (pills) moodHtml = '<div class="flex flex-wrap gap-2 mt-3">' + pills + '</div>';

      var card = document.createElement('div');
      card.className = 'timeline-card';
      card.setAttribute('data-id', m.id);

      card.innerHTML =
        '<div class="timeline-dot"></div>' +
        '<div class="glass-card p-5" style="margin-right:28px;">' +
          '<div class="flex items-center justify-between mb-3">' +
            '<div class="flex items-center gap-2">' +
              '<span class="w-1.5 h-1.5 rounded-full ' + authorDotColor + '"></span>' +
              '<span class="text-[10px] font-medium ' + authorTextColor + '">' + authorLabel + '</span>' +
            '</div>' +
            '<div class="flex items-center gap-2">' +
              '<span class="text-[10px] text-white/30 bg-white/[0.04] rounded-md px-2 py-0.5 tabular-nums">' + formatTime(m.createdAt) + '</span>' +
              '<span class="text-[10px] text-white/20 tabular-nums">' + toJalali(m.createdAt) + '</span>' +
            '</div>' +
          '</div>' +
          '<h3 class="text-[14px] font-bold text-white/90 leading-relaxed mb-1">' + esc(m.title) + '</h3>' +
          (m.description ? '<p class="text-[12px] text-white/45 leading-[1.8] mb-0">' + esc(m.description) + '</p>' : '') +
          songHtml +
          moodHtml +
          '<div class="flex justify-end mt-3">' +
            '<button type="button" data-delete-id="' + m.id + '" class="text-[10px] text-white/20 hover:text-red-400 transition-colors duration-200 px-2 py-1 rounded hover:bg-red-400/[0.06]">\u062D\u0630\u0641</button>' +
          '</div>' +
        '</div>';

      list.appendChild(card);
    });

    wireDeleteButtons();
  }

  function wireDeleteButtons() {
    document.querySelectorAll('[data-delete-id]').forEach(function (btn) {
      btn.onclick = function (e) {
        e.stopPropagation();
        var id = this.getAttribute('data-delete-id');
        var card = document.querySelector('[data-id="' + id + '"]');
        if (!card) return;
        card.style.opacity = '0';
        card.style.transform = 'translateX(-20px)';
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
          showToast('\u062E\u0627\u0637\u0631\u0647 \u062D\u0630\u0641 \u0634\u062F');
          if (memories.length === 0) renderCards();
        }, 300);
      };
    });
  }

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

  function shakePin() {
    pinError.style.opacity = '1';
    pinLock.style.animation = 'shakeX 0.4s ease';
    setTimeout(function () {
      pinEntered = '';
      updatePinDots();
      pinError.style.opacity = '0';
      pinLock.style.animation = '';
    }, 800);
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
          else shakePin();
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

  // Mood chips
  document.querySelectorAll('[data-mood]').forEach(function (chip) {
    chip.addEventListener('click', function (e) {
      e.preventDefault();
      var type = this.getAttribute('data-mood');
      var val = this.getAttribute('data-value');
      this.parentElement.querySelectorAll('[data-mood]').forEach(function (s) { s.classList.remove('active'); });
      if (type === 'mehrdad') {
        selM = selM === val ? '' : val;
        if (selM) this.classList.add('active');
      } else {
        selS = selS === val ? '' : val;
        if (selS) this.classList.add('active');
      }
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var fd = new FormData(form);
    var title = String(fd.get('title') || '').trim();
    if (!title) { title = '\u062E\u0627\u0637\u0631\u0647 \u062C\u062F\u06CC\u062F'; }
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
    document.querySelectorAll('[data-mood].active').forEach(function (c) { c.classList.remove('active'); });
    resetFormDefaults();
    renderCards();
    showToast('\u062E\u0627\u0637\u0631\u0647 \u062B\u0628\u062A \u0634\u062F');
  });

  // === SWIPE TO CLOSE ===
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
