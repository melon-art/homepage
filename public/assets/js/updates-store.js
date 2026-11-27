(() => {
  'use strict';
  const NAME = 'academic-homepage.updates.v1', REVISION = NAME + '.revision';
  const listeners = new Set();
  let channel;
  try { if ('BroadcastChannel' in window) channel = new BroadcastChannel(NAME); } catch (_) { /* storage fallback */ }
  function notify() { listeners.forEach(listener => listener()); }
  if (channel) channel.onmessage = notify;
  window.addEventListener('storage', event => { if (event.key === REVISION) notify(); });
  function broadcast() {
    notify();
    if (channel) channel.postMessage('changed');
    else try { localStorage.setItem(REVISION, crypto.randomUUID()); } catch (_) { /* pageshow also refreshes */ }
  }
  async function all() { return SiteStorage.all('updates'); }
  function validDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
    const date = new Date(value + 'T12:00:00Z');
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value && value >= '1900-01-01' && value <= '2100-12-31';
  }
  function target(entry) {
    const page = SitePages.page(entry.pageId);
    return page?.sectionId === entry.sectionId ? SitePages.resolveUpdate(entry.pageId, entry.anchorId) : '';
  }
  function validate(entry) {
    if (!validDate(entry.date)) throw new Error('请选择有效日期（1900—2100年）。');
    if (typeof entry.body !== 'string' || entry.body.length > 500) throw new Error('正文最多 500 字。');
    if ((entry.imageAlt || '').length > 160) throw new Error('图片说明最多 160 字。');
    if (entry.sectionId && !SitePages.section(entry.sectionId)) throw new Error('请选择有效的所属板块。');
    if (entry.status !== 'draft' && entry.status !== 'published') throw new Error('更新状态无效。');
    if (entry.image && (!(entry.image.blob instanceof Blob) || !['image/jpeg', 'image/png', 'image/webp'].includes(entry.image.blob.type) || entry.image.blob.size > 5 * 1024 * 1024)) throw new Error('图片需为 JPG、PNG 或 WebP，且不超过 5 MB。');
    if (entry.status === 'published') {
      if (!entry.body.trim()) throw new Error('请填写更新正文。');
      if (!target(entry)) throw new Error('请选择已建立的站内页面；目标未建立时请先保存草稿。');
    }
  }
  async function save(value, expected = null) {
    validate(value);
    const entry = { id: value.id || crypto.randomUUID(), date: value.date, sectionId: value.sectionId || '', pageId: value.pageId || '', anchorId: value.anchorId || '', body: value.body.trim(), imageAlt: (value.imageAlt || '').trim(), image: value.image || null, status: value.status };
    const saved = await SiteStorage.save('updates', entry, expected); broadcast(); return saved;
  }
  SiteStorage.subscribe(notify);
  window.UpdatesStore = {
    all, save, validDate, target,
    remove: async (id, expected) => { await SiteStorage.remove('updates', id, expected); broadcast(); },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    sort: (a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt || b.id.localeCompare(a.id)
  };
})();
