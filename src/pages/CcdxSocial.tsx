import { useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
// Import the static HTML as raw text. Vite resolves "/ccdxsocial/index.html"
// from the public/ folder via the leading-slash + ?raw query.
// eslint-disable-next-line import/no-unresolved
import rawHtml from "../../public/ccdxsocial/index.html?raw";

/**
 * Standalone partnership proposal page.
 * - noindex/nofollow (also disallowed in robots.txt)
 * - Renders the self-contained HTML doc inline so the route resolves under
 *   the SPA on both Vite dev and Lovable hosting.
 * - Hides the site's React Nav/Footer (this page is intentionally chrome-less).
 */
const CcdxSocial = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pull the <body> contents and the <style>/<link> tags from the raw HTML.
  // We skip <!doctype>, <html>, <head>, <body> wrappers to avoid nested docs.
  const { headExtras, bodyHtml } = (() => {
    const headMatch = rawHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
    const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const head = headMatch ? headMatch[1] : "";
    // Keep only style and font/google-fonts link tags from <head>
    const styleAndLinks = (head.match(/<style[\s\S]*?<\/style>|<link[^>]*rel=["']stylesheet["'][^>]*>/gi) || []).join("\n");
    return {
      headExtras: styleAndLinks,
      bodyHtml: bodyMatch ? bodyMatch[1] : rawHtml,
    };
  })();

  useEffect(() => {
    // Hide the global site nav/footer/floating widgets while this page is mounted.
    document.documentElement.classList.add("ccdxsocial-active");
    const style = document.createElement("style");
    style.id = "ccdxsocial-hide-chrome";
    style.textContent = `
      .ccdxsocial-active body > div#root > * > header,
      .ccdxsocial-active body > div#root > * > footer { display: none !important; }
    `;
    document.head.appendChild(style);

    // Inject style/link tags from the raw HTML (Google Fonts + page CSS).
    const injectedNodes: Element[] = [];
    if (headExtras) {
      const tmp = document.createElement("div");
      tmp.innerHTML = headExtras;
      Array.from(tmp.children).forEach((node) => {
        document.head.appendChild(node);
        injectedNodes.push(node);
      });
    }

    // Re-define the inline tab() function the HTML's onclick attrs depend on.
    (window as unknown as { tab: (id: string, el: HTMLElement) => void }).tab = (
      id,
      el,
    ) => {
      document.querySelectorAll(".doc").forEach((d) => d.classList.remove("on"));
      const target = document.getElementById("doc-" + id);
      if (target) target.classList.add("on");
      document.querySelectorAll("nav .tab").forEach((t) => t.classList.remove("on"));
      el.classList.add("on");
    };

    return () => {
      document.documentElement.classList.remove("ccdxsocial-active");
      style.remove();
      injectedNodes.forEach((n) => n.remove());
    };
  }, [headExtras]);

  return (
    <>
      <Helmet>
        <title>CatsCaNDance × Social — Partnership Proposal</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div ref={containerRef} dangerouslySetInnerHTML={{ __html: bodyHtml }} />
    </>
  );
};

export default CcdxSocial;
