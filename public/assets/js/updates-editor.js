(async () => {
  'use strict';
  await SiteStorage.ready;
  function node(tag, className, text) { const element = document.createElement(tag); if (className) element.className = className; if (text !== undefined) element.textContent = text; return element; }
  function status(element, message, error = false) { element.hidden = !message; element.textContent = message; element.classList.toggle('is-error', error); }
  const form = document.querySelector('#up-form');
  if (!form) {
    const list = document.querySelector('#up-management-list'); if (!list) return;
    const message = document.querySelector('#up-manage-status'), empty = document.querySelector('#up-manage-empty');
    let generation = 0;
    async function refresh() {
      const current = ++generation;
      try {
        const entries = (await UpdatesStore.all()).sort(UpdatesStore.sort); if (current !== generation) return;
        list.replaceChildren(); empty.hidden = entries.length > 0;
        entries.forEach(entry => {
          const item = node('li', 'up-management-item'); item.dataset.id = entry.id;
          const meta = node('div'), time = node('time', 'up-record-date', entry.date); time.dateTime = entry.date;
          const ready = Boolean(UpdatesStore.target(entry));
          meta.append(time, node('p', 'up-record-state', entry.status === 'draft' ? '草稿' : ready ? '已在主页展示' : '目标页面不可用'));
          const content = node('div'); content.append(node('p', 'up-record-body', entry.body || '未填写正文'));
          const page = SitePages.page(entry.pageId), section = SitePages.section(entry.sectionId), anchor = page?.anchors.find(value => value.id === entry.anchorId);
          content.append(node('p', 'up-record-target', (section?.label || '未选择板块') + ' · ' + (page?.label || '未选择目标页面') + (anchor ? ' / ' + anchor.label : '') + (!ready ? '（待选择有效页面）' : '')));
          const actions = node('div', 'up-record-actions'), edit = node('a', '', '编辑'), remove = node('button', 'up-link-button up-record-delete', '删除');
          edit.href = 'updates-edit.html?id=' + encodeURIComponent(entry.id); edit.setAttribute('aria-label', '编辑 ' + entry.date + ' 的更新'); remove.type = 'button'; remove.setAttribute('aria-label', '删除 ' + entry.date + ' 的更新');
          remove.addEventListener('click', async () => {
            if (!confirm('删除这条更新？删除后无法恢复。\n\n' + entry.date + '\n' + (entry.body || '未填写正文'))) return;
            remove.disabled = true;
            try { await UpdatesStore.remove(entry.id, entry.updatedAt); status(message, '更新已删除。'); await refresh(); (list.querySelector('a') || document.querySelector('a.up-primary')).focus({ preventScroll: true }); }
            catch (error) { status(message, error.message, true); remove.disabled = false; }
          });
          actions.append(edit, remove); item.append(meta, content, actions); list.append(item);
        });
      } catch (error) { status(message, error.message, true); }
    }
    UpdatesStore.subscribe(refresh); window.addEventListener('pageshow', refresh); document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); }); refresh(); return;
  }
  const fields = document.querySelector('#up-fields'), date = form.querySelector('#up-date'), section = form.querySelector('#up-section'), body = form.querySelector('#up-body'), page = form.querySelector('#up-page'), anchor = form.querySelector('#up-anchor'), alt = form.querySelector('#up-image-alt');
  const imageInput = form.querySelector('#up-image'), imageError = form.querySelector('#up-image-error'), imageName = form.querySelector('#up-image-name'), imageRemove = form.querySelector('#up-image-remove'), message = form.querySelector('#up-status'), previewHost = document.querySelector('#up-preview-view'), previewState = document.querySelector('#up-preview-state');
  let saved, image = null, imageBusy = false, imageInvalid = false, imageSequence = 0, preview, previewFrame, dirty = false, saving = false, unavailable = false;
  const now = new Date(); date.value = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
  SitePages.sections.forEach(item => { const option = node('option', '', item.label); option.value = item.id; section.append(option); });
  function getValue(state = 'draft') { return { id: saved?.id || 'preview-current', date: date.value, sectionId: section.value, body: body.value, pageId: page.value, anchorId: anchor.value, imageAlt: alt.value, image, status: state, createdAt: saved?.createdAt || Date.now() }; }
  function fillPages(selected = '') {
    page.replaceChildren(); const available = SitePages.pages.filter(item => item.sectionId === section.value);
    const blank = node('option', '', available.some(item => item.href) ? '请选择目标页面' : section.value ? '该板块页面待建立' : '请先选择所属板块'); blank.value = ''; page.append(blank);
    available.forEach(item => { const option = node('option', '', item.label + (item.href ? '' : '（待建立）')); option.value = item.id; option.disabled = !SitePages.resolve(item.id); page.append(option); });
    page.disabled = !available.some(item => SitePages.resolve(item.id)); page.value = available.some(item => item.id === selected && item.href) ? selected : '';
    document.querySelector('#up-page-help').textContent = page.disabled && section.value ? '这个板块尚未建立页面，可以先保存草稿；页面建立后再关联展示。' : '这里与顶部导航使用同一份站内页面目录。';
    fillAnchors();
  }
  function fillAnchors(selected = '') {
    anchor.replaceChildren(); const top = node('option', '', '页面顶部'); top.value = ''; anchor.append(top);
    const anchors = SitePages.page(page.value)?.anchors || [];
    anchors.forEach(item => { const option = node('option', '', item.label); option.value = item.id; anchor.append(option); });
    anchor.disabled = !page.value || !anchors.length; anchor.value = anchors.some(item => item.id === selected) ? selected : '';
  }
  function updatePreview() {
    const entry = getValue(), href = UpdatesStore.target(entry), test = document.querySelector('#up-test-link');
    body.setAttribute('aria-invalid', String(body.value.length > 500)); document.querySelector('#up-body-count').textContent = body.value.length;
    document.querySelector('#up-target-text').textContent = href ? SitePages.page(page.value).label + (anchor.value ? ' / ' + SitePages.page(page.value).anchors.find(item => item.id === anchor.value).label : '') : '尚未选择有效跳转页面';
    test.hidden = !href; if (href) test.href = href; else test.removeAttribute('href');
    previewState.textContent = imageBusy ? '正在读取图片' : dirty ? '未保存' : saved ? saved.status === 'draft' ? '已保存草稿' : '已在主页展示' : '未保存';
    preview?.destroy();
    preview = UpdatesView.mount(previewHost, UpdatesStore.validDate(entry.date) ? [entry] : [], { initialId: entry.id, preview: true });
    imageName.textContent = image?.name || '未添加图片'; imageRemove.hidden = !image && !imageInvalid;
  }
  function schedulePreview() { cancelAnimationFrame(previewFrame); previewFrame = requestAnimationFrame(updatePreview); }
  section.addEventListener('change', () => fillPages()); page.addEventListener('change', () => fillAnchors());
  form.addEventListener('input', () => { dirty = true; schedulePreview(); }); form.addEventListener('change', () => { dirty = true; schedulePreview(); });
  function setBusy() { form.querySelectorAll('button[type=submit]').forEach(button => button.disabled = saving || imageBusy || imageInvalid || unavailable); }
  imageInput.addEventListener('change', async () => {
    const sequence = ++imageSequence, file = imageInput.files[0]; if (!file) return;
    imageBusy = true; imageInvalid = false; setBusy(); status(imageError, ''); schedulePreview();
    try {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('请选择 JPG、PNG 或 WebP 图片。');
      if (file.size > 5 * 1024 * 1024) throw new Error('图片超过 5 MB，请缩小后重新选择。');
      const url = URL.createObjectURL(file);
      try { const decoded = new Image(); decoded.src = url; await decoded.decode(); } catch (_) { throw new Error('无法读取这张图片，请选择有效的图片文件。'); } finally { URL.revokeObjectURL(url); }
      if (sequence !== imageSequence) return;
      image = { name: file.name, blob: file }; dirty = true;
    } catch (error) { if (sequence === imageSequence) { imageInvalid = true; status(imageError, error.message + ' 原有图片未变，请重新选择或移除。', true); } }
    finally { if (sequence === imageSequence) { imageBusy = false; setBusy(); schedulePreview(); } }
  });
  imageRemove.addEventListener('click', () => { imageSequence++; image = null; imageBusy = imageInvalid = false; imageInput.value = ''; dirty = true; status(imageError, ''); setBusy(); updatePreview(); });
  form.addEventListener('submit', async event => {
    event.preventDefault(); if (saving || imageBusy || imageInvalid || unavailable) return;
    const state = event.submitter?.value || 'published', value = getValue(state); value.id = saved?.id;
    saving = true; fields.disabled = true; setBusy(); status(message, '正在保存…');
    try {
      saved = await UpdatesStore.save(value, saved?.updatedAt ?? null); dirty = false;
      const url = new URL(location.href); url.searchParams.set('id', saved.id); history.replaceState(null, '', url);
      document.querySelector('#up-edit-title').textContent = '编辑 Updates'; document.title = '编辑 Updates · 个人学术主页';
      if (state === 'published') location.assign('index.html?update=' + encodeURIComponent(saved.id) + '#updates-title');
      else { status(message, '草稿已保存，可继续编辑或返回主页。'); updatePreview(); }
    } catch (error) { status(message, error.message, true); }
    finally { saving = false; fields.disabled = false; setBusy(); }
  });
  window.addEventListener('beforeunload', event => { if (dirty && !saving) { event.preventDefault(); event.returnValue = ''; } });
  async function init() {
    fields.disabled = true;
    if (!SiteStorage.canEdit || !SiteStorage.initialized) { unavailable = true; setBusy(); status(message, SiteStorage.canEdit ? '请先在设置页迁移旧数据，再编辑更新。' : '当前为只读预览，请使用电脑本机地址编辑。', true); updatePreview(); return; }
    try {
      const entries = await UpdatesStore.all(), id = new URLSearchParams(location.search).get('id');
      if (id) {
        saved = entries.find(entry => entry.id === id);
        if (!saved) { unavailable = true; status(message, '找不到这条更新，可能已被删除。请返回管理页查看。', true); return; }
        date.value = saved.date; section.value = saved.sectionId; body.value = saved.body; alt.value = saved.imageAlt || ''; image = saved.image || null;
        fillPages(saved.pageId); fillAnchors(saved.anchorId);
        document.querySelector('#up-edit-title').textContent = '编辑 Updates'; document.title = '编辑 Updates · 个人学术主页';
      } else fillPages();
    } catch (error) { unavailable = true; status(message, error.message, true); }
    finally { fields.disabled = unavailable; setBusy(); updatePreview(); }
  }
  init();
})();
