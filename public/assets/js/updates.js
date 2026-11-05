(() => {
  'use strict';
  const section = document.querySelector('.depth-study'); if (!section) return;
  const host = section.querySelector('[data-updates-view]'), actions = section.querySelector('.update-record-actions'), edit = actions.querySelector('a'), remove = actions.querySelector('button'), message = section.querySelector('.updates-status');
  let view, generation = 0, chosenId = new URLSearchParams(location.search).get('update'), current;
  function status(text, error = false) { message.hidden = !text; message.textContent = text; message.classList.toggle('is-error', error); }
  async function refresh() {
    const version = ++generation;
    try {
      const entries = await UpdatesStore.all(); if (version !== generation) return;
      const visible = entries.filter(entry => entry.status === 'published' && UpdatesStore.target(entry));
      chosenId = chosenId || view?.current()?.id;
      view?.destroy();
      view = UpdatesView.mount(host, visible, { initialId: chosenId, onSelect(entry) {
        current = entry; chosenId = entry?.id; actions.hidden = !entry;
        if (entry) edit.href = 'updates-edit.html?id=' + encodeURIComponent(entry.id);
      } });
      status('');
    } catch (error) {
      if (!view) view = UpdatesView.mount(host, []);
      status(error.message, true);
    }
  }
  remove.addEventListener('click', async () => {
    const entry = current; if (!entry || !confirm('删除这条更新？删除后无法恢复。\n\n' + entry.date + '\n' + entry.body)) return;
    remove.disabled = true;
    try { await UpdatesStore.remove(entry.id, entry.updatedAt); chosenId = undefined; await refresh(); status('更新已删除。'); section.querySelector('.updates-add').focus({ preventScroll: true }); }
    catch (error) { status(error.message, true); } finally { remove.disabled = false; }
  });
  UpdatesStore.subscribe(refresh); window.addEventListener('pageshow', refresh); document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); }); refresh();
})();
