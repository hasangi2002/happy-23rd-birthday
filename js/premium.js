/* ==========================================================
   PREMIUM GLOBAL ENHANCEMENTS
   Site-wide controller: page transition, scroll progress,
   cursor glow, ripple effect, and section reveals. Back-to-top
   behavior lives in js/main.js and floating particles come from
   js/aurora.js — intentionally not duplicated here. Written for
   performance: scroll-triggered visuals use a single rAF loop or
   IntersectionObserver (never a raw scroll listener per feature),
   and all listeners are passive where possible.
   ========================================================== */

(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarsePointer = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* ---------------- page transition (load fade) ---------------- */

  function initPageTransition() {
    const overlay = document.createElement('div');
    overlay.className = 'page-transition';
    document.body.appendChild(overlay);
    window.addEventListener(
      'load',
      () => {
        requestAnimationFrame(() => {
          overlay.classList.add('is-hidden');
          setTimeout(() => overlay.remove(), 1000);
        });
      },
      { once: true }
    );
  }

  /* ---------------- scroll progress bar ---------------- */
  /* Note: the back-to-top button's own show/hide + click-to-scroll
     logic already lives in js/main.js (App.initBackToTop) — it is
     intentionally NOT duplicated here to avoid two scroll listeners
     and two click handlers fighting over the same button. */

  function initScrollProgress() {
    const progressFill = document.getElementById('scroll-progress-fill');
    if (!progressFill) return;

    let ticking = false;

    function update() {
      ticking = false;
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;
      const progress = scrollHeight > 0 ? Math.min(scrollTop / scrollHeight, 1) : 0;
      progressFill.style.transform = `scaleX(${progress})`;
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }

  /* ---------------- cursor glow ---------------- */

  function initCursorGlow() {
    if (isCoarsePointer || prefersReducedMotion) return;

    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    glow.setAttribute('aria-hidden', 'true');
    document.body.appendChild(glow);

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let active = false;

    window.addEventListener(
      'mousemove',
      (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
        if (!active) {
          active = true;
          glow.classList.add('is-active');
        }
      },
      { passive: true }
    );

    window.addEventListener('mouseleave', () => glow.classList.remove('is-active'));

    function loop() {
      // gentle easing so the glow trails the cursor rather than snapping to it
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      glow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  /* ---------------- button ripple effect ---------------- */
  /* Renders into its own floating overlay (matched to the target's
     bounding box) rather than setting overflow:hidden on the target
     itself — mutating the target was clipping things like the tissue
     box's pop-out animation, which intentionally moves outside its
     own box. Elements can opt out entirely with [data-no-ripple]. */

  function initRippleEffect() {
    const selector = 'button, .btn, [role="button"]';

    document.addEventListener(
      'click',
      (e) => {
        const target = e.target.closest(selector);
        if (!target || target.disabled || target.hasAttribute('data-no-ripple')) return;

        const rect = target.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const style = window.getComputedStyle(target);

        const overlay = document.createElement('span');
        overlay.className = 'premium-ripple-overlay';
        overlay.style.left = rect.left + 'px';
        overlay.style.top = rect.top + 'px';
        overlay.style.width = rect.width + 'px';
        overlay.style.height = rect.height + 'px';
        overlay.style.borderRadius = style.borderRadius;

        const ripple = document.createElement('span');
        ripple.className = 'premium-ripple';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = e.clientX - rect.left - size / 2 + 'px';
        ripple.style.top = e.clientY - rect.top - size / 2 + 'px';

        overlay.appendChild(ripple);
        document.body.appendChild(overlay);
        ripple.addEventListener('animationend', () => overlay.remove());
      },
      { passive: true }
    );
  }

  /* ---------------- floating particles ---------------- */
  /* Note: aurora.js already draws a full-viewport, twinkling
     blue/gold particle field on #aurora-canvas — that IS the
     site's floating-particles layer, so a second canvas here
     would just double the draw cost and visually compete with
     it. Nothing to add; see js/aurora.js's Aurora module. */

  /* ---------------- section reveal animations ---------------- */

  function initSectionReveals() {
    const targets = document.querySelectorAll('[data-reveal]');
    if (!targets.length) return;

    if (prefersReducedMotion) {
      targets.forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = Number(entry.target.dataset.revealDelay || 0);
            setTimeout(() => entry.target.classList.add('is-revealed'), delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -8% 0px' }
    );

    targets.forEach((el, groupIndex) => {
      // small stagger for elements that share a parent reveal group
      if (!el.dataset.revealDelay) {
        const siblingIndex = Array.prototype.indexOf.call(el.parentElement ? el.parentElement.children : [], el);
        el.dataset.revealDelay = String(Math.min(siblingIndex, 4) * 90);
      }
      observer.observe(el);
    });
  }

  /* ---------------- boot ---------------- */

  function boot() {
    initPageTransition();
    initScrollProgress();
    initCursorGlow();
    initRippleEffect();
    initSectionReveals();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();