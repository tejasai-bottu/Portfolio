/* Starts everything, in order. Each feature lives in its own file:
     js/core.js               shared helpers (window.Portfolio)
     js/data/projects.js      project + category content   ← edit projects here
     js/projects/*.js         visuals, filters, card, detail view, grid
     js/ui/*.js               theme, header, name effects, reveal, small extras
     js/scene/bridge.js       scroll → 3D scene
   Without JavaScript the page still reads top to bottom; the project grid and the 3D scene need it. */
(function () {
  'use strict';
  var P = window.Portfolio;
  function safely(name, fn) { try { fn(); } catch (e) { if (window.console) console.error('[portfolio] ' + name + ' failed:', e); } }

  safely('theme', P.theme.init);
  safely('header', P.header.init);
  safely('name', P.name.init);          // early: the decrypt starts on the first frame
  safely('projects', function () { P.detail.init(); P.grid.init(); });
  safely('reveal', P.reveal.init);
  safely('extras', P.extras.init);
  safely('scene', P.scene.init);
})();
