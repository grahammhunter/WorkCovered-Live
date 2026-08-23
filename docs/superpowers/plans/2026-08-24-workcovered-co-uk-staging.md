# Work Covered .co.uk Staging Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect `workcovered.co.uk` to a safe, auto-deployed `staging` branch while leaving `workcovered.com` unchanged.

**Architecture:** A shared static-site commit serves both domains. Apache emits a no-index response header only for the `.co.uk` hostname, while the existing `.com` canonical remains in the HTML. GitHub `staging` deploys to the separate `.co.uk` Hostinger document root; `main` and `.com` are not modified.

**Tech Stack:** Static HTML/CSS/JavaScript, Apache `.htaccess`, Node.js built-in test runner, Git/GitHub, Hostinger hPanel Git deployment and webhook.

**Spec:** `docs/superpowers/specs/2026-08-24-workcovered-staging-promotion.md`

## Global Constraints

- Do not modify, redeploy, reconnect, purge, or change DNS for `workcovered.com`.
- Back up the current `.co.uk` `public_html` contents before emptying that directory.
- Keep Hostinger webhook URLs, SSH keys, account credentials, and future GHL credentials out of Git and command output.
- The same candidate commit must be reviewable on `.co.uk` and promotable to `main` without source edits.
- `.co.uk` must return `X-Robots-Tag: noindex, nofollow`; `.com` must not return that header.
- The current assessment form remains simulated and must not make an external request.
- Use only the `.co.uk` Hostinger site for the staging Git connection.

---

### Task 1: Add and test hostname-aware staging protection

**Files:**
- Modify: `.htaccess`
- Modify: `tests/static-site.test.mjs`

**Interfaces:**
- Consumes: Apache request header `Host`.
- Produces: `X-Robots-Tag: noindex, nofollow` for `workcovered.co.uk` and `www.workcovered.co.uk`; no such header for `.com`.

- [ ] **Step 1: Write the failing `.htaccess` contract tests**

Add this fixture near the existing `html` fixture:

```js
const htaccess = await readFile(new URL("../.htaccess", import.meta.url), "utf8");
```

Add this test:

```js
test("staging hostname receives a no-index response header without affecting production", () => {
  assert.match(htaccess, /SetEnvIfNoCase Host "\^\(www\\\.\)\?workcovered\\\.co\\\.uk\$" wc_staging/);
  assert.match(
    htaccess,
    /Header always set X-Robots-Tag "noindex, nofollow" env=wc_staging/,
  );
  assert.equal(/workcovered\\\.com/.test(htaccess), false);
});
```

- [ ] **Step 2: Run the focused test and confirm the expected failure**

Run:

```bash
node --test --test-name-pattern="staging hostname" tests/static-site.test.mjs
```

Expected: FAIL because `.htaccess` does not yet contain `SetEnvIfNoCase` or `X-Robots-Tag`.

- [ ] **Step 3: Add the minimal hostname-aware Apache rule**

Add above the existing rewrite block in `.htaccess`:

```apache
<IfModule mod_setenvif.c>
  SetEnvIfNoCase Host "^(www\.)?workcovered\.co\.uk$" wc_staging
</IfModule>

<IfModule mod_headers.c>
  Header always set X-Robots-Tag "noindex, nofollow" env=wc_staging
</IfModule>
```

- [ ] **Step 4: Run the focused test and then the complete suite**

Run:

```bash
node --test --test-name-pattern="staging hostname" tests/static-site.test.mjs
node --test tests/*.test.mjs
```

Expected: the focused test passes and the full suite reports zero failures.

- [ ] **Step 5: Commit the staging protection**

```bash
git add .htaccess tests/static-site.test.mjs
git commit -m "feat: protect co.uk staging from indexing"
```

### Task 2: Publish the tested candidate as the staging branch

**Files:**
- No additional source changes.

**Interfaces:**
- Consumes: the tested `codex/co-uk-staging-design` commit.
- Produces: `origin/staging` pointing at exactly that commit.

- [ ] **Step 1: Record immutable production and candidate identifiers**

Run:

```bash
git fetch origin --prune
git rev-parse origin/main
git rev-parse HEAD
curl -fsSL https://workcovered.com/ | shasum -a 256
curl -fsSI https://workcovered.com/ | sed -n '1,20p'
```

