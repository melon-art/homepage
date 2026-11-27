/* Shared scroll-direction navigation. No content storage or network requests. */
(() => {
  'use strict';
  const attached = new WeakMap();
  function attach(shell) {
    if (!shell) return () => {};
    if (attached.has(shell)) return attached.get(shell);
    const surface = shell.querySelector('.navigation-surface');
    if (!surface) return () => {};
    let previousY = Math.max(0, scrollY), direction = 0, travel = 0, frame = 0, height = 0;
    const finePointer = matchMedia('(hover:hover) and (pointer:fine)');
    function display(visible) {
      shell.classList.toggle('is-hidden', !visible);
      surface.inert = !visible;
      if (visible) surface.removeAttribute('aria-hidden');
      else surface.setAttribute('aria-hidden', 'true');
    }
    function reset() { previousY = Math.max(0, scrollY); travel = 0; direction = 0; display(true); }
    function measure() {
      height = surface.getBoundingClientRect().height;
      shell.style.setProperty('--navigation-height', height + 'px');
      document.documentElement.style.setProperty('--site-navigation-height', height + 'px');
      shell.classList.add('is-ready');
    }
    function update() {
      frame = 0;
      const maximum = Math.max(0, document.documentElement.scrollHeight - innerHeight);
      const y = Math.max(0, Math.min(scrollY, maximum)), delta = y - previousY;
      previousY = y;
      const engaged = surface.contains(document.activeElement) ||
        surface.querySelector('[aria-expanded="true"]') ||
        (finePointer.matches && surface.matches(':hover'));
      if (y <= height + 16 || engaged) { travel = 0; direction = 0; display(true); return; }
      if (!delta) return;
      const nextDirection = Math.sign(delta);
      travel = nextDirection === direction ? travel + Math.abs(delta) : Math.abs(delta);
      direction = nextDirection;
      if (travel >= (direction > 0 ? 18 : 10)) { display(direction < 0); travel = 0; }
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    const onKey = event => { if (event.key === 'Tab') reset(); };
    const onFocus = () => reset();
    const observer = new ResizeObserver(measure);
    measure(); observer.observe(surface);
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('pageshow', reset);
    addEventListener('popstate', reset);
    document.addEventListener('keydown', onKey);
    surface.addEventListener('focusin', onFocus);
    const cleanup = () => {
      observer.disconnect(); cancelAnimationFrame(frame);
      removeEventListener('scroll', onScroll); removeEventListener('pageshow', reset); removeEventListener('popstate', reset);
      document.removeEventListener('keydown', onKey); surface.removeEventListener('focusin', onFocus);
      shell.classList.remove('is-ready', 'is-hidden'); surface.inert = false; surface.removeAttribute('aria-hidden');
      attached.delete(shell);
    };
    attached.set(shell, cleanup);
    return cleanup;
  }
  window.SiteNavigation = { attach };
  document.querySelectorAll('[data-site-navigation]').forEach(attach);
})();
