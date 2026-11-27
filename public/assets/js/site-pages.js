/* Navigation and Updates resolve destinations from this one directory. */
(() => {
  'use strict';
  // Root and index.html can retain different cached documents on static hosts.
  const publishedHost = ['melatius.love', 'www.melatius.love'].includes(location.hostname) || location.hostname.endsWith('.github.io');
  const homeVersion = '20261127-home-2';
  const sections = [
    { id: 'home', label: 'Home', primary: 'about' },
    { id: 'research', label: '研究方向', primary: 'research' },
    { id: 'coursework', label: '课程作业', primary: 'coursework' },
    // Keep existing IDs so locally saved Updates drafts retain their sections.
    { id: 'hobbies', label: '个人博客', primary: 'hobbies' },
    { id: 'awards', label: '获奖', primary: 'awards' },
    { id: 'activities', label: '探索广场', primary: 'activities' }
  ];
  // Add a real page here when its file exists; do not enable placeholder routes.
  const pages = [
    { id: 'about', sectionId: 'home', label: 'About · 主页', href: 'index.html', anchors: [
      { id: 'about-title', label: 'About' }, { id: 'news-title', label: 'News' }, { id: 'updates-title', label: 'Updates' }
    ] },
    { id: 'news', sectionId: 'home', label: 'News · 全部新闻', href: 'news.html', anchors: [] },
    { id: 'hobbies', sectionId: 'hobbies', label: '文章', href: 'blog.html', anchors: [] },
    ...sections.slice(1).filter(section => section.id !== 'hobbies').map(section => ({ id: section.id, sectionId: section.id, label: section.label, href: section.id === 'activities' ? 'explore.html' : '', anchors: [] })),
    { id: 'food-map', sectionId: 'activities', label: '美食地图', href: 'food-map.html', anchors: [] }
  ];
  function resolve(pageId, anchorId = '') {
    const page = pages.find(item => item.id === pageId);
    if (!page?.href || (anchorId && !page.anchors.some(anchor => anchor.id === anchorId))) return '';
    try {
      const root = new URL('.', document.baseURI), url = new URL(page.href, root);
      if (publishedHost && pageId === 'about') url.searchParams.set('v', homeVersion);
      if (url.protocol !== root.protocol || url.host !== root.host || !url.pathname.startsWith(root.pathname)) return '';
      if (anchorId) url.hash = anchorId;
      return url.href;
    } catch (_) { return ''; }
  }
  function resolveUpdate(pageId, anchorId = '') {
    return pages.find(item => item.id === pageId)?.updates === false ? '' : resolve(pageId, anchorId);
  }
  window.SitePages = { sections, pages, resolve, resolveUpdate, section: id => sections.find(item => item.id === id), page: id => pages.find(item => item.id === id) };
  document.querySelectorAll('a[href="index.html"], a[href^="index.html#"]').forEach(link => {
    const anchor = new URL(link.getAttribute('href'), document.baseURI).hash.slice(1);
    const href = resolve('about', anchor);
    if (href) link.href = href;
  });
  document.querySelectorAll('[data-page-id]').forEach(link => { const href = resolve(link.dataset.pageId); if (href) link.href = href; });
  document.querySelectorAll('[data-section-id]').forEach(button => {
    const section = sections.find(item => item.id === button.dataset.sectionId), href = resolve(section?.primary);
    if (!href) return;
    const link = document.createElement('a'); link.className = button.className; link.href = href;
    link.dataset.sectionId = section.id;
    const label = document.createElement('span'); label.className = 'nav-label'; label.textContent = section.label;
    link.append(label); button.replaceWith(link);
  });
})();
