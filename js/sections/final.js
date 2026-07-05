/* ==========================================================
   FINAL CHAPTER — SECTION 11
   Orchestrates the closing emotional sequence:
   heading glow -> typewriter -> note & tissue box -> letter
   reveal -> signature -> quiet celebration -> replay button.
   Runs once, triggered the first time #final enters view.
   ========================================================== */

(function () {
  const section = document.getElementById('final');
  if (!section) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const hero = document.getElementById('final-hero');
  const typewriterEl = document.getElementById('final-typewriter');
  const typewriterText = document.getElementById('final-typewriter-text');
  const cursor = document.getElementById('final-cursor');

  const noteRow = document.getElementById('final-note-row');
  const note = document.getElementById('final-note');
  const tissueWrap = document.getElementById('final-tissue-wrap');
  const tissueBox = document.getElementById('tissue-box');
  const tissueHearts = document.getElementById('tissue-hearts');
  const tissueMessage = document.getElementById('tissue-message');

  const letterStage = document.getElementById('final-letter-stage');
  const letterLinesWrap = document.getElementById('final-letter-lines');
  const letterCard = document.getElementById('final-letter');
  const signature = document.getElementById('final-signature');

  const replayBtn = document.getElementById('final-replay-btn');
  const replayRipple = replayBtn ? replayBtn.querySelector('.final__replay-ripple') : null;

  const heartsLayer = section.querySelector('.final__hearts');
  const particlesLayer = section.querySelector('.final__particles');
  const fireworksCanvas = document.getElementById('final-fireworks-canvas');

  const LETTER_PARAGRAPHS = [
    'I just wanna make you the happiest you\u2019ve ever been.',
    'I want to make you feel safe, loved, and comforted.',
    'I want to be your peace after every difficult day.',
    'I\u2019m always here for you.',
    'I love you at your best, and I love you at your worst.',
    'Nothing will ever change that.',
    'One day, all these \u2018I miss you\u2019 will become \u2018I\u2019m here now.\u2019',
    'And when that day comes... I\u2019ll hold you...',
    'Really hold you... the same way my heart has been holding you all this time.'
  ];

  const TYPEWRITER_LINES = [
    'No matter how many birthdays pass...',
    '',
    'I\u2019ll always choose you.',
    '',
    'Forever.'
  ].join('\n');

  let hasRun = false;

  /* ---------------- ambient: floating hearts & particles ---------------- */

  function spawnFloatingHeart() {
    if (!heartsLayer) return;
    const heart = document.createElement('span');
    heart.className = 'final__floating-heart';
    heart.textContent = Math.random() > 0.5 ? '\u2764' : '\uD83D\uDC99';
    const size = 12 + Math.random() * 16;
    heart.style.left = Math.random() * 100 + '%';
    heart.style.fontSize = size + 'px';
    heart.style.setProperty('--drift', (Math.random() * 80 - 40) + 'px');
    heart.style.animationDuration = 7 + Math.random() * 6 + 's';
    heartsLayer.appendChild(heart);
    setTimeout(() => heart.remove(), 14000);
  }

  function spawnFloatingParticle() {
    if (!particlesLayer) return;
    const p = document.createElement('span');
    p.className = 'final__floating-particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.setProperty('--drift', (Math.random() * 60 - 30) + 'px');
    p.style.animationDuration = 9 + Math.random() * 7 + 's';
    particlesLayer.appendChild(p);
    setTimeout(() => p.remove(), 17000);
  }

  let ambientInterval = setInterval(() => {
    spawnFloatingHeart();
    spawnFloatingParticle();
  }, 900);

  function boostAmbient() {
    clearInterval(ambientInterval);
    ambientInterval = setInterval(() => {
      spawnFloatingHeart();
      spawnFloatingParticle();
      spawnFloatingHeart();
    }, 400);
  }

  /* ---------------- Part 1: hero heading ---------------- */

  function revealHero() {
    if (window.gsap && !prefersReducedMotion) {
      gsap.to(hero, { opacity: 1, y: 0, duration: 1.1, ease: 'power2.out' });
    } else {
      hero.style.opacity = '1';
      hero.style.transform = 'translateY(0)';
    }
  }

  /* ---------------- Part 2: typewriter ---------------- */

  function runTypewriter(onDone) {
    typewriterEl.style.opacity = '1';
    if (prefersReducedMotion) {
      typewriterText.textContent = TYPEWRITER_LINES;
      onDone();
      return;
    }
    let i = 0;
    const speed = 42;
    function typeChar() {
      if (i <= TYPEWRITER_LINES.length) {
        typewriterText.textContent = TYPEWRITER_LINES.slice(0, i);
        i++;
        setTimeout(typeChar, speed);
      } else {
        setTimeout(onDone, 2000); // pause 2s after typing finishes
      }
    }
    typeChar();
  }

  /* ---------------- Part 3: note + tissue box ---------------- */

  function revealNote(onDone) {
    note.classList.add('is-placed');
    if (tissueWrap) tissueWrap.classList.add('is-visible');
    setTimeout(onDone, 1200);
  }

  function spawnMiniHearts() {
    if (!tissueHearts) return;
    for (let n = 0; n < 6; n++) {
      setTimeout(() => {
        const h = document.createElement('span');
        h.className = 'final__mini-heart';
        h.textContent = '\u2764';
        h.style.left = 30 + Math.random() * 40 + '%';
        tissueHearts.appendChild(h);
        setTimeout(() => h.remove(), 1500);
      }, n * 120);
    }
  }

  if (tissueBox) {
    const popTissue = () => {
      tissueBox.classList.add('is-popped');
      spawnMiniHearts();
      if (tissueMessage) tissueMessage.classList.add('is-visible');
    };
    tissueBox.addEventListener('click', popTissue);
    tissueBox.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        popTissue();
      }
    });
  }

  /* ---------------- Part 4 & 5: letter + signature ---------------- */

  function buildLetterLines() {
    letterLinesWrap.innerHTML = '';
    LETTER_PARAGRAPHS.forEach((text, idx) => {
      const p = document.createElement('p');
      p.className = 'final__letter-line';
      if (idx === LETTER_PARAGRAPHS.length - 2 || idx === LETTER_PARAGRAPHS.length - 1) {
        p.classList.add('final__letter-line--accent');
      }
      p.textContent = text;
      letterLinesWrap.appendChild(p);
    });
  }

  function revealLetter(onDone) {
    buildLetterLines();
    letterStage.classList.add('is-opening');

    setTimeout(() => {
      letterCard.classList.add('is-visible');

      const lines = letterLinesWrap.querySelectorAll('.final__letter-line');
      lines.forEach((line, idx) => {
        setTimeout(() => line.classList.add('is-visible'), 500 + idx * 550);
      });

      const totalLineTime = 500 + lines.length * 550;
      setTimeout(() => {
        signature.classList.add('is-writing');
        setTimeout(onDone, 2200);
      }, totalLineTime + 400);
    }, 1300);
  }

  /* ---------------- Part 6: celebration ---------------- */

  function startCelebration() {
    section.classList.add('final--celebrating');
    boostAmbient();
    startFireworks();

    if (window.confetti) {
      const burst = (originX) => {
        confetti({
          particleCount: 60,
          spread: 70,
          startVelocity: 32,
          gravity: 0.55,
          scalar: 0.8,
          colors: ['#5b7fff', '#9db4ff', '#f3d9a4', '#eef1ff'],
          origin: { x: originX, y: 0.6 }
        });
      };
      burst(0.25);
      setTimeout(() => burst(0.75), 350);
      setTimeout(() => burst(0.5), 700);

      const gentleInterval = setInterval(() => {
        confetti({
          particleCount: 10,
          spread: 90,
          startVelocity: 18,
          gravity: 0.4,
          scalar: 0.6,
          ticks: 220,
          colors: ['#5b7fff', '#9db4ff', '#f3d9a4'],
          origin: { x: Math.random(), y: -0.05 }
        });
      }, 900);
      setTimeout(() => clearInterval(gentleInterval), 9000);
    }
  }

  function revealReplayButton() {
    setTimeout(() => {
      replayBtn.classList.add('is-visible');
    }, 1200);
  }

  /* ---------------- fireworks (lightweight canvas) ---------------- */

  function startFireworks() {
    if (!fireworksCanvas) return;
    const ctx = fireworksCanvas.getContext('2d');
    let width, height;
    function resize() {
      width = fireworksCanvas.width = fireworksCanvas.offsetWidth;
      height = fireworksCanvas.height = fireworksCanvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const colors = ['#5b7fff', '#9db4ff', '#f3d9a4', '#eef1ff'];
    let particles = [];
    let running = true;

    function launchFirework() {
      const x = width * (0.2 + Math.random() * 0.6);
      const y = height * (0.25 + Math.random() * 0.35);
      const color = colors[Math.floor(Math.random() * colors.length)];
      const count = 26;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const speed = 1.2 + Math.random() * 1.8;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          color
        });
      }
    }

    function tick() {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02;
        p.life -= 0.014;
        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      particles = particles.filter((p) => p.life > 0);
      requestAnimationFrame(tick);
    }

    tick();
    launchFirework();
    const launchInterval = setInterval(launchFirework, 1400);

    // taper off after the celebration's emotional peak
    setTimeout(() => clearInterval(launchInterval), 10000);
    setTimeout(() => { running = false; ctx.clearRect(0, 0, width, height); }, 13000);
  }

  /* ---------------- master sequence ---------------- */

  function runSequence() {
    if (hasRun) return;
    hasRun = true;

    revealHero();

    setTimeout(() => {
      runTypewriter(() => {
        revealNote(() => {
          revealLetter(() => {
            startCelebration();
            revealReplayButton();
          });
        });
      });
    }, 900);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runSequence();
          observer.disconnect();
        }
      });
    },
    { threshold: 0.35 }
  );
  observer.observe(section);

  /* ---------------- Part 7: replay button ---------------- */

  if (replayBtn) {
    replayBtn.addEventListener('click', (e) => {
      if (replayRipple) {
        const rect = replayBtn.getBoundingClientRect();
        replayRipple.style.left = (e.clientX - rect.left) + 'px';
        replayRipple.style.top = (e.clientY - rect.top) + 'px';
        replayRipple.classList.remove('is-rippling');
        // force reflow so the animation can restart
        void replayRipple.offsetWidth;
        replayRipple.classList.add('is-rippling');
      }

      const overlay = document.createElement('div');
      overlay.className = 'final-restart-overlay';
      document.body.appendChild(overlay);
      requestAnimationFrame(() => overlay.classList.add('is-active'));

      setTimeout(() => {
        window.scrollTo(0, 0);
        window.location.reload();
      }, 900);
    });
  }
})();