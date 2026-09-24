import * as THREE from "three";

export const clamp01 = (v) => Math.max(0, Math.min(1, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (a, b, v) => {
  const t = clamp01((v - a) / Math.max(.0001, b - a));
  return t * t * (3 - 2 * t);
};

const BOX = new THREE.BoxGeometry(1, 1, 1);
const CYL = new THREE.CylinderGeometry(1, 1, 1, 16);

export function canUseWebGL() {
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      depth: true,
      stencil: false
    });
    if (!context) return false;
    context.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

function seededNoise(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function makeTexture(kind, size) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const x = c.getContext("2d");
  const rand = seededNoise(kind.split("").reduce((a, ch) => a + ch.charCodeAt(0), 0) * 9973);
  const s = size / 256;

  if (kind === "concrete") {
    x.fillStyle = "#b9b6ae";
    x.fillRect(0, 0, size, size);
    for (let i = 0; i < size * 10; i++) {
      const v = 112 + Math.floor(rand() * 102);
      const alpha = .018 + rand() * .065;
      const r = (.55 + rand() * 1.7) * s;
      x.fillStyle = `rgba(${v},${v},${v},${alpha})`;
      x.fillRect(rand() * size, rand() * size, r, r);
    }
    x.strokeStyle = "rgba(70,72,68,.055)";
    x.lineWidth = Math.max(1, s);
    for (let i = 0; i < 9; i++) {
      x.beginPath();
      const y = rand() * size;
      x.moveTo(0, y);
      x.bezierCurveTo(size*.28, y+rand()*8*s, size*.72, y-rand()*8*s, size, y+rand()*5*s);
      x.stroke();
    }
  } else if (kind === "brick") {
    x.fillStyle = "#98573b";
    x.fillRect(0, 0, size, size);
    const course = 32 * s;
    const brick = 64 * s;
    x.strokeStyle = "rgba(226,211,192,.56)";
    x.lineWidth = Math.max(1.2, 1.8*s);
    for (let y = 0; y <= size; y += course) {
      x.beginPath(); x.moveTo(0, y); x.lineTo(size, y); x.stroke();
      const off = (Math.round(y/course) % 2) ? brick/2 : 0;
      for (let xx = -brick + off; xx <= size; xx += brick) {
        x.beginPath(); x.moveTo(xx, y); x.lineTo(xx, y + course); x.stroke();
      }
    }
    for (let i=0;i<size*3;i++) {
      x.fillStyle = `rgba(62,35,27,${.018+rand()*.045})`;
      x.fillRect(rand()*size,rand()*size,(1+rand()*3)*s,(1+rand()*2)*s);
    }
  } else if (kind === "roof") {
    x.fillStyle = "#292d2b";
    x.fillRect(0, 0, size, size);
    x.strokeStyle = "rgba(255,255,255,.10)";
    x.lineWidth = Math.max(1, s);
    for (let y = 0; y < size; y += 22*s) {
      x.beginPath(); x.moveTo(0,y); x.lineTo(size,y); x.stroke();
    }
    for (let xx = 0; xx < size; xx += 38*s) {
      x.beginPath(); x.moveTo(xx,0); x.lineTo(xx,size); x.stroke();
    }
    for (let i=0;i<size;i++) {
      const v=28+Math.floor(rand()*25);
      x.fillStyle=`rgba(${v},${v+3},${v+2},.05)`;
      x.fillRect(rand()*size,rand()*size,(1+rand()*4)*s,(1+rand()*2)*s);
    }
  } else if (kind === "wood") {
    x.fillStyle = "#73543a";
    x.fillRect(0,0,size,size);
    for(let i=0;i<42;i++){
      const y=(i/42)*size + (rand()-.5)*3*s;
      x.strokeStyle=`rgba(${74+Math.floor(rand()*50)},${47+Math.floor(rand()*32)},${28+Math.floor(rand()*25)},.18)`;
      x.lineWidth=Math.max(.7,1.1*s);
      x.beginPath(); x.moveTo(0,y); x.bezierCurveTo(size*.3,y+rand()*4*s,size*.7,y-rand()*4*s,size,y+rand()*3*s); x.stroke();
    }
  } else {
    x.fillStyle = "#dfdcd3";
    x.fillRect(0, 0, size, size);
    for (let i = 0; i < size * 4; i++) {
      const tone=50+Math.floor(rand()*45);
      x.fillStyle = `rgba(${tone},${tone},${tone-3},${rand()*.028})`;
      x.fillRect(rand()*size, rand()*size, Math.max(1,s), Math.max(1,s));
    }
  }

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  const repeat = kind === "roof" ? [4.8, 3.4] : kind === "wood" ? [1.2, 5] : [2.8, 2.8];
  t.repeat.set(...repeat);
  t.anisotropy = 4;
  return t;
}

const material = (color, roughness, metalness=0, map=null, extra={}) =>
  new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
    map,
    transparent: true,
    opacity: 1,
    ...extra
  });

