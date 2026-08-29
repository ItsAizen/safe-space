// Pin Lock Logic
(() => {
  const CORRECT_PIN = '1234';
  const lockEl = document.getElementById('pin-lock');
  const dots = lockEl.querySelectorAll('.pin-dot');
  const errorEl = document.getElementById('pin-error');
  const keys = lockEl.querySelectorAll('[data-key]');
  const backspaceBtn = lockEl.querySelector('[data-action="backspace"]');
  const clearBtn = lockEl.querySelector('[data-action="clear"]');

  let enteredPin = '';
  let isShaking = false;

  const updateDots = () => {
    dots.forEach((dot, i) => {
      if (i < enteredPin.length) {
        dot.classList.add('filled');
      } else {
        dot.classList.remove('filled');
      }
    });
  };

  const shake = () => {
    if (isShaking) return;
    isShaking = true;
    const container = lockEl.querySelector('.max-w-sm');
    container.classList.add('animate-shake');
    errorEl.textContent = 'رمز عبور نادرست است';
    dots.forEach(dot => {
      dot.style.borderColor = '#ef4444';
      dot.style.background = 'rgba(239, 68, 68, 0.2)';
    });
    setTimeout(() => {
      container.classList.remove('animate-shake');
      dots.forEach(dot => {
        if (!dot.classList.contains('filled')) {
          dot.style.borderColor = '';
          dot.style.background = '';
        }
      });
      errorEl.textContent = '';
      isShaking = false;
    }, 400);
  };

  const unlock = () => {
    const container = lockEl.querySelector('.max-w-sm');
    container.style.transition = 'transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 400ms ease-out';
    container.style.transform = 'translateY(-40px) scale(0.95)';
    container.style.opacity = '0';
    lockEl.style.transition = 'opacity 400ms ease-out';
    lockEl.style.opacity = '0';
    setTimeout(() => {
      lockEl.remove();
      document.dispatchEvent(new CustomEvent('pin-unlocked'));
    }, 500);
  };

  const handleKey = (key) => {
    if (enteredPin.length >= 4) return;
    enteredPin += key;
    updateDots();
    if (enteredPin.length === 4) {
      setTimeout(() => {
        if (enteredPin === CORRECT_PIN) {
          unlock();
        } else {
          shake();
          enteredPin = '';
          updateDots();
        }
      }, 100);
    }
  };

  const handleBackspace = () => {
    if (enteredPin.length === 0) return;
    enteredPin = enteredPin.slice(0, -1);
    updateDots();
  };

  const handleClear = () => {
    enteredPin = '';
    updateDots();
  };

  keys.forEach(btn => {
    btn.addEventListener('click', () => handleKey(btn.dataset.key));
  });

  backspaceBtn.addEventListener('click', handleBackspace);
  clearBtn.addEventListener('click', handleClear);

  document.addEventListener('keydown', (e) => {
    if (lockEl.parentElement && !lockEl.classList.contains('hidden')) {
      if (e.key >= '0' && e.key <= '9') handleKey(e.key);
      else if (e.key === 'Backspace') handleBackspace();
      else if (e.key === 'Escape') handleClear();
    }
  });

  updateDots();
})();