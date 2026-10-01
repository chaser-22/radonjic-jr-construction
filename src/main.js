import "./styles/base.css";
import "./styles/sections.css";
import "./styles/responsive.css";
import { canUseWebGL } from "./scene/shared.js";
import { createHouseScene } from "./scene/controller.js";
import { createLoaderHouse } from "./scene/loader.js";
import { DISPLAY_PHONE, EMAIL, PHONE, projects, services } from "./data.js";

const whatsapp = `https://wa.me/${PHONE.replace("+", "")}`;
const arrowIcon = `<svg class="ui-arrow" viewBox="0 0 20 20" aria-hidden="true"><path d="M5 15 15 5"/><path d="M8 5h7v7"/></svg>`;
const downIcon = `<svg class="ui-arrow ui-arrow-down" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 4v11"/><path d="m6 11 4 4 4-4"/></svg>`;
const app = document.querySelector("#app");
const isPhoneViewport = window.matchMedia("(max-width: 760px)").matches;
const siteLoader = document.querySelector("#site-loader");
const loaderValue = document.querySelector("[data-loader-value]");
const loaderPhase = document.querySelector("[data-loader-phase]");
const LOADER_DURATION = 4000;
const loaderStartedAt = window.__RJ_LOADER_STARTED_AT__ ?? performance.now();
let loaderProgress = 0;
let loaderClockFrame = 0;
let loaderFinished = false;
let loaderHouse3d = null;

const loaderPhases = [
  [0, "PRIPREMA"],
  [8, "TEMELJI"],
  [18, "ARMATURA"],
  [32, "KONSTRUKCIJA"],
  [48, "ZIDANJE"],
  [66, "KROV"],
  [86, "ZAVRŠNO"]
];

try {
  loaderHouse3d = createLoaderHouse(document.querySelector("[data-loader-three]"));
  if (loaderHouse3d) siteLoader?.classList.add("loader-three-ready");
} catch (error) {
  console.warn("3D loader unavailable; using SVG fallback.", error);
}

function setLoader(progress) {
  loaderProgress = Math.max(loaderProgress, Math.min(100, progress));
  siteLoader?.style.setProperty("--loader-progress", `${loaderProgress}%`);
  loaderHouse3d?.setProgress(loaderProgress / 100);
  if (loaderValue) loaderValue.textContent = `${String(Math.round(loaderProgress)).padStart(3, "0")}%`;
  if (loaderPhase) {
    let phase = loaderPhases[0][1];
    loaderPhases.forEach(([at, label]) => {
      if (loaderProgress >= at) phase = label;
    });
    loaderPhase.textContent = phase;
  }
}

function updateLoaderClock(now = performance.now()) {
  if (loaderFinished) return;
  const elapsed = Math.max(0, now - loaderStartedAt);
  const ratio = Math.min(1, elapsed / LOADER_DURATION);
  setLoader(Math.min(99, ratio * 100));
  if (ratio < 1) loaderClockFrame = requestAnimationFrame(updateLoaderClock);
}

function finishLoader() {
  if (loaderFinished) return;
  loaderFinished = true;
  cancelAnimationFrame(loaderClockFrame);
  setLoader(100);
  loaderHouse3d?.complete();
  clearTimeout(window.__RJ_LOADER_TIMEOUT__);
  window.setTimeout(() => {
    loaderHouse3d?.freeze();
    siteLoader?.classList.add("loader-out");
    document.documentElement.classList.remove("is-loading");
    document.documentElement.classList.add("site-ready");
    houseScene?.playIntro();

    window.setTimeout(() => {
      document.documentElement.classList.add("site-entered");
      window.setTimeout(() => {
        document.documentElement.classList.add("site-settled");
      }, 1450);
    }, 90);

    window.setTimeout(() => {
      loaderHouse3d?.destroy();
      loaderHouse3d = null;
    }, 520);
  }, 60);
}

function finishLoaderAtFourSeconds() {
  const remaining = Math.max(0, LOADER_DURATION - (performance.now() - loaderStartedAt));
  window.setTimeout(finishLoader, remaining);
}

loaderClockFrame = requestAnimationFrame(updateLoaderClock);