export function createBuildContext(world, quality={}) {
  const textureSize = quality.textureSize || 256;
  const textures = {
    concrete: makeTexture("concrete", textureSize),
    brick: makeTexture("brick", textureSize),
    roof: makeTexture("roof", textureSize),
    plaster: makeTexture("plaster", textureSize),
    wood: makeTexture("wood", textureSize)
  };

  const m = {
    concrete: material(0xc5c1b8,.91,.015,textures.concrete),
    concreteDark: material(0x7d7a73,.94,.01,textures.concrete),
    brick: material(0xa15c3c,.93,0,textures.brick),
    plaster: material(0xe3e0d7,.89,.005,textures.plaster),
    plasterDark: material(0xa4a198,.91,.005,textures.plaster),
    steel: material(0x3a403f,.34,.72,null,{envMapIntensity:.7}),
    rebar: material(0x604035,.52,.54),
    timber: material(0x76563a,.80,.015,textures.wood),
    roof: material(0x292e2c,.76,.10,textures.roof),
    yellow: material(0xf2b600,.48,.16),
    dark: material(0x171a19,.50,.38)
  };

  m.glass = new THREE.MeshPhysicalMaterial({
    color: 0xb8c0bd,
    roughness: .11,
    metalness: 0,
    transmission: quality.transmission ? .32 : 0,
    thickness: .08,
    ior: 1.46,
    transparent: true,
    opacity: quality.transmission ? .56 : .68,
    depthWrite: false
  });

  const groups = Object.fromEntries(
    ["ground","foundation","concrete","masonry","roofFrame","roof","facade","glass","details","temporary","fence","plinth"]
      .map((key) => [key, new THREE.Group()])
  );
  Object.values(groups).forEach((group) => world.add(group));

  return { world, low: quality.name === "phone" || quality.name === "low", quality, textures, m, groups, parts:[] };
}

export function registerPart(ctx, group, mesh, start, end, o={}) {
  if (mesh.material && !Array.isArray(mesh.material)) {
    mesh.material.transparent = true;
    mesh.material.opacity = o.opacity ?? mesh.material.opacity ?? 1;
  }

  mesh.castShadow = o.castShadow ?? ctx.quality.shadows ?? true;
  mesh.receiveShadow = o.receiveShadow ?? true;

  mesh.userData = {
    ...mesh.userData,
    basePosition: mesh.position.clone(),
    baseScale: mesh.scale.clone(),
    start,
    end,
    reveal: o.reveal || o.axis || "y",
    kind: o.kind || "structure",
    tags: o.tags || [],
    fadeStart: o.fadeStart ?? null,
    fadeEnd: o.fadeEnd ?? null,
    opacity: o.opacity ?? 1
  };

  ctx.groups[group].add(mesh);
  ctx.parts.push(mesh);
  return mesh;
}

export function box(ctx, group, size, pos, materialRef, start, end, o={}) {
  const mesh = new THREE.Mesh(BOX, materialRef.clone());
  mesh.position.set(...pos);
  mesh.scale.set(...size);
  if (o.rotation) mesh.rotation.set(...o.rotation);
  return registerPart(ctx, group, mesh, start, end, o);
}

export function cylinder(ctx, group, radius, height, pos, materialRef, start, end, o={}) {
  const mesh = new THREE.Mesh(CYL, materialRef.clone());
  mesh.position.set(...pos);
  mesh.scale.set(radius, height, radius);
  if (o.rotation) mesh.rotation.set(...o.rotation);
  return registerPart(ctx, group, mesh, start, end, { ...o, reveal:o.reveal || o.axis || "y" });
}

