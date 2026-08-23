# Work Covered Native Static Parity Specification

## Objective

Recreate the currently deployed `workcovered.com` Claude/Design Canvas export as a conventional static website for review at `workcovered.co.uk`, without changing its desktop design, copy, demonstrations, or intended interaction behaviour during the parity phase.

## Source of truth

- Visual and interaction baseline: `https://workcovered.com/`
- Source checkout: `/Users/datasmarts/Documents/30. Chat-GPT/WorkCovered-Live`
- Isolated implementation checkout: `/Users/datasmarts/Documents/30. Chat-GPT/Work Covered/Work-Covered-SaaS/Hostinger-Site`
- Baseline commit: `047c5654a6a37dcf59cbe41c9621f33b2924c85c`
- Candidate branch: `codex/native-static-conversion`
- Preview target: `https://workcovered.co.uk/`

## Required parity

The native version must preserve:

- The spruce, brass, cream, serif, sans-serif, and monospace visual system.
- Header, hero, three-layer section, enquiry journey, call theatre, audience selector, delivery, proof, assessment, and footer.
- The current wording and illustrative labels, even where later copy changes are planned.
- Layer selection, journey station selection, audience selection, animated hero activity, audio call sequence, stop/reset behaviour, form validation, and preview success/error states.
- The six customer MP3 files and seven AI-agent WAV files used by the call theatre.
- Reduced-motion support and desktop layout behaviour.

## Native architecture

- `index.html` contains semantic, browser-readable page markup.
- `assets/css/site.css` contains all presentation and responsive rules.
- `assets/js/site-data.js` contains pure data and state helpers.
- `assets/js/site.js` binds behaviour to semantic DOM controls.
- Static media remains local and is reorganised only after parity is verified.
- Node.js may be used for tests but is not required by Hostinger or site visitors.
- No React, ReactDOM, Babel, Design Canvas runtime, Claude service, AI subscription, or build step is required to serve the site.

## Explicitly deferred

- Copy and positioning revisions.
- ROI calculator and new ROI messaging.
- GHL form submission.
- Real legal, privacy, terms, and contact destinations.
- Replacement of illustrative claims and proof placeholders.
- Full mobile redesign; only accidental clipping introduced by the conversion must be avoided.
- Removal of potentially redundant assets before parity approval.

## Acceptance criteria

1. The site works when served by an ordinary static HTTP server.
2. No production file references `support.js`, `vendor/`, `x-dc`, `sc-if`, `sc-for`, or `data-dc`.
3. Every referenced local image and audio file exists.
4. The current desktop sections, copy, and interactions are present.
5. The call theatre plays the customer and AI-agent audio sequence and can be stopped.
6. Form validation continues to work without sending information externally.
7. Browser console inspection reports no errors during the parity walkthrough.
8. `workcovered.com` is not changed or redeployed during this phase.
9. Deployment to `workcovered.co.uk` happens only after local parity verification and a read-only check of the current `.co.uk` state.
