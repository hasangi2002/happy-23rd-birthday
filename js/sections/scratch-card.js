/* ==========================================================================
   SECTIONS/SCRATCH-CARD.JS
   Section 6 — Scratch Card Surprise
   Draws a foil texture onto a <canvas> sitting over the reveal content,
   then erases it (via `globalCompositeOperation: 'destination-out'`)
   wherever the person drags a mouse or finger. Once enough of the foil
   is gone, it auto-fades away completely and the celebration fires.
   ========================================================================== */

const ScratchCard = (() => {
  const BRUSH_RADIUS = 22;           // px, at the canvas's own resolution
  const REVEAL_THRESHOLD = 0.55;     // fraction scratched before auto-completing
  const SAMPLE_STEP = 4;             // check every 4th pixel when measuring progress — plenty accurate, far cheaper than every pixel

  let canvas, ctx, panelEl, hintEl, continueBtn, glitterContainer;
  let isScratching = false;
  let lastPoint = null;
  let isRevealed = false;
  let reduceMotion = false;

  function cacheDom() {
    panelEl = document.getElementById('scratch-panel');
    canvas = document.getElementById('scratch-canvas');
    hintEl = document.getElementById('scratch-hint');
    continueBtn = document.getElementById('scratch-continue-btn');
    glitterContainer = panelEl?.querySelector('.scratch-card__glitter');
  }

  /** Sizes the canvas to match its displayed size (crisp on high-DPI screens) and paints the foil. */
  function setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = panelEl.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    drawFoil(rect.width, rect.height);
  }

  function drawFoil(width, height) {
    // Metallic diagonal gradient, in the site's blue palette rather than
    // generic grey foil — keeps it feeling premium instead of like a
    // lottery ticket.
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#94a3b8');
    gradient.addColorStop(0.35, '#475569');
    gradient.addColorStop(0.5, '#64748b');
    gradient.addColorStop(0.7, '#334155');
    gradient.addColorStop(1, '#94a3b8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Fine diagonal sheen lines for a foil-like texture
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2;
    for (let x = -height; x < width; x += 10) {
      ctx.beginPath();
      ctx.moveTo(x, height);
      ctx.lineTo(x + height, 0);
      ctx.stroke();
    }

    // "Scratch Here" prompt, drawn directly onto the foil so it
    // disappears naturally as the person scratches through it.
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = "600 22px 'Poppins', sans-serif";
    ctx.fillText('🎁 Scratch Here', width / 2, height / 2 - 4);
    ctx.font = "400 13px 'Poppins', sans-serif";
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText('use your mouse or finger', width / 2, height / 2 + 22);
  }

  function getCanvasPoint(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function eraseAt(point) {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(point.x, point.y, BRUSH_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /** Erases a smooth stroke between two points so fast drags don't leave gaps. */
  function eraseLine(from, to) {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = BRUSH_RADIUS * 2;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.restore();
  }

  function spawnGlitter(point) {
    if (reduceMotion || !glitterContainer) return;
    const glitter = document.createElement('span');
    glitter.className = 'glitter-particle';
    glitter.style.left = `${point.x}px`;
    glitter.style.top = `${point.y}px`;
    glitter.style.setProperty('--gx', `${(Math.random() - 0.5) * 40}px`);
    glitter.style.setProperty('--gy', `${-10 - Math.random() * 30}px`);
    glitterContainer.appendChild(glitter);
    setTimeout(() => glitter.remove(), 650);
  }

  /**
   * Samples the canvas at a coarse stride to estimate what fraction has
   * been erased. Cheap enough to run on every pointerup rather than
   * needing heavy throttling.
   */
  function getScratchedFraction() {
    const { width, height } = canvas;
    const data = ctx.getImageData(0, 0, width, height).data;
    let transparent = 0;
    let total = 0;

    for (let i = 3; i < data.length; i += 4 * SAMPLE_STEP) {
      total++;
      if (data[i] < 20) transparent++; // alpha channel near zero = scratched away
    }
    return total === 0 ? 0 : transparent / total;
  }

  function checkProgress() {
    if (isRevealed) return;
    if (getScratchedFraction() >= REVEAL_THRESHOLD) {
      completeReveal();
    }
  }

  function completeReveal() {
    isRevealed = true;
    canvas.classList.add('is-revealed');
    hintEl.classList.add('is-hidden');

    launchCelebration();

    setTimeout(() => {
      continueBtn.hidden = false;
      requestAnimationFrame(() => continueBtn.classList.add('is-visible'));
    }, 400);
  }

  function launchCelebration() {
    if (window.confetti) {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.55 },
        colors: ['#2563EB', '#FBBF24', '#FF7EB6', '#FFFFFF'],
        disableForReducedMotion: true,
      });
    }
    // A little extra gold glitter burst right at the reveal moment
    if (!reduceMotion) {
      const rect = panelEl.getBoundingClientRect();
      for (let i = 0; i < 16; i++) {
        setTimeout(() => {
          spawnGlitter({ x: Math.random() * rect.width, y: Math.random() * rect.height });
        }, i * 40);
      }
    }
  }

  function handlePointerDown(e) {
    if (isRevealed) return;
    isScratching = true;
    hintEl.classList.add('is-hidden');
    canvas.setPointerCapture(e.pointerId);
    const point = getCanvasPoint(e);
    eraseAt(point);
    spawnGlitter(point);
    lastPoint = point;
  }

  function handlePointerMove(e) {
    if (!isScratching || isRevealed) return;
    const point = getCanvasPoint(e);
    if (lastPoint) eraseLine(lastPoint, point);
    if (Math.random() < 0.3) spawnGlitter(point); // throttle glitter density
    lastPoint = point;
  }

  function handlePointerUp() {
    if (!isScratching) return;
    isScratching = false;
    lastPoint = null;
    checkProgress();
  }

  function bindEvents() {
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointerleave', handlePointerUp);

    continueBtn.addEventListener('click', () => {
      const next = document.getElementById('scratch-card')?.nextElementSibling;
      next?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });

    // Redraw the foil on resize only if the person hasn't started
    // scratching yet — once they have, resizing just stretches the
    // existing texture via CSS rather than wiping their progress.
    window.addEventListener('resize', () => {
      if (!isScratching && !isRevealed && getScratchedFraction() < 0.02) {
        setupCanvas();
      }
    });
  }

  function init() {
    cacheDom();
    if (!canvas) return;

    reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setupCanvas();
    bindEvents();

    if (reduceMotion) {
      // Scratching a foil texture is itself a motion-heavy interaction;
      // offer the reveal immediately instead of requiring a drag gesture.
      completeReveal();
    }
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', ScratchCard.init);