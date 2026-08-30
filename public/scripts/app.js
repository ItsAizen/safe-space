document.addEventListener('DOMContentLoaded', function() {
  var LS_KEY = 'ss-memories';
  var CORRECT_PIN = '1234';

  function getMemories() { try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch(e) { return []; } }
  function saveMemories(arr) { try { localStorage.setItem(LS_KEY, JSON.stringify(arr)); } catch(e) { /* ignore */ } }
  function genId() { return 'm_' + Math.random().toString(36).slice(2, 11); }
  function escapeHtml(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function showToast(msg) { var t = document.getElementById('toast'); if(!t) return; t.innerHTML = '<span>❤️</span> ' + msg; t.style.opacity = '1'; t.style.transition = 'opacity 0.3s'; setTimeout(function(){ t.style.opacity = '0'; }, 2500); }

  function formatDate(dateStr) { var d = new Date(dateStr); if(isNaN(d.getTime())) d = new Date(); var p = function(n){return n<10?'0'+n:n;}; return d.getHours().toString().padStart(2,'0')+':'+d.getMinutes().toString().padStart(2,'0')+' - '+d.getDate().toString().padStart(2,'0')+'/'+(d.getMonth()+1).toString().padStart(2,'0')+'/'+d.getFullYear(); }

  // --- RENDER CARDS ---
  function renderCards() { var list = document.getElementById('timeline-list'); var empty = document.getElementById('timeline-empty'); if(!list) return; list.innerHTML = ''; var memories = getMemories(); if(!memories || memories.length === 0){ if(empty) empty.style.display = 'block'; return; } if(empty) empty.style.display = 'none'; memories.sort(function(a,b){return new Date(b.createdAt) - new Date(a.createdAt); }); memories.forEach(function(m){ var card = document.createElement('div'); card.className = 'card relative p-4 mb-3'; card.innerHTML = '<div class="timeline-dot w-2 h-2 rounded-full bg-emerald-500 absolute left-0 top-1/2 -translate-y-1/2"></div><div class="glass-card p-4"><div class="flex items-center justify-between mb-2"><span class="text-xs text-gray-400">'+formatDate(m.createdAt)+'</span><span class="text-xs text-emerald-400">'+(m.author==='mehrdad'?'مهرداد':'سوگل')+'</span></div><h3 class="text-semibold text-white mt-1">'+escapeHtml(m.title)+'</h3><p class="text-sm text-white/60 mt-1">'+escapeHtml(m.description||'')+'</p></div>'; list.appendChild(card); }); }

  // --- SHOW APP ---
  function showApp() { var el = document.getElementById('app-content'); if(!el) return; el.style.opacity = '1'; el.style.pointerEvents = 'auto'; renderCards(); }

  // --- PIN ---
  var pinLock = document.getElementById('pin-lock'); var pinDots = document.querySelectorAll('.pin-dot'); var pinKeys = document.querySelectorAll('.pin-key'); var pinError = document.getElementById('pin-error'); var pinEntered = '';

  function updatePinDots(){ pinDots.forEach(function(dot,i){ if(i<pinEntered.length){ dot.style.backgroundColor = '#10b981'; dot.style.borderColor = '#10b981'; } else { dot.style.backgroundColor = ''; dot.style.borderColor = ''; } }); }

  function shakePin(){ pinError.style.opacity = '1'; setTimeout(function(){ pinEntered=''; updatePinDots(); pinError.style.opacity='0'; }, 800); }

  function unlockPin(){ sessionStorage.setItem('ss-auth','1'); pinLock.style.display='none'; showApp(); }

  pinKeys.forEach(function(key){ key.addEventListener('click', function(){ var digit = this.getAttribute('data-digit'); var action = this.getAttribute('data-action'); if(action==='delete'){ pinEntered=pinEntered.slice(0,-1); updatePinDots(); return; } if(!digit||pinEntered.length>=4) return; pinEntered+=digit; updatePinDots(); if(pinEntered.length===4){ setTimeout(function(){ if(pinEntered===CORRECT_PIN) unlockPin(); else shakePin(); }, 150); } }); });

  document.addEventListener('keydown', function(e){ if(e.key>='0'&&e.key<='9'){ var btn=document.querySelector('[data-digit="'+e.key+'"]'); if(btn) btn.click(); } else if(e.key==='Backspace'){ var del=document.querySelector('[data-action="delete"]'); if(del) del.click(); } });

  // --- DRAWER ---
  var fab = document.getElementById('fab-add'); var drawer = document.getElementById('memory-drawer'); var overlay = document.getElementById('drawer-overlay'); var closeBtn = document.getElementById('drawer-close'); function openDrawer(){ drawer.style.transform='translateY(0)'; overlay.style.opacity='1'; overlay.style.pointerEvents='auto'; document.body.style.overflow='hidden'; } function closeDrawer(){ drawer.style.transform='translateY(100%)'; overlay.style.opacity='0'; overlay.style.pointerEvents='none'; document.body.style.overflow=''; } fab.addEventListener('click', openDrawer); closeBtn.addEventListener('click', closeDrawer); overlay.addEventListener('click', closeDrawer);

  // --- MOOD / FORM ---
  var form = document.getElementById('memory-form'); var selM=''; var selS=''; form.addEventListener('submit', function(e){ e.preventDefault(); var title = (form.querySelector('[name="title"]')||{}).value||'خاطره جدید'; var desc = (form.querySelector('[name="description"]')||{}).value||''; var author = (form.querySelector('[name="author"]:checked')||{}).value||'mehrdad'; var date = (form.querySelector('[name="date"]')||{}).value||new Date().toISOString().slice(0,10); var time = (form.querySelector('[name="time"]')||{}).value||'12:00'; var song = (form.querySelector('[name="song"]')||{}).value||''; var payload = { id:genId(), title:title, description:desc, author:author, date:date+'T'+time+':00', createdAt:new Date().toISOString(), song:song }; var memories = getMemories(); memories.push(payload); saveMemories(memories); form.reset(); renderCards(); showToast('خاطره ثبت شد'); closeDrawer(); });

  // --- AUTH CHECK ---
  if(sessionStorage.getItem('ss-auth')=== '1'){ pinLock.style.display='none'; showApp(); }
});