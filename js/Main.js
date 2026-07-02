/* ==========================================================================
   MAIN.JS
   Global app bootstrap. Runs once on DOMContentLoaded.
   Handles: shared library init (AOS/GSAP), the aurora background,
   back-to-top button, and a lightweight section registry so each new
   section's script can plug in without touching this file's core logic.
   ========================================================================== */

const App = (() => {
  const sectionInitializers = [];

  /**
   * Sections call App.registerSection(fn) from their own <script> module
   * to hook into the shared startup sequence, keeping this file untouched
   * as we add Welcome, Gallery, Reasons, etc.
   */
  function registerSection(initFn) {
    if (typeof initFn === 'function') sectionInitializers.push(initFn);
  }

  function initLibraries() {
    // AOS — scroll reveal used across most sections
    if (window.AOS) {
      AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: true,
        offset: 60,
      });
    }

    // GSAP defaults — a shared "luxury" ease so every section's timeline
    // motion feels like part of the same experience.
    if (window.gsap) {
      gsap.defaults({ ease: 'power3.out', duration: 0.9 });
    }
  }

  function initBackToTop() {
    const btn = document.querySelector('.back-to-top');
    if (!btn) return;

    const toggle = () => {
      btn.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
    };

    window.addEventListener('scroll', toggle, { passive: true });
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    toggle();
  }

  function initSmoothAnchors() {
    // Native smooth scroll (html { scroll-behavior: smooth }) covers most
    // cases; this adds keyboard-accessible focus management for in-page links.
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        const targetId = link.getAttribute('href');
        if (targetId.length <= 1) return;
        const target = document.querySelector(targetId);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      });
    });
  }

  function init() {
    Aurora.init();
    initLibraries();
    initBackToTop();
    initSmoothAnchors();
    sectionInitializers.forEach(fn => fn());
  }

  return { init, registerSection };
})();

document.addEventListener('DOMContentLoaded', App.init);