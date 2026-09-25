import * as THREE from "three";

const clamp01 = (value) => Math.max(0, Math.min(1, value));
const smooth = (a, b, value) => {
  const t = clamp01((value - a) / Math.max(.0001, b - a));
  return t * t * (3 - 2 * t);
};

export function createLoaderHouse(canvas) {
  if (!canvas) return null;

  const phone = window.innerWidth <= 760;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    premultipliedAlpha: true,
    powerPreference: "high-performance",
    stencil: false
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, phone ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0d0e0c, 13, 22);

  const camera = new THREE.PerspectiveCamera(phone ? 39 : 35, 1, .1, 40);
  camera.position.set(0, 2.25, phone ? 12.4 : 11.2);

  scene.add(new THREE.HemisphereLight(0xfff3dd, 0x1d211f, 1.7));
  const key = new THREE.DirectionalLight(0xffe3b0, 2.4);
  key.position.set(6, 9, 7);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xf2b600, 1.25);
  rim.position.set(-6, 4, -5);
  scene.add(rim);

  const world = new THREE.Group();
  world.position.y = phone ? -.55 : -.35;
  world.rotation.y = -.55;
  scene.add(world);

  const yellow = new THREE.Color(0xf2b600);
  const concrete = new THREE.MeshStandardMaterial({
    color: 0xbab7af,
    roughness: .88,
    metalness: .02,
    transparent: true,
    opacity: 1
  });
  const dark = new THREE.MeshStandardMaterial({
    color: 0x282d2a,
    roughness: .68,
    metalness: .14,
    transparent: true,
    opacity: 1
  });
  const wall = new THREE.MeshStandardMaterial({
    color: 0xdad7cf,
    roughness: .92,
    transparent: true,
    opacity: 1
  });

  const parts = [];
  const addBox = (size, position, material, start, end, reveal = "y", rotation = null, accent = false) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material.clone());
    mesh.position.set(...position);
    mesh.scale.set(...size);
    if (rotation) mesh.rotation.set(...rotation);
    mesh.userData = {
      start,
      end,
      reveal,
      basePosition: mesh.position.clone(),
      baseScale: mesh.scale.clone()
    };

    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)),
      new THREE.LineBasicMaterial({
        color: accent ? yellow : 0xe7e8e2,
        transparent: true,
        opacity: accent ? .72 : .22,
        toneMapped: false
      })
    );
    edges.userData.baseOpacity = accent ? .72 : .22;
    mesh.add(edges);
    world.add(mesh);
    parts.push(mesh);
    return mesh;
  };

  addBox([6.3, .16, 4.3], [0, -1.48, 0], concrete, .03, .13, "x", null, true);
  addBox([5.8, .38, 3.9], [0, -1.25, 0], concrete, .10, .22, "x");

  const xs = [-2.3, 2.3];
  const zs = [-1.45, 1.45];
  xs.forEach((x, xi) => zs.forEach((z, zi) => {
    addBox([.34, 3.45, .34], [x, .48, z], concrete, .20 + (xi + zi) * .018, .38 + (xi + zi) * .018, "y");
  }));

  addBox([5.55, .24, 3.55], [0, 2.16, 0], concrete, .35, .49, "x", null, true);

  addBox([.18, 2.0, 3.15], [-2.55, 3.02, 0], wall, .46, .62, "y");
  addBox([.18, 2.0, 3.15], [2.55, 3.02, 0], wall, .48, .64, "y");
  addBox([5.0, 1.92, .18], [0, 3.02, -1.58], wall, .50, .67, "x");
  addBox([1.72, 1.92, .18], [-1.62, 3.02, 1.58], wall, .52, .69, "x");
  addBox([1.72, 1.92, .18], [1.62, 3.02, 1.58], wall, .54, .71, "x");

  const pitch = Math.atan2(1.22, 3.05);
  const slope = Math.hypot(3.05, 1.22);
  addBox([slope, .13, 4.12], [-1.525, 4.58, 0], dark, .68, .86, "x", [0, 0, pitch], true);
  addBox([slope, .13, 4.12], [1.525, 4.58, 0], dark, .71, .89, "x", [0, 0, -pitch], true);
  addBox([.22, .18, 4.22], [0, 5.22, 0], dark, .82, .95, "z", null, true);

  const grid = new THREE.GridHelper(13, 26, 0xf2b600, 0x444944);
  grid.position.y = -1.58;
  const gridMaterials = Array.isArray(grid.material) ? grid.material : [grid.material];
  gridMaterials.forEach((material) => {
    material.transparent = true;
    material.opacity = .16;
    material.depthWrite = false;
  });
  world.add(grid);

  let targetProgress = 0;
  let progress = 0;
  let destroyed = false;
  let frame = 0;
  let last = performance.now();

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const animatePart = (mesh, value) => {
    const data = mesh.userData;
    const amount = smooth(data.start, data.end, value);
    mesh.visible = amount > .002;
    mesh.position.copy(data.basePosition);
    mesh.scale.copy(data.baseScale);

    const f = Math.max(.001, amount);
    if (data.reveal === "x") mesh.scale.x = data.baseScale.x * f;
    else if (data.reveal === "z") mesh.scale.z = data.baseScale.z * f;
    else {
      mesh.scale.y = data.baseScale.y * f;
      mesh.position.y = data.basePosition.y - data.baseScale.y * (1 - f) * .5;
    }

    mesh.material.opacity = amount;
    mesh.children.forEach((child) => {
      if (child.material) child.material.opacity = (child.userData.baseOpacity || .2) * amount;
    });
  };

  const render = (now) => {
    if (destroyed) return;
    const dt = Math.min(.05, Math.max(.001, (now - last) / 1000));
    last = now;
    progress = THREE.MathUtils.damp(progress, targetProgress, 8.5, dt);

    parts.forEach((part) => animatePart(part, progress));
    world.rotation.y = -.58 + progress * .42 + Math.sin(now * .00055) * .025;
    world.position.y = (phone ? -.62 : -.40) + (1 - smooth(0, .22, progress)) * .35;
    world.scale.setScalar((phone ? .82 : .94) + smooth(.05, .72, progress) * .08);

    const glow = Math.sin(Math.PI * smooth(.70, 1, progress));
    rim.intensity = 1.15 + glow * 1.65;
    camera.position.z = (phone ? 12.5 : 11.3) - smooth(.15, 1, progress) * .55;
    camera.lookAt(0, 1.55, 0);

    renderer.render(scene, camera);
    frame = requestAnimationFrame(render);
  };

  resize();
  window.addEventListener("resize", resize, { passive: true });
  frame = requestAnimationFrame(render);

  return {
    setProgress(value) {
      targetProgress = clamp01(value);
    },
    complete() {
      targetProgress = 1;
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      parts.forEach((mesh) => {
        mesh.geometry.dispose();
        mesh.material.dispose();
        mesh.children.forEach((child) => {
          child.geometry?.dispose();
          child.material?.dispose();
        });
      });
      grid.geometry.dispose();
      gridMaterials.forEach((material) => material.dispose());
      concrete.dispose();
      dark.dispose();
      wall.dispose();
      renderer.dispose();
    }
  };
}
