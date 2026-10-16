/* Theme: dark by default, light on request, remembered in localStorage.
   The initial theme is applied by a tiny inline script in <head> before first paint.
   Other modules (the 3D scene) subscribe with P.theme.onChange(fn). */
(function () {
  'use strict';
  var P = window.Portfolio = window.Portfolio || {};
  var root = document.documentElement, listeners = [];

  function current() { return root.dataset.theme === 'light' ? 'light' : 'dark'; }
  function set(t, persist) {
    root.dataset.theme = t;
    var light = t === 'light', btn = P.$('theme-toggle'), meta = P.$('meta-theme');
    if (btn) {
      btn.setAttribute('aria-pressed', String(light));
      btn.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
    }
    if (meta) meta.setAttribute('content', light ? '#f4f4f4' : '#0a0a0a');
    if (persist) { try { localStorage.setItem('theme', t); } catch (e) { /* storage unavailable */ } }
    listeners.forEach(function (fn) { fn(t); });
  }
  function init() {
    var btn = P.$('theme-toggle');
    if (btn) btn.addEventListener('click', function () { set(current() === 'dark' ? 'light' : 'dark', true); });
    set(current(), false);
  }

  P.theme = { init: init, current: current, set: set, onChange: function (fn) { listeners.push(fn); } };
})();
