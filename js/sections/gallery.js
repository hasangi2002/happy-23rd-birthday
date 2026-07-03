/* ==========================================================================
   SECTIONS/GALLERY.JS
   Section 3 — Romantic Photo Gallery
   Two responsibilities:
     1. Gracefully replace any <img> that fails to load (i.e. real photos
        haven't been dropped into assets/images/ yet) with a styled
        placeholder, instead of a browser's broken-image icon.
     2. Power the lightbox: open on click, navigate with prev/next or
        arrow keys, close on button/backdrop/Escape, trap focus while open.
   ========================================================================== */

const Gallery = (() => {
  let items = [];          // [{ img, fullSrc, caption }]
  let currentIndex = 0;
  let lastFocusedEl = null;

  let lightboxEl, lightboxImg, lightboxCaption, lightboxCounter,
      closeBtn, prevBtn, nextBtn;

  function cacheDom() {
    items = Array.from(document.querySelectorAll('.polaroid')).map(el => ({
      el,
      img: el.querySelector('img'),
      fullSrc: el.dataset.full || el.querySelector('img')?.src,
      caption: el.dataset.caption || '',
    }));

    lightboxEl = document.getElementById('gallery-lightbox');
    lightboxImg = document.getElementById('lightbox-img');
    lightboxCaption = document.getElementById('lightbox-caption');
    lightboxCounter = document.getElementById('lightbox-counter');
    closeBtn = document.getElementById('lightbox-close');
    prevBtn = document.getElementById('lightbox-prev');
    nextBtn = document.getElementById('lightbox-next');
  }

  /**
   * Swaps a failed <img> for a calm placeholder (icon + label) instead of
   * a broken-image glyph — keeps the gallery looking finished before the
   * real photos are added to assets/images/.
   */
  function handleMissingImages() {
    items.forEach(({ img, el }, index) => {
      if (!img) return;
      img.addEventListener('error', () => {
        const wrapper = img.parentElement; // .polaroid__photo
        wrapper.classList.add('polaroid__photo--empty');
        wrapper.innerHTML = `
          <i class="fa-solid fa-camera-retro" aria-hidden="true"></i>
          <span>Memory ${String(index + 1).padStart(2, '0')}</span>
        `;
      }, { once: true });
    });
  }

  function openLightbox(index) {
    currentIndex = index;
    lastFocusedEl = document.activeElement;
    updateLightboxContent();

    lightboxEl.classList.add('is-open');
    document.body.classList.add('modal-open');
    closeBtn.focus();

    document.addEventListener('keydown', handleKeydown);
  }

  function closeLightbox() {
    lightboxEl.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    document.removeEventListener('keydown', handleKeydown);
    lastFocusedEl?.focus();
  }

  function updateLightboxContent() {
    const { fullSrc, caption } = items[currentIndex];
    lightboxImg.src = fullSrc;
    lightboxImg.alt = caption || `Memory ${currentIndex + 1}`;
    lightboxCaption.textContent = caption;
    lightboxCounter.textContent = `${currentIndex + 1} / ${items.length}`;
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % items.length;
    updateLightboxContent();
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + items.length) % items.length;
    updateLightboxContent();
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  }

  function bindEvents() {
    items.forEach(({ el }, index) => {
      el.addEventListener('click', () => openLightbox(index));
      el.setAttribute('tabindex', '0');
      el.setAttribute('role', 'button');
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(index);
        }
      });
    });

    closeBtn.addEventListener('click', closeLightbox);
    nextBtn.addEventListener('click', showNext);
    prevBtn.addEventListener('click', showPrev);

    // click on the dark backdrop (not the content itself) closes it
    lightboxEl.addEventListener('click', e => {
      if (e.target === lightboxEl) closeLightbox();
    });
  }

  function init() {
    cacheDom();
    if (items.length === 0 || !lightboxEl) return;

    handleMissingImages();
    bindEvents();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', Gallery.init);