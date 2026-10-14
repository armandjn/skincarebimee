/* Hero 3D scene — pearl orb, gold ring and floating droplets (three.js) */
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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 0, 11);

  const key = new THREE.DirectionalLight(0xfff0d0, 2.2); key.position.set(4, 5, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(0x6fe0c8, 1.4); rim.position.set(-6, -2, -3); scene.add(rim);

  const group = new THREE.Group(); scene.add(group);

  /* pearl orb */
  const pearl = new THREE.Mesh(
    new THREE.SphereGeometry(1.75, 96, 96),
    new THREE.MeshPhysicalMaterial({ color: 0xf8eedb, roughness: 0.14, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.08, iridescence: 1, iridescenceIOR: 1.35, iridescenceThicknessRange: [180, 520], sheen: 0.6, sheenColor: new THREE.Color(0xffd9c8) })
  );
  group.add(pearl);

  /* gold rings */
  const goldMat = new THREE.MeshPhysicalMaterial({ color: 0xd9ad4c, metalness: 1, roughness: 0.2, clearcoat: 0.6 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.7, 0.045, 24, 220), goldMat);
  ring.rotation.set(1.15, 0.3, 0); group.add(ring);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(3.25, 0.025, 20, 220), goldMat);
  ring2.rotation.set(0.5, 0.9, 0.4); group.add(ring2);

  /* floating droplets */
  const mobile = window.innerWidth < 760;
  const palette = [
    new THREE.MeshPhysicalMaterial({ color: 0xd9ad4c, metalness: 1, roughness: 0.16 }),
    new THREE.MeshPhysicalMaterial({ color: 0xf6e8d6, roughness: 0.1, clearcoat: 1, iridescence: 1, iridescenceIOR: 1.3 }),
    new THREE.MeshPhysicalMaterial({ color: 0xe9bfae, roughness: 0.18, clearcoat: 1, metalness: 0.15 }),
    new THREE.MeshPhysicalMaterial({ color: 0x1d5a50, roughness: 0.12, clearcoat: 1, metalness: 0.4 })
  ];
  const drops = [];
  const count = mobile ? 7 : 12;
  const sphere = new THREE.SphereGeometry(1, 48, 48);
  for (let i = 0; i < count; i++) {
    const m = new THREE.Mesh(sphere, palette[i % palette.length]);
    const s = 0.12 + Math.random() * 0.36;
    m.scale.setScalar(s);
    const a = Math.random() * Math.PI * 2, r = 2.6 + Math.random() * 2.6;
    m.userData = { a, r, y: (Math.random() - 0.5) * 4.6, sp: 0.15 + Math.random() * 0.35, ph: Math.random() * 6.28 };
    group.add(m); drops.push(m);
  }

  /* sizing & layout: orb to the right on desktop, centred behind copy on mobile */
  let w = 0, h = 0;
  function resize() {
    const r = hero.getBoundingClientRect();
    w = r.width; h = r.height;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const wide = w >= 1000;
    camera.fov = wide ? 36 : 44;
    group.position.set(wide ? 3.3 : 0, wide ? 0 : (w < 560 ? 2.6 : 1.6), 0);
    group.scale.setScalar(wide ? 0.82 : (w < 560 ? 0.72 : 0.85));
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  /* pointer parallax */
  const target = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
  window.addEventListener('pointermove', (e) => {
    target.x = (e.clientX / window.innerWidth - 0.5) * 2;
    target.y = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  let visible = true;
  new IntersectionObserver((en) => { visible = en[0].isIntersecting; if (visible) loop(); }, { threshold: 0 }).observe(hero);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && visible) loop(); });

  const clock = new THREE.Clock();
  let raf = 0;
  function frame() {
    const t = clock.getElapsedTime();
    cur.x += (target.x - cur.x) * 0.05; cur.y += (target.y - cur.y) * 0.05;
    const sy = Math.min(window.scrollY / Math.max(h, 1), 1.2);
    group.rotation.y = cur.x * 0.35 + t * 0.12;
    group.rotation.x = cur.y * 0.2;
    group.position.y += (((w >= 1000 ? 0 : (w < 560 ? 2.6 : 1.6)) + sy * 2.2) - group.position.y) * 0.1;
    pearl.rotation.y = t * 0.25;
    ring.rotation.z = t * 0.2; ring2.rotation.z = -t * 0.14; ring2.rotation.x = 0.5 + Math.sin(t * 0.4) * 0.2;
    drops.forEach((d) => {
      const u = d.userData, ang = u.a + t * u.sp * 0.5;
      d.position.set(Math.cos(ang) * u.r, u.y + Math.sin(t * 0.8 + u.ph) * 0.35, Math.sin(ang) * u.r);
    });
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
