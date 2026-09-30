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

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, phone ? 1.5 : 1.9));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0d0e0c, 14.5, 27);

  // A slightly longer lens and a lower target keep the entire plinth in frame
  // while preserving the large-house feel on both desktop and phone.
  const camera = new THREE.PerspectiveCamera(phone ? 36 : 35, 1, .1, 45);
  camera.position.set(0, phone ? 1.94 : 2.08, phone ? 14.20 : 14.30);

  scene.add(new THREE.HemisphereLight(0xfff4df, 0x1a201e, 1.66));

  const key = new THREE.DirectionalLight(0xffe5b8, 2.6);
  key.position.set(8, 10, 7);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x91a9b1, .66);
  fill.position.set(-7, 4, -6);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xf2b600, 1.15);
  rim.position.set(-8, 6, 4);
  scene.add(rim);

  const warm = new THREE.PointLight(0xf2b600, .7, 11, 2);
  warm.position.set(-4.4, .35, 4.8);
  scene.add(warm);

  const world = new THREE.Group();
  world.position.y = phone ? -.25 : -.14;
  world.rotation.y = -.66;
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

  const concrete = makeMat(0xc1bdb4, .91, .02);
  const concreteDark = makeMat(0x76746e, .94, .03);
  const steel = makeMat(0x2f3634, .38, .68);
  const rebar = makeMat(0x684538, .55, .54);
  const masonry = makeMat(0x95604a, .9, .01);
  const plaster = makeMat(0xddd9d0, .9, 0);
  const timber = makeMat(0x76523a, .78, .02);
  const roof = makeMat(0x252a28, .74, .12);
  const glass = makeMat(0x9ba8a5, .16, .06, { opacity: .58, depthWrite: false });
  const accent = makeMat(0xf2b600, .45, .14);

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

  const addWindow = (x, y, width, height, z, start, end) => {
    addBox([width, height, .055], [x, y, z], glass, start, end, {
      reveal: "all",
      edges: false
    });
    const frameDepth = .09;
    const frame = .055;
    addBox([width + .14, frame, frameDepth], [x, y + height / 2 + .065, z + .035], steel, start + .008, end, { reveal: "x", edges: false });
    addBox([width + .14, frame, frameDepth], [x, y - height / 2 - .065, z + .035], steel, start + .008, end, { reveal: "x", edges: false });
    addBox([frame, height + .14, frameDepth], [x - width / 2 - .065, y, z + .035], steel, start + .008, end, { edges: false });
    addBox([frame, height + .14, frameDepth], [x + width / 2 + .065, y, z + .035], steel, start + .008, end, { edges: false });
    addBox([frame * .72, height, frameDepth], [x, y, z + .04], steel, start + .012, end, { edges: false });
  };

  // 01 / Wide, low foundation and plinth.
  addBox([8.15, .10, 5.55], [0, -1.48, .08], accent, .012, .075, {
    reveal: "x",
    accent: true
  });
  addBox([7.65, .16, 5.02], [0, -1.37, .04], concreteDark, .035, .105, {
    reveal: "x"
  });

  [-3.22, 3.22].forEach((x, i) => {
    addBox([.44, .30, 4.35], [x, -1.22, 0], concrete, .07 + i * .008, .15 + i * .008, {
      reveal: "z",
      accent: i === 0
    });
  });
  [-1.90, 1.90].forEach((z, i) => {
    addBox([6.90, .30, .44], [0, -1.22, z], concrete, .08 + i * .008, .16 + i * .008, {
      reveal: "x"
    });
  });
  addBox([7.22, .28, 4.62], [0, -.99, 0], concrete, .12, .21, {
    reveal: "x",
    accent: true
  });

  // Front porch is deliberately part of the base so the house lands visually.
  addBox([1.95, .18, 1.10], [0, -.91, 2.52], concreteDark, .15, .23, {
    reveal: "z"
  });

  // 02 / Rebar cages + ground-floor structure.
  const columnXs = [-2.88, 0, 2.88];
  const columnZs = [-1.68, 1.68];

  columnXs.forEach((x, xi) => columnZs.forEach((z, zi) => {
    const delay = (xi * 2 + zi) * .006;
    [-.10, .10].forEach((dx) => {
      [-.10, .10].forEach((dz) => {
        addCylinder(.024, 2.76, [x + dx, .40, z + dz], rebar, .17 + delay, .285 + delay, {
          edges: false
        });
      });
    });

    [-.70, -.18, .34, .86, 1.38].forEach((y, yi) => {
      addBox([.28, .025, .28], [x, y, z], rebar, .19 + delay + yi * .003, .29 + delay + yi * .003, {
        reveal: "x",
        edges: false
      });
    });

    addBox([.38, 2.72, .38], [x, .39, z], concrete, .235 + delay, .36 + delay, {
      accent: xi === 1 && zi === 1
    });
  }));

  // 03 / First-floor beams and slab.
  addBox([6.18, .28, .36], [0, 1.80, -1.68], concrete, .32, .43, { reveal: "x" });
  addBox([6.18, .28, .36], [0, 1.80, 1.68], concrete, .33, .44, { reveal: "x", accent: true });
  addBox([.36, .28, 3.72], [-2.88, 1.80, 0], concrete, .34, .45, { reveal: "z" });
  addBox([.36, .28, 3.72], [2.88, 1.80, 0], concrete, .35, .46, { reveal: "z" });
  addBox([6.55, .18, 4.02], [0, 2.01, 0], concrete, .38, .48, { reveal: "x", accent: true });

  // Upper structure is shorter than the ground floor for a calmer, residential proportion.
  columnXs.forEach((x, xi) => columnZs.forEach((z, zi) => {
    const delay = (xi * 2 + zi) * .006;
    addBox([.34, 1.70, .34], [x, 2.95, z], concrete, .40 + delay, .51 + delay, {
      accent: xi === 1 && zi === 0
    });
  }));
  addBox([6.18, .25, .34], [0, 3.88, -1.68], concrete, .45, .54, { reveal: "x" });
  addBox([6.18, .25, .34], [0, 3.88, 1.68], concrete, .46, .55, { reveal: "x", accent: true });
  addBox([.34, .25, 3.72], [-2.88, 3.88, 0], concrete, .47, .56, { reveal: "z" });
  addBox([.34, .25, 3.72], [2.88, 3.88, 0], concrete, .48, .57, { reveal: "z" });

  // 04 / Ground-floor masonry with real openings.
  addBox([.20, 2.45, 4.18], [-3.35, .34, 0], masonry, .46, .60, {});
  addBox([.20, 2.45, 4.18], [3.35, .34, 0], masonry, .47, .61, {});
  addBox([6.52, 2.45, .20], [0, .34, -2.09], masonry, .48, .62, { reveal: "x" });

  // Front facade: low sill, tall header, end piers and door/window separators.
  addBox([6.52, .48, .20], [0, -.64, 2.09], masonry, .49, .62, { reveal: "x" });
  addBox([6.52, .48, .20], [0, 1.31, 2.09], masonry, .50, .63, { reveal: "x" });
  addBox([.42, 1.48, .20], [-3.14, .34, 2.09], masonry, .50, .63, {});
  addBox([.44, 1.48, .20], [-1.03, .34, 2.09], masonry, .51, .64, {});
  addBox([.44, 1.48, .20], [1.03, .34, 2.09], masonry, .52, .65, {});
  addBox([.42, 1.48, .20], [3.14, .34, 2.09], masonry, .53, .66, {});

  // Upper floor is shallower and visually lighter.
  addBox([.20, 1.62, 4.18], [-3.35, 2.98, 0], masonry, .52, .66, {});
  addBox([.20, 1.62, 4.18], [3.35, 2.98, 0], masonry, .53, .67, {});
  addBox([6.52, 1.62, .20], [0, 2.98, -2.09], masonry, .54, .68, { reveal: "x" });
  addBox([6.52, .34, .20], [0, 2.34, 2.09], masonry, .55, .68, { reveal: "x" });
  addBox([6.52, .34, .20], [0, 3.62, 2.09], masonry, .56, .69, { reveal: "x" });
  addBox([.44, .96, .20], [-3.14, 2.98, 2.09], masonry, .57, .69, {});
  addBox([1.18, .96, .20], [0, 2.98, 2.09], masonry, .58, .70, {});
  addBox([.44, .96, .20], [3.14, 2.98, 2.09], masonry, .59, .70, {});

  // 05 / Roof carpentry + broad gable silhouette.
  const roofRise = .88;
  const halfSpan = 3.62;
  const pitch = Math.atan2(roofRise, halfSpan);
  const slope = Math.hypot(halfSpan, roofRise);
  const roofCenterY = 4.20;
  const leftCenter = [-halfSpan / 2, roofCenterY, 0];
  const rightCenter = [halfSpan / 2, roofCenterY, 0];

  addBox([.16, .16, 4.98], [0, 4.65, 0], timber, .64, .73, {
    reveal: "z",
    accent: true
  });

  for (let z = -2.20, i = 0; z <= 2.20; z += .68, i += 1) {
    addBox([slope, .075, .075], [leftCenter[0], leftCenter[1], z], timber, .65 + i * .005, .76 + i * .004, {
      reveal: "x",
      rotation: [0, 0, pitch]
    });
    addBox([slope, .075, .075], [rightCenter[0], rightCenter[1], z], timber, .66 + i * .005, .77 + i * .004, {
      reveal: "x",
      rotation: [0, 0, -pitch]
    });
  }

  addBox([slope, .14, 4.92], leftCenter, roof, .74, .86, {
    reveal: "x",
    rotation: [0, 0, pitch],
    accent: true
  });
  addBox([slope, .14, 4.92], rightCenter, roof, .76, .88, {
    reveal: "x",
    rotation: [0, 0, -pitch],
    accent: true
  });
  addBox([.22, .16, 5.02], [0, 4.67, 0], steel, .83, .91, {
    reveal: "z",
    accent: true
  });

  // Crisp fascia lines make the roof shape read immediately at loader scale.
  addBox([.11, .14, 4.94], [-3.62, 3.76, 0], roof, .80, .91, { reveal: "z", edges: false });
  addBox([.11, .14, 4.94], [3.62, 3.76, 0], roof, .80, .91, { reveal: "z", edges: false });

  // 06 / Finished light facade skin. Offsets prevent z-fighting with masonry.
  const facadeStart = .76;
  addBox([.05, 2.45, 4.18], [-3.465, .34, 0], plaster, facadeStart, .89, { edges: false });
  addBox([.05, 2.45, 4.18], [3.465, .34, 0], plaster, facadeStart + .008, .90, { edges: false });
  addBox([6.52, 2.45, .05], [0, .34, -2.205], plaster, facadeStart + .01, .90, { reveal: "x", edges: false });
  addBox([6.52, .48, .05], [0, -.64, 2.205], plaster, facadeStart + .018, .91, { reveal: "x", edges: false });
  addBox([6.52, .48, .05], [0, 1.31, 2.205], plaster, facadeStart + .025, .91, { reveal: "x", edges: false });
  addBox([.42, 1.48, .05], [-3.14, .34, 2.205], plaster, facadeStart + .02, .91, { edges: false });
  addBox([.44, 1.48, .05], [-1.03, .34, 2.205], plaster, facadeStart + .025, .915, { edges: false });
  addBox([.44, 1.48, .05], [1.03, .34, 2.205], plaster, facadeStart + .03, .92, { edges: false });
  addBox([.42, 1.48, .05], [3.14, .34, 2.205], plaster, facadeStart + .035, .92, { edges: false });

  addBox([.05, 1.62, 4.18], [-3.465, 2.98, 0], plaster, .79, .92, { edges: false });
  addBox([.05, 1.62, 4.18], [3.465, 2.98, 0], plaster, .795, .925, { edges: false });
  addBox([6.52, 1.62, .05], [0, 2.98, -2.205], plaster, .80, .93, { reveal: "x", edges: false });
  addBox([6.52, .34, .05], [0, 2.34, 2.205], plaster, .805, .93, { reveal: "x", edges: false });
  addBox([6.52, .34, .05], [0, 3.62, 2.205], plaster, .81, .935, { reveal: "x", edges: false });
  addBox([.44, .96, .05], [-3.14, 2.98, 2.205], plaster, .815, .935, { edges: false });
  addBox([1.18, .96, .05], [0, 2.98, 2.205], plaster, .82, .94, { edges: false });
  addBox([.44, .96, .05], [3.14, 2.98, 2.205], plaster, .825, .94, { edges: false });

  // Front glazing, centered timber door and a shallow modern entry canopy.
  const frontZ = 2.25;
  addWindow(-2.05, .35, 1.60, 1.26, frontZ, .84, .95);
  addWindow(2.05, .35, 1.60, 1.26, frontZ, .845, .955);
  addWindow(-2.05, 2.98, 1.46, .98, frontZ, .855, .96);
  addWindow(2.05, 2.98, 1.46, .98, frontZ, .86, .965);

  addBox([.98, 2.12, .08], [0, .24, frontZ + .005], timber, .86, .97, {
    reveal: "all",
    accent: true
  });
  addBox([.15, 1.76, .04], [.24, .24, frontZ + .055], glass, .89, .975, {
    reveal: "all",
    edges: false
  });

  addBox([1.86, .14, 1.04], [0, 1.72, 2.58], roof, .875, .98, {
    reveal: "z",
    accent: true
  });
  addBox([.09, 1.72, .09], [-.78, .83, 2.90], steel, .89, .98, { edges: false });
  addBox([.09, 1.72, .09], [.78, .83, 2.90], steel, .895, .98, { edges: false });

  const grid = new THREE.GridHelper(15.5, 31, 0xf2b600, 0x454a46);
  grid.position.y = -1.54;
  const gridMaterials = Array.isArray(grid.material) ? grid.material : [grid.material];
  gridMaterials.forEach((material) => {
    material.transparent = true;
    material.opacity = .14;
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
      mesh.position.y = data.basePosition.y + (1 - f) * .13;
    } else {
      mesh.scale.y = data.baseScale.y * f;
      mesh.position.y = data.basePosition.y - data.baseScale.y * (1 - f) * .5;
    }

    mesh.material.opacity = amount;

    if (mesh.material.emissive) {
      mesh.material.emissive.setHex(data.accent && localPulse > .01 ? 0x5f4500 : 0);
      mesh.material.emissiveIntensity = data.accent ? localPulse * .72 : 0;
    }

    const edge = data.edge;
    if (edge) {
      edge.material.opacity = (edge.userData.baseOpacity || .18) * amount * (1 + localPulse * .5);
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

    world.rotation.y = -.70 + buildEase * .42 + Math.sin(now * .00046) * .018;
    world.rotation.x = -.018 + (1 - buildEase) * -.012;
    world.position.y = (phone ? -.25 : -.14) + (1 - smooth(0, .18, progress)) * .11;
    world.scale.setScalar((phone ? .82 : 1.02) + smooth(.05, .72, progress) * (phone ? .055 : .06));

    const glow = Math.sin(Math.PI * smooth(.58, 1, progress));
    rim.intensity = 1.12 + glow * 1.72;
    warm.intensity = .68 + glow * .96;
    key.intensity = 2.52 + finishEase * .34;

    // Keep the camera movement subtle and always frame the full foundation slab.
    camera.position.x = Math.sin(buildEase * .65) * .22;
    camera.position.y = (phone ? 1.94 : 2.08) + buildEase * .02;
    camera.position.z = (phone ? 14.20 : 14.30) - buildEase * (phone ? .08 : .11);
    camera.lookAt(0, (phone ? 1.02 : 1.07) + finishEase * .02, .05);

    gridMaterials.forEach((material) => {
      material.opacity = .08 + (1 - finishEase) * .07;
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
