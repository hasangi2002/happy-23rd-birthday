/* ==========================================================================
   AURORA.JS
   Signature ambient layer: a fixed <canvas> behind all content, drawing a
   slow field of soft blue/gold "starlight" particles with gentle drift and
   twinkle. Intentionally subtle — this is atmosphere, not a hero visual.

   Hand-rolled on Canvas (rather than particles.js) so we control the exact
   density, glow, and blue/gold palette that make this the site's throughline.
   particles.js is reserved for section-specific, denser effects (e.g. the
   Welcome Screen) where a heavier, more decorative field fits better.
   ========================================================================== */

const Aurora = (() => {
  let canvas, ctx, particles = [], animationId;
  let width, height;
  let reduceMotion = false;

  const PARTICLE_COUNT_DESKTOP = 70;
  const PARTICLE_COUNT_MOBILE = 30;

  function init() {
    canvas = document.getElementById('aurora-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    resize();
    createParticles();
    window.addEventListener('resize', debounce(resize, 200));

    if (!reduceMotion) {
      animate();
    } else {
      // Draw a single static frame for reduced-motion users
      draw();
    }
  }

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    createParticles();
  }

  function createParticles() {
    const count = window.innerWidth < 768 ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP;
    particles = Array.from({ length: count }, () => spawnParticle());
  }

  function spawnParticle() {
    const isGold = Math.random() < 0.15; // gold particles are rare, like the accent itself
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.6 + 0.4,
      baseAlpha: Math.random() * 0.5 + 0.2,
      driftX: (Math.random() - 0.5) * 0.15,
      driftY: (Math.random() - 0.5) * 0.15,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinklePhase: Math.random() * Math.PI * 2,
      color: isGold ? '251, 191, 36' : '96, 165, 250' // gold : royal-glow, as rgb triplets
    };
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const time = performance.now() * 0.001;

    particles.forEach(p => {
      const twinkle = Math.sin(time * (p.twinkleSpeed * 60) + p.twinklePhase) * 0.3 + 0.7;
      const alpha = p.baseAlpha * twinkle;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color}, ${alpha * 0.15})`; // soft outer glow
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color}, ${alpha})`;
      ctx.fill();
    });
  }

  function update() {
    particles.forEach(p => {
      p.x += p.driftX;
      p.y += p.driftY;

      // wrap around edges so the field feels endless
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      if (p.y > height + 10) p.y = -10;
    });
  }

  function animate() {
    update();
    draw();
    animationId = requestAnimationFrame(animate);
  }

  function debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  return { init };
})();