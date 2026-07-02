/* ==========================================================================
   UTILS/EFFECTS.JS
   Shared ambient-effect spawners used across sections (Loading, Welcome,
   Celebration, etc). Purely mechanical: creates a DOM node, positions it
   randomly, cleans itself up after its animation finishes. Each section's
   own CSS decides *color/glow* via a scoped selector (e.g.
   `.welcome__hearts .floating-heart`), so this file never sets color —
   that keeps the visual language consistent while letting each section
   tint its ambience differently.
   ========================================================================== */

const Effects = (() => {
  /**
   * Spawns one floating heart (Font Awesome icon + .floating-heart from
   * base.css) into `container`, at a random horizontal position, and
   * removes it once its rise animation completes.
   */
  function spawnHeart(container, { size, duration, xPercent } = {}) {
    if (!container) return null;

    const heart = document.createElement('i');
    heart.className = 'fa-solid fa-heart floating-heart';
    heart.setAttribute('aria-hidden', 'true');

    const x = xPercent ?? Math.random() * 100;
    const s = size ?? 0.9 + Math.random() * 1.1;
    const dur = duration ?? 6 + Math.random() * 4;

    heart.style.setProperty('--x', `${x}%`);
    heart.style.setProperty('--size', `${s}rem`);
    heart.style.animationDuration = `${dur}s`;

    container.appendChild(heart);
    setTimeout(() => heart.remove(), dur * 1000 + 200);
    return heart;
  }

  /**
   * Spawns one twinkling sparkle (.sparkle from base.css) at a random
   * point in `container`.
   */
  function spawnSparkle(container, { duration } = {}) {
    if (!container) return null;

    const sparkle = document.createElement('span');
    sparkle.className = 'sparkle';
    sparkle.textContent = '✦';
    sparkle.setAttribute('aria-hidden', 'true');

    sparkle.style.left = `${Math.random() * 100}%`;
    sparkle.style.top = `${Math.random() * 100}%`;
    const dur = duration ?? 1.8 + Math.random() * 1.2;
    sparkle.style.animationDuration = `${dur}s`;

    container.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), dur * 1000 + 400);
    return sparkle;
  }

  /**
   * Spawns one rising balloon (.balloon, styled in welcome.css) into
   * `container`. Color is chosen randomly from the palette-safe set
   * defined in CSS (`--royal`, `--gold`, `--pink`, `--white`), weighted
   * so gold/pink stay rare accents rather than dominating the field.
   */
  function spawnBalloon(container, { xPercent, duration } = {}) {
    if (!container) return null;

    const colorRoll = Math.random();
    const colorClass =
      colorRoll < 0.5 ? 'balloon--royal' :
      colorRoll < 0.75 ? 'balloon--white' :
      colorRoll < 0.9 ? 'balloon--pink' :
      'balloon--gold'; // rarest — gold stays a special accent

    const balloon = document.createElement('div');
    balloon.className = `balloon ${colorClass}`;
    balloon.setAttribute('aria-hidden', 'true');
    balloon.innerHTML = '<span class="balloon__string"></span>';

    const x = xPercent ?? Math.random() * 100;
    const dur = duration ?? 10 + Math.random() * 6;
    const scale = 0.8 + Math.random() * 0.5;

    balloon.style.setProperty('--x', `${x}%`);
    balloon.style.setProperty('--scale', scale);
    balloon.style.animationDuration = `${dur}s`;

    container.appendChild(balloon);
    setTimeout(() => balloon.remove(), dur * 1000 + 200);
    return balloon;
  }

  return { spawnHeart, spawnSparkle, spawnBalloon };
})();