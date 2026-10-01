/**
 * NAVIAR Consult — "veiviser" assistant (NO · EN · TR)
 * ------------------------------------------------------------------
 * A deliberately simple, rule-based guide that answers questions about the
 * services, method and privacy stance, and points to the right section.
 *
 * Principles (mirrors the site's own stance):
 *   - No automatic assessment of people or cases. Answers are static text.
 *   - Nothing is sent anywhere: no backend, no analytics, no storage.
 *   - Content lives in i18n-content_<lang>.json under "chat" — editable
 *     without touching this file.
 *
 * Markup is created here; styles live in naviar-assistant.css.
 * Depends on window.NAVIAR.language (language-switcher.js) for the current
 * language and the 'naviar:language-changed' event.
 */
(function () {
  'use strict';

  var DEFAULT = 'no';
  var dicts = {};       // lang -> chat dictionary
  var pending = {};
  var current = DEFAULT;
  var els = {};
  var open = false;
  var history = [];     // [{who:'bot'|'user', text, link}]
  var lastFocus = null;

  /* ------------------------------------------------------------ load */
  function loadChat(lang) {
    if (dicts[lang]) return Promise.resolve(dicts[lang]);
    if (pending[lang]) return pending[lang];
    pending[lang] = fetch('./i18n-content_' + lang + '.json', { cache: 'force-cache' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (json) { dicts[lang] = json.chat || null; return dicts[lang]; })
      .catch(function (e) { console.warn('[NAVIAR assistant] could not load ' + lang, e); delete pending[lang]; return null; });
    return pending[lang];
  }

  function dict() { return dicts[current] || dicts[DEFAULT] || null; }

  /* --------------------------------------------------------- matching */
  function fold(s) {
    return String(s || '').toLowerCase()
      .replace(/[æ]/g, 'ae').replace(/[ø]/g, 'o').replace(/[å]/g, 'a')
      .replace(/[ıi̇]/g, 'i').replace(/[ş]/g, 's').replace(/[ğ]/g, 'g').replace(/[ç]/g, 'c').replace(/[ö]/g, 'o').replace(/[ü]/g, 'u')
      .replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function bestTopic(question) {
    var d = dict(); if (!d || !d.topics) return null;
    var q = ' ' + fold(question) + ' ';
    var best = null, bestScore = 0;
    Object.keys(d.topics).forEach(function (id) {
      var t = d.topics[id];
      var kws = String(t.kw || '').split(',');
      var score = 0;
      kws.forEach(function (k) {
        k = fold(k); if (!k) return;
        if (q.indexOf(' ' + k + ' ') >= 0) score += 3;        // whole word/phrase
        else if (q.indexOf(k) >= 0) score += 1;               // substring
      });
      if (score > bestScore) { bestScore = score; best = id; }
    });
    return bestScore > 0 ? best : null;
  }

  /* ----------------------------------------------------------- render */
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function build() {
    var d = dict() || {};
    var toggle = el('button', 'nv-chat-toggle');
    toggle.type = 'button';
    toggle.setAttribute('aria-haspopup', 'dialog');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'nv-chat');
    toggle.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.2 3.4c-.6.5-1.8.1-1.8-.8V5.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8 8.5h8M8 11.5h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg><span class="nv-chat-toggle-label"></span>';

    var panel = el('section', 'nv-chat');
    panel.id = 'nv-chat';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'false');
    panel.hidden = true;

    var head = el('header', 'nv-chat-head');
    var title = el('div', 'nv-chat-title');
    var t1 = el('strong', null, d.title || 'NAVIAR');
    var t2 = el('span', 'nv-chat-sub', d.subtitle || '');
    title.appendChild(t1); title.appendChild(t2);
    var close = el('button', 'nv-chat-close');
    close.type = 'button'; close.setAttribute('aria-label', d.close || 'Close');
    close.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
    head.appendChild(title); head.appendChild(close);

    var log = el('div', 'nv-chat-log');
    log.setAttribute('role', 'log'); log.setAttribute('aria-live', 'polite'); log.setAttribute('aria-relevant', 'additions');

    var chips = el('div', 'nv-chat-chips');
    chips.setAttribute('aria-label', d.chips_label || '');

    var form = el('form', 'nv-chat-form');
    var input = el('input', 'nv-chat-input');
    input.type = 'text'; input.maxLength = 200; input.autocomplete = 'off'; input.setAttribute('aria-label', d.placeholder || '');
    var send = el('button', 'nv-chat-send', d.send || 'Send'); send.type = 'submit';
    form.appendChild(input); form.appendChild(send);
    var note = el('p', 'nv-chat-note', d.privacy || '');

    panel.appendChild(head); panel.appendChild(log); panel.appendChild(chips); panel.appendChild(form); panel.appendChild(note);
    document.body.appendChild(toggle); document.body.appendChild(panel);

    els = { toggle: toggle, panel: panel, log: log, chips: chips, form: form, input: input, send: send, note: note, close: close, t1: t1, t2: t2, label: toggle.querySelector('.nv-chat-toggle-label') };

    toggle.addEventListener('click', function () { open ? closePanel() : openPanel(); });
    close.addEventListener('click', closePanel);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) closePanel(); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = input.value.trim(); if (!q) return;
      input.value = '';
      ask(q);
    });
    chips.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-topic]'); if (!b) return;
      var d2 = dict(); var t = d2 && d2.topics && d2.topics[b.getAttribute('data-topic')];
      if (t) { push('user', t.q); reply(b.getAttribute('data-topic')); }
    });
    log.addEventListener('click', function (e) {
      var a = e.target.closest('a[data-jump]'); if (!a) return;
      closePanel();
    });
    applyLanguage();
  }

  function renderChips() {
    var d = dict(); els.chips.innerHTML = '';
    if (!d || !d.topics) return;
    var ids = (d.chips || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    ids.forEach(function (id) {
      var t = d.topics[id]; if (!t) return;
      var b = el('button', 'nv-chip', t.q); b.type = 'button'; b.setAttribute('data-topic', id);
      els.chips.appendChild(b);
    });
  }

  function push(who, text, link, linkLabel) {
    history.push({ who: who, text: text, link: link, linkLabel: linkLabel });
    var m = el('div', 'nv-msg nv-msg-' + who);
    var p = el('p', null, text);
    m.appendChild(p);
    if (link) {
      var a = el('a', 'nv-msg-link', linkLabel || link);
      // on subpages the index anchors don't exist locally — route them home
      a.href = (link.charAt(0) === '#' && !document.getElementById(link.slice(1))) ? './' + link : link;
      a.setAttribute('data-jump', '');
      m.appendChild(a);
    }
    els.log.appendChild(m);
    els.log.scrollTop = els.log.scrollHeight;
  }

  function reply(topicId) {
    var d = dict(); if (!d) return;
    var t = d.topics && d.topics[topicId];
    setTimeout(function () {
      if (t) push('bot', t.a, t.link, d.jump || '→');
      else push('bot', d.fallback || '…', '#kontakt', d.jump || '→');
    }, 160);
  }

  function ask(question) {
    push('user', question);
    var id = bestTopic(question);
    reply(id);
  }

  function rerenderLog() {
    els.log.innerHTML = '';
    var d = dict();
    if (!history.length && d) push('bot', d.intro || '');
    else history.slice().forEach(function (h) { history.pop(); }); // history is rebuilt below
  }

  function applyLanguage() {
    var d = dict(); if (!d) return;
    els.t1.textContent = d.title || 'NAVIAR';
    els.t2.textContent = d.subtitle || '';
    els.label.textContent = d.open || '';
    els.toggle.setAttribute('aria-label', d.open || 'Chat');
    els.close.setAttribute('aria-label', d.close || 'Close');
    els.input.placeholder = d.placeholder || '';
    els.input.setAttribute('aria-label', d.placeholder || '');
    els.send.textContent = d.send || 'Send';
    els.note.textContent = d.privacy || '';
    els.panel.setAttribute('aria-label', d.title || 'NAVIAR');
    renderChips();
    // reset conversation in the new language (intro only)
    history = [];
    els.log.innerHTML = '';
    push('bot', d.intro || '');
    if (d.notice) push('bot', d.notice);
  }

  function openPanel() {
    open = true; lastFocus = document.activeElement;
    els.panel.hidden = false;
    els.toggle.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('nv-chat-open');
    setTimeout(function () { els.input.focus(); }, 50);
  }
  function closePanel() {
    open = false;
    els.panel.hidden = true;
    els.toggle.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('nv-chat-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus(); else els.toggle.focus();
  }

  /* ------------------------------------------------------------- init */
  function currentLang() {
    try { return (window.NAVIAR && window.NAVIAR.language && window.NAVIAR.language.current()) || DEFAULT; } catch (e) { return DEFAULT; }
  }

  function init() {
    var start = function () {
      current = currentLang();
      loadChat(current).then(function (d) {
        if (!d && current !== DEFAULT) return loadChat(DEFAULT);
        return d;
      }).then(function (d) { if (d) build(); });
    };
    if (window.NAVIAR && window.NAVIAR.language && window.NAVIAR.language.ready) window.NAVIAR.language.ready.then(start); else start();

    document.addEventListener('naviar:language-changed', function (e) {
      current = e.detail.language;
      loadChat(current).then(function () { if (els.panel) applyLanguage(); });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  window.NAVIAR = window.NAVIAR || {};
  window.NAVIAR.assistant = { open: function () { if (els.panel) openPanel(); }, close: function () { if (els.panel) closePanel(); }, ask: function (q) { if (els.panel) { openPanel(); ask(q); } } };
})();
