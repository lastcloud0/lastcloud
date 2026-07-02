"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import Lenis from "lenis";

const SVG = `<svg width="3672" height="2294" viewBox="0 0 3672 2294" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3665.75 454.394L1833.92 2286.53L5.41602 457.726C36.0688 300.439 86.7124 149.816 154.682 8.52344L813.049 666.999C845.701 441.064 950.987 239.123 1104.92 84.5014L1398.78 378.416C1286.83 490.383 1217.53 645.005 1217.53 816.289C1217.53 987.572 1278.84 1123.53 1379.46 1233.5C1386.12 1240.83 1392.79 1248.16 1399.45 1254.83C1405.45 1260.83 1412.11 1267.49 1418.77 1272.82C1528.72 1373.46 1675.32 1434.78 1835.92 1434.78C1996.51 1434.78 2161.77 1365.46 2273.72 1253.49C2385.67 1141.53 2454.97 986.906 2454.97 815.622C2454.97 644.339 2386.33 491.05 2275.05 379.082L2568.92 85.1678C2724.18 240.456 2830.13 445.063 2861.45 673.663L3520.49 14.5217C3586.46 152.482 3635.77 300.439 3665.75 454.394Z" fill="white"/></svg>`;

export default function LastcloudScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 10);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const L = (color: number, x: number, y: number, z: number, i: number) => {
      const l = new THREE.PointLight(color, i, 0, 2);
      l.position.set(x, y, z);
      scene.add(l);
    };
    L(0x5b8cff, -6, 3, 4, 110); L(0xff5fa2, 6, -3, 4, 110); L(0x46e0c0, 0, 5, -4, 80); L(0xffffff, 0, 0, 7, 45);

    // ================= starfield background (ROLLBACK: set BG = false) =================
    const BG = true;
    const bgGroup = new THREE.Group();
    if (BG) {
      scene.add(bgGroup);
      const starLayer = (count: number, size: number, opacity: number, spread: number, depth: number) => {
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);
        const c = new THREE.Color();
        for (let i = 0; i < count; i++) {
          pos[i * 3] = (Math.random() - 0.5) * spread;
          pos[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.8;
          pos[i * 3 + 2] = -2 - Math.random() * depth;
          const r = Math.random();
          if (r < 0.12) c.setHSL(0.58, 0.55, 0.8);
          else if (r < 0.2) c.setHSL(0.09, 0.5, 0.82);
          else c.setHSL(0, 0, 0.7 + Math.random() * 0.3);
          col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        g.setAttribute("color", new THREE.BufferAttribute(col, 3));
        bgGroup.add(new THREE.Points(g, new THREE.PointsMaterial({
          size, vertexColors: true, transparent: true, opacity,
          depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
        })));
      };
      starLayer(2600, 0.03, 0.5, 46, 30);
      starLayer(700, 0.07, 0.8, 40, 26);
      starLayer(140, 0.14, 1.0, 34, 22);
    }
    // ==================================================================================

    // build the extruded, beveled glass logo
    const svgData = new SVGLoader().parse(SVG);
    const shapes: THREE.Shape[] = [];
    svgData.paths.forEach((p) => SVGLoader.createShapes(p).forEach((sh) => shapes.push(sh)));

    let minX = Infinity, maxX = -Infinity;
    shapes.forEach((sh) => sh.getPoints(8).forEach((pt) => { if (pt.x < minX) minX = pt.x; if (pt.x > maxX) maxX = pt.x; }));
    const W = maxX - minX;

    const geometry = new THREE.ExtrudeGeometry(shapes, {
      depth: W * 0.116, bevelEnabled: true, bevelThickness: W * 0.0239, bevelSize: W * 0.0171,
      bevelSegments: 12, curveSegments: 48, steps: 1,
    });
    geometry.center();
    geometry.computeBoundingBox();
    const gw = geometry.boundingBox!.max.x - geometry.boundingBox!.min.x;
    const norm = 293 / gw;
    geometry.scale(norm, norm, norm);
    geometry.computeVertexNormals();

    const material = new THREE.MeshPhysicalMaterial({
      color: 0xffffff, metalness: 0, roughness: 0.04,
      transmission: 1, thickness: 2.6, ior: 1.5, dispersion: 6,
      iridescence: 1, iridescenceIOR: 1.3, iridescenceThicknessRange: [120, 460],
      clearcoat: 1, clearcoatRoughness: 0.05,
      attenuationColor: new THREE.Color(0xffffff), attenuationDistance: 5,
      envMapIntensity: 1.7, transparent: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.z = Math.PI;
    const group = new THREE.Group();
    group.add(mesh);
    group.scale.setScalar(0.0145);
    scene.add(group);

    // ---- voxel cube system (section-3 explode / reassemble) ----
    const dPath = SVG.match(/d="([^"]+)"/)![1];
    const gridW = 14, gridH = Math.round((gridW * 2294) / 3672);
    const rc = document.createElement("canvas");
    rc.width = gridW; rc.height = gridH;
    const rctx = rc.getContext("2d")!;
    rctx.setTransform(gridW / 3672, 0, 0, gridH / 2294, 0, 0);
    rctx.fillStyle = "#fff";
    rctx.fill(new Path2D(dPath));
    const pix = rctx.getImageData(0, 0, gridW, gridH).data;

    const cellVbW = 3672 / gridW, cellVbH = 2294 / gridH;
    const raws: [number, number][] = [];
    for (let row = 0; row < gridH; row++)
      for (let col = 0; col < gridW; col++)
        if (pix[(row * gridW + col) * 4 + 3] > 100)
          raws.push([(col + 0.5) * cellVbW, (row + 0.5) * cellVbH]);

    let bxMin = Infinity, bxMax = -Infinity, byMin = Infinity, byMax = -Infinity;
    raws.forEach(([x, y]) => { bxMin = Math.min(bxMin, x); bxMax = Math.max(bxMax, x); byMin = Math.min(byMin, y); byMax = Math.max(byMax, y); });
    const cX = (bxMin + bxMax) / 2, cY = (byMin + byMax) / 2, kk = 293 / (bxMax - bxMin);

    const N = raws.length;
    const cubes = new THREE.InstancedMesh(new RoundedBoxGeometry(1, 1, 1, 4, 0.12), material, N);
    cubes.visible = false;
    const homes: THREE.Vector3[] = [], dirs: THREE.Vector3[] = [], dists: number[] = [], spins: THREE.Vector3[] = [];
    const cubeXY = cellVbW * kk * 0.95;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < N; i++) {
      const [rx, ry] = raws[i];
      homes.push(new THREE.Vector3(-(rx - cX) * kk, -(ry - cY) * kk, 0));
      dirs.push(new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize());
      dists.push(120 + Math.random() * 260);
      spins.push(new THREE.Vector3(Math.random(), Math.random(), Math.random()).multiplyScalar(3));
      dummy.position.copy(homes[i]); dummy.scale.set(cubeXY, cubeXY, cubeXY); dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix(); cubes.setMatrixAt(i, dummy.matrix);
    }
    cubes.instanceMatrix.needsUpdate = true;
    group.add(cubes);

    // ---- OMNI (section 2) morph target: glass ring + gradient waveform ----
    const omniGroup = new THREE.Group();
    omniGroup.visible = false;
    group.add(omniGroup);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(88, 12, 28, 140), material);
    omniGroup.add(ring);

    const WSEG = 110, WHALF = 66;
    const cA = new THREE.Color("#2dd4bf"), cB = new THREE.Color("#a78bfa");
    const waveDefs = [
      { amp: 20, freq: 1.8, phase: 0.0, speed: 1.8 },
      { amp: 14, freq: 2.6, phase: 1.3, speed: -2.2 },
      { amp: 9, freq: 3.4, phase: 2.6, speed: 2.6 },
    ];
    const waves = waveDefs.map((d) => {
      const g = new THREE.BufferGeometry();
      const pos = new Float32Array((WSEG + 1) * 3);
      const col = new Float32Array((WSEG + 1) * 3);
      const tmp = new THREE.Color();
      for (let i = 0; i <= WSEG; i++) {
        tmp.copy(cA).lerp(cB, i / WSEG);
        col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b;
      }
      g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      g.setAttribute("color", new THREE.BufferAttribute(col, 3));
      const line = new THREE.Line(g, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0 }));
      omniGroup.add(line);
      return { g, line, d };
    });
    const updateWaves = (t: number, op: number) => {
      for (const { g, line, d } of waves) {
        (line.material as THREE.LineBasicMaterial).opacity = op;
        const p = g.attributes.position.array as Float32Array;
        for (let i = 0; i <= WSEG; i++) {
          const u = i / WSEG;
          const env = Math.sin(u * Math.PI);
          p[i * 3] = -WHALF + 2 * WHALF * u;
          p[i * 3 + 1] = Math.sin(u * Math.PI * 2 * d.freq + t * d.speed + d.phase) * d.amp * env;
          p[i * 3 + 2] = 2;
        }
        g.attributes.position.needsUpdate = true;
      }
    };

    const pinSec = document.querySelector<HTMLElement>(".pin-explode");
    const omniSec = document.querySelector<HTMLElement>(".pin-omni");

    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointer = (e: PointerEvent) => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    let s = 0;
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      s = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    let rafId = 0;
    const animate = (now?: number) => {
      rafId = requestAnimationFrame(animate);
      lenis.raf(now ?? performance.now());
      const t = clock.getElapsedTime();

      const targetX = 0.12 + s * 0.55 + Math.sin(t * 0.4) * 0.03;
      const targetY = -0.28 + s * Math.PI * 1.15 + Math.cos(t * 0.3) * 0.04;
      group.rotation.x += (targetX - group.rotation.x) * 0.06;
      group.rotation.y += (targetY - group.rotation.y) * 0.06;
      group.position.y += (Math.sin(t * 0.6) * 0.04 - group.position.y) * 0.05;

      if (BG) {
        bgGroup.rotation.y = t * 0.01 + s * 0.4;
        bgGroup.position.y = -s * 3.5;
      }

      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      camera.position.x = mouse.x * 0.9;
      camera.position.y = mouse.y * 0.9;
      camera.lookAt(0, 0, 0);

      // section-2 pin: morph logo into a glass ring + wave
      let p2 = 0;
      if (omniSec) {
        const total2 = omniSec.offsetHeight - window.innerHeight;
        p2 = total2 > 0 ? -omniSec.getBoundingClientRect().top / total2 : 0;
        p2 = Math.max(0, Math.min(1, p2));
      }
      const inOmni = p2 > 0.001 && p2 < 0.999;
      let m = 0;
      if (inOmni) {
        if (p2 < 0.35) { const x = p2 / 0.35; m = x * x * (3 - 2 * x); }
        else if (p2 > 0.65) { const x = (1 - p2) / 0.35; m = x * x * (3 - 2 * x); }
        else m = 1;
      }
      mesh.scale.setScalar(inOmni ? Math.max(0.0001, 1 - m) : 1);
      omniGroup.visible = inOmni && m > 0.002;
      if (omniGroup.visible) {
        omniGroup.scale.setScalar(Math.max(0.001, m));
        updateWaves(t, m);
      }

      // section-3 pin: explode logo into cubes and reassemble
      let p = 0;
      if (pinSec) {
        const total = pinSec.offsetHeight - window.innerHeight;
        p = total > 0 ? -pinSec.getBoundingClientRect().top / total : 0;
        p = Math.max(0, Math.min(1, p));
      }
      const inPin = p > 0.001 && p < 0.999;
      mesh.visible = !inPin;
      cubes.visible = inPin;
      if (inPin) {
        let ex = Math.sin(p * Math.PI); ex *= ex;
        for (let i = 0; i < N; i++) {
          const h = homes[i], d = dirs[i], D = dists[i] * ex;
          dummy.position.set(h.x + d.x * D, h.y + d.y * D, h.z + d.z * D);
          dummy.scale.set(cubeXY, cubeXY, cubeXY);
          dummy.rotation.set(spins[i].x * ex, spins[i].y * ex, spins[i].z * ex);
          dummy.updateMatrix();
          cubes.setMatrixAt(i, dummy.matrix);
        }
        cubes.instanceMatrix.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      lenis.destroy();
      pmrem.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="scene-canvas" />;
}
