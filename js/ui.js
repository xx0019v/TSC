// UI helpers: language toggle, year, CTA ripple

// Safe localStorage wrapper
const StorageHelper = (() => {
  function get(key, defaultVal) {
    try {
      return localStorage.getItem(key) ?? defaultVal;
    } catch (e) {
      return defaultVal;
    }
  }
  function set(key, val) {
    try {
      localStorage.setItem(key, val);
    } catch (e) {
      // no-op if storage unavailable
    }
  }
  return { get, set };
})();

function setLang(lang) {
  const html = document.documentElement;
  html.classList.remove('ja', 'en');
  html.classList.add(lang);
  html.setAttribute('lang', lang);

  const jaBtn = document.getElementById('btn-ja');
  const enBtn = document.getElementById('btn-en');

  if (jaBtn) jaBtn.classList.toggle('active', lang === 'ja');
  if (enBtn) enBtn.classList.toggle('active', lang === 'en');

  if (jaBtn) jaBtn.setAttribute('aria-pressed', String(lang === 'ja'));
  if (enBtn) enBtn.setAttribute('aria-pressed', String(lang === 'en'));

  // Save preference to localStorage
  StorageHelper.set('preferred-lang', lang);
}

// Restore saved language preference on load or infer from browser
document.addEventListener('DOMContentLoaded', () => {
  const savedLang = StorageHelper.get('preferred-lang', null);
  if (savedLang === 'ja' || savedLang === 'en') {
    setLang(savedLang);
    return;
  }

  // Fallback: infer from navigator.language
  const navLang = (navigator.language || navigator.userLanguage || 'ja').toLowerCase();
  let inferred = 'ja';
  if (navLang.startsWith('en')) inferred = 'en';
  setLang(inferred);
});

// Loading screen management
window.addEventListener('load', () => {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
      setTimeout(() => loadingScreen.remove(), 600);
    }, 800);
  }

  // Register service worker for offline cache
  if ('serviceWorker' in navigator) {
    const swUrl = new URL('sw.js', window.location.href);
    navigator.serviceWorker.register(swUrl.pathname).catch(() => {});
  }
});

// set current year
document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

// Case 10: localStorage usage monitoring (for debugging)
if (typeof window.TSCDebug !== 'undefined') {
  const origSet = StorageHelper.set;
  StorageHelper.set = function(key, val) {
    console.log(`[Storage] Set ${key} = ${val}`);
    return origSet.call(this, key, val);
  };
}

// CTA Ripple
function attachRipple(el) {
  function spawnRipple(e) {
    const rect = el.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const isTouch = e.touches && e.touches[0];
    const cx = isTouch ? e.touches[0].clientX : (e.clientX ?? rect.left + rect.width / 2);
    const cy = isTouch ? e.touches[0].clientY : (e.clientY ?? rect.top  + rect.height / 2);
    ripple.style.left = (cx - rect.left) + 'px';
    ripple.style.top  = (cy - rect.top ) + 'px';
    el.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  }
  el.addEventListener('pointerdown', spawnRipple, { passive: true });
}

// attach to existing CTAs
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.cta-button, .fixed-cta').forEach(attachRipple);

  // Smooth scroll for anchor links (respect modifier/middle-click)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return; // allow middle-click
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const href = this.getAttribute('href');
      if (href === '#' || href === 'javascript:void(0)') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        target.scrollIntoView({
          behavior: prefersReduced ? 'auto' : 'smooth',
          block: 'start'
        });
        // Focus management for accessibility
        if (target.hasAttribute('tabindex')) {
          target.focus();
        } else {
          target.setAttribute('tabindex', '-1');
          target.focus();
          target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
        }
      }
    });
  });
});
