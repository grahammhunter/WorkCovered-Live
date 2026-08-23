# Work Covered Staging and Production Promotion Specification

## Objective

Use `workcovered.co.uk` as the private-in-practice review site for Work Covered changes while keeping `workcovered.com` stable. Once a staged release is approved, promote the exact reviewed Git commit to production rather than rebuilding or copying files by hand.

## Confirmed current state

- `workcovered.com` and `workcovered.co.uk` are separate Hostinger PHP/HTML websites with separate document roots.
- Both domains currently serve Work Covered, but `.co.uk` is an older deployed revision.
- The GitHub repository is `grahammhunter/WorkCovered-Live`; `main` is the production source branch.
- Hostinger's Git page currently has no repository or branch configured for either domain.
- `workcovered.com` must remain unchanged while staging is introduced.

## Branch and domain mapping

| Git branch | Hostinger site | Purpose |
| --- | --- | --- |
| `main` | `workcovered.com` | Approved production release |
| `staging` | `workcovered.co.uk` | Review and acceptance testing |
| `codex/*` | None directly | Isolated implementation work |

Changes are developed on a `codex/*` branch and merged into `staging`. Hostinger then deploys `staging` to `.co.uk`. Approval promotes the same commit from `staging` into `main`; it is not recreated or selectively copied.

## Initial staging cutover

1. Create `staging` from the current `origin/main` commit so the first staged release begins from the known production source.
2. Add hostname-aware environment controls to the shared site code so the same commit is safe on both domains:
   - `.co.uk` receives a `noindex, nofollow` response header while `.com` remains indexable;
   - both domains retain the canonical URL pointing to `https://workcovered.com/`;
   - `.co.uk` cannot perform live GHL submissions or other production-write integrations unless explicitly enabled for a controlled test.
3. Download a recoverable backup of the current `.co.uk` `public_html` contents before replacement.
4. Empty only the `.co.uk` deployment directory, as Hostinger requires an empty install path when first connecting a Git repository.
5. Connect `.co.uk` to the public GitHub repository over HTTPS, branch `staging`, with the install path left empty so it deploys to that site's `public_html`.
6. Perform the first deployment, inspect Hostinger's deployment output, then enable Hostinger Auto Deployment for the selected branch.
7. Configure the generated Hostinger webhook on GitHub for repository push events.
8. Prove the mapping using a shared release identifier derived from the deployed commit or asset version; do not add a staging-only source commit that would diverge from the production candidate.

No `.com` files, settings, repository connection, DNS records, or CDN settings are changed during this cutover.

## Routine change workflow

1. Create a `codex/*` branch from the current `staging` branch.
2. Implement and verify the change locally.
3. Merge the reviewed change into `staging`.
4. Confirm the new commit has deployed to `workcovered.co.uk` and clear the `.co.uk` CDN cache if versioned assets do not make the update immediately visible.
5. Review the staged site in Chrome at normal desktop widths, including all navigation and interactive demonstrations.
6. Record approval against the staged commit SHA.
7. Promote that commit by merging `staging` into `main` without adding release-only changes.
8. Deploy `main` to `.com` using the existing production release method until a separate production Git connection is deliberately approved.
9. Verify `.com`, including its asset version identifiers and critical interactions.

This deliberately introduces automated deployment only for staging. Production remains on the known release path until staging has proved reliable.

## Staging safety controls

- Keep the existing `.com` canonical URL on `.co.uk` pages.
- Emit `X-Robots-Tag: noindex, nofollow` only when the request host is `.co.uk`; do not use `robots.txt` to block crawling before search engines can read that directive.
- Gate enquiry forms and GHL actions by hostname so `.co.uk` remains in disabled, simulated, or explicitly labelled test mode. Staging must not create ordinary production contacts, bookings, messages, or automations.
- Use commit-based or dated query strings for changed CSS and JavaScript so CDN caching cannot mix releases.
- Never place Hostinger webhook URLs, FTP credentials, SSH keys, or GHL credentials in the repository.

## Promotion rule

The unit of approval is the staged Git commit SHA. A production release must contain that approved commit. If a production-only change is required, it is made as a separate reviewed commit and staging is rechecked before release.

## Rollback

- Before cutover, retain the downloaded `.co.uk` backup until Git deployment and rollback are both proven.
- To roll back staging, revert or reset the `staging` release through a new, auditable Git commit and redeploy; avoid editing individual server files.
- To roll back production, redeploy the last known-good `main` release using the existing production release method.
- A failed `.co.uk` deployment does not trigger any `.com` change.

## Later domain transition

When `.co.uk` is no longer needed for staging:

1. Confirm `.com` is serving the final approved release.
2. Disable the `.co.uk` deployment webhook.
3. Replace the staging site with a permanent `301` redirect from every `.co.uk` path to the corresponding `.com` path.
4. Verify the redirect and retain `.co.uk` ownership and TLS coverage.

## Acceptance criteria

1. `workcovered.com` remains byte-for-byte and operationally unchanged during staging setup.
2. `workcovered.co.uk` deploys the `staging` branch and visibly identifies the expected staged commit through an internal release marker or asset version.
3. A push merged into `staging` triggers only the `.co.uk` deployment.
4. `.co.uk` returns `noindex, nofollow` and retains the `.com` canonical URL.
5. Staging forms and integrations cannot write to production by default.
6. All page navigation, call-demo audio, call animation, transcript typing, chat scrolling, forms, and section alignment pass the staged browser walkthrough.
7. The `.co.uk` backup can be located and the rollback procedure is documented.
8. Production promotion names the staged commit SHA and verification confirms that release on `.com`.

## Deferred decisions

- Connecting `workcovered.com` directly to Hostinger Git and enabling production auto-deployment.
- Adding access control to `.co.uk`; the user has explicitly accepted an openly viewable staging site for this short review period.
- Redirecting `.co.uk` to `.com`; this occurs only after the redesign is approved and promoted.
