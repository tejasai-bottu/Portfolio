/* The name: two effects.
   1. Decrypt: characters scramble from ciphertext into the name on load, and again every time
      the name comes back into view (so a refresh halfway down the page still plays it).
      Monospaced type, so swapping characters never moves the layout.
   2. Words as 3D objects (from the second portfolio): the word under the pointer lifts and tilts.
   Elements: .cipher (decrypts), [data-fx] inside .hero__copy (words lift). */
(function () {
  'use strict';
  var P = window.Portfolio = window.Portfolio || {};
  var GLYPHS = 'ABCDEF0123456789abcdef#%&*+=/<>$@';
  var heroDone = [], heroFinished = false;

  /* ---------- word split + hover lift ---------- */
  function splitWords(el) {
    if (el.dataset.split) return;
    var frag = document.createDocumentFragment();
    el.textContent.trim().split(/(\s+)/).forEach(function (tok) {
      if (!tok) return;
      if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(' ')); return; }
      var w = P.el('span', 'w'), f = P.el('span', 'w__f', tok);
      w.appendChild(f); frag.appendChild(w);
    });
    el.textContent = '';
    el.appendChild(frag);
    el.dataset.split = '1';
  }

  function wordLift(zone) {
    var current = null, frame = 0, nx = 0, ny = 0, pressed = false, releaseTimer = 0;
    function paint() {
      frame = 0; if (!current) return;
      current.style.setProperty('--wx', nx.toFixed(3)); current.style.setProperty('--wy', ny.toFixed(3));
      current.style.setProperty('--lx', ((nx + 1) / 2).toFixed(3)); current.style.setProperty('--ly', ((ny + 1) / 2).toFixed(3));
    }
    function release() {
      clearTimeout(releaseTimer);
      if (!current) return;
      var w = current; current = null;
      w.classList.remove('is-lit', 'is-touch');
      ['--wx', '--wy', '--lx', '--ly'].forEach(function (p) { w.style.removeProperty(p); });
    }
    function track(w, e) {
      var r = w.getBoundingClientRect();
      nx = P.clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
      ny = P.clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
      if (!frame) frame = requestAnimationFrame(paint);
    }
    function wordAt(e) { var w = e.target && e.target.closest ? e.target.closest('.w') : null; return w && zone.contains(w) ? w : null; }
    function lift(w, touch) { if (current !== w) { release(); current = w; w.classList.add('is-lit'); } w.classList.toggle('is-touch', !!touch); }

    zone.addEventListener('pointermove', function (e) {
      if (P.mq.reduceMotion.matches || (e.pointerType === 'touch' && !pressed)) return;
      var w = wordAt(e);
      if (!w) { if (!pressed) release(); return; }
      lift(w, e.pointerType === 'touch'); track(w, e);
    });
    zone.addEventListener('pointerleave', function () { if (!pressed) release(); });
    zone.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'touch' || P.mq.reduceMotion.matches) return;
      var w = wordAt(e); if (!w) return;
      pressed = true; lift(w, true); track(w, e);
    });
    zone.addEventListener('pointerup', function () { if (!pressed) return; pressed = false; releaseTimer = setTimeout(release, 220); });
    zone.addEventListener('pointercancel', function () { pressed = false; release(); });
    window.addEventListener('scroll', function () { if (pressed) { pressed = false; release(); } }, { passive: true });
    window.addEventListener('blur', release);
  }

  /* ---------- decrypt ---------- */
  function escapeHtml(c) { return c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '&' ? '&amp;' : c; }

  function Cipher(el) {
    this.el = el;
    this.faces = el.dataset.split ? P.all('.w__f', el) : [el];
    this.finals = this.faces.map(function (f) { return f.textContent; });
    this.busy = false; this.armed = true; this.onDone = null;
  }
  Cipher.prototype.run = function (speed) {
    if (this.busy || P.mq.reduceMotion.matches) return;
    var self = this, faces = this.faces, finals = this.finals, settle = [], n = 0;
    finals.forEach(function (word, w) {
      settle[w] = word.split('').map(function (ch) { var t = ch === ' ' ? 0 : (160 + n * 50 + Math.random() * 150) * speed; n++; return t; });
    });
    this.busy = true;
    var start = performance.now(), prev = start, t = 0, lastPaint = -1000;
    function frame(now) {
      t += Math.min(now - prev, 120); prev = now; // a busy main thread pauses the effect instead of skipping it
      if (t - lastPaint > 42) {
        lastPaint = t;
        var done = true;
        faces.forEach(function (face, w) {
          var word = finals[w], html = '', open = false;
          for (var i = 0; i < word.length; i++) {
            var scr = t < settle[w][i];
            if (scr) done = false;
            if (scr && !open) { html += '<span class="is-scrambling">'; open = true; }
            if (!scr && open) { html += '</span>'; open = false; }
            html += scr ? escapeHtml(GLYPHS.charAt((Math.random() * GLYPHS.length) | 0)) : escapeHtml(word.charAt(i));
          }
          if (open) html += '</span>';
          face.innerHTML = html;
        });
        if (done) {
          faces.forEach(function (face, w) { face.textContent = finals[w]; });
          self.busy = false;
          if (self.onDone) { var cb = self.onDone; self.onDone = null; cb(); }
          return;
        }
      }
      requestAnimationFrame(frame);
    }
    frame(start); // the first ciphertext frame right away: no flash of the plain name
  };

  function heroFinish() {
    if (heroFinished) return;
    heroFinished = true;
    heroDone.forEach(function (fn) { fn(); });
  }

  function init() {
    var zone = document.querySelector('.hero__copy');
    var groups = zone ? P.all('[data-fx]', zone) : [];
    if (!P.mq.reduceMotion.matches) groups.forEach(splitWords);
    if (zone) wordLift(zone);

    var ciphers = P.all('.cipher').map(function (el) { return new Cipher(el); });
    function inView(el) { var r = el.getBoundingClientRect(); return r.height > 0 && r.bottom > 0 && r.top < window.innerHeight; }
    ciphers.forEach(function (c) { if (inView(c.el)) { c.armed = false; c.run(1.25); } });

    var hero = ciphers.filter(function (c) { return c.el.id === 'cipher'; })[0];
    if (hero && hero.busy) hero.onDone = heroFinish; else setTimeout(heroFinish, 0);

    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var c = ciphers.filter(function (x) { return x.el === en.target; })[0];
          if (!c) return;
          if (!en.isIntersecting) { c.armed = true; return; } // fully off screen: play again next time
          if (en.intersectionRatio >= 0.5 && c.armed) { c.armed = false; c.run(1.25); }
        });
      }, { threshold: [0, 0.5] });
      ciphers.forEach(function (c) { obs.observe(c.el); });
    }
  }

  // onHeroDone(fn): runs fn once the name has finished its first decrypt (or right away if it can't play).
  P.name = { init: init, onHeroDone: function (fn) { if (heroFinished) fn(); else heroDone.push(fn); } };
})();
