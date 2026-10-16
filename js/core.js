/* Shared namespace and small helpers. Loaded first; every other script adds to window.Portfolio.
   All scripts are classic (no modules, no fetch), so index.html also works from a double-click. */
(function () {
  'use strict';
  var P = window.Portfolio = window.Portfolio || {};

  P.$ = function (id) { return document.getElementById(id); };
  P.all = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  P.clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  // Create an element: P.el('p', 'class-name', 'text')
  P.el = function (tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  P.mq = {
    reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
    finePointer: window.matchMedia('(hover: hover) and (pointer: fine)'),
    mobile: window.matchMedia('(max-width: 900px)')
  };
  P.onChange = function (mq, fn) {
    if (mq.addEventListener) mq.addEventListener('change', fn); else if (mq.addListener) mq.addListener(fn);
  };
  P.tiltEnabled = function () { return P.mq.finePointer.matches && !P.mq.reduceMotion.matches; };

  // Clipboard with a fallback for file:// and older browsers.
  P.copyText = function (text, done, fail) {
    function legacy() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', '');
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      return ok;
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, function () { if (legacy()) done(); else fail(); });
    } else if (legacy()) done(); else fail();
  };
})();
