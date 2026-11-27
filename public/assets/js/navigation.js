/* Shared scroll-direction navigation. No content storage or network requests. */
(() => {
  'use strict';
  const attached = new WeakMap();
  const mobile = matchMedia('(max-width:820px)');

  function mobileNavigation(surface) {
    const home = window.SitePages?.resolve('about');
    if (!home) return null;
    const toolbar = document.createElement('div');
    toolbar.className = 'mobile-navigation-bar';
    toolbar.innerHTML = `
      <button class="mobile-navigation-icon" type="button" aria-label="打开导航菜单" aria-controls="mobile-navigation-drawer" aria-haspopup="dialog" aria-expanded="false">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
      </button>
      <a class="mobile-navigation-icon" aria-label="返回主页">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7M5 9v11h5v-6h4v6h5V9"/></svg>
      </a>`;
    const trigger = toolbar.querySelector('button');
    toolbar.querySelector('a').href = home;
    const drawer = document.createElement('dialog');
    drawer.id = 'mobile-navigation-drawer';
    drawer.className = 'mobile-navigation-drawer';
    drawer.setAttribute('aria-labelledby', 'mobile-navigation-title');
    drawer.innerHTML = `
      <div class="mobile-navigation-panel">
        <div class="mobile-navigation-heading">
          <button class="mobile-navigation-icon" type="button" aria-label="关闭导航菜单" autofocus>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>
          </button>
          <h2 id="mobile-navigation-title">目录<span lang="en">Contents</span></h2>
        </div>
        <nav class="mobile-navigation-links" aria-label="站内栏目"></nav>
      </div>`;
    const links = drawer.querySelector('nav');
    function addItem(label, href) {
      const item = document.createElement(href ? 'a' : 'span');
      item.textContent = label;
      if (href) item.href = href;
      else {
        const status = document.createElement('small');
        status.textContent = '待更新';
        item.append(status);
      }
      links.append(item);
      return item;
    }
    for (const section of SitePages.sections) {
      addItem(section.label, SitePages.resolve(section.primary));
    }
    const settings = addItem('设置', 'settings.html');
    const close = () => { if (drawer.open) drawer.close(); };
    trigger.addEventListener('click', () => {
      if (!mobile.matches || drawer.open) return;
      settings.href = surface.querySelector('.settings-link')?.href || 'settings.html';
      for (const link of links.querySelectorAll('a')) {
        if (new URL(link.href).pathname === location.pathname) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      }
      drawer.showModal();
      trigger.setAttribute('aria-expanded', 'true');
    });
    drawer.addEventListener('close', () => {
      if (!drawer.open) trigger.setAttribute('aria-expanded', 'false');
    });
    drawer.addEventListener('click', event => {
      if (event.target === drawer || event.target.closest('button, a')) close();
    });
    surface.prepend(toolbar);
    document.body.append(drawer);
    return { close, remove() { close(); drawer.remove(); toolbar.remove(); } };
  }

  function attach(shell) {
    if (!shell) return () => {};
    if (attached.has(shell)) return attached.get(shell);
    const surface = shell.querySelector('.navigation-surface');
    if (!surface) return () => {};
    const compact = mobileNavigation(surface);
    shell.classList.toggle('has-mobile-navigation', Boolean(compact));
    let previousY = Math.max(0, scrollY), direction = 0, travel = 0, frame = 0, height = 0;
    const finePointer = matchMedia('(hover:hover) and (pointer:fine)');
    function display(visible) {
      shell.classList.toggle('is-hidden', !visible);
      surface.inert = !visible;
      if (visible) surface.removeAttribute('aria-hidden');
      else surface.setAttribute('aria-hidden', 'true');
    }
    function reset() { previousY = Math.max(0, scrollY); travel = 0; direction = 0; display(true); }
    function resetNavigation() { compact?.close(); reset(); }
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
      const focused = surface.contains(document.activeElement) &&
        (!(mobile.matches && compact) || document.activeElement.matches(':focus-visible'));
      const engaged = focused ||
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
    addEventListener('pageshow', resetNavigation);
    addEventListener('popstate', resetNavigation);
    mobile.addEventListener('change', resetNavigation);
    document.addEventListener('keydown', onKey);
    surface.addEventListener('focusin', onFocus);
    const cleanup = () => {
      observer.disconnect(); cancelAnimationFrame(frame);
      removeEventListener('scroll', onScroll); removeEventListener('pageshow', resetNavigation); removeEventListener('popstate', resetNavigation);
      mobile.removeEventListener('change', resetNavigation);
      document.removeEventListener('keydown', onKey); surface.removeEventListener('focusin', onFocus);
      compact?.remove();
      shell.classList.remove('is-ready', 'is-hidden', 'has-mobile-navigation'); surface.inert = false; surface.removeAttribute('aria-hidden');
      attached.delete(shell);
    };
    attached.set(shell, cleanup);
    return cleanup;
  }
  window.SiteNavigation = { attach };
  document.querySelectorAll('[data-site-navigation]').forEach(attach);
})();
