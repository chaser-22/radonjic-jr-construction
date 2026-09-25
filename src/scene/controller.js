import * as THREE from "three";
import { createBuildContext, lerp, smooth, updatePart } from "./shared.js";
import { addStructure } from "./structure.js";
import { addFinish } from "./finish.js";

const smootherStep01 = (value) => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * t * (t * (t * 6 - 15) + 10);
};

function chooseQuality() {
  const width = window.innerWidth;
  const memory = navigator.deviceMemory || 8;
  const cores = navigator.hardwareConcurrency || 8;
  const constrained = memory <= 4 || cores <= 4;

  if (width <= 760) {
    const phoneConstrained = memory <= 4 || cores <= 4 || width <= 340;
    return {
      name: "phone",
      constrained: phoneConstrained,
      dpr: phoneConstrained ? 1.5 : 2.0,
      textureSize: phoneConstrained ? 192 : 256,
      shadows: false,
      shadowSize: 0,
      roofRows: phoneConstrained ? 7 : 9,
      roofCols: phoneConstrained ? 9 : 12,
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
    antialias: true,
    alpha: true,
    premultipliedAlpha: true,
    powerPreference: "high-performance",
    stencil: false
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality.dpr));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = quality.name === "high" ? 1.18 : 1.12;
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = quality.shadows;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = quality.shadows;

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

  if (quality.name !== "phone") {
    const rim = new THREE.DirectionalLight(0xdfe7df, .42);
    rim.position.set(1, 8, -10);
    scene.add(rim);
  }

  const warm = new THREE.PointLight(
    0xf2b600,
    quality.name === "high" ? 2.8 : quality.name === "phone" ? .95 : 1.8,
    quality.name === "phone" ? 9 : 12,
    2
  );
  warm.position.set(-4.5, .9, 4.8);
  scene.add(warm);
  const baseWarmIntensity = warm.intensity;

  const world = new THREE.Group();
  scene.add(world);

  const ctx = createBuildContext(world, quality);
  const { xs, zs } = addStructure(ctx);
  const extra = addFinish(ctx, xs, zs);
  const roofTileBaseColor = extra.roofTileMaterial.color.clone();
  const serviceTint = new THREE.Color(0xf2b600);

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
  let lastCameraFov = camera.fov;
  let lastLayerOpacity = -1;
  let destroyed = false;
  let failed = false;
  let loopRunning = false;
  let idleFrames = 0;
  let layoutRevision = 0;
  let resizeFrame = 0;
  let lastWidth = 0;
  let lastHeight = 0;
  let lastPixelRatio = 0;
  let forceDraw = true;
  const offsetCache = new Map();
  const cameraTarget = new THREE.Vector3();
  const motionKeys = ["x","y","scale","rotation","opacity","xray","cameraZ","lookY","fov"];
  let lastTileBuild = -1;
  const intro = {
    active: false,
    played: false,
    elapsed: 0,
    duration: quality.name === "phone" ? 1500 : 1750
  };

  const desktopAnchors = [
    ["hero", ".hero", 3.02, -0.20, .94, -.42, 1, 0, 11.7, 1.24, 33.5],
    ["about", "#o-nama", 4.12, -.56, .44, .12, .06, 0, 12.4, 1.15, 34],
    ["structure", "#konstrukcija", 2.92, -.10, .76, .58, .86, .90, 11.35, 1.72, 32.5],
    ["work", "#radovi", 4.45, -.60, .30, .96, .03, 0, 12.8, 1.12, 34.5],
    ["services", "#usluge", 2.95, -.18, .70, -.56, .82, .08, 11.55, 1.36, 33],
    ["values", "#vrijednosti", -3.95, -.56, .34, .30, .03, 0, 12.8, 1.15, 34.5],
    ["process", "#proces", 4.15, -.60, .30, -.18, .03, 0, 12.8, 1.12, 34.5],
    ["contact", "#kontakt", -3.65, -.42, .40, .12, 0, 0, 12.5, 1.16, 34]
  ];

  const tabletAnchors = [
    ["hero", ".hero", 1.42, -.60, .75, -.38, .92, 0, 12.0, 1.16, 35.5],
    ["about", "#o-nama", 2.75, -.70, .40, .10, .03, 0, 12.8, 1.10, 36],
    ["structure", "#konstrukcija", 1.34, -.31, .65, .50, .76, .80, 11.8, 1.58, 34.5],
    ["work", "#radovi", 2.85, -.72, .28, .82, .01, 0, 13.0, 1.05, 36],
    ["services", "#usluge", 1.34, -.34, .61, -.48, .72, .06, 11.9, 1.32, 35],
    ["values", "#vrijednosti", -2.55, -.72, .28, .24, .01, 0, 13.0, 1.06, 36],
    ["process", "#proces", 2.65, -.72, .26, -.14, .01, 0, 13.0, 1.06, 36],
    ["contact", "#kontakt", -2.34, -.74, .30, .10, 0, 0, 12.9, 1.08, 36]
  ];

  const phoneAnchors = [
    ["hero", ".hero", .18, -1.52, .53, -.30, .88, 0, 12.85, .96, 38.5],
    ["about", "#o-nama", 0, -1.18, .40, .06, 0, 0, 13.1, 1.00, 38],
    ["structure", "#konstrukcija", .20, -.44, .59, .45, .72, .74, 12.45, 1.38, 37],
    ["work", "#radovi", 0, -1.05, .34, .72, 0, 0, 13.1, 1.00, 38],
    ["services", "#usluge", .10, -1.08, .55, -.44, .66, .05, 12.5, 1.24, 37.5],
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

  const sleepRenderer = () => {
    if (!loopRunning) return;
    renderer.setAnimationLoop(null);
    loopRunning = false;
  };

  const wakeRenderer = () => {
    forceDraw = true;
    if (
      loopRunning ||
      destroyed ||
      failed ||
      document.hidden ||
      document.documentElement.classList.contains("is-loading")
    ) {
      return;
    }

    last = performance.now();
    idleFrames = 0;
    loopRunning = true;
    renderer.setAnimationLoop(render);
  };

  const refreshLayout = () => {
    layoutRevision += 1;
    offsetCache.clear();
    forceDraw = true;
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
    resizeFrame = 0;
    const width = Math.max(1, window.innerWidth);
    const height = Math.max(1, window.innerHeight);
    const layout = currentLayout();
    const cap = layout === "phone" ? quality.dpr : layout === "tablet" ? Math.min(1.25, quality.dpr) : quality.dpr;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, cap);

    if (Math.abs(pixelRatio - lastPixelRatio) > .001) {
      renderer.setPixelRatio(pixelRatio);
      lastPixelRatio = pixelRatio;
    }

    if (width !== lastWidth || height !== lastHeight) {
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      lastWidth = width;
      lastHeight = height;
    }

    refreshLayout();
    wakeRenderer();
  };

  const scheduleResize = () => {
    if (resizeFrame) return;
    resizeFrame = requestAnimationFrame(resize);
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
    const t = index === anchors.length - 1
      ? 0
      : smootherStep01((center - offsets[index]) / span);

    for (let i = 0; i < motionKeys.length; i += 1) {
      const key = motionKeys[i];
      target[key] = lerp(a[key], b[key], t);
    }
    target.section = a.name;
    wakeRenderer();
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
  const lastServiceWeights = Object.fromEntries(serviceKeys.map((key) => [key, -1]));
  let lastModelBuild = -1;
  let lastModelXray = -1;
  let lastModelDemolition = -1;
  let lastModelSection = "";

  const setService = (key) => {
    if (target.focus === key) return;
    target.focus = key;
    wakeRenderer();
  };

  const clearService = () => {
    if (target.focus === null) return;
    target.focus = null;
    wakeRenderer();
  };

  const playIntro = () => {
    if (destroyed || failed) return;

    if (!intro.played) {
      state.build = target.buildTarget;
      for (let i = 0; i < motionKeys.length; i += 1) {
        const key = motionKeys[i];
        state[key] = target[key];
      }
      state.pointerX = target.pointerX;
      state.pointerY = target.pointerY;
      state.section = target.section;
      state.focus = target.section === "services" ? target.focus : null;
      lastModelBuild = -1;
      lastModelXray = -1;
      lastModelDemolition = -1;
      lastModelSection = "";
    }

    wakeRenderer();

    if (reduced || intro.played) return;
    intro.played = true;
    intro.active = true;
    intro.elapsed = 0;
  };

  const pointer = (event) => {
    if (quality.name === "phone" || reduced) return;
    const nextX = (event.clientX / Math.max(1, window.innerWidth) - .5) * 2;
    const nextY = (event.clientY / Math.max(1, window.innerHeight) - .5) * 2;
    if (Math.abs(nextX - target.pointerX) < .002 && Math.abs(nextY - target.pointerY) < .002) return;
    target.pointerX = nextX;
    target.pointerY = nextY;
    wakeRenderer();
  };

  function fail(error) {
    if (failed || destroyed) return;
    failed = true;
    sleepRenderer();
    layer.classList.remove("three-ready");
    layer.classList.add("three-failed");
    layer.dataset.threeState = "failed";
    console.error("Three.js render failed", error);
  }

  function updateRoofInstances(build) {
    if (!extra.roofTileData || Math.abs(build - lastTileBuild) < .001) return;
    lastTileBuild = build;
    const { mesh, entries, dummy } = extra.roofTileData;

    for (let index = 0; index < entries.length; index += 1) {
      const entry = entries[index];
      const amount = smooth(entry.start, entry.start + .055, build);
      dummy.position.copy(entry.position);
      dummy.rotation.copy(entry.rotation);
      dummy.scale.set(entry.scale.x * Math.max(.001, amount), entry.scale.y, entry.scale.z);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  }

  function updateFrame(now) {
    const safeNow = Number.isFinite(now) ? now : performance.now();
    const rawDt = Math.max(.001, (safeNow - last) / 1000);
    const dt = reduced ? 1 : Math.min(1 / 30, rawDt);
    last = safeNow;

    const damping = reduced ? 100 : 5.4;
    const buildDamping = reduced ? 100 : 7.8;
    const serviceDamping = reduced ? 100 : 5.2;

    state.build = THREE.MathUtils.damp(state.build, target.buildTarget, buildDamping, dt);

    let stateMoving = Math.abs(state.build - target.buildTarget) > .00045;
    for (let i = 0; i < motionKeys.length; i += 1) {
      const key = motionKeys[i];
      state[key] = THREE.MathUtils.damp(state[key], target[key], damping, dt);
      if (Math.abs(state[key] - target[key]) > .00045) stateMoving = true;
    }

    state.pointerX = THREE.MathUtils.damp(state.pointerX, target.pointerX, 4.3, dt);
    state.pointerY = THREE.MathUtils.damp(state.pointerY, target.pointerY, 4.3, dt);
    if (
      Math.abs(state.pointerX - target.pointerX) > .00045 ||
      Math.abs(state.pointerY - target.pointerY) > .00045
    ) {
      stateMoving = true;
    }

    state.section = target.section;
    state.focus = target.section === "services" ? target.focus : null;

    let introAlpha = 1;
    let introLift = 0;
    let introScale = 1;
    let introTurn = 0;
    let introTilt = 0;
    let introCamera = 0;
    let introGlow = 0;

    if (intro.active) {
      intro.elapsed = Math.min(intro.duration, intro.elapsed + dt * 1000);
      const raw = intro.elapsed / intro.duration;
      const ease = 1 - Math.pow(1 - raw, 3);
      const c1 = 1.16;
      const c3 = c1 + 1;
      const back = 1 + c3 * Math.pow(raw - 1, 3) + c1 * Math.pow(raw - 1, 2);

      introAlpha = smooth(0, .17, raw);
      introLift = (1 - ease) * 1.18;
      introScale = .78 + .22 * back;
      introTurn = (1 - ease) * -.66;
      introTilt = (1 - ease) * -.055;
      introCamera = (1 - ease) * 1.45;
      introGlow = Math.sin(Math.PI * raw);

      if (raw >= 1) intro.active = false;
      else stateMoving = true;
    }

    let serviceMoving = false;
    for (let i = 0; i < serviceKeys.length; i += 1) {
      const key = serviceKeys[i];
      const serviceTarget = state.focus === key ? 1 : 0;
      serviceWeights[key] = THREE.MathUtils.damp(
        serviceWeights[key],
        serviceTarget,
        serviceDamping,
        dt
      );
      if (Math.abs(serviceWeights[key] - serviceTarget) > .00045) serviceMoving = true;
    }

    state.demolition = serviceWeights.demolition;

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

    const groupMoving =
      Math.abs(ctx.groups.facade.position.x - facadeX) > .00045 ||
      Math.abs(ctx.groups.glass.position.x - glassX) > .00045 ||
      Math.abs(ctx.groups.masonry.position.x - masonryX) > .00045 ||
      Math.abs(ctx.groups.roof.position.y - roofY) > .00045 ||
      Math.abs(ctx.groups.roofFrame.position.y - roofFrameY) > .00045;

    let modelDirty =
      Math.abs(state.build - lastModelBuild) > .00045 ||
      Math.abs(state.xray - lastModelXray) > .00045 ||
      Math.abs(state.demolition - lastModelDemolition) > .00045 ||
      state.section !== lastModelSection;

    for (let i = 0; i < serviceKeys.length; i += 1) {
      const key = serviceKeys[i];
      if (Math.abs(serviceWeights[key] - lastServiceWeights[key]) > .00045) {
        modelDirty = true;
        break;
      }
    }

    const requestedDraw = forceDraw;
    const fullyHidden = target.opacity <= .001 && state.opacity < .012 && !intro.active;
    const motionActive = stateMoving || serviceMoving || groupMoving || modelDirty || intro.active;

    if (fullyHidden && !requestedDraw && safeNow - lastIdleDraw < 160) return;

    if (!motionActive && !requestedDraw) {
      idleFrames += 1;
      if (idleFrames >= 2) sleepRenderer();
      return;
    }

    idleFrames = 0;
    forceDraw = false;
    lastIdleDraw = safeNow;

    const layerOpacity = state.opacity * introAlpha;
    if (Math.abs(layerOpacity - lastLayerOpacity) > .0015) {
      layer.style.opacity = String(layerOpacity);
      lastLayerOpacity = layerOpacity;
    }

    if (modelDirty) {
      for (let i = 0; i < ctx.parts.length; i += 1) {
        updatePart(ctx.parts[i], state.build, serviceWeights, state.xray, state.demolition);
      }

      const tileBuild = smooth(.76, .94, state.build);
      const maxServiceFocus = Math.max(
        serviceWeights.shell,
        serviceWeights.foundation,
        serviceWeights.concrete,
        serviceWeights.masonry,
        serviceWeights.roof,
        serviceWeights.fence,
        serviceWeights.plinth,
        serviceWeights.demolition,
        serviceWeights.prep
      );
      const roofMatch = Math.max(serviceWeights.roof, serviceWeights.shell);
      const roofFocusFactor = 1 - maxServiceFocus * .92 + roofMatch * .92;
      let tileOpacity = tileBuild * roofFocusFactor;
      if (state.xray > .02) tileOpacity *= 1 - state.xray * .30;

      extra.roofTileMaterial.opacity = tileOpacity;
      extra.roofTileMaterial.color.copy(roofTileBaseColor).lerp(serviceTint, roofMatch * .24);
      extra.roofTileMaterial.emissive.setHex(roofMatch > .01 ? 0x6b4d00 : 0);
      extra.roofTileMaterial.emissiveIntensity = .72 * roofMatch;
      extra.roofTiles.visible = tileOpacity > .002;
      updateRoofInstances(state.build);

      const craneAlpha = smooth(.10,.20,state.build) * (1 - smooth(.70,.82,state.build));
      extra.crane.visible = state.section === "hero" && craneAlpha > .01;
      extra.yellow.opacity = craneAlpha;
      extra.dark.opacity = craneAlpha;
      extra.pivot.rotation.y = -.42 + smooth(.15,.76,state.build) * .92;

      lastModelBuild = state.build;
      lastModelXray = state.xray;
      lastModelDemolition = state.demolition;
      lastModelSection = state.section;
      for (let i = 0; i < serviceKeys.length; i += 1) {
        const key = serviceKeys[i];
        lastServiceWeights[key] = serviceWeights[key];
      }
    }

    const ghost = 1 - smooth(.05, .86, state.build);
    extra.ghostMat.opacity = .045 + ghost * .38 + state.xray * .12 + introGlow * .12;
    extra.accent.opacity = .06 + ghost * .68 + state.xray * .16 + introGlow * .26;
    extra.ghostFillMat.opacity = .008 + ghost * .035 + introGlow * .022;
    warm.intensity = baseWarmIntensity * (1 + introGlow * .72);

    world.position.set(
      state.x + state.pointerX * .07,
      state.y - state.pointerY * .025 + introLift,
      0
    );
    world.scale.setScalar(state.scale * introScale);
    world.rotation.y = state.rotation + state.pointerX * .022 + introTurn;
    world.rotation.x = -state.pointerY * .010 + introTilt;

    const layout = currentLayout();
    const phone = layout === "phone";
    const shellWeight = serviceWeights.shell;
    const foundationWeight = serviceWeights.foundation;
    const concreteWeight = serviceWeights.concrete;
    const masonryWeight = serviceWeights.masonry;
    const roofWeight = serviceWeights.roof;
    const fenceWeight = serviceWeights.fence;
    const plinthWeight = serviceWeights.plinth;
    const demolitionWeight = serviceWeights.demolition;
    const prepWeight = serviceWeights.prep;

    const serviceWeightTotal =
      shellWeight + foundationWeight + concreteWeight + masonryWeight +
      roofWeight + fenceWeight + plinthWeight + demolitionWeight + prepWeight;

    const serviceOffsetRaw =
      serviceLook.shell * shellWeight +
      serviceLook.foundation * foundationWeight +
      serviceLook.concrete * concreteWeight +
      serviceLook.masonry * masonryWeight +
      serviceLook.roof * roofWeight +
      serviceLook.fence * fenceWeight +
      serviceLook.plinth * plinthWeight +
      serviceLook.demolition * demolitionWeight +
      serviceLook.prep * prepWeight;

    const serviceOffset = serviceOffsetRaw / Math.max(1, serviceWeightTotal);

    camera.position.x = phone ? 0 : state.pointerX * .13;
    camera.position.y = (phone ? 2.42 : 2.62) - state.pointerY * .06;
    camera.position.z = state.cameraZ + introCamera;
    camera.fov = state.fov;

    if (Math.abs(camera.fov - lastCameraFov) > .01) {
      camera.updateProjectionMatrix();
      lastCameraFov = camera.fov;
    }

    cameraTarget.set(phone ? 0 : state.pointerX * .02, state.lookY + serviceOffset, 0);
    camera.lookAt(cameraTarget);

    if (!phone && motionActive) {
      extra.grid.rotation.y += dt * .006;
    }

    if (quality.shadows && (modelDirty || stateMoving || groupMoving || intro.active || requestedDraw)) {
      renderer.shadowMap.needsUpdate = true;
    }

    renderer.render(scene, camera);

    if (import.meta.env.DEV) {
      window.__RJ_THREE_STATS__ = {
        quality: quality.name,
        calls: renderer.info.render.calls,
        triangles: renderer.info.render.triangles,
        geometries: renderer.info.memory.geometries,
        textures: renderer.info.memory.textures,
        active: motionActive,
        dpr: renderer.getPixelRatio()
      };
    }
  }

  function render(now) {
    if (destroyed || failed) return;
    try { updateFrame(now); } catch (error) { fail(error); }
  }

  const onContextLost = (event) => {
    event.preventDefault();
    sleepRenderer();
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
    forceDraw = true;

    wakeRenderer();
  };

  const onVisibility = () => {
    if (destroyed || failed) return;

    if (document.hidden) {
      sleepRenderer();
      return;
    }

    wakeRenderer();
  };

  const resizeObserver = "ResizeObserver" in window
    ? new ResizeObserver(() => refreshLayout())
    : null;
  Object.values(mapped).flat().forEach((anchor) => resizeObserver?.observe(anchor.el));

  resize();
  layer.dataset.threeState = "ready";
  layer.dataset.threeQuality = quality.name;

  window.addEventListener("resize", scheduleResize, { passive: true });
  window.visualViewport?.addEventListener("resize", scheduleResize, { passive: true });
  window.addEventListener("orientationchange", scheduleResize, { passive: true });
  window.addEventListener("pointermove", pointer, { passive: true });
  canvas.addEventListener("webglcontextlost", onContextLost);
  canvas.addEventListener("webglcontextrestored", onContextRestored);
  document.addEventListener("visibilitychange", onVisibility);

  if (!document.documentElement.classList.contains("is-loading")) {
    wakeRenderer();
  }

  return {
    quality: quality.name,
    ready: Promise.resolve(quality.name),
    refreshLayout,
    updateFromScroll,
    setService,
    clearService,
    playIntro,
    destroy() {
      destroyed = true;
      sleepRenderer();
      resizeObserver?.disconnect();
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      window.removeEventListener("resize", scheduleResize);
      window.visualViewport?.removeEventListener("resize", scheduleResize);
      window.removeEventListener("orientationchange", scheduleResize);
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
