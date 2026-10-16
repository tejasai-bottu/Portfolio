/* Portfolio scene: one procedural Three.js environment, controlled by scroll.

   js/scene/bridge.js turns the scroll position into one number s and calls setProgress(s).
   Every value of s is a fixed composition (see camera.js), so scrolling up plays it backwards.
   Nothing reacts to the mouse.

   Files:  index.js (renderer, loop, API) · network.js (the geometry) · camera.js (the shots)
           shaders.js (materials) · themes.js (colors) · util.js (helpers)
   Build:  `npm run build` bundles these with Three.js into js/vendor/scene.js as a classic
           script that exposes window.PortfolioScene (works from file:// and GitHub Pages). */
import { WebGLRenderer, Scene, PerspectiveCamera } from 'three';
import { rng, clamp, smooth } from './util.js';
import { THEMES } from './themes.js';
import { createUniforms } from './shaders.js';
import { createCameraPath, S_MAX, SETTLE } from './camera.js';
import { buildNetwork } from './network.js';

export function createScene(opts) {
  const canvas = opts.canvas;
  const reduceMotion = !!opts.reduceMotion;
  let dprCap = opts.small ? 1.5 : 1.75;

  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  const scene = new Scene();
  const camera = new PerspectiveCamera(40, 1, 0.1, 400);
  const U = createUniforms();
  const network = buildNetwork(scene, U, rng(20260415), !!opts.small);
  const sample = createCameraPath();

  let sTarget = 0, sCur = 0, first = true, W = 1, H = 1, aspect = 1, gain = { line: 1, point: 1 };
  let time = 12, last = 0, running = false, raf = 0, frozen = reduceMotion, slowFrames = 0;
  let intro = 1, fadeIn = reduceMotion ? 1 : 0;
  const INTRO_OFFSET = [0, 5, 26];

  function setTheme(name) {
    const T = THEMES[name === 'light' ? 'light' : 'dark'];
    renderer.setClearColor(T.bg, 1);
    U.uInk.value.setHex(T.ink);
    gain = { line: T.line, point: T.point };
    requestRender();
  }

  function resize() {
    W = window.innerWidth; H = window.innerHeight; aspect = W / Math.max(H, 1);
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    renderer.setPixelRatio(dpr); renderer.setSize(W, H, false);
    camera.fov = aspect < 0.8 ? 52 : 40; camera.aspect = aspect; camera.updateProjectionMatrix();
    U.uScale.value = (H * dpr / 2) / Math.tan((camera.fov * Math.PI) / 360);
    requestRender();
  }

  function apply(s) {
    const shot = sample(s);
    const p = shot.position.clone();
    if (aspect < 0.8) p.sub(shot.target).multiplyScalar(1.35).add(shot.target); // tall screens: step back
    if (intro < 1) { const k = Math.pow(1 - intro, 3); p.x += INTRO_OFFSET[0] * k; p.y += INTRO_OFFSET[1] * k; p.z += INTRO_OFFSET[2] * k; }
    camera.position.copy(p); camera.lookAt(shot.target);
    // In the hero the network sits right of the name on wide screens.
    const shift = aspect > 1.15 ? 0.13 * (1 - smooth(0.15, 0.7, s)) : 0;
    if (shift > 0.001) camera.setViewOffset(W, H, -shift * W, 0, W, H); else camera.clearViewOffset();
    U.uFogNear.value = shot.near; U.uFogFar.value = shot.far;
    U.uDim.value = shot.dim * fadeIn;
    U.uSettle.value = smooth(SETTLE[0], SETTLE[1], s);
    network.materials.forEach(m => { m.uniforms.uAlpha.value = m.userData.base * gain[m.userData.kind]; });
  }

  function frame(now) {
    raf = 0;
    const dt = last ? Math.min((now - last) / 1000, 0.1) : 0.016; last = now;
    if (!frozen) {
      time += dt;
      slowFrames = dt > 0.05 ? slowFrames + 1 : Math.max(0, slowFrames - 1);
      if (slowFrames > 60) { // keep the page responsive on slow machines
        slowFrames = 0;
        if (dprCap > 1) { dprCap = 1; resize(); } else frozen = true;
      }
    }
    if (intro < 1) intro = Math.min(1, intro + dt / 3.2);
    if (fadeIn < 1) fadeIn = Math.min(1, fadeIn + dt / 1.2);
    sCur += (sTarget - sCur) * (reduceMotion ? 1 : 1 - Math.exp(-dt * 5));
    if (Math.abs(sTarget - sCur) < 1e-4) sCur = sTarget;
    U.uTime.value = time;
    network.update(time, smooth(SETTLE[0], SETTLE[1], sCur));
    apply(sCur);
    renderer.render(scene, camera);
    const busy = sCur !== sTarget || intro < 1 || fadeIn < 1;
    if (running && (!frozen || busy) && !document.hidden) raf = requestAnimationFrame(frame);
    else running = false;
  }
  function requestRender() {
    if (raf) return;
    running = true; last = 0;
    raf = requestAnimationFrame(frame);
  }

  document.addEventListener('visibilitychange', () => { if (!document.hidden) requestRender(); });
  window.addEventListener('resize', resize);
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); running = false; if (opts.onLost) opts.onLost(); });

  resize(); setTheme(opts.theme || 'dark');

  return {
    setProgress(s) {
      sTarget = clamp(s, 0, S_MAX);
      if (first) { first = false; sCur = sTarget; intro = sTarget > 0.05 || reduceMotion ? 1 : 0; }
      requestRender();
    },
    setTheme,
    resize
  };
}