export function outline(mesh, color=0x4b4a45, opacity=.14) {
  const line = new THREE.LineSegments(
    new THREE.EdgesGeometry(BOX),
    new THREE.LineBasicMaterial({ color, transparent:true, opacity, toneMapped:false })
  );
  line.userData.baseOpacity = opacity;
  mesh.add(line);
  return line;
}

export function outlineGeometry(mesh, geometry, color=0x4b4a45, opacity=.14) {
  const line = new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry),
    new THREE.LineBasicMaterial({ color, transparent:true, opacity, toneMapped:false })
  );
  line.userData.baseOpacity = opacity;
  mesh.add(line);
  return line;
}

export function updatePart(mesh, build, focusWeights, xray, demolition) {
  const d = mesh.userData;
  let amount = smooth(d.start, d.end, build);
  if (d.fadeStart !== null) amount *= 1 - smooth(d.fadeStart, d.fadeEnd, build);

  mesh.visible = amount > .002;
  mesh.position.copy(d.basePosition);
  mesh.scale.copy(d.baseScale);

  const f = Math.max(.001, amount);
  if (d.reveal === "x") {
    mesh.scale.x = d.baseScale.x * f;
  } else if (d.reveal === "z") {
    mesh.scale.z = d.baseScale.z * f;
  } else if (d.reveal === "all") {
    mesh.scale.multiplyScalar(.82 + f * .18);
  } else if (d.reveal === "fade") {
    // Keep final geometry stable; opacity carries the assembly.
  } else if (d.reveal === "drop") {
    mesh.scale.y = d.baseScale.y * f;
    mesh.position.y = d.basePosition.y + d.baseScale.y * (1 - f) * .5;
  } else {
    // Structural members grow from their bearing point, like a real erection sequence.
    mesh.scale.y = d.baseScale.y * f;
    mesh.position.y = d.basePosition.y - d.baseScale.y * (1 - f) * .5;
  }

  let opacity = amount * d.opacity;

  if (xray > .02 && ["facade","glass","plinth"].includes(d.kind)) {
    opacity *= 1 - xray * .86;
  }

  const weights = focusWeights || {};
  const focusValues = Object.values(weights);
  const maxFocus = focusValues.length ? Math.max(0, ...focusValues) : 0;

  if (maxFocus > .001) {
    let match = 0;
    Object.entries(weights).forEach(([key, weight]) => {
      if (weight <= .001 || key === "demolition") return;
      const eligible = key === "shell"
        ? d.tags.includes("shell") || d.tags.includes("concrete") || d.tags.includes("masonry")
        : d.tags.includes(key);
      if (eligible) match = Math.max(match, weight);
    });

    // At full focus, unrelated geometry rests at 24% opacity.
    // During a hover change both old/new systems remain readable while they cross-fade.
    opacity *= 1 - maxFocus * .76 + match * .76;
  }

  if (
    demolition > 0 &&
    (d.tags.includes("masonry") || ["facade","glass"].includes(d.kind))
  ) {
    mesh.position.x += Math.sign(d.basePosition.x || 1) * demolition * .62;
    mesh.position.y += demolition * .20;
    opacity *= 1 - demolition * .32;
  }

  if (Array.isArray(mesh.material)) {
    mesh.material.forEach((mat) => { mat.opacity = opacity; });
  } else if (mesh.material) {
    mesh.material.opacity = opacity;
  }

  mesh.children.forEach((child) => {
    if (child.material?.isLineBasicMaterial) {
      child.material.opacity = (child.userData.baseOpacity ?? .14) * opacity;
    }
  });

  if (mesh.material?.emissive) {
    let highlight = 0;
    Object.entries(focusWeights || {}).forEach(([key, weight]) => {
      if (key !== "demolition" && d.tags.includes(key)) highlight = Math.max(highlight, weight);
      if (key === "shell" && (
        d.tags.includes("shell") ||
        d.tags.includes("concrete") ||
        d.tags.includes("masonry")
      )) highlight = Math.max(highlight, weight);
    });
    mesh.material.emissive.setHex(highlight > .01 ? 0x302200 : 0);
    mesh.material.emissiveIntensity = .22 * highlight;
  }
}
