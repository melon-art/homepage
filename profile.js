(() => {
  'use strict';

  // Retain the key so existing saved name/degree values carry forward.
  const STORAGE_KEY = 'academic-homepage.profile.v1';
  const limits = {
    name: 80, degree: 120, englishName: 80, school: 120, department: 120, major: 120,
    researchOne: 160, researchTwo: 160, researchQuestion: 300, introduction: 3000,
    phone: 80, email: 254, wechat: 300, instagram: 500, xiaohongshu: 500, bilibili: 500
  };
  const assetLimits = { photo: 1024 * 1024, cv: 2 * 1024 * 1024 };
  const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const form = document.querySelector('#profile-form');
  const isLocalFile = location.protocol === 'file:';
  const status = document.querySelector('.form-status');
  const defaults = new Map([...document.querySelectorAll('[data-profile-field]')].map(element => [element, element.textContent]));

  function normalizeAsset(value, key) {
    if (value == null) return null;
    const pattern = key === 'photo' ? /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/ : /^data:application\/pdf;base64,[A-Za-z0-9+/]+={0,2}$/;
    if (typeof value !== 'object' || typeof value.name !== 'string' || typeof value.data !== 'string' ||
      value.data.length > Math.ceil(assetLimits[key] / 3) * 4 + 128 || !pattern.test(value.data)) throw new Error('Invalid attachment');
    return { name: value.name.replace(/[\x00-\x1f/\\]/g, '').slice(0, 200) || (key === 'photo' ? 'photo' : 'resume.pdf'), data: value.data };
  }

  function normalize(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid profile');
    const result = {};
    for (const [key, limit] of Object.entries(limits)) {
      if (value[key] !== undefined && typeof value[key] !== 'string') throw new Error('Invalid field');
      result[key] = (value[key] || '').trim().slice(0, limit);
    }
    for (const key of Object.keys(assetLimits)) result[key] = normalizeAsset(value[key], key);
    return result;
  }

  function read() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? normalize(JSON.parse(stored)) : normalize({});
  }

  function write(value) {
    const profile = normalize(value);
    // Atomic write: a quota failure preserves the previously saved text and files.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    return profile;
  }

  // File previews transfer text only, never large image/PDF data in the URL.
  let fileProfile;
  if (isLocalFile && location.hash.startsWith('#profile-edit=')) {
    try {
      let saved = {};
      try { saved = read(); } catch (_) { /* Incoming text can still be used. */ }
      const incoming = JSON.parse(decodeURIComponent(location.hash.slice(14)));
      fileProfile = normalize({ ...saved, ...incoming });
      if (!form) write(fileProfile);
    } catch (_) {
      if (status) status.textContent = '无法读取资料，请重新填写后保存。';
    }
    try { history.replaceState(null, '', location.pathname + location.search); } catch (_) { /* Keep file previews usable. */ }
  }

  function fileLink(href, profile) {
    const text = Object.fromEntries(Object.keys(limits).map(key => [key, profile[key]]));
    return href.split('#')[0] + '#profile-edit=' + encodeURIComponent(JSON.stringify(text));
  }

  if (form) {
    const homeLink = document.querySelector('[data-home-link]');
    const saveButton = form.querySelector('[type="submit"]');
    let profile = normalize({});
    try { profile = fileProfile || read(); }
    catch (_) { status.textContent = '已保存资料暂时无法读取，可重新填写后保存。'; }
    for (const key of Object.keys(limits)) form.elements.namedItem(key).value = profile[key];
    if (isLocalFile) homeLink.href = fileLink(homeLink.getAttribute('href'), profile);
    const draftAssets = { photo: profile.photo, cv: profile.cv };
    const pending = new Set();
    const revisions = { photo: 0, cv: 0 };

    function updateBusy() {
      saveButton.disabled = pending.size > 0;
      saveButton.textContent = pending.size ? '正在读取文件…' : '保存';
      form.setAttribute('aria-busy', String(pending.size > 0));
    }

    function showAsset(key) {
      const asset = draftAssets[key];
      form.querySelector('[data-asset-name="' + key + '"]').textContent = asset ? asset.name : (key === 'photo' ? '尚未选择照片' : '尚未选择简历');
      form.querySelector('[data-remove-asset="' + key + '"]').hidden = !asset;
      if (key === 'photo') {
        const preview = form.querySelector('[data-photo-preview]');
        preview.hidden = !asset;
        if (asset) preview.src = asset.data;
        else preview.removeAttribute('src');
      }
    }

    function fileData(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('文件无法读取，请重新选择。'));
        reader.onabort = () => reject(new Error('文件读取已中断，请重新选择。'));
        reader.readAsDataURL(file);
      });
    }

    async function prepareAsset(file, key) {
      if (!file.size || file.size > assetLimits[key]) throw new Error(key === 'photo' ? '请选择不超过 1 MB 的照片。' : '请选择不超过 2 MB 的 PDF 简历。');
      if (key === 'photo' && !imageTypes.includes(file.type)) throw new Error('照片仅支持 JPG、PNG 或 WebP，请重新选择。');
      if (key === 'cv' && await file.slice(0, 5).text() !== '%PDF-') throw new Error('文件不是有效的 PDF，请重新选择。');
      // Normalize PDF MIME after checking its signature (some systems leave it empty).
      const data = await fileData(key === 'cv' ? new Blob([file], { type: 'application/pdf' }) : file);
      if (key === 'photo') {
        const image = new Image();
        image.src = data;
        try { await image.decode(); } catch (_) { throw new Error('照片无法显示，请选择其他图片。'); }
      }
      return normalizeAsset({ name: file.name, data }, key);
    }

    for (const key of Object.keys(assetLimits)) {
      const input = form.elements.namedItem(key + 'File');
      const error = document.querySelector('#' + key + '-error');
      const remove = form.querySelector('[data-remove-asset="' + key + '"]');
      showAsset(key);
      if (isLocalFile) {
        input.disabled = true;
        document.querySelector('#' + key + '-help').textContent += ' 选择文件请使用本地 HTTP 预览地址（见页面上方）。';
      }
      input.addEventListener('change', async () => {
        const file = input.files[0];
        if (!file) return;
        const revision = ++revisions[key];
        input.setCustomValidity('');
        input.removeAttribute('aria-invalid');
        error.textContent = '';
        pending.add(key);
        updateBusy();
        try {
          const asset = await prepareAsset(file, key);
          if (revision === revisions[key]) { draftAssets[key] = asset; showAsset(key); }
        } catch (failure) {
          if (revision === revisions[key]) {
            input.value = '';
            input.setCustomValidity(failure.message);
            input.setAttribute('aria-invalid', 'true');
            error.textContent = failure.message;
            remove.hidden = false;
          }
        } finally {
          if (revision === revisions[key]) { pending.delete(key); updateBusy(); }
        }
      });
      remove.addEventListener('click', () => {
        revisions[key]++;
        pending.delete(key);
        input.value = '';
        input.setCustomValidity('');
        input.removeAttribute('aria-invalid');
        error.textContent = '';
        draftAssets[key] = null;
        showAsset(key);
        updateBusy();
        input.focus();
      });
    }

    if (isLocalFile) {
      const note = document.createElement('p');
      note.className = 'field-help';
      note.append('照片和简历编辑请打开 ');
      const link = document.createElement('a');
      link.href = 'http://127.0.0.1:8765/settings.html';
      link.textContent = '本地预览设置页';
      note.append(link, '。文字仍可在当前文件预览中保存。');
      document.querySelector('#storage-note').after(note);
    }

    form.addEventListener('submit', event => {
      event.preventDefault();
      if (pending.size || !form.reportValidity()) return;
      const values = Object.fromEntries(Object.keys(limits).map(key => [key, form.elements.namedItem(key).value]));
      try {
        const saved = write({ ...values, ...draftAssets });
        status.textContent = '已保存，正在返回主页。';
        location.assign(isLocalFile ? fileLink(homeLink.getAttribute('href'), saved) : homeLink.href);
      } catch (_) {
        status.textContent = '无法保存，浏览器存储可能已满或被禁用。请尝试更小的文件或允许存储后重试；输入内容已保留。';
      }
    });
  } else {
    const portrait = document.querySelector('.portrait');
    const placeholder = portrait.firstElementChild.cloneNode(true);
    const cvButton = document.querySelector('.cv-button');
    const contactDefaults = typeof CONTACTS === 'undefined' ? {} : { ...CONTACTS };
    let currentCv = null;

    function render() {
      let profile;
      try { profile = fileProfile || read(); } catch (_) { profile = normalize({}); }
      for (const [element, fallback] of defaults) element.textContent = profile[element.dataset.profileField] || fallback;
      const wordmark = document.querySelector('.wordmark');
      wordmark.setAttribute('aria-label', profile.englishName || 'Your Name，英文名待提供');
      portrait.classList.toggle('has-photo', Boolean(profile.photo));
      if (profile.photo) {
        const image = document.createElement('img');
        image.src = profile.photo.data;
        image.alt = (profile.name || '个人') + '的照片';
        portrait.replaceChildren(image);
        portrait.removeAttribute('role');
        portrait.removeAttribute('aria-label');
      } else {
        portrait.replaceChildren(placeholder.cloneNode(true));
        portrait.setAttribute('role', 'img');
        portrait.setAttribute('aria-label', '个人照片待提供');
      }
      document.querySelectorAll('[data-contact]').forEach(button => {
        const key = button.dataset.contact;
        if (typeof CONTACTS !== 'undefined') CONTACTS[key] = profile[key] || contactDefaults[key] || '';
        button.setAttribute('aria-label', '复制' + button.dataset.label + ((profile[key] || contactDefaults[key]) ? '' : '（资料待提供）'));
      });
      currentCv = profile.cv;
      cvButton.disabled = !currentCv;
      cvButton.querySelector('[data-cv-label]').textContent = currentCv ? '下载简历' : '简历待上传';
      cvButton.setAttribute('aria-label', currentCv ? '下载简历 PDF' : '简历待上传，暂不可下载');
      if (isLocalFile) {
        const link = document.querySelector('[data-settings-link]');
        if (link) link.href = fileLink(link.getAttribute('href'), profile);
      }
    }

    cvButton.addEventListener('click', () => {
      if (!currentCv) return;
      const bytes = Uint8Array.from(atob(currentCv.data.split(',')[1]), character => character.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = currentCv.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    });
    render();
    window.addEventListener('pageshow', () => { fileProfile = undefined; render(); });
    window.addEventListener('storage', event => { if (event.key === STORAGE_KEY || event.key === null) render(); });
  }
})();
