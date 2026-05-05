import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";

/**
 * Standalone partnership proposal page (rendered at /ccdxsocial).
 * - noindex/nofollow (also disallowed in robots.txt, omitted from sitemap).
 * - Loads the self-contained HTML doc from /ccdxsocial/index.html (in /public)
 *   and inlines its <style> + <body> so the route resolves under the SPA.
 * - Hides the site's React Nav/Footer (this page is intentionally chrome-less).
 */
const CcdxSocial = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [bodyHtml, setBodyHtml] = useState<string>("");
  const [headExtras, setHeadExtras] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/ccdxsocial/index.html")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((raw) => {
        if (cancelled) return;
        const headMatch = raw.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
        const bodyMatch = raw.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        const head = headMatch ? headMatch[1] : "";
        const styleAndLinks = (
          head.match(
            /<style[\s\S]*?<\/style>|<link[^>]*rel=["']stylesheet["'][^>]*>/gi,
          ) || []
        ).join("\n");
        setHeadExtras(styleAndLinks);
        setBodyHtml(bodyMatch ? bodyMatch[1] : raw);
      })
      .catch((e) => !cancelled && setError(String(e)));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!bodyHtml) return;

    // Hide the global site nav/footer/floating widgets while this page is mounted.
    document.documentElement.classList.add("ccdxsocial-active");
    const hideStyle = document.createElement("style");
    hideStyle.id = "ccdxsocial-hide-chrome";
    hideStyle.textContent = `
      html.ccdxsocial-active body > div#root > header,
      html.ccdxsocial-active body > div#root > footer,
      html.ccdxsocial-active body > header,
      html.ccdxsocial-active body > footer { display: none !important; }
    `;
    document.head.appendChild(hideStyle);

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
      hideStyle.remove();
      injectedNodes.forEach((n) => n.remove());
    };
  }, [bodyHtml, headExtras]);

  return (
    <>
      <Helmet>
        <title>CatsCaNDance × Social — Partnership Proposal</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      {error && (
        <div style={{ padding: 40, fontFamily: "sans-serif" }}>
          Failed to load page: {error}
        </div>
      )}
      <div ref={containerRef} dangerouslySetInnerHTML={{ __html: bodyHtml }} />
    </>
  );
};

export default CcdxSocial;
