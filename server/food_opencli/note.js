import { cli, Strategy } from '@jackwener/opencli/registry';
import { CliError, AuthRequiredError, EmptyResultError } from '@jackwener/opencli/errors';

cli({
  site: 'xiaohongshu', name: 'food-metadata', access: 'read',
  description: 'Read note text, engagement and separately sourced timestamps',
  domain: 'www.xiaohongshu.com', strategy: Strategy.COOKIE, navigateBefore: false,
  args: [{ name: 'url', positional: true, required: true }],
  columns: ['title', 'author', 'published_time', 'updated_time', 'date_text', 'likes', 'collects', 'comments'],
  func: async (page, args) => {
    const url = new URL(String(args.url));
    const match = url.pathname.match(/^\/(?:explore|search_result)\/([a-f0-9]+)$/i);
    if (url.hostname !== 'www.xiaohongshu.com' || !match || url.protocol !== 'https:') {
      throw new CliError('BAD_INPUT', 'Expected a Xiaohongshu note URL');
    }
    await page.goto(url.href);
    await page.wait({ time: 3 });
    const data = await page.evaluate(`(() => {
      const root = document.querySelector('#noteContainer');
      const body = document.body?.innerText || '';
      const text = selector => root?.querySelector(selector)?.textContent?.trim() ?? null;
      const id = ${JSON.stringify(match[1])};
      const initial = window.__INITIAL_STATE__?.note;
      const entry = initial?.noteDetailMap?.[id];
      const note = entry?.note;
      const valid = note && String(note.noteId || note.id || '') === id;
      const counts = valid ? note.interactInfo : null;
      return {
        blocked: /验证码|安全验证|安全限制|访问链接异常|访问过于频繁/.test(body) || /website-login\\/error/.test(location.href),
        login: /登录后查看|请登录/.test(body),
        title: text('#detail-title'), author: text('.username, .author-wrapper .name'),
        content: text('#detail-desc'),
        published_time: valid ? note.time ?? null : null,
        updated_time: valid ? note.lastUpdateTime ?? null : null,
        time_source: valid ? '__INITIAL_STATE__.note.noteDetailMap[noteId].note' : null,
        date_text: text('.date'),
        likes: counts?.likedCount ?? text('.interact-container .like-wrapper .count'),
        collects: counts?.collectedCount ?? text('.interact-container .collect-wrapper .count'),
        comments: counts?.commentCount ?? text('.interact-container .chat-wrapper .count'),
        counts_source: counts ? 'note.interactInfo' : 'note interaction bar'
      };
    })()`);
    if (data.blocked) throw new CliError('CAPTCHA_REQUIRED', 'Platform verification or rate limit required; stop this attempt');
    if (data.login) throw new AuthRequiredError('www.xiaohongshu.com', 'Note requires login');
    if (!data.author) throw new EmptyResultError('xiaohongshu/food-metadata', 'Note content unavailable');
    const { blocked, login, ...safe } = data;
    return [{ ...safe, url: url.href }];
  },
});
