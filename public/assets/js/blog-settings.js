(() => {
  'use strict';
  const form = document.querySelector('#blog-settings-form');
  const fields = form.querySelector('fieldset');
  const submit = form.querySelector('[type="submit"]');
  const status = form.querySelector('[role="status"]');
  const nickname = form.elements.nickname;
  const cropTemplate = document.querySelector('#blog-crop-template');
  const pictures = [...form.querySelectorAll('[data-picture]')].map(row => ({
    key: row.dataset.picture,
    input: row.querySelector('input'),
    preview: row.querySelector('img'),
    placeholder: row.querySelector('.blog-picture-preview span'),
    reset: row.querySelector('[data-reset]'),
    name: row.querySelector('[data-image-name]'),
    cropHost: row.querySelector('[data-crop-controls]'),
    value: null,
    url: '',
    request: 0,
    busy: false
  }));
  let revision, dirty = false, saving = false;

  function notify(text, error = false) {
    status.textContent = text;
    status.classList.toggle('is-error', error);
  }
  function updateSubmit() {
    submit.disabled = !dirty || saving || pictures.some(picture => picture.busy);
  }
  function showCrop(picture) {
    const crop = BlogCrop.normalize(picture.value?.crop);
    for (const input of picture.cropControls.querySelectorAll('input[data-crop]')) {
      input.value = crop[input.dataset.crop];
      input.nextElementSibling.value = input.value + '%';
    }
    BlogCrop.apply(picture.preview, crop);
  }
  function showPicture(picture) {
    const path = picture.value?.path || '';
    const source = picture.url || (/^assets\/uploads\/[a-f0-9]{64}\.(png|jpg|webp)$/.test(path) ? path : '');
    picture.preview.hidden = !source;
    picture.placeholder.hidden = Boolean(source);
    if (source) picture.preview.src = source;
    else picture.preview.removeAttribute('src');
    picture.name.textContent = picture.value?.name || '';
    picture.reset.hidden = !picture.value;
    picture.cropControls.hidden = !source;
    showCrop(picture);
  }
  function setPicture(picture, value, url = '') {
    if (picture.url) URL.revokeObjectURL(picture.url);
    picture.value = value;
    picture.url = url;
    showPicture(picture);
  }
  function loadSaved(saved) {
    revision = saved.revision;
    nickname.value = saved.nickname || '';
    for (const picture of pictures) {
      picture.input.value = '';
      setPicture(picture, saved[picture.key] || null);
    }
    dirty = false;
    updateSubmit();
  }
  nickname.addEventListener('input', () => {
    dirty = true;
    updateSubmit();
  });
  for (const picture of pictures) {
    picture.cropControls = cropTemplate.content.firstElementChild.cloneNode(true);
    picture.cropHost.append(picture.cropControls);
    function setCrop(crop) {
      picture.value.crop = crop;
      dirty = true;
      showCrop(picture);
      notify('裁切已调整，点击保存应用到博客。');
      updateSubmit();
    }
    picture.cropControls.addEventListener('input', event => {
      const key = event.target.dataset.crop;
      if (!key || !picture.value) return;
      setCrop({ ...BlogCrop.normalize(picture.value.crop), [key]: event.target.valueAsNumber });
    });
    picture.cropControls.querySelector('[data-crop-reset]').addEventListener('click', () => {
      if (picture.value) setCrop({ ...BlogCrop.defaults });
    });
    picture.preview.addEventListener('error', () => {
      picture.preview.hidden = true;
      picture.placeholder.hidden = false;
      picture.cropControls.hidden = true;
    });
    picture.input.addEventListener('change', async () => {
      const file = picture.input.files[0];
      if (!file) return;
      const request = ++picture.request;
      let url = '';
      picture.busy = true;
      updateSubmit();
      try {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || !file.size || file.size > 5 * 1024 * 1024) {
          throw new Error('请选择不超过 5 MB 的 JPG、PNG 或 WebP 图片。');
        }
        url = URL.createObjectURL(file);
        const image = new Image();
        image.src = url;
        await image.decode().catch(() => { throw new Error('无法读取这张图片，请重新选择。'); });
        if (picture.request !== request) return;
        setPicture(picture, { name: file.name, blob: file }, url);
        url = '';
        dirty = true;
        notify('图片已选好，点击保存应用到博客。');
      } catch (error) {
        if (picture.request === request) {
          picture.input.value = '';
          notify(error.message, true);
        }
      } finally {
        if (url) URL.revokeObjectURL(url);
        if (picture.request === request) {
          picture.busy = false;
          updateSubmit();
        }
      }
    });
    picture.reset.addEventListener('click', () => {
      picture.request++;
      picture.busy = false;
      picture.input.value = '';
      setPicture(picture, null);
      dirty = true;
      notify('点击保存应用到博客。');
      updateSubmit();
    });
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (fields.disabled || submit.disabled) return;
    fields.disabled = true;
    saving = true;
    updateSubmit();
    notify('正在保存…');
    try {
      const value = Object.fromEntries(pictures.map(picture => [picture.key, picture.value]));
      value.nickname = nickname.value.trim();
      loadSaved(await SiteStorage.saveBlogAppearance(value, revision));
      notify('博客设置已保存。');
    } catch (error) {
      notify(error.message, true);
    } finally {
      fields.disabled = false;
      saving = false;
      updateSubmit();
    }
  });
  async function init() {
    try {
      loadSaved(await SiteStorage.blogAppearance());
      await SiteStorage.assertWritable();
      fields.disabled = false;
      notify('');
    } catch (error) {
      notify(error.message, true);
    }
  }
  init();
})();
