/* ==========================================================================
   SECTIONS/WELCOME.JS
   Section 2 — Welcome Screen
   Waits for the `loadingComplete` event (dispatched by loading.js) before
   revealing itself and starting its ambient effects — so nothing here
   wastes cycles animating behind an opaque loading screen.
   ========================================================================== */

const WelcomeScreen = (() => {
  let sectionEl, eyebrowEl, titleEl, subtitleEl, ctaEl, heartsContainer, balloonsContainer, audioEl;
  let heartInterval, balloonInterval;
  let reduceMotion = false;
  let hasOpened = false;

  function cacheDom() {
    sectionEl = document.getElementById('welcome');
    eyebrowEl = sectionEl?.querySelector('.welcome__eyebrow');
    titleEl = sectionEl?.querySelector('.welcome__title');
    subtitleEl = sectionEl?.querySelector('.welcome__subtitle');
    ctaEl = document.getElementById('open-surprise-btn');
    heartsContainer = sectionEl?.querySelector('.welcome__hearts');
    balloonsContainer = sectionEl?.querySelector('.welcome__balloons');
    audioEl = document.getElementById('bg-music');
  }

  /**
   * Initializes particles.js into the section's mount div. Density is
   * reduced on small screens for performance, and movement is disabled
   * entirely for reduced-motion users (leaving a static, subtle field
   * rather than skipping it altogether).
   */
  function initParticles() {
    if (!window.particlesJS) return; // fails gracefully if the CDN is blocked

    const isMobile = window.innerWidth < 768;

    particlesJS('particles-js', {
      particles: {
        number: { value: isMobile ? 25 : 55, density: { enable: true, value_area: 900 } },
        color: { value: ['#60a5fa', '#93c5fd', '#ffffff'] },
        shape: { type: 'circle' },
        opacity: { value: 0.5, random: true, anim: { enable: true, speed: 0.4, opacity_min: 0.1 } },
        size: { value: 2.2, random: true },
        line_linked: { enable: false },
        move: {
          enable: !reduceMotion,
          speed: 0.4,
          direction: 'top',
          random: true,
          straight: false,
          out_mode: 'out',
        },
      },
      interactivity: {
        events: { onhover: { enable: false }, onclick: { enable: false } },
      },
      retina_detect: true,
    });
  }

  /**
   * Reveals the hero copy + CTA. Uses GSAP when available for a refined,
   * staggered fade-up; otherwise falls back to the CSS transition path
   * defined in welcome.css (`.welcome.no-gsap.is-revealed`).
   */
  function revealContent() {
    if (window.gsap && !reduceMotion) {
      gsap.timeline()
        .to(eyebrowEl, { opacity: 1, y: 0, duration: 0.7 })
        .to(titleEl, { opacity: 1, y: 0, duration: 0.9 }, '-=0.45')
        .to(subtitleEl, { opacity: 1, y: 0, duration: 0.9 }, '-=0.55')
        .to(ctaEl, { opacity: 1, y: 0, duration: 0.7, ease: 'back.out(1.6)' }, '-=0.45');
    } else if (window.gsap && reduceMotion) {
      // Still use GSAP (so nothing is left permanently invisible if JS
      // depends on it later) but skip the theatrics — instant reveal.
      gsap.set([eyebrowEl, titleEl, subtitleEl, ctaEl], { opacity: 1, y: 0 });
    } else {
      sectionEl.classList.add('no-gsap', 'is-revealed');
    }
  }

  function startAmbientEffects() {
    if (reduceMotion) return;

    heartInterval = setInterval(() => Effects.spawnHeart(heartsContainer), 1400);
    balloonInterval = setInterval(() => Effects.spawnBalloon(balloonsContainer), 2600);

    // seed the scene so it's not empty the moment it's revealed
    for (let i = 0; i < 3; i++) {
      setTimeout(() => Effects.spawnHeart(heartsContainer), i * 400);
      setTimeout(() => Effects.spawnBalloon(balloonsContainer), i * 700);
    }
  }

  /**
   * Fires a layered confetti celebration: one big center burst plus two
   * side "cannons," all in palette colors. Respects reduced motion via
   * canvas-confetti's own `disableForReducedMotion` flag.
   */
  function launchConfetti() {
    if (!window.confetti) return;

    const palette = ['#2563EB', '#3B82F6', '#FBBF24', '#FF7EB6', '#FFFFFF'];

    confetti({
      particleCount: 140,
      spread: 100,
      origin: { y: 0.6 },
      colors: palette,
      disableForReducedMotion: true,
    });

    setTimeout(() => {
      confetti({ particleCount: 60, angle: 60, spread: 70, origin: { x: 0 }, colors: palette, disableForReducedMotion: true });
      confetti({ particleCount: 60, angle: 120, spread: 70, origin: { x: 1 }, colors: palette, disableForReducedMotion: true });
    }, 200);
  }

  /** A denser one-off burst of balloons, on top of the ambient trickle. */
  function launchBalloonBurst() {
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        Effects.spawnBalloon(balloonsContainer, { xPercent: 10 + Math.random() * 80 });
      }, i * 120);
    }
  }

  function startMusic() {
    if (!audioEl) return;
    audioEl.volume = 0.6;
    // Autoplay is blocked until a user gesture — this click IS that gesture.
    audioEl.play().catch(() => {
      // If it still fails (e.g. no audio file present yet), fail silently
      // rather than breaking the celebration.
    });
  }

  /**
   * Smoothly scrolls to whatever section follows Welcome in the DOM.
   * Written generically so it keeps working as we add the Photo Gallery,
   * Reasons, etc. — no changes needed here later.
   */
  function goToNextSection() {
    const next = sectionEl.nextElementSibling;
    if (next) {
      next.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }
  }

  function handleOpenSurprise() {
    if (hasOpened) return; // one-time "unlock" — avoid repeated audio/confetti spam
    hasOpened = true;

    ctaEl.disabled = true;
    ctaEl.setAttribute('aria-disabled', 'true');

    launchConfetti();
    launchBalloonBurst();
    startMusic();

    // Give the celebration a moment to read before moving on.
    setTimeout(goToNextSection, reduceMotion ? 200 : 900);
  }

  function init() {
    cacheDom();
    if (!sectionEl) return;

    reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    ctaEl.addEventListener('click', handleOpenSurprise);

    window.addEventListener('loadingComplete', () => {
      initParticles();
      revealContent();
      startAmbientEffects();
    }, { once: true });
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', WelcomeScreen.init);