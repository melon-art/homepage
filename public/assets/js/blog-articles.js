(() => {
  'use strict';
  const demo = new URLSearchParams(location.search).get('demo') === '1' && Boolean(window.blogPreviewArticles);
  let request;
  async function publishedArticles() {
    const response = await fetch('data/site.json', { cache: 'no-store' });
    if (response.status === 404) return [];
    if (!response.ok) throw new Error('无法读取文章。');
    const site = await response.json();
    return (site.blogArticles || [])
      .filter(article => article.status === 'published')
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || b.createdAt - a.createdAt)
      .map(article => ({ ...article, cover: /^assets\/uploads\/[a-f0-9]{64}\.(png|jpg|webp)$/.test(article.cover?.path || '') ? article.cover.path : '' }));
  }
  window.BlogArticles = {
    demo,
    load() {
      return request ??= demo ? Promise.resolve(window.blogPreviewArticles) : publishedArticles();
    },
    url(page, params = {}) {
      const query = new URLSearchParams(demo ? { demo: '1', ...params } : params).toString();
      return page + (query ? '?' + query : '');
    }
  };
})();
