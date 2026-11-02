(() => {
  'use strict';

  const STORAGE_KEY = 'academic-homepage.profile.v1';
  const limits = { name: 80, degree: 120 };
  const form = document.querySelector('#profile-form');
  const isLocalFile = location.protocol === 'file:';
  const status = document.querySelector('.form-status');
  const defaults = new Map([...document.querySelectorAll('[data-profile-field]')].map(element => [element, element.textContent]));

  function normalize(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid profile');
    const result = {};
    for (const [key, limit] of Object.entries(limits)) {
      if (value[key] !== undefined && typeof value[key] !== 'string') throw new Error('Invalid field');
      result[key] = (value[key] || '').trim().slice(0, limit);
    }
    return result;
  }

  function read() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? normalize(JSON.parse(stored)) : normalize({});
  }

  function write(value) {
    const profile = normalize(value);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    return profile;
  }

  // File URLs can have separate storage for each page. Transfer these two public
  // profile fields in a temporary fragment, then remove it from the address bar.
  let fileProfile;
  if (isLocalFile && location.hash.startsWith('#profile-edit=')) {
    try {
      fileProfile = normalize(JSON.parse(decodeURIComponent(location.hash.slice(14))));
      if (!form) write(fileProfile);
    } catch (_) {
      if (status) status.textContent = '无法读取资料，请重新填写后保存。';
    }
    try { history.replaceState(null, '', location.pathname + location.search); } catch (_) { /* Keep the page usable when URL cleanup is unavailable. */ }
  }

  function fileLink(href, profile) {
    return href.split('#')[0] + '#profile-edit=' + encodeURIComponent(JSON.stringify(profile));
  }

  function render() {
    let profile;
    try { profile = fileProfile || read(); } catch (_) { profile = normalize({}); }
    for (const [element, fallback] of defaults) element.textContent = profile[element.dataset.profileField] || fallback;
    if (isLocalFile) {
      const link = document.querySelector('[data-settings-link]');
      if (link) link.href = fileLink(link.getAttribute('href'), profile);
    }
  }

  if (form) {
    const nameInput = form.elements.namedItem('name');
    const degreeInput = form.elements.namedItem('degree');
    const homeLink = document.querySelector('[data-home-link]');
    try {
      const profile = fileProfile || read();
      nameInput.value = profile.name;
      degreeInput.value = profile.degree;
      if (isLocalFile) homeLink.href = fileLink(homeLink.getAttribute('href'), profile);
    } catch (_) {
      status.textContent = '已保存资料暂时无法读取，可重新填写后保存。';
    }
    form.addEventListener('submit', event => {
      event.preventDefault();
      try {
        const profile = write({ name: nameInput.value, degree: degreeInput.value });
        status.textContent = '已保存，正在返回主页。';
        location.assign(isLocalFile ? fileLink(homeLink.getAttribute('href'), profile) : homeLink.href);
      } catch (_) {
        status.textContent = '无法保存。请允许浏览器存储后重试，输入内容已保留。';
      }
    });
  } else {
    render();
    window.addEventListener('pageshow', () => { fileProfile = undefined; render(); });
    window.addEventListener('storage', event => { if (event.key === STORAGE_KEY || event.key === null) render(); });
  }
})();
