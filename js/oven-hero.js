// 3D hero: double-stack conveyor pizza oven (generic model, no brand marks).
// Mount: <div class="oven-hero-canvas" data-oven-hero></div> inside section.hero.hero-3d
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const mount = document.querySelector('[data-oven-hero]');
if (mount) init(mount);

function init(mount) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch (e) { return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);

  // ---------- materials ----------
  const brushed = makeBrushedTexture();
  const steel = new THREE.MeshStandardMaterial({ color: 0xdfe2e6, metalness: 0.6, roughness: 0.32, map: brushed });
  const steelDark = new THREE.MeshStandardMaterial({ color: 0xb4b8be, metalness: 0.6, roughness: 0.4, map: brushed });
  const steelEdge = new THREE.MeshStandardMaterial({ color: 0xe2e4e7, metalness: 0.9, roughness: 0.25 });
  const black = new THREE.MeshStandardMaterial({ color: 0x15171a, metalness: 0.3, roughness: 0.6 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x0d0f12, metalness: 0.4, roughness: 0.08, emissive: 0xff7a2a, emissiveIntensity: 0.04 });
  const screen = new THREE.MeshStandardMaterial({ color: 0x0b1726, emissive: 0x3aa0ff, emissiveIntensity: 0.9, roughness: 0.3 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: 0.9 });
  const beltTex = makeBeltTexture();
  const belt = new THREE.MeshStandardMaterial({ map: beltTex, alphaMap: beltTex, transparent: true, alphaTest: 0.35, metalness: 0.8, roughness: 0.4, side: THREE.DoubleSide });

  // ---------- dimensions (metres) ----------
  const BODY_W = 1.75, BODY_D = 1.15, DECK_H = 0.5, BELT_EXT = 0.55, BELT_D = 0.82;
  const BASE_Y = 0.62; // top of the stand
  const oven = new THREE.Group();
  const belts = [];

  for (let i = 0; i < 2; i++) {
    const y = BASE_Y + i * (DECK_H + 0.02);
    oven.add(deck(y));
  }

  function deck(y) {
    const g = new THREE.Group();
    // main cabinet
    const body = box(BODY_W, DECK_H, BODY_D, steel); body.position.set(0, y + DECK_H / 2, 0); g.add(body);
    // top lip / trim
    const trim = box(BODY_W + 0.02, 0.025, BODY_D + 0.02, steelEdge); trim.position.set(0, y + DECK_H - 0.012, 0); g.add(trim);
    // front window door (centre-right of front face)
    const door = box(1.0, 0.3, 0.03, steelDark); door.position.set(0.05, y + 0.27, BODY_D / 2 + 0.015); g.add(door);
    const win = box(0.82, 0.14, 0.02, glass); win.position.set(0.05, y + 0.29, BODY_D / 2 + 0.032); g.add(win);
    const handle = box(0.86, 0.02, 0.04, steelEdge); handle.position.set(0.05, y + 0.39, BODY_D / 2 + 0.05); g.add(handle);
    // control panel (left of front face)
    const panel = box(0.32, 0.42, 0.02, steelDark); panel.position.set(-0.68, y + 0.25, BODY_D / 2 + 0.01); g.add(panel);
    const scr = box(0.13, 0.11, 0.015, screen); scr.position.set(-0.68, y + 0.36, BODY_D / 2 + 0.025); g.add(scr);
    const sw = box(0.09, 0.09, 0.03, black); sw.position.set(-0.68, y + 0.17, BODY_D / 2 + 0.03); g.add(sw);
    // right badge + small switch
    const badge = box(0.16, 0.07, 0.012, black); badge.position.set(0.74, y + 0.4, BODY_D / 2 + 0.008); g.add(badge);
    const sw2 = box(0.06, 0.06, 0.025, black); sw2.position.set(0.74, y + 0.22, BODY_D / 2 + 0.014); g.add(sw2);
    // vent louvres on the end panels
    for (const sx of [-1, 1]) {
      for (let k = 0; k < 6; k++) {
        const l = box(0.005, 0.012, 0.32, black); l.position.set(sx * (BODY_W / 2 + 0.003), y + 0.38 - k * 0.028, -0.3); g.add(l);
      }
    }
    // belt running through, sticking out both ends
    const beltLen = BODY_W + BELT_EXT * 2;
    const beltMesh = new THREE.Mesh(new THREE.PlaneGeometry(beltLen, BELT_D), belt);
    beltMesh.rotation.x = -Math.PI / 2; beltMesh.position.set(0, y + 0.14, 0.02); beltMesh.castShadow = true; g.add(beltMesh);
    belts.push(beltMesh);
    // belt side rails + crumb trays under the extensions
    for (const sx of [-1, 1]) {
      const cx = sx * (BODY_W / 2 + BELT_EXT / 2);
      for (const sz of [-1, 1]) {
        const rail = box(BELT_EXT, 0.03, 0.02, steelEdge); rail.position.set(cx, y + 0.135, sz * (BELT_D / 2 + 0.01) + 0.02); g.add(rail);
      }
      const tray = box(BELT_EXT - 0.04, 0.012, BELT_D - 0.04, steelDark); tray.position.set(cx, y + 0.07, 0.02); g.add(tray);
      // end plug (the slotted panel below the belt opening)
      const plug = box(0.02, 0.1, BELT_D, steel); plug.position.set(sx * (BODY_W / 2 + BELT_EXT - 0.01), y + 0.09, 0.02); g.add(plug);
    }
    // left-end window box (the hinged access panel seen in the reference photos)
    const access = box(0.36, 0.28, BELT_D + 0.12, steel); access.position.set(-BODY_W / 2 - 0.02, y + 0.3, 0.02); access.scale.x = 0.25; g.add(access);
    return g;
  }

  // stand: frame + four legs with casters
  const standFrame = box(BODY_W - 0.1, 0.06, BODY_D - 0.15, steelDark); standFrame.position.set(0, BASE_Y - 0.03, 0); oven.add(standFrame);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, BASE_Y - 0.1, 24), steel);
    leg.position.set(sx * (BODY_W / 2 - 0.2), (BASE_Y - 0.1) / 2 + 0.08, sz * (BODY_D / 2 - 0.2)); leg.castShadow = true; oven.add(leg);
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.04, 16), steelDark);
    cup.position.set(leg.position.x, 0.09, leg.position.z); oven.add(cup);
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 20), rubber);
    wheel.rotation.z = Math.PI / 2; wheel.position.set(leg.position.x, 0.045, leg.position.z); oven.add(wheel);
  }
  oven.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  oven.position.y = -0.85;
  scene.add(oven);

  // floor that only catches shadow
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.ShadowMaterial({ opacity: 0.35 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -0.85; floor.receiveShadow = true; scene.add(floor);

  // lights
  scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x1a1d24, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(3, 5, 4); key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 1, far: 15 });
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffd9a0, 1.0); rim.position.set(-4, 2, -3); scene.add(rim);
  

  // ---------- layout / camera ----------
  function layout() {
    const w = mount.clientWidth, h = mount.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const narrow = w < 768;
    // wide screens: oven sits right of the headline; phones: centred, further back
    camera.fov = narrow ? 38 : 30;
    camera.position.set(narrow ? 0.9 : 0.2, narrow ? 1.3 : 1.15, narrow ? 5.6 : 5.6);
    camera.lookAt(narrow ? 0 : -1.9, narrow ? -0.05 : 0.0, 0);
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(layout).observe(mount);
  layout();

  // ---------- animation ----------
  let visible = true, t0 = performance.now();
  const io = new IntersectionObserver((e) => { visible = e[0].isIntersecting; });
  io.observe(mount);
  let px = 0;
  window.addEventListener('pointermove', (e) => { px = (e.clientX / window.innerWidth - 0.5); }, { passive: true });

  function tick(now) {
    const t = (now - t0) / 1000;
    oven.rotation.y = -0.32 + Math.sin(t * 0.25) * 0.1 + px * 0.12;
    beltTex.offset.x = -t * 0.08;
    glass.emissiveIntensity = 0.04 + Math.sin(t * 2.1) * 0.015;
    renderer.render(scene, camera);
  }
  if (reduced) {
    oven.rotation.y = -0.32;
    renderer.render(scene, camera);
    new ResizeObserver(() => renderer.render(scene, camera)).observe(mount);
  } else {
    renderer.setAnimationLoop((now) => { if (visible && !document.hidden) tick(now); });
    tick(performance.now());
    window.__ovenHero = { tick, renderer, scene, camera };
  }
  mount.classList.add('is-ready');

  // ---------- helpers ----------
  function box(w, h, d, mat) { return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); }

  function makeBrushedTexture() {
    const c = document.createElement('canvas'); c.width = 256; c.height = 256;
    const x = c.getContext('2d');
    x.fillStyle = '#d4d6da'; x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 900; i++) {
      const yy = Math.random() * 256, a = Math.random() * 0.08;
      x.fillStyle = `rgba(${Math.random() < 0.5 ? '255,255,255' : '90,95,105'},${a})`;
      x.fillRect(0, yy, 256, 1);
    }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  function makeBeltTexture() {
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
}