app.innerHTML = `
  <div class="house-layer" data-house-layer aria-hidden="true">
    <div class="house-fallback">
      <span class="fallback-slab"></span>
      <span class="fallback-column c1"></span>
      <span class="fallback-column c2"></span>
      <span class="fallback-column c3"></span>
      <span class="fallback-column c4"></span>
      <span class="fallback-roof r1"></span>
      <span class="fallback-roof r2"></span>
    </div>
    <canvas class="house-canvas"></canvas>
  </div>

  <header class="site-header" data-header-theme="dark">
    <a class="brand" href="#top" aria-label="Radonjic JR Construction — početna">
      <svg class="brand-logo-mark" viewBox="0 0 1004 660" aria-hidden="true" focusable="false">
        <polygon class="brand-logo-ink" points="8,252 8,513 107,513 108,328 282,494 429,494 195,252"/>
        <polygon class="brand-logo-ink" points="604,251 604,513 692,513 694,329 873,513 1004,513 758,252"/>
        <polygon class="brand-logo-ink" points="577,194 468,274 468,525 314,527 445,660 577,536"/>
        <polygon class="brand-logo-ink" points="0,121 94,213 317,213 340,234 338,353 356,371 431,305 431,199 356,121"/>
        <polygon class="brand-logo-ink" points="599,121 601,134 678,213 866,216 893,244 893,350 921,377 994,315 994,229 887,121"/>
        <polygon class="brand-logo-accent" points="578,0 465,82 465,244 578,162"/>
      </svg>
      <span class="brand-copy">
        <strong>RADONJIC JR</strong>
        <span>CONSTRUCTION</span>
      </span>
    </a>

    <nav class="desktop-nav" aria-label="Glavna navigacija">
      <a href="#radovi">Radovi</a>
      <a href="#usluge">Usluge</a>
      <a href="#o-nama">O nama</a>
      <a href="#kontakt">Kontakt</a>
    </nav>

  </header>

  <main id="main">
    <section class="hero" id="top" data-house-section="hero" data-header="dark">
      <div class="hero-grid" aria-hidden="true"></div>
      <div class="hero-content shell">
        <h1><span>OD TEMELJA</span><em>DO KROVA.</em></h1>
        <p class="hero-intro">Gradimo jasno, pouzdano i bez komplikacija — od prvog iskopa do završnog krova.</p>
        <div class="hero-actions">
          <a class="button button-primary" href="tel:${PHONE}">Pozovite nas <span>${arrowIcon}</span></a>
          <a class="button button-secondary" href="#radovi">Pogledajte radove <span>${downIcon}</span></a>
        </div>
      </div>

      <div class="scroll-cue" aria-hidden="true"><span>SCROLL</span><i></i></div>
    </section>

    <section class="about light-section" id="o-nama" data-house-section="about" data-header="light">
      <div class="shell about-layout">
        <div class="section-heading manifesto-reveal reveal">
          <h2 class="section-manifesto">
            <span class="section-manifesto-line">GRADNJA KOJU</span>
            <span class="section-manifesto-line section-manifesto-accent">MOŽETE DA VIDITE.</span>
          </h2>
        </div>
        <div class="about-copy reveal">
          <p class="lede">Bez komplikovanja. Dogovorimo posao, organizujemo faze i izvedemo ga kako treba.</p>
          <p>Radimo grubu gradnju, temelje, armirano-betonske radove, zidanje, krovove, ograde, coklove, rušenje i pripremne radove.</p>
          <div class="trust-row" aria-label="Naše vrijednosti">
            <span>Pouzdanost</span><span>Tačnost</span><span>Kvalitet</span><span>Poštena cijena</span>
          </div>
        </div>
      </div>
    </section>

    <section class="structure dark-section" id="konstrukcija" data-house-section="structure" data-header="dark">
      <div class="shell structure-layout">
        <div class="section-heading manifesto-reveal reveal">
          <h2 class="section-manifesto">
            <span class="section-manifesto-line">SVAKA FAZA</span>
            <span class="section-manifesto-line section-manifesto-accent structure-manifesto-accent"><span>IMA SVOJ</span><span class="structure-red"> RED.</span></span>
          </h2>
          <p class="section-description">Kuća nije jedan potez. Ona je sistem u kojem svaka faza zavisi od prethodne.</p>
        </div>
        <div class="stage-spacer" aria-hidden="true"></div>
        <div class="phase-list reveal">
          <article><span>01</span><div><h3>Temelji</h3><p>Iskop, armatura i oslonac cijelog objekta.</p></div></article>
          <article><span>02</span><div><h3>Konstrukcija</h3><p>Stubovi, grede i ploče definišu geometriju.</p></div></article>
          <article><span>03</span><div><h3>Zidovi i krov</h3><p>Objekat dobija volumen, zaštitu i završnu formu.</p></div></article>
        </div>
      </div>
    </section>

    <section class="work light-section" id="radovi" data-house-section="work" data-header="light">
      <div class="shell work-intro manifesto-reveal reveal">
        <div>
          <h2 class="section-manifesto work-manifesto">
            <span class="section-manifesto-line">RADOVI</span>
            <span class="section-manifesto-line section-manifesto-accent">GOVORE</span>
            <span class="section-manifesto-line section-manifesto-accent">NAJVIŠE.</span>
          </h2>
        </div>
        
      </div>

      <div class="project-editorial shell">
        ${projects.map((project, index) => {
          const isFixedAsset = project.provider === "local" || project.provider === "instagram";
          const image = (width) => isFixedAsset
            ? project.image
            : project.provider === "unsplash"
              ? `${project.image}?auto=format&fit=crop&q=82&w=${width}`
              : `${project.image}?auto=compress&cs=tinysrgb&w=${width}`;
          const responsiveAttrs = isFixedAsset
            ? ""
            : `srcset="${image(640)} 640w, ${image(960)} 960w, ${image(1400)} 1400w, ${image(2000)} 2000w"`;
          const fallback = isFixedAsset
            ? project.fallback
            : `${project.fallback}?auto=compress&cs=tinysrgb&w=1200`;
          return `
          <article class="project reveal">
            <div class="project-image">
              <img
                src="${image(1200)}"
                ${responsiveAttrs}
                sizes="(max-width: 760px) calc(100vw - 28px), (max-width: 1180px) calc(100vw - 48px), 70vw"
                data-fallback="${fallback}"
                style="object-position:${project.position || "center"}"
                alt="${project.title} — RADONJIC JR izvedeni radovi"
                width="1200"
                height="1500"
                loading="${!isPhoneViewport && index === 0 ? "eager" : "lazy"}"
                fetchpriority="${!isPhoneViewport && index === 0 ? "high" : "auto"}"
                decoding="async"
              />
              <span>${project.number}</span>
            </div>
            <div class="project-copy">
              <p>${project.category}</p>
              <h3>${project.title}</h3>
              <div><span>${project.text}</span><i aria-hidden="true">${arrowIcon}</i></div>
            </div>
          </article>
        `;
        }).join("")}
      </div>

    </section>

    <section class="services dark-section" id="usluge" data-house-section="services" data-header="dark">
      <div class="shell services-head reveal">
        <h2>ŠTA RADIMO.</h2>
        <p>Izaberite vrstu radova. Model kuće pokazuje relevantan dio konstrukcije.</p>
      </div>

      <div class="shell services-layout">
        <div class="service-picker reveal">
          <p class="service-tip"><span aria-hidden="true"></span>Odaberite radove</p>
          <div class="service-list" role="list">
          ${services.map((service, index) => `
            <button class="service-row ${index === 0 ? "is-active" : ""}" type="button" data-service="${service.key}" data-service-code="${service.code}" aria-pressed="${index === 0 ? "true" : "false"}">
              <span>${service.code}</span>
              <strong>${service.title}</strong>
              <p>${service.text}</p>
              <i aria-hidden="true">${arrowIcon}</i>
            </button>
          `).join("")}
          </div>
        </div>

        <div class="service-stage" aria-hidden="true"></div>
      </div>
    </section>

    <section class="values accent-section" id="vrijednosti" data-house-section="values" data-header="light">
      <div class="shell values-layout reveal">
        <h2 class="values-manifesto">
          <span class="values-line">JASAN DOGOVOR.</span>
          <span class="values-line">UREDAN RAD.</span>
          <span class="values-line">DOBAR REZULTAT.</span>
        </h2>
      </div>
    </section>

    <section class="process light-section" id="proces" data-house-section="process" data-header="light">
      <div class="shell process-head reveal">
        <h2 class="process-manifesto">
          <span class="process-line">ČETIRI KORAKA.</span>
          <span class="process-line"><em>BEZ KOMPLIKACIJA.</em></span>
        </h2>
      </div>
      <div class="shell process-grid reveal">
        <article><span>01</span><h3>Pregled</h3><p>Vidimo posao i definišemo obim.</p></article>
        <article><span>02</span><h3>Dogovor</h3><p>Jasna ponuda i redoslijed radova.</p></article>
        <article><span>03</span><h3>Izvedba</h3><p>Organizovan rad kroz dogovorene faze.</p></article>
        <article><span>04</span><h3>Predaja</h3><p>Završna provjera i čist rezultat.</p></article>
      </div>
    </section>

    <section class="contact dark-section" id="kontakt" data-house-section="contact" data-header="dark">
      <div class="shell contact-layout">
        <div class="contact-copy reveal">
          <h2>IMATE<br><em>PROJEKAT?</em></h2>
          <p>Najbrže je da se čujemo. Recite nam šta planirate i gdje se projekat nalazi.</p>
        </div>
        <div class="contact-panel reveal">
          <a class="phone-link" href="tel:${PHONE}">${DISPLAY_PHONE}<span>${arrowIcon}</span></a>
          <div class="contact-links">
            <a href="${whatsapp}" target="_blank" rel="noreferrer">WhatsApp <span>${arrowIcon}</span></a>
            <a href="mailto:${EMAIL}">Email <span>${arrowIcon}</span></a>
          </div>
          <a class="email-address" href="mailto:${EMAIL}">${EMAIL}</a>
        </div>
      </div>
    </section>
  </main>

  <div class="site-progress" data-theme="dark" aria-hidden="true">
    <div class="site-progress-copy">
      <span>PROGRES</span>
      <strong data-site-progress-section>POČETAK</strong>
      <em><b data-site-progress-index>01/08</b><i data-site-progress-percent>000%</i></em>
    </div>
    <div class="site-progress-rail">
      <span class="site-progress-track"></span>
      <span class="site-progress-fill" data-site-progress-fill></span>
      <span class="site-progress-marker" data-site-progress-marker></span>
    </div>
  </div>

  <div class="mobile-contact" aria-label="Brzi kontakt">
    <a class="quick-contact quick-contact-call" href="tel:${PHONE}">
      <span class="quick-contact-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M6.6 3.8 9 3.2l2 5-1.8 1.4a14.5 14.5 0 0 0 5.2 5.2L15.8 13l5 2-.6 2.4c-.3 1.2-1.4 2-2.6 2C10.4 19.4 4.6 13.6 4.6 6.4c0-1.2.8-2.3 2-2.6Z"/></svg>
      </span>
      <span>Pozovi</span>
    </a>
    <a class="quick-contact" href="${whatsapp}" target="_blank" rel="noreferrer">
      <span class="quick-contact-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M12 4.5a7.5 7.5 0 0 0-6.4 11.4L4.8 20l4.2-.8A7.5 7.5 0 1 0 12 4.5Z"/><path d="M9.1 9.1c.5 2.2 2 3.7 4.2 4.4"/></svg>
      </span>
      <span>WhatsApp</span>
    </a>
    <a class="quick-contact" href="mailto:${EMAIL}">
      <span class="quick-contact-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M4.5 6.5h15v11h-15z"/><path d="m5 7 7 5.2L19 7"/></svg>
      </span>
      <span>Email</span>
    </a>
  </div>
`;

