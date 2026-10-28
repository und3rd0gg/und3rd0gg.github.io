(() => {
  const carousel = document.querySelector('[data-demo-carousel]');
  if (!carousel) return;
  const image = carousel.querySelector('[data-demo-image]');
  const hotkeyBadge = carousel.querySelector('[data-demo-hotkey-badge]');
  const controls = carousel.querySelector('[data-demo-controls]');
  const toggle = carousel.querySelector('[data-demo-toggle]');
  const resume = carousel.querySelector('[data-demo-resume]');
  const choices = Array.from(carousel.querySelectorAll('[data-demo-choice]'));
  if (!image || !hotkeyBadge || !controls || !toggle || !resume || !choices.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let selected = 0;
  let playing = !reducedMotion.matches;
  let rotate = playing;
  let hovering = false;
  let timer = null;
  let pointerWasPlaying = null;
  let autoPausedByFocus = false;
  let generation = 0;

  function cancelTimer() {
    window.clearTimeout(timer);
    timer = null;
  }

  function scheduleNext() {
    cancelTimer();
    if (!playing || !rotate || hovering || document.hidden) return;
    const duration = Number(choices[selected].dataset.duration) || 13000;
    timer = window.setTimeout(() => {
      selected = (selected + 1) % choices.length;
      render();
    }, duration);
  }

  function render() {
    cancelTimer();
    const token = ++generation;
    const choice = choices[selected];
    hotkeyBadge.hidden = selected !== 0;
    choices.forEach((button, index) => button.setAttribute('aria-pressed', String(index === selected)));
    toggle.textContent = playing ? carousel.dataset.pauseText : carousel.dataset.playText;
    toggle.setAttribute('aria-label', playing ? carousel.dataset.pauseLabel : carousel.dataset.playLabel);
    resume.hidden = !playing || rotate;
    image.alt = choice.dataset.alt;
    const animate = playing && !document.hidden;
    const src = animate ? choice.dataset.animation : choice.dataset.poster;
    image.onload = () => {
      if (token === generation && animate) scheduleNext();
    };
    image.onerror = () => {
      if (token === generation && animate) {
        playing = false;
        rotate = false;
        render();
      }
    };
    image.src = src;
  }

  // A pointer can focus the control before its click; remember the prior intent.
  carousel.addEventListener('pointerdown', () => { pointerWasPlaying = playing; });
  window.addEventListener('pointercancel', () => { pointerWasPlaying = null; });
  window.addEventListener('pointerup', () => {
    // A click follows pointerup; clear abandoned pointer state after that event.
    window.setTimeout(() => { pointerWasPlaying = null; }, 0);
  });
  carousel.addEventListener('focusin', (event) => {
    if (pointerWasPlaying !== null) return;
    if (!carousel.contains(event.relatedTarget)) {
      autoPausedByFocus = playing;
      playing = false;
      rotate = false;
      render();
    }
  });
  carousel.addEventListener('mouseenter', () => { hovering = true; cancelTimer(); });
  carousel.addEventListener('mouseleave', () => { hovering = false; scheduleNext(); });
  toggle.addEventListener('click', (event) => {
    const previous = event.detail > 0 && pointerWasPlaying !== null ? pointerWasPlaying : playing;
    pointerWasPlaying = null;
    autoPausedByFocus = false;
    playing = !previous;
    rotate = playing;
    render();
  });
  choices.forEach((button, index) => button.addEventListener('click', (event) => {
    // Selecting a scenario resumes its animation after pointer focus stopped it,
    // but leaves automatic rotation stopped until explicitly resumed.
    if ((autoPausedByFocus || (event.detail > 0 && pointerWasPlaying)) && !reducedMotion.matches) playing = true;
    pointerWasPlaying = null;
    autoPausedByFocus = false;
    rotate = false;
    selected = index;
    render();
  }));
  resume.addEventListener('click', () => {
    pointerWasPlaying = null;
    autoPausedByFocus = false;
    playing = true;
    rotate = true;
    render();
  });
  reducedMotion.addEventListener('change', (event) => {
    if (event.matches) { playing = false; rotate = false; render(); }
  });
  document.addEventListener('visibilitychange', render);
  controls.hidden = false;
  toggle.hidden = false;
  render();
})();
