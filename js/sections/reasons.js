/* ==========================================================================
   SECTIONS/REASONS.JS
   Section 4 — Reasons Why I Love You

   Everything renders from the REASONS array below — to add, remove, or
   reorder reasons, just edit that array. Nothing else in this file needs
   to change; the numbering, stagger timing, and flip behavior all adapt
   automatically to however many reasons are listed.
   ========================================================================== */

const Reasons = (() => {
  /**
   * Edit this list freely — any length works, not just 20.
   * `emoji` shows on the card back next to the reason text.
   */
  const REASONS = [
    { emoji: '❤️', text: "Because you always make me smile." },
    { emoji: '💙', text: "Because you're endlessly patient with me." },
    { emoji: '🥺', text: "Because you support my dreams, even the big scary ones." },
    { emoji: '😂', text: "Because you make every ordinary day exciting." },
    { emoji: '🏏', text: "Because you never stop talking about cricket." },
    { emoji: '🤗', text: "Because your hugs fix almost everything." },
    { emoji: '📞', text: "Because you still call just to hear about my day." },
    { emoji: '🍜', text: "Because you remember exactly how I like my food." },
    { emoji: '🎧', text: "Because you send me songs that remind you of me." },
    { emoji: '🌧️', text: "Because you make rainy days feel cozy instead of gloomy." },
    { emoji: '💬', text: "Because you listen, really listen, when I'm overthinking." },
    { emoji: '😴', text: "Because you check on me even when you're exhausted." },
    { emoji: '🎉', text: "Because you celebrate my small wins like they're huge." },
    { emoji: '🧠', text: "Because you're the smartest person I know, and you don't show off about it." },
    { emoji: '🥴', text: "Because you laugh at my terrible jokes anyway." },
    { emoji: '🚗', text: "Because you'd drive anywhere just to see me for an hour." },
    { emoji: '📝', text: "Because you remember the little things I mention once." },
    { emoji: '🌙', text: "Because talking to you is the best part of my night." },
    { emoji: '🫶', text: "Because you love me exactly as I am, no edits needed." },
    { emoji: '♾️', text: "Because twenty reasons were never going to be enough." },
  ];

  const REVEAL_INTERVAL_MS = 1000; // "one by one every second," per the brief

  let gridEl, sectionEl, reduceMotion = false;

  /** Builds one flip-card's markup from a single reason. */
  function buildCardMarkup(reason, index) {
    const number = String(index + 1).padStart(2, '0');
    return `
      <div class="reason-card" tabindex="0" role="button"
           aria-label="Reason ${number}, tap to reveal">
        <div class="reason-card__inner">
          <div class="reason-card__face reason-card__face--front">
            <span class="reason-card__number">${number}</span>
            <i class="fa-solid fa-heart reason-card__icon" aria-hidden="true"></i>
            <span class="reason-card__hint">Tap to reveal</span>
          </div>
          <div class="reason-card__face reason-card__face--back">
            <span class="reason-card__emoji" aria-hidden="true">${reason.emoji}</span>
            <p class="reason-card__text">${reason.text}</p>
          </div>
        </div>
      </div>
    `;
  }

  function renderCards() {
    gridEl.innerHTML = REASONS.map(buildCardMarkup).join('');
  }

  function bindFlipEvents() {
    gridEl.querySelectorAll('.reason-card').forEach(card => {
      const toggle = () => card.classList.toggle('is-flipped');
      card.addEventListener('click', toggle);
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      });
    });
  }

  /**
   * Reveals cards at a strict one-per-second cadence once the section
   * scrolls into view. Runs once (IntersectionObserver disconnects after
   * the first trigger) so scrolling back up and down doesn't replay it.
   */
  function startTimedReveal() {
    const cards = Array.from(gridEl.querySelectorAll('.reason-card'));

    if (reduceMotion) {
      cards.forEach(card => card.classList.add('is-visible'));
      return;
    }

    let i = 0;
    const interval = setInterval(() => {
      if (i >= cards.length) {
        clearInterval(interval);
        return;
      }
      cards[i].classList.add('is-visible');
      i++;
    }, REVEAL_INTERVAL_MS);
  }

  function observeSection() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            startTimedReveal();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(sectionEl);
  }

  function init() {
    sectionEl = document.getElementById('reasons');
    gridEl = document.getElementById('reasons-grid');
    if (!sectionEl || !gridEl) return;

    reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    renderCards();
    bindFlipEvents();
    observeSection();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', Reasons.init);