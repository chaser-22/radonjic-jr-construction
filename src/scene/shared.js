import * as THREE from "three";

export const clamp01 = (v) => Math.max(0, Math.min(1, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (a, b, v) => {
  const t = clamp01((v - a) / Math.max(.0001, b - a));
  return t * t * (3 - 2 * t);
};

const BOX = new THREE.BoxGeometry(1, 1, 1);
const CYL = new THREE.CylinderGeometry(1, 1, 1, 12);

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

function texture(kind) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const x = c.getContext("2d");

  if (kind === "concrete") {
    x.fillStyle = "#bbb7ad";
    x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 2200; i++) {
      const v = 135 + Math.floor(Math.random() * 75);
      x.fillStyle = `rgba(${v},${v},${v},${.02 + Math.random() * .05})`;
      x.fillRect(Math.random()*256, Math.random()*256, 1 + Math.random()*2, 1 + Math.random()*2);
    }
  } else if (kind === "brick") {
    x.fillStyle = "#9b5a3c";
    x.fillRect(0, 0, 256, 256);
    x.strokeStyle = "rgba(235,215,190,.42)";
    x.lineWidth = 2;
    for (let y = 0; y <= 256; y += 32) {
      x.beginPath();
      x.moveTo(0, y);
      x.lineTo(256, y);
      x.stroke();
      const off = (y/32)%2 ? 32 : 0;
      for (let xx = -64 + off; xx <= 256; xx += 64) {
        x.beginPath();
        x.moveTo(xx, y);
        x.lineTo(xx, y + 32);
        x.stroke();
      }
    }
  } else if (kind === "roof") {
    x.fillStyle = "#252927";
    x.fillRect(0, 0, 256, 256);
    x.strokeStyle = "rgba(255,255,255,.09)";
    x.lineWidth = 1;
    for (let y = 0; y < 256; y += 24) {
      x.beginPath();
      x.moveTo(0, y);
      x.lineTo(256, y);
      x.stroke();
    }
    for (let xx = 0; xx < 256; xx += 42) {
      x.beginPath();
      x.moveTo(xx, 0);
      x.lineTo(xx, 256);
      x.stroke();
    }
  } else {
    x.fillStyle = "#e0ddd4";
    x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 800; i++) {
      x.fillStyle = `rgba(60,60,55,${Math.random()*.035})`;
      x.fillRect(Math.random()*256, Math.random()*256, 1, 1);
    }
  }

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(kind === "roof" ? 4 : 2.5, kind === "roof" ? 3 : 2.5);
  return t;
}

const material = (color, roughness, metalness=0, map=null) =>
  new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
    map,
    transparent: true,
    opacity: 1
  });

export function createBuildContext(world, low) {
  const textures = {
    concrete: texture("concrete"),
    brick: texture("brick"),
    roof: texture("roof"),
    plaster: texture("plaster")
  };

  const m = {
    concrete: material(0xc3bfb5,.88,.02,textures.concrete),
    concreteDark: material(0x79766e,.92,.01,textures.concrete),
    brick: material(0x9b5b3d,.92,0,textures.brick),
    plaster: material(0xe3dfd5,.86,.01,textures.plaster),
    plasterDark: material(0xa7a49c,.88,.01,textures.plaster),
    steel: material(0x3c4140,.46,.68),
    rebar: material(0x5a3d33,.55,.48),
    timber: material(0x75583d,.78,.02),
    roof: material(0x252a29,.72,.12,textures.roof),
    yellow: material(0xf2b600,.5,.18),
    dark: material(0x181b1a,.62,.32)
  };

  m.glass = new THREE.MeshPhysicalMaterial({
    color: 0x8ca0a6,
    roughness: .16,
    transmission: low ? 0 : .16,
    transparent: true,
    opacity: low ? .62 : .72,
    depthWrite: false
  });

  const groups = Object.fromEntries(
    ["ground","foundation","concrete","masonry","roofFrame","roof","facade","glass","details","temporary","fence","plinth"]
      .map((key) => [key, new THREE.Group()])
  );
  Object.values(groups).forEach((group) => world.add(group));

  return { world, low, textures, m, groups, parts:[] };
}

