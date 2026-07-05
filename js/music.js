/* ==========================================================
   BACKGROUND MUSIC — consent popup + floating player
   Global, section-agnostic controller for #bg-music. Shows a
   one-time consent popup, remembers the visitor's choice, and
   exposes a persistent mute/volume control once music has been
   started (whether via "Yes" or the floating player itself).
   ========================================================== */

(function () {
  const audio = document.getElementById('bg-music');
  if (!audio) return;

  const STORAGE_KEY = 'birthdaySite:music';

  const consent = document.getElementById('music-consent');
  const consentBackdrop = document.getElementById('music-consent-backdrop');
  const yesBtn = document.getElementById('music-yes-btn');
  const laterBtn = document.getElementById('music-later-btn');

  const player = document.getElementById('music-player');
  const toggleBtn = document.getElementById('music-toggle-btn');
  const toggleIcon = document.getElementById('music-toggle-icon');
  const ambient = document.getElementById('music-player-ambient');
  const muteBtn = document.getElementById('music-mute-btn');
  const muteIcon = document.getElementById('music-mute-icon');
  const slider = document.getElementById('music-volume-slider');

  /* ---------------- persisted preferences ---------------- */

  function loadPrefs() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (err) {
      return {};
    }
  }

  function savePrefs(patch) {
    try {
      const current = loadPrefs();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.assign(current, patch)));
    } catch (err) {
      /* localStorage unavailable (private browsing, etc.) — fail silently */
    }
  }

  const prefs = loadPrefs();
  let volume = typeof prefs.volume === 'number' ? prefs.volume : 60;
  let muted = !!prefs.muted;

  audio.volume = volume / 100;
  audio.muted = muted;
  slider.value = String(volume);
  updateMuteIcon();

  /* ---------------- playback helpers ---------------- */

  function updateMuteIcon() {
    muteIcon.className = muted || volume === 0
      ? 'fa-solid fa-volume-xmark'
      : volume < 40
        ? 'fa-solid fa-volume-low'
        : 'fa-solid fa-volume-high';
    muteBtn.setAttribute('aria-label', muted ? 'Unmute music' : 'Mute music');
  }

  function markPlayingState(isPlaying) {
    player.classList.toggle('is-playing', isPlaying);
    toggleIcon.className = isPlaying ? 'fa-solid fa-music' : 'fa-solid fa-music';
    toggleBtn.setAttribute('aria-label', isPlaying ? 'Music controls (playing)' : 'Start background music');
  }

  function startMusic() {
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise
        .then(() => markPlayingState(true))
        .catch(() => {
          // Blocked by autoplay policy — wait for the next real
          // interaction anywhere on the page and try again once.
          const retry = () => {
            audio.play().then(() => markPlayingState(true)).catch(() => {});
            document.removeEventListener('click', retry);
            document.removeEventListener('touchstart', retry);
          };
          document.addEventListener('click', retry, { once: true });
          document.addEventListener('touchstart', retry, { once: true });
        });
    } else {
      markPlayingState(true);
    }
  }

  function spawnFloatingNote() {
    if (!ambient || audio.paused) return;
    const note = document.createElement('i');
    note.className = 'fa-solid fa-music music-player__note';
    note.style.setProperty('--music-drift', (Math.random() * 36 - 18) + 'px');
    player.appendChild(note);
    setTimeout(() => note.remove(), 2700);
  }
  setInterval(spawnFloatingNote, 2200);

  /* ---------------- consent popup ---------------- */

  function showConsent() {
    consent.classList.add('is-visible');
  }

  function hideConsent() {
    consent.classList.remove('is-visible');
  }

  function initConsentFlow() {
    if (prefs.choice === 'yes') {
      hideConsent();
      startMusic();
      return;
    }
    if (prefs.choice === 'later') {
      hideConsent();
      markPlayingState(false);
      return;
    }
    // No stored choice yet — ask, once the loading screen is done.
    let shown = false;
    const reveal = () => {
      if (shown) return;
      shown = true;
      showConsent();
    };
    window.addEventListener('loadingComplete', reveal, { once: true });
    // Safety net in case loading.js's event never fires.
    window.addEventListener('load', () => setTimeout(reveal, 3200), { once: true });
  }

  yesBtn.addEventListener('click', () => {
    savePrefs({ choice: 'yes' });
    hideConsent();
    startMusic();
  });

  laterBtn.addEventListener('click', () => {
    savePrefs({ choice: 'later' });
    hideConsent();
    markPlayingState(false);
  });

  consentBackdrop.addEventListener('click', () => {
    // Treat dismissing the backdrop the same as "Maybe Later".
    savePrefs({ choice: 'later' });
    hideConsent();
    markPlayingState(false);
  });

  /* ---------------- floating player controls ---------------- */

  toggleBtn.addEventListener('click', () => {
    if (audio.paused) {
      savePrefs({ choice: 'yes' });
      startMusic();
      player.classList.add('is-open');
      return;
    }
    player.classList.toggle('is-open');
  });

  document.addEventListener('click', (e) => {
    if (!player.contains(e.target)) {
      player.classList.remove('is-open');
    }
  });

  muteBtn.addEventListener('click', () => {
    muted = !muted;
    audio.muted = muted;
    savePrefs({ muted });
    updateMuteIcon();
  });

  slider.addEventListener('input', () => {
    volume = Number(slider.value);
    audio.volume = volume / 100;
    if (volume > 0 && muted) {
      muted = false;
      audio.muted = false;
    }
    savePrefs({ volume, muted });
    updateMuteIcon();
  });

  audio.addEventListener('play', () => markPlayingState(true));
  audio.addEventListener('pause', () => markPlayingState(false));

  initConsentFlow();
})();