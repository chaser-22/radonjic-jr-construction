import * as THREE from "three";
import "./styles.css";

const PHONE = "+38267058382";
const DISPLAY_PHONE = "+382 67 058 382";
const EMAIL = "radonjic001@gmail.com";

const projects = [
  {
    title: "Gruba gradnja",
    label: "KONSTRUKCIJA / 01",
    image: "https://images.pexels.com/photos/36833961/pexels-photo-36833961.jpeg?auto=compress&cs=tinysrgb&w=2200",
    text: "Temelji, ploče, zidovi i kompletna nosiva konstrukcija objekta."
  },
  {
    title: "Temelji + beton",
    label: "BETON / 02",
    image: "https://images.pexels.com/photos/18283441/pexels-photo-18283441.jpeg?auto=compress&cs=tinysrgb&w=2200",
    text: "Priprema, armiranje i betoniranje sa preciznom nivelacijom."
  },
  {
    title: "Armatura",
    label: "STRUKTURA / 03",
    image: "https://images.pexels.com/photos/36833957/pexels-photo-36833957.jpeg?auto=compress&cs=tinysrgb&w=2200",
    text: "Armirano-betonski detalji, stubovi, grede i ploče."
  },
  {
    title: "Zidanje",
    label: "ZIDOVI / 04",
    image: "https://images.pexels.com/photos/35281188/pexels-photo-35281188.jpeg?auto=compress&cs=tinysrgb&w=2200",
    text: "Nosivi i pregradni zidovi sa urednim otvorima i čistom izvedbom."
  },
  {
    title: "Krovovi",
    label: "KROV / 05",
    image: "https://images.pexels.com/photos/38749917/pexels-photo-38749917.jpeg?auto=compress&cs=tinysrgb&w=2200",
    text: "Krovna konstrukcija, izolacija, letvanje i završno pokrivanje."
  }
];

const services = [
  ["01", "GRUBA GRADNJA", "Temelji, armatura, beton, ploče i kompletna nosiva konstrukcija."],
  ["02", "KROVOVI", "Krovne konstrukcije, izolacija, letvanje i završno pokrivanje."],
  ["03", "ZIDANJE", "Nosivi i pregradni zidovi, otvori i priprema za naredne faze."],
  ["04", "RUŠENJE", "Kontrolisano uklanjanje zidova, plafona i postojećih elemenata."],
  ["05", "OGRADE", "Betonske i metalne ograde sa urednim završnim detaljima."],
  ["06", "PRIPREMA", "Skidanje pločica, parketa i podloga prije novih radova."]
];

