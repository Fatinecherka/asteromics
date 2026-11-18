# AsterOmics

Public website for AsterOmics — omics data analysis consultancy.

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy

Pushes to `main` build with Vite and deploy to GitHub Pages via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

One-time setup in the GitHub repo: **Settings → Pages → Source → GitHub Actions**.

The custom domain (`asteromics.com`) is preserved via `public/CNAME`.
