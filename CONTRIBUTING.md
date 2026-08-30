# Contributing — ICAP site SDLC

Every change reaches production the same way: **local dev → preview → production**.
There are no exceptions, including for one-line content edits.

## Environments

| Stage | Where | Triggered by | URL |
| --- | --- | --- | --- |
| **Local dev** | Your machine | `npm run dev` | http://localhost:5199 |
| **Preview** | Vercel | Any push to a non-`main` branch, and every PR | Auto-generated per branch, posted by the Vercel bot on the PR |
| **Production** | Vercel | Merge into `main` | The production domain |

`main` is the production branch. Whatever is on `main` is live.

### Telling them apart

Every non-production build renders a badge in the bottom-left corner naming the
environment, the branch, and the short commit SHA — amber on Vercel previews,
blue on local dev. **Production shows nothing.**

This is a build-time switch, not a runtime check: `vite.config.ts` inlines
Vercel's `VERCEL_ENV` as `__DEPLOY_ENV__`, so a production build drops the
component through dead-code elimination and the markup never ships. If you are
looking at a page with no badge, you are looking at production.

## Provenance

The site was built by Tai and delivered through the public repo
`aiaiohhh/ICAPP`, which was copied here with its history intact. That repo stays
configured as the `upstream` remote for reference only — **never push to it**.

`origin` is `hanzlpaul-icap/icap` and is the only repo that matters from here on.
Commits authored by Tai keep his authorship, which is correct and should not be
rewritten.

## Working copy location

Clone and work in a path **outside OneDrive**, e.g. `C:\Users\lynwh\dev\ICAPP`.

OneDrive's sync engine locks files while Vite pre-bundles dependencies, which
kills the dev server with `Access is denied` writing to `node_modules/.vite/`,
and causes `EPERM` failures during `npm install`. This is not a Vite bug and
cannot be worked around from inside a synced folder.

## The loop

### 1. Branch

Never commit to `main` directly. Branch from an up-to-date `main`:

```sh
git checkout main
git pull
git checkout -b feat/course-explorer-filter
```

Branch naming: `feat/*` for features, `fix/*` for bugfixes, `chore/*` for
tooling and dependencies, `content/*` for copy and pricing changes.

### 2. Develop locally

```sh
npm install     # first time, or after a dependency change
npm run dev     # http://localhost:5199
```

Before pushing, run the same gate CI will run:

```sh
npm run build   # tsc -b && vite build
```

### 3. Push and open a PR

```sh
git push -u origin feat/course-explorer-filter
```

Then open a PR into `main`. Two things happen automatically:

- **GitHub Actions** runs type-check and build (`.github/workflows/ci.yml`)
- **Vercel** builds a preview deployment and comments the URL on the PR

### 4. Review on the preview

Check the **Vercel preview URL**, not just your local dev server. Local dev and
a production build differ in ways that matter here — asset hashing, video
delivery, and the minified build of the scroll-scrubbed hero.

A PR merges only when CI is green and the preview has been looked at.

### 5. Merge

**Squash and merge** into `main`. Delete the branch afterwards.

Merging to `main` triggers the production deployment. Nothing else does.

## Rules

1. **No direct pushes to `main`.** Enforced by branch protection (see below).
2. **No merge without a green CI run.**
3. **No merge without someone opening the preview URL.**
4. **Secrets never go in the repo.** Add them as Vercel Environment Variables,
   scoped to Preview and Production separately.
5. **Rolling back is a Vercel action, not a git action.** Use *Instant Rollback*
   in the Vercel dashboard to revert production immediately, then fix forward
   with a normal PR. Do not force-push `main`.

## One-time setup

### Vercel

1. Vercel → **Add New → Project** → import `hanzlpaul-icap/icap`
2. Framework preset: **Vite** (or leave it — `vercel.json` pins it)
3. Production Branch: **`main`**
4. Deploy

Preview deployments for every other branch and PR are on by default.

### GitHub branch protection

Settings → Branches → Add rule for `main`:

- Require a pull request before merging
- Require status checks to pass → select **Type-check and build**
- Require branches to be up to date before merging
- Do not allow bypassing the above settings

Without this rule, rule 1 is a convention rather than a guarantee.
