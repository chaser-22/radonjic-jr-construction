import * as THREE from "three";
import { createBuildContext, lerp, smooth, updatePart } from "./shared.js";
import { addStructure } from "./structure.js";
import { addFinish } from "./finish.js";

function chooseQuality() {
  const width = window.innerWidth;
  const memory = navigator.deviceMemory || 8;
  const cores = navigator.hardwareConcurrency || 8;
  const constrained = memory <= 4 || cores <= 4;

  if (width <= 760) {
    return {
      name: "phone",
      dpr: 1.05,
      textureSize: 192,
      shadows: false,
      shadowSize: 0,
      roofRows: 7,
      roofCols: 10,
      transmission: false
    };
  }

  if (width <= 1024 || constrained) {
    return {
      name: constrained ? "low" : "tablet",
      dpr: 1.25,
      textureSize: 256,
      shadows: !constrained,
      shadowSize: 1024,
      roofRows: 10,
      roofCols: 13,
      transmission: !constrained
    };
  }

  return {
    name: "high",
    dpr: 1.75,
    textureSize: 512,
    shadows: true,
    shadowSize: 2048,
    roofRows: 14,
    roofCols: 18,
    transmission: true
  };
}

export function createHouseScene(layer, canvas) {
  const quality = chooseQuality();
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: quality.name !== "phone",
    alpha: true,
    premultipliedAlpha: true
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality.dpr));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = quality.name === "high" ? 1.18 : 1.12;
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = quality.shadows;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x10110f, 18, 34);

  const layoutAtStart = window.innerWidth <= 760 ? "phone" : window.innerWidth <= 1024 ? "tablet" : "desktop";
  const camera = new THREE.PerspectiveCamera(layoutAtStart === "phone" ? 38 : layoutAtStart === "tablet" ? 35.5 : 33.5, 1, 0.1, 70);
  camera.position.set(0, layoutAtStart === "phone" ? 2.42 : 2.62, layoutAtStart === "phone" ? 12.7 : layoutAtStart === "tablet" ? 12.0 : 11.7);

  scene.add(new THREE.HemisphereLight(0xfff3dd, 0x2b3230, quality.name === "high" ? 1.85 : 1.65));
  scene.add(new THREE.AmbientLight(0xffffff, .12));

  const sun = new THREE.DirectionalLight(0xffe7c4, quality.name === "high" ? 3.55 : 3.15);
  sun.position.set(7.5, 11, 7.2);
  if (quality.shadows) {
    sun.castShadow = true;
    sun.shadow.mapSize.set(quality.shadowSize, quality.shadowSize);
    Object.assign(sun.shadow.camera, { left: -8.5, right: 8.5, top: 10.5, bottom: -5.5, near: .1, far: 28 });
    sun.shadow.camera.updateProjectionMatrix();
    sun.shadow.bias = -0.00035;
    sun.shadow.normalBias = .018;
  }
  scene.add(sun);

  const fill = new THREE.DirectionalLight(0x9bb7c8, .82);
  fill.position.set(-8, 5, -7);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xdfe7df, .42);
  rim.position.set(1, 8, -10);
  scene.add(rim);

  const warm = new THREE.PointLight(0xf2b600, quality.name === "high" ? 2.8 : 1.8, 12, 2);
  warm.position.set(-4.5, .9, 4.8);
  scene.add(warm);

  const world = new THREE.Group();
  scene.add(world);

  const ctx = createBuildContext(world, quality);
  const { xs, zs } = addStructure(ctx);
  const extra = addFinish(ctx, xs, zs);

  const state = {
    build: 0,
    x: 2.15,
    y: -0.24,
    scale: 1,
    rotation: -0.43,
    opacity: 1,
    xray: 0,
    cameraZ: 11.7,
    lookY: 1.2,
    fov: 33.5,
    pointerX: 0,
    pointerY: 0,
    section: "hero",
    focus: null,
    demolition: 0
  };
  const target = { ...state, buildTarget: reduced ? 1 : 0 };

  let last = performance.now();
  let lastIdleDraw = 0;
  let destroyed = false;
  let failed = false;
  let layoutRevision = 0;
  const offsetCache = new Map();
  const cameraTarget = new THREE.Vector3();
  let lastTileBuild = -1;

  const desktopAnchors = [
    ["hero", ".hero", 3.02, -0.20, .94, -.42, 1, 0, 11.7, 1.24, 33.5],
    ["about", "#o-nama", 4.12, -.56, .44, .12, .06, 0, 12.4, 1.15, 34],
    ["structure", "#konstrukcija", 2.92, -.10, .76, .58, .86, .90, 11.35, 1.72, 32.5],
    ["work", "#radovi", 4.45, -.60, .30, .96, .03, 0, 12.8, 1.12, 34.5],
    ["services", "#usluge", 2.95, -.18, .70, -.56, .82, .08, 11.55, 1.36, 33],
    ["values", "#vrijednosti", -3.95, -.56, .34, .30, .03, 0, 12.8, 1.15, 34.5],
    ["process", "#proces", 4.15, -.60, .30, -.18, .03, 0, 12.8, 1.12, 34.5],
    ["contact", "#kontakt", -3.65, -.42, .40, .12, .05, 0, 12.5, 1.16, 34]
  ];

  const tabletAnchors = [
    ["hero", ".hero", 1.42, -.60, .75, -.38, .92, 0, 12.0, 1.16, 35.5],
    ["about", "#o-nama", 2.75, -.70, .40, .10, .03, 0, 12.8, 1.10, 36],
    ["structure", "#konstrukcija", 1.34, -.31, .65, .50, .76, .80, 11.8, 1.58, 34.5],
    ["work", "#radovi", 2.85, -.72, .28, .82, .01, 0, 13.0, 1.05, 36],
    ["services", "#usluge", 1.34, -.34, .61, -.48, .72, .06, 11.9, 1.32, 35],
    ["values", "#vrijednosti", -2.55, -.72, .28, .24, .01, 0, 13.0, 1.06, 36],
    ["process", "#proces", 2.65, -.72, .26, -.14, .01, 0, 13.0, 1.06, 36],
    ["contact", "#kontakt", -2.34, -.74, .30, .10, .01, 0, 12.9, 1.08, 36]
  ];

  const phoneAnchors = [
    ["hero", ".hero", .24, -1.15, .59, -.32, .88, 0, 12.7, 1.02, 38],
    ["about", "#o-nama", 0, -1.18, .40, .06, 0, 0, 13.1, 1.00, 38],
    ["structure", "#konstrukcija", .20, -.44, .59, .45, .72, .74, 12.45, 1.38, 37],
    ["work", "#radovi", 0, -1.05, .34, .72, 0, 0, 13.1, 1.00, 38],
    ["services", "#usluge", .16, -.52, .55, -.44, .66, .05, 12.5, 1.24, 37.5],
    ["values", "#vrijednosti", 0, -1.02, .30, .20, 0, 0, 13.1, 1.00, 38],
    ["process", "#proces", 0, -1.04, .28, -.12, 0, 0, 13.1, 1.00, 38],
    ["contact", "#kontakt", 0, -1.10, .28, .06, 0, 0, 13.1, 1.00, 38]
  ];

  const mapAnchors = (source) =>
    source
      .map(([name, sel, x, y, scale, rotation, opacity, xray, cameraZ, lookY, fov]) => ({
        name,
        el: document.querySelector(sel),
        x, y, scale, rotation, opacity, xray, cameraZ, lookY, fov
      }))
      .filter((anchor) => anchor.el);

  const mapped = {
    desktop: mapAnchors(desktopAnchors),
    tablet: mapAnchors(tabletAnchors),
    phone: mapAnchors(phoneAnchors)
  };

  const currentLayout = () =>
    window.innerWidth <= 760 ? "phone" : window.innerWidth <= 1024 ? "tablet" : "desktop";

  const getAnchors = () => mapped[currentLayout()];

  const refreshLayout = () => {
    layoutRevision += 1;
    offsetCache.clear();
  };

  const getOffsets = (anchors) => {
    const layout = currentLayout();
    const key = `${layout}:${layoutRevision}`;
    if (offsetCache.has(key)) return offsetCache.get(key);
    const values = anchors.map((anchor) =>
      anchor.el.offsetTop + Math.min(anchor.el.offsetHeight * .35, window.innerHeight * .58)
    );
    offsetCache.set(key, values);
    return values;
  };

  const resize = () => {
    const width = Math.max(1, window.innerWidth);
    const height = Math.max(1, window.innerHeight);
    const layout = currentLayout();
    const cap = layout === "phone" ? 1.05 : layout === "tablet" ? Math.min(1.25, quality.dpr) : quality.dpr;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, cap));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    refreshLayout();
  };

  function updateFromScroll(build) {
    target.buildTarget = reduced ? 1 : build;

    const anchors = getAnchors();
    const center = window.scrollY + window.innerHeight * .52;
    const offsets = getOffsets(anchors);
    let index = 0;

    while (index < offsets.length - 1 && center > offsets[index + 1]) index += 1;

    const a = anchors[index];
    const b = anchors[Math.min(index + 1, anchors.length - 1)];
    const nextOffset = offsets[Math.min(index + 1, offsets.length - 1)];
    const span = Math.max(1, nextOffset - offsets[index]);
    const t = index === anchors.length - 1 ? 0 : smooth(0, 1, (center - offsets[index]) / span);

    ["x","y","scale","rotation","opacity","xray","cameraZ","lookY","fov"].forEach((key) => {
      target[key] = lerp(a[key], b[key], t);
    });
    target.section = a.name;
  }

  const serviceLook = {
    shell: .10,
    foundation: -.54,
    concrete: .05,
    masonry: .26,
    roof: 1.02,
    fence: -.12,
    plinth: -.42,
    demolition: .18,
    prep: -.52
  };

  const serviceKeys = Object.keys(serviceLook);
  const serviceWeights = Object.fromEntries(serviceKeys.map((key) => [key, 0]));

  const setService = (key) => { target.focus = key; };
  const clearService = () => { target.focus = null; };

  const pointer = (event) => {
    if (quality.name === "phone" || reduced) return;
    target.pointerX = (event.clientX / Math.max(1, window.innerWidth) - .5) * 2;
    target.pointerY = (event.clientY / Math.max(1, window.innerHeight) - .5) * 2;
  };

  function fail(error) {
    if (failed || destroyed) return;
    failed = true;
    renderer.setAnimationLoop(null);
    layer.classList.remove("three-ready");
    layer.classList.add("three-failed");
    layer.dataset.threeState = "failed";
    console.error("Three.js render failed", error);
  }

  function updateRoofInstances(build) {
    if (!extra.roofTileData || Math.abs(build - lastTileBuild) < .002) return;
    lastTileBuild = build;
    const { mesh, entries, dummy } = extra.roofTileData;
    entries.forEach((entry, index) => {
      const amount = smooth(entry.start, entry.start + .055, build);
      dummy.position.copy(entry.position);
      dummy.rotation.copy(entry.rotation);
      dummy.scale.set(entry.scale.x * Math.max(.001, amount), entry.scale.y, entry.scale.z);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }

  function updateFrame(now) {
    const safeNow = Number.isFinite(now) ? now : performance.now();
    const dt = Math.min(.05, Math.max(.001, (safeNow - last) / 1000));
    last = safeNow;
    const damping = reduced ? 100 : 5.4;

    state.build = THREE.MathUtils.damp(state.build, target.buildTarget, reduced ? 100 : 7.8, dt);
    ["x","y","scale","rotation","opacity","xray","cameraZ","lookY","fov"].forEach((key) => {
      state[key] = THREE.MathUtils.damp(state[key], target[key], damping, dt);
    });

    state.pointerX = THREE.MathUtils.damp(state.pointerX, target.pointerX, 4.3, dt);
    state.pointerY = THREE.MathUtils.damp(state.pointerY, target.pointerY, 4.3, dt);
    state.section = target.section;
    state.focus = target.section === "services" ? target.focus : null;

    // Every service now cross-fades at the same pace as the Rušenje animation.
    // Old focus decays while the new focus rises, avoiding hard opacity/camera snaps.
    serviceKeys.forEach((key) => {
      serviceWeights[key] = THREE.MathUtils.damp(
        serviceWeights[key],
        state.focus === key ? 1 : 0,
        reduced ? 100 : 5.2,
        dt
      );
    });

    layer.style.opacity = String(state.opacity);
    if (target.opacity <= .001 && state.opacity < .012) {
      if (safeNow - lastIdleDraw < 280) return;
      lastIdleDraw = safeNow;
    }

    state.demolition = serviceWeights.demolition;

    ctx.parts.forEach((part) =>
      updatePart(part, state.build, serviceWeights, state.xray, state.demolition)
    );

    const ghost = 1 - smooth(.05, .86, state.build);
    extra.ghostMat.opacity = .045 + ghost * .38 + state.xray * .12;
    extra.accent.opacity = .06 + ghost * .68 + state.xray * .16;
    extra.ghostFillMat.opacity = .008 + ghost * .035;

    const tileBuild = smooth(.76, .94, state.build);
    const maxServiceFocus = Math.max(0, ...Object.values(serviceWeights));
    const roofMatch = Math.max(serviceWeights.roof || 0, serviceWeights.shell || 0);
    const roofFocusFactor = 1 - maxServiceFocus * .84 + roofMatch * .84;
    let tileOpacity = tileBuild * roofFocusFactor;
    if (state.xray > .02) tileOpacity *= 1 - state.xray * .30;
    extra.roofTileMaterial.opacity = tileOpacity;
    extra.roofTiles.visible = tileOpacity > .002;
    updateRoofInstances(state.build);

    const craneAlpha = smooth(.10,.20,state.build) * (1 - smooth(.70,.82,state.build));
    extra.crane.visible = state.section === "hero" && craneAlpha > .01;
    extra.yellow.opacity = craneAlpha;
    extra.dark.opacity = craneAlpha;
    extra.pivot.rotation.y = -.42 + smooth(.15,.76,state.build) * .92;

    const explode = state.xray;
    const demolition = state.demolition;
    const facadeX = lerp(explode * .68, .88, demolition);
    const glassX = lerp(explode * 1.00, .96, demolition);
    const masonryX = lerp(-explode * .34, -.78, demolition);
    const roofY = lerp(explode * .42, .52, demolition);
    const roofFrameY = lerp(explode * .20, .30, demolition);

    ctx.groups.facade.position.x = THREE.MathUtils.damp(ctx.groups.facade.position.x, facadeX, 5.2, dt);
    ctx.groups.glass.position.x = THREE.MathUtils.damp(ctx.groups.glass.position.x, glassX, 5.2, dt);
    ctx.groups.masonry.position.x = THREE.MathUtils.damp(ctx.groups.masonry.position.x, masonryX, 5.2, dt);
    ctx.groups.roof.position.y = THREE.MathUtils.damp(ctx.groups.roof.position.y, roofY, 5.2, dt);
    ctx.groups.roofFrame.position.y = THREE.MathUtils.damp(ctx.groups.roofFrame.position.y, roofFrameY, 5.2, dt);

    world.position.set(
      state.x + state.pointerX * .07,
      state.y - state.pointerY * .025,
      0
    );
    world.scale.setScalar(state.scale);
    world.rotation.y = state.rotation + state.pointerX * .022;
    world.rotation.x = -state.pointerY * .010;

    const layout = currentLayout();
    const phone = layout === "phone";
    const serviceWeightTotal = serviceKeys.reduce((sum, key) => sum + serviceWeights[key], 0);
    const serviceOffsetRaw = serviceKeys.reduce(
      (sum, key) => sum + serviceLook[key] * serviceWeights[key],
      0
    );
    const serviceOffset = serviceOffsetRaw / Math.max(1, serviceWeightTotal);

    camera.position.x = phone ? 0 : state.pointerX * .13;
    camera.position.y = (phone ? 2.42 : 2.62) - state.pointerY * .06;
    camera.position.z = state.cameraZ;
    camera.fov = state.fov;
    camera.updateProjectionMatrix();

    cameraTarget.set(phone ? 0 : state.pointerX * .02, state.lookY + serviceOffset, 0);
    camera.lookAt(cameraTarget);

    extra.grid.rotation.y = safeNow * .000006;

    renderer.render(scene, camera);

    if (import.meta.env.DEV) {
      window.__RJ_THREE_STATS__ = {
        quality: quality.name,
        calls: renderer.info.render.calls,
        triangles: renderer.info.render.triangles,
        geometries: renderer.info.memory.geometries,
        textures: renderer.info.memory.textures
      };
    }
  }

  function render(now) {
    if (destroyed || failed) return;
    try { updateFrame(now); } catch (error) { fail(error); }
  }

  const onContextLost = (event) => {
    event.preventDefault();
    renderer.setAnimationLoop(null);
    layer.classList.remove("three-ready");
    layer.classList.add("three-failed");
    layer.dataset.threeState = "context-lost";
  };

  const onContextRestored = () => {
    if (destroyed) return;
    failed = false;
    layer.classList.remove("three-failed");
    layer.classList.add("three-ready");
    layer.dataset.threeState = "ready";
    resize();
    last = performance.now();
    try {
      updateFrame(last);
      renderer.setAnimationLoop(render);
    } catch (error) {
      fail(error);
    }
  };

  const onVisibility = () => {
    if (destroyed || failed) return;
    if (document.hidden) renderer.setAnimationLoop(null);
    else {
      last = performance.now();
      renderer.setAnimationLoop(render);
    }
  };

  const resizeObserver = "ResizeObserver" in window
    ? new ResizeObserver(() => refreshLayout())
    : null;
  Object.values(mapped).flat().forEach((anchor) => resizeObserver?.observe(anchor.el));

  resize();
  updateFrame(performance.now());
  layer.dataset.threeState = "rendered";
  layer.dataset.threeQuality = quality.name;

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("orientationchange", refreshLayout, { passive: true });
  window.addEventListener("pointermove", pointer, { passive: true });
  canvas.addEventListener("webglcontextlost", onContextLost);
  canvas.addEventListener("webglcontextrestored", onContextRestored);
  document.addEventListener("visibilitychange", onVisibility);
  renderer.setAnimationLoop(render);

  return {
    quality: quality.name,
    ready: Promise.resolve(quality.name),
    refreshLayout,
    updateFromScroll,
    setService,
    clearService,
    destroy() {
      destroyed = true;
      renderer.setAnimationLoop(null);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", refreshLayout);
      window.removeEventListener("pointermove", pointer);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      document.removeEventListener("visibilitychange", onVisibility);
      Object.values(ctx.textures).forEach((texture) => texture.dispose());
      extra.roofTileGeometry?.dispose();
      extra.roofTileMaterial?.dispose();
      renderer.dispose();
    }
  };
}