export function registerPart(ctx, group, mesh, start, end, o={}) {
  if (mesh.material && !Array.isArray(mesh.material)) {
    mesh.material.transparent = true;
    mesh.material.opacity = o.opacity ?? mesh.material.opacity ?? 1;
  }

  mesh.castShadow = o.castShadow ?? true;
  mesh.receiveShadow = o.receiveShadow ?? true;

  mesh.userData = {
    ...mesh.userData,
    basePosition: mesh.position.clone(),
    baseScale: mesh.scale.clone(),
    start,
    end,
    axis: o.axis || "y",
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
  return registerPart(ctx, group, mesh, start, end, { ...o, axis:o.axis || "y" });
}

export function outline(mesh, color=0x4b4a45, opacity=.16) {
  const line = new THREE.LineSegments(
    new THREE.EdgesGeometry(BOX),
    new THREE.LineBasicMaterial({ color, transparent:true, opacity })
  );
  line.userData.baseOpacity = opacity;
  mesh.add(line);
  return line;
}

export function outlineGeometry(mesh, geometry, color=0x4b4a45, opacity=.16) {
  const line = new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry),
    new THREE.LineBasicMaterial({ color, transparent:true, opacity })
  );
  line.userData.baseOpacity = opacity;
  mesh.add(line);
  return line;
}

export function updatePart(mesh, build, focus, xray, demolition) {
  const d = mesh.userData;
  let amount = smooth(d.start, d.end, build);
  if (d.fadeStart !== null) amount *= 1 - smooth(d.fadeStart, d.fadeEnd, build);

  mesh.visible = amount > .002;
  mesh.position.copy(d.basePosition);
  mesh.scale.copy(d.baseScale);

  const f = Math.max(.001, amount);
  if (d.axis === "x") {
    mesh.scale.x = d.baseScale.x * f;
  } else if (d.axis === "z") {
    mesh.scale.z = d.baseScale.z * f;
  } else if (d.axis === "all") {
    mesh.scale.multiplyScalar(f);
  } else {
    mesh.scale.y = d.baseScale.y * f;
    mesh.position.y = d.basePosition.y - d.baseScale.y * (1 - f) * .5;
  }

  let opacity = amount * d.opacity;

  if (xray > .02 && ["facade","glass","plinth"].includes(d.kind)) {
    opacity *= 1 - xray * .84;
  }

  if (focus && focus !== "shell" && focus !== "demolition") {
    opacity *= d.tags.includes(focus) ? 1 : .18;
  } else if (focus === "shell") {
    opacity *= (
      d.tags.includes("shell") ||
      d.tags.includes("concrete") ||
      d.tags.includes("masonry")
    ) ? 1 : .28;
  }

  if (
    demolition > 0 &&
    (d.tags.includes("masonry") || ["facade","glass"].includes(d.kind))
  ) {
    mesh.position.x += Math.sign(d.basePosition.x || 1) * demolition * .55;
    mesh.position.y += demolition * .18;
    opacity *= 1 - demolition * .35;
  }

  if (Array.isArray(mesh.material)) {
    mesh.material.forEach((mat) => { mat.opacity = opacity; });
  } else if (mesh.material) {
    mesh.material.opacity = opacity;
  }

  mesh.children.forEach((child) => {
    if (child.material?.isLineBasicMaterial) {
      child.material.opacity = (child.userData.baseOpacity ?? .16) * opacity;
    }
  });

  if (mesh.material?.emissive) {
    const highlighted = focus && d.tags.includes(focus);
    mesh.material.emissive.setHex(highlighted ? 0x4a3300 : 0);
    mesh.material.emissiveIntensity = highlighted ? .32 : 0;
  }
}
