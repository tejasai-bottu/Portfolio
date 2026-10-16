/* Connects the page to the 3D scene (js/vendor/scene.js, built from src/scene/).
   The scroll position becomes one number, s, and each value of s is a fixed camera moment:
     0 hero · 1 about · 2 projects · 3 research · 4 skills · 5 contact · 6 page end
   To move a moment, change the anchors below; to change the shots, edit src/scene/camera.js. */
(function () {
  'use strict';
  var P = window.Portfolio = window.Portfolio || {};
  var scene = null, anchors = [], frame = 0;

  function docTop(id) {
    var el = P.$(id);
    return el ? el.getBoundingClientRect().top + (window.scrollY || window.pageYOffset) : 0;
  }
  function computeAnchors() {
    var vh = window.innerHeight, max = Math.max(1, document.documentElement.scrollHeight - vh);
    var a = [
      0,
      docTop('about') - vh * 0.35,
      docTop('projects') - vh * 0.2,
      docTop('research') - vh * 0.2,
      docTop('skills') - vh * 0.2,
      docTop('contact') - vh * 0.25,
      max
    ];
    for (var i = 1; i < a.length; i++) { a[i] = Math.min(a[i], max); if (a[i] <= a[i - 1]) a[i] = a[i - 1] + 1; }
    anchors = a;
  }
  function storyAt(y) {
    for (var i = 0; i < anchors.length - 1; i++) {
      if (y < anchors[i + 1]) return i + P.clamp((y - anchors[i]) / (anchors[i + 1] - anchors[i]), 0, 1);
    }
    return anchors.length - 1;
  }
  function update() { frame = 0; if (scene) scene.setProgress(storyAt(window.scrollY || window.pageYOffset)); }
  function queue() { if (!frame) frame = requestAnimationFrame(update); }
  function relayout() { computeAnchors(); queue(); }

  function webgl() {
    try {
      var c = document.createElement('canvas'), gl = c.getContext('webgl2') || c.getContext('webgl');
      if (!gl) return null;
      var info = gl.getExtension('WEBGL_debug_renderer_info');
      var name = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
      return { software: /swiftshader|llvmpipe|software/i.test(name) };
    } catch (e) { return null; }
  }

  function start() {
    var host = P.$('scene'), canvas = P.$('scene-canvas');
    function fallback() { host.classList.add('is-fallback'); host.classList.remove('is-ready'); scene = null; }
    var gl = webgl(), saveData = navigator.connection && navigator.connection.saveData;
    if (!window.PortfolioScene || !gl || saveData) { fallback(); return; }
    try {
      scene = window.PortfolioScene.createScene({
        canvas: canvas, theme: P.theme.current(), reduceMotion: P.mq.reduceMotion.matches,
        small: gl.software || window.innerWidth < 700 || !P.mq.finePointer.matches,
        onLost: fallback
      });
      host.classList.add('is-ready');
    } catch (err) { fallback(); return; }
    P.theme.onChange(function (t) { if (scene) scene.setTheme(t); });
    relayout();
  }

  function init() {
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', relayout);
    window.addEventListener('load', relayout);
    if ('ResizeObserver' in window) new ResizeObserver(relayout).observe(document.body);
    computeAnchors();
    // The name decrypts first; then the network fades in and the camera glides into place.
    var started = false;
    function go() { if (!started) { started = true; start(); } }
    if (P.name) P.name.onHeroDone(go);
    setTimeout(go, 1800); // safety net
  }

  P.scene = { init: init };
})();
