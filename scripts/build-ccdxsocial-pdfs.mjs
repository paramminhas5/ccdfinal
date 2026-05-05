// One-off: generate the two PDFs for /ccdxsocial from the static HTML.
// Run: node scripts/build-ccdxsocial-pdfs.mjs
import puppeteer from "puppeteer-core";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.resolve(__dirname, "../public/ccdxsocial/index.html");
const outDir = path.resolve(__dirname, "../public/ccdxsocial");

const targets = [
  { id: "doc-op", file: "ccd-social-one-pager.pdf" },
  { id: "doc-ops", file: "ccd-social-operations.pdf" },
];

const browser = await puppeteer.launch({
  executablePath: "/bin/chromium",
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--font-render-hinting=none"],
});

for (const t of targets) {
  const page = await browser.newPage();
  await page.goto("file://" + htmlPath, { waitUntil: "networkidle0" });
  // Wait for Google Fonts
  await page.evaluate(() => document.fonts.ready);
  // Show only target doc, hide nav + any [data-noprint] (e.g. in-body download buttons)
  await page.evaluate((id) => {
    document.querySelectorAll("[data-noprint]").forEach((n) => (n.style.display = "none"));
    document.querySelectorAll(".doc").forEach((d) => {
      d.classList.remove("on");
      d.style.display = d.id === id ? "block" : "none";
    });
  }, t.id);
  await page.pdf({
    path: path.join(outDir, t.file),
    format: "A4",
    printBackground: true,
    margin: { top: "12mm", bottom: "12mm", left: "10mm", right: "10mm" },
  });
  await page.close();
  console.log("wrote", t.file);
}
await browser.close();
