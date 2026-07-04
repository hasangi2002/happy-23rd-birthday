/* ==========================================================================
   SECTIONS/QUIZ.JS
   Section 7 — How Well Do You Know Us?

   Everything renders from the QUESTIONS array below — edit it to write
   your own relationship trivia; the rest of the flow (progress bar,
   scoring, transitions, results screen) adapts automatically to however
   many questions are listed.
   ========================================================================== */

const Quiz = (() => {
  /**
   * Edit freely. `correct` is the index (0-based) into `options`.
   * Any number of questions works, and any number of options per question.
   */
  const QUESTIONS = [
    {
      question: "Where did we go on our first date?",
      options: ["Coffee shop", "Beach", "Movie night", "I don't even remember, be honest"],
      correct: 1,
    },
    {
      question: "What's my go-to comfort food?",
      options: ["Rice and curry", "Pizza", "Ice cream", "Whatever you're cooking"],
      correct: 3,
    },
    {
      question: "What do you always tease me about?",
      options: ["To my nose", "Overthinking everything", "My playlist", "All of the above, obviously"],
      correct: 3,
    },
    {
      question: "What's my favorite way to spend a lazy day?",
      options: ["Sleeping in", "On a call with you", "Doing nothing", "All three, in that order"],
      correct: 3,
    },
    {
      question: "What do I say to make you smile when you're overthinking?",
      options: ["Something ridiculous", "Don't worry about it", "A cricket fact, unprompted", "You'd know better than me"],
      correct: 1,
    },
    {
      question: "What's the one thing I never get tired of hearing from you?",
      options: ["I love you", "I miss you", "Both, always", "Neither, I'm unbothered"],
      correct: 2,
    },
  ];

  const RESULT_TIERS = [
    { min: 1, message: "Perfect score. You clearly pay attention. 😏" },
    { min: 0.7, message: "Pretty impressive! You know us well." },
    { min: 0.4, message: "Not bad, but maybe we need more date nights. 👀" },
    { min: 0, message: "Time for a deep conversation... and chocolate. 🍫" },
  ];

  let sectionEl, stageEl, progressFillEl, questionCountEl, scoreEl, heartsContainer;
  let currentIndex = 0;
  let score = 0;
  let reduceMotion = false;
  let heartInterval;

  function cacheDom() {
    sectionEl = document.getElementById('quiz');
    stageEl = document.getElementById('quiz-card-stage');
    progressFillEl = document.getElementById('quiz-progress-fill');
    questionCountEl = document.getElementById('quiz-question-count');
    scoreEl = document.getElementById('quiz-score');
    heartsContainer = sectionEl?.querySelector('.quiz__hearts');
  }

  function updateMeta() {
    const progress = (currentIndex / QUESTIONS.length) * 100;
    progressFillEl.style.width = `${progress}%`;
    questionCountEl.textContent = `Question ${Math.min(currentIndex + 1, QUESTIONS.length)} of ${QUESTIONS.length}`;
    scoreEl.textContent = `Score: ${score}`;
  }

  function buildQuestionCard(q) {
    const card = document.createElement('div');
    card.className = 'quiz-card glass-card';
    card.innerHTML = `
      <p class="quiz-card__question">${q.question}</p>
      <div class="quiz-card__options">
        ${q.options.map((opt, i) => `<button class="quiz-card__option" data-index="${i}">${opt}</button>`).join('')}
      </div>
      <p class="quiz-card__feedback" aria-live="polite"></p>
      <button class="btn btn--primary quiz-card__next" hidden>
        <span>Next</span> <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
      </button>
    `;

    const optionButtons = card.querySelectorAll('.quiz-card__option');
    const feedbackEl = card.querySelector('.quiz-card__feedback');
    const nextBtn = card.querySelector('.quiz-card__next');

    optionButtons.forEach(btn => {
      btn.addEventListener('click', () => handleAnswer(btn, optionButtons, feedbackEl, nextBtn, q));
    });

    nextBtn.addEventListener('click', goToNext);

    return card;
  }

  function handleAnswer(selectedBtn, allButtons, feedbackEl, nextBtn, q) {
    const selectedIndex = Number(selectedBtn.dataset.index);
    const isCorrect = selectedIndex === q.correct;

    allButtons.forEach(btn => {
      btn.disabled = true;
      if (Number(btn.dataset.index) === q.correct) btn.classList.add('is-correct');
    });

    if (!isCorrect) selectedBtn.classList.add('is-wrong');

    if (isCorrect) {
      score++;
      feedbackEl.textContent = 'Good Boy ❤️';
      feedbackEl.classList.add('is-correct');
      if (!reduceMotion) launchHeartBurst();
    } else {
      feedbackEl.textContent = 'Wrong 😂 You owe me chocolate.';
      feedbackEl.classList.add('is-wrong');
    }
    feedbackEl.classList.add('is-visible');
    updateMeta();

    requestAnimationFrame(() => {
      nextBtn.hidden = false;
      requestAnimationFrame(() => nextBtn.classList.add('is-visible'));
    });
  }

  function launchHeartBurst() {
    for (let i = 0; i < 6; i++) {
      setTimeout(() => Effects.spawnHeart(heartsContainer, { duration: 3 + Math.random() }), i * 60);
    }
  }

  /** Swaps the current card out and the next one (question or results) in, with a slide transition. */
  function transitionToCard(buildFn) {
    const outgoing = stageEl.firstElementChild;

    const mountNext = () => {
      stageEl.innerHTML = '';
      const incoming = buildFn();
      incoming.classList.add('is-entering');
      stageEl.appendChild(incoming);
      requestAnimationFrame(() => incoming.classList.remove('is-entering'));
    };

    if (outgoing && !reduceMotion) {
      outgoing.classList.add('is-leaving');
      setTimeout(mountNext, 300);
    } else {
      mountNext();
    }
  }

  function renderQuestion() {
    updateMeta();
    transitionToCard(() => buildQuestionCard(QUESTIONS[currentIndex]));
  }

  function goToNext() {
    currentIndex++;
    if (currentIndex >= QUESTIONS.length) {
      renderResult();
    } else {
      renderQuestion();
    }
  }

  function buildResultCard() {
    const fraction = score / QUESTIONS.length;
    const tier = RESULT_TIERS.find(t => fraction >= t.min);

    const card = document.createElement('div');
    card.className = 'quiz-card quiz-card--result glass-card';
    card.innerHTML = `
      <i class="fa-solid fa-trophy quiz-result__icon" aria-hidden="true"></i>
      <p class="quiz-result__score">You scored ${score} / ${QUESTIONS.length}</p>
      <p class="quiz-result__message">${tier.message}</p>
      <button class="btn btn--glass quiz-result__replay">
        <span>Play Again</span> <i class="fa-solid fa-rotate-right" aria-hidden="true"></i>
      </button>
    `;

    card.querySelector('.quiz-result__replay').addEventListener('click', restart);

    if (score === QUESTIONS.length && window.confetti) {
      confetti({
        particleCount: 100,
        spread: 85,
        origin: { y: 0.5 },
        colors: ['#2563EB', '#FBBF24', '#FF7EB6'],
        disableForReducedMotion: true,
      });
    }

    return card;
  }

  function renderResult() {
    progressFillEl.style.width = '100%';
    questionCountEl.textContent = 'Quiz Complete';
    transitionToCard(buildResultCard);
  }

  function restart() {
    currentIndex = 0;
    score = 0;
    renderQuestion();
  }

  function startAmbientHearts() {
    if (reduceMotion) return;
    heartInterval = setInterval(() => Effects.spawnHeart(heartsContainer), 1600);
  }

  function observeSection() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            startAmbientHearts();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );
    observer.observe(sectionEl);
  }

  function init() {
    cacheDom();
    if (!sectionEl || !QUESTIONS.length) return;

    reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    renderQuestion();
    observeSection();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', Quiz.init);