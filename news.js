(() => {
  'use strict';

  const DB_NAME = 'academic-homepage.news.v1';
  const REVISION_KEY = 'academic-homepage.news.revision';
  const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const LIMITS = { image: 5 * 1024 * 1024, file: 10 * 1024 * 1024 };
  const form = document.querySelector('#news-form');
  const list = document.querySelector('.news-list');
  let database;
  let channel;
  try { channel = new BroadcastChannel(DB_NAME); } catch (_) { /* Storage-event fallback below. */ }

  function validDate(value) {
    if (typeof value !== 'string' || !/^(?!0000)\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const time = Date.parse(value + 'T12:00:00Z');
    return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value;
  }

  function safeName(value) {
    return String(value || '').replace(/[\x00-\x1f/\\<>:"|?*]/g, '').slice(0, 200) || 'attachment';
  }

  function connect() {
    if (!database) database = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      let blocked = false;
      request.onupgradeneeded = () => request.result.createObjectStore('entries', { keyPath: 'id' });
      request.onerror = () => reject(request.error);
      request.onblocked = () => { blocked = true; reject(new Error('Blocked storage')); };
      request.onsuccess = () => {
        const db = request.result;
        if (blocked) { db.close(); return; }
        db.onversionchange = () => { db.close(); database = undefined; };
        resolve(db);
      };
    }).catch(error => { database = undefined; throw error; });
    return database;
  }

  async function transact(mode, action) {
    const db = await connect();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('entries', mode);
      const request = action(tx.objectStore('entries'));
      tx.oncomplete = () => resolve(request.result);
      tx.onabort = tx.onerror = () => reject(tx.error || new Error('Storage failed'));
    });
  }

  // Read and replace in one transaction: editing a deleted/stale entry must not recreate it.
  async function replaceExisting(entry, original) {
    const db = await connect();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('entries', 'readwrite');
      const store = tx.objectStore('entries');
      const request = store.get(entry.id);
      let reason;
      request.onsuccess = () => {
        const current = request.result;
        if (!current) reason = 'missing';
        else if ((current.updatedAt || current.createdAt) !== (original.updatedAt || original.createdAt)) reason = 'conflict';
        if (reason) { tx.abort(); return; }
        store.put(entry);
      };
      tx.oncomplete = resolve;
      tx.onabort = tx.onerror = () => reject(reason ? new Error(reason) : tx.error || new Error('Storage failed'));
    });
  }

  function attachment(value, kind) {
    if (!value || !(value.blob instanceof Blob) || !value.blob.size || value.blob.size > LIMITS[kind]) return null;
    if (kind === 'image' && !IMAGE_TYPES.includes(value.blob.type)) return null;
    return { name: safeName(value.name), blob: value.blob };
  }

  function notifySaved(id) {
    try {
      if (channel) channel.postMessage('changed');
      else localStorage.setItem(REVISION_KEY, id + ':' + crypto.randomUUID());
    } catch (_) { /* Returning home / pageshow still reloads the saved entries. */ }
  }

  if (form) {
    const fields = form.querySelector('fieldset');
    const save = form.querySelector('[type="submit"]');
    const status = form.querySelector('#news-form-status');
    const date = form.elements.namedItem('date');
    const body = form.elements.namedItem('body');
    const assets = { image: null, file: null };
    const parameters = new URLSearchParams(location.search);
    const editing = parameters.has('id');
    const editId = parameters.get('id');
    const returnTarget = parameters.get('from') === 'news' ? 'news.html' : 'index.html#news-title';
    if (returnTarget === 'news.html') {
      const back = document.querySelector('.back-link');
      back.href = returnTarget;
      back.lastChild.textContent = '返回新闻列表';
      document.querySelector('#news-storage-note').textContent = '保存后返回新闻列表。News 与附件仅保存在当前浏览器，不会自动公开发布。';
    }
    let original;
    const assetErrors = { image: false, file: false };
    const revisions = { image: 0, file: 0 };
    let previewURL;
    let pending = 0;
    let saving = false;
    let ready = false;
    const now = new Date();
    date.value = [String(now.getFullYear()).padStart(4, '0'), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
    if (editing) {
      document.querySelector('#news-edit-title').textContent = '编辑 News';
      document.title = '编辑 News · 个人学术主页';
      fields.disabled = true;
    }

    function message(text, error = false) {
      status.textContent = text;
      status.classList.toggle('is-error', error);
    }

    function updateBusy() {
      save.disabled = !ready || saving || pending > 0 || assetErrors.image || assetErrors.file;
      save.textContent = saving ? '正在保存…' : pending ? '正在读取…' : '保存';
    }

    function showAsset(kind) {
      const value = assets[kind];
      form.querySelector('[data-asset-name="' + kind + '"]').textContent = value ? value.name : (kind === 'image' ? '尚未选择图片' : '尚未选择文件');
      form.querySelector('[data-remove="' + kind + '"]').hidden = !value;
      if (kind === 'image') {
        const preview = form.querySelector('[data-image-preview]');
        if (previewURL) URL.revokeObjectURL(previewURL);
        preview.hidden = !value;
        if (value) { previewURL = URL.createObjectURL(value.blob); preview.src = previewURL; }
        else { previewURL = undefined; preview.removeAttribute('src'); }
      }
    }

    async function prepare(file, kind) {
      if (!file.size || file.size > LIMITS[kind]) throw new Error(kind === 'image' ? '请选择非空且不超过 5 MB 的图片。' : '请选择非空且不超过 10 MB 的文件。');
      if (kind === 'image') {
        if (!IMAGE_TYPES.includes(file.type)) throw new Error('图片仅支持 JPG、PNG 或 WebP。');
        const url = URL.createObjectURL(file);
        try {
          const image = new Image();
          image.src = url;
          await image.decode();
        } catch (_) { throw new Error('无法读取这张图片，请重新选择。'); }
        finally { URL.revokeObjectURL(url); }
      }
      return { name: safeName(file.name), blob: file.slice(0, file.size, kind === 'image' ? file.type : 'application/octet-stream') };
    }

    for (const kind of ['image', 'file']) {
      const input = form.elements.namedItem(kind);
      const error = form.querySelector('#news-' + kind + '-error');
      input.addEventListener('change', async () => {
        const file = input.files[0];
        if (!file) return;
        const revision = ++revisions[kind];
        pending++;
        updateBusy();
        error.hidden = true;
        try {
          const value = await prepare(file, kind);
          if (revision === revisions[kind]) { assets[kind] = value; assetErrors[kind] = false; showAsset(kind); input.removeAttribute('aria-invalid'); }
        } catch (failure) {
          if (revision === revisions[kind]) {
            error.textContent = failure.message + (assets[kind] ? ' 已保留上一份附件。' : '');
            error.hidden = false;
            assetErrors[kind] = true;
            form.querySelector('[data-remove="' + kind + '"]').hidden = false;
            input.setAttribute('aria-invalid', 'true');
            input.value = '';
          }
        } finally {
          pending--;
          updateBusy();
        }
      });
      form.querySelector('[data-remove="' + kind + '"]').addEventListener('click', () => {
        revisions[kind]++;
        assets[kind] = null;
        assetErrors[kind] = false;
        input.value = '';
        input.removeAttribute('aria-invalid');
        error.hidden = true;
        showAsset(kind);
        input.focus();
      });
    }

    body.addEventListener('input', () => body.setCustomValidity(''));
    date.addEventListener('input', () => date.setCustomValidity(''));
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!ready || saving || pending || assetErrors.image || assetErrors.file) return;
      body.setCustomValidity(body.value.trim() ? '' : '请填写正文。');
      date.setCustomValidity(validDate(date.value) ? '' : '请选择有效日期。');
      if (!form.reportValidity()) return;
      if (body.value.length > 2000) { message('正文最多 2000 字，请缩短后再保存。', true); return; }
      saving = true;
      fields.disabled = true;
      updateBusy();
      message('正在保存…');
      const entry = { id: editing ? original.id : crypto.randomUUID(), date: date.value, body: body.value.trim(), createdAt: editing ? original.createdAt : Date.now(), image: assets.image, file: assets.file };
      if (editing) entry.updatedAt = Math.max(Date.now(), Number(original.updatedAt || original.createdAt || 0) + 1);
      try {
        if (editing) await replaceExisting(entry, original);
        else await transact('readwrite', store => store.add(entry));
        notifySaved(entry.id);
        location.assign(returnTarget);
      } catch (failure) {
        const reasons = {
          missing: '这条 News 已被删除，无法保存修改。当前草稿保留在此页，可复制正文后返回主页。',
          conflict: '这条 News 已在其他页面修改。当前草稿保留在此页，请复制后重新打开最新记录。'
        };
        message(reasons[failure.message] || '保存失败，可能是浏览器存储空间不足或被禁用。内容和附件已保留在此页，请重试。', true);
        saving = false;
        fields.disabled = false;
        updateBusy();
      }
    });

    if (location.protocol === 'file:') {
      message('请通过 http://127.0.0.1:8765/news-edit.html 打开此页，再添加 News。', true);
    } else {
      (async () => {
        await connect();
        if (editing) {
          message('正在读取 News…');
          const entry = editId ? await transact('readonly', store => store.get(editId)) : null;
          if (!entry || !validDate(entry.date) || typeof entry.body !== 'string') {
            message('找不到这条 News，可能已被删除。请返回主页查看。', true);
            return;
          }
          original = entry;
          date.value = entry.date;
          body.value = entry.body;
          assets.image = attachment(entry.image, 'image');
          assets.file = attachment(entry.file, 'file');
          showAsset('image');
          showAsset('file');
          message('');
        }
        fields.disabled = false;
        ready = true;
        updateBusy();
      })().catch(() => {
        message('无法打开 News 本地存储，请允许浏览器存储后刷新。当前输入会保留在此页。', true);
      });
    }
  }

  if (list) {
    const status = document.querySelector('.news-status');
    const emptyMarkup = list.firstElementChild.cloneNode(true);
    let version = 0;
    let urls = [];
    const deleting = new Set();

    function node(tag, className, text) {
      const element = document.createElement(tag);
      element.className = className;
      if (text !== undefined) element.textContent = text;
      return element;
    }

    async function render() {
      const current = ++version;
      try {
        const stored = await transact('readonly', store => store.getAll());
        if (current !== version) return;
        const entries = stored.filter(entry => entry && typeof entry.id === 'string' && validDate(entry.date) && typeof entry.body === 'string' && entry.body.trim() && entry.body.length <= 2000);
        entries.sort((a, b) => b.date.localeCompare(a.date) || (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0) || a.id.localeCompare(b.id));
        const limit = Number(list.dataset.newsLimit);
        const visibleEntries = Number.isInteger(limit) && limit > 0 ? entries.slice(0, limit) : entries;
        const nextURLs = [];
        const items = visibleEntries.map(entry => {
          const item = node('li', 'news-item');
          item.dataset.newsId = entry.id;
          const text = node('div', 'news-text');
          const time = node('time', 'news-date', entry.date);
          time.dateTime = entry.date;
          const meta = node('div', 'news-meta');
          const actions = node('div', 'news-actions');
          const edit = node('a', 'news-action news-edit', '编辑');
          edit.href = 'news-edit.html?id=' + encodeURIComponent(entry.id) + (list.dataset.newsScope === 'all' ? '&from=news' : '');
          edit.setAttribute('aria-label', '编辑 ' + entry.date + ' 的 News');
          const remove = node('button', 'news-action news-delete', '删除');
          remove.type = 'button';
          remove.disabled = deleting.has(entry.id);
          remove.setAttribute('aria-label', '删除 ' + entry.date + ' 的 News');
          remove.addEventListener('click', async () => {
            if (deleting.has(entry.id) || !window.confirm('删除这条 News？删除后无法恢复。\n\n' + entry.date + '\n' + entry.body.slice(0, 100))) return;
            deleting.add(entry.id);
            remove.disabled = true;
            try {
              await transact('readwrite', store => store.delete(entry.id));
              notifySaved(entry.id);
              await render();
              status.textContent = 'News 已删除。';
              status.classList.add('is-success');
              status.hidden = false;
              (list.querySelector('.news-edit') || document.querySelector('.news-add')).focus({ preventScroll: true });
            } catch (_) {
              status.textContent = '删除失败，News 未删除。请允许浏览器存储后重试。';
              status.classList.remove('is-success');
              status.hidden = false;
            } finally {
              deleting.delete(entry.id);
              remove.disabled = false;
            }
          });
          actions.append(edit, remove);
          meta.append(time);
          text.append(meta, node('p', 'news-copy', entry.body));
          const file = attachment(entry.file, 'file');
          if (file) {
            const link = node('a', 'news-file');
            link.href = URL.createObjectURL(new Blob([file.blob], { type: 'application/octet-stream' }));
            nextURLs.push(link.href);
            link.download = file.name;
            link.setAttribute('aria-label', '下载文件：' + file.name);
            link.append(node('span', '', '下载 ' + file.name));
            text.append(link);
          }
          item.append(text);
          const image = attachment(entry.image, 'image');
          if (image) {
            const thumbnail = node('img', 'news-image');
            thumbnail.src = URL.createObjectURL(image.blob);
            nextURLs.push(thumbnail.src);
            thumbnail.alt = '这条动态的附图';
            thumbnail.loading = 'lazy';
            thumbnail.width = 144;
            thumbnail.height = 108;
            item.append(thumbnail);
          }
          item.append(actions);
          return item;
        });
        list.replaceChildren(...(items.length ? items : [emptyMarkup.cloneNode(true)]));
        for (const url of urls) URL.revokeObjectURL(url);
        urls = nextURLs;
        status.hidden = true;
      } catch (_) {
        if (current !== version) return;
        if (!urls.length && !list.querySelector('time')) list.replaceChildren();
        status.textContent = '暂时无法读取本机 News。请使用本地预览地址并允许浏览器存储，然后刷新。';
        status.classList.remove('is-success');
        status.hidden = false;
      }
    }

    render();
    if (channel) channel.onmessage = event => { if (event.data === 'changed') render(); };
    window.addEventListener('storage', event => { if (event.key === REVISION_KEY || event.key === null) render(); });
    window.addEventListener('pageshow', event => { if (event.persisted) render(); });
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') render(); });
  }
})();
