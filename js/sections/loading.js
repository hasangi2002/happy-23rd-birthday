/* ==========================================================================
   SECTIONS/LOADING.JS
   Section 1 — Loading Screen
   Runs immediately on DOMContentLoaded (independent of App.init, since it
   must appear before anything else). On completion it:
     1. Fades the loading screen out
     2. Unlocks body scroll
     3. Dispatches a `loadingComplete` event on window, which the Welcome
        Screen (built next) listens for to start its entrance + music.
   ========================================================================== */

const LoadingScreen = (() => {
  let screenEl, ringProgressEl, percentageEl, heartsContainer, sparklesContainer;
  let heartInterval, sparkleInterval;
  let reduceMotion = false;

  const RING_RADIUS = 52;
  const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
  const TOTAL_DURATION = 3200; // ms — how long the count-up to 100% takes

  function cacheDom() {
    screenEl = document.getElementById('loading-screen');
    ringProgressEl = document.querySelector('.loader__ring-progress');
    percentageEl = document.getElementById('loading-percentage');
    heartsContainer = document.querySelector('.loading-screen__hearts');
    sparklesContainer = document.querySelector('.loading-screen__sparkles');
  }

  function setRingDasharray() {
    ringProgressEl.style.strokeDasharray = `${RING_CIRCUMFERENCE}`;
    ringProgressEl.style.strokeDashoffset = `${RING_CIRCUMFERENCE}`;
  }

  function updateProgress(percent) {
    const clamped = Math.min(100, Math.max(0, percent));
    const offset = RING_CIRCUMFERENCE - (RING_CIRCUMFERENCE * clamped) / 100;
    ringProgressEl.style.strokeDashoffset = offset;
    percentageEl.textContent = `${Math.round(clamped)}%`;
    percentageEl.setAttribute('aria-live', 'polite');
  }

  /**
   * Counts 0 -> 100 with gentle easing so it doesn't feel like a flat
   * linear progress bar. Uses GSAP if present, otherwise a rAF fallback
   * so the loader still works if the CDN is slow/blocked.
   */
  function animateProgress(onComplete) {
    if (window.gsap) {
      const counter = { value: 0 };
      gsap.to(counter, {
        value: 100,
        duration: TOTAL_DURATION / 1000,
        ease: 'power2.inOut',
        onUpdate: () => updateProgress(counter.value),
        onComplete,
      });
    } else {
      const start = performance.now();
      function tick(now) {
        const elapsed = now - start;
        const t = Math.min(1, elapsed / TOTAL_DURATION);
        // simple ease-in-out
        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        updateProgress(eased * 100);
        if (t < 1) {
          requestAnimationFrame(tick);
        } else {
          onComplete();
        }
      }
      requestAnimationFrame(tick);
    }
  }

  /**
   * Spawns ambient hearts/sparkles via the shared Effects utility (see
   * js/utils/effects.js). This section's blue tint comes from the
   * `.loading-screen__hearts .floating-heart` / `.loading-screen__sparkles
   * .sparkle` color overrides in loading.css — Effects itself stays
   * color-agnostic so it can be reused by other sections unchanged.
   */
  function startAmbientEffects() {
    if (reduceMotion) return; // keep the screen calm for reduced-motion users

    heartInterval = setInterval(() => Effects.spawnHeart(heartsContainer), 550);
    sparkleInterval = setInterval(() => Effects.spawnSparkle(sparklesContainer), 350);

    // seed a few immediately so it doesn't feel empty on first paint
    for (let i = 0; i < 5; i++) {
      setTimeout(() => Effects.spawnHeart(heartsContainer), i * 150);
      setTimeout(() => Effects.spawnSparkle(sparklesContainer), i * 100);
    }
  }

  function stopAmbientEffects() {
    clearInterval(heartInterval);
    clearInterval(sparkleInterval);
  }

  function completeLoading() {
    stopAmbientEffects();

    // brief pause at 100% so the user registers it finished, then fade out
    setTimeout(() => {
      screenEl.classList.add('is-hidden');

      screenEl.addEventListener('animationend', () => {
        screenEl.style.display = 'none';
        document.body.classList.remove('is-loading');
        window.dispatchEvent(new CustomEvent('loadingComplete'));
      }, { once: true });

    }, reduceMotion ? 150 : 500);
  }

  function init() {
    cacheDom();
    if (!screenEl) return;

    reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    setRingDasharray();
    document.body.classList.add('is-loading');

    if (reduceMotion) {
      // Skip the count-up theatrics; jump straight to a quick, calm finish
      updateProgress(100);
      completeLoading();
      return;
    }

    startAmbientEffects();
    animateProgress(completeLoading);
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', LoadingScreen.init);