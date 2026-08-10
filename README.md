# Invitation

A simple Nuxt site: click the right half of the card to flip to the next page,
click the left half to flip back — like a booklet. Three pages, PNG images.

Swap the placeholders at `public/images/page1.png`, `page2.png`, `page3.png`
with your real artwork (same filenames, any aspect ratio close to 5:7 works
best since the card crops to `object-fit: cover`).

## Requirements

Node **>= 22.12** (or >= 20.19). Nuxt's bundler needs native binaries that
aren't published for older Node builds — check with `node -v` before installing.

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Opens on `http://localhost:3000/invitation/`.

## Deploying to GitHub Pages

Push this repo to GitHub as `invitation` (or update `NUXT_APP_BASE_URL` /
the default in `nuxt.config.ts` to match your repo name), then in the repo
settings enable **Pages → Source: GitHub Actions**. The workflow in
`.github/workflows/deploy.yml` builds and deploys on every push to `main`.

To build the static site locally:

```bash
npm run generate
```

Output lands in `.output/public/`, ready for any static host.
