// 3D hero: double-stack conveyor pizza oven with Rapid Pro badge plates.
// Mount: <div class="oven-hero-canvas" data-oven-hero></div> inside section.hero.hero-3d
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildOven, makeWatermarkTexture } from './oven-model.js?v=5';

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
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);

  const { group: oven, beltTex, glass } = buildOven(THREE, { decks: 2, badge: 'rapidpro' });
  oven.position.y = -0.85;
  scene.add(oven);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.ShadowMaterial({ opacity: 0.35 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -0.85; floor.receiveShadow = true; scene.add(floor);

  // watermark on the floor, part of the render so it travels with any screenshot
  const mark = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.21), new THREE.MeshBasicMaterial({ map: makeWatermarkTexture(THREE), transparent: true, depthWrite: false }));
  mark.rotation.x = -Math.PI / 2; mark.position.set(0.1, 0.005, 0.78); oven.add(mark);

  scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x1a1d24, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(3, 5, 4); key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 1, far: 15 });
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffd9a0, 1.0); rim.position.set(-4, 2, -3); scene.add(rim);

  function layout() {
    const w = mount.clientWidth, h = mount.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const narrow = w < 768;
    camera.fov = narrow ? 38 : 30;
    camera.position.set(narrow ? 0.9 : 0.2, narrow ? 1.3 : 1.15, 5.6);
    camera.lookAt(narrow ? 0 : -1.9, narrow ? -0.05 : 0.0, 0);
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(layout).observe(mount);
  layout();

  let visible = true;
  const t0 = performance.now();
  new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(mount);
  let px = 0;
  window.addEventListener('pointermove', (e) => { px = e.clientX / window.innerWidth - 0.5; }, { passive: true });

  function tick(now) {
    const t = (now - t0) / 1000;
    oven.rotation.y = -0.32 + Math.sin(t * 0.25) * 0.1 + px * 0.12;
    beltTex.offset.x = -t * 0.08;
    glass.emissiveIntensity = 0.03 + Math.sin(t * 2.1) * 0.01;
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
}
