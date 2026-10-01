/**
 * NAVIAR Consult — Language switcher (NO · EN · TR)
 * ------------------------------------------------------------------
 * Zero dependencies. Norwegian (nb-NO) is baked into the HTML; EN and TR
 * are loaded on demand from ./i18n-content_<lang>.json and cached.
 *
 * Resolution order on first paint:
 *   1. ?lang=xx in the URL           (shareable links: /?lang=en, /en, /tr)
 *   2. localStorage 'naviar-language' (returning visitors)
 *   3. navigator.language             (nb/nn/no → no, tr → tr, en → en)
 *   4. default 'no'
 *
 * Markup contract:
 *   data-i18n="section.key"          → textContent
 *   data-i18n="key" data-i18n-html   → innerHTML (trusted, our own JSON)
 *   data-i18n-attr="aria-label:key;title:other.key"
 *   <img data-i18n="key">            → alt
 *   button[data-lang="no|en|tr"]     → language buttons (aria-pressed)
 *
 * Public API: window.NAVIAR.language { current(), switch(lang), t(key), supported, ready }
 * Event:      document 'naviar:language-changed'  detail: { language, previous }
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'naviar-language';
  var DEFAULT_LANGUAGE = 'no';
  var LANGS = {
    no: { native: 'Norsk',   hreflang: 'nb-NO', ogLocale: 'nb_NO' },
    en: { native: 'English', hreflang: 'en',    ogLocale: 'en_GB' },
    tr: { native: 'Türkçe',  hreflang: 'tr',    ogLocale: 'tr_TR' }
  };
  var SUPPORTED = Object.keys(LANGS);

  var translations = {};   // lang -> JSON object
  var pending = {};        // lang -> Promise
  var current = DEFAULT_LANGUAGE;
  var baseline = null;     // captured Norwegian DOM values (used as fallback)
  var readyResolve;
  var ready = new Promise(function (r) { readyResolve = r; });

  /* ------------------------------------------------------------ helpers */
  function isSupported(l) { return !!LANGS[l]; }

  function storageGet() { try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; } }
  function storageSet(v) { try { localStorage.setItem(STORAGE_KEY, v); } catch (e) { /* private mode */ } }

  function detectInitial() {
    var q = null;
    try { q = new URLSearchParams(location.search).get('lang'); } catch (e) {}
    if (q && isSupported(q)) return q;
    var hinted = document.documentElement.getAttribute('data-lang');
    if (hinted && isSupported(hinted)) return hinted;
    var saved = storageGet();
    if (saved && isSupported(saved)) return saved;
    var nav = (navigator.language || navigator.userLanguage || '').toLowerCase();
    if (/^(nb|nn|no)/.test(nav)) return 'no';
    if (/^tr/.test(nav)) return 'tr';
    if (/^en/.test(nav)) return 'en';
    return DEFAULT_LANGUAGE;
  }

  function get(obj, path) {
    var parts = path.split('.'), v = obj;
    for (var i = 0; i < parts.length; i++) {
      if (v && typeof v === 'object' && parts[i] in v) v = v[parts[i]]; else return null;
    }
    return typeof v === 'string' ? v : null;
  }

  /* Capture the Norwegian text already in the DOM so 'no' never needs a fetch
     and any missing key in another language falls back gracefully. */
  function captureBaseline() {
    if (baseline) return baseline;
    baseline = {};
    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i], key = el.getAttribute('data-i18n');
      if (el.tagName === 'IMG') baseline[key] = el.getAttribute('alt') || '';
      else if (el.hasAttribute('data-i18n-html')) baseline[key] = el.innerHTML;
      else baseline[key] = el.textContent;
    }
    var attrNodes = document.querySelectorAll('[data-i18n-attr]');
    for (var j = 0; j < attrNodes.length; j++) {
      var spec = attrNodes[j].getAttribute('data-i18n-attr').split(';');
      for (var k = 0; k < spec.length; k++) {
        var pair = spec[k].split(':');
        if (pair.length === 2) baseline[pair[1].trim()] = attrNodes[j].getAttribute(pair[0].trim()) || '';
      }
    }
    baseline['meta.title'] = document.title;
    var md = document.querySelector('meta[name="description"]');
    baseline['meta.description'] = md ? md.getAttribute('content') : '';
    return baseline;
  }

  function load(lang) {
    if (translations[lang]) return Promise.resolve(translations[lang]);
    if (pending[lang]) return pending[lang];
    pending[lang] = fetch('./i18n-content_' + lang + '.json', { cache: 'force-cache' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (json) { translations[lang] = json; return json; })
      .catch(function (err) {
        console.warn('[NAVIAR i18n] could not load ' + lang + ':', err);
        delete pending[lang];
        return null;
      });
    return pending[lang];
  }

  /* --------------------------------------------------------------- apply */
  function value(dict, key) {
    var v = dict ? get(dict, key) : null;
    if (v === null && baseline && key in baseline) v = baseline[key];
    return v;
  }

  function apply(lang) {
    var dict = lang === DEFAULT_LANGUAGE ? null : translations[lang];
    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i], key = el.getAttribute('data-i18n');
      var v = value(dict, key);
      if (v === null) continue;
      if (el.tagName === 'IMG') el.setAttribute('alt', v);
      else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.setAttribute('placeholder', v);
      else if (el.hasAttribute('data-i18n-html')) { if (el.innerHTML !== v) el.innerHTML = v; }
      else if (el.textContent !== v) el.textContent = v;
    }
    var attrNodes = document.querySelectorAll('[data-i18n-attr]');
    for (var j = 0; j < attrNodes.length; j++) {
      var spec = attrNodes[j].getAttribute('data-i18n-attr').split(';');
      for (var k = 0; k < spec.length; k++) {
        var pair = spec[k].split(':');
        if (pair.length !== 2) continue;
        var av = value(dict, pair[1].trim());
        if (av !== null) attrNodes[j].setAttribute(pair[0].trim(), av);
      }
    }
    // document-level metadata
    var page = document.documentElement.getAttribute('data-page') || '';
    var t = (page && value(dict, page + '.title')) || value(dict, 'meta.title'); if (t) document.title = t;
    var d = (page && value(dict, page + '.description')) || value(dict, 'meta.description');
    var md = document.querySelector('meta[name="description"]'); if (md && d) md.setAttribute('content', d);
    var ogt = document.querySelector('meta[property="og:title"]'); if (ogt && t) ogt.setAttribute('content', t);
    var ogd = document.querySelector('meta[property="og:description"]'); if (ogd && d) ogd.setAttribute('content', d);
    var ogl = document.querySelector('meta[property="og:locale"]'); if (ogl) ogl.setAttribute('content', LANGS[lang].ogLocale);
    document.documentElement.lang = LANGS[lang].hreflang;
    document.documentElement.setAttribute('data-lang', lang);
  }

  function updateButtons(lang) {
    var btns = document.querySelectorAll('button[data-lang]');
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i], on = b.getAttribute('data-lang') === lang;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    }
  }

  function syncUrl(lang) {
    try {
      var url = new URL(location.href);
      if (url.searchParams.has('lang') || lang !== DEFAULT_LANGUAGE) {
        if (lang === DEFAULT_LANGUAGE) url.searchParams.delete('lang'); else url.searchParams.set('lang', lang);
        history.replaceState(history.state, '', url.pathname + (url.search || '') + url.hash);
      }
    } catch (e) {}
  }

  /* -------------------------------------------------------------- switch */
  function switchLanguage(lang, opts) {
    opts = opts || {};
    if (!isSupported(lang)) { console.warn('[NAVIAR i18n] unsupported language: ' + lang); return Promise.resolve(false); }
    captureBaseline();
    var previous = current;
    var done = function () {
      current = lang;
      apply(lang);
      updateButtons(lang);
      storageSet(lang);
      if (!opts.silentUrl) syncUrl(lang);
      document.documentElement.classList.remove('i18n-pending');
      document.dispatchEvent(new CustomEvent('naviar:language-changed', { detail: { language: lang, previous: previous } }));
      return true;
    };
    if (lang === DEFAULT_LANGUAGE) return Promise.resolve(done());
    return load(lang).then(function (json) {
      if (!json) { // network failure → stay readable in Norwegian
        document.documentElement.classList.remove('i18n-pending');
        updateButtons(current);
        return false;
      }
      return done();
    });
  }

  function bindButtons() {
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('button[data-lang]');
      if (!b) return;
      e.preventDefault();
      var lang = b.getAttribute('data-lang');
      if (lang !== current) switchLanguage(lang);
      closeMenu();
    });
    // keyboard: arrow keys move between language buttons
    document.addEventListener('keydown', function (e) {
      var b = e.target.closest && e.target.closest('button[data-lang]');
      if (!b || (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft')) return;
      var all = Array.prototype.slice.call(document.querySelectorAll('button[data-lang]'));
      var i = all.indexOf(b); if (i < 0) return;
      var n = all[(i + (e.key === 'ArrowRight' ? 1 : all.length - 1)) % all.length];
      if (n) { n.focus(); e.preventDefault(); }
    });
  }

  /* -------------------------------------------------------- mobile menu */
  function closeMenu() {
    var t = document.querySelector('.menu-toggle');
    if (!t) return;
    t.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('nav-open');
  }
  function bindMenu() {
    var t = document.querySelector('.menu-toggle');
    if (!t) return;
    t.addEventListener('click', function () {
      var open = t.getAttribute('aria-expanded') !== 'true';
      t.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.documentElement.classList.toggle('nav-open', open);
    });
    var nav = document.getElementById('primary-nav');
    if (nav) nav.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
    window.addEventListener('resize', function () { if (window.innerWidth > 1200) closeMenu(); });
  }

  /* ---------------------------------------------------------------- init */
  function init() {
    captureBaseline();
    bindButtons();
    bindMenu();
    var initial = detectInitial();
    switchLanguage(initial, { silentUrl: true }).then(function () {
      readyResolve(current);
      // warm the other languages in the background (tiny files, cached)
      SUPPORTED.forEach(function (l) { if (l !== DEFAULT_LANGUAGE && l !== current) setTimeout(function () { load(l); }, 1500); });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  window.NAVIAR = window.NAVIAR || {};
  window.NAVIAR.language = {
    current: function () { return current; },
    switch: switchLanguage,
    t: function (key) { var v = value(current === DEFAULT_LANGUAGE ? null : translations[current], key); return v === null ? key : v; },
    supported: SUPPORTED.slice(),
    ready: ready
  };
})();
