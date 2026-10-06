// 3D story hero: an operator switches on a conveyor oven, it throws an error and smokes,
// the operator panics and calls Rapid Pro. Every frame is a pure function of time (seek(t)),
// so the same code drives the live hero, screenshots and frame-by-frame video export.
// Mount: <div class="oven-hero-canvas" data-oven-story></div>
// URL flags: ?seek=7.5 freezes on one moment; ?frame=video renders full-bleed for capture.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildOven } from './oven-model.js?v=5';

const LOOP = 12;
const mount = document.querySelector('[data-oven-story]');
if (mount) init(mount);

function init(mount) {
  const params = new URLSearchParams(location.search);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const videoMode = params.get('frame') === 'video';
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: !videoMode, preserveDrawingBuffer: videoMode, powerPreference: 'low-power' });
  } catch (e) { return; }
  renderer.setPixelRatio(videoMode ? 1 : Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  if (videoMode) scene.background = new THREE.Color(0x1b2331);
  scene.fog = new THREE.Fog(0x1b2331, 7, 15);
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);

  // ---------- oven (blank badge: the broken oven is not ours) ----------
  const oven = buildOven(THREE, { decks: 2, badge: 'blank' });
  oven.group.rotation.y = -0.18;
  scene.add(oven.group);
  const ovenBase = oven.group.position.clone();

  // tiled kitchen floor + shadow
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.MeshStandardMaterial({ map: makeTileTexture(), roughness: 0.55, metalness: 0.05 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

  // ---------- operator (stylised, toy proportions) ----------
  const op = buildOperator();
  scene.add(op.root);

  // ---------- smoke ----------
  const smokeTex = makeSmokeTexture();
  const puffs = [];
  const sources = [];
  for (const deckY of [0.62 + 0.3, 0.62 + 0.52 + 0.3]) for (const sx of [-1, 1]) sources.push(new THREE.Vector3(sx * 0.95, deckY + 0.08, 0.02));
  const PUFFS = window.innerWidth < 768 ? 16 : 28;
  for (let i = 0; i < PUFFS; i++) {
    const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, transparent: true, depthWrite: false, opacity: 0 }));
    oven.group.add(m);
    puffs.push({ m, src: sources[i % sources.length], phase: (i * 0.618) % 1, drift: ((i * 37) % 11) / 11 - 0.5 });
  }

  // ---------- floating text ----------
  const alarm = textSprite(['!?'], { w: 256, h: 256, bg: null, color: '#ffcc00', font: '900 170px Arial', stroke: '#1b1b1b' });
  alarm.scale.set(0.42, 0.42, 1); scene.add(alarm);
  const bubble = textSprite(['Rapid Pro? My oven', "won't run!"], { w: 640, h: 260, bg: '#ffffff', color: '#1b2331', font: '700 54px Arial', radius: 40, tail: true });
  bubble.scale.set(1.2, 0.49, 1); scene.add(bubble);
  const card = textSprite(['OVEN DOWN?', 'CALL RAPID PRO', '(901) 257-9417', 'rapidpromemphis.com'], {
    w: 1024, h: 600, bg: 'rgba(17,24,39,0.92)', color: '#ffffff', radius: 36, border: '#f5b301',
    lines: [{ font: '800 92px Arial', color: '#ffffff' }, { font: '900 104px Arial', color: '#f5b301' }, { font: '800 96px Arial', color: '#ffffff' }, { font: '600 46px Arial', color: '#c9d1dc' }],
  });
  card.scale.set(1.75, 1.03, 1); scene.add(card);

  // ---------- lights ----------
  scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x2a2f38, 0.7));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(3, 6, 5); key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 20 });
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffd9a0, 0.9); rim.position.set(-4, 3, -3); scene.add(rim);
  const alarmLight = new THREE.PointLight(0xff2a2a, 0, 3); alarmLight.position.set(-0.6, 1.2, 1.0); scene.add(alarmLight);

  // ---------- camera layout ----------
  let narrow = false;
  function layout() {
    const w = mount.clientWidth, h = mount.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    narrow = videoMode ? w / h < 1.2 : w < 768;
    if (videoMode) {
      camera.fov = narrow ? 44 : 34;
      camera.position.set(0.5, 1.75, narrow ? 6.4 : 5.4);
      camera.lookAt(0.45, 1.0, 0);
    } else if (narrow) {
      camera.fov = 42; camera.position.set(0.5, 2.0, 7.0); camera.lookAt(0.3, 0.95, 0);
    } else {
      camera.fov = 30; camera.position.set(-0.9, 2.1, 9.2); camera.lookAt(-2.6, 0.95, 0);
    }
    camera.updateProjectionMatrix();
    render(current);
  }

  // ---------- timeline ----------
  const clamp = (v) => Math.max(0, Math.min(1, v));
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const ease = (x) => x * x * (3 - 2 * x);
  const lerp = (a, b, k) => a + (b - a) * k;
  let current = 0;

  function seek(tRaw) {
    const t = ((tRaw % LOOP) + LOOP) % LOOP;
    current = t;
    const P = op.parts;
    resetPose(P);

    // 0 - 1.8 walk in from the right; 1.8 - 2.6 reach and press the switch
    const walk = ease(seg(t, 0, 1.8));
    const startX = 2.4, standX = -0.62, standZ = 1.25;
    let x = lerp(startX, standX, walk), z = lerp(1.6, standZ, walk), ry = -Math.PI / 2;
    if (t < 1.8) {
      const stride = Math.sin(t * 9);
      P.legL.rotation.x = stride * 0.5; P.legR.rotation.x = -stride * 0.5;
      P.armL.rotation.x = -stride * 0.4; P.armR.rotation.x = stride * 0.4;
      op.root.position.y = Math.abs(Math.cos(t * 9)) * 0.03;
    }
    // turn toward the control panel
    ry = lerp(ry, -2.85, ease(seg(t, 1.6, 2.1)));
    const reach = ease(seg(t, 1.9, 2.4)) * (1 - ease(seg(t, 2.8, 3.1)));
    P.armR.rotation.x = lerp(P.armR.rotation.x, -1.25, reach);
    P.elbowR.rotation.x = lerp(0, -0.35, reach);
    const pressed = t > 2.35 && t < 2.6;
    oven.switches.forEach((s) => { s.position.z = 0.575 + 0.02 - (pressed ? 0.012 : 0); });

    // 2.4 - 3.0 belt starts, then lurches to a stop
    const beltRun = t < 2.4 ? 0 : t < 3.0 ? (t - 2.4) : 0.6 + Math.sin(Math.min(t, 3.3) * 40) * 0.01;
    oven.beltTex.offset.x = -beltRun * 0.12;

    // 3.0 - 9.0 fault: red flashing screens, smoke, rumble
    const fault = t >= 3.0 && t < 11.0;
    const flash = fault ? (Math.sin(t * 14) > 0 ? 1 : 0.25) : 0;
    oven.screens.forEach((m) => {
      if (t < 2.4) { m.emissive.setHex(0x0b1420); m.emissiveIntensity = 0.3; }
      else if (!fault) { m.emissive.setHex(0x3aa0ff); m.emissiveIntensity = 0.9; }
      else { m.emissive.setHex(0xff2020); m.emissiveIntensity = 0.4 + flash * 1.2; }
    });
    alarmLight.intensity = fault ? flash * 1.5 * (1 - seg(t, 9.5, 11)) : 0;
    const rumble = seg(t, 3.0, 3.2) * (1 - seg(t, 4.8, 5.4));
    oven.group.position.set(ovenBase.x + Math.sin(t * 70) * 0.006 * rumble, ovenBase.y, ovenBase.z + Math.cos(t * 55) * 0.004 * rumble);
    const smokeAmt = seg(t, 3.0, 3.6) * (1 - seg(t, 9.0, 10.5));
    for (const p of puffs) {
      const age = ((t * 0.7 + p.phase) % 1);
      const s = 0.25 + age * 0.9;
      p.m.position.set(p.src.x + Math.sign(p.src.x) * age * 0.35 + p.drift * age * 0.4, p.src.y + age * 1.3, p.src.z + p.drift * 0.3);
      p.m.scale.set(s, s, 1);
      p.m.material.opacity = smokeAmt * Math.sin(age * Math.PI) * 0.75;
    }

    // 3.1 - 6.0 operator jumps back and flails
    const freak = seg(t, 3.1, 3.4) * (1 - seg(t, 5.8, 6.2));
    ry = lerp(ry, 0.25, ease(seg(t, 3.1, 3.5)));
    x += ease(seg(t, 3.1, 3.5)) * 0.45; z += ease(seg(t, 3.1, 3.5)) * 0.35;
    if (freak > 0) {
      const w = t * 13;
      op.root.position.y = Math.max(0, Math.sin(t * 9)) * 0.12 * freak;
      P.armL.rotation.z = lerp(0, 2.6 + Math.sin(w) * 0.5, freak);
      P.armR.rotation.z = lerp(0, -2.6 - Math.sin(w + 1.3) * 0.5, freak);
      P.elbowL.rotation.z = Math.sin(w * 1.3) * 0.6 * freak;
      P.elbowR.rotation.z = -Math.sin(w * 1.1) * 0.6 * freak;
      P.head.rotation.y = Math.sin(t * 16) * 0.5 * freak;
      P.head.rotation.x = -0.15 * freak;
      P.legL.rotation.x = Math.sin(w) * 0.35 * freak; P.legR.rotation.x = -Math.sin(w) * 0.35 * freak;
      P.mouth.scale.set(1, 1 + 2.4 * freak, 1);
      P.browL.rotation.z = 0.5 * freak; P.browR.rotation.z = -0.5 * freak;
    }
    alarm.material.opacity = seg(t, 3.2, 3.4) * (1 - seg(t, 5.8, 6.1));
    alarm.position.set(x + 0.05, 2.15 + Math.sin(t * 8) * 0.05, z);

    // 6.0 - 9.4 phone to the ear, calls Rapid Pro
    const call = ease(seg(t, 6.0, 6.6)) * (1 - ease(seg(t, 9.6, 10.2)));
    ry = lerp(ry, 0.35, call);
    P.armR.rotation.x = lerp(P.armR.rotation.x, -0.35, call);
    P.armR.rotation.z = lerp(P.armR.rotation.z, -1.3, call);
    P.elbowR.rotation.x = lerp(P.elbowR.rotation.x, 0, call);
    P.elbowR.rotation.z = lerp(P.elbowR.rotation.z, 3.54, call); // phone up to the ear
    P.armL.rotation.z = lerp(P.armL.rotation.z, 0.75, call);
    P.elbowL.rotation.z = lerp(P.elbowL.rotation.z, -1.75, call); // hand on hip
    P.phone.visible = t > 5.9 && t < 10.4;
    P.mouth.scale.y = lerp(P.mouth.scale.y, 1 + Math.abs(Math.sin(t * 11)) * 0.8, call);
    bubble.material.opacity = seg(t, 6.6, 6.9) * (1 - seg(t, 9.0, 9.3));
    bubble.position.set(x + 0.9, 2.12, z);

    // 9.3 - 12 end card; operator relaxes
    card.material.opacity = seg(t, 9.3, 9.8) * (1 - seg(t, 11.6, 12));
    card.position.set(1.75, 1.45, 0.9);
    if (t > 10) { P.mouth.scale.y = 1; P.armL.rotation.z = lerp(P.armL.rotation.z, 0.15, seg(t, 10, 10.6)); }

    op.root.position.x = x; op.root.position.z = z; op.root.rotation.y = ry;
    render(t);
  }

  function render() { renderer.render(scene, camera); }

  new ResizeObserver(layout).observe(mount);
  layout();

  const fixed = params.get('seek');
  if (fixed !== null) {
    seek(parseFloat(fixed) || 0);
  } else if (reduced) {
    seek(10.6); // hold on the end card
  } else {
    let visible = true;
    const t0 = performance.now();
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(mount);
    renderer.setAnimationLoop((now) => { if (visible && !document.hidden) seek((now - t0) / 1000); });
    seek(0);
  }
  window.__story = { seek, renderer, LOOP };
  mount.classList.add('is-ready');

  // ---------- builders ----------
  function buildOperator() {
    const mat = (c, r = 0.7) => new THREE.MeshStandardMaterial({ color: c, roughness: r });
    const skin = mat(0xc68b62, 0.6), shirt = mat(0xb3262e), apron = mat(0x1f2a44), pants = mat(0x2b2f36), shoe = mat(0x111111), cap = mat(0x1f2a44), dark = mat(0x111111, 0.4), white = mat(0xffffff, 0.3);
    const root = new THREE.Group();
    const cap_ = (r, len, m) => new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 14), m);
    const sph = (r, m) => new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), m);

    const torso = cap_(0.21, 0.42, shirt); torso.position.y = 1.2; root.add(torso);
    const apronM = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.55, 0.04), apron); apronM.position.set(0, 1.08, 0.19); root.add(apronM);

    const head = new THREE.Group(); head.position.y = 1.66; root.add(head);
    head.add(sph(0.17, skin));
    const capTop = new THREE.Mesh(new THREE.SphereGeometry(0.175, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), cap); capTop.position.y = 0.03; head.add(capTop);
    const brim = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.02, 0.14), cap); brim.position.set(0, 0.04, 0.19); head.add(brim);
    for (const sx of [-1, 1]) {
      const eye = sph(0.032, white); eye.position.set(sx * 0.06, -0.01, 0.15); head.add(eye);
      const pupil = sph(0.017, dark); pupil.position.set(sx * 0.06, -0.01, 0.178); head.add(pupil);
    }
    const browL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.012, 0.01), dark); browL.position.set(0.06, 0.04, 0.165); head.add(browL);
    const browR = browL.clone(); browR.position.x = -0.06; head.add(browR);
    const mouth = sph(0.03, dark); mouth.scale.set(1.3, 0.35, 0.5); mouth.position.set(0, -0.08, 0.155); head.add(mouth);
    const mouthPivot = new THREE.Group(); mouthPivot.position.copy(mouth.position); head.add(mouthPivot);
    head.remove(mouth); mouth.position.set(0, 0, 0); mouthPivot.add(mouth);

    function arm(sx) {
      const shoulder = new THREE.Group(); shoulder.position.set(sx * 0.26, 1.42, 0); root.add(shoulder);
      const upper = cap_(0.06, 0.24, shirt); upper.position.y = -0.17; shoulder.add(upper);
      const elbow = new THREE.Group(); elbow.position.y = -0.34; shoulder.add(elbow);
      const fore = cap_(0.052, 0.24, skin); fore.position.y = -0.16; elbow.add(fore);
      const hand = sph(0.06, skin); hand.position.y = -0.33; elbow.add(hand);
      return { shoulder, elbow, hand };
    }
    const L = arm(1), R = arm(-1);
    const phone = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.13, 0.015), [dark, dark, dark, dark, new THREE.MeshBasicMaterial({ map: makePhoneTexture() }), dark]);
    phone.position.set(0, -0.36, 0.05); phone.rotation.x = -0.3; R.elbow.add(phone);

    function leg(sx) {
      const hip = new THREE.Group(); hip.position.set(sx * 0.1, 0.88, 0); root.add(hip);
      const thigh = cap_(0.08, 0.66, pants); thigh.position.y = -0.42; hip.add(thigh);
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, 0.24), shoe); foot.position.set(0, -0.83, 0.05); hip.add(foot);
      return hip;
    }
    const legL = leg(1), legR = leg(-1);
    root.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    // mouth scale is applied to the pivot so the base squash stays
    return { root, parts: { head, mouth: mouthPivot, browL, browR, armL: L.shoulder, armR: R.shoulder, elbowL: L.elbow, elbowR: R.elbow, legL, legR, phone } };
  }

  function resetPose(P) {
    for (const k of ['head', 'armL', 'armR', 'elbowL', 'elbowR', 'legL', 'legR', 'browL', 'browR']) P[k].rotation.set(0, 0, 0);
    P.mouth.scale.set(1, 1, 1);
    op.root.position.y = 0;
  }

  function textSprite(lines, o) {
    const c = document.createElement('canvas'); c.width = o.w; c.height = o.h;
    const x = c.getContext('2d');
    if (o.bg) {
      x.fillStyle = o.bg;
      roundRect(x, 6, 6, o.w - 12, o.h - (o.tail ? 50 : 12), o.radius || 0); x.fill();
      if (o.border) { x.lineWidth = 10; x.strokeStyle = o.border; x.stroke(); }
      if (o.tail) { x.beginPath(); x.moveTo(90, o.h - 46); x.lineTo(70, o.h - 4); x.lineTo(150, o.h - 46); x.fill(); }
    }
    x.textAlign = 'center'; x.textBaseline = 'middle';
    const n = lines.length, areaH = o.h - (o.tail ? 50 : 0);
    lines.forEach((line, i) => {
      const spec = (o.lines && o.lines[i]) || {};
      x.font = spec.font || o.font; x.fillStyle = spec.color || o.color;
      const yy = areaH * (i + 0.5) / n + 4;
      if (o.stroke) { x.lineWidth = 14; x.strokeStyle = o.stroke; x.strokeText(line, o.w / 2, yy); }
      x.fillText(line, o.w / 2, yy);
    });
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, opacity: 0, depthTest: false }));
    s.renderOrder = 10;
    return s;
  }

  function roundRect(x, a, b, w, h, r) {
    x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath();
  }

  function makeSmokeTexture() {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d');
    const g = x.createRadialGradient(64, 64, 4, 64, 64, 62);
    g.addColorStop(0, 'rgba(90,92,98,0.9)'); g.addColorStop(0.5, 'rgba(70,72,78,0.45)'); g.addColorStop(1, 'rgba(60,62,68,0)');
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }

  function makeTileTexture() {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const x = c.getContext('2d');
    x.fillStyle = '#4b5260'; x.fillRect(0, 0, 256, 256);
    x.fillStyle = '#6a7180';
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) x.fillRect(i * 64 + 2, j * 64 + 2, 60, 60);
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(10, 10); t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  function makePhoneTexture() {
    const c = document.createElement('canvas'); c.width = 128; c.height = 256;
    const x = c.getContext('2d');
    x.fillStyle = '#0f1a2a'; x.fillRect(0, 0, 128, 256);
    x.fillStyle = '#2fbf5a'; x.beginPath(); x.arc(64, 200, 22, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#f5b301'; x.font = '800 26px Arial'; x.textAlign = 'center'; x.fillText('RAPID', 64, 70); x.fillText('PRO', 64, 100);
    x.fillStyle = '#ffffff'; x.font = '600 15px Arial'; x.fillText('(901) 257-9417', 64, 140);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
}
