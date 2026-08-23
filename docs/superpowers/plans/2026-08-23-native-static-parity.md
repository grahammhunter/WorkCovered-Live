# Work Covered Native Static Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recreate the Claude/Design Canvas Work Covered prototype as a maintainable native static site and prepare it for comparison at `workcovered.co.uk` while leaving `workcovered.com` untouched.

**Architecture:** Semantic HTML and external CSS reproduce the current rendered interface. A small ES-module data layer supplies the existing journeys, sector copy, and audio sequence; a DOM controller implements the interactions without React or the Design Canvas runtime. Node's built-in test runner verifies pure behaviour and deployment invariants without introducing a production build dependency.

**Tech Stack:** HTML5, CSS3, browser ES modules, Web Audio/HTMLAudioElement, Node.js built-in test runner.

**Spec:** `docs/superpowers/specs/2026-08-23-native-static-parity.md`

## Global Constraints

- Preserve the current desktop design, wording, and interaction behaviour during parity conversion.
- Do not change or deploy `workcovered.com`.
- Do not add React, Babel, Tailwind, Node server requirements, or external AI services.
- Keep the assessment form local and simulated until the separate GHL integration phase.
- Retain all existing media until parity is approved.

---

### Task 1: Define native data and behaviour contracts

**Files:**
- Create: `tests/site-data.test.mjs`
- Create: `assets/js/site-data.mjs`

**Interfaces:**
- Produces: `HERO_EVENTS`, `JOURNEY_STATIONS`, `SECTORS`, `CALL_SCRIPT`, `nextHeroState(state)`, `validateAssessment(values)`, and `formatCallClock(seconds)`.
- Consumers: `assets/js/site.js` and automated tests.

- [ ] **Step 1: Write failing data-contract tests**

```js
import test from "node:test";
import assert from "node:assert/strict";
import {
  HERO_EVENTS,
  JOURNEY_STATIONS,
  SECTORS,
  CALL_SCRIPT,
  nextHeroState,
  validateAssessment,
  formatCallClock,
} from "../assets/js/site-data.mjs";

test("the parity data contains every current interactive sequence", () => {
  assert.equal(HERO_EVENTS.length, 7);
  assert.equal(JOURNEY_STATIONS.length, 5);
  assert.deepEqual(Object.keys(SECTORS), ["garages", "trades", "dental", "legal"]);
  assert.equal(CALL_SCRIPT.length, 13);
});

test("hero counts increment according to the next event medium", () => {
  assert.deepEqual(nextHeroState({ eventIndex: 0, web: 61, voice: 82 }), {
    eventIndex: 1,
    web: 62,
    voice: 82,
  });
});

test("assessment validation identifies missing required values", () => {
  const result = validateAssessment({
    name: "",
    businessName: "",
    phone: "",
    email: "invalid",
    enquiryType: "",
    consent: false,
  });
  assert.deepEqual(Object.keys(result.fields), ["name", "businessName", "phone", "email"]);
  assert.equal(result.enquiryType, true);
  assert.equal(result.consent, true);
  assert.equal(result.valid, false);
});

test("call clock uses mm:ss formatting", () => {
  assert.equal(formatCallClock(0), "00:00");
  assert.equal(formatCallClock(65), "01:05");
});
```

- [ ] **Step 2: Run the tests and verify the module-not-found failure**

Run: `node --test tests/site-data.test.mjs`

Expected: FAIL because `assets/js/site-data.mjs` does not exist.

- [ ] **Step 3: Implement the data module**

Create the exported constants with the exact existing copy and audio paths from `index.html`. Implement `nextHeroState` as a pure event-index/counter transition, `validateAssessment` as the current required-field and basic-email validation, and `formatCallClock` with zero-padded minutes and seconds.

- [ ] **Step 4: Run the tests and verify they pass**

Run: `node --test tests/site-data.test.mjs`

Expected: 4 passing tests, 0 failures.

### Task 2: Establish static deployment invariants

**Files:**
- Create: `tests/static-site.test.mjs`
- Modify: `index.html`
- Create: `assets/css/site.css`
- Create: `assets/js/site.js`

**Interfaces:**
- Consumes: exported data from `assets/js/site-data.mjs`.
- Produces: a static entry page using `assets/css/site.css` and `assets/js/site.js` only.

