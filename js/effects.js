// Effects: fade-in observer, background parallax, heading sheen, card reveals, 3D tilt
(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  // Fade-in for sections
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        obs.unobserve(entry.target);
      }
    });
  }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
  document.querySelectorAll('.fade-in-up').forEach((el) => observer.observe(el));

  // Background parallax & crossfade
  const sections = Array.from(document.querySelectorAll('section')).map((section) => {
    const stack = section.querySelector('.bg-stack');
    const layers = stack ? stack.querySelectorAll('.bg-layer') : null;
    const front = layers ? layers[0] : null;
    const back  = layers ? layers[1] : null;
    const strength = parseFloat(section.getAttribute('data-parallax') || '0.15');
    return { el: section, stack, front, back, strength, center: 0, top: 0, height: 0 };
  });

  function recalcCenters() {
    sections.forEach((s) => {
      if (!s.el) return;
      s.top = s.el.offsetTop;
      s.height = s.el.offsetHeight;
      s.center = s.top + s.height / 2;
    });
  }

  let ticking = false;
  function onScroll() {
    if (prefersReduced) return;
    if (!ticking) {
      requestAnimationFrame(applyScrollEffects);
      ticking = true;
    }
  }

  function applyScrollEffects() {
    const viewportH = window.innerHeight || document.documentElement.clientHeight;
    const scrollY = window.scrollY || window.pageYOffset || 0;

    sections.forEach((s) => {
      if (!s.stack || !s.front || !s.back) return;

      const distance = (scrollY + viewportH / 2 - s.center) / (viewportH / 1.1);
      const ratio = clamp(Math.abs(distance), 0, 1);

      const frontOpacity = clamp(1 - ratio * 0.85, 0.15, 1);
      const backOpacity  = clamp(0.35 + ratio * 0.55, 0.35, 0.9);
      s.front.style.opacity = String(frontOpacity);
      s.back.style.opacity  = String(backOpacity);

      const frontSpeed = parseFloat(s.front.getAttribute('data-speed') || '1');
      const backSpeed  = parseFloat(s.back.getAttribute('data-speed') || '0.9');
      const frontShift = (scrollY - s.center) * s.strength * (1 / frontSpeed);
      const backShift  = (scrollY - s.center) * s.strength * (1 / backSpeed) * 0.7;
      s.front.style.transform = `translate3d(0, ${frontShift}px, 0) scale(1.06)`;
      s.back .style.transform = `translate3d(0, ${backShift }px, 0) scale(1.06)`;
    });

    ticking = false;
  }

  function initParallax() { recalcCenters(); applyScrollEffects(); }
  initParallax();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { recalcCenters(); applyScrollEffects(); }, { passive: true });
  window.addEventListener('orientationchange', () => { setTimeout(() => { recalcCenters(); applyScrollEffects(); }, 120); }, { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => { recalcCenters(); applyScrollEffects(); }, { passive: true });
    window.visualViewport.addEventListener('scroll', () => { recalcCenters(); applyScrollEffects(); }, { passive: true });
  }
  window.addEventListener('load', () => { recalcCenters(); applyScrollEffects(); }, { passive: true });
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(() => { recalcCenters(); applyScrollEffects(); }); }

  // Heading sheen, card reveals, and text parallax
  (function premiumEnhancements() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReduced) {
      const titleObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const title = entry.target.querySelector('.section-title');
          if (title && !title.classList.contains('sheen')) {
            title.classList.add('sheen');
            const onAnimEnd = () => { title.classList.remove('sheen'); title.removeEventListener('animationend', onAnimEnd); };
            title.addEventListener('animationend', onAnimEnd);
          }
          obs.unobserve(entry.target);
        });
      }, { root: null, rootMargin: '0px 0px -12% 0px', threshold: 0.2 });
      document.querySelectorAll('section').forEach(s => titleObserver.observe(s));
    }

    document.querySelectorAll('.card').forEach(card => { if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex','0'); card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { const link = card.querySelector('a, button'); if (link) { e.preventDefault(); link.focus(); link.click && link.click(); } } }); });

    if (!prefersReduced) {
      const textTargets = Array.from(document.querySelectorAll('.section-title, .section-sub')).map(el => ({ el, parent: el.closest('section') }));
      const rootStyle = getComputedStyle(document.documentElement);
      const textParallaxMax = parseFloat(rootStyle.getPropertyValue('--text-parallax-max')) || 6;

      function applyTextParallax() {
        const viewportH = window.innerHeight || document.documentElement.clientHeight;
        const scrollY = window.scrollY || window.pageYOffset || 0;
        textTargets.forEach(t => {
          if (!t.parent) return;
          const rect = t.parent.getBoundingClientRect();
          const center = scrollY + rect.top + rect.height / 2;
          const distance = (scrollY + viewportH / 2 - center) / (viewportH / 1.2);
          const ratio = Math.max(-1, Math.min(1, distance));
          const translate = ratio * textParallaxMax;
          t.el.style.transform = `translateY(${translate}px)`;
          t.el.style.transition = 'transform 420ms cubic-bezier(.2,.9,.2,1)';
        });
      }
      let rafId = null;
      window.addEventListener('scroll', () => { if (rafId) cancelAnimationFrame(rafId); rafId = requestAnimationFrame(applyTextParallax); }, { passive: true });
      window.addEventListener('resize', () => { if (rafId) cancelAnimationFrame(rafId); rafId = requestAnimationFrame(applyTextParallax); }, { passive: true });
      requestAnimationFrame(applyTextParallax);
    }
  })();

  // 3D card tilt
  (function card3DTilt() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rootStyle = getComputedStyle(document.documentElement);
    const baseStrength = parseFloat(rootStyle.getPropertyValue('--card-tilt-strength')) || 12;
    const baseScale = parseFloat(rootStyle.getPropertyValue('--card-tilt-scale')) || 1.012;
    const isCoarse = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 820 || 'ontouchstart' in window;

    document.querySelectorAll('.card').forEach(card => {
      if (card.querySelector('.card-inner')) return;
      const inner = document.createElement('div'); inner.className = 'card-inner'; while (card.firstChild) inner.appendChild(card.firstChild); card.appendChild(inner);
      if (prefersReduced || isCoarse) { card.classList.add('no-3d'); return; }

      let rafId = null; inner.style.transform = 'translateZ(0)';
      function onPointerMove(e) { if (rafId) cancelAnimationFrame(rafId); rafId = requestAnimationFrame(() => { const rect = card.getBoundingClientRect(); const cx = rect.left + rect.width / 2; const cy = rect.top + rect.height / 2; const dx = (e.clientX - cx) / (rect.width / 2); const dy = (e.clientY - cy) / (rect.height / 2); const rotY = dx * baseStrength; const rotX = -dy * baseStrength; inner.style.transform = `rotateY(${rotY}deg) rotateX(${rotX}deg) scale(${baseScale})`; card.style.boxShadow = `0 ${Math.abs(rotX) + 8}px ${18 + Math.abs(rotY)}px rgba(0,0,0,0.45)`; }); }
      function onLeave() { if (rafId) cancelAnimationFrame(rafId); inner.style.transform = ''; card.style.boxShadow = ''; }
      card.addEventListener('pointermove', onPointerMove, { passive: true });
      card.addEventListener('pointerleave', onLeave, { passive: true });
      card.addEventListener('pointercancel', onLeave, { passive: true });
      card.addEventListener('focus', () => { inner.style.transform = `scale(${baseScale})`; }, true);
      card.addEventListener('blur', () => { inner.style.transform = ''; }, true);
    });
  })();

})();
