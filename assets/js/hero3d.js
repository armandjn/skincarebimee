/* Hero 3D scene — a golden serum droplet falling into still water, with rising gold dust (three.js) */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const canvas = document.querySelector('.hero__canvas');
if (canvas && !/[?&]no3d/.test(location.search)) {
  try { init(canvas); } catch (err) { console.warn('3D hero disabled:', err); }
}

function init(canvas) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = canvas.closest('.hero');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.03).texture;
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0.4, 12);
  const key = new THREE.DirectionalLight(0xfff0d0, 2.4); key.position.set(4, 6, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(0x7fe8d0, 1.6); rim.position.set(-6, 1, -4); scene.add(rim);

  const group = new THREE.Group(); scene.add(group);

  /* ---- the droplet (teardrop via lathe) ---- */
  const pts = [];
  for (let i = 0; i <= 90; i++) {
    const th = (i / 90) * Math.PI;
    pts.push(new THREE.Vector2(Math.sin(th) * Math.pow(Math.sin(th / 2), 1.05) * 1.18, Math.cos(th)));
  }
  const dropMat = new THREE.MeshPhysicalMaterial({
    color: 0xffe3a6, metalness: 0, roughness: 0.03, transmission: 1, thickness: 1.6, ior: 1.42,
    attenuationColor: new THREE.Color(0xe3a936), attenuationDistance: 2.4, clearcoat: 1, clearcoatRoughness: 0.02,
    envMapIntensity: 1.9, specularIntensity: 1
  });
  const drop = new THREE.Mesh(new THREE.LatheGeometry(pts, 96), dropMat);
  drop.scale.setScalar(1.75);
  group.add(drop);

  /* golden core glow inside the drop */
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.4, 32, 32), new THREE.MeshBasicMaterial({ color: 0xf3c866, transparent: true, opacity: 0.18 }));
  core.position.y = -0.55; drop.add(core);

  /* ---- water ripples ---- */
  const rippleY = -2.7;
  const ripples = [];
  for (let i = 0; i < 4; i++) {
    const m = new THREE.Mesh(
      new THREE.RingGeometry(0.97, 1, 128),
      new THREE.MeshBasicMaterial({ color: 0xecd596, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })
    );
    m.rotation.x = -Math.PI / 2 + 0.12;
    m.position.y = rippleY;
    group.add(m); ripples.push(m);
  }
  const pool = new THREE.Mesh(
    new THREE.CircleGeometry(4.6, 96),
    new THREE.MeshBasicMaterial({ color: 0xc9a24c, transparent: true, opacity: 0.07, depthWrite: false })
  );
  pool.rotation.x = -Math.PI / 2 + 0.12; pool.position.y = rippleY - 0.01; group.add(pool);

  /* ---- gold dust ---- */
  const mobile = window.innerWidth < 760;
  const N = mobile ? 110 : 260;
  const pos = new Float32Array(N * 3), seed = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    seed[i * 3] = Math.random() * 6.283; seed[i * 3 + 1] = 0.5 + Math.random() * 3.6; seed[i * 3 + 2] = Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,244,205,1)'); grd.addColorStop(0.25, 'rgba(236,200,110,.8)'); grd.addColorStop(1, 'rgba(236,200,110,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
  const dust = new THREE.Points(geo, new THREE.PointsMaterial({ size: mobile ? 0.17 : 0.13, map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.95 }));
  group.add(dust);

  function layout() {
    const r = hero.getBoundingClientRect();
    const w = r.width, h = r.height;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const wide = w >= 1000;
    camera.fov = wide ? 34 : 42;
    group.userData.baseY = wide ? 0.2 : (w < 560 ? 2.7 : 1.7);
    group.position.x = wide ? 3.3 : 0;
    group.scale.setScalar(wide ? 0.95 : (w < 560 ? 0.62 : 0.8));
    camera.updateProjectionMatrix();
    return h;
  }
  let h = layout();
  window.addEventListener('resize', () => { h = layout(); });

  const target = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
  window.addEventListener('pointermove', (e) => {
    target.x = (e.clientX / window.innerWidth - 0.5) * 2;
    target.y = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  let visible = true, raf = 0;
  new IntersectionObserver((en) => { visible = en[0].isIntersecting; if (visible) loop(); }, { threshold: 0 }).observe(hero);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && visible) loop(); });
  const clock = new THREE.Clock();

  function frame() {
    const t = clock.getElapsedTime();
    cur.x += (target.x - cur.x) * 0.05; cur.y += (target.y - cur.y) * 0.05;
    const sy = Math.min(window.scrollY / Math.max(h, 1), 1.2);
    group.rotation.y = cur.x * 0.3;
    group.rotation.x = cur.y * 0.08;
    group.position.y += ((group.userData.baseY + sy * 2) - group.position.y) * 0.1;

    /* droplet: hover, breathe, slow spin */
    const k = 1 + Math.sin(t * 1.6) * 0.025;
    drop.position.y = 0.5 + Math.sin(t * 0.9) * 0.18;
    drop.scale.set(1.75 / k, 1.75 * k, 1.75 / k);
    drop.rotation.y = t * 0.35;

    /* ripples: staggered expanding rings */
    ripples.forEach((m, i) => {
      const p = ((t * 0.28 + i / ripples.length) % 1);
      const s = 0.5 + p * 4.2;
      m.scale.set(s, s, 1);
      m.material.opacity = (1 - p) * (p < 0.08 ? p / 0.08 : 1) * 0.55;
    });

    /* dust: rise in a spiral around the drop */
    for (let i = 0; i < N; i++) {
      const a = seed[i * 3] + t * (0.15 + seed[i * 3 + 2] * 0.25), life = ((t * 0.06 * (0.5 + seed[i * 3 + 2]) + seed[i * 3 + 2]) % 1);
      const rad = 1.4 + seed[i * 3 + 1] * 0.9 + Math.sin(t + i) * 0.1;
      pos[i * 3] = Math.cos(a) * rad;
      pos[i * 3 + 1] = rippleY + life * 8;
      pos[i * 3 + 2] = Math.sin(a) * rad;
    }
    geo.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
  }
  function loop() {
    cancelAnimationFrame(raf);
    if (!visible || document.hidden) return;
    frame();
    raf = requestAnimationFrame(loop);
  }
  if (reduce) { frame(); } else { loop(); }
  canvas.classList.add('is-ready');
  const fb = hero.querySelector('.hero__fallback'); if (fb) fb.style.display = 'none';
}
