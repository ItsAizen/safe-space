document.addEventListener('DOMContentLoaded', function() {
  var LS_KEY = 'ss-memories';
  var CORRECT_PIN = '1234';

  function getMemories() { try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch(e) { return []; } }
  function saveMemories(arr) { localStorage.setItem(LS_KEY, JSON.stringify(arr)); }
  function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function toPer(s) { return String(s).replace(/\d/g, function(d) { return '\u06F0\u06F1\u06F2\u06F3\u06F4\u06F5\u06F6\u06F7\u06F8\u06F9'[d]; }); }
  function escapeHtml(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function toast(msg, icon) { var t = document.getElementById('toast'); if (!t) return; t.innerHTML = '<span>' + (icon || '\u2728') + '</span> ' + msg; t.classList.add('show'); setTimeout(function() { t.classList.remove('show'); }, 2500); }

  function formatJalali(dateStr) {
    var d = new Date(dateStr); if (isNaN(d.getTime())) d = new Date();
    var gy = d.getFullYear(), gm = d.getMonth()+1, gd = d.getDate();
    var g_d_m = [0,31,59,90,120,151,181,212,243,273,304,334];
    var gy2 = gm > 2 ? gy+1 : gy;
    var days = 355666 + 365*gy + Math.floor((gy2+3)/4) - Math.floor((gy2+99)/100) + Math.floor((gy2+399)/400) + gd + g_d_m[gm-1];
    var jy = -1595 + 33*Math.floor(days/12053); days %= 12053;
    jy += 4*Math.floor(days/1461); days %= 1461;
    if (days > 365) { jy += Math.floor((days-1)/365); days = (days-1)%365; }
    var jm, jd;
    if (days < 186) { jm = 1+Math.floor(days/31); jd = 1+days%31; }
    else { jm = 7+Math.floor((days-186)/30); jd = 1+(days-186)%30; }
    return toPer(d.getHours().toString().padStart(2,'0'))+':'+toPer(d.getMinutes().toString().padStart(2,'0'))+' - '+toPer(String(jy))+'/'+toPer(String(jm).padStart(2,'0'))+'/'+toPer(String(jd).padStart(2,'0'));
  }

  // --- RENDER ---
  function renderCards(memories) {
    var list = document.getElementById('timeline-list');
    var empty = document.getElementById('timeline-empty');
    if (!list) return;
    list.innerHTML = '';
    if (!memories || memories.length === 0) { if (empty) empty.style.display = ''; return; }
    if (empty) empty.style.display = 'none';
    memories.sort(function(a,b) { return new Date(b.createdAt||b.date) - new Date(a.createdAt||a.date); });
    memories.forEach(function(mem) {
      var authorLabel = mem.author === 'mehrdad' ? '\u062B\u0628\u062A \u062A\u0648\u0636\u0639 \u062A\u0648\u0633\u0637 \u0645\u0647\u0631\u062F\u0627\u062F' : '\u062B\u0628\u062A \u062A\u0648\u0636\u0639 \u062A\u0648\u0633\u0637 \u0633\u0648\u06AF\u0644';
      var authorColor = mem.author === 'mehrdad' ? 'text-neon-emerald/70' : 'text-purple-400/70';
      var songHtml = mem.song ? '<div class="mt-3 inline-flex items-center gap-2 rounded-full bg-neon-emerald/[0.06] border border-neon-emerald/[0.12] px-3 py-1.5"><div class="audio-wave"><span></span><span></span><span></span><span></span><span></span></div><span class="text-xs text-neon-emerald/70">'+escapeHtml(mem.song)+'</span></div>' : '';
      var moodHtml = '';
      if (mem.mehrdadMood || mem.sogolMood) { var pills=''; if(mem.mehrdadMood) pills+='<span class="chip text-[11px]">'+escapeHtml(mem.mehrdadMood)+'</span>'; if(mem.sogolMood) pills+='<span class="chip text-[11px]">'+escapeHtml(mem.sogolMood)+'</span>'; moodHtml='<div class="flex flex-wrap gap-2 mt-3">'+pills+'</div>'; }
      var card = document.createElement('div');
      card.className = 'gsap-stagger relative pr-11';
      card.setAttribute('data-id', mem.id);
      card.innerHTML = '<div class="timeline-dot"></div><div class="glass-card p-5 ml-0"><div class="flex items-center justify-between mb-3"><div class="flex items-center gap-2.5"><span class="text-[10px] font-medium text-white/30 bg-white/[0.04] rounded-md px-2 py-1 tracking-wider tabular-nums">'+formatJalali(mem.createdAt||mem.date)+'</span><span class="text-[10px] font-medium '+authorColor+'">'+authorLabel+'</span></div><button type="button" data-delete-id="'+mem.id+'" class="relative w-7 h-7 flex items-center justify-center rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/[0.08] transition-all duration-200 active:scale-90"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button></div><h3 class="text-[15px] font-bold text-white/90 leading-relaxed mb-1.5">'+escapeHtml(mem.title)+'</h3><p class="text-[13px] text-white/50 leading-[1.85]">'+escapeHtml(mem.description||'')+'</p>'+songHtml+moodHtml+'</div>';
      list.appendChild(card);
    });
    wireDeleteButtons();
  }

  function wireDeleteButtons() {
    document.querySelectorAll('[data-delete-id]').forEach(function(btn) {
      btn.onclick = function(e) {
        e.stopPropagation();
        var id = this.getAttribute('data-delete-id');
        var card = document.querySelector('[data-id="'+id+'"]');
        if (!card) return;
        var memories = getMemories().filter(function(m) { return m.id !== id; });
        saveMemories(memories);
        fetch('/api/memories', {method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:id})}).catch(function(){});
        if (window.gsap) { gsap.to(card, {x:-50,opacity:0,height:0,padding:0,marginBottom:0,duration:0.4,ease:'power2.in',onComplete:function(){card.remove();}}); } else { card.remove(); }
        toast('\u062E\u0627\u0637\u0631\u0647 \u062D\u0630\u0641 \u0634\u062F','\uD83D\uDDD1\uFE0F');
      };
    });
  }

  function loadAndRender() {
    var local = getMemories();
    renderCards(local);
    fetch('/api/memories').then(function(r){if(r.ok)return r.json();throw 0;}).then(function(server){
      if(server&&server.length>0){var ids={};local.forEach(function(m){ids[m.id]=true;});var merged=local.slice();server.forEach(function(m){if(!ids[m.id])merged.push(m);});saveMemories(merged);renderCards(merged);}
    }).catch(function(){});
  }

  // --- SHOW APP ---
  function showApp() {
    var el = document.getElementById('app-content');
    if (!el) return;
    el.style.opacity = '1';
    el.style.pointerEvents = 'auto';
    loadAndRender();
  }

  // --- PIN ---
  var pinLock = document.getElementById('pin-lock');
  var pinDots = document.querySelectorAll('.pin-dot');
  var pinKeys = document.querySelectorAll('.pin-key');
  var pinError = document.getElementById('pin-error');
  var pinEntered = '';

  function updatePinDots() {
    pinDots.forEach(function(dot, i) {
      if (i < pinEntered.length) { dot.style.backgroundColor = '#10b981'; dot.style.borderColor = '#10b981'; dot.style.boxShadow = '0 0 10px rgba(16,185,129,0.5)'; }
      else { dot.style.backgroundColor = 'transparent'; dot.style.borderColor = ''; dot.style.boxShadow = ''; }
    });
  }

  function shakePin() {
    pinError.style.opacity = '1';
    if (window.gsap) { gsap.timeline().to(pinLock,{x:-12,duration:0.06}).to(pinLock,{x:12,duration:0.06}).to(pinLock,{x:-8,duration:0.06}).to(pinLock,{x:8,duration:0.06}).to(pinLock,{x:-4,duration:0.06}).to(pinLock,{x:0,duration:0.06}); }
    setTimeout(function() { pinEntered = ''; updatePinDots(); pinError.style.opacity = '0'; }, 800);
  }

  function unlockPin() {
    sessionStorage.setItem('ss-auth', '1');
    pinLock.style.display = 'none';
    showApp();
  }

  pinKeys.forEach(function(key) {
    key.addEventListener('click', function() {
      var digit = this.getAttribute('data-digit');
      var action = this.getAttribute('data-action');
      if (action === 'delete') { pinEntered = pinEntered.slice(0,-1); updatePinDots(); return; }
      if (!digit || pinEntered.length >= 4) return;
      pinEntered += digit;
      updatePinDots();
      if (pinEntered.length === 4) {
        setTimeout(function() { if (pinEntered === CORRECT_PIN) unlockPin(); else shakePin(); }, 150);
      }
    });
  });

  document.addEventListener('keydown', function(e) {
    if (e.key >= '0' && e.key <= '9') { var btn = document.querySelector('[data-digit="'+e.key+'"]'); if (btn) btn.click(); }
    else if (e.key === 'Backspace') { var del = document.querySelector('[data-action="delete"]'); if (del) del.click(); }
  });

  // --- DRAWER ---
  var fab = document.getElementById('fab-add');
  var drawer = document.getElementById('memory-drawer');
  var overlay = document.getElementById('drawer-overlay');
  var closeBtn = document.getElementById('drawer-close');
  function openDrawer() { drawer.style.transform='translateY(0)'; overlay.style.opacity='1'; overlay.classList.remove('pointer-events-none'); overlay.classList.add('pointer-events-auto'); document.body.style.overflow='hidden'; }
  function closeDrawer() { drawer.style.transform='translateY(100%)'; overlay.style.opacity='0'; overlay.classList.add('pointer-events-none'); overlay.classList.remove('pointer-events-auto'); document.body.style.overflow=''; }
  fab.addEventListener('click', openDrawer);
  closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  // --- MOOD CHIPS ---
  var selM = '', selS = '';
  document.querySelectorAll('[data-mood]').forEach(function(chip) {
    chip.addEventListener('click', function(e) {
      e.preventDefault();
      var type = this.getAttribute('data-mood'), val = this.getAttribute('data-value');
      this.parentElement.querySelectorAll('.chip').forEach(function(s){s.classList.remove('active');});
      if (type==='mehrdad') { selM = selM===val?'':val; if(selM) this.classList.add('active'); }
      else { selS = selS===val?'':val; if(selS) this.classList.add('active'); }
    });
  });

  // --- FORM ---
  var form = document.getElementById('memory-form');
  function setFormDefaults() {
    var now=new Date(),di=form.querySelector('[name="date"]'),ti=form.querySelector('[name="time"]');
    if(di)di.value=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
    if(ti)ti.value=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
  }
  setFormDefaults();

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var fd = new FormData(form);
    var dv = fd.get('date'), tv = fd.get('time'), md;
    try { if(dv&&tv) md=new Date(dv+'T'+tv+':00'); else if(dv) md=new Date(dv+'T12:00:00'); else md=new Date(); if(isNaN(md.getTime()))md=new Date(); } catch(x) { md=new Date(); }
    var payload = { id:genId(), title:String(fd.get('title')||'').slice(0,120), description:String(fd.get('description')||'').slice(0,1000), song:fd.get('song')||null, mehrdadMood:selM||null, sogolMood:selS||null, author:fd.get('author')==='sogol'?'sogol':'mehrdad', date:md.toISOString(), createdAt:new Date().toISOString() };
    var memories = getMemories(); memories.push(payload); saveMemories(memories);
    fetch('/api/memories',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}).then(function(r){if(r.ok)return r.json();throw 0;}).then(function(s){var i=memories.findIndex(function(m){return m.id===payload.id;});if(i!==-1){memories[i]=s;saveMemories(memories);}}).catch(function(){});
    closeDrawer(); form.reset(); selM=''; selS='';
    document.querySelectorAll('.chip.active').forEach(function(c){c.classList.remove('active');});
    setFormDefaults(); renderCards(getMemories()); toast('\u062E\u0627\u0637\u0631\u0647 \u062B\u0628\u062A \u0634\u062F');
  });

  // --- SWIPE ---
  var handle = document.getElementById('drawer-handle'), startY=0;
  handle.addEventListener('touchstart',function(e){startY=e.touches[0].clientY;},{passive:true});
  handle.addEventListener('touchmove',function(e){if(e.touches[0].clientY-startY>80)closeDrawer();},{passive:true});

  // --- AUTH CHECK ---
  if (sessionStorage.getItem('ss-auth') === '1') {
    pinLock.style.display = 'none';
    showApp();
  }
});
