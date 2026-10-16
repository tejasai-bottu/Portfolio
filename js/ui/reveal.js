/* Content rises once as it enters the viewport (.reveal → .is-in), then hands the element back
   to its own hover transitions. Skipped entirely under reduced motion. */
(function () {
  'use strict';
  var P = window.Portfolio = window.Portfolio || {};

  function init() {
    var items = P.all('.reveal');
    if (!('IntersectionObserver' in window) || P.mq.reduceMotion.matches) {
      items.forEach(function (el) { el.classList.remove('reveal'); });
      return;
    }
    items.forEach(function (el) {
      var sibs = P.all(':scope > .reveal', el.parentElement), i = sibs.indexOf(el);
      if (i > 0) el.style.transitionDelay = Math.min(i, 6) * 70 + 'ms';
    });
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.classList.add('is-in'); obs.unobserve(el);
        setTimeout(function () { el.classList.remove('reveal', 'is-in'); el.style.transitionDelay = ''; }, 1200);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { obs.observe(el); });
  }

  P.reveal = { init: init };
})();
