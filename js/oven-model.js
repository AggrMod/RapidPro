// Shared 3D model of a stacked conveyor pizza oven (generic, no third-party marks).
// buildOven(THREE, { decks: 2, badge: 'rapidpro' | 'blank' })
// Returns { group, beltTex, glass, screens: [Material per deck], switches: [Mesh per deck], dims }
export function buildOven(THREE, opts = {}) {
  const decks = opts.decks || 2;
  const brushed = makeBrushedTexture(THREE);
  const steel = new THREE.MeshStandardMaterial({ color: 0xdfe2e6, metalness: 0.6, roughness: 0.32, map: brushed });
  const steelDark = new THREE.MeshStandardMaterial({ color: 0xb4b8be, metalness: 0.6, roughness: 0.4, map: brushed });
  const steelEdge = new THREE.MeshStandardMaterial({ color: 0xe2e4e7, metalness: 0.9, roughness: 0.25 });
  const black = new THREE.MeshStandardMaterial({ color: 0x15171a, metalness: 0.3, roughness: 0.6 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x1c2128, metalness: 0.5, roughness: 0.06, emissive: 0xffb070, emissiveIntensity: 0.03 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: 0.9 });
  const badgeMat = opts.badge === 'rapidpro'
    ? new THREE.MeshStandardMaterial({ map: makeBadgeTexture(THREE), roughness: 0.35, metalness: 0.3 })
    : black;
  const beltTex = makeBeltTexture(THREE);
  const belt = new THREE.MeshStandardMaterial({ map: beltTex, alphaMap: beltTex, transparent: true, alphaTest: 0.35, metalness: 0.8, roughness: 0.4, side: THREE.DoubleSide });

  const BODY_W = 1.75, BODY_D = 1.15, DECK_H = 0.5, BELT_EXT = 0.55, BELT_D = 0.82, BASE_Y = 0.62;
  const FZ = BODY_D / 2;
  const group = new THREE.Group();
  const screens = [], switches = [];
  const box = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);

  for (let i = 0; i < decks; i++) group.add(deck(BASE_Y + i * (DECK_H + 0.02)));

  function deck(y) {
    const g = new THREE.Group();
    const add = (m, x, yy, z) => { m.position.set(x, yy, z); g.add(m); return m; };
    add(box(BODY_W, DECK_H, BODY_D, steel), 0, y + DECK_H / 2, 0);
    add(box(BODY_W + 0.02, 0.025, BODY_D + 0.02, steelEdge), 0, y + DECK_H - 0.012, 0);
    // recessed window door with handle bar
    add(box(0.78, 0.3, 0.025, steelEdge), 0, y + 0.29, FZ + 0.012);
    add(box(0.72, 0.25, 0.02, steelDark), 0, y + 0.285, FZ + 0.026);
    add(box(0.54, 0.13, 0.008, black), 0, y + 0.285, FZ + 0.034);
    add(box(0.5, 0.1, 0.012, glass), 0, y + 0.285, FZ + 0.038);
    const handle = add(new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.6, 12), steelEdge), 0, y + 0.42, FZ + 0.06);
    handle.rotation.z = Math.PI / 2;
    for (const hx of [-0.3, 0.3]) add(box(0.02, 0.02, 0.05, steelEdge), hx, y + 0.42, FZ + 0.035);
    add(box(BODY_W - 0.04, 0.006, 0.006, black), 0, y + 0.13, FZ + 0.003);
    // control panel: bezelled screen + power switch (screen material per deck so it can change state)
    const screenMat = new THREE.MeshStandardMaterial({ color: 0x0b1726, emissive: 0x3aa0ff, emissiveIntensity: 0.9, roughness: 0.3 });
    screens.push(screenMat);
    add(box(0.17, 0.15, 0.02, black), -0.62, y + 0.34, FZ + 0.01);
    add(box(0.13, 0.11, 0.01, screenMat), -0.62, y + 0.34, FZ + 0.022);
    add(box(0.11, 0.11, 0.012, steelEdge), -0.62, y + 0.17, FZ + 0.006);
    switches.push(add(box(0.07, 0.07, 0.03, black), -0.62, y + 0.17, FZ + 0.02));
    // badge plate (front face only carries the texture) + second switch
    add(box(0.26, 0.09, 0.012, [black, black, black, black, badgeMat, black]), 0.6, y + 0.36, FZ + 0.006);
    add(box(0.1, 0.1, 0.012, steelEdge), 0.6, y + 0.18, FZ + 0.006);
    add(box(0.06, 0.06, 0.025, black), 0.6, y + 0.18, FZ + 0.018);
    // louvres on the ends
    for (const sx of [-1, 1]) for (let k = 0; k < 6; k++) add(box(0.005, 0.012, 0.32, black), sx * (BODY_W / 2 + 0.003), y + 0.38 - k * 0.028, -0.3);
    // belt through the oven, out both ends
    const beltMesh = add(new THREE.Mesh(new THREE.PlaneGeometry(BODY_W + BELT_EXT * 2, BELT_D), belt), 0, y + 0.14, 0.02);
    beltMesh.rotation.x = -Math.PI / 2;
    for (const sx of [-1, 1]) {
      const cx = sx * (BODY_W / 2 + BELT_EXT / 2);
      for (const sz of [-1, 1]) add(box(BELT_EXT, 0.03, 0.02, steelEdge), cx, y + 0.135, sz * (BELT_D / 2 + 0.01) + 0.02);
      add(box(BELT_EXT - 0.04, 0.012, BELT_D - 0.04, steelDark), cx, y + 0.07, 0.02);
      add(box(0.02, 0.1, BELT_D, steel), sx * (BODY_W / 2 + BELT_EXT - 0.01), y + 0.09, 0.02);
      add(box(0.12, 0.2, BELT_D + 0.1, steel), sx * (BODY_W / 2 + 0.06), y + 0.3, 0.02);
      add(box(0.14, 0.015, BELT_D + 0.12, steelEdge), sx * (BODY_W / 2 + 0.07), y + 0.405, 0.02);
    }
    return g;
  }

  // stand: frame + square legs + casters
  const frame = box(BODY_W - 0.1, 0.06, BODY_D - 0.15, steelDark); frame.position.set(0, BASE_Y - 0.03, 0); group.add(frame);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const x = sx * (BODY_W / 2 - 0.2), z = sz * (BODY_D / 2 - 0.2);
    const leg = box(0.14, BASE_Y - 0.1, 0.14, steel); leg.position.set(x, (BASE_Y - 0.1) / 2 + 0.08, z); group.add(leg);
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.04, 16), steelDark); cup.position.set(x, 0.09, z); group.add(cup);
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 20), rubber); wheel.rotation.z = Math.PI / 2; wheel.position.set(x, 0.045, z); group.add(wheel);
  }
  group.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });

  return { group, beltTex, glass, screens, switches, dims: { BODY_W, BODY_D, DECK_H, BELT_EXT, BELT_D, BASE_Y, FZ } };
}

