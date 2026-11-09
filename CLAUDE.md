# RADONJIC JR Construction website

Single-page Serbian-language marketing site: Vite, plain JavaScript, native Three.js, CSS, Vercel.
Live: https://radonjic-jr-construction.vercel.app (no custom domain yet).

## Working rules

- Pushing to `main` deploys to the live site. Do not commit or push without the owner asking.
- Node is pinned to 24.x. Before pushing, run `npm ci`, `npm audit`, and `npm run build`.
- Test the production build (`npm run build`, then `npm run preview`) in a real browser. The Claude app's browser pane runs at about 1 fps when hidden, which makes the animations look broken.

## How the code is organised

- `src/main.js` renders all page content into `#app` and handles scrolling and the loader.
- `src/data.js` holds projects, services, phone and email.
- `src/scene/` holds the 3D house: `controller.js` (camera, positions per section), `structure.js` and `finish.js` (building parts), `shared.js` (part reveal and highlighting), `loader.js` (3D loader).
- `src/styles/responsive.css` is an append-only stack of versioned layers (V16 to V90). Later layers override earlier ones, so add fixes as a new layer at the end.

## Decisions to keep

- **Ograde means concrete fences around the house**, not terrace railings. The fence appears only while Ograde is selected (`revealWith` in `shared.js`, `addConcreteFence` in `finish.js`), and `FENCE_FRAMING` in `controller.js` pulls the camera back for it. The owner chose this over always showing it. The terrace railing is an ordinary part of the house.
- **Heading gold on cream sections is `#a87c00`** for contrast. Dark sections keep brand yellow `#f2b600`.
- **Section links land exactly on the section top.** Do not set both `scroll-padding-top` and `scroll-margin-top`, because browsers add them together.
- **The progress section label shows only while scrolling** on screens up to 1600px, so it never rests on text.
- **Labels are at least 11px.** Tablets (761 to 1180px) show the service list beside the 3D model.
- **Stay on Vite 6.x for now.** Vite 8 failed the CI build, probably because of the `manualChunks` setting in `vite.config.js`. It needs its own migration.
- `allowScripts` in `package.json` must name the exact esbuild version Vite installs.

## Keep in sync

- Contact details appear in both `src/data.js` and the static fallback in `index.html`, which shows if JavaScript fails.

## Images

Project photos in `src/assets/projects/` are WebP at quality 78, in widths 640, 960, 1280 and full size, generated with sharp from the PNGs in the repo root. `public/rjc-logo.webp` is 320px at quality 88. The root PNGs and `public/rjc-logo.png` are no longer used by the site, and `sizes` in `main.js` allows for photos being cropped into taller frames.

## Vercel connector notes

Project ID: `prj_BRIfojagI0cxzaQ2DMirZhNiSFRz`. Read requests worked only when `teamId` was omitted. Build log text and runtime error reports returned 403 even after approval.

## Status at last handoff (2026-11-09)

Live on `main`: image optimization, concrete fence, layout and text fixes, Vite 6.4.5 (0 audit findings). Browser suites passed on desktop and emulated devices in Edge.

Still open:
- Confirm the site on a real iPhone in Safari. Not tested yet.
- Add a custom domain before public launch.
- Confirm the four project photos are real company work. The page labels them completed jobs, and the README says to use original photography.
- The Ograde description says "Betonske i metalne ograde", but the model shows only concrete.
- The README still mentions temporary Pexels images, which are no longer used.
- Minor: at 768px the last service description has the model behind about 13% of it, and on landscape phones the hero sentence just touches the wireframe.
- Optional cleanup: about 40 old branches on GitHub.
