(async () => {
  'use strict';
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const editing = id !== null || params.get('new') === '1';
  const form = document.querySelector('#article-form');
  const fields = form.querySelector('fieldset');
  const status = document.querySelector('#article-status');
  const input = document.querySelector('#article-cover');
  const preview = document.querySelector('#article-cover-preview');
  const remove = document.querySelector('#article-cover-remove');
  const view = document.querySelector('#article-view');
  const escapeId = encodeURIComponent;
  let saved, cover, coverUrl = '', coverRequest = 0, checking = false, dirty = false;

  function report(message, error = false) {
    status.textContent = message;
    status.hidden = !message;
    status.classList.toggle('is-error', error);
  }
  function setCover(value, url = '') {
    if (coverUrl) URL.revokeObjectURL(coverUrl);
    cover = value;
    coverUrl = url;
    const path = cover?.path || '';
    const source = url || (/^(assets\/uploads|api\/draft-assets)\/[a-f0-9]{64}\.(png|jpg|webp)$/.test(path) ? path : '');
    preview.hidden = !source;
    remove.hidden = !cover;
    if (source) preview.src = source;
    else preview.removeAttribute('src');
  }
  function updateActions() {
    const published = saved?.status === 'published';
    view.hidden = !published;
    if (published) view.href = 'blog-article.html?id=' + escapeId(saved.id);
    else view.removeAttribute('href');
    fields.querySelector('[value="draft"]').textContent = published ? '移回草稿' : '保存草稿';
  }
  function initForm(article) {
    saved = article;
    for (const name of ['title', 'publishedAt', 'excerpt', 'body']) form.elements[name].value = article?.[name] || '';
    form.elements.tags.value = (article?.tags || []).join('，');
    setCover(article?.cover || null);
    updateActions();
    fields.disabled = false;
    form.hidden = false;
  }
  function showList(articles) {
    const list = document.querySelector('#article-edit-list');
    for (const article of [...articles].sort((a, b) => b.updatedAt - a.updatedAt)) {
      const row = document.createElement('li');
      const link = document.createElement('a');
      link.href = 'blog-articles-settings.html?id=' + escapeId(article.id);
      const title = document.createElement('span');
      const state = document.createElement('span');
      title.textContent = article.title;
      state.textContent = article.status === 'published' ? '已展示' : '草稿';
      link.append(title, state);
      row.append(link);
      list.append(row);
    }
    list.hidden = false;
    document.querySelector('#article-new').hidden = false;
    report(articles.length ? '' : '暂无文章。');
  }

  preview.addEventListener('error', () => { preview.hidden = true; });
  input.addEventListener('change', async () => {
    const file = input.files[0];
    if (!file) return;
    const request = ++coverRequest;
    checking = true;
    let url = '';
    try {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || !file.size || file.size > 5 * 1024 * 1024) {
        throw new Error('请选择不超过 5 MB 的 JPG、PNG 或 WebP 图片。');
      }
      url = URL.createObjectURL(file);
      const image = new Image();
      image.src = url;
      await image.decode().catch(() => { throw new Error('无法读取这张图片，请重新选择。'); });
      if (request !== coverRequest) return;
      setCover({ name: file.name, blob: file }, url);
      url = '';
      dirty = true;
      report('');
    } catch (error) {
      if (request === coverRequest) report(error.message, true);
    } finally {
      if (url) URL.revokeObjectURL(url);
      if (request === coverRequest) { checking = false; input.value = ''; }
    }
  });
  remove.addEventListener('click', () => {
    coverRequest++;
    checking = false;
    input.value = '';
    setCover(null);
    dirty = true;
  });
  form.addEventListener('input', event => { if (event.target !== input) dirty = true; });
  window.addEventListener('beforeunload', event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (fields.disabled) return;
    if (checking) { report('请等待封面读取完成。'); return; }
    const targetStatus = event.submitter?.value || 'draft';
    const { title, publishedAt, tags, excerpt, body } = Object.fromEntries(new FormData(form));
    if (targetStatus === 'published' && (!body.trim() || !publishedAt)) {
      report('展示文章前请填写正文和发表日期。', true);
      form.elements[!body.trim() ? 'body' : 'publishedAt'].focus();
      return;
    }
    fields.disabled = true;
    report('正在保存…');
    try {
      saved = await SiteStorage.saveBlogArticle({
        id: saved?.id, status: targetStatus, title, publishedAt, excerpt, body, cover,
        tags: [...new Set(tags.split(/[,，]/).map(tag => tag.trim()).filter(Boolean))]
      }, saved?.updatedAt);
      dirty = false;
      history.replaceState(null, '', 'blog-articles-settings.html?id=' + escapeId(saved.id));
      document.querySelector('#article-settings-title').textContent = '文章编辑';
      initForm(saved);
      report(targetStatus === 'published' ? '文章已保存，并在本地博客展示。' : '草稿已保存。');
    } catch (error) {
      report(error.message, true);
    } finally {
      fields.disabled = false;
    }
  });

  try {
    await SiteStorage.assertWritable();
    const articles = await SiteStorage.blogArticles();
    if (!editing) { showList(articles); return; }
    document.querySelector('#article-list-back').hidden = false;
    const article = articles.find(item => item.id === id);
    if (id !== null && !article) { report('这篇文章不存在。', true); return; }
    if (!article) document.querySelector('#article-settings-title').textContent = '新建文章';
    initForm(article);
    report('');
  } catch (error) {
    report(error.message, true);
  }
})();
