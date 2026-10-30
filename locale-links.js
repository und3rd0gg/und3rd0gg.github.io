(() => {
  const update = () => {
    const hash = window.location.hash;
    const known = hash === '#feedback' || hash === '#android-testing';
    document.querySelectorAll('.language-switch a').forEach((link) => {
      const target = new URL(link.href);
      target.hash = known ? hash : '';
      link.href = target.href;
    });
  };
  update();
  window.addEventListener('hashchange', update);
})();