const app = document.querySelector("#app");
app.innerHTML = `
  <div class="global-house-layer" data-global-house aria-hidden="true">
    <div class="global-blueprint-fallback">
      <i class="gf-base"></i><i class="gf-col gf-c1"></i><i class="gf-col gf-c2"></i><i class="gf-col gf-c3"></i><i class="gf-col gf-c4"></i><i class="gf-roof"></i>
    </div>
    <canvas class="global-house-canvas"></canvas>
  </div>

  <header class="site-header">
    <a class="brand" href="#top" aria-label="Radonjic JR Construction">
      <span class="brand-mark">RJ</span>
      <span class="brand-type"><b>RADONJIC JR</b><small>CONSTRUCTION</small></span>
    </a>
    <nav aria-label="Glavna navigacija">
      <a href="#radovi">RADOVI</a>
      <a href="#usluge">USLUGE</a>
      <a href="#kontakt">KONTAKT</a>
    </nav>
    <a class="header-call" href="tel:${PHONE}">POZOVI <span>↗</span></a>
  </header>

  <main id="top">
    <section class="hero" data-scroll-scene="hero">
      <div class="hero-grid" aria-hidden="true"></div>
      <div class="hero-copy">
        <p class="eyebrow">RADONJIC JR / CONSTRUCTION</p>
        <h1>OD TEMELJA<br><em>DO KROVA.</em></h1>
        <p class="hero-lead">Pouzdana gradnja, jasna izvedba i rezultat koji se vidi u svakoj fazi.</p>
        <div class="hero-actions">
          <a class="btn btn-yellow" href="tel:${PHONE}">POZOVITE NAS <span>↗</span></a>
          <a class="btn btn-line" href="#radovi">POGLEDAJTE RADOVE <span>↓</span></a>
        </div>
      </div>
      <div class="hero-tech" aria-hidden="true">
        <span>BUILD / <b data-build-phase>PRIPREMA</b></span>
        <strong data-build-percent>000%</strong>
      </div>
      <div class="hero-scroll"><span>SCROLL TO BUILD</span><i><b data-progress-bar></b></i></div>
    </section>

    <section class="intro section-light" data-house-anchor="intro">
      <div class="section-kicker reveal">01 / NAČIN RADA</div>
      <div class="intro-grid reveal">
        <h2>ČIST PROCES.<br><em>ČISTA IZVEDBA.</em></h2>
        <div>
          <p>Ne pokušavamo da sakrijemo posao iza komplikovanog interfejsa. Posjetilac treba odmah da vidi šta radimo, kako radimo i kako da nas pozove.</p>
          <div class="value-row"><span>POUZDANOST</span><span>TAČNOST</span><span>KVALITET</span><span>POŠTENA CIJENA</span></div>
        </div>
      </div>
    </section>

    <section class="anatomy section-dark" data-house-anchor="anatomy">
      <div class="section-head reveal">
        <div class="section-kicker">02 / KONSTRUKCIJA</div>
        <h2>OBJEKAT KAO<br><em>SISTEM.</em></h2>
      </div>
      <div class="anatomy-layout">
        <div class="anatomy-copy reveal">
          <article><span>01</span><h3>TEMELJI</h3><p>Armatura, beton i oslonac čitavog objekta.</p></article>
          <article><span>02</span><h3>NOSIVA STRUKTURA</h3><p>Stubovi, grede i ploče grade tačnu geometriju.</p></article>
          <article><span>03</span><h3>ZIDOVI + KROV</h3><p>Volumen se zatvara i objekat dobija finalnu zaštitu.</p></article>
        </div>
        <div class="anatomy-stage scene-frame reveal" aria-hidden="true">
          <div class="frame-corner top-left"></div><div class="frame-corner top-right"></div><div class="frame-corner bottom-left"></div><div class="frame-corner bottom-right"></div>
          <div class="stage-label"><span>STRUCTURAL / X-RAY</span><b>RJ-02</b></div>
        </div>
      </div>
    </section>

    <section class="work section-light" id="radovi" data-house-anchor="work">
      <div class="work-head reveal">
        <div>
          <div class="section-kicker">03 / RADOVI</div>
          <h2>RADOVI<br><em>U FOKUSU.</em></h2>
        </div>
        <p>Fotografija treba da bude dokaz. Velika slika, malo teksta i jasna informacija o vrsti radova.</p>
      </div>
      <div class="project-list">
        ${projects.map((project, index) => `
          <article class="project reveal" style="--i:${index}">
            <div class="project-image-wrap">
              <img src="${project.image}" alt="${project.title} — ilustrativna fotografija" loading="${index < 2 ? "eager" : "lazy"}">
              <span class="project-number">${String(index + 1).padStart(2, "0")}</span>
            </div>
            <div class="project-meta">
              <p>${project.label}</p>
              <h3>${project.title}</h3>
              <span>${project.text}</span>
            </div>
          </article>
        `).join("")}
      </div>
      <p class="photo-note">Fotografije su privremeni HD vizuali za prototip i treba ih zamijeniti originalnim fotografijama vaših radova prije objave.</p>
    </section>

    <section class="services section-dark" id="usluge" data-house-anchor="services">
      <div class="section-head reveal">
        <div class="section-kicker">04 / USLUGE</div>
        <h2>ŠTA<br><em>RADIMO.</em></h2>
      </div>
      <div class="services-grid">
        <div class="services-list">
          ${services.map((s, index) => `
            <button class="service-item ${index === 0 ? "is-active" : ""}" data-service="${index}">
              <span>${s[0]}</span><strong>${s[1]}</strong><p>${s[2]}</p><i>↗</i>
            </button>
          `).join("")}
        </div>
        <div class="service-stage scene-frame reveal" aria-hidden="true">
          <div class="frame-corner top-left"></div><div class="frame-corner top-right"></div><div class="frame-corner bottom-left"></div><div class="frame-corner bottom-right"></div>
          <div class="stage-label"><span>HOUSE / CAPABILITY</span><b data-service-code>01</b></div>
        </div>
      </div>
    </section>

    <section class="process section-light" data-house-anchor="process">
      <div class="section-kicker reveal">05 / PROCES</div>
      <div class="process-head reveal"><h2>ČETIRI KORAKA.<br><em>BEZ KOMPLIKACIJA.</em></h2></div>
      <div class="process-grid">
        <article class="reveal"><span>01</span><h3>PREGLED</h3><p>Vidimo posao i definišemo obim.</p></article>
        <article class="reveal"><span>02</span><h3>DOGOVOR</h3><p>Jasna ponuda i redoslijed radova.</p></article>
        <article class="reveal"><span>03</span><h3>IZVEDBA</h3><p>Organizovan rad po dogovorenim fazama.</p></article>
        <article class="reveal"><span>04</span><h3>PREDAJA</h3><p>Završna provjera i čist rezultat.</p></article>
      </div>
    </section>

    <section class="contact" id="kontakt" data-house-anchor="contact">
      <div class="contact-copy reveal">
        <div class="section-kicker dark-kicker">06 / KONTAKT</div>
        <h2>IMATE<br>PROJEKAT?</h2>
        <p>Najbrži način da počnemo je poziv. Možete poslati i osnovne informacije putem emaila ili WhatsApp-a.</p>
      </div>
      <div class="contact-actions reveal">
        <a class="contact-phone" href="tel:${PHONE}">${DISPLAY_PHONE} <span>↗</span></a>
        <div><a href="https://wa.me/${PHONE.replace("+", "")}" target="_blank" rel="noreferrer">WHATSAPP ↗</a><a href="mailto:${EMAIL}">EMAIL ↗</a></div>
      </div>
    </section>
  </main>

  <div class="mobile-actions">
    <a href="tel:${PHONE}">POZOVI</a>
    <a href="https://wa.me/${PHONE.replace("+", "")}" target="_blank" rel="noreferrer">WHATSAPP</a>
    <a href="mailto:${EMAIL}">EMAIL</a>
  </div>
`;

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, v) => {
  const t = clamp01((v - a) / Math.max(0.0001, b - a));
  return t * t * (3 - 2 * t);
};

function canUseWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2", { alpha: true }) || c.getContext("webgl", { alpha: true }));
  } catch {
    return false;
  }
}

function setupRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  return renderer;
}

