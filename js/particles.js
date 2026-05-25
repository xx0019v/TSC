/* =====================================================================
   TSC English Academy — "Living Light" interactive flow field
   A teamLab-inspired field of golden particles that flow organically,
   swirl toward the pointer/touch, and ripple on tap. Brand-gold palette.
   Site-wide fixed canvas, behind content, pointer-events: none.
   ===================================================================== */
(function livingLight() {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return; // honor reduced-motion: no animated field

  const isCoarse = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;

  // ---- Canvas ----
  const canvas = document.createElement('canvas');
  canvas.id = 'fx-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('2d', { alpha: true });
  (document.body || document.documentElement).prepend(canvas);

  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0, H = 0;
  let particles = [];
  const ripples = [];

  // Pointer state (CSS px). Idle until the user moves.
  const pointer = { x: -9999, y: -9999, active: false };

  // ---- Golden glow sprite (pre-rendered for cheap drawImage) ----
  const sprite = document.createElement('canvas');
  const sctx = sprite.getContext('2d');
  const SP = 64;
  sprite.width = sprite.height = SP;
  (function buildSprite() {
    const g = sctx.createRadialGradient(SP / 2, SP / 2, 0, SP / 2, SP / 2, SP / 2);
    g.addColorStop(0.0, 'rgba(255, 240, 200, 0.95)');
    g.addColorStop(0.25, 'rgba(244, 215, 130, 0.55)');
    g.addColorStop(0.6, 'rgba(212, 175, 55, 0.18)');
    g.addColorStop(1.0, 'rgba(212, 175, 55, 0)');
    sctx.fillStyle = g;
    sctx.fillRect(0, 0, SP, SP);
  })();

  function countForArea() {
    const area = W * H;
    const divisor = isCoarse ? 17000 : 8200;
    return Math.round(Math.max(48, Math.min(isCoarse ? 110 : 340, area / divisor)));
  }

  function rand(a, b) { return Math.random() * (b - a) + a; }

  function makeParticle() {
    return {
      x: rand(0, W), y: rand(0, H),
      vx: rand(-0.2, 0.2), vy: rand(-0.2, 0.2),
      size: rand(0.6, 2.2),
      hueShift: rand(0, 1),
    };
  }

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const target = countForArea();
    if (particles.length < target) {
      while (particles.length < target) particles.push(makeParticle());
    } else {
      particles.length = target;
    }
  }

  // ---- Flow field: smooth pseudo-noise from layered trig (cheap) ----
  function fieldAngle(x, y, t) {
    return (
      Math.sin(x * 0.0016 + t) +
      Math.cos(y * 0.0014 - t * 0.8) +
      Math.sin((x + y) * 0.0009 + t * 0.55)
    ) * 1.35;
  }

  const FORCE = 0.06;     // flow push
  const FRICTION = 0.95;
  const MAXV = 2.4;
  const R = isCoarse ? 130 : 190;   // pointer influence radius
  const R2 = R * R;

  let t = 0;
  let rafId = null;
  let last = 0;

  function frame(now) {
    rafId = requestAnimationFrame(frame);
    const dt = now - last;
    if (dt < 24) return;            // ~40fps cap
    last = now;
    t += 0.0016 * (dt);

    // Fade previous frame (keeps canvas transparent → trails, body glow shows through)
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,0.085)';
    ctx.fillRect(0, 0, W, H);

    // Draw glowing particles additively
    ctx.globalCompositeOperation = 'lighter';

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const a = fieldAngle(p.x, p.y, t);
      let ax = Math.cos(a) * FORCE;
      let ay = Math.sin(a) * FORCE;

      // Pointer swirl + gentle attraction
      if (pointer.active) {
        const dx = pointer.x - p.x;
        const dy = pointer.y - p.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < R2 && d2 > 0.5) {
          const f = (1 - Math.sqrt(d2) / R);
          ax += (-dy * 0.018 + dx * 0.006) * f;
          ay += (dx * 0.018 + dy * 0.006) * f;
        }
      }

      // Ripples (taps) push particles outward
      for (let r = 0; r < ripples.length; r++) {
        const rp = ripples[r];
        const dx = p.x - rp.x, dy = p.y - rp.y;
        const dist = Math.hypot(dx, dy) || 1;
        const band = Math.abs(dist - rp.radius);
        if (band < 60) {
          const push = (1 - band / 60) * rp.strength;
          ax += (dx / dist) * push;
          ay += (dy / dist) * push;
        }
      }

      p.vx = p.vx * FRICTION + ax;
      p.vy = p.vy * FRICTION + ay;
      const sp = Math.hypot(p.vx, p.vy);
      if (sp > MAXV) { p.vx = (p.vx / sp) * MAXV; p.vy = (p.vy / sp) * MAXV; }

      p.x += p.vx; p.y += p.vy;

      // wrap
      if (p.x < -20) p.x = W + 20; else if (p.x > W + 20) p.x = -20;
      if (p.y < -20) p.y = H + 20; else if (p.y > H + 20) p.y = -20;

      const glow = 0.35 + Math.min(0.5, sp * 0.22);
      const s = (p.size + sp * 1.2) * 7;
      ctx.globalAlpha = glow;
      ctx.drawImage(sprite, p.x - s / 2, p.y - s / 2, s, s);
    }

    // Cursor halo
    if (pointer.active) {
      ctx.globalAlpha = 0.5;
      const hs = R * 0.95;
      ctx.drawImage(sprite, pointer.x - hs / 2, pointer.y - hs / 2, hs, hs);
    }

    // Expanding ripple rings
    for (let r = ripples.length - 1; r >= 0; r--) {
      const rp = ripples[r];
      rp.radius += rp.speed;
      rp.strength *= 0.93;
      ctx.globalAlpha = Math.max(0, 0.5 * (1 - rp.radius / rp.max));
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, rp.radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(244, 215, 130, 0.9)';
      ctx.lineWidth = 2;
      ctx.stroke();
      if (rp.radius > rp.max) ripples.splice(r, 1);
    }

    ctx.globalAlpha = 1;
  }

  function start() { if (rafId == null && !document.hidden) { last = performance.now(); rafId = requestAnimationFrame(frame); } }
  function stop() { if (rafId != null) { cancelAnimationFrame(rafId); rafId = null; } }

  // ---- Interaction ----
  window.addEventListener('pointermove', (e) => {
    pointer.x = e.clientX; pointer.y = e.clientY; pointer.active = true;
  }, { passive: true });
  window.addEventListener('pointerout', () => { pointer.active = false; }, { passive: true });
  window.addEventListener('blur', () => { pointer.active = false; });

  window.addEventListener('pointerdown', (e) => {
    pointer.x = e.clientX; pointer.y = e.clientY; pointer.active = true;
    if (ripples.length < 5) {
      ripples.push({ x: e.clientX, y: e.clientY, radius: 6, max: Math.max(W, H) * 0.5, speed: 9, strength: 1.6 });
    }
  }, { passive: true });

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('orientationchange', () => setTimeout(resize, 150), { passive: true });
  document.addEventListener('visibilitychange', () => { document.hidden ? stop() : start(); });

  // ---- Boot ----
  resize();
  start();
})();
