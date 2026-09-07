# Signet Tools

The canonical [signet.tools](https://signet.tools) website. Astro generates the
static pages; nginx serves them on Fly.io, app `signet-tools`.

```sh
npm ci
npm run dev
npm run build
fly deploy --remote-only
```

Pages: `/` (brand and architecture), `/start/` (installation), `/privacy/`,
and `/demo/` (the separate interactive book-purchase example). Published legacy
setup URLs redirect to `/start/` through nginx.

Brand assets and usage: [docs/brand.md](docs/brand.md). Machine-readable discovery
and documentation live in `public/`. The vault source is a different repository,
[jmcentire/signet](https://github.com/jmcentire/signet); its `docs/` directory is
redirects old GitHub Pages links to this site, not a second deployment source.
The root `index.html` is also only a GitHub Pages redirect; Astro builds the
production homepage from `src/pages/index.astro`.
