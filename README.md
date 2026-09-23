# RADONJIC JR Construction — V7 Follow House

[![CI](https://github.com/chaser-22/radonjic-jr-construction/actions/workflows/ci.yml/badge.svg)](https://github.com/chaser-22/radonjic-jr-construction/actions/workflows/ci.yml)

Production-ready Vite + native Three.js website for RADONJIC JR Construction.

## Stack

- Vite
- Native Three.js
- Plain JavaScript
- CSS
- Vercel

## Development

```bash
npm ci
npm run dev
```

## Production check

```bash
npm ci
npm audit --omit=dev --audit-level=high
npm run build
npm run preview
```

The production build is generated in `dist/`. Do not commit `dist/`, `node_modules/`, or `.vercel/`.

## Deployment

The `main` branch is connected to Vercel. Every push to `main` triggers:

1. GitHub Actions CI
2. Clean dependency installation
3. Production dependency audit
4. Vite production build
5. Automatic Vercel deployment

Vercel configuration lives in `vercel.json`. Node.js is pinned through `package.json`.

## Maintenance

Dependabot checks npm packages and GitHub Actions monthly. Review its pull requests before merging dependency updates.

Before public launch, replace the temporary Pexels imagery with original project photography.
