/* Shared by the homepage and the editor's live preview. */
(() => {
  'use strict';
  const shell = `<div class="depth-context"><time id="depth-month"></time></div>
    <div class="depth-dates"><div class="depth-date-window" role="tablist" aria-label="按日期查看网站更新" aria-orientation="horizontal"></div><span class="depth-date-index" aria-hidden="true"></span></div>
    <div class="depth-day-numbers" role="group" aria-label="选择当天的更新" hidden></div>
    <div class="depth-panel" role="tabpanel"><div class="depth-stage" role="group" aria-label="更新预览，点击相邻预览或使用上下方向键切换"></div>
    <div class="depth-caption"><div class="depth-meta"><span class="depth-category"></span><time class="depth-full-date"></time></div><p class="depth-title"></p></div></div>
    <p class="selection-announcement" role="status" aria-live="polite" aria-atomic="true"></p>`;
  let instance = 0;
  function mount(host, records, options = {}) {
    const abort = new AbortController(), signal = abort.signal, urls = [], timers = new Set(), prefix = 'updates-' + (++instance);
    const on = (node, type, listener, config = {}) => node.addEventListener(type, listener, { ...config, signal });
    const later = (fn, delay) => { const id = setTimeout(() => { timers.delete(id); if (!signal.aborted) fn(); }, delay); timers.add(id); return id; };
    host.innerHTML = shell;
    const viewport = host.querySelector('.depth-date-window'), stage = host.querySelector('.depth-stage'), panel = host.querySelector('.depth-panel'), caption = host.querySelector('.depth-caption');
    const announce = host.querySelector('.selection-announcement'), numbers = host.querySelector('.depth-day-numbers');
    const reduced = matchMedia('(prefers-reduced-motion:reduce)'), entries = [...records].filter(item => UpdatesStore.validDate(item.date)).sort((a, b) => a.date.localeCompare(b.date) || UpdatesStore.sort(a, b));
    const byId = new Map(entries.map(entry => [entry.id, entry])), byDay = new Map();
    entries.forEach(entry => { if (!byDay.has(entry.date)) byDay.set(entry.date, []); byDay.get(entry.date).push(entry); });
    host.classList.toggle('has-day-numbers', [...byDay.values()].some(items => items.length > 1));
    const current = byId.get(options.initialId) || byDay.get(entries.at(-1)?.date)?.[0], now = new Date();
    const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
    const initialDay = current?.date || today;
    const first = new Date((entries[0]?.date || initialDay) + 'T12:00:00Z'), last = new Date((entries.at(-1)?.date || initialDay) + 'T12:00:00Z');
    first.setUTCDate(first.getUTCDate() - 5); last.setUTCMonth(last.getUTCMonth() + 1, 0);
    const keys = [];
    for (let date = new Date(first); date <= last; date.setUTCDate(date.getUTCDate() + 1)) keys.push(date.toISOString().slice(0, 10));
    panel.id = prefix + '-panel';
    const buttons = keys.map(key => {
      const button = document.createElement('button'), label = document.createElement('span');
      button.type = 'button'; button.className = 'depth-date' + (byDay.has(key) ? ' has-update' : ''); button.dataset.date = key; button.id = prefix + '-' + key;
      button.setAttribute('role', 'tab'); button.setAttribute('aria-controls', panel.id); button.setAttribute('aria-selected', String(key === initialDay)); button.tabIndex = key === initialDay ? 0 : -1;
      button.setAttribute('aria-label', Number(key.slice(5, 7)) + '月' + Number(key.slice(8)) + '日，' + (byDay.has(key) ? byDay.get(key).length + '条更新' : '暂无更新'));
      label.textContent = Number(key.slice(8)); button.append(label); viewport.append(button); return button;
    });
    const cards = entries.map(entry => {
      const href = UpdatesStore.target(entry), card = document.createElement(href ? 'a' : 'button');
      card.className = 'depth-card'; card.dataset.id = entry.id;
      if (href) { card.href = href; if (options.preview) { card.target = '_blank'; card.rel = 'noopener'; } }
      else { card.type = 'button'; card.classList.add('depth-card-no-link'); }
      const image = document.createElement('img'), fallback = document.createElement('span'), side = document.createElement('span');
      image.alt = entry.imageAlt || (SitePages.section(entry.sectionId)?.label || '更新') + '页面预览'; image.draggable = false;
      fallback.className = 'depth-image-error'; fallback.textContent = entry.body || '更新正文';
      if (entry.image?.blob instanceof Blob) { image.src = URL.createObjectURL(entry.image.blob); urls.push(image.src); fallback.hidden = true; }
      else if (entry.imagePath) { image.src = entry.imagePath; fallback.hidden = true; }
      else image.hidden = true;
      on(image, 'error', () => { image.hidden = true; fallback.hidden = false; });
      side.className = 'depth-side-date'; side.setAttribute('aria-hidden', 'true'); side.textContent = entry.date.slice(5).replace('-', '.') + ' · ' + (SitePages.section(entry.sectionId)?.label || '未选择板块');
      card.append(image, fallback, side); stage.append(card); return card;
    });
    const empty = document.createElement('div'); empty.className = 'depth-card depth-empty';
    const emptyTitle = document.createElement('p'), emptyText = document.createElement('span'); emptyTitle.textContent = entries.length ? '这一天暂无更新' : '暂无更新'; emptyText.textContent = entries.length ? '选择金色日期查看更新' : '网站其他板块的新内容将在这里展示'; empty.append(emptyTitle, emptyText); stage.append(empty);
    const poses = ['is-current', 'is-prev', 'is-next', 'is-far-prev', 'is-far-next'];
    const calendarStops = keys.flatMap(day => (byDay.get(day) || [{ date: day }]).map(entry => ({ day, id: entry.id })));
    const recordStops = entries.map(entry => ({ day: entry.date, id: entry.id }));
    let selected = keys.indexOf(initialDay), shownDay, shownId, scrollTimer, frame, drag, suppressClick = false, stageTouch;
    let wheelMotion, wheelFrame, wheelSum = 0, wheelTime = 0, wheelDirection = 0, wheelMode;
    function left(i) { const b = buttons[i]; return b.offsetLeft + b.clientWidth / 2 - viewport.clientWidth / 2; }
    function nearest() { return buttons.reduce((best, _, i) => Math.abs(left(i) - viewport.scrollLeft) < Math.abs(left(best) - viewport.scrollLeft) ? i : best, 0); }
    function sync() {
      selected = nearest();
      buttons.forEach((button, i) => { const active = i === selected; button.setAttribute('aria-selected', String(active)); button.tabIndex = active ? 0 : -1; button.style.setProperty('--date-proximity', Math.max(0, 1 - Math.abs(left(i) - viewport.scrollLeft) / 70)); });
      const month = keys[selected].slice(0, 7), label = host.querySelector('#depth-month'); label.dateTime = month; label.textContent = month.replace('-', ' / ');
    }
    function pose(element, name) { element.classList.remove(...poses); element.classList.add('is-' + name); const visible = ['current', 'prev', 'next'].includes(name); element.setAttribute('aria-hidden', String(!visible)); element.inert = !visible; }
    function render(day, requestedId, force = false) {
      const dayEntries = byDay.get(day) || [], item = dayEntries.find(entry => entry.id === requestedId) || dayEntries[0];
      if (!force && shownDay === day && shownId === item?.id) return;
      shownDay = day; shownId = item?.id; panel.dataset.date = day; panel.dataset.entryId = shownId || ''; panel.setAttribute('aria-labelledby', prefix + '-' + day);
      const index = entries.findIndex(entry => entry.id === shownId);
      const previous = index >= 0 ? entries[index - 1] : entries.filter(entry => entry.date < day).at(-1), next = index >= 0 ? entries[index + 1] : entries.find(entry => entry.date > day);
      cards.forEach(card => {
        const entry = byId.get(card.dataset.id), position = entry.id === shownId ? 'current' : entry.id === previous?.id ? 'prev' : entry.id === next?.id ? 'next' : entry.date < day ? 'far-prev' : 'far-next';
        pose(card, position); card.setAttribute('aria-current', String(entry.id === shownId));
        card.setAttribute('aria-label', entry.id === shownId ? (UpdatesStore.target(entry) ? '查看：' : '预览：') + (entry.body || '更新正文') : '选择 ' + entry.date + '，' + (entry.body || '更新正文'));
      });
      pose(empty, item ? 'far-next' : 'current');
      caption.querySelector('.depth-category').textContent = item ? SitePages.section(item.sectionId)?.label || '未选择板块' : '暂无更新';
      const time = caption.querySelector('time'); time.dateTime = day; time.textContent = day.replaceAll('-', '.');
      caption.querySelector('.depth-title').textContent = item?.body || (item ? '更新正文待填写' : entries.length ? '此日期没有网站更新记录' : '网站更新内容待添加');
      numbers.hidden = dayEntries.length < 2;
      if (numbers.dataset.date !== day) {
        numbers.dataset.date = day; numbers.replaceChildren();
        dayEntries.forEach((entry, index) => {
          const button = document.createElement('button'); button.type = 'button'; button.dataset.id = entry.id; button.textContent = index + 1;
          button.setAttribute('aria-label', day + '，第' + (index + 1) + '条更新：' + (entry.body || '未填写正文')); numbers.append(button);
        });
      }
      numbers.querySelectorAll('button').forEach(button => { const active = button.dataset.id === shownId; button.setAttribute('aria-pressed', String(active)); });
      announce.textContent = day + '，' + (item?.body || '暂无更新');
      caption.getAnimations().forEach(animation => animation.cancel());
      if (!force) caption.animate([{ opacity: .2 }, { opacity: 1 }], { duration: reduced.matches ? 90 : 220, easing: 'ease-out' });
      options.onSelect?.(item || null);
    }
    function settle() {
      if (wheelMotion) return;
      clearTimeout(scrollTimer); sync(); if (drag?.moved) return;
      const day = keys[selected];
      render(day, day === shownDay ? shownId : undefined);
    }
    function stopWheel() {
      cancelAnimationFrame(wheelFrame); wheelMotion = undefined;
      wheelSum = 0; wheelTime = 0; wheelDirection = 0; wheelMode = undefined;
      viewport.classList.remove('is-wheel-scrolling');
    }
    function go(i, { focus = false, smooth = true, id } = {}) {
      stopWheel();
      const bounded = Math.max(0, Math.min(keys.length - 1, i));
      if (focus) buttons[bounded].focus({ preventScroll: true });
      if (id) render(keys[bounded], id);
      viewport.scrollTo({ left: left(bounded), behavior: smooth && !reduced.matches ? 'smooth' : 'instant' });
      clearTimeout(scrollTimer); scrollTimer = later(settle, smooth && !reduced.matches ? 130 : 0);
    }
    on(numbers, 'click', event => { const button = event.target.closest('button'); if (button) go(keys.indexOf(shownDay), { id: button.dataset.id }); });
    on(numbers, 'keydown', event => {
      const button = event.target.closest('button'); if (!button) return;
      const choices = [...numbers.querySelectorAll('button')]; let index = choices.indexOf(button);
      if (event.key === 'ArrowLeft') index--; else if (event.key === 'ArrowRight') index++; else if (event.key === 'Home') index = 0; else if (event.key === 'End') index = choices.length - 1; else return;
      event.preventDefault(); const next = choices[Math.max(0, Math.min(choices.length - 1, index))]; next.focus({ preventScroll: true }); go(keys.indexOf(shownDay), { id: next.dataset.id });
    });
    on(viewport, 'scroll', () => { if (wheelMotion) return; cancelAnimationFrame(frame); frame = requestAnimationFrame(sync); clearTimeout(scrollTimer); scrollTimer = later(settle, 110); }, { passive: true });
    on(viewport, 'scrollend', settle);
    on(viewport, 'click', event => { if (suppressClick) { event.preventDefault(); return; } const button = event.target.closest('.depth-date'); if (button) go(keys.indexOf(button.dataset.date)); });
    on(viewport, 'keydown', event => {
      let i = keys.indexOf(event.target.closest('.depth-date')?.dataset.date); if (i < 0) i = selected;
      if (event.key === 'ArrowLeft') i--; else if (event.key === 'ArrowRight') i++; else if (event.key === 'Home') i = 0; else if (event.key === 'End') i = keys.length - 1; else return;
      event.preventDefault(); go(i, { focus: true, smooth: false });
    });
    // Each natural day is a stop; same-day entries share its rail position. Keep
    // accepting input while the frame-based motion catches up, without a cooldown.
    function animateWheel(time) {
      const motion = wheelMotion; if (!motion) return;
      const elapsed = motion.time ? Math.min(32, time - motion.time) : 16; motion.time = time;
      const distance = motion.target - motion.position;
      const advance = distance * (1 - Math.exp(-elapsed / 42));
      motion.position = reduced.matches ? motion.target : motion.position + Math.sign(advance) * Math.min(Math.abs(advance), elapsed / 80);
      const finished = Math.abs(motion.target - motion.position) < .003;
      if (finished) motion.position = motion.target;
      const low = Math.floor(motion.position), high = Math.ceil(motion.position), fraction = motion.position - low;
      const x = motion.positions[low] + (motion.positions[high] - motion.positions[low]) * fraction;
      viewport.scrollTo({ left: x, behavior: 'instant' }); sync();
      const stop = motion.stops[Math.round(motion.position)]; render(stop.day, stop.id);
      if (finished) { wheelMotion = undefined; viewport.classList.remove('is-wheel-scrolling'); }
      else wheelFrame = requestAnimationFrame(animateWheel);
    }
    function browseWheel(event, mode) {
      if (event.ctrlKey) return;
      const raw = mode === 'records' ? event.deltaY : Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      const delta = raw * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 100 : 1);
      if (!delta) return;
      if (wheelMode !== mode) stopWheel();
      const direction = Math.sign(delta), reversed = direction !== wheelDirection, now = performance.now();
      let stops = wheelMotion?.stops || (mode === 'calendar' ? calendarStops : recordStops);
      // An empty preview can still move directly to the adjacent real record.
      if (!wheelMotion && mode === 'records' && !shownId) stops = [...stops, { day: shownDay }].sort((a, b) => a.day.localeCompare(b.day));
      const position = wheelMotion?.position ?? Math.max(0, stops.findIndex(stop => stop.day === shownDay && stop.id === shownId));
      const origin = wheelMotion && !reversed ? wheelMotion.target : Math.round(position);
      const target = Math.max(0, Math.min(stops.length - 1, origin + direction));
      if (target === origin && (!wheelMotion || target === wheelMotion.target)) return;
      event.preventDefault();
      if (now - wheelTime > 180 || reversed) wheelSum = 0;
      wheelTime = now; wheelDirection = direction; wheelMode = mode;
      wheelSum += direction * Math.min(Math.abs(delta), 48);
      if (Math.abs(wheelSum) < 48) return;
      wheelSum -= direction * 48;
      if (!wheelMotion) {
        clearTimeout(scrollTimer); cancelAnimationFrame(frame);
        viewport.classList.add('is-wheel-scrolling');
        viewport.scrollTo({ left: viewport.scrollLeft, behavior: 'instant' });
        const dayPositions = new Map(keys.map((day, i) => [day, left(i)]));
        wheelMotion = { stops, positions: stops.map(stop => dayPositions.get(stop.day)), position, target, time: 0 };
        wheelFrame = requestAnimationFrame(animateWheel);
      } else {
        wheelMotion.target = target;
      }
    }
    on(viewport, 'wheel', event => browseWheel(event, 'calendar'), { passive: false });
    on(numbers, 'wheel', event => browseWheel(event, 'calendar'), { passive: false });
    on(viewport, 'pointerdown', event => { stopWheel(); if (event.pointerType === 'mouse' && event.button === 0) { drag = { id: event.pointerId, x: event.clientX, left: viewport.scrollLeft, moved: false }; suppressClick = false; } });
    on(viewport, 'pointermove', event => { if (!drag || drag.id !== event.pointerId) return; if (!drag.moved && Math.abs(event.clientX - drag.x) > 5) { drag.moved = true; viewport.setPointerCapture(event.pointerId); viewport.classList.add('is-dragging'); } if (drag.moved) { event.preventDefault(); viewport.scrollLeft = drag.left - (event.clientX - drag.x); } });
    function endDrag(event) { if (!drag || drag.id !== event.pointerId) return; const moved = drag.moved; drag = null; viewport.classList.remove('is-dragging'); if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId); if (moved) { suppressClick = true; go(nearest()); later(() => suppressClick = false, 0); } }
    on(viewport, 'pointerup', endDrag); on(viewport, 'pointercancel', endDrag); on(window, 'pointerup', endDrag);
    function adjacent(direction) {
      const index = entries.findIndex(entry => entry.id === shownId);
      return index >= 0 ? entries[index + direction] : direction < 0 ? entries.filter(entry => entry.date < shownDay).at(-1) : entries.find(entry => entry.date > shownDay);
    }
    function step(direction) {
      const entry = adjacent(direction);
      if (!entry) return false; go(keys.indexOf(entry.date), { id: entry.id }); return true;
    }
    cards.forEach(card => on(card, 'click', event => {
      if (suppressClick) { event.preventDefault(); return; }
      if (card.dataset.id !== shownId) { event.preventDefault(); const entry = byId.get(card.dataset.id); go(keys.indexOf(entry.date), { id: entry.id }); }
    }));
    on(stage, 'keydown', event => { if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return; event.preventDefault(); if (step(event.key === 'ArrowUp' ? -1 : 1)) buttons[selected].focus({ preventScroll: true }); });
    on(stage, 'wheel', event => {
      if (event.ctrlKey || (!event.deltaX && !event.deltaY)) return;
      // Contain every non-zoom event, even at boundaries or below the threshold.
      event.preventDefault();
      browseWheel(event, 'records');
    }, { passive: false });
    on(stage, 'pointerdown', event => { if (event.pointerType !== 'mouse') stageTouch = { id: event.pointerId, y: event.clientY }; });
    on(stage, 'pointerup', event => { if (!stageTouch || stageTouch.id !== event.pointerId) return; const delta = event.clientY - stageTouch.y; stageTouch = null; if (Math.abs(delta) > 28) { suppressClick = true; step(delta < 0 ? 1 : -1); later(() => suppressClick = false, 0); } });
    on(stage, 'pointercancel', () => stageTouch = null);
    on(window, 'resize', () => go(selected, { smooth: false }));
    document.fonts.ready.then(() => { if (signal.aborted) return; go(selected, { smooth: false }); render(initialDay, current?.id, true); });
    return { current: () => byId.get(shownId), destroy() { abort.abort(); stopWheel(); timers.forEach(clearTimeout); cancelAnimationFrame(frame); urls.forEach(URL.revokeObjectURL); } };
  }
  window.UpdatesView = { mount };
})();
