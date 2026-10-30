// Section entrances, each section in its own manner, once, as it comes into view.
// Nothing is hidden unless this script runs; reduced motion gets the finished page.
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const plan = [
    ['.hero h1', 'title'],
    ['.hero .lead, .hero .hero-sublead, .hero .hero-actions, .hero .availability', 'rise', 90],
    ['.hero .capture-preview', 'settle', 0, 200],
    ['.hero .dog-note', 'rise', 0, 600],
    ['.more__shot', 'open'],
    ['.more__body h2, .more-list > article', 'row', 80],
    ['.platform-section h2, .platform-card, .platform-other', 'rise', 90],
    ['.comparison .section-heading > *', 'rise', 90],
    ['.compare-table tbody tr', 'row', 40],
    ['.comparison .dog-note', 'rise'],
    ['.story__copy > *', 'rise', 90],
    ['.story__art', 'tilt'],
    ['.faq h2, .faq-item', 'row', 50],
    ['.closing-copy > *', 'rise', 90],
    ['.closing__shot', 'open', 0, 150],
  ];
  const pending = new Set();
  for (const [selector, kind, step = 0, base = 0] of plan) {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add('m-' + kind);
      el.style.setProperty('--d', (base + i * step) + 'ms');
      pending.add(el);
    });
  }
  if (!pending.size) return;
  document.documentElement.classList.add('motion');

  const reveal = (el) => { el.classList.add('is-in'); pending.delete(el); };
  // Reveal anything whose top has reached 92% of the screen, including what a fast jump scrolled past.
  document.addEventListener('focusin', (event) => {
    for (const el of pending) {
      if (el.contains(event.target)) {
        el.style.transition = 'none';
        reveal(el);
      }
    }
  });
  let queued = false;
  const sweep = () => {
    queued = false;
    const limit = window.innerHeight * 0.92;
    for (const el of pending) if (el.getBoundingClientRect().top < limit) reveal(el);
    if (!pending.size) window.removeEventListener('scroll', onScroll);
  };
  const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(sweep); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  window.addEventListener('beforeprint', () => [...pending].forEach(reveal));
  requestAnimationFrame(() => requestAnimationFrame(sweep));
})();
