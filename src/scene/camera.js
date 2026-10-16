/* The camera script. Each row is one moment of the scroll story (s = 0 … 6, matched to page
   sections in js/scene/bridge.js). The camera interpolates between rows along a smooth curve.
     p     camera position        t     the point it looks at
     hold  ease into and out of this shot (0 = pass straight through)
     dim   scene brightness (low behind content so text stays easy to read)
     fog   [near, far] distance fade */
import { Vector3, CatmullRomCurve3 } from 'three';
import { clamp, lerp } from './util.js';

export const KEYS = [
  { s: 0.00, p: [0, 2.5, 44], t: [0, 0, 0], hold: 1, dim: 1.0, fog: [26, 105] },    // hero: the network from outside
  { s: 0.55, p: [2.5, 0.8, 7], t: [0, 0, -30], hold: 0, dim: 0.85, fog: [8, 70] },  // flying through it
  { s: 1.00, p: [-16, 7, -30], t: [0, 0, 0], hold: 1, dim: 0.34, fog: [20, 95] },   // about: looking back from the far side
  { s: 2.00, p: [-38, 18, 12], t: [0, 0, 0], hold: 1, dim: 0.3, fog: [28, 120] },   // projects
  { s: 3.00, p: [28, -12, 36], t: [0, 0, 0], hold: 1, dim: 0.3, fog: [28, 120] },   // research and experience
  { s: 4.00, p: [42, 14, -6], t: [0, 0, 0], hold: 1, dim: 0.32, fog: [28, 120] },   // skills and education
  { s: 5.00, p: [0, 0, 34], t: [0, 0, 0], hold: 1, dim: 0.62, fog: [20, 80] },      // contact: the network settles
  { s: 6.00, p: [0, 0, 30.5], t: [0, 0, 0], hold: 1, dim: 0.62, fog: [20, 80] }
];
export const S_MAX = KEYS[KEYS.length - 1].s;
export const SETTLE = [4.55, 5.3]; // s range in which the network settles into a sphere

export function createCameraPath() {
  const pos = new CatmullRomCurve3(KEYS.map(k => new Vector3().fromArray(k.p)), false, 'centripetal');
  const tgt = new CatmullRomCurve3(KEYS.map(k => new Vector3().fromArray(k.t)), false, 'centripetal');
  const out = { position: new Vector3(), target: new Vector3(), dim: 1, near: 26, far: 105 };

  // Sample the shot at scroll moment s.
  return function sample(s) {
    s = clamp(s, 0, S_MAX);
    let i = 0; while (i < KEYS.length - 2 && s > KEYS[i + 1].s) i++;
    const A = KEYS[i], B = KEYS[i + 1];
    let f = clamp((s - A.s) / (B.s - A.s), 0, 1);
    if (A.hold && B.hold) f = f * f * (3 - 2 * f); else if (A.hold) f = f * f; else if (B.hold) f = 1 - (1 - f) * (1 - f);
    const u = (i + f) / (KEYS.length - 1);
    pos.getPoint(u, out.position); tgt.getPoint(u, out.target);
    out.dim = lerp(A.dim, B.dim, f); out.near = lerp(A.fog[0], B.fog[0], f); out.far = lerp(A.fog[1], B.fog[1], f);
    return out;
  };
}
