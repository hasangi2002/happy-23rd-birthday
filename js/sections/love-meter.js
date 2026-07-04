/* ==========================================================================
   SECTIONS/LOVE-METER.JS
   Section 5 — Love Meter
   Runs the scan once when the section first scrolls into view (via
   IntersectionObserver, same pattern as Reasons). The percentage doesn't
   climb smoothly — it jumps through a fixed checkpoint sequence, like a
   scanner glitching its way to a conclusion, with a deliberate stall at
   99% for comic effect before "overflowing" past 100%.
   ========================================================================== */

const LoveMeter = (() => {
  // Edit this to change the checkpoint sequence — the bar/number always
  // animates through whatever values are listed here, in order.
  const CHECKPOINTS = [10, 35, 67, 82, 99, 100];

  let sectionEl, cardEl, statusEl, fillEl, percentageEl, resultEl;
  let heartsContainer, sparklesContainer;
  let heartInterval, sparkleInterval;
  let reduceMotion = false;
  let hasRun = false;

  function cacheDom() {
    sectionEl = document.getElementById('love-meter');
    cardEl = sectionEl?.querySelector('.love-meter__card');
    statusEl = document.getElementById('love-meter-status');
    fillEl = document.getElementById('love-meter-fill');
    percentageEl = document.getElementById('love-meter-percentage');
    resultEl = document.getElementById('love-meter-result');
    heartsContainer = sectionEl?.querySelector('.love-meter__hearts');
    sparklesContainer = sectionEl?.querySelector('.love-meter__sparkles');
  }

  function updateDisplay(value) {
    const rounded = Math.round(value);
    fillEl.style.width = `${Math.min(rounded, 100)}%`;
    percentageEl.textContent = `${rounded}%`;
  }

  function startAmbientEffects() {
    if (reduceMotion) return;
    heartInterval = setInterval(() => Effects.spawnHeart(heartsContainer), 900);
    sparkleInterval = setInterval(() => Effects.spawnSparkle(sparklesContainer), 500);
  }

  function stopAmbientEffects() {
    clearInterval(heartInterval);
    clearInterval(sparkleInterval);
  }

  /** A denser one-off heart burst for the "capacity reached" payoff moment. */
  function launchHeartBurst() {
    for (let i = 0; i < 10; i++) {
      setTimeout(() => Effects.spawnHeart(heartsContainer, { duration: 3.5 + Math.random() * 2 }), i * 70);
    }
  }

  function launchConfettiBurst() {
    if (!window.confetti) return;
    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#2563EB', '#3B82F6', '#FBBF24', '#FF7EB6'],
      disableForReducedMotion: true,
    });
  }

  /**
   * Reveals the "ERROR / Maximum Capacity Reached" message: a brief
   * glitch-shake on the card, then the message fades in underneath.
   */
  function revealResult() {
    cardEl.classList.add('is-maxed');
    statusEl.textContent = 'Scan Complete';

    if (!reduceMotion) {
      cardEl.classList.add('is-glitching');
      setTimeout(() => cardEl.classList.remove('is-glitching'), 800);
    }

    setTimeout(() => {
      resultEl.classList.add('is-visible');
      launchHeartBurst();
      launchConfettiBurst();
    }, reduceMotion ? 100 : 500);
  }

  /**
   * Steps the counter through CHECKPOINTS with GSAP (or a plain-JS
   * fallback), pausing longest right before the final "overflow" jump
   * to 100 — that's the comic beat the brief is going for.
   */
  function runScan() {
    if (hasRun) return;
    hasRun = true;

    startAmbientEffects();

    if (reduceMotion) {
      updateDisplay(100);
      stopAmbientEffects();
      revealResult();
      return;
    }

    const counter = { value: 0 };

    if (window.gsap) {
      const tl = gsap.timeline({
        onComplete: () => {
          stopAmbientEffects();
          revealResult();
        },
      });

      CHECKPOINTS.forEach((checkpoint, i) => {
        const isLastJump = i === CHECKPOINTS.length - 1; // the 99 -> 100 "overflow" beat
        tl.to(counter, {
          value: checkpoint,
          duration: isLastJump ? 0.5 : 0.55,
          ease: 'power1.out',
          onUpdate: () => updateDisplay(counter.value),
        });
        if (checkpoint === 99) {
          tl.to({}, { duration: 0.9 }); // the deliberate "stuck at 99%" stall
        }
      });
    } else {
      // Plain-JS fallback if the GSAP CDN fails: step through immediately.
      let i = 0;
      const step = () => {
        if (i >= CHECKPOINTS.length) {
          stopAmbientEffects();
          revealResult();
          return;
        }
        updateDisplay(CHECKPOINTS[i]);
        i++;
        setTimeout(step, CHECKPOINTS[i - 1] === 99 ? 1400 : 550);
      };
      step();
    }
  }

  function observeSection() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            runScan();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(sectionEl);
  }

  function init() {
    cacheDom();
    if (!sectionEl) return;

    reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    observeSection();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', LoveMeter.init);