const clamp01 = (value) => Math.max(0, Math.min(1, value));
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


const houseLayer = document.querySelector("[data-house-layer]");
const hero = document.querySelector(".hero");
const header = document.querySelector(".site-header");
const siteProgress = document.querySelector(".site-progress");
const siteProgressFill = document.querySelector("[data-site-progress-fill]");
const siteProgressMarker = document.querySelector("[data-site-progress-marker]");
const siteProgressPercent = document.querySelector("[data-site-progress-percent]");
const siteProgressSection = document.querySelector("[data-site-progress-section]");
const siteProgressIndex = document.querySelector("[data-site-progress-index]");
const projectElements = [...document.querySelectorAll(".project")];
const visibleProjects = new Set();
const progressSections = [...document.querySelectorAll("main > section")];
const progressLabels = {
  top: "POČETAK",
  "o-nama": "O NAMA",
  konstrukcija: "KAKO GRADIMO",
  radovi: "RADOVI",
  usluge: "USLUGE",
  vrijednosti: "PRISTUP",
  proces: "PROCES",
  kontakt: "KONTAKT"
};

let houseScene = null;
let heroTop = 0;
let heroHeight = 1;
let viewportHeight = window.innerHeight;
let pageScrollRange = 1;
let progressSectionOffsets = [];
let metricsTicking = false;

