import * as THREE from "three";
import { createBuildContext, lerp, smooth, updatePart } from "./shared.js";
import { addStructure } from "./structure.js";
import { addFinish } from "./finish.js";

export function createHouseScene(layer, canvas) {
  const initialPhone = window.innerWidth <= 760;
  const initialTablet = window.innerWidth > 760 && window.innerWidth <= 1024;
  const low = window.innerWidth < 1024 || (navigator.deviceMemory && navigator.deviceMemory <= 4);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !low,
    alpha: true,
    premultipliedAlpha: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, initialPhone ? 1 : initialTablet ? 1.2 : low ? 1.25 : 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = !low;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(initialPhone ? 38 : initialTablet ? 36 : 34, 1, 0.1, 70);
  camera.position.set(0, initialPhone ? 2.45 : 2.6, initialPhone ? 12.6 : initialTablet ? 12.1 : 11.8);

  scene.add(new THREE.HemisphereLight(0xfff4df, 0x303634, 2.35));

  const key = new THREE.DirectionalLight(0xffe4b8, 4.4);
  key.position.set(7, 10, 8);
  if (!low) {
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, { left: -8, right: 8, top: 10, bottom: -5 });
    key.shadow.camera.updateProjectionMatrix();
    key.shadow.bias = -0.0005;
  }
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x9bb7ca, 1.35);
  fill.position.set(-7, 4, -6);
  scene.add(fill);

  const warm = new THREE.PointLight(0xf2b600, 10, 14, 2);
  warm.position.set(-4, 1.2, 4.5);
  scene.add(warm);

  const world = new THREE.Group();
  scene.add(world);

  const ctx = createBuildContext(world, low);
  const { xs, zs } = addStructure(ctx);
  const extra = addFinish(ctx, xs, zs);

  const state = {
    build: 0,
    x: 2.15,
    y: -0.24,
    scale: 1.0,
    rotation: -0.43,
    opacity: 1,
    xray: 0,
    pointerX: 0,
    pointerY: 0,
    section: "hero",
    focus: null,
    demolition: 0
  };
  const target = { ...state, buildTarget: 0 };

  let last = performance.now();
  let lastIdleDraw = 0;
  let destroyed = false;
  let failed = false;

  const desktopAnchors = [
    ["hero", ".hero", 3.05, -0.24, 0.92, -0.43, 1, 0],
    ["about", "#o-nama", 4.10, -0.58, 0.44, 0.16, 0.08, 0],
    ["structure", "#konstrukcija", 3.05, -0.14, 0.72, 0.52, 0.82, 0.88],
    ["work", "#radovi", 4.35, -0.62, 0.30, 1.02, 0.04, 0],
    ["services", "#usluge", 3.15, -0.20, 0.66, -0.54, 0.78, 0.10],
    ["values", "#vrijednosti", -3.85, -0.56, 0.36, 0.38, 0.04, 0],
    ["process", "#proces", 4.10, -0.62, 0.32, -0.22, 0.04, 0],
    ["contact", "#kontakt", -3.55, -0.42, 0.44, 0.18, 0.08, 0]
  ];

  const tabletAnchors = [
    ["hero", ".hero", 1.45, -0.62, 0.74, -0.38, 0.92, 0],
    ["about", "#o-nama", 2.70, -0.70, 0.42, 0.10, 0.04, 0],
    ["structure", "#konstrukcija", 1.35, -0.34, 0.64, 0.48, 0.76, 0.78],
    ["work", "#radovi", 2.80, -0.72, 0.30, 0.88, 0.02, 0],
    ["services", "#usluge", 1.35, -0.36, 0.60, -0.48, 0.70, 0.08],
    ["values", "#vrijednosti", -2.50, -0.72, 0.30, 0.30, 0.02, 0],
    ["process", "#proces", 2.60, -0.72, 0.28, -0.18, 0.02, 0],
    ["contact", "#kontakt", -2.30, -0.74, 0.32, 0.12, 0.02, 0]
  ];

  const phoneAnchors = [
    ["hero", ".hero", 0.28, -1.18, 0.58, -0.34, 0.88, 0],
    ["about", "#o-nama", 0.00, -1.18, 0.42, 0.08, 0.00, 0],
    ["structure", "#konstrukcija", 0.24, -0.46, 0.58, 0.44, 0.72, 0.72],
    ["work", "#radovi", 0.00, -1.05, 0.36, 0.80, 0.00, 0],
    ["services", "#usluge", 0.18, -0.54, 0.54, -0.44, 0.66, 0.06],
    ["values", "#vrijednosti", 0.00, -1.02, 0.32, 0.24, 0.00, 0],
    ["process", "#proces", 0.00, -1.04, 0.30, -0.16, 0.00, 0],
    ["contact", "#kontakt", 0.00, -1.10, 0.30, 0.08, 0.00, 0]
  ];

  const mapAnchors = (source) =>
    source
      .map(([name, sel, x, y, scale, rotation, opacity, xray]) => ({
        name,
        el: document.querySelector(sel),
        x,
        y,
        scale,
        rotation,
        opacity,
        xray
      }))
      .filter((anchor) => anchor.el);

  const mappedDesktopAnchors = mapAnchors(desktopAnchors);
  const mappedTabletAnchors = mapAnchors(tabletAnchors);
  const mappedPhoneAnchors = mapAnchors(phoneAnchors);

  const currentLayout = () =>
    window.innerWidth <= 760 ? "phone" : window.innerWidth <= 1024 ? "tablet" : "desktop";

  const getAnchors = () => {
    const layout = currentLayout();
    return layout === "phone"
      ? mappedPhoneAnchors
      : layout === "tablet"
        ? mappedTabletAnchors
        : mappedDesktopAnchors;
  };

  const resize = () => {
    const width = Math.max(1, window.innerWidth);
    const height = Math.max(1, window.innerHeight);
    const layout = currentLayout();
    const phone = layout === "phone";
    const tablet = layout === "tablet";

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, phone ? 1 : tablet ? 1.2 : low ? 1.25 : 1.5));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = phone ? 38 : tablet ? 36 : 34;
    camera.updateProjectionMatrix();
  };

  const offset = (anchor) =>
    anchor.el.offsetTop + Math.min(anchor.el.offsetHeight * 0.35, window.innerHeight * 0.58);

  function updateFromScroll(build) {
    target.buildTarget = build;

    const anchors = getAnchors();
    const center = window.scrollY + window.innerHeight * 0.52;
    const offsets = anchors.map(offset);
    let index = 0;

    while (index < offsets.length - 1 && center > offsets[index + 1]) index += 1;

    const a = anchors[index];
    const b = anchors[Math.min(index + 1, anchors.length - 1)];
    const nextOffset = offsets[Math.min(index + 1, offsets.length - 1)];
    const span = Math.max(1, nextOffset - offsets[index]);
    const t = index === anchors.length - 1 ? 0 : smooth(0, 1, (center - offsets[index]) / span);
    target.x = lerp(a.x, b.x, t);
    target.y = lerp(a.y, b.y, t);
    target.scale = lerp(a.scale, b.scale, t);
    target.rotation = lerp(a.rotation, b.rotation, t);
    target.opacity = lerp(a.opacity, b.opacity, t);
    target.xray = lerp(a.xray, b.xray, t);
    target.section = a.name;
  }

  const setService = (key) => {
    target.focus = key;
  };

  const clearService = () => {
    target.focus = null;
  };

  const pointer = (event) => {
    if (low || reduced) return;
    target.pointerX = (event.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
    target.pointerY = (event.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
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

  function updateFrame(now) {
    const safeNow = Number.isFinite(now) ? now : performance.now();
    const dt = Math.min(0.05, Math.max(0.001, (safeNow - last) / 1000));
    last = safeNow;
    const damping = reduced ? 100 : 5;

    state.build = THREE.MathUtils.damp(state.build, target.buildTarget, reduced ? 100 : 7, dt);
    ["x", "y", "scale", "rotation", "opacity", "xray"].forEach((keyName) => {
      state[keyName] = THREE.MathUtils.damp(state[keyName], target[keyName], damping, dt);
    });

    state.pointerX = THREE.MathUtils.damp(state.pointerX, target.pointerX, 4, dt);
    state.pointerY = THREE.MathUtils.damp(state.pointerY, target.pointerY, 4, dt);
    state.section = target.section;
    state.focus = target.section === "services" ? target.focus : null;

    layer.style.opacity = String(state.opacity);
    if (currentLayout() === "phone" && target.opacity <= .001 && state.opacity < .015) {
      if (safeNow - lastIdleDraw < 250) return;
      lastIdleDraw = safeNow;
    }

    state.demolition = THREE.MathUtils.damp(
      state.demolition,
      state.focus === "demolition" ? 1 : 0,
      5,
      dt
    );

    ctx.parts.forEach((part) =>
      updatePart(part, state.build, state.focus, state.xray, state.demolition)
    );

    const ghost = 1 - smooth(0.05, 0.88, state.build);
    extra.ghostMat.opacity = 0.06 + ghost * 0.42 + state.xray * 0.16;
    extra.accent.opacity = 0.08 + ghost * 0.72 + state.xray * 0.18;
    extra.ghostFillMat.opacity = 0.012 + ghost * 0.05;

    const tileBuild = smooth(0.78, 0.93, state.build);
    let tileOpacity = tileBuild;
    if (state.focus && !["roof", "shell"].includes(state.focus)) tileOpacity *= 0.14;
    if (state.xray > 0.02) tileOpacity *= 1 - state.xray * 0.34;
    extra.roofTileMaterial.opacity = tileOpacity;
    extra.roofTiles.visible = tileOpacity > 0.002;

    const craneAlpha =
      smooth(0.10, 0.20, state.build) * (1 - smooth(0.72, 0.84, state.build));
    extra.crane.visible = state.section === "hero" && craneAlpha > 0.01;
    extra.yellow.opacity = craneAlpha;
    extra.dark.opacity = craneAlpha;
    extra.pivot.rotation.y = -0.42 + smooth(0.15, 0.78, state.build) * 0.95;

    const explode = state.xray;
    ctx.groups.facade.position.x = THREE.MathUtils.damp(
      ctx.groups.facade.position.x,
      explode * 0.62,
      5,
      dt
    );
    ctx.groups.glass.position.x = THREE.MathUtils.damp(
      ctx.groups.glass.position.x,
      explode * 0.92,
      5,
      dt
    );
    ctx.groups.masonry.position.x = THREE.MathUtils.damp(
      ctx.groups.masonry.position.x,
      -explode * 0.30,
      5,
      dt
    );
    ctx.groups.roof.position.y = THREE.MathUtils.damp(
      ctx.groups.roof.position.y,
      explode * 0.36,
      5,
      dt
    );

    if (state.focus === "demolition") {
      ctx.groups.masonry.position.x = THREE.MathUtils.damp(
        ctx.groups.masonry.position.x,
        -0.72,
        5,
        dt
      );
      ctx.groups.facade.position.x = THREE.MathUtils.damp(
        ctx.groups.facade.position.x,
        0.82,
        5,
        dt
      );
      ctx.groups.roof.position.y = THREE.MathUtils.damp(
        ctx.groups.roof.position.y,
        0.48,
        5,
        dt
      );
    }

    world.position.set(
      state.x + state.pointerX * 0.08,
      state.y - state.pointerY * 0.03,
      0
    );
    world.scale.setScalar(state.scale);
    world.rotation.y = state.rotation + state.pointerX * 0.025;
    world.rotation.x = -state.pointerY * 0.012;

    const layout = currentLayout();
    const phone = layout === "phone";
    const tablet = layout === "tablet";

    camera.position.x = phone ? 0 : state.pointerX * 0.16;
    camera.position.y = (phone ? 2.45 : 2.6) - state.pointerY * 0.08;
    camera.position.z = phone ? 12.6 : tablet ? 12.1 : 11.8;
    camera.lookAt(0, phone ? 1.05 : 1.15, 0);

    extra.grid.rotation.y = safeNow * 0.00001;

    renderer.render(scene, camera);

    if (import.meta.env.DEV) {
      window.__RJ_THREE_STATS__ = {
        calls: renderer.info.render.calls,
        triangles: renderer.info.render.triangles,
        geometries: renderer.info.memory.geometries,
        textures: renderer.info.memory.textures
      };
    }
  }

  function render(now) {
    if (destroyed || failed) return;
    try {
      updateFrame(now);
    } catch (error) {
      fail(error);
    }
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
    if (document.hidden) {
      renderer.setAnimationLoop(null);
    } else {
      last = performance.now();
      renderer.setAnimationLoop(render);
    }
  };

  resize();

  // Render one frame synchronously. The canvas is not marked ready unless this succeeds.
  updateFrame(performance.now());
  layer.dataset.threeState = "rendered";

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pointermove", pointer, { passive: true });
  canvas.addEventListener("webglcontextlost", onContextLost);
  canvas.addEventListener("webglcontextrestored", onContextRestored);
  document.addEventListener("visibilitychange", onVisibility);
  renderer.setAnimationLoop(render);

  return {
    updateFromScroll,
    setService,
    clearService,
    destroy() {
      destroyed = true;
      renderer.setAnimationLoop(null);
      window.removeEventListener("resize", resize);
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
