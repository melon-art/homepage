(() => {
  'use strict';

  const MAX_LENGTH = 10000;

  function colorValue(value) {
    if (typeof value !== 'string') return '';
    if (/^#[a-f0-9]{6}$/i.test(value)) return value.toLowerCase();
    if (/^#[a-f0-9]{3}$/i.test(value)) return '#' + [...value.slice(1)].map(part => part + part).join('').toLowerCase();
    const rgb = value.match(/^rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)$/);
    return rgb && rgb.slice(1).every(part => Number(part) <= 255) ? '#' + rgb.slice(1).map(part => Number(part).toString(16).padStart(2, '0')).join('') : '';
  }

  function append(runs, text, bold, color) {
    if (!text) return;
    const previous = runs[runs.length - 1];
    if (previous && previous.bold === bold && previous.color === color) previous.text += text;
    else runs.push({ text, bold, color });
  }

  function trimRuns(runs) {
    const text = runs.map(run => run.text).join('');
    const start = text.length - text.trimStart().length;
    const end = text.trimEnd().length;
    let offset = 0;
    const result = [];
    for (const run of runs) {
      const from = Math.max(0, start - offset);
      const to = Math.min(run.text.length, end - offset);
      if (to > from) append(result, run.text.slice(from, to), run.bold, run.color);
      offset += run.text.length;
    }
    return result;
  }

  function normalize(value, text) {
    // Saved formatting is structured text, never HTML. Invalid or stale formatting
    // falls back to the original plain introduction rather than hiding its content.
    if (!Array.isArray(value) || value.length > MAX_LENGTH) return [];
    const runs = [];
    let length = 0;
    for (const run of value) {
      if (!run || typeof run.text !== 'string' || (length += run.text.length) > MAX_LENGTH) return [];
      append(runs, run.text, run.bold === true, colorValue(run.color));
    }
    return runs.map(run => run.text).join('') === text ? runs : [];
  }

  function render(target, text, formatting) {
    const runs = normalize(formatting, text);
    if (!runs.length) { target.textContent = text; return; }
    const fragment = document.createDocumentFragment();
    for (const run of runs) {
      const node = document.createElement(run.bold ? 'strong' : 'span');
      if (run.color) node.style.color = run.color;
      node.textContent = run.text;
      fragment.appendChild(node);
    }
    target.replaceChildren(fragment);
  }

  function readEditor(editor) {
    const runs = [];
    const endsWithBreak = () => runs.length && runs[runs.length - 1].text.endsWith('\n');
    function walk(node, bold = false, color = '') {
      if (node.nodeType === Node.TEXT_NODE) { append(runs, node.textContent, bold, color); return; }
      if (node.nodeType !== Node.ELEMENT_NODE || /^(SCRIPT|STYLE|IFRAME|OBJECT|IMG|SVG|TEMPLATE)$/.test(node.tagName)) return;
      if (node.tagName === 'BR') { append(runs, '\n', bold, color); return; }
      const block = /^(DIV|P|LI|H[1-6]|BLOCKQUOTE)$/.test(node.tagName);
      if (block && runs.length && !endsWithBreak()) append(runs, '\n', false, '');
      let weight = bold || /^(B|STRONG)$/.test(node.tagName);
      if (node.style.fontWeight) weight = node.style.fontWeight === 'bold' || Number(node.style.fontWeight) >= 600;
      const tint = colorValue(node.style.color || node.getAttribute('color')) || color;
      for (const child of node.childNodes) walk(child, weight, tint);
      if (block && node.nextSibling && !endsWithBreak()) append(runs, '\n', false, '');
    }
    for (const child of editor.childNodes) walk(child);
    return trimRuns(runs);
  }

  function createEditor(form, profile) {
    const editor = form.querySelector('#profile-introduction');
    const toolbar = form.querySelector('.about-toolbar');
    const boldButton = toolbar.querySelector('[data-about-bold]');
    const colorInput = toolbar.querySelector('#about-color');
    const feedback = form.querySelector('#about-feedback');
    let savedRange = null;
    render(editor, profile.introduction, profile.introductionRuns);

    function message(text, error = false) {
      feedback.textContent = text;
      feedback.classList.toggle('has-error', error);
    }

    function rememberSelection() {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;
      const range = selection.getRangeAt(0);
      if (!editor.contains(range.commonAncestorContainer)) return;
      savedRange = range.cloneRange();
      boldButton.setAttribute('aria-pressed', String(document.queryCommandState('bold')));
    }

    function apply(command, value) {
      if (!savedRange || !editor.contains(savedRange.commonAncestorContainer) || savedRange.collapsed) {
        message('请先选中要设置格式的文字。');
        editor.focus();
        return;
      }
      editor.focus({ preventScroll: true });
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(savedRange);
      // Native editing commands preserve the browser's selection and undo history.
      const changed = document.execCommand(command, false, value);
      rememberSelection();
      message(changed ? '格式已应用，保存后同步主页。' : '未能应用格式，请重新选中文字后重试。', !changed);
    }

    document.addEventListener('selectionchange', rememberSelection);
    toolbar.querySelectorAll('button').forEach(button => button.addEventListener('mousedown', event => event.preventDefault()));
    boldButton.addEventListener('click', () => apply('bold'));
    toolbar.querySelector('[data-about-gold]').addEventListener('click', () => {
      colorInput.value = '#866b35';
      apply('foreColor', '#866b35');
    });
    colorInput.addEventListener('change', () => apply('foreColor', colorInput.value));
    toolbar.querySelector('[data-about-clear]').addEventListener('click', () => apply('removeFormat'));
    editor.addEventListener('keydown', event => {
      if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'b') {
        event.preventDefault();
        rememberSelection();
        apply('bold');
      }
    });
    editor.addEventListener('input', () => {
      const length = readEditor(editor).reduce((sum, run) => sum + run.text.length, 0);
      message(length > MAX_LENGTH ? 'About 超过 10000 字符，请删减后保存；内容仍保留在编辑框中。' : '', length > MAX_LENGTH);
      editor.setAttribute('aria-invalid', String(length > MAX_LENGTH));
    });
    // External pasted content enters as text; saved output only keeps explicit bold
    // and color runs. Links, embedded images and arbitrary styling are not persisted.
    editor.addEventListener('paste', event => {
      event.preventDefault();
      document.execCommand('insertText', false, event.clipboardData.getData('text/plain'));
    });
    editor.addEventListener('drop', event => event.preventDefault());

    return {
      snapshot() {
        const runs = readEditor(editor);
        const text = runs.map(run => run.text).join('');
        if (text.length > MAX_LENGTH) {
          message('About 超过 10000 字符，请删减后保存；内容仍保留在编辑框中。', true);
          editor.focus();
          throw new Error('About exceeds limit');
        }
        form.elements.namedItem('introduction').value = text;
        return { introduction: text, introductionRuns: runs };
      }
    };
  }

  window.AboutContent = Object.freeze({ normalize, render, createEditor });
})();
