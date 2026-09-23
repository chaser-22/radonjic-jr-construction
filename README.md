# RADONJIC JR Construction — V7 Follow House

V7 keeps the reliable Vite + native Three.js architecture from V6, but replaces the separate hero/service 3D canvases with one root-level transparent Three.js canvas that follows the visitor through the entire page.

## Highlights
- More detailed two-storey procedural house: footings, rebar, concrete frame, masonry, facade, windows, balcony, door, roof, gutters, railings, stairs and scaffolding.
- Scroll-driven construction in the hero; the completed house then follows the visitor through every later section.
- Same house enters x-ray mode in the structural section and service-focus mode in Services.
- Root-level canvas avoids the sticky/transformed WebGL compositing issue from older versions.
- Transparent floating header with larger RJ mark and larger brand typography.
- Existing HD prototype photography retained.

## Run
```bash
npm install
npm run dev
```

## Production
```bash
npm run build
npm run preview
```

Before public launch, replace the temporary Pexels imagery with original project photography.
