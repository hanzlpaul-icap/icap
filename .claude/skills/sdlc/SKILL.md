---
name: sdlc
description: Ship a change to the ICAP site through local dev → preview → production. Use whenever a change to this repo is going to be committed, pushed, deployed, released, rolled back, or merged — and before touching main. Triggers include "deploy", "push this", "ship it", "release", "merge", "open a PR", "roll back", "make it live", "put it on prod", or any edit that the user expects to reach the live site.
---

# ICAP site SDLC

Every change reaches production one way: **local dev → preview → production**.
No exceptions, including one-line content edits. `CONTRIBUTING.md` is the
human-facing version of this; this file is the operational procedure.

## Hard rules

1. **Never commit or push to `main`.** Changes reach `main` only by merging a PR.
2. **Never merge a PR with red or missing CI.**
3. **Never call a change verified because local dev looked right.** Verification
   happens on the Vercel preview URL.
4. **Never force-push `main`** and never rewrite published history. Roll back in
   Vercel, then fix forward.
5. **Never commit secrets.** They belong in Vercel Environment Variables,
   scoped separately to Preview and Production.
6. **Work outside OneDrive.** The working copy is `C:\Users\lynwh\dev\ICAPP`.
   Running Vite from a synced OneDrive folder fails with `Access is denied`
   writing `node_modules/.vite/` — see "Environment gotchas".

## Procedure

### 1. Confirm a clean starting point

```sh
cd C:/Users/lynwh/dev/ICAPP
git status --short          # must be clean
git checkout main && git pull
```

If the working tree is dirty, stop and ask what to do with the changes.

### 2. Branch

```sh
git checkout -b feat/<short-slug>
```

Prefix by intent: `feat/`, `fix/`, `chore/`, `content/`.

### 3. Develop

```sh
npm install                              # only after a dependency change
npm run dev -- --port 5199 --strictPort  # http://localhost:5199
```

Node is at `C:\Program Files\nodejs`. If `npm` is not found, prepend it to PATH
for the session rather than relying on inherited PATH.

### 4. Run the gate CI will run

```sh
npm run build     # tsc -b && vite build
```

If this fails, it fails in CI too. Fix it before pushing.

### 5. Push and open the PR

```sh
git push -u origin feat/<short-slug>
```

Pushing is **outward-facing** — confirm with the user before the first push to
a public repo, and again before merging.

Opening the PR triggers two independent checks:

- **GitHub Actions** — `Type-check and build` (`.github/workflows/ci.yml`)
- **Vercel** — builds a preview and comments the URL on the PR

### 6. Verify on the preview

Open the Vercel preview URL. A production build differs from local dev in ways
that matter in this repo specifically:

- the scroll-scrubbed hero video (`src/hero/`) is served and seeked differently
  once assets are hashed and minified
- reduced-motion and mobile fallbacks take different code paths
- `#catalogue/<slug>` deep links depend on the SPA rewrite in `vercel.json`

Check desktop, mobile width, and reduced-motion.

### 7. Merge

**Squash and merge** into `main`, then delete the branch. That merge is what
deploys production. Report the production URL, not the preview URL.

## Rollback

Production rollback is a Vercel action, never a git action:

Vercel → Deployments → pick the last good one → **Instant Rollback**.

Then fix forward through a normal PR. Do not revert by force-pushing `main`.

## Environment gotchas

- **OneDrive breaks Vite.** Working from `OneDrive\Desktop\ICAP\...` kills the
  dev server (`Access is denied` on `node_modules/.vite/deps_temp_*`) and causes
  `EPERM` during `npm install`. The working copy lives outside OneDrive.
- **This machine is ARM64.** esbuild resolves `@esbuild/win32-arm64`. Relevant
  if a native dependency ever misbehaves; CI runs x64 Linux.
- **HMR does not work in the in-app browser pane.** Its WebSocket is blocked, so
  edits need a manual refresh there. HMR works normally in real Chrome.
- **`gh` and `vercel` CLIs are not installed.** PR creation, merging, and Vercel
  settings are done through the web UI unless the user installs them.

## Repository facts

- Remote: `https://github.com/aiaiohhh/ICAPP`
- Production branch: `main`
- Stack: Vite 6 + React 18 + TypeScript, no runtime deps beyond React
- Content and pricing live in `src/content/courses.json`, sourced from
  `ICAP_Landing_Page_with_Logo.docx`
- `site-build` is a stale branch left over from the initial build

## Still open before launch

Carried from `README.md` — flag these if a launch or production deploy is discussed:

- `ENQUIRY_EMAIL` in `src/sections/Contact.tsx` is still a placeholder
- The free assessment checklist PDF has not been supplied
- Template-store checkout links are not wired
- Items flagged "coming soon" in `courses.json` are not yet built