if (canUseWebGL()) {
  try {
    houseScene = createHouseScene(houseLayer, houseLayer.querySelector("canvas"));
    houseLayer.classList.remove("three-failed");
    houseLayer.classList.add("three-ready");
    houseLayer.dataset.threeState = "ready";
    
  } catch (error) {
    houseLayer.classList.remove("three-ready");
    houseLayer.classList.add("three-failed");
    houseLayer.dataset.threeState = "failed";
    
    console.error("Three.js initialization failed", error);
  }
} else {
  document.documentElement.classList.add("no-webgl");
  houseLayer.dataset.threeState = "unsupported";
  
}

document.querySelectorAll(".project-image img").forEach((image) => {
  image.addEventListener("load", () => {
    image.closest(".project-image")?.classList.add("is-loaded");
    houseScene?.refreshLayout();
    requestScrollState();
  }, { once: true });
  image.addEventListener("error", () => {
    const fallback = image.dataset.fallback;
    if (fallback && image.src !== fallback) {
      image.removeAttribute("srcset");
      image.src = fallback;
    } else {
      image.closest(".project-image")?.classList.add("is-image-fallback");
    }
  });
});

const readiness = [
  document.fonts?.ready || Promise.resolve(),
  houseScene?.ready || Promise.resolve()
];