Expected: `origin/main` remains the production baseline; `HEAD` contains only the approved staging design and staging-protection commits. Retain the `.com` HTML hash and headers for Task 5.

- [ ] **Step 2: Verify the candidate is clean and fully tested**

Run:

```bash
git status --short
git diff --check origin/main...HEAD
node --test tests/*.test.mjs
```

Expected: clean status, no whitespace errors, and zero test failures.

- [ ] **Step 3: Push the implementation branch and create the remote staging branch**

Run:

```bash
git push -u origin codex/co-uk-staging-design
git push origin HEAD:refs/heads/staging
git ls-remote --heads origin staging
```

Expected: the remote `staging` SHA exactly equals `git rev-parse HEAD`; `origin/main` is unchanged.

### Task 3: Back up and empty only the .co.uk deployment directory

**Files:**
- Create outside Git: `/Users/datasmarts/Documents/30. Chat-GPT/Work Covered/Work-Covered-SaaS/backups/workcovered-co-uk-public-html-20260824.zip`

**Interfaces:**
- Consumes: current Hostinger `workcovered.co.uk/public_html` contents.
- Produces: a local ZIP with a non-zero size and SHA-256 checksum, plus an empty `.co.uk` `public_html` ready for Hostinger Git.

- [ ] **Step 1: Open only the `.co.uk` Hostinger File Manager**

In hPanel use `Websites` → `workcovered.co.uk` → `Dashboard` → `Files` → `File Manager`. Confirm the active site selector reads `workcovered.co.uk` before continuing.

- [ ] **Step 2: Create and download the backup archive**

Inside `.co.uk/public_html`, select all existing entries, create `workcovered-co-uk-public-html-20260824.zip`, and download it to:

```text
/Users/datasmarts/Documents/30. Chat-GPT/Work Covered/Work-Covered-SaaS/backups/workcovered-co-uk-public-html-20260824.zip
```

Move the archive out of `public_html` or delete only the server-side archive after the local download completes.

- [ ] **Step 3: Verify the downloaded backup before removing hosted files**

Run:

```bash
test -s '/Users/datasmarts/Documents/30. Chat-GPT/Work Covered/Work-Covered-SaaS/backups/workcovered-co-uk-public-html-20260824.zip'
unzip -t '/Users/datasmarts/Documents/30. Chat-GPT/Work Covered/Work-Covered-SaaS/backups/workcovered-co-uk-public-html-20260824.zip'
shasum -a 256 '/Users/datasmarts/Documents/30. Chat-GPT/Work Covered/Work-Covered-SaaS/backups/workcovered-co-uk-public-html-20260824.zip'
```

Expected: non-zero file size, `No errors detected`, and a recorded checksum.

- [ ] **Step 4: Empty only `.co.uk/public_html` using the File Manager trash**

Reconfirm the File Manager path belongs to `workcovered.co.uk`, select every entry inside `public_html`, and move them to Hostinger's trash. Do not delete `public_html`, any parent directory, or files belonging to another domain.

- [ ] **Step 5: Confirm the target directory is empty**

Refresh the `.co.uk/public_html` view and confirm it contains no file or directory. Stop if any target path is ambiguous.

### Task 4: Connect Hostinger .co.uk to the staging branch

**Files:**
- No local file changes.

**Interfaces:**
- Consumes: empty `.co.uk/public_html`, public repository `https://github.com/grahammhunter/WorkCovered-Live.git`, branch `staging`.
- Produces: a Hostinger Git deployment attached only to `workcovered.co.uk`, with auto-deployment enabled.

- [ ] **Step 1: Create the `.co.uk` Git repository mapping**

In `workcovered.co.uk` hPanel search for `GIT`, then enter exactly:

```text
Repository: https://github.com/grahammhunter/WorkCovered-Live.git
Branch: staging
Directory: [leave empty]
```

Click `Create` once. Confirm the resulting repository card names branch `staging` before deploying.

- [ ] **Step 2: Deploy and inspect Hostinger's output**

Click `Deploy`, wait for completion, and open the latest deployment output. Expected: clone/pull completes without an install-path or permission error and root `index.html` is deployed.

