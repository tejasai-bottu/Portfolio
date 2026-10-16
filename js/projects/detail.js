/* The floating project detail view: the large showcase card, opened over the page.
   Native <dialog>: the browser traps focus, makes the page inert and handles Escape.
   We add: content from the project data, previous/next within the current filter,
   an opening motion that grows from the card, focus return, and a shareable #project-<id> link. */
(function () {
  'use strict';
  var P = window.Portfolio = window.Portfolio || {};

  var dialog, panel, content, kicker, prevBtn, nextBtn, prevName, nextName;
  var list = [], index = -1, opener = null, closing = false, urlBefore = null;

  function byId(id) { return (P.data.projects || []).filter(function (p) { return p.id === id; })[0] || null; }

  function section(title, node) {
    var s = P.el('section', 'detail__section');
    s.appendChild(P.el('h3', 'detail__label', title));
    s.appendChild(node);
    return s;
  }
  function textList(items, cls) {
    var ul = P.el('ul', cls);
    items.forEach(function (t) { ul.appendChild(P.el('li', '', t)); });
    return ul;
  }

  function render(project) {
    content.textContent = '';

    // Top: the showcase card, illustration beside the headline
    var hero = P.el('div', 'detail__hero');
    var visual = P.el('div', 'detail__visual');
    visual.setAttribute('aria-hidden', 'true');
    visual.appendChild(P.visuals.render(project));
    hero.appendChild(visual);

    var head = P.el('div', 'detail__head');
    var meta = P.el('p', 'detail__meta');
    P.card.metaLine(project).forEach(function (t, i) { meta.appendChild(P.el('span', i === 0 ? 'badge' : 'detail__meta-item', t)); });
    head.appendChild(meta);
    var title = P.el('h2', 'detail__title', project.title);
    title.id = 'detail-title';
    head.appendChild(title);
    head.appendChild(P.el('p', 'detail__summary', project.summary || project.short));
    var cats = P.el('ul', 'ptags');
    cats.setAttribute('aria-label', 'Categories');
    (project.categories || []).forEach(function (c) { cats.appendChild(P.el('li', 'ptag', P.filters.label(c))); });
    head.appendChild(cats);
    if (project.links && project.links.length) {
      var actions = P.el('div', 'detail__actions');
      project.links.forEach(function (l, i) {
        var a = P.el('a', 'btn ' + (i === 0 ? 'btn--primary' : 'btn--secondary'), l.label);
        a.href = l.href;
        if (/^https?:/.test(l.href)) {
          a.target = '_blank'; a.rel = 'noopener';
          a.appendChild(P.el('span', 'visually-hidden', ' (opens in a new tab)'));
        }
        actions.appendChild(a);
      });
      head.appendChild(actions);
    }
    hero.appendChild(head);
    content.appendChild(hero);

    // Below: the story, then the facts
    var grid = P.el('div', 'detail__grid');
    var main = P.el('div', 'detail__main'), side = P.el('div', 'detail__side');
    if (project.approach) main.appendChild(section('Approach', P.el('p', 'detail__text', project.approach)));
    if (project.highlights && project.highlights.length) main.appendChild(section('What I built', textList(project.highlights, 'bullets')));
    if (project.outcome) main.appendChild(section('Outcome', P.el('p', 'detail__text', project.outcome)));

    if (project.role) {
      var role = P.el('div', 'detail__role');
      role.appendChild(P.el('p', 'detail__role-title', project.role.title));
      if (project.role.detail) role.appendChild(P.el('p', '', project.role.detail));
      side.appendChild(section('My role', role));
    }
    if (project.stack && project.stack.length) side.appendChild(section('Built with', textList(project.stack, 'tags')));
    if (project.related) {
      var rel = P.el('a', 'link', project.related.label);
      rel.href = project.related.href;
      rel.addEventListener('click', function (e) {
        var target = document.querySelector(project.related.href);
        if (!target) return;
        e.preventDefault();
        close(false, function () {
          target.scrollIntoView({ behavior: P.mq.reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        });
      });
      var p = P.el('p'); p.appendChild(rel);
      side.appendChild(section('Research', p));
    }
    grid.appendChild(main);
    if (side.children.length) grid.appendChild(side); else grid.classList.add('detail__grid--single');
    content.appendChild(grid);
    content.scrollTop = 0;

    // Previous / next inside the list the visitor is browsing
    var many = list.length > 1;
    kicker.textContent = many ? 'Project ' + (index + 1) + ' of ' + list.length : 'Project';
    prevBtn.hidden = nextBtn.hidden = !many;
    dialog.querySelector('.detail__nav').hidden = !many;
    if (many) {
      prevName.textContent = list[(index + list.length - 1) % list.length].title;
      nextName.textContent = list[(index + 1) % list.length].title;
    }
    try { history.replaceState(null, '', '#project-' + project.id); } catch (e) { /* file:// may refuse; harmless */ }
  }

  function step(delta) {
    index = (index + delta + list.length) % list.length;
    content.classList.remove('is-switching'); void content.offsetWidth; content.classList.add('is-switching');
    render(list[index]);
  }

  /* open(id, { list: [projects], trigger: element }) */
  function open(id, opts) {
    opts = opts || {};
    var project = byId(id);
    if (!project || !dialog) return;
    list = opts.list && opts.list.length ? opts.list : P.data.projects;
    index = Math.max(0, list.indexOf(project));
    if (index < 0 || list[index] !== project) { list = P.data.projects; index = list.indexOf(project); }
    opener = opts.trigger || null;
    if (!dialog.open) {
      try { urlBefore = location.hash && location.hash.indexOf('#project-') !== 0 ? location.hash : ''; } catch (e) { urlBefore = ''; }
    }
    render(project);
    if (!dialog.open) {
      dialog.showModal();
      document.documentElement.classList.add('has-dialog');
      // Grow from the card that was chosen
      var rect = opener && opener.closest('.pcard') ? opener.closest('.pcard').getBoundingClientRect() : null;
      var pr = panel.getBoundingClientRect();
      panel.style.transformOrigin = rect
        ? (rect.left + rect.width / 2 - pr.left) + 'px ' + (rect.top + rect.height / 2 - pr.top) + 'px'
        : '50% 50%';
      dialog.classList.remove('is-closing');
      dialog.classList.add('is-open');
      dialog.querySelector('.detail__close').focus();
    }
  }

  function close(returnFocus, after) {
    if (!dialog || !dialog.open || closing) return;
    closing = true;
    var finish = function () {
      closing = false;
      dialog.classList.remove('is-open', 'is-closing');
      dialog.close();
      document.documentElement.classList.remove('has-dialog');
      try { history.replaceState(null, '', location.pathname + location.search + (urlBefore || '')); } catch (e) { /* ignore */ }
      if (returnFocus !== false && opener) opener.focus({ preventScroll: true });
      opener = null;
      if (after) after();
    };
    if (P.mq.reduceMotion.matches) { finish(); return; }
    dialog.classList.add('is-closing');
    setTimeout(finish, 170);
  }

  function init() {
    dialog = P.$('project-detail');
    if (!dialog || typeof dialog.showModal !== 'function') { dialog = null; return; }
    panel = dialog.querySelector('.detail__panel');
    content = P.$('detail-content');
    kicker = P.$('detail-kicker');
    prevBtn = P.$('detail-prev'); nextBtn = P.$('detail-next');
    prevName = P.$('detail-prev-name'); nextName = P.$('detail-next-name');

    dialog.querySelector('.detail__close').addEventListener('click', function () { close(); });
    prevBtn.addEventListener('click', function () { step(-1); });
    nextBtn.addEventListener('click', function () { step(1); });
    dialog.addEventListener('cancel', function (e) { e.preventDefault(); close(); }); // Escape, with the closing motion
    dialog.addEventListener('click', function (e) { if (e.target === dialog) close(); }); // the dimmed backdrop
    dialog.addEventListener('keydown', function (e) {
      if (e.target.closest && e.target.closest('input, textarea')) return;
      if (e.key === 'ArrowRight' && list.length > 1) { e.preventDefault(); step(1); }
      if (e.key === 'ArrowLeft' && list.length > 1) { e.preventDefault(); step(-1); }
    });
  }

  P.detail = { init: init, open: open, close: close, isOpen: function () { return !!(dialog && dialog.open); } };
})();
