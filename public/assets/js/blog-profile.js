(() => {
'use strict';
const CONTACTS = { phone: "", email: "", wechat: "", instagram: "", xiaohongshu: "", bilibili: "" };
    const toast = document.querySelector('.toast');
    let toastTimer;
    function notify(message) {
      clearTimeout(toastTimer);
      toast.textContent = message;
      toast.classList.add('visible');
      toastTimer = setTimeout(() => toast.classList.remove('visible'), 2600);
    }
    async function copyText(value) {
      if (navigator.clipboard && window.isSecureContext) {
        try { await navigator.clipboard.writeText(value); return; } catch (_) { /* 尝试本地页面兼容方式。 */ }
      }
      const field = document.createElement('textarea');
      field.value = value;
      field.style.cssText = 'position:fixed;left:-9999px;top:0';
      field.setAttribute('aria-hidden', 'true');
      const active = document.activeElement;
      document.body.appendChild(field);
      field.select();
      try {
        if (!document.execCommand('copy')) throw new Error('Copy unavailable');
      } finally { field.remove(); if (active) active.focus(); }
    }
    const recovery = document.querySelector('.copy-recovery');
    const recoveryValue = document.querySelector('#copy-value');
    let recoveryTrigger;
    function closeRecovery() {
      recovery.hidden = true;
      if (recoveryTrigger) recoveryTrigger.focus();
    }
    document.querySelector('.recovery-close').addEventListener('click', closeRecovery);
    recoveryValue.addEventListener('click', () => recoveryValue.select());

document.querySelectorAll('.contact-button').forEach((button, index) => {
      const label = button.dataset.label;
      const item = button.closest('li');
      const tooltip = document.createElement('span');
      tooltip.className = 'contact-tooltip';
      tooltip.id = 'contact-tooltip-' + index;
      tooltip.setAttribute('role', 'tooltip');
      const tooltipText = document.createElement('span');
      tooltipText.textContent = label;
      tooltip.appendChild(tooltipText);
      item.appendChild(tooltip);
      button.setAttribute('aria-describedby', tooltip.id);
      item.addEventListener('mouseleave', () => item.classList.remove('tooltip-dismissed'));
      button.addEventListener('focus', () => item.classList.remove('tooltip-dismissed'));
      if (CONTACTS[button.dataset.contact]) button.setAttribute('aria-label', '复制' + label);
      button.addEventListener('click', async () => {
        const value = CONTACTS[button.dataset.contact];
        if (!value) { notify(label + '待提供'); return; }
        try { await copyText(value); notify(label + '已复制'); }
        catch (_) {
          clearTimeout(toastTimer);
          toast.classList.remove('visible');
          recoveryTrigger = button;
          recoveryValue.value = value;
          recovery.hidden = false;
          recoveryValue.focus();
          recoveryValue.select();
        }
      });
    });
  // Read the same public profile file as the homepage. No writes, migration or private drafts.
  const profileStatus = document.getElementById('blog-profile-status');
  const avatar = document.getElementById('blog-avatar-image');
  const background = document.getElementById('blog-background-image');
  const avatarPlaceholder = document.getElementById('avatar-placeholder');
  const imagePath = asset => /^assets\/(uploads|published)\/[a-f0-9]{64}\.(png|jpg|webp)$/.test(asset?.path || '') ? asset.path : '';
  function renderImage(image, asset) {
    const path = imagePath(asset);
    BlogCrop.apply(image, asset?.crop);
    if (path && image.getAttribute('src') !== path) image.src = path;
    if (!path) image.removeAttribute('src');
    image.hidden = !path || (image.complete && !image.naturalWidth);
    return path && !image.hidden;
  }
  let requestVersion = 0;
  avatar.addEventListener('load', () => { avatar.hidden = false; avatarPlaceholder.hidden = true; });
  avatar.addEventListener('error', () => {
    avatar.hidden = true; avatarPlaceholder.hidden = false;
    document.querySelector('.blog-avatar').setAttribute('aria-label', '头像暂时无法显示');
  });
  background.addEventListener('load', () => { background.hidden = false; });
  background.addEventListener('error', () => { background.hidden = true; });
  async function refreshProfile() {
    const version = ++requestVersion;
    try {
      const response = await fetch('data/site.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('Profile unavailable');
      const site = await response.json();
      const profile = site.profile || {};
      if (version !== requestVersion) return;
      const name = typeof profile.name === 'string' ? profile.name.trim() : '';
      const englishName = typeof profile.englishName === 'string' ? profile.englishName.trim() : '';
      const appearance = site.blogAppearance;
      const nickname = typeof appearance?.nickname === 'string' ? appearance.nickname.trim() : '';
      document.getElementById('blog-nickname').textContent = nickname || name || englishName || '昵称待提供';
      const wordmark = document.querySelector('.wordmark');
      wordmark.textContent = englishName || 'Your Name';
      wordmark.setAttribute('aria-label', englishName || 'Your Name，英文名待提供');
      avatarPlaceholder.hidden = Boolean(renderImage(avatar, appearance?.avatar));
      document.querySelector('.blog-avatar').setAttribute('aria-label', imagePath(appearance?.avatar) ? (nickname || name || englishName || '个人') + '的博客头像' : '头像待提供');
      renderImage(background, appearance?.background);
      for (const button of document.querySelectorAll('.contact-button')) {
        const key = button.dataset.contact;
        CONTACTS[key] = typeof profile[key] === 'string' ? profile[key].trim() : '';
        button.setAttribute('aria-label', '复制' + button.dataset.label + (CONTACTS[key] ? '' : '（资料待提供）'));
      }
      profileStatus.hidden = true;
    } catch (_) {
      if (version !== requestVersion) return;
      profileStatus.textContent = '个人资料暂时无法读取，请刷新重试。';
      profileStatus.hidden = false;
    }
  }
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    document.querySelectorAll('.contacts li:hover, .contacts li:focus-within').forEach(item => item.classList.add('tooltip-dismissed'));
    if (!recovery.hidden) closeRecovery();
  });
  window.addEventListener('pageshow', refreshProfile);
  window.addEventListener('site-content-changed', refreshProfile);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshProfile(); });
  try { const channel = new BroadcastChannel('academic-homepage.files.v1'); channel.onmessage = refreshProfile; } catch (_) { /* visibility refresh remains available */ }
  refreshProfile();

})();
