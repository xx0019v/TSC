// UI helpers: language toggle, year, CTA ripple
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
}

// set current year
document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

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
});
