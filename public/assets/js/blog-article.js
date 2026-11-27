/* Article reader and browser-local comments. */
(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  const target = document.getElementById('article-detail');
  const node = (tag, text, className) => {
    const element = document.createElement(tag);
    if (text) element.textContent = text;
    if (className) element.className = className;
    return element;
  };
  function unavailable(message) {
    target.replaceChildren(node('h1', '文章暂不可用'), node('p', message));
    target.classList.add('detail-unavailable');
  }
  function showComments(articleId) {
    const section = document.getElementById('article-comments');
    const list = document.getElementById('comment-list');
    const empty = document.getElementById('comment-empty');
    const form = document.getElementById('comment-form');
    const feedback = document.getElementById('comment-feedback');
    const message = form.elements.namedItem('message');
    const prefix = BlogArticles.demo ? 'academic-homepage.blog-preview.comments.' : 'academic-homepage.blog.comments.';
    const key = prefix + articleId;
    const dateFormat = new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'short' });

    function isMessage(comment) {
      return comment && typeof comment.name === 'string' &&
        typeof comment.body === 'string' && typeof comment.date === 'string' &&
        Number.isFinite(Date.parse(comment.date));
    }
    function readComments() {
      const saved = JSON.parse(localStorage.getItem(key) ?? '[]');
      if (!Array.isArray(saved)) throw new Error('Invalid comments');
      return saved.filter(isMessage);
    }
    function messageContent(item, comment) {
      const meta = node('div', '', 'comment-meta');
      const time = node('time', dateFormat.format(new Date(comment.date)));
      time.dateTime = comment.date;
      meta.append(node('strong', comment.name), time);
      item.append(meta, node('p', comment.body));
    }
    function bindComposer(composer, input, status, save) {
      input.addEventListener('input', () => input.setCustomValidity(''));
      composer.addEventListener('submit', event => {
        event.preventDefault();
        const body = input.value.trim();
        if (!body) {
          input.setCustomValidity('请填写内容。');
          input.reportValidity();
          return;
        }
        try {
          save({ name: '访客', body, date: new Date().toISOString() });
        } catch (_) {
          status.textContent = '保存失败，内容仍保留在输入框中。';
        }
      });
    }
    function replyComposer(comment, index, draft) {
      const details = node('details', '', 'comment-reply');
      const toggle = node('summary', '回复');
      const composer = node('form', '', 'reply-form');
      const input = node('textarea');
      input.setAttribute('aria-label', '回复第 ' + (index + 1) + ' 条评论');
      input.placeholder = '写回复…';
      input.rows = 3;
      input.maxLength = 1000;
      input.required = true;
      const submit = node('button', '提交回复');
      submit.type = 'submit';
      const status = node('span', '', 'reply-feedback');
      status.setAttribute('role', 'status');
      composer.append(input, submit, status);
      details.append(toggle, composer);
      details.open = draft?.open ?? false;
      input.value = draft?.value ?? '';
      bindComposer(composer, input, status, reply => {
        const comments = readComments();
        const parent = comments[index];
        if (!parent || parent.date !== comment.date || parent.body !== comment.body ||
          parent.name !== comment.name) throw new Error('Comment changed');
        parent.replies = [...(Array.isArray(parent.replies) ? parent.replies : []), reply];
        localStorage.setItem(key, JSON.stringify(comments));
        input.value = '';
        details.open = false;
        renderComments(comments);
        list.children[index].querySelector('summary').focus();
        feedback.textContent = '回复已保存。';
      });
      return details;
    }
    function renderComments(comments) {
      // Keep unsent replies when another tab or the top-level form refreshes the list.
      const drafts = [...list.querySelectorAll('.comment-reply')].map(details => ({
        open: details.open,
        value: details.querySelector('textarea').value
      }));
      list.replaceChildren(...comments.map((comment, index) => {
        const item = node('li', '', 'comment-item');
        messageContent(item, comment);
        const replies = Array.isArray(comment.replies) ? comment.replies.filter(isMessage) : [];
        if (replies.length) {
          const thread = node('ol', '', 'comment-replies');
          thread.setAttribute('aria-label', '第 ' + (index + 1) + ' 条评论的回复');
          for (const reply of replies) {
            const replyItem = node('li', '', 'comment-reply-item');
            messageContent(replyItem, reply);
            thread.append(replyItem);
          }
          item.append(thread);
        }
        item.append(replyComposer(comment, index, drafts[index]));
        return item;
      }));
      list.hidden = !comments.length;
      empty.hidden = Boolean(comments.length);
    }
    function refreshComments() {
      try {
        renderComments(readComments());
        empty.textContent = '暂无评论';
      } catch (_) {
        empty.hidden = false;
        empty.textContent = '暂时无法读取评论。';
      }
    }
    bindComposer(form, message, feedback, comment => {
      const comments = [...readComments(), comment];
      localStorage.setItem(key, JSON.stringify(comments));
      renderComments(comments);
      message.value = '';
      feedback.textContent = '评论已保存。';
      list.lastElementChild.querySelector('summary').focus({ preventScroll: true });
    });
    window.addEventListener('storage', event => {
      if (event.key === key || event.key === null) refreshComments();
    });
    refreshComments();
    section.hidden = false;
  }
  async function load() {
    document.getElementById('detail-demo-notice').hidden = !BlogArticles.demo;
    try {
      const articles = await BlogArticles.load();
      const article = articles.find(item => item.id === params.get('id'));
      if (!article) { unavailable('没有找到这篇文章，链接可能已失效。'); return; }
      document.title = article.title + ' · 个人博客';
      const header = node('header', '', 'detail-heading');
      header.append(node('h1', article.title));
      const meta = node('p', '', 'detail-meta');
      if (article.publishedAt) {
        const date = node('time', article.publishedAt.replaceAll('-', '.'));
        date.dateTime = article.publishedAt;
        meta.append(date);
      }
      if (BlogArticles.demo) meta.append(node('span', '演示文章'));
      header.append(meta);
      target.replaceChildren(header);
      if (article.cover) {
        const figure = node('figure', '', 'detail-cover');
        const image = node('img'); image.src = article.cover; image.alt = ''; image.decoding = 'async';
        const fallback = node('figcaption', '封面暂时无法显示'); fallback.hidden = true;
        image.addEventListener('error', () => { image.hidden = true; fallback.hidden = false; });
        figure.append(image, fallback); target.append(figure);
      }
      const body = node('div', '', 'detail-body');
      const blocks = BlogArticles.demo ? article.content || [] :
        article.body.split(/\r?\n\s*\r?\n/).map(text => ({ type: 'paragraph', text }));
      if (!blocks.length) body.append(node('p', '正文待添加。'));
      for (const block of blocks) {
        const tag = block.type === 'heading' ? 'h2' : 'p';
        body.append(node(tag, block.text));
      }
      target.append(body);
      if (article.tags?.length) {
        const tags = node('ul', '', 'article-tags'); tags.setAttribute('aria-label', '文章标签');
        article.tags.forEach(tag => tags.append(node('li', tag)));
        target.append(tags);
      }
      showComments(article.id);
    } catch (_) { unavailable('文章加载失败，请刷新重试，或从顶部「个人博客」打开目录。'); }
  }
  load();
})();
