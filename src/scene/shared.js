import * as THREE from "three";

export const clamp01 = (v) => Math.max(0, Math.min(1, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (a, b, v) => {
  const t = clamp01((v - a) / Math.max(.0001, b - a));
  return t * t * (3 - 2 * t);
};

const BOX = new THREE.BoxGeometry(1, 1, 1);
const CYL = new THREE.CylinderGeometry(1, 1, 1, 10);

export function canUseWebGL() {
  try {
    return !!document.createElement("canvas").getContext("webgl2", { alpha: true });
  } catch { return false; }
}

function texture(kind) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const x = c.getContext("2d");
  if (kind === "concrete") {
    x.fillStyle = "#bbb7ad"; x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 2200; i++) {
      const v = 135 + Math.floor(Math.random() * 75);
      x.fillStyle = `rgba(${v},${v},${v},${.02 + Math.random() * .05})`;
      x.fillRect(Math.random()*256, Math.random()*256, 1 + Math.random()*2, 1 + Math.random()*2);
    }
  } else if (kind === "brick") {
    x.fillStyle = "#9b5a3c"; x.fillRect(0, 0, 256, 256); x.strokeStyle = "rgba(235,215,190,.42)"; x.lineWidth = 2;
    for (let y = 0; y <= 256; y += 32) {
      x.beginPath(); x.moveTo(0,y); x.lineTo(256,y); x.stroke();
      const off = (y/32)%2 ? 32 : 0;
      for (let xx = -64 + off; xx <= 256; xx += 64) { x.beginPath(); x.moveTo(xx,y); x.lineTo(xx,y+32); x.stroke(); }
    }
  } else if (kind === "roof") {
    x.fillStyle = "#2a2f2e"; x.fillRect(0, 0, 256, 256); x.strokeStyle = "rgba(255,255,255,.075)";
    for (let y = 0; y < 256; y += 22) { x.beginPath(); x.moveTo(0,y); x.lineTo(256,y); x.stroke(); }
    for (let xx = 0; xx < 256; xx += 28) { x.beginPath(); x.moveTo(xx,0); x.lineTo(xx,256); x.stroke(); }
  } else {
    x.fillStyle = "#e0ddd4"; x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 800; i++) { x.fillStyle = `rgba(60,60,55,${Math.random()*.035})`; x.fillRect(Math.random()*256, Math.random()*256, 1, 1); }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2.5,2.5);
  return t;
}

const material = (color, roughness, metalness=0, map=null) => new THREE.MeshStandardMaterial({ color, roughness, metalness, map, transparent:true, opacity:1 });

export function createBuildContext(world, low) {
  const textures = { concrete:texture("concrete"), brick:texture("brick"), roof:texture("roof"), plaster:texture("plaster") };
  const m = {
    concrete: material(0xc3bfb5,.88,.02,textures.concrete), concreteDark: material(0x79766e,.92,.01,textures.concrete),
    brick: material(0x9b5b3d,.92,0,textures.brick), plaster: material(0xe3dfd5,.86,.01,textures.plaster), plasterDark: material(0xa7a49c,.88,.01,textures.plaster),
    steel: material(0x3c4140,.46,.68), rebar: material(0x5a3d33,.55,.48), timber: material(0x75583d,.78,.02), roof: material(0x252a29,.68,.18,textures.roof),
    yellow: material(0xf2b600,.5,.18), dark: material(0x181b1a,.62,.32)
  };
  m.glass = new THREE.MeshPhysicalMaterial({ color:0x8ca0a6, roughness:.16, transmission:low?0:.16, transparent:true, opacity:low?.62:.72, depthWrite:false });
  const groups = Object.fromEntries(["ground","foundation","concrete","masonry","roofFrame","roof","facade","glass","details","temporary","fence","plinth"].map(k=>[k,new THREE.Group()]));
  Object.values(groups).forEach(g=>world.add(g));
  return { world, low, textures, m, groups, parts:[] };
}

export function box(ctx, group, size, pos, material, start, end, o={}) {
  const mesh = new THREE.Mesh(BOX, material.clone());
  mesh.position.set(...pos); mesh.scale.set(...size); if (o.rotation) mesh.rotation.set(...o.rotation);
  mesh.castShadow = o.castShadow ?? true; mesh.receiveShadow = o.receiveShadow ?? true;
  mesh.userData = { basePosition:mesh.position.clone(), baseScale:new THREE.Vector3(...size), start,end, axis:o.axis||"y", kind:o.kind||"structure", tags:o.tags||[], fadeStart:o.fadeStart??null, fadeEnd:o.fadeEnd??null, opacity:o.opacity??1 };
  ctx.groups[group].add(mesh); ctx.parts.push(mesh); return mesh;
}

export function cylinder(ctx, group, radius, height, pos, material, start, end, o={}) {
  const mesh = new THREE.Mesh(CYL, material.clone());
  mesh.position.set(...pos); mesh.scale.set(radius,height,radius); mesh.castShadow=o.castShadow??true;
  mesh.userData = { basePosition:mesh.position.clone(), baseScale:new THREE.Vector3(radius,height,radius), start,end, axis:"y", kind:o.kind||"rebar", tags:o.tags||[], fadeStart:o.fadeStart??null, fadeEnd:o.fadeEnd??null, opacity:o.opacity??1 };
  ctx.groups[group].add(mesh); ctx.parts.push(mesh); return mesh;
}

export function outline(mesh, color=0x4b4a45, opacity=.16) {
  const l = new THREE.LineSegments(new THREE.EdgesGeometry(BOX), new THREE.LineBasicMaterial({color,transparent:true,opacity}));
  l.userData.baseOpacity=opacity; mesh.add(l); return l;
}

export function updatePart(mesh, build, focus, xray, demolition) {
  const d=mesh.userData; let amount=smooth(d.start,d.end,build);
  if (d.fadeStart!==null) amount*=1-smooth(d.fadeStart,d.fadeEnd,build);
  mesh.visible=amount>.002; mesh.position.copy(d.basePosition); mesh.scale.copy(d.baseScale); const f=Math.max(.001,amount);
  if (d.axis==="x") mesh.scale.x=d.baseScale.x*f; else if (d.axis==="z") mesh.scale.z=d.baseScale.z*f; else if (d.axis==="all") mesh.scale.multiplyScalar(f); else { mesh.scale.y=d.baseScale.y*f; mesh.position.y=d.basePosition.y-d.baseScale.y*(1-f)*.5; }
  let opacity=amount*d.opacity;
  if (xray>.02 && ["facade","glass","plinth"].includes(d.kind)) opacity*=1-xray*.84;
  if (focus && focus!=="shell" && focus!=="demolition") opacity*=d.tags.includes(focus)?1:.18;
  else if (focus==="shell") opacity*=(d.tags.includes("shell")||d.tags.includes("concrete")||d.tags.includes("masonry"))?1:.28;
  if (demolition>0 && (d.tags.includes("masonry")||["facade","glass"].includes(d.kind))) { mesh.position.x+=Math.sign(d.basePosition.x||1)*demolition*.55; mesh.position.y+=demolition*.18; opacity*=1-demolition*.35; }
  mesh.material.opacity=opacity;
  mesh.children.forEach(c=>{ if(c.material?.isLineBasicMaterial)c.material.opacity=(c.userData.baseOpacity??.16)*opacity; });
  if(mesh.material.emissive){const hi=focus&&d.tags.includes(focus);mesh.material.emissive.setHex(hi?0x4a3300:0);mesh.material.emissiveIntensity=hi?.32:0;}
}