Promise.race([
  Promise.allSettled(readiness),
  new Promise((resolve) => setTimeout(resolve, 3200))
]).then(() => {
  houseScene?.refreshLayout();
  refreshScrollMetrics();
  requestScrollState();
  finishLoaderAtFourSeconds();
});

document.fonts?.ready?.then(() => {
  houseScene?.refreshLayout();
  refreshScrollMetrics();
  requestScrollState();
});

let ticking = false;
let lastHeroProgress = -1;
let lastSiteProgress = -1;
let lastSitePercent = -1;
let lastSiteSection = -1;
let lastHeaderScrolled = null;
let lastHeaderTheme = null;

function refreshScrollMetrics() {
  heroTop = hero.offsetTop;
  heroHeight = Math.max(1, hero.offsetHeight);
  viewportHeight = Math.max(1, window.innerHeight);
  pageScrollRange = Math.max(1, document.documentElement.scrollHeight - viewportHeight);
  progressSectionOffsets = progressSections.map((section) => section.offsetTop);
}

function requestMetricsRefresh() {
  if (metricsTicking) return;
  metricsTicking = true;
  requestAnimationFrame(() => {
    metricsTicking = false;
    refreshScrollMetrics();
    houseScene?.refreshLayout();
    updateScrollState();
  });
}

