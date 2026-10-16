/* The Projects section: filter bar + compact card grid + floating detail view.
   Cards are rendered once from the data and shown or hidden by the filter, so the page,
   the scroll position and the filter all stay as they were when a detail view closes. */
(function () {
  'use strict';
  var P = window.Portfolio = window.Portfolio || {};

  function init() {
    var gridEl = P.$('project-grid'), filtersEl = P.$('project-filters'), descEl = P.$('project-filter-desc');
    if (!gridEl || !P.data) return;
    var cards = [];

    P.data.projects.forEach(function (project) {
      var c = P.card.render(project);
      c.button.addEventListener('click', function () {
        P.detail.open(project.id, { list: visibleProjects(), trigger: c.button });
      });
      gridEl.appendChild(c.node);
      cards.push({ project: project, node: c.node });
    });

    var filter = P.filters.mount(filtersEl, descEl, function (id) {
      var shown = 0;
      cards.forEach(function (c) {
        var on = P.filters.matches(c.project, id);
        c.node.hidden = !on;
        c.node.classList.remove('is-entering');
        if (on) {
          if (!P.mq.reduceMotion.matches) {
            c.node.style.animationDelay = Math.min(shown, 6) * 40 + 'ms';
            void c.node.offsetWidth; c.node.classList.add('is-entering');
          }
          shown++;
        }
      });
    });
    function visibleProjects() { return P.filters.list(filter.get()); }

    // Share links and in-page links (#project-<id>) open the detail view.
    function fromHash() {
      var m = /^#project-([\w-]+)$/.exec(location.hash || '');
      if (!m || P.detail.isOpen()) return;
      var card = P.$('project-' + m[1]);
      P.detail.open(m[1], { list: visibleProjects(), trigger: card ? card.querySelector('.pcard__open') : null });
    }
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#project-"]');
      if (!a || e.defaultPrevented) return;
      var id = a.getAttribute('href').slice('#project-'.length);
      if (!P.data.projects.some(function (p) { return p.id === id; })) return;
      e.preventDefault();
      if (filter.get() !== P.filters.ALL && !P.filters.matches(P.data.projects.filter(function (p) { return p.id === id; })[0], filter.get())) filter.set(P.filters.ALL);
      var card = P.$('project-' + id);
      if (card) card.scrollIntoView({ behavior: P.mq.reduceMotion.matches ? 'auto' : 'smooth', block: 'center' });
      P.detail.open(id, { list: visibleProjects(), trigger: card ? card.querySelector('.pcard__open') : a });
    });
    window.addEventListener('hashchange', fromHash);
    fromHash();
  }

  P.grid = { init: init };
})();