export function makeWatermarkTexture(THREE) {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 128;
  const x = c.getContext('2d');
  x.fillStyle = 'rgba(255,255,255,0.16)'; x.font = '700 64px Arial, Helvetica, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText('RAPIDPROMEMPHIS.COM', 512, 66);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

function makeBrushedTexture(THREE) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const x = c.getContext('2d');
  x.fillStyle = '#d4d6da'; x.fillRect(0, 0, 256, 256);
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647); // deterministic, so video frames match
  for (let i = 0; i < 900; i++) {
    x.fillStyle = `rgba(${rnd() < 0.5 ? '255,255,255' : '90,95,105'},${rnd() * 0.08})`;
    x.fillRect(0, rnd() * 256, 256, 1);
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeBadgeTexture(THREE) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 176;
  const x = c.getContext('2d');
  x.fillStyle = '#121418'; x.fillRect(0, 0, 512, 176);
  x.fillStyle = '#c8202a'; x.fillRect(0, 0, 512, 22);
  x.fillStyle = '#f5b301'; x.font = '800 72px Arial, Helvetica, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText('RAPID PRO', 256, 92);
  x.fillStyle = '#e6e8eb'; x.font = '600 30px Arial, Helvetica, sans-serif';
  x.fillText('rapidpromemphis.com', 256, 148);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

function makeBeltTexture(THREE) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128;
  const x = c.getContext('2d');
  x.fillStyle = '#000'; x.fillRect(0, 0, 256, 128);
  x.strokeStyle = '#fff'; x.lineWidth = 3;
  for (let i = 0; i <= 256; i += 16) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 128); x.stroke(); }
  x.lineWidth = 2;
  for (let j = 0; j <= 128; j += 10) { x.beginPath(); x.moveTo(0, j); x.lineTo(256, j); x.stroke(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(9, 3);
  return t;
}
