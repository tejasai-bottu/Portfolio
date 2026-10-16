/* Small page interactions: pausing the journey strip, pointer tilt on the portrait, copy email. */
(function () {
  'use strict';
  var P = window.Portfolio = window.Portfolio || {};

  function journey() {
    var strip = document.querySelector('.journey'), btn = P.$('journey-toggle');
    if (!strip || !btn) return;
    btn.addEventListener('click', function () { // moving content can be paused (WCAG 2.2.2)
      var paused = strip.classList.toggle('is-paused');
      btn.setAttribute('aria-pressed', String(paused));
      btn.setAttribute('aria-label', paused ? 'Play the moving words' : 'Pause the moving words');
    });
  }

  function tilt() {
    var MAX = 4;
    P.all('[data-tilt]').forEach(function (node) {
      var frame = 0, nx = 0, ny = 0;
      function paint() { frame = 0; node.style.setProperty('--tx', (-ny * MAX).toFixed(2) + 'deg'); node.style.setProperty('--ty', (nx * MAX).toFixed(2) + 'deg'); }
      function queue() { if (!frame) frame = requestAnimationFrame(paint); }
      node.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse' || !P.tiltEnabled()) return;
        var r = node.getBoundingClientRect();
        nx = ((e.clientX - r.left) / r.width) * 2 - 1; ny = ((e.clientY - r.top) / r.height) * 2 - 1;
        node.classList.add('is-tilting'); queue();
      });
      node.addEventListener('pointerleave', function () { nx = 0; ny = 0; node.classList.remove('is-tilting'); queue(); });
    });
  }

  function copyEmail() {
    var btn = P.$('copy-email'), status = P.$('copy-status'), timer = 0;
    if (!btn) return;
    btn.addEventListener('click', function () {
      var email = btn.dataset.email;
      function announce(message, label) {
        status.textContent = message; btn.textContent = label;
        clearTimeout(timer); timer = setTimeout(function () { btn.textContent = 'Copy email address'; }, 2200);
      }
      P.copyText(email, function () { announce('Email address copied to the clipboard.', 'Copied'); },
        function () { announce('Copy failed. The address is ' + email + '.', email); });
    });
  }

  P.extras = { init: function () { journey(); tilt(); copyEmail(); } };
})();
