/* =====================================================================
   TSC English Academy — Interaction & scroll effects
   Reveal-on-scroll, staggered groups, nav state, parallax, 3D tilt,
   active nav link, scroll progress, back-to-top, mobile fixed CTA.
   ===================================================================== */
(() => {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarse = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 900 || 'ontouchstart' in window;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------------------------------------------------------------- */
  /* 1. Reveal on scroll (with staggered groups)                       */
  /* ---------------------------------------------------------------- */
  (function reveal() {
    const items = Array.from(document.querySelectorAll('[data-reveal]'));
    if (!items.length) return;

    // Pre-compute stagger delay for grouped items
    document.querySelectorAll('[data-reveal-group]').forEach((group) => {
      const kids = group.querySelectorAll(':scope [data-reveal]');
      kids.forEach((el, i) => { el.style.transitionDelay = (i * 90) + 'ms'; });
    });

    if (prefersReduced || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('in'));
      return;
    }

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          obs.unobserve(entry.target);
        }
      });
    }, { root: null, rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    items.forEach((el) => io.observe(el));
  })();

  /* ---------------------------------------------------------------- */
  /* 2. Navigation: scrolled state + active link                       */
  /* ---------------------------------------------------------------- */
  (function navState() {
    const nav = document.getElementById('nav');
    const links = Array.from(document.querySelectorAll('.nav-links a'));
    const map = new Map();
    links.forEach((a) => {
      const id = a.getAttribute('href');
      if (id && id.startsWith('#')) {
        const sec = document.querySelector(id);
        if (sec) map.set(sec, a);
      }
    });

    let tick = false;
    function onScroll() {
      if (tick) return; tick = true;
      requestAnimationFrame(() => {
        if (nav) nav.classList.toggle('scrolled', (window.scrollY || 0) > 24);
        tick = false;
      });
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if ('IntersectionObserver' in window && map.size) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const link = map.get(entry.target);
          if (!link) return;
          if (entry.isIntersecting) {
            links.forEach((l) => l.classList.remove('active'));
            link.classList.add('active');
          }
        });
      }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
      map.forEach((_, sec) => io.observe(sec));
    }
  })();

  /* ---------------------------------------------------------------- */
  /* 3. Scroll progress bar                                            */
  /* ---------------------------------------------------------------- */
  (function progress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    let tick = false;
    function update() {
      const h = document.documentElement;
      const max = Math.max(1, (h.scrollHeight - h.clientHeight));
      const p = clamp((window.scrollY || 0) / max, 0, 1);
      bar.style.transform = `scaleX(${p})`;
      tick = false;
    }
    function onScroll() { if (!tick) { tick = true; requestAnimationFrame(update); } }
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
  })();

  /* ---------------------------------------------------------------- */
  /* 4. Parallax background layers                                     */
  /* ---------------------------------------------------------------- */
  (function parallax() {
    if (prefersReduced) return;
    const layers = Array.from(document.querySelectorAll('.bg-layer')).map((el) => ({
      el,
      section: el.closest('section'),
      speed: 0.16,
    }));
    if (!layers.length) return;

    let tick = false;
    function update() {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      layers.forEach((l) => {
        if (!l.section) return;
        const rect = l.section.getBoundingClientRect();
        // progress of section through viewport: -1 (below) .. 1 (above)
        const center = rect.top + rect.height / 2;
        const offset = (center - vh / 2);
        const shift = clamp(-offset * l.speed, -120, 120);
        l.el.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0) scale(1.12)`;
      });
      tick = false;
    }
    function onScroll() { if (!tick) { tick = true; requestAnimationFrame(update); } }
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
  })();

  /* ---------------------------------------------------------------- */
  /* 5. Card 3D tilt + pointer glow                                    */
  /* ---------------------------------------------------------------- */
  (function tilt() {
    const cards = Array.from(document.querySelectorAll('[data-tilt]'));
    if (!cards.length) return;

    cards.forEach((card) => {
      let raf = null;

      function onMove(e) {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        // glow follows pointer (always, cheap)
        card.style.setProperty('--mx', (px * 100) + '%');
        card.style.setProperty('--my', (py * 100) + '%');
        if (prefersReduced || isCoarse) return;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const rx = (0.5 - py) * 8;
          const ry = (px - 0.5) * 10;
          card.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-4px)`;
        });
      }
      function onLeave() {
        if (raf) cancelAnimationFrame(raf);
        card.style.transform = '';
      }

      card.addEventListener('pointermove', onMove, { passive: true });
      card.addEventListener('pointerleave', onLeave, { passive: true });
      card.addEventListener('pointercancel', onLeave, { passive: true });
    });
  })();

  /* ---------------------------------------------------------------- */
  /* 6. Back-to-top + mobile fixed CTA visibility                      */
  /* ---------------------------------------------------------------- */
  (function floatingUI() {
    let backTop = document.getElementById('back-to-top');
    if (!backTop) {
      backTop = document.createElement('button');
      backTop.id = 'back-to-top';
      backTop.type = 'button';
      backTop.setAttribute('aria-label', 'Back to top');
      backTop.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
      document.body.appendChild(backTop);
      backTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
      });
    }
    const fixedCta = document.querySelector('.fixed-cta');

    let tick = false;
    function update() {
      const y = window.scrollY || 0;
      const vh = window.innerHeight || 800;
      backTop.classList.toggle('show', y > vh * 0.6);
      if (fixedCta) fixedCta.classList.toggle('show', y > vh * 0.8);
      tick = false;
    }
    function onScroll() { if (!tick) { tick = true; requestAnimationFrame(update); } }
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
  })();

})();
