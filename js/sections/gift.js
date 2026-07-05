/* ==========================================================================
   SECTIONS/GIFT.JS
   Section 9 — Surprise Gift
   Opening is a one-time action: clicking or pressing Enter/Space on the
   box adds .is-open (see gift.css for the lid-flies-off / glow-burst
   animation this triggers), fires confetti, and reveals the message.
   ========================================================================== */

const Gift = (() => {
  let sectionEl, boxEl, hintEl, revealEl, heartsContainer;
  let hasOpened = false;
  let reduceMotion = false;
  let heartInterval;

  function cacheDom() {
    sectionEl = document.getElementById('gift');
    boxEl = document.getElementById('gift-box');
    hintEl = document.getElementById('gift-hint');
    revealEl = document.getElementById('gift-reveal');
    heartsContainer = sectionEl?.querySelector('.gift__hearts');
  }

  function launchConfetti() {
    if (!window.confetti) return;
    confetti({
      particleCount: 130,
      spread: 100,
      origin: { y: 0.55 },
      colors: ['#2563EB', '#3B82F6', '#FBBF24', '#FF7EB6', '#FFFFFF'],
      disableForReducedMotion: true,
    });
    // A quick second burst for a fuller "explosion" moment
    setTimeout(() => {
      confetti({
        particleCount: 70,
        spread: 120,
        startVelocity: 45,
        origin: { y: 0.5 },
        colors: ['#FBBF24', '#FF7EB6'],
        disableForReducedMotion: true,
      });
    }, 150);
  }

  function openGift() {
    if (hasOpened) return;
    hasOpened = true;

    boxEl.classList.add('is-open');
    boxEl.setAttribute('aria-disabled', 'true');
    hintEl.classList.add('is-hidden');

    launchConfetti();

    setTimeout(() => {
      revealEl.classList.add('is-visible');
    }, reduceMotion ? 100 : 500);
  }

  function bindEvents() {
    boxEl.addEventListener('click', openGift);
    boxEl.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openGift();
      }
    });
  }

  function startAmbientHearts() {
    if (reduceMotion || !heartsContainer) return;
    heartInterval = setInterval(() => Effects.spawnHeart(heartsContainer), 1300);
  }

  function observeSection() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            startAmbientHearts();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );
    observer.observe(sectionEl);
  }

  function init() {
    cacheDom();
    if (!sectionEl || !boxEl) return;

    reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    bindEvents();
    observeSection();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', Gift.init);