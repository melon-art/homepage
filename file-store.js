/* Shared file store. Browser databases are read only for an explicit migration. */
(() => {
  'use strict';
  let state, mode = 'loading', failure, legacy;
  const listeners = new Set(), blobCache = new Map();
  let channel;
  try { channel = new BroadcastChannel('academic-homepage.files.v1'); channel.onmessage = () => changed(false); } catch (_) { /* pageshow also refreshes */ }
  const localHost = ['127.0.0.1', 'localhost', '[::1]'].includes(location.hostname);
  const endpoint = path => new URL(path, document.baseURI).href;
  function changed(broadcast = true) {
    listeners.forEach(listener => listener());
    dispatchEvent(new Event('site-content-changed'));
    if (broadcast) channel?.postMessage('changed');
  }
  async function jsonRequest(path, options = {}) {
    const response = await fetch(endpoint(path), { cache: 'no-store', ...options });
    const value = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(value.error || '无法连接本地文件服务，请使用 start-local.cmd 启动后刷新。');
      error.status = response.status; throw error;
    }
    return value;
  }
  function fileData(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader(); reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('无法读取附件，原数据未修改。'));
      reader.readAsDataURL(blob.type ? blob : new Blob([blob], { type: 'application/octet-stream' }));
    });
  }
  async function legacyEntries(name) {
    if (!('indexedDB' in window)) return [];
    if (indexedDB.databases && !(await indexedDB.databases()).some(item => item.name === name)) return [];
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(name); let absent = false;
      request.onupgradeneeded = () => { absent = true; request.transaction.abort(); };
      request.onerror = () => absent ? resolve([]) : reject(new Error('无法读取旧数据，请允许此浏览器存储后重试。'));
      request.onblocked = () => reject(new Error('旧数据被其他标签页占用，请关闭旧编辑页再刷新。'));
      request.onsuccess = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('entries')) { db.close(); resolve([]); return; }
        const tx = db.transaction('entries', 'readonly'), query = tx.objectStore('entries').getAll();
        tx.oncomplete = () => { db.close(); resolve(query.result); };
        tx.onerror = tx.onabort = () => { db.close(); reject(new Error('读取旧记录失败，未迁移任何数据。')); };
      };
    });
  }
  async function readLegacy() {
    const raw = localStorage.getItem('academic-homepage.profile.v1');
    const profile = raw ? JSON.parse(raw) : {};
    if (!profile || typeof profile !== 'object' || Array.isArray(profile)) throw new Error('旧个人资料格式错误，请先保留原数据。');
    const [news, updates] = await Promise.all([legacyEntries('academic-homepage.news.v1'), legacyEntries('academic-homepage.updates.v1')]);
    return { profile, news, updates };
  }
  async function wireAsset(asset) {
    if (!asset) return null;
    if (asset.blob instanceof Blob) return { name: asset.name, data: await fileData(asset.blob) };
    return asset;
  }
  async function wireEntry(value) {
    const result = { ...value };
    for (const key of ['image', 'file']) if (key in value) result[key] = await wireAsset(value[key]);
    return result;
  }
  async function snapshot() {
    const original = await readLegacy();
    return { profile: original.profile, news: await Promise.all(original.news.map(wireEntry)), updates: await Promise.all(original.updates.map(wireEntry)) };
  }
  function assetBlob(asset) {
    if (!asset || asset.blob instanceof Blob) return Promise.resolve(asset?.blob);
    const path = asset.path;
    if (!/^assets\/uploads\/[a-f0-9]{64}\.(png|jpg|webp|pdf|bin)$/.test(path || '') &&
        !/^api\/draft-assets\/[a-f0-9]{64}\.(png|jpg|webp|pdf|bin)$/.test(path || '')) return Promise.reject(new Error('附件路径无效。'));
    if (!blobCache.has(path)) blobCache.set(path, fetch(endpoint(path), { cache: 'no-store' }).then(async response => {
      if (!response.ok) throw new Error('附件读取失败，请检查本地文件。');
      return response.blob();
    }).catch(error => { blobCache.delete(path); throw error; }));
    return blobCache.get(path);
  }
  async function hydrateEntry(value) {
    const result = { ...value };
    for (const key of ['image', 'file']) if (value[key] && typeof value[key] === 'object') result[key] = { name: value[key].name, blob: await assetBlob(value[key]) };
    return result;
  }
  async function refresh() {
    await ready;
    if (failure) throw failure;
    if (mode !== 'static') state = await jsonRequest('api/state');
    if (mode === 'pending' && state.initialized) mode = 'file';
    return state;
  }
  async function assertWritable() {
    await ready;
    if (failure) throw failure;
    if (!state.canEdit || mode === 'static') throw new Error('当前为只读预览，请在电脑上打开 http://127.0.0.1:' + (location.port || '8765') + '/ 进行编辑。');
    if (!state.initialized) throw new Error('请先在设置页备份并迁移旧数据，或确认使用空白文件开始。');
  }
  async function mutate(action, payload, initializing = false) {
    await ready;
    if (!initializing) await assertWritable();
    if (failure) throw failure;
    if (!state.canEdit || mode === 'static') throw new Error('只能在电脑本机修改文件。');
    state = await jsonRequest('api/' + action, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Homepage-Token': state.token }, body: JSON.stringify(payload) });
    mode = 'file'; changed();
    return state;
  }
  const ready = (async () => {
    try {
      if (location.protocol === 'file:') throw new Error('文件保存需要本地服务，请双击 start-local.cmd 后打开 http://127.0.0.1:8765/ 。');
      const response = await fetch(endpoint('api/state'), { cache: 'no-store' });
      if (response.status === 404 || response.status === 405 || response.status === 501) {
        try { state = await jsonRequest('data/site.json'); }
        catch (error) { if (error.status !== 404) throw error; state = await jsonRequest('data/site.example.json'); }
        state.canEdit = false; mode = 'static';
      } else {
        state = await response.json();
        if (!response.ok) throw new Error(state.error || '本地文件服务读取失败。');
        mode = 'file';
      }
      if (state.schemaVersion !== 1 || !state.profile || !Array.isArray(state.news) || !Array.isArray(state.updates)) throw new Error('本地数据结构错误，未回退到浏览器数据。');
      if (!Array.isArray(state.explore)) state.explore = await jsonRequest('data/explore-defaults.json');
      if (!state.initialized && state.canEdit && localHost) { legacy = await readLegacy(); mode = 'pending'; }
    } catch (error) { failure = error; mode = 'error'; }
  })();
  window.SiteStorage = {
    ready, refresh, assertWritable,
    get mode() { return mode; }, get canEdit() { return !!state?.canEdit && !failure; },
    get initialized() { return !!state?.initialized; }, get profileVersion() { return state?.profileRevision; },
    get englishName() { return ((mode === 'pending' ? legacy?.profile : state?.profile)?.englishName || '').trim().slice(0, 80); },
    async profile() {
      await refresh();
      if (mode === 'pending') return { ...legacy.profile };
      const value = { ...state.profile };
      for (const key of ['photo', 'cv']) if (value[key]) value[key] = { name: value[key].name, data: await fileData(await assetBlob(value[key])) };
      return value;
    },
    async saveProfile(value, expected) { await mutate('profile', { value, expected }); return this.profile(); },
    async explore() { await refresh(); return state.explore || []; },
    async all(collection) {
      await refresh();
      const values = mode === 'pending' && collection !== 'explore' ? legacy[collection] : state[collection];
      return mode === 'pending' ? [...values] : Promise.all(values.map(hydrateEntry));
    },
    async save(collection, value, expected = null) {
      const entry = { ...value, id: value.id || crypto.randomUUID() };
      const result = await mutate(collection, { action: 'save', value: await wireEntry(entry), expected });
      return hydrateEntry(result[collection].find(item => item.id === entry.id));
    },
    async remove(collection, id, expected) { await mutate(collection, { action: 'delete', id, expected }); },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); }
  };
  function download(content, type, name) {
    const url = URL.createObjectURL(new Blob([content], { type })), link = document.createElement('a');
    link.href = url; link.download = name; document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
  function node(tag, content, className) { const value = document.createElement(tag); if (content) value.textContent = content; if (className) value.className = className; return value; }
  ready.then(() => {
    const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'storage.css?v=1'; document.head.append(css);
    const readOnly = !state?.canEdit || !!failure;
    document.body.dataset.storageReadonly = String(readOnly);
    const note = document.querySelector('#storage-note, #news-storage-note, .up-note');
    if (note) note.textContent = failure ? failure.message : readOnly ? '当前为只读预览。编辑请使用电脑的本机地址；内容来自本地文件。' : state.initialized ? '保存到本地项目文件，不上传 GitHub。修改后各设备重新打开页面即可读取。' : '先备份并迁移当前浏览器的数据，再开始文件保存。原浏览器数据会保留。';
    if (failure || !state?.initialized) {
      const banner = node('div', '', 'storage-banner'); banner.setAttribute('role', 'status');
      banner.append(node('span', failure ? failure.message : state?.canEdit ? '本地文件尚未初始化，已有浏览器内容仍保留。' : '等待电脑迁移已有资料，完成后刷新即可预览。'));
      if (!failure && state?.canEdit && !document.querySelector('#profile-form')) { const link = node('a', '前往设置迁移'); link.href = 'settings.html'; banner.append(link); }
      document.body.prepend(banner);
      new ResizeObserver(() => document.documentElement.style.setProperty('--storage-banner-height', banner.offsetHeight + 'px')).observe(banner);
    }
    const form = document.querySelector('#profile-form');
    if (form) {
      const panel = node('section', '', 'storage-panel'); panel.setAttribute('aria-labelledby', 'storage-title');
      const title = node('h2', '本地数据'); title.id = 'storage-title'; panel.append(title);
      const summary = node('p'), feedback = node('p', '', 'storage-feedback'); feedback.setAttribute('role', 'status');
      const actions = node('div', '', 'storage-actions'); panel.append(summary, actions, feedback); form.before(panel);
      if (failure) summary.textContent = failure.message;
      else if (readOnly) summary.textContent = '这里展示本地文件内容。修改和下载完整备份请使用电脑的本机地址。';
      else {
        const old = legacy;
        summary.textContent = state.initialized ? '资料、News 和展示中的 Updates 保存在 data/site.json，附件为独立文件；草稿与自动备份保存在 .local 中。' :
          '当前浏览器：' + (Object.values(old.profile).some(Boolean) ? '有个人资料' : '未填写个人资料') + '，' + old.news.length + ' 条 News，' + old.updates.length + ' 条 Updates（含草稿）。迁移会先保存含附件的完整备份，再写入文件；旧浏览器数据不删除。';
        function button(label, action) {
          const control = node('button', label); control.type = 'button'; actions.append(control);
          control.addEventListener('click', async () => {
            actions.querySelectorAll('button').forEach(item => item.disabled = true); feedback.textContent = '正在处理，请稍候…';
            try { await action(); } catch (error) { feedback.textContent = error.message; }
            finally { actions.querySelectorAll('button').forEach(item => item.disabled = false); }
          });
        }
        if (!state.initialized) {
          button('下载浏览器备份', async () => { download(JSON.stringify(await snapshot(), null, 2), 'application/json', 'homepage-browser-backup.json'); feedback.textContent = '已生成含附件的浏览器备份。'; });
          button('备份并迁移至本地文件', async () => {
            await mutate('migrate', { snapshot: await snapshot(), expectedRevision: state.revision }, true);
            location.reload();
          });
          if (!Object.values(old.profile).some(Boolean) && !old.news.length && !old.updates.length) button('使用空白文件开始', async () => {
            if (!confirm('当前浏览器没有旧内容。若其他浏览器或地址中有资料，请先回到那里迁移。仍要使用空白文件开始吗？')) { feedback.textContent = '已取消。'; return; }
            await mutate('initialize', { expectedRevision: state.revision }, true); location.reload();
          });
        } else button('下载完整文件备份', async () => {
          const response = await fetch(endpoint('api/export'), { headers: { 'X-Homepage-Token': state.token }, cache: 'no-store' });
          if (!response.ok) throw new Error('备份读取失败，请重试。');
          download(await response.blob(), 'application/zip', 'homepage-files-backup.zip'); feedback.textContent = '完整备份已下载，包含资料、草稿和附件。';
        });
      }
      if (readOnly || !state?.initialized) form.inert = true;
    }
  });
})();