- [ ] **Step 1: Write failing static-site tests**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";

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
```

- [ ] **Step 2: Run the tests and verify they fail on current runtime references**

Run: `node --test tests/static-site.test.mjs`

Expected: FAIL because the current page references `support.js` and Design Canvas elements and native files do not exist.

- [ ] **Step 3: Create semantic native markup and stylesheet**

Move the current CSS into `assets/css/site.css`. Replace generated conditional and loop elements with semantic containers carrying stable IDs and `data-*` attributes. Preserve current content, accessible names, metadata, visual order, and asset paths. Add only the minimum responsive containment needed to prevent the conversion from introducing new clipping.

- [ ] **Step 4: Create the DOM controller entry point**

Add `assets/js/site.js` as an ES module importing `site-data.mjs`. Bind controls through event delegation and stable `data-action` values. Do not implement GHL submission or add network destinations.

- [ ] **Step 5: Run static and data tests**

Run: `node --test tests/*.test.mjs`

Expected: all tests pass.

### Task 3: Recreate interactive parity

**Files:**
- Modify: `assets/js/site.js`
- Modify: `assets/css/site.css`
- Modify: `index.html`
- Create: `tests/media-contract.test.mjs`

**Interfaces:**
- Consumes: `HERO_EVENTS`, `JOURNEY_STATIONS`, `SECTORS`, `CALL_SCRIPT`, and validation helpers.
- Produces: working layer, journey, sector, call-theatre, and assessment interactions.

- [ ] **Step 1: Write failing media and control-contract tests**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { CALL_SCRIPT } from "../assets/js/site-data.mjs";

test("every call-theatre audio asset exists", async () => {
  await Promise.all(CALL_SCRIPT.map((line) => access(new URL(`../${line.audio}`, import.meta.url))));
});

test("HTML exposes every native interaction control", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  for (const action of ["select-layer", "select-station", "select-sector", "start-call", "stop-call", "submit-assessment"]) {
    assert.match(html, new RegExp(`data-action=["']${action}["']`));
  }
});
```

- [ ] **Step 2: Run the contract tests and verify the control test fails**

Run: `node --test tests/media-contract.test.mjs`

Expected: FAIL until all semantic controls and audio paths are present.

- [ ] **Step 3: Implement layer, journey, and audience controls**

Use real `<button>` elements with `aria-selected`, IDs, and linked panels. Update content and visual state from the imported parity data. Support mouse and keyboard activation through native button behaviour.

- [ ] **Step 4: Implement the audio call theatre**

Play `CALL_SCRIPT` sequentially with one reusable `Audio` instance. Update transcript, status caption, clock, active speaker, and completion badges. On audio error, display/type the scripted transcript and advance after a bounded fallback duration. `stop-call` must pause audio, clear every timer, reset the clock, and return to idle.

- [ ] **Step 5: Implement local assessment behaviour**

Validate using `validateAssessment`, render the existing inline errors, and preserve the current simulated success/error preview. Ensure the form makes no fetch, navigation, or external submission.

- [ ] **Step 6: Run all tests**

Run: `node --test tests/*.test.mjs`

Expected: all tests pass.

### Task 4: Verify browser parity and prepare the preview deployment

**Files:**
- Modify only if verification exposes a parity defect: `index.html`, `assets/css/site.css`, `assets/js/site.js`, `assets/js/site-data.mjs`
- Remove after parity approval, not during this task: `support.js`, `vendor/`, unused waveform asset.

**Interfaces:**
- Produces: verified static candidate and deployment-ready branch.

- [ ] **Step 1: Start an ephemeral static server**

Run: `python3 -m http.server 4173 --bind 127.0.0.1`

Expected: server listens only during verification and is stopped afterward.

- [ ] **Step 2: Perform the desktop parity walkthrough**

At 1440x900, verify header navigation, hero, all three layers, all five journey stations, four audience sectors, complete call start/stop flow, form validation, success preview, error preview, footer, audio asset requests, and scroll-reveal content.

- [ ] **Step 3: Inspect browser diagnostics**

Check console errors/warnings and failed network requests after the full walkthrough.

Expected: 0 console errors and 0 failed local production assets.

- [ ] **Step 4: Run the full verification suite**

Run: `node --test tests/*.test.mjs && git diff --check && git status --short`

Expected: all tests pass, no whitespace errors, and only intended parity files are changed.

- [ ] **Step 5: Compare against the specification**

Read `docs/superpowers/specs/2026-08-23-native-static-parity.md` and explicitly verify each acceptance criterion. Do not claim parity if any criterion is unverified.

- [ ] **Step 6: Prepare but do not perform deployment without a verified target method**

Confirm how `workcovered.co.uk` receives files from Hostinger or GitHub. Preserve its current default page until the verified native candidate is ready. Deploy only the candidate branch/output, never the `workcovered.com` checkout.

