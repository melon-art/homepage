// Simulate static hosting and local/LAN service without touching real content.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('public/assets/js/file-store.js', 'utf8');
async function check(hostname, path, expected) {
  const requests = [];
  const site = { schemaVersion: 1, initialized: true, canEdit: true,
    profile: {}, news: [{ image: { name: 'image.png', path } }], updates: [], explore: [] };
  const context = { URL, Blob, console,
    location: { hostname, protocol: 'https:', port: '' },
    document: { baseURI: `https://${hostname}/`, createElement: () => ({}),
      head: { append() {} }, body: { dataset: {} }, querySelector: () => null },
    fetch: async url => {
      requests.push(String(url));
      return { ok: true, status: 200, json: async () => structuredClone(site),
        blob: async () => new Blob(['image']) };
    },
  };
  context.window = context;
  vm.runInNewContext(source, context);
  await context.SiteStorage.ready;
  if (hostname === 'melatius.love') {
    assert.equal(context.SiteStorage.canEdit, false);
    assert.equal(requests.some(url => url.endsWith('/api/state')), false);
  } else {
    assert.equal(requests.some(url => url.endsWith('/api/state')), true);
  }
  if (expected) {
    const entries = await context.SiteStorage.all('news');
    assert(entries[0].image.blob instanceof Blob);
  } else {
    await assert.rejects(context.SiteStorage.all('news'), /附件路径无效/);
  }
}
(async () => {
  const hash = 'a'.repeat(64);
  await check('melatius.love', `assets/published/${hash}.png`, true);
  await check('melatius.love', 'assets/published/../private.png', false);
  await check('127.0.0.1', `assets/uploads/${hash}.png`, true);
  await check('192.168.1.10', `assets/uploads/${hash}.png`, true);
  console.log('PASS: static published attachments, traversal rejection, local and LAN API retained');
})().catch(error => { console.error(error); process.exitCode = 1; });
