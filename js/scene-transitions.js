/* ==========================================================================
   SCENE-TRANSITIONS.JS
   Drives the cinematic cross-fade between top-level sections (see
   scene-transitions.css). Uses native scroll the whole time — nothing
   here overrides or "hijacks" the scrollbar/trackpad/swipe, it only
   toggles classes in response to normal scroll position. That keeps
   mobile swipe, keyboard scrolling, and screen readers all working
   exactly as they would on a plain page.

   How a scene is marked up (see index.html):
     <section class="scene" id="gallery">...</section>
   A scene that already has its own bespoke entrance (the Welcome hero's
   GSAP timeline) opts out of the generic "fade up from nothing" entrance
   with `data-scene-skip-entrance`, but still participates in receding
   once the story scrolls past it.
   ========================================================================== */

const SceneTransitions = (() => {
  let scenes = [];
  let reduceMotion = false;
  let ticking = false;

  function init() {
    reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    scenes = Array.from(document.querySelectorAll('.scene'));
    if (!scenes.length) return;

    if (reduceMotion) {
      // CSS's own reduced-motion override already forces full visibility;
      // still add is-active so nothing depends on a class that never arrives.
      scenes.forEach(scene => scene.classList.add('is-active'));
      return;
    }

    scenes.forEach(scene => {
      scene.classList.add(scene.dataset.sceneSkipEntrance ? 'is-active' : 'is-entering');
    });

    const observer = new IntersectionObserver(handleEntrance, {
      threshold: 0.2,
      rootMargin: '0px 0px -10% 0px',
    });
    scenes.forEach(scene => observer.observe(scene));

    window.addEventListener('scroll', requestRecedeCheck, { passive: true });
    requestRecedeCheck(); // set correct initial state without waiting for the first scroll
  }

  /** A scene becomes .is-active the first time it meaningfully enters view. */
  function handleEntrance(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('is-entering', 'is-receded');
        entry.target.classList.add('is-active');
      }
    });
  }

  /** rAF-throttled so this never runs more than once per frame while scrolling. */
  function requestRecedeCheck() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateRecededState();
      ticking = false;
    });
  }

  /**
   * A scene "recedes" once it has scrolled mostly above the viewport —
   * i.e. the story has moved on from it — and un-recedes if the person
   * scrolls back up to revisit it.
   */
  function updateRecededState() {
    const recedeLine = window.innerHeight * 0.15;

    scenes.forEach(scene => {
      if (!scene.classList.contains('is-active') && !scene.classList.contains('is-receded')) {
        return; // hasn't been reached yet — leave it in .is-entering
      }
      const { bottom } = scene.getBoundingClientRect();
      const shouldRecede = bottom < recedeLine;

      scene.classList.toggle('is-receded', shouldRecede);
      scene.classList.toggle('is-active', !shouldRecede);
    });
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', SceneTransitions.init);