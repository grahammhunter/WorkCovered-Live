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

test("native production files exist", async () => {
  await Promise.all([
    access(new URL("../assets/css/site.css", import.meta.url)),
    access(new URL("../assets/js/site.js", import.meta.url)),
  ]);
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
  assert.deepEqual(scripts, ["assets/js/site.js"]);
});

test("native CSS preserves the prototype content-box geometry", async () => {
  const css = await readFile(new URL("../assets/css/site.css", import.meta.url), "utf8");
  assert.equal(css.includes("*,*::before,*::after{box-sizing:border-box}"), false);
});
