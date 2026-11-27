/* BLOG-001: article directory and navigation shared by the blog pages. */
(() => {
  'use strict';
  const menu = document.querySelector('.home-menu');
  const trigger = menu.querySelector('.home-trigger');
  const submenu = menu.querySelector('.home-submenu');
  const note = document.querySelector('.navigation-note');
  function showMenu(open) {
    menu.classList.toggle('is-open', open);
    trigger.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-expanded', String(open));
    submenu.hidden = !open;
  }
  menu.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') showMenu(true); });
  menu.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') showMenu(false); });
  trigger.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); showMenu(true); submenu.querySelector('a').focus(); }
  });
  // Home remains a direct link; touch can open its secondary destinations separately.
  const toggle = document.createElement('button');
  toggle.className = 'home-toggle';
  toggle.type = 'button';
  toggle.setAttribute('aria-label', '展开 Home 菜单');
  toggle.setAttribute('aria-controls', 'home-submenu');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>';
  trigger.after(toggle);
  toggle.addEventListener('click', () => showMenu(submenu.hidden));
  menu.addEventListener('focusout', e => { if (!menu.contains(e.relatedTarget)) showMenu(false); });
  document.addEventListener('pointerdown', e => { if (!menu.contains(e.target)) showMenu(false); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (!submenu.hidden) { showMenu(false); trigger.focus(); }
      note.hidden = true;
    }
  });
  document.querySelectorAll('button.nav-item').forEach(button => {
    button.addEventListener('click', () => { note.textContent = button.textContent + '栏目待更新'; note.hidden = false; });
  });
  const list = document.getElementById('article-list');
  const empty = document.getElementById('blog-empty');
  const directory = document.getElementById('tag-directory');
  const filterStatus = document.getElementById('filter-status');
  let allArticles = [];
  const uniqueTags = article => [...new Set((article.tags || []).filter(tag => typeof tag === 'string' && tag.trim()))];
  function showArticles(tag, control) {
    if (!list) {
      location.href = BlogArticles.url('blog.html', tag === null ? {} : { tag });
      return;
    }
    const articles = tag === null ? allArticles : allArticles.filter(article => tag === '' ? !uniqueTags(article).length : uniqueTags(article).includes(tag));
    list.replaceChildren(...articles.map(renderArticle));
    empty.hidden = articles.length > 0;
    filterStatus.hidden = !allArticles.length;
    filterStatus.textContent = (tag === null ? '全部文章' : tag || '未分类') + ' · ' + articles.length + ' 篇';
    directory.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button === control)));
  }
  function buildDirectory() {
    const counts = new Map();
    for (const article of allArticles) {
      const tags = uniqueTags(article);
      for (const tag of tags.length ? tags : ['']) counts.set(tag, (counts.get(tag) || 0) + 1);
    }
    document.getElementById('tag-directory-empty').hidden = allArticles.length > 0;
    directory.replaceChildren();
    if (!allArticles.length) return;
    for (const [tag, count] of [[null, allArticles.length], ...counts]) {
      const item = document.createElement('li');
      const button = element('button'); button.type = 'button';
      button.setAttribute('aria-pressed', String(tag === null));
      if (list) button.setAttribute('aria-controls', 'article-list');
      button.append(element('span', '', tag === null ? '全部文章' : tag || '未分类'), element('span', 'tag-count', String(count)));
      button.addEventListener('click', () => showArticles(tag, button));
      item.append(button); directory.append(item);
    }
  }
  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }
  function renderArticle(article, index) {
    const card = element('article', 'article-card');
    const link = element('a', 'article-link');
    link.href = BlogArticles.url('blog-article.html', { id: article.id });
    link.setAttribute('aria-label', '阅读文章：' + article.title);
    const cover = element('div', 'article-cover');
    const heading = element('div', 'article-heading');
    const status = element('p', 'cover-status', '未设置封面');
    if (article.cover) {
      const img = document.createElement('img');
      img.alt = '';
      img.decoding = 'async';
      img.loading = index === 0 ? 'eager' : 'lazy';
      img.addEventListener('load', () => { cover.classList.add('has-cover'); status.hidden = true; });
      img.addEventListener('error', () => { img.hidden = true; cover.classList.remove('has-cover'); status.hidden = false; status.textContent = '封面暂时无法显示'; });
      img.src = article.cover;
      cover.append(img);
    }
    const title = element('h2', '', article.title);
    const meta = element('div', 'article-meta');
    if (article.publishedAt) {
      const date = element('span', 'meta-date');
      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      icon.setAttribute('viewBox', '0 0 24 24'); icon.setAttribute('fill', 'none'); icon.setAttribute('stroke', 'currentColor'); icon.setAttribute('stroke-width', '1.5'); icon.setAttribute('aria-hidden', 'true');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M7 3v4m10-4v4M4 10h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z');
      icon.append(path);
      const time = element('time', '', article.publishedAt.replaceAll('-', '.'));
      time.dateTime = article.publishedAt;
      date.append(icon, time); meta.append(date);
    }
    if (BlogArticles.demo) meta.append(element('span', '', '演示文章'));
    if (article.author) meta.append(element('span', '', article.author));
    heading.append(status, title, meta); cover.append(heading); link.append(cover);
    if (article.excerpt || article.tags?.length) {
      const body = element('div', 'article-body');
      if (article.excerpt) body.append(element('p', '', article.excerpt));
      if (article.tags?.length) {
        const tags = element('ul', 'article-tags'); tags.setAttribute('aria-label', '文章标签');
        article.tags.forEach(tag => tags.append(element('li', '', tag)));
        body.append(tags);
      }
      link.append(body);
    }
    card.append(link);
    return card;
  }
  async function start() {
    const previewNotice = document.getElementById('preview-notice');
    if (previewNotice) previewNotice.hidden = !BlogArticles.demo;
    try {
      const articles = await BlogArticles.load();
      allArticles = articles;
      buildDirectory();
      if (list) {
        const requested = new URLSearchParams(location.search).get('tag');
        const buttons = [...directory.querySelectorAll('button')];
        const selected = requested === null ? buttons[0] : buttons.find(button => button.firstElementChild.textContent === (requested || '未分类'));
        showArticles(selected ? requested : null, selected || buttons[0]);
      }
    } catch (_) {
      if (!empty) return;
      empty.querySelector('h2').textContent = '文章暂时无法读取';
      empty.querySelector('p').textContent = '请刷新页面重试。';
    }
  }
  start();
})();
