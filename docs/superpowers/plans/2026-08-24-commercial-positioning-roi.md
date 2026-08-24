# Work Covered Commercial Positioning and ROI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved editorial hero, honest illustrative counter and buyer-specific ROI narrative on the `.co.uk` staging branch.

**Architecture:** Keep the existing static HTML/CSS/JavaScript site and its interactive controller. Change the semantic page structure in `index.html`, add narrowly scoped layout rules in `assets/css/site.css`, and retain the existing counter IDs so `assets/js/site.js` continues to drive the illustration without a controller rewrite.

**Tech Stack:** Static HTML5, CSS, ES modules, Node.js built-in test runner, Git/Hostinger staging deployment.

**Spec:** `docs/superpowers/specs/2026-08-24-commercial-positioning-roi.md`

## Global Constraints

- Modify and push only `staging`; do not change `main` or deploy `workcovered.com`.
- Keep British English and the existing Work Covered palette and typography.
- Make websites the primary offer; AI remains an enabling capability.
- Do not invent proof, customer results, conversion uplifts or payback periods.
- Preserve every existing interaction and media asset.
- Keep the assessment form simulated until the GHL route is approved.

---

### Task 1: Define the revised commercial content contract

**Files:**
- Modify: `tests/static-site.test.mjs`

**Interfaces:**
- Consumes: `index.html` as a static document.
- Produces: failing assertions for the approved hero, honest counter labelling, early ROI section and service naming.

- [ ] **Step 1: Replace the obsolete hero-copy assertion and add the new content contract**

Add assertions for `Built to be chosen.`, `Wired to respond.`, `The website`, `The response`, `The follow-through`, `ILLUSTRATIVE ENQUIRY FLOW`, `WHEN YOU'RE BUSY, WORK KEEPS MOVING`, and `id="return"`. Assert that `TONIGHT'S RUN`, `RUNNING NOW` and `LIVE` are absent from the hero.

- [ ] **Step 2: Run the focused tests and verify the expected failure**

Run:

```bash
node --test --test-name-pattern="editorial hero|commercial return" tests/static-site.test.mjs
```

Expected: FAIL because the approved hero and return section are not yet in `index.html`.

### Task 2: Implement the editorial hero and illustrative counter

**Files:**
- Modify: `index.html`
- Modify: `assets/css/site.css`

**Interfaces:**
- Consumes: existing `#hero-web-count`, `#hero-voice-count` and `#hero-event` DOM hooks.
- Produces: `.wc-hero`, `.wc-hero-index` and `.wc-hero-activity` components while preserving those hooks.

- [ ] **Step 1: Replace only the current hero section markup**

Build a two-column editorial composition containing the approved headline, supporting copy, two existing internal CTAs and the numbered service index. Place a horizontal illustrative activity strip beneath it with the existing counter IDs.

- [ ] **Step 2: Add responsive component styles**

Add hero component rules to `assets/css/site.css` and stack the composition below `900px` without changing the current desktop-first design.

- [ ] **Step 3: Run the focused content tests**

Run:

```bash
node --test --test-name-pattern="editorial hero" tests/static-site.test.mjs
```

Expected: PASS.

### Task 3: Add the honest commercial-return bridge and align service names

**Files:**
- Modify: `index.html`
- Modify: `assets/css/site.css`

**Interfaces:**
- Consumes: the approved ROI narrative and existing `#layers` interaction.
- Produces: `#return` plus consistent website, response and follow-through labels leading into `#layers`.

- [ ] **Step 1: Add the return section before `#layers`**

Explain the three value levers—more suitable work, fewer missed opportunities and less repeated admin—followed by the buyer-specific arithmetic principle. Do not insert numeric results or guarantees.

- [ ] **Step 2: Align the three-layer labels**

Rename the visible layer labels and tabs to `THE WEBSITE`, `THE RESPONSE` and `THE FOLLOW-THROUGH`. Preserve tab indexes, images and controller hooks.

- [ ] **Step 3: Run the focused and complete suites**

Run:

```bash
node --test --test-name-pattern="commercial return" tests/static-site.test.mjs
node --test tests/*.test.mjs
```

Expected: both commands report zero failures.

### Task 4: Verify, publish to staging and stop at proof

**Files:**
- No additional source changes unless verification finds a defect.

**Interfaces:**
- Consumes: the tested staging commit.
- Produces: the same commit deployed to `workcovered.co.uk`, with `main` unchanged.

- [ ] **Step 1: Run repository verification**

```bash
git diff --check
node --test tests/*.test.mjs
git status --short
```

- [ ] **Step 2: Perform desktop browser QA**

Check the hero, return section, activity animation, layer tabs, navigation anchors and page width at a standard laptop viewport. Confirm the counter says it is illustrative and no activity is described as live.

- [ ] **Step 3: Commit and push only staging**

```bash
git add docs/superpowers/specs/2026-08-24-commercial-positioning-roi.md docs/superpowers/plans/2026-08-24-commercial-positioning-roi.md tests/static-site.test.mjs index.html assets/css/site.css
git commit -m "feat: strengthen commercial positioning on staging"
git push origin staging
```

- [ ] **Step 4: Verify staged deployment and production isolation**

Confirm `workcovered.co.uk` serves the new hero and retains `X-Robots-Tag: noindex, nofollow`. Confirm `origin/main` is still the pre-change SHA and `workcovered.com` does not contain the new hero headline.

- [ ] **Step 5: Stop for the proof decision**

Ask which real customer sites may be named, linked and visually previewed. Do not modify the proof section or advance to GHL integration without that input.

