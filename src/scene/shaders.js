/* GLSL for points and lines, plus material factories.
   All materials share one uniforms object (U), so a single write (time, theme, fog) updates every material. */
import { ShaderMaterial, Color, NormalBlending } from 'three';

export function createUniforms() {
  return {
    uTime: { value: 12 }, uSettle: { value: 0 }, uFogNear: { value: 26 }, uFogFar: { value: 105 },
    uScale: { value: 800 }, uInk: { value: new Color(0xf2f2f2) }, uDim: { value: 1 }
  };
}

const COMMON = /* glsl */`
uniform float uTime; uniform float uSettle; uniform float uFogNear; uniform float uFogFar; uniform float uScale;
// Nodes drift a little while the network is "alive"; the drift stops as it settles into a sphere.
vec3 breath(float seed) {
  return 0.25 * (1.0 - uSettle) * vec3(sin(uTime * 0.35 + seed * 6.283), sin(uTime * 0.29 + seed * 12.1), cos(uTime * 0.31 + seed * 3.7));
}
float fogFade(float d) { return (1.0 - smoothstep(uFogNear, uFogFar, d)) * smoothstep(0.6, 3.5, d); }
`;

const POINT_VS = /* glsl */`
${COMMON}
attribute float aSize; attribute float aAlpha;
#ifdef NETWORK
attribute vec3 aSettled; attribute float aSeed;
#endif
varying float vA;
void main() {
  vec3 p = position;
#ifdef NETWORK
  p = mix(position, aSettled, uSettle) + breath(aSeed);
#endif
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float d = -mv.z;
  gl_PointSize = clamp(aSize * uScale / max(d, 0.1), 1.0, 56.0);
  vA = aAlpha * fogFade(d);
}`;

const POINT_FS = /* glsl */`
uniform vec3 uInk; uniform float uAlpha; uniform float uDim;
varying float vA;
void main() {
  vec2 c = gl_PointCoord - 0.5; float r = length(c);
  if (r > 0.5) discard;
  gl_FragColor = vec4(uInk, smoothstep(0.5, 0.3, r) * vA * uAlpha * uDim);
}`;

const LINE_VS = /* glsl */`
${COMMON}
attribute float aAlpha;
#ifdef NETWORK
attribute vec3 aSettled; attribute float aSeed;
#endif
varying float vA;
void main() {
  vec3 p = position;
#ifdef NETWORK
  p = mix(position, aSettled, uSettle) + breath(aSeed);
#endif
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  vA = aAlpha * fogFade(-mv.z);
}`;

const LINE_FS = /* glsl */`
uniform vec3 uInk; uniform float uAlpha; uniform float uDim;
varying float vA;
void main() { gl_FragColor = vec4(uInk, vA * uAlpha * uDim); }`;

function material(U, vs, fs, alpha, kind, defines) {
  const m = new ShaderMaterial({
    uniforms: Object.assign({}, U, { uAlpha: { value: alpha } }),
    vertexShader: vs, fragmentShader: fs, defines: defines || {},
    transparent: true, depthWrite: false, blending: NormalBlending
  });
  m.userData = { base: alpha, kind };
  return m;
}
export const pointMaterial = (U, alpha, defines) => material(U, POINT_VS, POINT_FS, alpha, 'point', defines);
export const lineMaterial = (U, alpha, defines) => material(U, LINE_VS, LINE_FS, alpha, 'line', defines);
