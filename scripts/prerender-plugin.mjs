// Vite plugin: after build, generate per-route static HTML files with
// route-specific <title>, meta description, canonical, OG/Twitter tags,
// and (for blog posts) a real article body — so crawlers receive proper
// HTML on the first response instead of an empty SPA shell.
//
// The React app still hydrates on top of these files in the browser.

import fs from "node:fs";
import path from "node:path";
import { SITE, staticRoutes } from "./seo-routes.mjs";

const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// Extract the static blog posts from src/content/posts.ts without executing
// the module (it imports React-flavoured runtime). We only need the literal
// rawPosts array entries: slug, title, excerpt, date, author, category, body[].
function loadStaticPosts() {
  const src = fs.readFileSync(
    path.resolve(process.cwd(), "src/content/posts.ts"),
    "utf8",
  );
  const start = src.indexOf("const rawPosts: Post[] = [");
  if (start === -1) return [];
  // Find the matching closing "];" for the array.
  let depth = 0;
  let i = src.indexOf("[", start);
  const arrStart = i;
  for (; i < src.length; i++) {
    const c = src[i];
    if (c === "[") depth++;
    else if (c === "]") {
      depth--;
      if (depth === 0) break;
    }
  }
  const arrText = src.slice(arrStart, i + 1);
  // Parse with a sandboxed Function — the array contents are pure data.
  // eslint-disable-next-line no-new-func
  const posts = new Function(`return ${arrText};`)();
  return posts;
}

function buildHeadReplacement({
  title,
  description,
  url,
  type = "website",
  jsonLd = [],
}) {
  const t = escapeHtml(title);
  const d = escapeHtml(description);
  const u = escapeHtml(url);
  const ldTags = jsonLd
    .map(
      (obj) =>
        `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`,
    )
    .join("\n    ");
  return { t, d, u, type, ldTags };
}

function patchHtml(template, { t, d, u, type, ldTags }) {
  let html = template;
  // <title>
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${t}</title>`);
  // meta description
  html = html.replace(
    /<meta\s+name=["']description["'][^>]*>/i,
    `<meta name="description" content="${d}" />`,
  );
  // canonical
  html = html.replace(
    /<link\s+rel=["']canonical["'][^>]*>/i,
    `<link rel="canonical" href="${u}" />`,
  );
  // hreflang x-default + en-IN
  html = html.replace(
    /<link\s+rel=["']alternate["']\s+hreflang=["']x-default["'][^>]*>/i,
    `<link rel="alternate" hreflang="x-default" href="${u}" />`,
  );
  html = html.replace(
    /<link\s+rel=["']alternate["']\s+hreflang=["']en-IN["'][^>]*>/i,
    `<link rel="alternate" hreflang="en-IN" href="${u}" />`,
  );
  // og:url, og:title, og:description, og:type
  html = html.replace(
    /<meta\s+property=["']og:url["'][^>]*>/i,
    `<meta property="og:url" content="${u}" />`,
  );
  html = html.replace(
    /<meta\s+property=["']og:title["'][^>]*>/i,
    `<meta property="og:title" content="${t}" />`,
  );
  html = html.replace(
    /<meta\s+property=["']og:description["'][^>]*>/i,
    `<meta property="og:description" content="${d}" />`,
  );
  html = html.replace(
    /<meta\s+property=["']og:type["'][^>]*>/i,
    `<meta property="og:type" content="${type}" />`,
  );
  // twitter
  html = html.replace(
    /<meta\s+name=["']twitter:title["'][^>]*>/i,
    `<meta name="twitter:title" content="${t}" />`,
  );
  html = html.replace(
    /<meta\s+name=["']twitter:description["'][^>]*>/i,
    `<meta name="twitter:description" content="${d}" />`,
  );
  // Inject route-specific JSON-LD just before </head>
  if (ldTags) {
    html = html.replace("</head>", `    ${ldTags}\n  </head>`);
  }
  return html;
}

function injectArticleBody(html, post, url) {
  const safeTitle = escapeHtml(post.title);
  const safeExcerpt = escapeHtml(post.excerpt);
  const safeAuthor = escapeHtml(post.author);
  const safeDate = escapeHtml(post.date);
  const safeCat = escapeHtml(post.category || post.tag || "JOURNAL");
  const paragraphs = (post.body || [])
    .map(
      (p) =>
        `<p>${escapeHtml(p).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</p>`,
    )
    .join("\n      ");
  const tldr =
    post.tldr && post.tldr.length
      ? `<aside><h2>TL;DR</h2><ul>${post.tldr
          .map((t) => `<li>${escapeHtml(t)}</li>`)
          .join("")}</ul></aside>`
      : "";
  const seoBlock = `
    <article id="prerender-content" data-prerender="1" style="position:absolute;left:-99999px;top:auto;width:1px;height:1px;overflow:hidden;">
      <header>
        <p>${safeCat}</p>
        <h1>${safeTitle}</h1>
        <p>${safeDate} · ${safeAuthor}</p>
        <p>${safeExcerpt}</p>
      </header>
      ${tldr}
      <div>
        ${paragraphs}
      </div>
      <p><a href="${escapeHtml(url)}">${escapeHtml(url)}</a></p>
    </article>`;
  // Insert inside the root container so it's part of initial HTML but
  // gets replaced when React hydrates the SPA shell.
  return html.replace(
    /<div id="root">([\s\S]*?)<\/div>/,
    `<div id="root">$1${seoBlock}</div>`,
  );
}

function injectGenericIntro(html, { title, description, url }) {
  const block = `
    <section id="prerender-content" data-prerender="1" style="position:absolute;left:-99999px;top:auto;width:1px;height:1px;overflow:hidden;">
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(description)}</p>
      <p><a href="${escapeHtml(url)}">${escapeHtml(url)}</a></p>
    </section>`;
  return html.replace(
    /<div id="root">([\s\S]*?)<\/div>/,
    `<div id="root">$1${block}</div>`,
  );
}

function writeRouteFile(outDir, routePath, html) {
  // For "/" we keep dist/index.html; for "/about" we write
  // dist/about/index.html so static hosting serves it before the SPA fallback.
  if (routePath === "/" || routePath === "") {
    fs.writeFileSync(path.join(outDir, "index.html"), html);
    return;
  }
  const clean = routePath.replace(/^\/+|\/+$/g, "");
  const dir = path.join(outDir, clean);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
}

function generateSitemap(outDir, posts) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [];
  for (const r of staticRoutes) {
    urls.push(
      `  <url><loc>${SITE}${r.path === "/" ? "/" : r.path}</loc><changefreq>${r.changefreq}</changefreq><priority>${r.priority}</priority><lastmod>${today}</lastmod></url>`,
    );
  }
  for (const p of posts) {
    urls.push(
      `  <url><loc>${SITE}/blog/${p.slug}</loc><changefreq>monthly</changefreq><priority>0.7</priority><lastmod>${today}</lastmod></url>`,
    );
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join(
    "\n",
  )}\n</urlset>\n`;
  fs.writeFileSync(path.join(outDir, "sitemap.xml"), xml);
}

