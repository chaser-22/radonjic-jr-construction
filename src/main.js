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
      <span class="brand-mark">RJ</span>
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

    <a class="header-cta" href="tel:${PHONE}">
      <span>Pozovite nas</span><i aria-hidden="true">${arrowIcon}</i>
    </a>
  </header>

  <main id="main">
    <section class="hero" id="top" data-house-section="hero" data-header="dark">
      <div class="hero-grid" aria-hidden="true"></div>
      <div class="hero-content shell">
        <p class="micro-label">RADONJIC JR / CONSTRUCTION</p>
        <h1><span>OD TEMELJA</span><em>DO KROVA.</em></h1>
        <p class="hero-intro">Gradimo jasno, pouzdano i bez komplikacija — od prvog iskopa do završnog krova.</p>
        <div class="hero-actions">
          <a class="button button-primary" href="tel:${PHONE}">Pozovite nas <span>${arrowIcon}</span></a>
          <a class="button button-secondary" href="#radovi">Pogledajte radove <span>${downIcon}</span></a>
        </div>
      </div>

      <div class="build-status" aria-hidden="true">
        <span data-build-phase>PRIPREMA</span>
        <strong data-build-percent>000%</strong>
        <i><b data-build-bar></b></i>
      </div>

      <div class="scroll-cue" aria-hidden="true"><span>SCROLL</span><i></i></div>
    </section>

    <section class="about light-section" id="o-nama" data-house-section="about" data-header="light">
      <div class="shell about-layout">
        <div class="section-heading reveal">
          <p class="micro-label dark-label">01 / O NAMA</p>
          <h2>GRADNJA KOJU<br><em>MOŽETE DA VIDITE.</em></h2>
        </div>
        <div class="about-copy reveal">
          <p class="lede">Ne prodajemo komplikovane priče. Dogovorimo posao, organizujemo faze i izvedemo ga kako treba.</p>
          <p>Radimo grubu gradnju, temelje, armirano-betonske radove, zidanje, krovove, ograde, coklove, rušenje i pripremne radove.</p>
          <div class="trust-row" aria-label="Naše vrijednosti">
            <span>Pouzdanost</span><span>Tačnost</span><span>Kvalitet</span><span>Poštena cijena</span>
          </div>
        </div>
      </div>
    </section>

    <section class="structure dark-section" id="konstrukcija" data-house-section="structure" data-header="dark">
      <div class="shell structure-layout">
        <div class="section-heading reveal">
          <p class="micro-label">02 / KAKO GRADIMO</p>
          <h2>SVAKA FAZA<br><em>IMA SVOJ RED.</em></h2>
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
      <div class="shell work-intro reveal">
        <div>
          <p class="micro-label dark-label">03 / RADOVI</p>
          <h2>RADOVI<br><em>GOVORE NAJVIŠE.</em></h2>
        </div>
        <p>Portfolio je namjerno jednostavan: velika fotografija, vrsta radova i kratko objašnjenje. Kada ubacimo vaše originalne fotografije, one postaju glavni dokaz kvaliteta.</p>
      </div>

      <div class="project-editorial shell">
        ${projects.map((project, index) => {
          const image = (width) => project.provider === "unsplash"
            ? `${project.image}?auto=format&fit=crop&q=82&w=${width}`
            : `${project.image}?auto=compress&cs=tinysrgb&w=${width}`;
          return `
          <article class="project reveal">
            <div class="project-image">
              <img
                src="${image(1200)}"
                srcset="${image(640)} 640w, ${image(960)} 960w, ${image(1400)} 1400w, ${image(2000)} 2000w"
                sizes="(max-width: 760px) calc(100vw - 24px), (max-width: 1180px) calc(100vw - 48px), 70vw"
                data-fallback="${project.fallback}?auto=compress&cs=tinysrgb&w=1200"
                style="object-position:${project.position || "center"}"
                alt="${project.title} — ilustrativna fotografija gradilišta"
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

      <p class="photo-disclaimer shell">Profesionalne ilustrativne fotografije gradilišta. Zamijenićemo ih originalnim RADONJIC JR fotografijama kada budu spremne.</p>
    </section>

    <section class="services dark-section" id="usluge" data-house-section="services" data-header="dark">
      <div class="shell services-head reveal">
        <p class="micro-label">04 / USLUGE</p>
        <h2>ŠTA RADIMO.</h2>
        <p>Izaberite vrstu radova. Model kuće pokazuje relevantan dio konstrukcije.</p>
      </div>

      <div class="shell services-layout">
        <div class="service-picker reveal">
          <p class="service-tip"><span aria-hidden="true"></span>Klikni me</p>
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
        <p class="micro-label dark-label">05 / PRISTUP</p>
        <h2>JASAN DOGOVOR.<br>UREDAN RAD.<br>DOBAR REZULTAT.</h2>
        <div class="values-copy">
          <p>Najvažnije je da znate šta se radi, kojim redom i gdje smo u procesu.</p>
          <a href="tel:${PHONE}">Razgovarajmo o projektu <span>${arrowIcon}</span></a>
        </div>
      </div>
    </section>

    <section class="process light-section" id="proces" data-house-section="process" data-header="light">
      <div class="shell process-head reveal">
        <p class="micro-label dark-label">06 / PROCES</p>
        <h2>ČETIRI KORAKA.<br><em>BEZ KOMPLIKACIJA.</em></h2>
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
          <p class="micro-label">07 / KONTAKT</p>
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
const buildPercent = document.querySelector("[data-build-percent]");
const buildPhase = document.querySelector("[data-build-phase]");
const buildBar = document.querySelector("[data-build-bar]");
const header = document.querySelector(".site-header");
const projectElements = [...document.querySelectorAll(".project")];
const visibleProjects = new Set();

let houseScene = null;
let heroTop = 0;
let heroHeight = 1;
let viewportHeight = window.innerHeight;
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

const phases = [
  [0.00, "PRIPREMA"],
  [0.09, "TEMELJI"],
  [0.20, "ARMATURA"],
  [0.34, "KONSTRUKCIJA"],
  [0.50, "ZIDANJE"],
  [0.66, "KROV"],
  [0.80, "FASADA"],
  [0.93, "ZAVRŠENO"]
];

let ticking = false;
let lastHeroProgress = -1;
let lastHeroPercent = -1;
let lastHeroPhase = "";
let lastHeaderScrolled = null;

function refreshScrollMetrics() {
  heroTop = hero.offsetTop;
  heroHeight = Math.max(1, hero.offsetHeight);
  viewportHeight = Math.max(1, window.innerHeight);
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
  const distance = Math.max(1, heroHeight - viewportHeight * .70);
  const progress = clamp01((scrollY - heroTop) / distance);

  houseScene?.updateFromScroll(progress);

  if (Math.abs(progress - lastHeroProgress) > .00035) {
    hero.style.setProperty("--hero-progress", progress.toFixed(4));
    hero.style.setProperty("--hero-y", `${progress * -105}px`);
    hero.style.setProperty("--hero-opacity", String(1 - progress * .68));
    if (buildBar) buildBar.style.transform = `scaleX(${Math.max(.01, progress)})`;
    lastHeroProgress = progress;
  }

  const percent = Math.round(progress * 100);
  if (buildPercent && percent !== lastHeroPercent) {
    buildPercent.textContent = `${String(percent).padStart(3, "0")}%`;
    lastHeroPercent = percent;
  }

  if (buildPhase) {
    let phase = phases[0][1];
    for (let i = 0; i < phases.length; i += 1) {
      if (progress >= phases[i][0]) phase = phases[i][1];
    }
    if (phase !== lastHeroPhase) {
      buildPhase.textContent = phase;
      lastHeroPhase = phase;
    }
  }

  const headerScrolled = scrollY > 20;
  if (headerScrolled !== lastHeaderScrolled) {
    header.classList.toggle("is-scrolled", headerScrolled);
    lastHeaderScrolled = headerScrolled;
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

const themeObserver = new IntersectionObserver((entries) => {
  const visible = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  header.dataset.headerTheme = visible.target.dataset.header || "dark";
}, { threshold: [0.18, 0.35, 0.55], rootMargin: "-15% 0px -70% 0px" });
document.querySelectorAll("[data-header]").forEach((section) => themeObserver.observe(section));

const serviceButtons = [...document.querySelectorAll(".service-row")];
const serviceTitle = document.querySelector("[data-active-service-title]");
const serviceCode = document.querySelector("[data-active-service-code]");

function activateService(button) {
  serviceButtons.forEach((item) => {
    const active = item === button;
    item.classList.toggle("is-active", active);
    item.setAttribute("aria-pressed", String(active));
  });
  if (serviceTitle) serviceTitle.textContent = button.querySelector("strong").textContent.toUpperCase();
  if (serviceCode) serviceCode.textContent = button.dataset.serviceCode;
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
    else if (serviceButtons[0] && !serviceButtons.some((button) => button.matches(":focus"))) {
      const active = serviceButtons.find((button) => button.classList.contains("is-active")) || serviceButtons[0];
      houseScene?.setService(active.dataset.service);
    }
  });
}, { threshold: 0.08 });
serviceSectionObserver.observe(servicesSection);