function resizeRenderer(renderer, camera) {
  const width = Math.max(1, window.innerWidth);
  const height = Math.max(1, window.innerHeight);
  const canvas = renderer.domElement;
  const pixelWidth = Math.floor(width * renderer.getPixelRatio());
  const pixelHeight = Math.floor(height * renderer.getPixelRatio());
  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
}

function setShadow(mesh, cast = true, receive = true) {
  mesh.castShadow = cast;
  mesh.receiveShadow = receive;
  return mesh;
}

function material(color, roughness = 0.7, metalness = 0.05) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness, transparent: true, opacity: 1 });
}

function createBuildBox(parent, size, position, mat, start, end, options = {}) {
  const mesh = setShadow(new THREE.Mesh(new THREE.BoxGeometry(...size), mat.clone()));
  mesh.position.set(...position);
  mesh.userData = {
    buildPart: true,
    basePosition: mesh.position.clone(),
    size: new THREE.Vector3(...size),
    start,
    end,
    axis: options.axis || "y",
    opacity: options.opacity ?? 1,
    fadeStart: options.fadeStart ?? null,
    fadeEnd: options.fadeEnd ?? null,
    service: options.service ?? null,
    kind: options.kind ?? "structure"
  };
  if (options.rotation) mesh.rotation.set(...options.rotation);
  parent.add(mesh);
  return mesh;
}

function createBuildCylinder(parent, radius, height, position, mat, start, end, options = {}) {
  const mesh = setShadow(new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 10), mat.clone()));
  mesh.position.set(...position);
  mesh.userData = {
    buildPart: true,
    basePosition: mesh.position.clone(),
    size: new THREE.Vector3(radius * 2, height, radius * 2),
    start,
    end,
    axis: options.axis || "y",
    opacity: options.opacity ?? 1,
    fadeStart: options.fadeStart ?? null,
    fadeEnd: options.fadeEnd ?? null,
    service: options.service ?? null,
    kind: options.kind ?? "structure"
  };
  parent.add(mesh);
  return mesh;
}

function updateBuildPart(mesh, progress, focusService, xray) {
  const d = mesh.userData;
  let amount = smooth(d.start, d.end, progress);
  if (d.fadeStart !== null && d.fadeEnd !== null) amount *= 1 - smooth(d.fadeStart, d.fadeEnd, progress);
  const scale = Math.max(0.001, amount);
  mesh.visible = amount > 0.002;
  mesh.position.copy(d.basePosition);
  mesh.scale.set(1, 1, 1);
  if (d.axis === "x") mesh.scale.x = scale;
  else if (d.axis === "z") mesh.scale.z = scale;
  else if (d.axis === "all") mesh.scale.setScalar(scale);
  else {
    mesh.scale.y = scale;
    mesh.position.y = d.basePosition.y - d.size.y * (1 - scale) * 0.5;
  }

  let opacity = amount * d.opacity;
  if (xray > 0.02 && (d.kind === "facade" || d.kind === "glass")) opacity *= 1 - xray * 0.78;
  if (focusService !== null) {
    const relevant = d.service === focusService || (focusService === 0 && d.kind === "structure");
    if (!relevant) opacity *= 0.38;
  }
  mesh.material.opacity = opacity;
  mesh.material.transparent = opacity < 0.995 || mesh.material.transparent;
  mesh.children.forEach((child) => {
    if (child.isLineSegments && child.material) {
      child.material.opacity = (child.userData.baseOpacity ?? 0.2) * amount;
    }
  });

  if (focusService !== null && d.service === focusService) {
    mesh.material.emissive?.setHex(0xffb300);
    mesh.material.emissiveIntensity = 0.34;
  } else if (mesh.material.emissive) {
    mesh.material.emissive.setHex(0x000000);
    mesh.material.emissiveIntensity = 0;
  }
}

function addEdgeOutline(mesh, color = 0x2b2e2e, opacity = 0.3) {
  const edge = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity })
  );
  edge.renderOrder = 2;
  edge.userData.baseOpacity = opacity;
  mesh.add(edge);
  return edge;
}

