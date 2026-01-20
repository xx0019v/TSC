// Effects: fade-in observer, background parallax, heading sheen, card reveals, 3D tilt
(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  // Unified IntersectionObserver for fade-in, cards, titles, CTAs, heading underlines
  const fadeInObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (entry.target.classList.contains('fade-in-up')) {
          entry.target.classList.add('show');
        }
        if (entry.target.classList.contains('card-grid')) {
          const cards = entry.target.querySelectorAll('.card');
          const staggerDelay = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--card-stagger-ms')) || 70;
          cards.forEach((card, i) => {
            setTimeout(() => {
              card.classList.add('revealed');
            }, i * staggerDelay);
          });
        }
        if (entry.target.classList.contains('section-title') && !prefersReduced) {
          if (!entry.target.classList.contains('sheen')) {
            entry.target.classList.add('sheen');
            const onAnimEnd = () => { entry.target.classList.remove('sheen'); entry.target.removeEventListener('animationend', onAnimEnd); };
            entry.target.addEventListener('animationend', onAnimEnd);
          }
        }
        if (entry.target.classList.contains('section-title') && entry.target.classList.contains('underline')) {
          if (!entry.target.classList.contains('draw')) entry.target.classList.add('draw');
        }
        if (entry.target.classList.contains('cta-button')) {
          if (!entry.target.classList.contains('pulse')) {
            entry.target.classList.add('pulse');
            entry.target.addEventListener('animationend', () => { entry.target.classList.remove('pulse'); }, { once: true });
          }
        }
        obs.unobserve(entry.target);
      }
    });
  }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.12 });

  document.querySelectorAll('.fade-in-up').forEach((el) => fadeInObserver.observe(el));
  document.querySelectorAll('.card-grid').forEach((grid) => fadeInObserver.observe(grid));

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
  let lastScrollY = 0;
  let debugMode = false; // Case 10: Debug toggle
  let frameCount = 0;
  let lastFpsTime = performance.now();

  // Scroll progress bar (independent of reduced-motion)
  const progressEl = document.getElementById('scroll-progress');
  if (progressEl) progressEl.setAttribute('aria-hidden', 'true');
  // Dynamic gradient hue
  let hueBase = 46; // gold
  let hueSpan = 4;  // +/- range
  let pointerFactor = 0;
  window.addEventListener('pointermove', (e) => {
    const w = window.innerWidth || document.documentElement.clientWidth || 1;
    pointerFactor = clamp((e.clientX / w) - 0.5, -0.5, 0.5);
  }, { passive: true });

  // Case 1: Unified scroll handler (replaces multiple listeners)
  function onUnifiedScroll() {
    if (!ticking) {
      requestAnimationFrame(processScrollFrame);
      ticking = true;
    }
  }

  function processScrollFrame() {
    const currentScrollY = window.scrollY || window.pageYOffset || 0;
    // Debounce minor scroll jitter
    if (Math.abs(currentScrollY - lastScrollY) > 2) {
      lastScrollY = currentScrollY;
      
      // Case 6: unified animation control flag
      const shouldAnimate = !prefersReduced;
      
      if (shouldAnimate) {
        applyScrollEffects();
      }
    }
    
    // Progress bar update (independent of reduced-motion)
    updateScrollProgress(currentScrollY);
    
    // Case 10: FPS logging
    if (debugMode) {
      frameCount++;
      const now = performance.now();
      if (now - lastFpsTime >= 1000) {
        console.log(`[TSC Debug] FPS: ${frameCount}, ScrollY: ${Math.round(currentScrollY)}`);
        frameCount = 0;
        lastFpsTime = now;
      }
    }
    
    ticking = false;
  }

  function updateScrollProgress(scrollY) {
    if (!progressEl) return;
    const viewportH = window.innerHeight || document.documentElement.clientHeight;
    const docH = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight) || 1;
    const max = Math.max(1, docH - viewportH);
    const p = clamp(scrollY / max, 0, 1);
    progressEl.style.transform = `scaleX(${p})`;
    // subtle hue shift by scroll and pointer factor
    const hue = clamp(hueBase + hueSpan * ((p - 0.5) + pointerFactor * 0.2), hueBase - hueSpan, hueBase + hueSpan);
    document.documentElement.style.setProperty('--accent-hue', String(hue));
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

  function initParallax() { recalcCenters(); applyScrollEffects(); updateScrollProgress(window.scrollY || 0); }
  initParallax();

  // Case 1: Unified scroll listener (replaces 5+ separate listeners)
  window.addEventListener('scroll', onUnifiedScroll, { passive: true });
  
  // Resize/orientation changes
  function handleResize() {
    recalcCenters();
    onUnifiedScroll();
  }
  window.addEventListener('resize', handleResize, { passive: true });
  window.addEventListener('orientationchange', () => { setTimeout(handleResize, 120); }, { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleResize, { passive: true });
    window.visualViewport.addEventListener('scroll', onUnifiedScroll, { passive: true });
  }
  window.addEventListener('load', () => { initParallax(); }, { passive: true });
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(() => { initParallax(); }); }

  // Case 10: Debug mode toggle (press Alt+D to toggle FPS logging)
  window.addEventListener('keydown', (e) => {
    if (e.altKey && e.key.toLowerCase() === 'd') {
      debugMode = !debugMode;
      console.log(`[TSC Debug] ${debugMode ? 'Enabled' : 'Disabled'}`);
    }
  }, { passive: true });

  // Card accessibility and text parallax
  (function premiumEnhancements() {
    // Case 6: Use unified prefersReduced flag from outer scope

    document.querySelectorAll('.card').forEach(card => {
      if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex','0');
      if (!card.hasAttribute('role')) card.setAttribute('role', 'button');
      card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { const link = card.querySelector('a, button'); if (link) { e.preventDefault(); link.focus(); link.click && link.click(); } } });
    });

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
    // Case 6: Use unified prefersReduced flag from outer scope
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

  // Section crossfade: dim non-current section
  (function sectionCrossfade(){
    if (prefersReduced) return;
    const secs = Array.from(document.querySelectorAll('main section'));
    if (!secs.length) return;
    function update(){
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const y = window.scrollY || window.pageYOffset || 0;
      let closestIdx = 0; let closestDist = Infinity;
      secs.forEach((sec, i) => {
        const top = sec.offsetTop; const h = sec.offsetHeight; const center = top + h/2;
        const dist = Math.abs((y + vh/2) - center);
        if (dist < closestDist){ closestDist = dist; closestIdx = i; }
      });
      secs.forEach((sec, i) => { sec.classList.toggle('section-dim', i !== closestIdx); });
    }
    update();
    window.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    window.addEventListener('resize', () => requestAnimationFrame(update), { passive: true });
  })();


  // Scroll UI: top shadow + back-to-top
  (function scrollUI(){
    const shadowEl = document.getElementById('scroll-shadow');
    let backTopEl = document.getElementById('back-to-top');
    if (!backTopEl){
      backTopEl = document.createElement('button');
      backTopEl.id = 'back-to-top';
      backTopEl.type = 'button';
      backTopEl.setAttribute('aria-label', 'Back to top');
      backTopEl.innerHTML = '↑';
      document.body.appendChild(backTopEl);
      backTopEl.addEventListener('click', () => {
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) { window.scrollTo(0, 0); }
        else { window.scrollTo({ top: 0, behavior: 'smooth' }); }
      }, { passive: true });
    }
    let tick=false;
    function update(){
      const y = window.scrollY || window.pageYOffset || 0;
      const vh = window.innerHeight || document.documentElement.clientHeight;
      if (shadowEl) shadowEl.classList.toggle('show', y > 8);
      if (backTopEl) backTopEl.classList.toggle('show', y > vh * 0.35);
      tick=false;
    }
    function onScroll(){ if (!tick){ tick=true; requestAnimationFrame(update); } }
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    window.addEventListener('load', update, { passive: true });
  })();

  // Side dots nav + active highlight
  (function sideDotsNav(){
    const sectionsEls = Array.from(document.querySelectorAll('main section'));
    if (!sectionsEls.length) return;
    let nav = document.querySelector('.side-nav');
    if (!nav){
      nav = document.createElement('nav');
      nav.className = 'side-nav';
      nav.setAttribute('aria-hidden', 'true');
      sectionsEls.forEach((sec, i) => {
        if (!sec.id) sec.id = `section-${i+1}`;
        const a = document.createElement('a');
        a.href = `#${sec.id}`;
        a.setAttribute('aria-label', `Go to section ${i+1}`);
        a.setAttribute('title', `Section ${i+1}`);
        nav.appendChild(a);
      });
      document.body.appendChild(nav);
    }
    const dots = Array.from(nav.querySelectorAll('a'));
    function updateActive(){
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const y = window.scrollY || window.pageYOffset || 0;
      let closestIdx = 0; let closestDist = Infinity;
      sectionsEls.forEach((sec, i) => {
        const top = sec.offsetTop; const h = sec.offsetHeight;
        const center = top + h/2;
        const dist = Math.abs((y + vh/2) - center);
        if (dist < closestDist){ closestDist = dist; closestIdx = i; }
      });
      dots.forEach((d, i) => d.classList.toggle('active', i === closestIdx));
    }
    updateActive();
    window.addEventListener('scroll', () => { requestAnimationFrame(updateActive); }, { passive: true });
    window.addEventListener('resize', () => { requestAnimationFrame(updateActive); }, { passive: true });
  })();

  // Heading underline stroke (add underline class)
  (function headingUnderline(){
    const titles = Array.from(document.querySelectorAll('.section-title'));
    titles.forEach(t => { t.classList.add('underline'); fadeInObserver.observe(t); });
  })();

  // Image blur-up transition
  (function blurUp(){
    const imgs = Array.from(document.querySelectorAll('img'));
    imgs.forEach(img => {
      if (!img.classList.contains('blur-up')) img.classList.add('blur-up');
      function markLoaded(){ img.classList.add('loaded'); }
      if (img.complete) { markLoaded(); }
      else { img.addEventListener('load', markLoaded, { once: true }); }
    });
  })();

  // Inject card sheen element for hover sweep
  (function cardSheen(){
    document.querySelectorAll('.card').forEach(card => {
      if (!card.querySelector('.shine')){
        const shine = document.createElement('div');
        shine.className = 'shine';
        card.appendChild(shine);
      }
    });
  })();

  // CTA enter emphasis pulse on first reveal
  (function ctaPulse(){
    const ctas = Array.from(document.querySelectorAll('.cta-button'));
    ctas.forEach(el => fadeInObserver.observe(el));
  })();

})();
