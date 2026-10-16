/* Header: glass state on scroll, reading progress bar, mobile menu, current section in the nav. */
(function () {
  'use strict';
  var P = window.Portfolio = window.Portfolio || {};

  function initProgress() {
    var header = P.$('site-header'), bar = P.$('progress-bar'), frame = 0;
    function update() {
      frame = 0;
      var y = window.scrollY || window.pageYOffset;
      header.classList.toggle('is-scrolled', y > 24);
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.setProperty('--p', max > 0 ? Math.min(1, y / max).toFixed(4) : 0);
    }
    function queue() { if (!frame) frame = requestAnimationFrame(update); }
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    update();
  }

  function initMenu() {
    var btn = P.$('menu-toggle'), nav = P.$('site-nav'), mobile = P.mq.mobile;
    function syncA11y() {
      // A closed mobile menu must not be reachable by keyboard or screen reader.
      if (mobile.matches && !nav.classList.contains('is-open')) nav.setAttribute('inert', ''); else nav.removeAttribute('inert');
    }
    function setMenu(open, returnFocus) {
      nav.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      syncA11y();
      if (returnFocus) btn.focus();
    }
    btn.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a') && mobile.matches) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('is-open')) setMenu(false, true); });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('is-open') && !e.target.closest('#site-nav') && !e.target.closest('#menu-toggle')) setMenu(false);
    });
    P.onChange(mobile, function () { setMenu(false); });
    syncA11y();
  }

  function initCurrentSection() {
    if (!('IntersectionObserver' in window)) return;
    var links = P.all('.nav__list a[href^="#"]:not(.btn)'), byId = {}, visible = {};
    links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var sections = Object.keys(byId).map(P.$).filter(Boolean);
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { visible[en.target.id] = en.isIntersecting; });
      var top = sections.filter(function (s) { return visible[s.id]; })[0];
      links.forEach(function (a) { if (top && a === byId[top.id]) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    }, { rootMargin: '-45% 0px -50% 0px' }); // a thin band across the middle of the viewport
    sections.forEach(function (s) { obs.observe(s); });
  }

  P.header = { init: function () { initProgress(); initMenu(); initCurrentSection(); } };
})();
