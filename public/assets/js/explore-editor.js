(async () => {
  'use strict';
  await SiteStorage.ready;
  const form = document.querySelector('#ex-form'), message = document.querySelector('#ex-status');
  function status(text = '', error = false) { message.textContent = text; message.hidden = !text; message.classList.toggle('is-error', error); }
  function node(tag, className, text) { const element = document.createElement(tag); if (className) element.className = className; if (text !== undefined) element.textContent = text; return element; }
  const urls = new Set();
  function imageURL(entry) { if (!entry.image?.blob) return entry.previewImages[0]; const url = URL.createObjectURL(entry.image.blob); urls.add(url); return url; }
  function release() { urls.forEach(url => URL.revokeObjectURL(url)); urls.clear(); }
  addEventListener('pagehide', release);
  const writable = SiteStorage.canEdit && SiteStorage.initialized;
  if (!form) {
    const list = document.querySelector('#ex-list'), empty = document.querySelector('#ex-empty');
    let generation = 0, deleting = false;
    async function render() {
      const current = ++generation;
      try {
        const entries = await SiteStorage.all('explore'); if (current !== generation) return;
        release(); list.replaceChildren(); empty.hidden = entries.length !== 0;
        entries.forEach(entry => {
          const row = node('li', 'ex-record'); row.dataset.id = entry.id;
          const image = node('img'); image.src = imageURL(entry); image.alt = entry.name + '卡牌配图'; image.width = 128; image.height = 86;
          const copy = node('div'); copy.append(node('h2', '', entry.name), node('p', '', entry.description));
          row.append(image, copy);
          if (writable) {
            const actions = node('div', 'ex-record-actions'), edit = node('a', '', '编辑'), remove = node('button', 'up-link-button ex-delete', '删除');
            edit.href = 'explore-edit.html?id=' + encodeURIComponent(entry.id); edit.setAttribute('aria-label', '编辑' + entry.name);
            remove.type = 'button'; remove.setAttribute('aria-label', '删除' + entry.name);
            remove.addEventListener('click', async () => {
              if (deleting || !confirm('删除“' + entry.name + '”的探索卡牌？\n该板块会从转盘移除，页面文件和其他内容会保留。')) return;
              deleting = true; remove.disabled = true;
              try { await SiteStorage.remove('explore', entry.id, entry.updatedAt); await render(); status('卡牌已删除。'); (list.querySelector('a') || document.querySelector('.up-text-link')).focus({preventScroll:true}); }
              catch (error) { status(error.message, true); remove.disabled = false; }
              finally { deleting = false; }
            });
            actions.append(edit, remove); row.append(actions);
          }
          list.append(row);
        });
        if (!writable) status(SiteStorage.canEdit ? '请先在基本信息中完成旧资料迁移，再编辑卡牌。' : '当前为只读预览，请在电脑本机地址编辑。');
        else if (message.textContent === '正在读取板块…') status();
      } catch (error) { status(error.message, true); }
    }
    SiteStorage.subscribe(render); addEventListener('pageshow', render); document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
    await render(); return;
  }
  const fields = document.querySelector('#ex-fields'), name = document.querySelector('#ex-name'), description = document.querySelector('#ex-description'), input = document.querySelector('#ex-image');
  const imageName = document.querySelector('#ex-image-name'), imageError = document.querySelector('#ex-image-error'), preview = document.querySelector('#ex-image-preview'), reset = document.querySelector('#ex-reset-image');
  let saved, image = null, busy = false, invalid = false, dirty = false, saving = false, sequence = 0;
  function setBusy() { form.querySelector('[type=submit]').disabled = busy || invalid || saving; }
  function showImage() {
    release(); preview.src = imageURL({...saved, image});
    imageName.textContent = image?.name || '当前使用默认页面示意图'; reset.hidden = !image && !invalid;
  }
  input.addEventListener('change', async () => {
    const file = input.files[0], current = ++sequence; if (!file) return;
    busy = true; invalid = false; setBusy(); imageError.hidden = true;
    try {
      if (!['image/jpeg','image/png','image/webp'].includes(file.type) || !file.size || file.size > 5 * 1024 * 1024) throw new Error('请选择不超过5 MB的JPG、PNG或WebP图片。');
      const url = URL.createObjectURL(file);
      try { const decoded = new Image(); decoded.src = url; await decoded.decode(); } catch (_) { throw new Error('图片无法显示，请重新选择。'); } finally { URL.revokeObjectURL(url); }
      if (current !== sequence) return;
      image = {name:file.name, blob:file}; dirty = true; showImage();
    } catch (error) { if (current === sequence) { invalid = true; imageError.textContent = error.message + ' 原图片仍保留，也可使用默认图片。'; imageError.hidden = false; reset.hidden = false; } }
    finally { if (current === sequence) { busy = false; setBusy(); } }
  });
  reset.addEventListener('click', () => { sequence++; image = null; input.value = ''; busy = invalid = false; dirty = true; imageError.hidden = true; showImage(); setBusy(); });
  form.addEventListener('input', () => { dirty = true; });
  form.addEventListener('submit', async event => {
    event.preventDefault(); if (busy || invalid || saving || !saved || !form.reportValidity()) return;
    if (!name.value.trim() || !description.value.trim()) { status('请填写卡牌标题和介绍。', true); return; }
    saving = true; fields.disabled = true; status('正在保存…'); setBusy();
    try { await SiteStorage.save('explore', {id:saved.id, name:name.value, description:description.value, image}, saved.updatedAt); dirty = false; location.assign('explore-manage.html'); }
    catch (error) { status(error.message + ' 当前输入和图片已保留。', true); }
    finally { saving = false; fields.disabled = false; setBusy(); }
  });
  addEventListener('beforeunload', event => { if (dirty && !saving) { event.preventDefault(); event.returnValue = ''; } });
  try {
    await SiteStorage.assertWritable();
    const id = new URLSearchParams(location.search).get('id');
    saved = (await SiteStorage.all('explore')).find(entry => entry.id === id);
    if (!saved) throw new Error('找不到这个板块，可能已被删除。请返回板块管理。');
    name.value = saved.name; description.value = saved.description; image = saved.image;
    showImage(); fields.disabled = false; setBusy(); status();
  } catch (error) { status(error.message, true); }
})();