function createRealisticHouse(world) {
  const groups = {
    terrain: new THREE.Group(),
    structure: new THREE.Group(),
    masonry: new THREE.Group(),
    facade: new THREE.Group(),
    glass: new THREE.Group(),
    details: new THREE.Group(),
    temporary: new THREE.Group()
  };
  Object.values(groups).forEach((g) => world.add(g));

  const concrete = material(0xb9b6ad, 0.83, 0.02);
  const concreteDark = material(0x77746d, 0.9, 0.01);
  const brick = material(0x9a5538, 0.92, 0.0);
  const plaster = material(0xddd8ca, 0.78, 0.01);
  const plasterDark = material(0xaaa69d, 0.82, 0.02);
  const charcoal = material(0x242728, 0.5, 0.32);
  const wood = material(0x6e4e35, 0.72, 0.02);
  const steel = material(0x414647, 0.4, 0.72);
  const rebar = material(0x5d3d32, 0.52, 0.48);
  const yellow = material(0xffb300, 0.52, 0.26);

  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x7f9aa4,
    roughness: 0.12,
    metalness: 0.04,
    transmission: 0.18,
    transparent: true,
    opacity: 0.68,
    depthWrite: false,
    emissive: 0x10191d,
    emissiveIntensity: 0.22
  });

  const parts = [];
  const addBox = (...args) => {
    const mesh = createBuildBox(...args);
    parts.push(mesh);
    return mesh;
  };
  const addCylinder = (...args) => {
    const mesh = createBuildCylinder(...args);
    parts.push(mesh);
    return mesh;
  };

  // Excavation / footing pad.
  const groundPad = addBox(groups.terrain, [6.8, 0.18, 5.0], [0, -1.65, 0], concreteDark, 0.00, 0.06, { axis: "all", opacity: 0.62, kind: "ground", service: 5 });
  groundPad.receiveShadow = true;
  addEdgeOutline(groundPad, 0x3c3b37, 0.2);

  // Strip footings and foundation beams.
  const footings = [
    [[6.1, 0.34, 0.55], [0, -1.45, -1.78]], [[6.1, 0.34, 0.55], [0, -1.45, 1.78]],
    [[0.55, 0.34, 3.15], [-2.78, -1.45, 0]], [[0.55, 0.34, 3.15], [2.78, -1.45, 0]],
    [[0.42, 0.30, 3.15], [0, -1.42, 0]]
  ];
  footings.forEach(([s, p], i) => addBox(groups.structure, s, p, concreteDark, 0.04 + i * 0.005, 0.13 + i * 0.004, { axis: i < 2 ? "x" : "z", kind: "structure", service: 0 }));

  // Rebar cages appear before concrete columns and disappear later.
  const columnXs = [-2.35, 0, 2.35];
  const columnZs = [-1.35, 1.35];
  columnXs.forEach((x, xi) => columnZs.forEach((z, zi) => {
    [-0.07, 0.07].forEach((ox) => [-0.07, 0.07].forEach((oz) => {
      addCylinder(groups.temporary, 0.018, 3.65, [x + ox, 0.05, z + oz], rebar, 0.08 + xi * 0.004 + zi * 0.003, 0.17, { fadeStart: 0.28, fadeEnd: 0.40, kind: "rebar", service: 0 });
    }));
  }));

  const slab0 = addBox(groups.structure, [5.75, 0.22, 3.9], [0, -1.06, 0], concrete, 0.11, 0.20, { axis: "x", kind: "structure", service: 0 });
  addEdgeOutline(slab0, 0x54514b, 0.2);

  // Ground floor reinforced-concrete frame.
  columnXs.forEach((x, xi) => columnZs.forEach((z, zi) => {
    const col = addBox(groups.structure, [0.28, 2.85, 0.28], [x, 0.48, z], concrete, 0.18 + xi * 0.006 + zi * 0.004, 0.31 + xi * 0.006 + zi * 0.004, { kind: "structure", service: 0 });
    addEdgeOutline(col, 0x5f5d58, 0.16);
  }));
  [-1.35, 1.35].forEach((z, zi) => addBox(groups.structure, [5.0, 0.28, 0.28], [0, 1.82, z], concrete, 0.27 + zi * 0.008, 0.36 + zi * 0.008, { axis: "x", kind: "structure", service: 0 }));
  [-2.35, 2.35].forEach((x, xi) => addBox(groups.structure, [0.28, 0.28, 2.45], [x, 1.82, 0], concrete, 0.29 + xi * 0.006, 0.38 + xi * 0.006, { axis: "z", kind: "structure", service: 0 }));

  const slab1 = addBox(groups.structure, [5.42, 0.24, 3.52], [0, 2.03, 0], concrete, 0.34, 0.43, { axis: "z", kind: "structure", service: 0 });
  addEdgeOutline(slab1, 0x53514d, 0.18);

  // Upper floor frame, slightly set back for a more architectural silhouette.
  [-1.95, 0, 1.95].forEach((x, xi) => [-1.12, 1.12].forEach((z, zi) => {
    addBox(groups.structure, [0.25, 1.72, 0.25], [x, 2.98, z], concrete, 0.39 + xi * 0.006 + zi * 0.003, 0.50 + xi * 0.006 + zi * 0.003, { kind: "structure", service: 0 });
  }));
  [-1.12, 1.12].forEach((z, zi) => addBox(groups.structure, [4.2, 0.25, 0.25], [0, 3.84, z], concrete, 0.47 + zi * 0.008, 0.55 + zi * 0.008, { axis: "x", kind: "structure", service: 0 }));

  // Masonry ground floor – panels arranged around openings.
  const wallPanels = [
    [[0.18, 2.35, 3.05], [-2.62, 0.58, 0]], [[0.18, 2.35, 3.05], [2.62, 0.58, 0]],
    [[1.10, 2.15, 0.18], [-1.97, 0.58, 1.58]], [[0.76, 2.15, 0.18], [-0.62, 0.58, 1.58]],
    [[0.84, 2.15, 0.18], [0.77, 0.58, 1.58]], [[0.78, 2.15, 0.18], [2.08, 0.58, 1.58]],
    [[5.05, 2.2, 0.18], [0, 0.56, -1.58]],
    [[1.18, 0.45, 0.18], [-1.0, 1.38, 1.58]], [[1.15, 0.45, 0.18], [1.40, 1.38, 1.58]]
  ];
  wallPanels.forEach(([s, p], i) => {
    const m = addBox(groups.masonry, s, p, brick, 0.48 + i * 0.006, 0.61 + i * 0.005, { kind: "masonry", service: 2 });
    addEdgeOutline(m, 0x6f3a2b, 0.22);
  });

  // Upper masonry.
  [
    [[0.18, 1.40, 2.65], [-2.15, 2.95, 0]], [[0.18, 1.40, 2.65], [2.15, 2.95, 0]],
    [[1.28, 1.30, 0.18], [-1.38, 2.94, 1.35]], [[1.28, 1.30, 0.18], [1.38, 2.94, 1.35]],
    [[4.05, 1.32, 0.18], [0, 2.94, -1.35]]
  ].forEach(([s, p], i) => {
    const m = addBox(groups.masonry, s, p, brick, 0.56 + i * 0.008, 0.68 + i * 0.007, { kind: "masonry", service: 2 });
    addEdgeOutline(m, 0x6f3a2b, 0.2);
  });

  // Roof planes, fascia and gutter lines.
  const roofL = addBox(groups.details, [3.45, 0.16, 4.75], [-1.15, 4.68, 0], charcoal, 0.68, 0.79, { axis: "x", rotation: [0, 0, -0.50], kind: "roof", service: 1 });
  const roofR = addBox(groups.details, [3.45, 0.16, 4.75], [1.15, 4.68, 0], charcoal, 0.70, 0.81, { axis: "x", rotation: [0, 0, 0.50], kind: "roof", service: 1 });
  addEdgeOutline(roofL, 0x060707, 0.38); addEdgeOutline(roofR, 0x060707, 0.38);
  addBox(groups.details, [5.1, 0.12, 0.14], [0, 4.30, 1.95], steel, 0.75, 0.84, { axis: "x", kind: "roof", service: 1 });
  addBox(groups.details, [5.1, 0.12, 0.14], [0, 4.30, -1.95], steel, 0.76, 0.85, { axis: "x", kind: "roof", service: 1 });

  // Plaster facade as thin skins.
  [
    [[0.09, 2.42, 3.14], [-2.72, 0.62, 0]], [[0.09, 2.42, 3.14], [2.72, 0.62, 0]],
    [[1.12, 2.18, 0.09], [-1.97, 0.60, 1.68]], [[0.78, 2.18, 0.09], [-0.62, 0.60, 1.68]],
    [[0.86, 2.18, 0.09], [0.77, 0.60, 1.68]], [[0.80, 2.18, 0.09], [2.08, 0.60, 1.68]],
    [[5.10, 2.25, 0.09], [0, 0.58, -1.68]],
    [[0.09, 1.45, 2.72], [-2.23, 2.98, 0]], [[0.09, 1.45, 2.72], [2.23, 2.98, 0]],
    [[1.30, 1.34, 0.09], [-1.38, 2.96, 1.46]], [[1.30, 1.34, 0.09], [1.38, 2.96, 1.46]]
  ].forEach(([s, p], i) => addBox(groups.facade, s, p, i % 4 === 0 ? plasterDark : plaster, 0.79 + i * 0.003, 0.91 + i * 0.003, { kind: "facade" }));

  // Windows and frames.
  const windows = [
    { p: [-1.28, 0.58, 1.735], s: [1.05, 1.32, 0.06] },
    { p: [1.38, 0.58, 1.735], s: [1.10, 1.32, 0.06] },
    { p: [-1.35, 2.96, 1.515], s: [1.06, 0.92, 0.06] },
    { p: [1.35, 2.96, 1.515], s: [1.06, 0.92, 0.06] }
  ];
  windows.forEach((w, i) => {
    const pane = addBox(groups.glass, w.s, w.p, glass, 0.86 + i * 0.008, 0.94 + i * 0.006, { kind: "glass" });
    pane.castShadow = false;
    const frameWidth = w.s[0] + 0.12;
    const frameHeight = w.s[1] + 0.12;
    addBox(groups.details, [frameWidth, 0.055, 0.085], [w.p[0], w.p[1] + frameHeight / 2, w.p[2] + 0.015], charcoal, 0.84, 0.94, { axis: "x", kind: "detail" });
    addBox(groups.details, [frameWidth, 0.055, 0.085], [w.p[0], w.p[1] - frameHeight / 2, w.p[2] + 0.015], charcoal, 0.84, 0.94, { axis: "x", kind: "detail" });
    addBox(groups.details, [0.055, frameHeight, 0.085], [w.p[0] - frameWidth / 2, w.p[1], w.p[2] + 0.015], charcoal, 0.84, 0.94, { kind: "detail" });
    addBox(groups.details, [0.055, frameHeight, 0.085], [w.p[0] + frameWidth / 2, w.p[1], w.p[2] + 0.015], charcoal, 0.84, 0.94, { kind: "detail" });
  });

  // Door and canopy.
  addBox(groups.details, [0.82, 1.82, 0.08], [0.02, 0.39, 1.745], wood, 0.87, 0.95, { kind: "detail" });
  addBox(groups.details, [1.42, 0.11, 0.85], [0.02, 1.45, 1.83], charcoal, 0.88, 0.96, { axis: "z", kind: "detail" });

  // Balcony slab and railings.
  addBox(groups.details, [3.25, 0.16, 0.72], [0, 2.12, 1.73], concrete, 0.74, 0.83, { axis: "x", kind: "structure", service: 0 });
  [-1.45, -0.72, 0, 0.72, 1.45].forEach((x, i) => addBox(groups.details, [0.045, 0.65, 0.045], [x, 2.50, 2.02], steel, 0.89 + i * 0.003, 0.96, { kind: "detail", service: 4 }));
  addBox(groups.details, [3.05, 0.055, 0.055], [0, 2.82, 2.02], steel, 0.90, 0.97, { axis: "x", kind: "detail", service: 4 });

  // Front steps and low perimeter fence.
  addBox(groups.details, [1.55, 0.18, 0.75], [0.02, -0.94, 2.05], concrete, 0.84, 0.92, { axis: "z", kind: "detail", service: 5 });
  addBox(groups.details, [1.85, 0.16, 0.65], [0.02, -1.12, 2.37], concrete, 0.85, 0.93, { axis: "z", kind: "detail", service: 5 });
  [-3.2, 3.2].forEach((x) => addBox(groups.details, [0.12, 1.05, 0.12], [x, -0.88, 2.35], steel, 0.90, 0.97, { kind: "detail", service: 4 }));
  addBox(groups.details, [6.4, 0.065, 0.065], [0, -0.43, 2.35], steel, 0.91, 0.98, { axis: "x", kind: "detail", service: 4 });

  // Scaffolding – visible only while masonry/facade is underway.
  const scaffoldMat = steel;
  [-3.0, -1.5, 0, 1.5, 3.0].forEach((x, xi) => {
    addBox(groups.temporary, [0.055, 4.7, 0.055], [x, 1.15, 2.25], scaffoldMat, 0.42 + xi * 0.004, 0.50, { fadeStart: 0.78, fadeEnd: 0.88, kind: "temporary" });
  });
  [-0.35, 1.0, 2.35, 3.7].forEach((y, yi) => {
    addBox(groups.temporary, [6.0, 0.05, 0.05], [0, y, 2.25], scaffoldMat, 0.44 + yi * 0.006, 0.52, { axis: "x", fadeStart: 0.78, fadeEnd: 0.88, kind: "temporary" });
  });

  // Crane with more legible proportions than the previous version.
  const crane = new THREE.Group();
  const craneYellow = yellow.clone(); craneYellow.transparent = true;
  const craneDark = charcoal.clone(); craneDark.transparent = true;
  const mast = setShadow(new THREE.Mesh(new THREE.BoxGeometry(0.24, 7.3, 0.24), craneYellow)); mast.position.y = 3.65; crane.add(mast);
  const cranePivot = new THREE.Group(); cranePivot.position.y = 7.3; crane.add(cranePivot);
  const jib = setShadow(new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.15, 0.15), craneYellow)); jib.position.x = 2.1; cranePivot.add(jib);
  const counterJib = setShadow(new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.17, 0.17), craneYellow)); counterJib.position.x = -1.1; cranePivot.add(counterJib);
  const counter = setShadow(new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.5, 0.55), craneDark)); counter.position.x = -2.05; cranePivot.add(counter);
  const hookLine = new THREE.Mesh(new THREE.BoxGeometry(0.025, 2.3, 0.025), craneDark); hookLine.position.set(3.2, -1.15, 0); cranePivot.add(hookLine);
  crane.position.set(-5.1, -1.65, -1.5);
  groups.temporary.add(crane);

  // Ground receiving plane for soft shadows.
  const shadowMat = new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.18, transparent: true });
  const shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(12, 10), shadowMat);
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = -1.76;
  shadowPlane.receiveShadow = true;
  groups.terrain.add(shadowPlane);

  // Fine architectural grid around the building.
  const grid = new THREE.GridHelper(16, 32, 0xffb300, 0x54585a);
  grid.position.y = -1.74;
  const mats = Array.isArray(grid.material) ? grid.material : [grid.material];
  mats.forEach((m) => { m.transparent = true; m.opacity = 0.16; });
  groups.terrain.add(grid);

  // Architectural ghost model: visible before construction starts so the first frame is never empty.
  const outline = new THREE.Group();
  world.add(outline);
  const outlineWhite = new THREE.LineBasicMaterial({ color: 0xe9e6df, transparent: true, opacity: 0.22 });
  const outlineYellow = new THREE.LineBasicMaterial({ color: 0xffb300, transparent: true, opacity: 0.48 });
  const outlineBox = (size, pos, mat = outlineWhite, rotation = null) => {
    const line = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(...size)), mat);
    line.position.set(...pos);
    if (rotation) line.rotation.set(...rotation);
    outline.add(line);
    return line;
  };
  outlineBox([5.75, 0.22, 3.9], [0, -1.06, 0], outlineYellow);
  columnXs.forEach((x) => columnZs.forEach((z) => outlineBox([0.28, 4.9, 0.28], [x, 1.46, z])));
  outlineBox([5.42, 0.24, 3.52], [0, 2.03, 0]);
  outlineBox([4.2, 0.25, 2.48], [0, 3.84, 0]);
  outlineBox([3.45, 0.16, 4.75], [-1.15, 4.68, 0], outlineYellow, [0,0,-0.50]);
  outlineBox([3.45, 0.16, 4.75], [1.15, 4.68, 0], outlineYellow, [0,0,0.50]);

  return { parts, groups, crane, cranePivot, craneYellow, craneDark, grid, shadowPlane, outline, outlineWhite, outlineYellow };
}