export default function prerenderPlugin() {
  return {
    name: "ccd-prerender",
    apply: "build",
    closeBundle() {
      const outDir = path.resolve(process.cwd(), "dist");
      const indexPath = path.join(outDir, "index.html");
      if (!fs.existsSync(indexPath)) return;
      const template = fs.readFileSync(indexPath, "utf8");

      let posts = [];
      try {
        posts = loadStaticPosts();
      } catch (err) {
        console.warn("[ccd-prerender] failed to load posts:", err.message);
      }

      // Static routes
      for (const route of staticRoutes) {
        const url = `${SITE}${route.path === "/" ? "/" : route.path}`;
        const head = buildHeadReplacement({
          title: route.title,
          description: route.description,
          url,
          type: "website",
          jsonLd: [],
        });
        let html = patchHtml(template, head);
        html = injectGenericIntro(html, {
          title: route.title,
          description: route.description,
          url,
        });
        writeRouteFile(outDir, route.path, html);
      }

      // Blog posts
      for (const post of posts) {
        const url = `${SITE}/blog/${post.slug}`;
        const title = `${post.title} — Cats Can Dance`;
        const description = post.excerpt;
        const articleLd = {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          image: [`${SITE}/og-image.jpg`],
          datePublished: post.date,
          dateModified: post.date,
          inLanguage: "en-IN",
          author: { "@type": "Person", name: post.author },
          publisher: {
            "@type": "Organization",
            name: "Cats Can Dance",
            logo: {
              "@type": "ImageObject",
              url: `${SITE}/ccd-logo.png`,
            },
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": url,
          },
        };
        const head = buildHeadReplacement({
          title,
          description,
          url,
          type: "article",
          jsonLd: [articleLd],
        });
        let html = patchHtml(template, head);
        html = injectArticleBody(html, post, url);
        writeRouteFile(outDir, `/blog/${post.slug}`, html);
      }

      // /blog/index.html already covered by staticRoutes path "/blog"

      // Sitemap
      generateSitemap(outDir, posts);

      console.log(
        `[ccd-prerender] wrote ${staticRoutes.length} static routes + ${posts.length} blog posts + sitemap.xml`,
      );
    },
  };
}
