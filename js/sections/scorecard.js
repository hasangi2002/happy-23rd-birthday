/* ==========================================================================
   SECTIONS/SCORECARD.JS
   Section 8 — Our Love Scorecard
   Wickets/Partnership/Status are static values revealed by the CSS
   power-on stagger alone (see .scorecard__board.is-live in scorecard.css) —
   no JS needed for those. Runs is the one stat that gets an active
   animation: an odometer-style spin through random numbers before
   "overflowing" into ∞, timed to land right as the stagger settles.
   ========================================================================== */

const Scorecard = (() => {
  const SPIN_DURATION_MS = 1100;   // how long the Runs odometer spins before landing on ∞
  const SPIN_TICK_MS = 45;

  let sectionEl, lightsEl, boardEl, runsEl, hasRun = false;
  let reduceMotion = false;

  function cacheDom() {
    sectionEl = document.getElementById('scorecard');
    lightsEl = sectionEl?.querySelector('.scorecard__lights');
    boardEl = document.getElementById('scorecard-board');
    runsEl = document.getElementById('score-runs');
  }

  /** Rapid, ever-larger random numbers — reads as a counter spinning out of control before it gives up and shows infinity. */
  function spinRunsCounter(onDone) {
    if (reduceMotion) {
      runsEl.textContent = '∞ ❤️';
      onDone();
      return;
    }

    const start = performance.now();
    const tick = () => {
      const elapsed = performance.now() - start;
      if (elapsed >= SPIN_DURATION_MS) {
        runsEl.textContent = '∞ ❤️';
        runsEl.classList.add('is-glitching');
        setTimeout(() => runsEl.classList.remove('is-glitching'), 350);
        onDone();
        return;
      }
      const magnitude = Math.floor((elapsed / SPIN_DURATION_MS) * 6) + 1; // digits grow as it spins
      const randomValue = Math.floor(Math.random() * Math.pow(10, magnitude));
      runsEl.textContent = randomValue.toLocaleString();
      setTimeout(tick, SPIN_TICK_MS);
    };
    tick();
  }

  /** A few emoji rising from random spots along the board, like a small crowd cheer. */
  function launchCrowdCheer() {
    if (reduceMotion || !boardEl) return;
    const cheers = ['🎉', '🏏', '👏', '❤️'];
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const cheer = document.createElement('span');
        cheer.className = 'scorecard__cheer';
        cheer.textContent = cheers[Math.floor(Math.random() * cheers.length)];
        cheer.style.left = `${10 + Math.random() * 80}%`;
        boardEl.appendChild(cheer);
        setTimeout(() => cheer.remove(), 2300);
      }, i * 180);
    }
  }

  function launchConfetti() {
    if (!window.confetti) return;
    confetti({
      particleCount: 80,
      spread: 75,
      origin: { y: 0.5 },
      colors: ['#2563EB', '#3B82F6', '#FBBF24'],
      disableForReducedMotion: true,
    });
  }

  function runSequence() {
    if (hasRun) return;
    hasRun = true;

    if (lightsEl) lightsEl.classList.add('is-active');
    boardEl.classList.add('is-live');

    // Let the floodlights/stagger begin, then spin the Runs counter so it
    // lands on ∞ right as the reveal settles.
    setTimeout(() => {
      spinRunsCounter(() => {
        launchCrowdCheer();
        launchConfetti();
      });
    }, reduceMotion ? 0 : 250);
  }

  function observeSection() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            runSequence();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.35 }
    );
    observer.observe(sectionEl);
  }

  function init() {
    cacheDom();
    if (!sectionEl || !boardEl) return;

    reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    observeSection();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', Scorecard.init);