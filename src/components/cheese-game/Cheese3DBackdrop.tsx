import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export type CheeseBackdropMode = 'lobby' | 'night' | 'day' | 'voting' | 'ended';

interface ModeStyle {
  skyTop: string;
  skyBottom: string;
  ground: string;
  hemiSky: string;
  hemiGround: string;
  sun: string;
  sunIntensity: number;
  body: string;
  bodyPos: [number, number, number];
  stars: number;
  cam: [number, number, number];
  speed: number;
}

const MODES: Record<CheeseBackdropMode, ModeStyle> = {
  lobby:  { skyTop: '#1b1646', skyBottom: '#7a4a7e', ground: '#4f8f5b', hemiSky: '#ffd9b0', hemiGround: '#3b4a6b', sun: '#ffd9a0', sunIntensity: 1.5, body: '#ffe9b0', bodyPos: [-9, 7, -14], stars: 0.55, cam: [0, 3.6, 10], speed: 1 },
  night:  { skyTop: '#04061a', skyBottom: '#152049', ground: '#243a4d', hemiSky: '#6f86ff', hemiGround: '#141b30', sun: '#9fb4ff', sunIntensity: 0.9, body: '#e8efff', bodyPos: [8, 8, -15], stars: 1, cam: [0, 2.6, 8.5], speed: 0.6 },
  day:    { skyTop: '#4aa8ee', skyBottom: '#fde6b0', ground: '#6bbf59', hemiSky: '#ffffff', hemiGround: '#a8c97a', sun: '#fff2c4', sunIntensity: 2.1, body: '#ffd447', bodyPos: [9, 9, -15], stars: 0, cam: [0, 4.2, 10.5], speed: 1.15 },
  voting: { skyTop: '#2a0d44', skyBottom: '#b04a70', ground: '#5a3f78', hemiSky: '#ffb3d1', hemiGround: '#2a1a40', sun: '#ff9ec4', sunIntensity: 1.3, body: '#ffc0d9', bodyPos: [-8, 6, -14], stars: 0.45, cam: [0, 3.0, 9], speed: 1.4 },
  ended:  { skyTop: '#3a2a08', skyBottom: '#f0b43c', ground: '#c9953a', hemiSky: '#fff0b8', hemiGround: '#6b4a14', sun: '#ffe08a', sunIntensity: 1.8, body: '#fff6cc', bodyPos: [0, 8, -15], stars: 0.35, cam: [0, 3.8, 10], speed: 0.8 },
};

const MOUSE_COLORS = ['#c9ccd6', '#f3d9c4', '#9aa0b4', '#e8b4a0', '#b9a58e'];
const FRAME_MS = 1000 / 30;

function makeMouse(color: string): THREE.Group {
  const g = new THREE.Group();
  const fur = new THREE.MeshLambertMaterial({ color, flatShading: true });
  const pink = new THREE.MeshLambertMaterial({ color: '#ff9db8', flatShading: true });
  const dark = new THREE.MeshBasicMaterial({ color: '#1a1a22' });

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.38, 7, 5), fur);
  body.scale.set(1.25, 0.9, 1);
  body.position.y = 0.38;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 7, 5), fur);
  head.position.set(0.42, 0.5, 0);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.07, 5, 4), pink);
  nose.position.set(0.66, 0.5, 0);
  g.add(body, head, nose);

  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.04, 8), fur);
    ear.rotation.x = Math.PI / 2;
    ear.position.set(0.34, 0.78, s * 0.19);
    const inner = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 8), pink);
    inner.rotation.x = Math.PI / 2;
    inner.position.set(0.35, 0.78, s * 0.19);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 4, 4), dark);
    eye.position.set(0.55, 0.58, s * 0.12);
    g.add(ear, inner, eye);
  }

  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.045, 0.75, 4), pink);
  tail.rotation.z = Math.PI / 2 + 0.45;
  tail.position.set(-0.7, 0.42, 0);
  g.add(tail);
  return g;
}

function makeCheese(): THREE.Group {
  const g = new THREE.Group();
  const yellow = new THREE.MeshLambertMaterial({ color: '#ffc928', flatShading: true });
  const hole = new THREE.MeshLambertMaterial({ color: '#d9961a', flatShading: true });
  const wheel = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, 0.95, 8), yellow);
  g.add(wheel);
  const holes: [number, number, number, number][] = [[0.5, 0.48, 0.3, 0.26], [-0.6, 0.48, -0.2, 0.2], [0.1, 0.48, -0.7, 0.16], [-0.2, 0.48, 0.75, 0.14]];
  for (const [x, y, z, r] of holes) {
    const h = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.06, 7), hole);
    h.position.set(x, y, z);
    g.add(h);
  }
  const sideHoles: [number, number][] = [[0.4, 0.15], [2.4, -0.1], [4.1, 0.2], [5.4, 0]];
  for (const [a, y] of sideHoles) {
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.2, 5, 4), hole);
    h.position.set(Math.cos(a) * 1.3, y, Math.sin(a) * 1.3);
    g.add(h);
  }
  return g;
}

