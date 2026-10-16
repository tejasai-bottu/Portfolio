/* The compact project card used in the grid. Same markup for every category.
   The whole card is clickable through the title button (its ::after covers the card),
   so there is one tab stop per card and screen readers hear the title as the button name. */
(function () {
  'use strict';
  var P = window.Portfolio = window.Portfolio || {};

  function metaLine(project) {
    var parts = [project.type];
    if (project.role && project.role.title) parts.push(project.role.title);
    if (project.year) parts.push(project.year);
    return parts.filter(Boolean);
  }

  function render(project) {
    var li = P.el('li', 'pcard');
    li.id = 'project-' + project.id;
    li.dataset.id = project.id;

    var thumb = P.el('div', 'pcard__thumb');
    thumb.setAttribute('aria-hidden', 'true');
    thumb.appendChild(P.visuals.render(project));
    li.appendChild(thumb);

    var body = P.el('div', 'pcard__body');
    var meta = P.el('p', 'pcard__meta');
    metaLine(project).forEach(function (t) { meta.appendChild(P.el('span', '', t)); });
    body.appendChild(meta);

    var h = P.el('h3', 'pcard__title');
    var open = P.el('button', 'pcard__open', project.title);
    open.type = 'button';
    open.setAttribute('aria-haspopup', 'dialog');
    open.setAttribute('aria-describedby', 'pdesc-' + project.id);
    h.appendChild(open);
    body.appendChild(h);

    var desc = P.el('p', 'pcard__desc', project.short || project.summary);
    desc.id = 'pdesc-' + project.id;
    body.appendChild(desc);

    var foot = P.el('div', 'pcard__foot');
    var tags = P.el('ul', 'ptags');
    tags.setAttribute('aria-label', 'Categories');
    (project.categories || []).forEach(function (c) { tags.appendChild(P.el('li', 'ptag', P.filters.label(c))); });
    foot.appendChild(tags);
    var more = P.el('span', 'pcard__more');
    more.setAttribute('aria-hidden', 'true');
    more.innerHTML = 'Details <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    foot.appendChild(more);
    body.appendChild(foot);

    li.appendChild(body);
    return { node: li, button: open };
  }

  P.card = { render: render, metaLine: metaLine };
})();
