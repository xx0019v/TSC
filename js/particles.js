// Lightweight hero particles (canvas)
(function initHeroParticles(){
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarse = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  if (prefersReduced) return;

  const heroSection = document.querySelector('section[aria-labelledby="hero-title"], section[aria-labelledby="hero-title-en"]');
  if (!heroSection) return;
  const stack = heroSection.querySelector('.bg-stack');
  if (!stack) return;

  // Create canvas and insert before vignette
  const canvas = document.createElement('canvas');
  canvas.className = 'bg-particles';
  const vignette = stack.querySelector('.bg-vignette');
  if (vignette && vignette.parentNode) {
    vignette.parentNode.insertBefore(canvas, vignette);
  } else {
    stack.appendChild(canvas);
  }
  const ctx = canvas.getContext('2d');

  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const config = {
    count: isCoarse ? 12 : 28,
    baseSpeed: isCoarse ? 0.12 : 0.22,
    sizeMin: 0.6,
    sizeMax: isCoarse ? 1.4 : 1.8,
    hue: 48, // golden hue
  };

  let particles = [];
  let width = 0, height = 0;

  function resize(){
    const rect = stack.getBoundingClientRect();
    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(width * DPR);
    canvas.height = Math.floor(height * DPR);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function rand(min, max){ return Math.random() * (max - min) + min; }

  function makeParticle(){
    return {
      x: rand(0, width),
      y: rand(0, height),
      vx: rand(-0.1, 0.1),
      vy: rand(-config.baseSpeed * 0.6, -config.baseSpeed * 1.6), // drift upward
      size: rand(config.sizeMin, config.sizeMax),
      alpha: rand(0.25, 0.75),
      wobble: rand(0.5, 2.0),
      phase: rand(0, Math.PI * 2),
    };
  }

  function resetParticle(p){
    p.x = rand(0, width);
    p.y = height + rand(0, height * 0.2);
    p.vx = rand(-0.1, 0.1);
    p.vy = rand(-config.baseSpeed * 0.6, -config.baseSpeed * 1.6);
    p.size = rand(config.sizeMin, config.sizeMax);
    p.alpha = rand(0.25, 0.75);
    p.wobble = rand(0.5, 2.0);
    p.phase = rand(0, Math.PI * 2);
  }

  function init(){
    resize();
    particles = new Array(config.count).fill(0).map(makeParticle);
  }

  let lastTime = 0;
  function draw(ts){
    // Cap to ~30fps for perf
    if (ts - lastTime < 33) { requestAnimationFrame(draw); return; }
    lastTime = ts;

    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';

    const t = ts * 0.001;
    for (let i = 0; i < particles.length; i++){
      const p = particles[i];
      p.phase += 0.02 * p.wobble;
      p.x += p.vx + Math.sin(p.phase) * 0.15;
      p.y += p.vy;

      if (p.y < -8 || p.x < -8 || p.x > width + 8) {
        resetParticle(p);
      }

      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 8);
      grd.addColorStop(0, `hsla(${config.hue}, 90%, 64%, ${0.35 * p.alpha})`);
      grd.addColorStop(0.6, `hsla(${config.hue}, 85%, 55%, ${0.18 * p.alpha})`);
      grd.addColorStop(1, 'hsla(48, 90%, 64%, 0)');

      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  const ro = new ResizeObserver(() => resize());
  ro.observe(stack);
  window.addEventListener('resize', resize, { passive:true });
  window.addEventListener('orientationchange', () => setTimeout(resize, 120), { passive:true });

  init();
  requestAnimationFrame(draw);
})();