export const Cheese3DBackdrop: React.FC<{ mode: CheeseBackdropMode }> = ({ mode }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef<CheeseBackdropMode>(mode);
  modeRef.current = mode;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    } catch {
      return; // no WebGL: the CSS gradient behind stays as the backdrop
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
    host.insertBefore(renderer.domElement, host.firstChild);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog('#152049', 12, 30);
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 80);

    const hemi = new THREE.HemisphereLight('#ffffff', '#445566', 1);
    const dir = new THREE.DirectionalLight('#ffffff', 1.5);
    dir.position.set(-5, 9, 6);
    scene.add(hemi, dir);

    // ground + pines
    const groundMat = new THREE.MeshLambertMaterial({ color: '#4f8f5b', flatShading: true });
    const ground = new THREE.Mesh(new THREE.CylinderGeometry(9, 10, 0.7, 14), groundMat);
    ground.position.y = -0.35;
    scene.add(ground);

    const pineMat = new THREE.MeshLambertMaterial({ color: '#2f6b46', flatShading: true });
    const pines = new THREE.InstancedMesh(new THREE.ConeGeometry(0.7, 2.2, 5), pineMat, 16);
    const m4 = new THREE.Matrix4();
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + (i % 3) * 0.12;
      const r = 8.4 + (i % 4) * 0.5;
      const s = 0.8 + (i % 5) * 0.18;
      m4.compose(new THREE.Vector3(Math.cos(a) * r, 1.0 * s, Math.sin(a) * r), new THREE.Quaternion(), new THREE.Vector3(s, s, s));
      pines.setMatrixAt(i, m4);
    }
    scene.add(pines);

    // hero cheese
    const cheese = makeCheese();
    cheese.position.y = 0.6;
    scene.add(cheese);

    // mice circling the cheese
    const mice = MOUSE_COLORS.map((c, i) => {
      const m = makeMouse(c);
      scene.add(m);
      return { m, r: 2.9 + i * 0.7, ang: (i / MOUSE_COLORS.length) * Math.PI * 2, spd: (0.22 + (i % 3) * 0.07) * (i % 2 ? -1 : 1), off: i * 1.7 };
    });

    // floating cheese cubes
    const cubeMat = new THREE.MeshLambertMaterial({ color: '#ffd84a', flatShading: true });
    const CUBES = 12;
    const cubes = new THREE.InstancedMesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), cubeMat, CUBES);
    const cubeSeed = Array.from({ length: CUBES }, (_, i) => ({
      x: Math.cos(i * 2.4) * (4 + (i % 4) * 1.4),
      z: -2 - (i % 5) * 1.6 + Math.sin(i * 1.3) * 2,
      y: 1.6 + (i % 4) * 0.9,
      s: 0.6 + (i % 3) * 0.3,
      sp: 0.5 + (i % 5) * 0.12,
    }));
    scene.add(cubes);

    // celestial body + stars
    const bodyMat = new THREE.MeshBasicMaterial({ color: '#ffffff', fog: false });
    const body = new THREE.Mesh(new THREE.IcosahedronGeometry(1.6, 1), bodyMat);
    scene.add(body);

    const starPos = new Float32Array(150 * 3);
    for (let i = 0; i < 150; i++) {
      const a = Math.random() * Math.PI * 2;
      const e = 0.15 + Math.random() * 0.75;
      starPos[i * 3] = Math.cos(a) * 36 * Math.cos(e);
      starPos[i * 3 + 1] = Math.sin(e) * 30 + 2;
      starPos[i * 3 + 2] = -Math.abs(Math.sin(a)) * 36 - 8;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: '#ffffff', size: 0.22, transparent: true, opacity: 0, fog: false, depthWrite: false });
    scene.add(new THREE.Points(starGeo, starMat));

    // smooth-tracked state
    const cur = {
      groundC: new THREE.Color(MODES[mode].ground),
      hemiSkyC: new THREE.Color(MODES[mode].hemiSky),
      hemiGroundC: new THREE.Color(MODES[mode].hemiGround),
      sunC: new THREE.Color(MODES[mode].sun),
      bodyC: new THREE.Color(MODES[mode].body),
      fogC: new THREE.Color(MODES[mode].skyBottom),
      pineC: new THREE.Color(),
      bodyP: new THREE.Vector3(...MODES[mode].bodyPos),
      cam: new THREE.Vector3(...MODES[mode].cam),
      sunI: MODES[mode].sunIntensity,
      stars: MODES[mode].stars,
      speed: MODES[mode].speed,
    };
    const tmpC = new THREE.Color();
    const tmpV = new THREE.Vector3();
    const pointer = { x: 0, y: 0 };

    const onPointer = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    const resize = () => {
      const w = host.clientWidth || window.innerWidth;
      const h = host.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    let raf = 0;
    let last = 0;
    let t = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden) { last = now; return; }
      if (now - last < FRAME_MS) return;
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      const k = 1 - Math.pow(0.04, dt); // smooth ease toward target mode
      const s = MODES[modeRef.current];
      t += dt * (reduced ? 0.15 : 1) * cur.speed;

      cur.groundC.lerp(tmpC.set(s.ground), k);
      cur.hemiSkyC.lerp(tmpC.set(s.hemiSky), k);
      cur.hemiGroundC.lerp(tmpC.set(s.hemiGround), k);
      cur.sunC.lerp(tmpC.set(s.sun), k);
      cur.bodyC.lerp(tmpC.set(s.body), k);
      cur.fogC.lerp(tmpC.set(s.skyBottom), k);
      cur.bodyP.lerp(tmpV.fromArray(s.bodyPos), k);
      cur.cam.lerp(tmpV.fromArray(s.cam), k);
      cur.sunI += (s.sunIntensity - cur.sunI) * k;
      cur.stars += (s.stars - cur.stars) * k;
      cur.speed += (s.speed - cur.speed) * k;

      groundMat.color.copy(cur.groundC);
      pineMat.color.copy(cur.groundC).multiplyScalar(0.55);
      hemi.color.copy(cur.hemiSkyC);
      hemi.groundColor.copy(cur.hemiGroundC);
      dir.color.copy(cur.sunC);
      dir.intensity = cur.sunI;
      bodyMat.color.copy(cur.bodyC);
      body.position.copy(cur.bodyP);
      (scene.fog as THREE.Fog).color.copy(cur.fogC);
      starMat.opacity = cur.stars * (0.75 + Math.sin(t * 2) * 0.25);

      const portrait = camera.aspect < 0.8 ? 1.5 : 1;
      camera.position.set(
        cur.cam.x + Math.sin(t * 0.18) * 1.6 + pointer.x * 0.9,
        cur.cam.y + pointer.y * -0.5,
        cur.cam.z * portrait,
      );
      camera.lookAt(0, 1.2, 0);

      cheese.rotation.y = t * 0.35;
      cheese.position.y = 0.6 + Math.sin(t * 1.4) * 0.12;

      for (const o of mice) {
        o.ang += o.spd * dt * cur.speed;
        const x = Math.cos(o.ang) * o.r;
        const z = Math.sin(o.ang) * o.r;
        const hop = Math.abs(Math.sin(t * 5 + o.off)) * 0.16;
        o.m.position.set(x, hop, z);
        const sgn = Math.sign(o.spd);
        o.m.rotation.y = Math.atan2(-Math.cos(o.ang) * sgn, -Math.sin(o.ang) * sgn);
      }

      for (let i = 0; i < CUBES; i++) {
        const c = cubeSeed[i];
        m4.compose(
          tmpV.set(c.x, c.y + Math.sin(t * c.sp + i) * 0.35, c.z),
          new THREE.Quaternion().setFromEuler(new THREE.Euler(t * c.sp, t * c.sp * 0.8 + i, 0)),
          new THREE.Vector3(c.s, c.s, c.s),
        );
        cubes.setMatrixAt(i, m4);
      }
      cubes.instanceMatrix.needsUpdate = true;

      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', onPointer);
      scene.traverse(obj => {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose?.();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach(x => x.dispose());
        else mat?.dispose?.();
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
    // scene is built once; mode changes are read through modeRef
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const s = MODES[mode];
  return (
    <div
      ref={hostRef}
      aria-hidden
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: `linear-gradient(to bottom, ${s.skyTop}, ${s.skyBottom})`, transition: 'background 1.2s ease' }}
    >
      {/* soft vignette keeps UI text readable over the scene */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.45) 100%)' }} />
    </div>
  );
};

export default Cheese3DBackdrop;