function createGlobalHouseScene(layer, canvas) {
  const renderer = setupRenderer(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
  camera.position.set(0, 2.65, 11.6);

  const hemi = new THREE.HemisphereLight(0xfff4df, 0x24292b, 2.2);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xffe7bf, 5.0);
  key.position.set(7, 10, 7);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -8; key.shadow.camera.right = 8; key.shadow.camera.top = 10; key.shadow.camera.bottom = -5;
  key.shadow.bias = -0.0005;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x9ab4ff, 1.4);
  fill.position.set(-7, 4, -6);
  scene.add(fill);

  const warm = new THREE.PointLight(0xffb300, 13, 14, 2);
  warm.position.set(-4.5, 0.5, 4.5);
  scene.add(warm);

  const world = new THREE.Group();
  world.position.set(2.15, -0.15, 0);
  world.rotation.y = -0.42;
  scene.add(world);
  const house = createRealisticHouse(world);

  const anchors = [
    { el: document.querySelector(".hero"),       x: 2.20, y: -0.20, s: 0.93, r: -0.38, opacity: 1.00, xray: 0.00 },
    { el: document.querySelector("[data-house-anchor='intro']"),    x: 3.45, y: -0.55, s: 0.64, r:  0.18, opacity: 0.82, xray: 0.00 },
    { el: document.querySelector("[data-house-anchor='anatomy']"),  x: 2.20, y: -0.10, s: 0.82, r:  0.56, opacity: 0.96, xray: 0.90 },
    { el: document.querySelector("[data-house-anchor='work']"),     x: 3.55, y: -0.55, s: 0.47, r:  1.00, opacity: 0.48, xray: 0.00 },
    { el: document.querySelector("[data-house-anchor='services']"), x: 2.45, y: -0.18, s: 0.72, r: -0.54, opacity: 0.95, xray: 0.15 },
    { el: document.querySelector("[data-house-anchor='process']"),  x: -3.05,y: -0.55, s: 0.46, r:  0.42, opacity: 0.56, xray: 0.00 },
    { el: document.querySelector("[data-house-anchor='contact']"),  x: 2.30, y: -0.25, s: 0.66, r: -0.05, opacity: 0.88, xray: 0.00 }
  ].filter((a) => a.el);

  let targetBuild = 0;
  let currentBuild = 0;
  let targetX = 2.2, targetY = -0.2, targetScale = 0.93, targetRotation = -0.38, targetOpacity = 1, targetXray = 0;
  let currentOpacity = 1;
  let currentXray = 0;
  let activeService = null;
  let scrollSection = "hero";
  let pointerX = 0, pointerY = 0;
  let raf = 0, last = performance.now();

  const onPointer = (e) => {
    pointerX = (e.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
    pointerY = (e.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
  };
  window.addEventListener("pointermove", onPointer, { passive: true });

  function anchorOffset(anchor) {
    return anchor.el.offsetTop + Math.min(anchor.el.offsetHeight * 0.35, window.innerHeight * 0.55);
  }

  function updateFromScroll(heroProgress) {
    targetBuild = heroProgress;
    const center = window.scrollY + window.innerHeight * 0.5;
    const offsets = anchors.map(anchorOffset);
    let index = 0;
    while (index < offsets.length - 1 && center > offsets[index + 1]) index++;
    const a = anchors[index];
    const b = anchors[Math.min(index + 1, anchors.length - 1)];
    const span = Math.max(1, offsets[Math.min(index + 1, offsets.length - 1)] - offsets[index]);
    const t = index === anchors.length - 1 ? 0 : smooth(0, 1, (center - offsets[index]) / span);
    const mobile = window.innerWidth < 900;

    const ax = mobile ? (a.x > 0 ? 0.55 : -0.55) : a.x;
    const bx = mobile ? (b.x > 0 ? 0.55 : -0.55) : b.x;
    const scaleMul = mobile ? 0.82 : 1;
    targetX = lerp(ax, bx, t);
    targetY = lerp(a.y, b.y, t) + (mobile ? -0.15 : 0);
    targetScale = lerp(a.s, b.s, t) * scaleMul;
    targetRotation = lerp(a.r, b.r, t);
    targetOpacity = lerp(a.opacity, b.opacity, t) * (mobile ? 0.9 : 1);
    targetXray = lerp(a.xray, b.xray, t);
    scrollSection = a.el.classList.contains("hero") ? "hero" : a.el.dataset.houseAnchor || "page";
  }

  function setService(index) {
    activeService = index;
  }

  function clearService() {
    activeService = null;
  }

  function draw(now) {
    raf = requestAnimationFrame(draw);
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    resizeRenderer(renderer, camera);

    currentBuild = THREE.MathUtils.damp(currentBuild, targetBuild, 7.0, dt);
    currentXray = THREE.MathUtils.damp(currentXray, targetXray, 5.5, dt);
    currentOpacity = THREE.MathUtils.damp(currentOpacity, targetOpacity, 5.0, dt);

    // The hero drives the build to 100%; after it leaves, heroProgress stays clamped at 1.
    const effectiveBuild = currentBuild;
    house.parts.forEach((part) => updateBuildPart(part, effectiveBuild, scrollSection === "services" ? activeService : null, currentXray));

    const ghostFade = 1 - smooth(0.04, 0.88, currentBuild);
    house.outlineWhite.opacity = 0.05 + ghostFade * 0.20 + currentXray * 0.14;
    house.outlineYellow.opacity = 0.08 + ghostFade * 0.40 + currentXray * 0.22;

    const craneAlpha = smooth(0.10, 0.19, currentBuild) * (1 - smooth(0.74, 0.86, currentBuild));
    house.crane.visible = scrollSection === "hero" && craneAlpha > 0.01;
    house.craneYellow.opacity = craneAlpha;
    house.craneDark.opacity = craneAlpha;
    house.cranePivot.rotation.y = -0.42 + smooth(0.15, 0.78, currentBuild) * 0.92;

    // Exploded / x-ray spacing in the structural section.
    const explode = currentXray;
    house.groups.facade.position.x = THREE.MathUtils.damp(house.groups.facade.position.x, explode * 0.55, 5.0, dt);
    house.groups.glass.position.x = THREE.MathUtils.damp(house.groups.glass.position.x, explode * 0.85, 5.0, dt);
    house.groups.details.position.y = THREE.MathUtils.damp(house.groups.details.position.y, explode * 0.35, 5.0, dt);
    house.groups.masonry.position.x = THREE.MathUtils.damp(house.groups.masonry.position.x, -explode * 0.25, 5.0, dt);

    // Service mode focuses the same house instead of replacing it with unrelated objects.
    if (scrollSection === "services" && activeService === 3) {
      house.groups.masonry.position.x = THREE.MathUtils.damp(house.groups.masonry.position.x, -0.65, 5.0, dt);
      house.groups.facade.position.x = THREE.MathUtils.damp(house.groups.facade.position.x, 0.75, 5.0, dt);
    }

    world.position.x = THREE.MathUtils.damp(world.position.x, targetX + pointerX * 0.08, 4.1, dt);
    world.position.y = THREE.MathUtils.damp(world.position.y, targetY - pointerY * 0.035, 4.1, dt);
    const scale = THREE.MathUtils.damp(world.scale.x, targetScale, 4.1, dt);
    world.scale.setScalar(scale);
    world.rotation.y = THREE.MathUtils.damp(world.rotation.y, targetRotation + pointerX * 0.025, 3.8, dt);
    world.rotation.x = THREE.MathUtils.damp(world.rotation.x, -pointerY * 0.012, 3.8, dt);

    camera.position.x = THREE.MathUtils.damp(camera.position.x, pointerX * 0.18, 3.5, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 2.65 - pointerY * 0.10, 3.5, dt);
    camera.lookAt(0, 1.15, 0);

    house.grid.rotation.y = now * 0.000012;
    layer.style.opacity = String(currentOpacity);
    renderer.render(scene, camera);
  }
  raf = requestAnimationFrame(draw);

  return {
    updateFromScroll,
    setService,
    clearService,
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      renderer.dispose();
    }
  };
}

