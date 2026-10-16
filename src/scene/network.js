/* The living network: nodes, the edges between nearest neighbours, and packets travelling
   along the edges. Every node also knows its "settled" position on a sphere (radius 12);
   uSettle blends between the two for the final reveal at the contact section. */
import { BufferGeometry, Points, LineSegments } from 'three';
import { lerp, attr } from './util.js';
import { pointMaterial, lineMaterial } from './shaders.js';

export function buildNetwork(scene, U, rand, small) {
  const N = small ? 420 : 640;
  const org = new Float32Array(N * 3), set = new Float32Array(N * 3), seed = new Float32Array(N);
  const size = new Float32Array(N), alpha = new Float32Array(N);
  const materials = [];

  for (let i = 0; i < N; i++) {
    const u = rand() * 2 - 1, th = rand() * Math.PI * 2, sq = Math.sqrt(1 - u * u);
    const dir = [sq * Math.cos(th), u, sq * Math.sin(th)];
    const r = 5.5 + 9.5 * Math.pow(rand(), 0.55);
    for (let k = 0; k < 3; k++) { org[i * 3 + k] = dir[k] * r; set[i * 3 + k] = dir[k] * 12; }
    seed[i] = rand();
    const hub = rand() < 0.05;
    size[i] = hub ? 0.34 : 0.1 + rand() * 0.1;
    alpha[i] = hub ? 1 : 0.55 + rand() * 0.45;
  }

  // Edges: each node to its three nearest neighbours, without duplicates.
  const seen = new Set(), edges = [];
  for (let i = 0; i < N; i++) {
    const near = [];
    for (let j = 0; j < N; j++) {
      if (j === i) continue;
      const dx = org[i * 3] - org[j * 3], dy = org[i * 3 + 1] - org[j * 3 + 1], dz = org[i * 3 + 2] - org[j * 3 + 2];
      const d = dx * dx + dy * dy + dz * dz;
      if (d < 26) near.push([d, j]);
    }
    near.sort((a, b) => a[0] - b[0]);
    for (let k = 0; k < Math.min(3, near.length); k++) {
      const j = near[k][1], key = i < j ? i + ':' + j : j + ':' + i;
      if (!seen.has(key)) { seen.add(key); edges.push([i, j]); }
    }
  }

  // Nodes
  const ng = new BufferGeometry();
  attr(ng, 'position', org, 3); attr(ng, 'aSettled', set, 3); attr(ng, 'aSeed', seed, 1);
  attr(ng, 'aSize', size, 1); attr(ng, 'aAlpha', alpha, 1);
  const nm = pointMaterial(U, 0.9, { NETWORK: '' }); materials.push(nm);
  const nodes = new Points(ng, nm); nodes.frustumCulled = false; scene.add(nodes);

  // Edges
  const E = edges.length;
  const lp = new Float32Array(E * 6), ls = new Float32Array(E * 6), lseed = new Float32Array(E * 2), la = new Float32Array(E * 2);
  edges.forEach(([a, b], e) => {
    for (let k = 0; k < 3; k++) {
      lp[e * 6 + k] = org[a * 3 + k]; lp[e * 6 + 3 + k] = org[b * 3 + k];
      ls[e * 6 + k] = set[a * 3 + k]; ls[e * 6 + 3 + k] = set[b * 3 + k];
    }
    lseed[e * 2] = seed[a]; lseed[e * 2 + 1] = seed[b];
    la[e * 2] = la[e * 2 + 1] = 0.35 + rand() * 0.65;
  });
  const lg = new BufferGeometry();
  attr(lg, 'position', lp, 3); attr(lg, 'aSettled', ls, 3); attr(lg, 'aSeed', lseed, 1); attr(lg, 'aAlpha', la, 1);
  const lm = lineMaterial(U, 0.2, { NETWORK: '' }); materials.push(lm);
  const lines = new LineSegments(lg, lm); lines.frustumCulled = false; scene.add(lines);

  // Packets: positions computed here with the same drift as the shader, so they stay on their edges.
  const NP = small ? 90 : 160;
  const pEdge = [], pPhase = [], pSpeed = [];
  const pPos = new Float32Array(NP * 3), pAlpha = new Float32Array(NP);
  for (let i = 0; i < NP; i++) { pEdge.push(edges[(rand() * E) | 0]); pPhase.push(rand()); pSpeed.push(0.12 + rand() * 0.22); }
  const pg = new BufferGeometry();
  attr(pg, 'position', pPos, 3); attr(pg, 'aSize', new Float32Array(NP).fill(0.2), 1); attr(pg, 'aAlpha', pAlpha, 1);
  const pm = pointMaterial(U, 1); materials.push(pm);
  const packets = new Points(pg, pm); packets.frustumCulled = false; scene.add(packets);

  const A = [0, 0, 0], B = [0, 0, 0];
  function nodeAt(i, out, time, settle) {
    const s = seed[i], b = 0.25 * (1 - settle);
    out[0] = lerp(org[i * 3], set[i * 3], settle) + b * Math.sin(time * 0.35 + s * 6.283);
    out[1] = lerp(org[i * 3 + 1], set[i * 3 + 1], settle) + b * Math.sin(time * 0.29 + s * 12.1);
    out[2] = lerp(org[i * 3 + 2], set[i * 3 + 2], settle) + b * Math.cos(time * 0.31 + s * 3.7);
  }

  return {
    materials,
    update(time, settle) {
      for (let i = 0; i < NP; i++) {
        const t = (pPhase[i] + time * pSpeed[i]) % 1, e = pEdge[i];
        nodeAt(e[0], A, time, settle); nodeAt(e[1], B, time, settle);
        for (let k = 0; k < 3; k++) pPos[i * 3 + k] = lerp(A[k], B[k], t);
        pAlpha[i] = Math.sin(Math.PI * t) * 0.95;
      }
      pg.attributes.position.needsUpdate = true; pg.attributes.aAlpha.needsUpdate = true;
    }
  };
}