function updateScrollState() {
  ticking = false;

  const scrollY = window.scrollY;
  const heroDistance = Math.max(1, heroHeight - viewportHeight * .70);
  const heroProgress = clamp01((scrollY - heroTop) / heroDistance);
  const pageProgress = clamp01(scrollY / pageScrollRange);

  houseScene?.updateFromScroll(heroProgress);

  if (Math.abs(heroProgress - lastHeroProgress) > .00035) {
    hero.style.setProperty("--hero-progress", heroProgress.toFixed(4));
    hero.style.setProperty("--hero-y", `${heroProgress * -105}px`);
    hero.style.setProperty("--hero-opacity", String(1 - heroProgress * .68));
    lastHeroProgress = heroProgress;
  }

  if (Math.abs(pageProgress - lastSiteProgress) > .00025) {
    const normalized = Math.max(.002, pageProgress);
    siteProgressFill?.style.setProperty("--site-progress", normalized.toFixed(4));
    siteProgressMarker?.style.setProperty("--site-progress", normalized.toFixed(4));
    lastSiteProgress = pageProgress;
  }

  const sitePercent = Math.round(pageProgress * 100);
  if (siteProgressPercent && sitePercent !== lastSitePercent) {
    siteProgressPercent.textContent = `${String(sitePercent).padStart(3, "0")}%`;
    lastSitePercent = sitePercent;
  }

  const sectionProbe = scrollY + viewportHeight * .38;
  let activeSection = 0;
  for (let i = 0; i < progressSectionOffsets.length; i += 1) {
    if (sectionProbe >= progressSectionOffsets[i]) activeSection = i;
    else break;
  }

  if (activeSection !== lastSiteSection) {
    const section = progressSections[activeSection];
    if (siteProgressSection) {
      siteProgressSection.textContent = progressLabels[section?.id] || "PROGRES";
    }
    if (siteProgressIndex) {
      siteProgressIndex.textContent =
        `${String(activeSection + 1).padStart(2, "0")}/${String(progressSections.length).padStart(2, "0")}`;
    }
    lastSiteSection = activeSection;
  }

  const headerScrolled = scrollY > 20;
  if (headerScrolled !== lastHeaderScrolled) {
    header.classList.toggle("is-scrolled", headerScrolled);
    lastHeaderScrolled = headerScrolled;
  }

  // Resolve the header theme from the section physically underneath the
  // header on every scroll frame. This works identically scrolling down
  // or back up and avoids IntersectionObserver state getting stuck.
  const headerProbe = scrollY + Math.min(104, Math.max(68, header.offsetHeight * .78));
  let headerSection = 0;
  for (let i = 0; i < progressSectionOffsets.length; i += 1) {
    if (headerProbe >= progressSectionOffsets[i]) headerSection = i;
    else break;
  }

  const headerTheme = progressSections[headerSection]?.dataset.header || "dark";
  if (headerTheme !== lastHeaderTheme) {
    header.dataset.headerTheme = headerTheme;
    if (siteProgress) siteProgress.dataset.theme = headerTheme;
    lastHeaderTheme = headerTheme;
  }

  if (!reducedMotion && window.innerWidth > 760) {
    for (const project of visibleProjects) {
      const rect = project.getBoundingClientRect();
      const p = clamp01((viewportHeight - rect.top) / (viewportHeight + rect.height));
      project.style.setProperty("--image-y", `${(p - .5) * -34}px`);
    }
  }
}

function requestScrollState() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(updateScrollState);
}

if ("IntersectionObserver" in window) {
  const projectVisibilityObserver = new IntersectionObserver((entries) => {
    for (let i = 0; i < entries.length; i += 1) {
      const entry = entries[i];
      if (entry.isIntersecting) visibleProjects.add(entry.target);
      else visibleProjects.delete(entry.target);
    }
  }, { rootMargin: "24% 0px 24% 0px", threshold: 0 });

  for (let i = 0; i < projectElements.length; i += 1) {
    projectVisibilityObserver.observe(projectElements[i]);
  }
} else {
  for (let i = 0; i < projectElements.length; i += 1) visibleProjects.add(projectElements[i]);
}

refreshScrollMetrics();
window.addEventListener("scroll", requestScrollState, { passive: true });
window.addEventListener("resize", requestMetricsRefresh, { passive: true });
window.visualViewport?.addEventListener("resize", requestMetricsRefresh, { passive: true });
updateScrollState();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const serviceButtons = [...document.querySelectorAll(".service-row")];
let activeServiceButton = serviceButtons.find((button) => button.classList.contains("is-active")) || null;

function activateService(button) {
  if (button === activeServiceButton) {
    houseScene?.setService(button.dataset.service);
    return;
  }

  for (let i = 0; i < serviceButtons.length; i += 1) {
    const item = serviceButtons[i];
    const active = item === button;
    item.classList.toggle("is-active", active);
    item.setAttribute("aria-pressed", String(active));
  }

  activeServiceButton = button;
  houseScene?.setService(button.dataset.service);
}

const coarsePointer = window.matchMedia("(hover: none), (pointer: coarse)").matches;
serviceButtons.forEach((button) => {
  const events = coarsePointer ? ["focus", "click"] : ["mouseenter", "focus", "click"];
  events.forEach((eventName) => {
    button.addEventListener(eventName, () => activateService(button));
  });
});

const servicesSection = document.querySelector("#usluge");
const serviceSectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) houseScene?.clearService();
    else if (serviceButtons[0] && !serviceButtons.includes(document.activeElement)) {
      const active = activeServiceButton || serviceButtons[0];
      houseScene?.setService(active.dataset.service);
    }
  });
}, { threshold: 0.08 });
serviceSectionObserver.observe(servicesSection);
