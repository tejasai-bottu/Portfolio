/* Categories and filtering. Pure helpers plus the filter bar above the grid.
   Categories come from js/data/projects.js; a category with no projects is not shown. */
(function () {
  'use strict';
  var P = window.Portfolio = window.Portfolio || {};
  var ALL = 'all';

  function categories() { return (P.data && P.data.categories) || []; }
  function projects() { return (P.data && P.data.projects) || []; }
  function category(id) { return categories().filter(function (c) { return c.id === id; })[0] || null; }
  function label(id) { var c = category(id); return c ? c.label : id; }
  function matches(project, filter) { return filter === ALL || (project.categories || []).indexOf(filter) !== -1; }
  function list(filter) { return projects().filter(function (p) { return matches(p, filter); }); }

  /* The filter bar: one toggle button per category, single choice.
     onChange(filterId) runs whenever the choice changes. */
  function mount(container, descEl, onChange) {
    var current = ALL, buttons = [];
    var options = [{ id: ALL, label: 'All' }].concat(categories().filter(function (c) { return list(c.id).length > 0; }));

    options.forEach(function (opt) {
      var b = P.el('button', 'filter');
      b.type = 'button';
      b.dataset.filter = opt.id;
      b.appendChild(document.createTextNode(opt.label));
      var n = P.el('span', 'filter__count', String(list(opt.id).length));
      n.setAttribute('aria-hidden', 'true');
      b.appendChild(n);
      var sr = P.el('span', 'visually-hidden', ', ' + list(opt.id).length + ' projects');
      b.appendChild(sr);
      b.addEventListener('click', function () { set(opt.id); });
      container.appendChild(b);
      buttons.push(b);
    });

    function describe() {
      var c = category(current), n = list(current).length, total = projects().length;
      descEl.textContent = current === ALL
        ? 'All ' + total + ' projects, from LLM defense to post-quantum migration and hidden channels.'
        : c.description + ' Showing ' + n + ' of ' + total + '.';
    }
    function set(id) {
      if (id === current && buttons.length) { sync(); return; }
      current = id;
      sync();
      describe();
      if (onChange) onChange(current);
    }
    function sync() { buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.filter === current)); }); }

    sync(); describe();
    return { get: function () { return current; }, set: set };
  }

  P.filters = { ALL: ALL, categories: categories, category: category, label: label, matches: matches, list: list, mount: mount };
})();