let globalHouseScene = null;
const globalHouseLayer = document.querySelector("[data-global-house]");
if (canUseWebGL()) {
  try {
    globalHouseScene = createGlobalHouseScene(globalHouseLayer, globalHouseLayer.querySelector("canvas"));
    globalHouseLayer.classList.add("three-ready");
  } catch (error) {
    console.error("Global house 3D failed", error);
    globalHouseLayer.classList.add("three-failed");
  }
} else {
  document.documentElement.classList.add("no-webgl");
}

const heroSection = document.querySelector('[data-scroll-scene="hero"]');
const buildPercent = document.querySelector("[data-build-percent]");
const buildPhase = document.querySelector("[data-build-phase]");
const progressBar = document.querySelector("[data-progress-bar]");
const header = document.querySelector(".site-header");

const buildPhases = [
  [0.00, "PRIPREMA"], [0.10, "TEMELJI"], [0.22, "ARMATURA"], [0.34, "KONSTRUKCIJA"],
  [0.52, "ZIDANJE"], [0.69, "KROV"], [0.80, "FASADA"], [0.94, "ZAVRŠENO"]
];

let ticking = false;
function updateScroll() {
  ticking = false;
  const heroRect = heroSection.getBoundingClientRect();
  const heroDistance = Math.max(1, heroSection.offsetHeight - window.innerHeight * 0.64);
  const heroP = clamp01(-heroRect.top / heroDistance);

  globalHouseScene?.updateFromScroll(heroP);
  if (buildPercent) buildPercent.textContent = `${String(Math.round(heroP * 100)).padStart(3, "0")}%`;
  if (progressBar) progressBar.style.transform = `scaleX(${Math.max(0.01, heroP)})`;
  if (buildPhase) {
    let phase = buildPhases[0][1];
    buildPhases.forEach(([at, name]) => { if (heroP >= at) phase = name; });
    buildPhase.textContent = phase;
  }
  heroSection.style.setProperty("--hero-progress", heroP);
  header.classList.toggle("is-scrolled", window.scrollY > 24);

  document.querySelectorAll(".project").forEach((el) => {
    const rect = el.getBoundingClientRect();
    const p = clamp01((window.innerHeight - rect.top) / (window.innerHeight + rect.height));
    el.style.setProperty("--project-shift", `${(p - 0.5) * -46}px`);
  });
}
function requestScrollUpdate() {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(updateScroll);
  }
}
window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("resize", requestScrollUpdate, { passive: true });
updateScroll();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add("is-visible"); });
}, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

const serviceButtons = [...document.querySelectorAll(".service-item")];
function activateService(index) {
  serviceButtons.forEach((b, i) => b.classList.toggle("is-active", i === index));
  document.querySelector("[data-service-code]").textContent = String(index + 1).padStart(2, "0");
  globalHouseScene?.setService(index);
}
serviceButtons.forEach((btn, index) => {
  btn.addEventListener("mouseenter", () => activateService(index));
  btn.addEventListener("focus", () => activateService(index));
  btn.addEventListener("click", () => activateService(index));
});

const serviceObserver = new IntersectionObserver((entries) => {
  const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
  if (visible[0]) activateService(Number(visible[0].target.dataset.service));
}, { threshold: [0.35, 0.55, 0.75], rootMargin: "-24% 0px -24% 0px" });
serviceButtons.forEach((b) => serviceObserver.observe(b));
