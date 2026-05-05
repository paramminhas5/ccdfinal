## Replace `/ccdxsocial` with the uploaded React project

The uploaded zip is a real React/Vite version of the same partnership doc — proper component, scoped CSS, logo assets, fresh PDFs. We'll swap it in to replace the current "fetch static HTML and inline it" hack.

### What gets added

From `lovable-connect-main/` into this project:

```text
src/pages/CcdxSocial.tsx                     ← rewritten from uploaded src/pages/Index.tsx
src/pages/ccd.css                            ← copied as-is (scoped to .ccd-* classes)
src/assets/ccd-logo.png                      ← copied
src/assets/social-logo.png                   ← copied
public/ccdxsocial/CCD-One-Pager.pdf          ← replaces ccd-social-one-pager.pdf
public/ccdxsocial/CCD-Operations-Doc.pdf     ← replaces ccd-social-operations.pdf
```

### Adaptations to fit this project

The uploaded project is standalone — this project has site chrome (Nav, Footer, ThemeSwitcher, DiscoButton). The new page must hide all of it.

`src/pages/CcdxSocial.tsx` (new, replaces current file):
- Port the entire uploaded `Index.tsx` body (tabs, sub-nav, sections, download dialog, PDF mode via `?pdf=op|ops`).
- Import `ccd.css`, `ccd-logo.png`, `social-logo.png` from new locations.
- Wrap in a `<Helmet>` that sets the title and `noindex,nofollow`.
- On mount, add `ccdxsocial-active` class to `<html>` and inject a `<style>` that hides the global Nav/Footer/ThemeSwitcher/DiscoButton (same hiding mechanism currently in `CcdxSocial.tsx`). Remove on unmount.
- Update PDF paths to `/ccdxsocial/CCD-One-Pager.pdf` and `/ccdxsocial/CCD-Operations-Doc.pdf` (already what the uploaded file uses).

### Files removed

```text
public/ccdxsocial/index.html                  ← no longer needed (was the inlined static doc)
public/ccdxsocial/ccd-social-one-pager.pdf    ← replaced by CCD-One-Pager.pdf
public/ccdxsocial/ccd-social-operations.pdf   ← replaced by CCD-Operations-Doc.pdf
scripts/build-ccdxsocial-pdfs.mjs             ← obsolete (PDFs now ship from upload)
```

### Files unchanged

- `src/App.tsx` — route `/ccdxsocial → <CcdxSocial />` already registered, stays.
- `public/robots.txt` — `Disallow: /ccdxsocial` stays.
- Sitemap / RSS / `seo-routes.mjs` — page remains off the SEO graph.
- `public/_redirects` — no change.

### Verification

- `/ccdxsocial` loads in dev preview with the new design (logo lockup, tabs, sticky sub-nav).
- Site Nav/Footer/ThemeSwitcher/Disco button are hidden on this page only.
- Tab switching between One-Pager and Operations Doc works.
- Download dialog opens; both PDFs download from `/ccdxsocial/CCD-*.pdf`.
- `?pdf=op` and `?pdf=ops` query params still trigger print-mode styles.
- View-source shows `noindex, nofollow`.
- Other routes still show the global Nav/Footer normally.