- [ ] **Step 3: Enable auto-deployment without exposing the webhook URL**

Click `Auto Deployment`, use its `Copy` control for the generated webhook URL, and do not paste that URL into chat, a repository file, or visible command output.

- [ ] **Step 4: Register the copied URL as a GitHub push webhook**

With GitHub CLI already authenticated, read the copied URL from the macOS clipboard into a temporary shell variable and create a push webhook while suppressing the response body:

```bash
hook_url_wc="$(pbpaste)"
test "${hook_url_wc#https://}" != "$hook_url_wc"
gh api --method POST repos/grahammhunter/WorkCovered-Live/hooks \
  -f name=web \
  -F active=true \
  -f "config[url]=$hook_url_wc" \
  -f 'config[content_type]=json' \
  -f 'events[]=push' \
  --jq '.id'
unset hook_url_wc
```

Expected: one numeric webhook ID. The webhook URL itself is never printed.

- [ ] **Step 5: Clear only the `.co.uk` CDN cache after the first deployment**

Use the `workcovered.co.uk` dashboard `Clear cache` action. Do not open or clear the `.com` CDN.

### Task 5: Verify isolation, staging safety, and live behaviour

**Files:**
- No source changes unless verification finds a defect; any defect returns to Task 1's test-first cycle.

**Interfaces:**
- Consumes: deployed `.co.uk` staging commit and the pre-change `.com` evidence from Task 2.
- Produces: evidence that staging is correct, auto-deployment works, and production did not change.

- [ ] **Step 1: Verify domain headers and canonical behaviour**

Run:

```bash
curl -fsSI https://workcovered.co.uk/ | sed -n '1,30p'
curl -fsSI https://workcovered.com/ | sed -n '1,30p'
curl -fsSL https://workcovered.co.uk/ | rg -n 'rel="canonical"|workcovered\.com|20260823-anchor-alignment|20260823-call-parity-2'
```

Expected: `.co.uk` returns `X-Robots-Tag: noindex, nofollow`; `.com` does not. `.co.uk` canonical points to `https://workcovered.com/` and its asset versions match the staged source.

- [ ] **Step 2: Verify deployed files and simulated integration safety**

Run:

```bash
for path in index.html assets/css/site.css assets/js/site.js assets/js/site-data.js media/voice-layer.webp uploads/1.mp3; do
  curl -fsS -o /dev/null "https://workcovered.co.uk/$path"
done
curl -fsSL https://workcovered.co.uk/assets/js/site.js | rg -n 'fetch\s*\(' && exit 1 || true
```

Expected: every representative file returns successfully and the deployed form script contains no `fetch()` call.

- [ ] **Step 3: Perform the staged browser walkthrough**

At `https://workcovered.co.uk/` verify:

1. Header navigation reaches each section without exposing the previous section.
2. Layer and journey controls change their active content.
3. Starting the call demo shows the dialled number, keeps the phone upright, types transcript text progressively, plays the customer MP3 and AI WAV sequence, uses the ripple animation, and stops all animation/audio when complete or manually stopped.
4. Web chat scrolls under the pointer without a visible scrollbar.
5. Assessment form validation appears locally and a valid demo submission shows only the simulated success state.

- [ ] **Step 4: Prove the auto-deploy mapping with a no-content staging commit**

Create and push an empty audit commit only on `staging`:

```bash
git switch staging
git pull --ff-only origin staging
git commit --allow-empty -m "chore: verify co.uk auto deployment"
git push origin staging
```

Confirm Hostinger records a new successful `.co.uk` deployment for that commit. Confirm `git rev-parse origin/main` still equals the production SHA captured in Task 2.

- [ ] **Step 5: Confirm `.com` remained unchanged**

Run the same `.com` HTML hash and header commands from Task 2. Expected: the HTML hash and identifying asset versions are unchanged, and `.com` still returns HTTP 200 without `X-Robots-Tag: noindex, nofollow`.

- [ ] **Step 6: Record rollback evidence**

Report the backup ZIP path and checksum, staging branch SHA, Hostinger deployment success, webhook ID, `.co.uk` live URL, and the unchanged `.com` production SHA. Retain the backup ZIP outside Git until the staging workflow has been used successfully for the redesign.
