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

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, phone ? 1.5 : 1.8));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0d0e0c, 12.5, 23);

  const camera = new THREE.PerspectiveCamera(phone ? 39 : 34.5, 1, .1, 40);
  camera.position.set(0, 2.45, phone ? 12.85 : 11.55);

  scene.add(new THREE.HemisphereLight(0xfff4df, 0x1b211f, 1.62));

  const key = new THREE.DirectionalLight(0xffe2ae, 2.65);
  key.position.set(7, 10, 7);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x8ea7b1, .62);
  fill.position.set(-6, 4, -6);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xf2b600, 1.2);
  rim.position.set(-7, 6, 3);
  scene.add(rim);

  const warm = new THREE.PointLight(0xf2b600, .75, 9, 2);
  warm.position.set(-3.8, .4, 4.2);
  scene.add(warm);

  const world = new THREE.Group();
  world.position.y = phone ? -.72 : -.48;
  world.rotation.y = -.68;
  scene.add(world);

  const BOX = new THREE.BoxGeometry(1, 1, 1);
  const CYL = new THREE.CylinderGeometry(1, 1, 1, 10);
  const BOX_EDGES = new THREE.EdgesGeometry(BOX);
  const CYL_EDGES = new THREE.EdgesGeometry(CYL);
  const yellow = new THREE.Color(0xf2b600);

  const makeMat = (color, roughness, metalness = 0, extra = {}) =>
    new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness,
      transparent: true,
      opacity: 1,
      ...extra
    });

  const concrete = makeMat(0xbdb9b0, .9, .02);
  const concreteDark = makeMat(0x77756f, .94, .03);
  const steel = makeMat(0x343b39, .4, .64);
  const rebar = makeMat(0x6b4739, .54, .52);
  const masonry = makeMat(0x9d5d42, .9, .01);
  const plaster = makeMat(0xd9d6ce, .92, 0);
  const timber = makeMat(0x76563c, .8, .02);
  const roof = makeMat(0x282d2b, .76, .1);
  const glass = makeMat(0x93a19e, .18, .05, { opacity: .58, depthWrite: false });
  const accent = makeMat(0xf2b600, .46, .12);

  const parts = [];
  const materials = [concrete, concreteDark, steel, rebar, masonry, plaster, timber, roof, glass, accent];

  const addPart = (geometry, size, position, material, start, end, options = {}) => {
    const mesh = new THREE.Mesh(geometry, material.clone());
    mesh.position.set(...position);
    mesh.scale.set(...size);
    if (options.rotation) mesh.rotation.set(...options.rotation);

    mesh.userData = {
      start,
      end,
      reveal: options.reveal || "y",
      fadeStart: options.fadeStart ?? null,
      fadeEnd: options.fadeEnd ?? null,
      basePosition: mesh.position.clone(),
      baseScale: mesh.scale.clone(),
      accent: !!options.accent
    };

    if (options.edges !== false) {
      const edgeGeometry = geometry === BOX ? BOX_EDGES : geometry === CYL ? CYL_EDGES : new THREE.EdgesGeometry(geometry);
      const edges = new THREE.LineSegments(
        edgeGeometry,
        new THREE.LineBasicMaterial({
          color: options.accent ? yellow : 0xe9eae4,
          transparent: true,
          opacity: options.accent ? .82 : .18,
          toneMapped: false
        })
      );
      edges.userData.baseOpacity = options.accent ? .82 : .18;
      mesh.userData.edge = edges;
      mesh.add(edges);
    }

    mesh.userData.lastAmount = -1;
    mesh.userData.lastPulse = -1;
    world.add(mesh);
    parts.push(mesh);
    return mesh;
  };

  const addBox = (size, position, material, start, end, options = {}) =>
    addPart(BOX, size, position, material, start, end, options);

  const addCylinder = (radius, height, position, material, start, end, options = {}) =>
    addPart(CYL, [radius, height, radius], position, material, start, end, options);

  // 01 / Site + foundation
  addBox([6.8, .10, 4.7], [0, -1.62, 0], accent, .015, .08, {
    reveal: "x",
    accent: true
  });
  addBox([6.2, .14, 4.25], [0, -1.51, 0], concreteDark, .04, .11, {
    reveal: "x"
  });

  [-2.58, 2.58].forEach((x, i) => {
    addBox([.42, .30, 3.65], [x, -1.35, 0], concrete, .08 + i * .01, .16 + i * .01, {
      reveal: "z",
      accent: true
    });
  });
  [-1.58, 1.58].forEach((z, i) => {
    addBox([5.55, .30, .42], [0, -1.35, z], concrete, .09 + i * .01, .17 + i * .01, {
      reveal: "x"
    });
  });
  addBox([5.82, .28, 3.88], [0, -1.16, 0], concrete, .13, .22, {
    reveal: "x",
    accent: true
  });

  // 02 / Rebar cages + structural columns
  const xs = [-2.30, 0, 2.30];
  const zs = [-1.42, 1.42];

  xs.forEach((x, xi) => zs.forEach((z, zi) => {
    const delay = (xi * 2 + zi) * .007;
    [-.10, .10].forEach((dx) => {
      [-.10, .10].forEach((dz) => {
        addCylinder(.025, 3.55, [x + dx, .52, z + dz], rebar, .18 + delay, .31 + delay, {
          edges: false
        });
      });
    });

    [0, .55, 1.1, 1.65, 2.2, 2.75].forEach((y, yi) => {
      addBox([.28, .025, .28], [x, -1.03 + y, z], rebar, .20 + delay + yi * .003, .30 + delay + yi * .003, {
        reveal: "x",
        edges: false
      });
    });

    addBox([.36, 3.45, .36], [x, .48, z], concrete, .25 + delay, .39 + delay, {
      accent: xi === 1 && zi === 1
    });
  }));

  // 03 / Ground-floor beams + slab
  addBox([5.45, .26, .34], [0, 2.12, -1.42], concrete, .34, .45, { reveal: "x" });
  addBox([5.45, .26, .34], [0, 2.12, 1.42], concrete, .35, .46, { reveal: "x", accent: true });
  addBox([.34, .26, 3.2], [-2.30, 2.12, 0], concrete, .36, .47, { reveal: "z" });
  addBox([.34, .26, 3.2], [2.30, 2.12, 0], concrete, .37, .48, { reveal: "z" });
  addBox([5.45, .18, 3.18], [0, 2.32, 0], concrete, .40, .50, { reveal: "x", accent: true });

  // Temporary scaffold appears during masonry and disappears before handoff.
  [-3.08, 3.08].forEach((x, xi) => {
    [-1.9, 0, 1.9].forEach((z, zi) => {
      addBox([.045, 4.3, .045], [x, .55, z], steel, .38 + (xi + zi) * .005, .47, {
        fadeStart: .79,
        fadeEnd: .94,
        edges: false
      });
    });
  });
  [-.62, .58, 1.78, 2.98].forEach((y, i) => {
    addBox([6.15, .04, .04], [0, y, 1.9], steel, .40 + i * .008, .48 + i * .008, {
      reveal: "x",
      fadeStart: .79,
      fadeEnd: .94,
      edges: false
    });
    addBox([6.15, .04, .04], [0, y, -1.9], steel, .405 + i * .008, .485 + i * .008, {
      reveal: "x",
      fadeStart: .79,
      fadeEnd: .94,
      edges: false
    });
  });

  // 04 / Masonry — built around real openings instead of solid walls.
  addBox([.20, 1.95, 3.15], [-2.53, 3.10, 0], masonry, .46, .60, {});
  addBox([.20, 1.95, 3.15], [2.53, 3.10, 0], masonry, .47, .61, {});

  addBox([1.50, 1.95, .20], [-1.75, 3.10, -1.56], masonry, .48, .62, { reveal: "x" });
  addBox([1.05, 1.95, .20], [0, 3.10, -1.56], masonry, .49, .63, { reveal: "x" });
  addBox([1.50, 1.95, .20], [1.75, 3.10, -1.56], masonry, .50, .64, { reveal: "x" });

  addBox([1.34, 1.95, .20], [-1.82, 3.10, 1.56], masonry, .49, .63, { reveal: "x" });
  addBox([.78, 1.95, .20], [-.48, 3.10, 1.56], masonry, .50, .64, { reveal: "x" });
  addBox([.78, 1.95, .20], [.48, 3.10, 1.56], masonry, .51, .65, { reveal: "x" });
  addBox([1.34, 1.95, .20], [1.82, 3.10, 1.56], masonry, .52, .66, { reveal: "x" });

  addBox([5.14, .24, .24], [0, 4.14, -1.56], concrete, .58, .67, { reveal: "x", accent: true });
  addBox([5.14, .24, .24], [0, 4.14, 1.56], concrete, .59, .68, { reveal: "x" });

  // 05 / Roof carpentry
  const pitch = Math.atan2(1.24, 3.05);
  const slope = Math.hypot(3.05, 1.24);
  const leftCenter = [-1.525, 4.76, 0];
  const rightCenter = [1.525, 4.76, 0];

  addBox([.14, .14, 4.18], [0, 5.38, 0], timber, .64, .73, {
    reveal: "z",
    accent: true
  });

  for (let z = -1.88, i = 0; z <= 1.88; z += .63, i += 1) {
    addBox([slope, .075, .075], [leftCenter[0], leftCenter[1], z], timber, .65 + i * .006, .76 + i * .004, {
      reveal: "x",
      rotation: [0, 0, pitch]
    });
    addBox([slope, .075, .075], [rightCenter[0], rightCenter[1], z], timber, .66 + i * .006, .77 + i * .004, {
      reveal: "x",
      rotation: [0, 0, -pitch]
    });
  }

  // 06 / Roof skin + final details
  addBox([slope, .12, 4.20], leftCenter, roof, .75, .86, {
    reveal: "x",
    rotation: [0, 0, pitch],
    accent: true
  });
  addBox([slope, .12, 4.20], rightCenter, roof, .77, .88, {
    reveal: "x",
    rotation: [0, 0, -pitch],
    accent: true
  });
  addBox([.22, .17, 4.28], [0, 5.40, 0], steel, .84, .92, {
    reveal: "z",
    accent: true
  });

  // Front openings finish late so the completed house reads clearly.
  const frontZ = 1.69;
  [
    [-1.55, 3.15, .94, 1.10],
    [1.55, 3.15, .94, 1.10]
  ].forEach(([x, y, w, h], i) => {
    addBox([w, h, .045], [x, y, frontZ], glass, .86 + i * .008, .95 + i * .008, {
      reveal: "all",
      edges: false
    });
    addBox([w + .12, .045, .08], [x, y + h / 2 + .06, frontZ + .04], steel, .87, .96, {
      reveal: "x",
      edges: false
    });
    addBox([w + .12, .045, .08], [x, y - h / 2 - .06, frontZ + .04], steel, .87, .96, {
      reveal: "x",
      edges: false
    });
    addBox([.045, h + .12, .08], [x - w / 2 - .06, y, frontZ + .04], steel, .87, .96, {
      edges: false
    });
    addBox([.045, h + .12, .08], [x + w / 2 + .06, y, frontZ + .04], steel, .87, .96, {
      edges: false
    });
  });

  addBox([.84, 1.82, .08], [0, 3.02, frontZ], timber, .88, .97, {
    reveal: "all",
    accent: true
  });

  addBox([.44, 1.22, .54], [-1.36, 5.18, -.72], plaster, .87, .96, {});
  addBox([.55, .08, .65], [-1.36, 5.82, -.72], steel, .91, .98, {
    reveal: "all"
  });

  const grid = new THREE.GridHelper(13.5, 27, 0xf2b600, 0x464b47);
  grid.position.y = -1.68;
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
  let paused = false;
  let frame = 0;
  let last = performance.now();

  let resizeFrame = 0;
  let lastWidth = 0;
  let lastHeight = 0;

  const resize = () => {
    resizeFrame = 0;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));

    if (width === lastWidth && height === lastHeight) return;

    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    lastWidth = width;
    lastHeight = height;
  };

  const scheduleResize = () => {
    if (resizeFrame) return;
    resizeFrame = requestAnimationFrame(resize);
  };

  const animatePart = (mesh, value) => {
    const data = mesh.userData;
    let amount = smooth(data.start, data.end, value);
    if (data.fadeStart !== null) amount *= 1 - smooth(data.fadeStart, data.fadeEnd, value);

    const localPulse = Math.sin(Math.PI * smooth(data.start, Math.min(1, data.end + .07), value));
    if (
      Math.abs(amount - data.lastAmount) < .00045 &&
      Math.abs(localPulse - data.lastPulse) < .00045
    ) {
      return;
    }

    data.lastAmount = amount;
    data.lastPulse = localPulse;

    mesh.visible = amount > .002;
    mesh.position.copy(data.basePosition);
    mesh.scale.copy(data.baseScale);

    const f = Math.max(.001, amount);
    if (data.reveal === "x") {
      mesh.scale.x = data.baseScale.x * f;
    } else if (data.reveal === "z") {
      mesh.scale.z = data.baseScale.z * f;
    } else if (data.reveal === "all") {
      mesh.scale.multiplyScalar(.78 + f * .22);
      mesh.position.y = data.basePosition.y + (1 - f) * .15;
    } else {
      mesh.scale.y = data.baseScale.y * f;
      mesh.position.y = data.basePosition.y - data.baseScale.y * (1 - f) * .5;
    }

    mesh.material.opacity = amount;

    if (mesh.material.emissive) {
      mesh.material.emissive.setHex(data.accent && localPulse > .01 ? 0x5f4500 : 0);
      mesh.material.emissiveIntensity = data.accent ? localPulse * .75 : 0;
    }

    const edge = data.edge;
    if (edge) {
      edge.material.opacity = (edge.userData.baseOpacity || .18) * amount * (1 + localPulse * .55);
    }
  };

  const render = (now) => {
    if (destroyed || paused) return;

    const dt = Math.min(1 / 30, Math.max(.001, (now - last) / 1000));
    last = now;
    progress = THREE.MathUtils.damp(progress, targetProgress, 12.5, dt);

    parts.forEach((part) => animatePart(part, progress));

    const buildEase = smooth(.02, .94, progress);
    const finishEase = smooth(.72, 1, progress);

    world.rotation.y = -.72 + buildEase * .48 + Math.sin(now * .00048) * .022;
    world.rotation.x = -.025 + (1 - buildEase) * -.015;
    world.position.y = (phone ? -.76 : -.50) + (1 - smooth(0, .18, progress)) * .30;
    world.scale.setScalar((phone ? .79 : .92) + smooth(.05, .72, progress) * .09);

    const glow = Math.sin(Math.PI * smooth(.58, 1, progress));
    rim.intensity = 1.15 + glow * 1.85;
    warm.intensity = .70 + glow * 1.05;
    key.intensity = 2.55 + finishEase * .35;

    camera.position.x = Math.sin(buildEase * .72) * .28;
    camera.position.y = 2.48 + buildEase * .12;
    camera.position.z = (phone ? 12.95 : 11.65) - buildEase * .72;
    camera.lookAt(0, 1.65 + finishEase * .08, 0);

    gridMaterials.forEach((material) => {
      material.opacity = .10 + (1 - finishEase) * .08;
    });

    renderer.render(scene, camera);
    frame = requestAnimationFrame(render);
  };

  resize();
  window.addEventListener("resize", scheduleResize, { passive: true });
  window.visualViewport?.addEventListener("resize", scheduleResize, { passive: true });
  frame = requestAnimationFrame(render);

  return {
    setProgress(value) {
      targetProgress = clamp01(value);
    },
    complete() {
      targetProgress = 1;
      progress = 1;
    },
    freeze() {
      if (destroyed || paused) return;
      targetProgress = 1;
      progress = 1;
      paused = true;
      cancelAnimationFrame(frame);
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancelAnimationFrame(frame);
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      window.removeEventListener("resize", scheduleResize);
      window.visualViewport?.removeEventListener("resize", scheduleResize);

      for (let i = 0; i < parts.length; i += 1) {
        const mesh = parts[i];
        mesh.material.dispose();
        mesh.userData.edge?.material?.dispose();
      }

      grid.geometry.dispose();
      gridMaterials.forEach((material) => material.dispose());
      materials.forEach((material) => material.dispose());
      BOX_EDGES.dispose();
      CYL_EDGES.dispose();
      BOX.dispose();
      CYL.dispose();
      renderer.dispose();
    }
  };
}
