document.addEventListener('DOMContentLoaded', function () {
  var LS_KEY = 'ss-memories';
  var CORRECT_PIN = '1234';
  var FA = '\u06F0\u06F1\u06F2\u06F3\u06F4\u06F5\u06F6\u06F7\u06F8\u06F9';
  var trashSVG = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>';


  function getMemories() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch (e) { return []; }
  }
  function saveMemories(arr) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(arr)); } catch (e) { }
  }
  function genId() { return 'm_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function faNum(s) { return String(s).replace(/\d/g, function (d) { return FA.charAt(parseInt(d, 10)); }); }
  function pad2(n) { return ('0' + n).slice(-2); }

  function formatJalali(dateStr) {
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
    return faNum(jy) + '/' + faNum(pad2(jm)) + '/' + faNum(pad2(jd));
  }

  function formatCardDate(dateStr) {
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) d = new Date();
    return formatJalali(d) + '  \u2022  ' + faNum(pad2(d.getHours())) + ':' + faNum(pad2(d.getMinutes()));
  }

  function showToast(msg) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._hide);
    t._hide = setTimeout(function () { t.classList.remove('show'); }, 2500);
  }

  // === CARD BUILDER ===
  function songHTML(song) {
    return '<div class="memory-song"><div class="audio-wave"><span></span><span></span><span></span><span></span><span></span></div><span class="memory-song-name">' + esc(song) + '</span></div>';
  }

  function pillHTML(val, isMehrdad) {
    return '<span class="memory-tag ' + (isMehrdad ? 'memory-tag--m' : 'memory-tag--s') + '">' + esc(val) + '</span>';
  }

  function buildCard(m, idx) {
    var isM = m.author === 'mehrdad';
    var name = isM ? '\u0645\u0647\u0631\u062F\u0627\u062F' : '\u0633\u0648\u06AF\u0644';
    var initial = isM ? '\u0645' : '\u0633';
    var avatar = isM ? '#10b981,#059669' : '#a78bfa,#8b5cf6';
    var accent = isM ? '#34d399' : '#c4b5fd';

    var desc = m.description ? '<p class="memory-card-desc">' + esc(m.description) + '</p>' : '';

    var pills = '';
    if (m.mehrdadMood) pills += pillHTML(m.mehrdadMood, true);
    if (m.sogolMood) pills += pillHTML(m.sogolMood, false);
    var tagsHTML = pills ? '<div class="memory-card-tags">' + pills + '</div>' : '';

    var song = m.song ? songHTML(m.song) : '';

    var foot = (song || tagsHTML) ? '<footer class="memory-card-foot">' + song + tagsHTML + '</footer>' : '';

    return '<article class="memory-item" data-id="' + m.id + '" style="animation-delay:' + (idx * 50) + 'ms">' +
      '<span class="memory-item-dot" style="background:' + accent + ';box-shadow:0 0 0 3px rgba(0,0,0,0.06),0 0 14px ' + accent + '66"></span>' +
      '<div class="memory-card">' +
        '<header class="memory-card-head">' +
          '<span class="memory-card-avatar" style="background:linear-gradient(135deg,' + avatar + ')">' + initial + '</span>' +
          '<span class="memory-card-author" style="color:' + accent + '">' + name + '</span>' +
          '<span class="memory-card-spacer"></span>' +
          '<time class="memory-card-date">' + formatCardDate(m.date || m.createdAt) + '</time>' +
          '<button type="button" class="memory-card-del" data-del="' + m.id + '" aria-label="\u062D\u0630\u0641 \u062E\u0627\u0637\u0631\u0647">' + trashSVG + '</button>' +
        '</header>' +
        '<h3 class="memory-card-title">' + esc(m.title) + '</h3>' +
        desc +
        foot +
      '</div>' +
    '</article>';
  }

  function renderCards() {
    var list = document.getElementById('timeline-list');
    var empty = document.getElementById('timeline-empty');
    if (!list) return;
    var memories = getMemories();
    if (!memories || memories.length === 0) {
      list.innerHTML = '';
      if (empty) empty.style.display = '';
      return;
    }
    if (empty) empty.style.display = 'none';
    memories.sort(function (a, b) { return new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt); });
    var html = '';
    memories.forEach(function (m, i) { html += buildCard(m, i); });
    list.innerHTML = html;
    wireDelete(list);
  }

  function wireDelete(scope) {
    var list = scope || document.getElementById('timeline-list');
    list.querySelectorAll('[data-del]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        deleteMemory(this.getAttribute('data-del'));
      });
    });
  }

  function deleteMemory(id) {
    var card = document.querySelector('[data-id="' + id + '"]');
    if (!card) return;
    card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    card.style.opacity = '0';
    card.style.transform = 'translateY(12px)';
    setTimeout(function () {
      card.remove();
      var memories = getMemories().filter(function (m) { return m.id !== id; });
      saveMemories(memories);
      fetch('/api/memories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id })
      }).catch(function () { });
      if (memories.length === 0) renderCards();
      showToast('\u062E\u0627\u0637\u0631\u0647 \u062D\u0630\u0641 \u0634\u062F');
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
          if (pinEntered === CORRECT_PIN) {
            unlockPin();
          } else {
            pinLock.style.animation = 'shake 0.4s ease';
            pinError.style.opacity = '1';
            setTimeout(function () {
              pinLock.style.animation = '';
              pinError.style.opacity = '0';
              pinEntered = '';
              updatePinDots();
            }, 800);
          }
        }, 150);
      }
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key >= '0' && e.key <= '9') {
      var btn = document.querySelector('.pin-key[data-digit="' + e.key + '"]');
      if (btn) btn.click();
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
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
    var input = drawer.querySelector('[name="title"]');
    if (input) setTimeout(function () { input.focus(); }, 350);
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
    if (di) di.value = now.getFullYear() + '-' + pad2(now.getMonth() + 1) + '-' + pad2(now.getDate());
    if (ti) ti.value = pad2(now.getHours()) + ':' + pad2(now.getMinutes());
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
    document.querySelectorAll('[data-mood].active').forEach(function (c) { c.classList.remove('active'); });
    resetFormDefaults();
    renderCards();
    showToast('\uD83E\uDD73  \u062E\u0627\u0637\u0631\u0647 \u062B\u0628\u062A \u0634\u062F');
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
