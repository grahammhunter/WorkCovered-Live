import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("production HTML has no Design Canvas or React runtime", () => {
  for (const forbidden of ["support.js", "vendor/", "<x-dc", "<sc-if", "<sc-for", "data-dc-"]) {
    assert.equal(html.includes(forbidden), false, `found ${forbidden}`);
  }
});

test("all required native sections are present", () => {
  for (const id of ["top", "layers", "journey", "demos", "delivery", "assessment"]) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  assert.match(html, /assets\/css\/site\.css/);
  assert.match(html, /assets\/js\/site\.js/);
});

test("production stylesheet is versioned for CDN-safe brand updates", () => {
  assert.match(html, /assets\/css\/site\.css\?v=20260823-call-parity/);
});

test("native production files exist", async () => {
  await Promise.all([
    access(new URL("../assets/css/site.css", import.meta.url)),
    access(new URL("../assets/js/site.js", import.meta.url)),
  ]);
});

test("approved Work Covered wordmark is used in the header and footer", async () => {
  await access(new URL("../assets/brand/work-covered-logo-dark.svg", import.meta.url));
  const wordmarks = [...html.matchAll(/<img\b[^>]*src=["']assets\/brand\/work-covered-logo-dark\.svg["'][^>]*>/gi)];
  assert.equal(wordmarks.length, 2);
  for (const [markup] of wordmarks) {
    assert.match(markup, /alt=["']Work Covered["']/i);
  }
});

test("page retains core parity copy", () => {
  for (const copy of [
    "Enquiries go in.",
    "Finished work comes out.",
    "One partner, three layers",
    "Follow one enquiry, from first ring to won work.",
    "Don't take our word for it. Press the buttons.",
    "Built for businesses that live and die by the enquiry.",
    "No borrowed logos. No invented quotes.",
    "Find out what's slipping through",
  ]) {
    assert.equal(html.includes(copy), true, `missing parity copy: ${copy}`);
  }
});

test("page has no external script source", () => {
  const scripts = [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi)].map((match) => match[1]);
  assert.deepEqual(scripts, ["assets/js/site.js?v=20260823-call-parity-2"]);
});

test("browser modules use Hostinger-compatible JavaScript extensions", async () => {
  const siteJs = await readFile(new URL("../assets/js/site.js", import.meta.url), "utf8");
  assert.equal(siteJs.includes(".mjs"), false);
  assert.match(siteJs, /from "\.\/site-data\.js\?v=20260823-call-parity-2"/);
  await access(new URL("../assets/js/site-data.js", import.meta.url));
});

test("native CSS preserves the prototype content-box geometry", async () => {
  const css = await readFile(new URL("../assets/css/site.css", import.meta.url), "utf8");
  assert.equal(css.includes("*,*::before,*::after{box-sizing:border-box}"), false);
});
