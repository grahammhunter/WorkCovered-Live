import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const htaccess = await readFile(new URL("../.htaccess", import.meta.url), "utf8");

test("staging hostname receives a no-index response header without affecting production", () => {
  assert.match(htaccess, /SetEnvIfNoCase Host "\^\(www\\\.\)\?workcovered\\\.co\\\.uk\$" wc_staging/);
  assert.match(
    htaccess,
    /Header always set X-Robots-Tag "noindex, nofollow" env=wc_staging/,
  );
  assert.equal(/workcovered\\\.com/.test(htaccess), false);
});

test("production HTML has no Design Canvas or React runtime", () => {
  for (const forbidden of ["support.js", "vendor/", "<x-dc", "<sc-if", "<sc-for", "data-dc-"]) {
    assert.equal(html.includes(forbidden), false, `found ${forbidden}`);
  }
});

test("all required native sections are present", () => {
  for (const id of ["top", "return", "layers", "journey", "demos", "delivery", "assessment"]) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  assert.match(html, /assets\/css\/site\.css/);
  assert.match(html, /assets\/js\/site\.js/);
});

test("production stylesheet is versioned for CDN-safe brand updates", () => {
  assert.match(html, /assets\/css\/site\.css\?v=20260824-demo-showcase/);
});

test("anchored sections meet the fixed header without exposing the previous section", async () => {
  const css = await readFile(new URL("../assets/css/site.css", import.meta.url), "utf8");
  assert.match(css, /\[id\]\{scroll-margin-top:4\.75rem\}/);
});

test("every content section uses the same compact title spacing", () => {
  for (const label of [
    "Three layers",
    "Journey",
    "Demos",
    "Who we cover",
    "Delivery",
    "Demonstrations",
    "Assessment form",
  ]) {
    const openingTag = html.match(new RegExp(`<section[^>]*data-screen-label=["']${label}["'][^>]*>`))?.[0];
    assert.ok(openingTag, `missing section: ${label}`);
    assert.match(openingTag, /padding: clamp\(2\.2rem, 4vw, 3\.2rem\)/, `inconsistent title spacing: ${label}`);
  }
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

test("page presents the approved editorial hero without live-data claims", () => {
  const hero = html.match(/<section[^>]*id=["']top["'][^>]*>[\s\S]*?<\/section>/)?.[0];
  assert.ok(hero, "missing hero section");

  for (const copy of [
    "Built to be chosen.",
    "Wired to respond.",
    "The website",
    "The response",
    "The follow-through",
    "ILLUSTRATIVE ENQUIRY FLOW",
    "WHEN YOU'RE BUSY, WORK KEEPS MOVING",
  ]) {
    assert.equal(hero.includes(copy), true, `missing hero copy: ${copy}`);
  }

  for (const id of ["hero-web-count", "hero-voice-count", "hero-event"]) {
    assert.match(hero, new RegExp(`id=["']${id}["']`));
  }

  for (const misleading of ["RUNNING NOW", "TONIGHT'S RUN", "— LIVE"]) {
    assert.equal(hero.includes(misleading), false, `misleading illustrative activity: ${misleading}`);
  }
});

test("page explains the commercial return without unsupported performance claims", () => {
  const commercialReturn = html.match(/<section[^>]*id=["']return["'][^>]*>[\s\S]*?<\/section>/)?.[0];
  assert.ok(commercialReturn, "missing commercial return section");

  for (const copy of [
    "More suitable enquiries",
    "Fewer missed opportunities",
    "Less repeated admin",
    "your figures",
    "If the arithmetic does not make sense, we will say so.",
  ]) {
    assert.equal(commercialReturn.includes(copy), true, `missing return principle: ${copy}`);
  }

  assert.equal(/guaranteed|\d+%|payback in \d+/i.test(commercialReturn), false);
});

test("the service interaction continues the hero naming system", () => {
  const layers = html.match(/<section[^>]*id=["']layers["'][^>]*>[\s\S]*?<\/section>/)?.[0];
  assert.ok(layers, "missing service layers section");

  for (const label of ["THE WEBSITE", "THE RESPONSE", "THE FOLLOW-THROUGH"]) {
    assert.equal(layers.includes(label), true, `missing service label: ${label}`);
  }
});

test("the demonstration showcase links only the two ready sites", () => {
  const showcase = html.match(/<section[^>]*data-screen-label=["']Demonstrations["'][^>]*>[\s\S]*?<\/section>/)?.[0];
  assert.ok(showcase, "missing demonstration showcase");
  assert.match(showcase, /These are demonstration builds, not client case studies\./);

  const liveCards = [...showcase.matchAll(/<a\b[^>]*class=["'][^"']*wc-demo-card[^"']*is-live[^"']*["'][^>]*>/gi)].map(
    ([markup]) => markup,
  );
  assert.equal(liveCards.length, 2);
  assert.match(liveCards[0], /href=["']https:\/\/northstar\.workcovered\.com["']/);
  assert.match(liveCards[1], /href=["']https:\/\/riverside\.workcovered\.com["']/);
  for (const card of liveCards) {
    assert.match(card, /target=["']_blank["']/);
    assert.match(card, /rel=["']noopener noreferrer["']/);
  }
});

test("the three planned demonstrations are visible but not clickable", () => {
  const showcase = html.match(/<section[^>]*data-screen-label=["']Demonstrations["'][^>]*>[\s\S]*?<\/section>/)?.[0];
  assert.ok(showcase, "missing demonstration showcase");

  const plannedCards = [...showcase.matchAll(/<article\b[^>]*class=["'][^"']*wc-demo-card[^"']*is-upcoming[^"']*["'][^>]*>/gi)];
  assert.equal(plannedCards.length, 3);
  for (const label of ["Dentist", "Plumbing trade", "Animal hospital &amp; vet"]) {
    assert.equal(showcase.includes(label), true, `missing planned demonstration: ${label}`);
  }
  assert.equal(/<a\b[^>]*is-upcoming/i.test(showcase), false);
});

test("page retains the remaining approved core copy", () => {
  for (const copy of [
    "One partner, three layers",
    "Follow one enquiry, from first ring to won work.",
    "Don't take our word for it. Press the buttons.",
    "Built for businesses that live and die by the enquiry.",
    "Different businesses. Built with the same care.",
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
