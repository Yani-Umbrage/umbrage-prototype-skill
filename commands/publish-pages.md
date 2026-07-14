---
name: publish-pages
description: Build the prototype into a static bundle and open a PR adding it as a new project on Umbrage Pages. Use when someone wants to ship a prototype for real review and sharing, not just describe one. Publishes via the standard git/PR flow, not the preview MCP tool.
allowed-tools:
  - Bash
  - Read
  - Glob
---

# /publish-pages

Build the prototype and open a pull request adding it as a new project folder on Umbrage Pages
(`pages.umbrage.com`). The PR goes through the repo's normal review process before it's live.

## Why git, not the preview API

There's a separate `publish_preview` MCP tool that publishes straight to a hashed
`preview.pages.umbrage.com/p/<hash>/` link. It is NOT the right tool for this. Umbrage Pages
leadership confirmed that tool is meant for one-off static content (reports, recaps), not full apps,
and that a real React prototype should go through the standard git flow instead: build it, open a PR,
same as any other change to the repo.

This also happens to be the only path that actually works for a real build. The preview tool needs
the entire bundle sent as tool-call arguments, and a production React bundle's minified JS is one
line larger than what the model can even read in, let alone re-emit in a single call. Git has no such
ceiling: copying files and committing them never requires the model to hold the file content as an
argument. Use this command for real prototypes; don't reach for `publish_preview` here.

**Confirmed against the live tool (2026-07-10):** `publish_preview` only accepts inline UTF-8 text
file content (no image/font upload, no binary), and the resulting link is genuinely SSO-gated behind
Entra ID, matching the claim above. A small, hand-authored static page (a few restyled primitives -
badge colors, a button, a sidebar item - using inline CSS, no bundler output, no image or custom
font files) publishes fine and can be a fast internal sanity-check of a client's brand colors before
committing to a full screen build. It's a disconnected hashed link outside the versioned
`pages.umbrage.com/<project-name>/` structure, with no client-side routing persistence guarantees and
no asset hosting - so it's still not a substitute for a real screen build. But it no longer has to be
throwaway: if the page is worth keeping, **Promote it** (see below) instead of deleting it. Only
delete (`delete_preview`) if it was genuinely a disposable gut-check.

### Fast path for small prototypes: `publish_preview` -> Promote

As of 2026-07-10, the portal's **Previews** tab at `pages.umbrage.com` has a **Promote** action that
turns a `publish_preview` hash into a real, reviewed page - confirmed merged to `main` and deployed
(`Umbrage-Studios/umbrage-client-pages` PRs #69, #73, #76; every subsequent merge to `main`,
including today's, deploys clean). Promote isn't a review bypass: it opens the *same* credited PR
through `submitProject` that the manual steps below produce, either as a **new**
`<name>.pages.umbrage.com` project or by **overwriting** an existing one. Any signed-in user can
promote a hash they hold; the PR still needs the normal review/approval.

Use this instead of cloning the repo and opening a PR by hand when **both** are true:

- the prototype is small enough to fit `publish_preview`'s inline-UTF-8-text constraint - no images,
  fonts, or other binary assets, and small enough for the model to hold the whole file content as a
  tool-call argument. This means a genuinely small hand-authored page, not a real Vite/nx production
  bundle.
- the person publishing has portal sign-in (Promote is portal-side, not an MCP tool).

Steps: `publish_preview` the file(s) -> open **Previews** at `pages.umbrage.com` -> **Promote** ->
choose **New page** (kebab-case project name, must be free) or **Overwrite existing** (must already
be a published page) -> this opens the same reviewed PR `/publish-pages` would. Return that PR link
the same way Step 7 below does.

For anything with binary assets or a real production bundle, `publish_preview` can't carry the files
at all (SSO-gated inline-text tool, not a file upload) - use the git/PR flow below instead.

## Structure the Umbrage Pages repo expects

**Repo:** [`Umbrage-Studios/umbrage-client-pages`](https://github.com/Umbrage-Studios/umbrage-client-pages)
(confirmed 2026-07-10, this account now has org access - if you hit a 404 or permission error, the
invite may not be accepted yet on the account in use, not a wrong repo name).

- A new folder per project: `projects/<project-name>/` (kebab-case). The name must match
  `^[a-z0-9][a-z0-9-]*$` - lowercase letters, digits, hyphens, and it can't start with `_` (that
  prefix is reserved for the platform's shared/preview assets).
- The build's `index.html` must land at the **root of that folder**, not nested under a `dist/`
  subfolder.
- **The URL is a subdomain, not a sub-path:** `https://<project-name>.pages.umbrage.com/`. The
  older `https://pages.umbrage.com/<project-name>/` form still resolves but 302-redirects to the
  subdomain - treat the subdomain as canonical, don't tell a client the path-style URL is the real
  one.
- **Access is automatic, nothing to configure in git.** Every page is private by default behind a
  shared team password, entirely portal-managed (DynamoDB + CloudFront KV store, no
  `config/passwords.json` in the repo). A reviewer can give a project its own password in the
  portal after it's live; making a page public needs executive approval there. Don't try to wire up
  password handling as part of this command, there's nothing to do here.
- **Authoring constraints:** use relative links only (`./page.html`, `./img/logo.png`), never
  root-absolute, except the reserved `/_shared/...` prefix for the platform's shared logo assets.
  The CSP is content-friendly (inline `<script>`/`<style>`, `eval`, `https:` CDN scripts/styles,
  web fonts, `data:`/`blob:` assets, and `<iframe>` embeds are all allowed), so a standard Vite
  build's inline/hashed asset references work without special-casing.
- A `CLAUDE.md` inside `projects/<project-name>/` describing the prototype, and restating that it
  builds to the root of this folder.
- The repo's own root-level `CLAUDE.md` already states this convention for every project.

## Steps

1. **Ask for the project name** (kebab-case, becomes the folder name, e.g. `fuelight-poc`).

2. **Build the prototype.**
   - poc-template: `npm run build`, outputs to `dist/` with `index.html` already at that folder's
     root, no restructuring needed.
   - nestjs-react-starter: `yarn nx build frontend-react`, outputs to
     `dist/apps/frontend-react/`. That directory's *contents* become the project folder's root, not
     the outer `dist/`.
   - Both need **relative base** (`base: './'`) and **HashRouter**, since the app is served at a
     sub-path with no server-side rewrites. Prototypes scaffolded by `/new-prototype` already have
     both; check `apps/frontend-react/vite.config.ts` and the router in `main.tsx`/`app.tsx` if not.
   - Binary assets (fonts, images) are fine as-is now. Git has no text-only constraint, so there's no
     need to base64-inline the Cera Pro fonts or avoid `.ttf`/`.png` files. Ship them normally.
   - Confirm `styles.css` is imported in `main.tsx` (a stock nestjs-react-starter clone doesn't import
     it by default, and without it the build renders completely unstyled).

3. **Clone or update a local working copy of the Umbrage Pages repo.**

   ```bash
   git clone https://github.com/Umbrage-Studios/umbrage-client-pages.git umbrage-pages
   cd umbrage-pages
   git checkout -b poc/<project-name>
   ```

   If this fails with a 404 or permission error, the account running this doesn't have
   `Umbrage-Studios` org access yet (check for a pending invite at
   `gh api user/memberships/orgs` and accept it - see `gh api -X PATCH user/memberships/orgs/Umbrage-Studios -f state=active`).
   Confirm before accepting an org invite on someone's behalf; it's a bigger, harder-to-fully-reverse
   action than it looks, since it can change what's visible across every repo in the org, not just
   this one.

4. **Create the project folder and copy the build output in**, so `index.html` ends up at
   `projects/<project-name>/index.html`:

   ```bash
   mkdir -p projects/<project-name>
   cp -r <build-output-dir>/* projects/<project-name>/
   ```

5. **Write `projects/<project-name>/CLAUDE.md`**: what this prototype is, which client/engagement it
   is for, that it was scaffolded with `/new-prototype`, and a line restating that it builds to the
   root of this folder (so a future rebuild doesn't accidentally nest it under `dist/`).

6. **Commit, push, open the PR:**

   ```bash
   git add projects/<project-name>
   git commit -m "Add <project-name> prototype"
   git push -u origin poc/<project-name>
   gh pr create --title "Add <project-name> prototype" --body "..."
   ```

   Base branch, PR template, and required reviewers are repo conventions to confirm before running
   this for real, don't assume `main` or leave reviewers unset without checking.

7. **Return the PR link** to the user, not a live URL. The prototype only goes live once the PR is
   reviewed and merged, matching the repo's normal process. Say as much so nobody expects an instant
   link the way `publish_preview` gives one.

## Testing without Umbrage Pages access

**As of 2026-07-10, real access to `Umbrage-Studios/umbrage-client-pages` is confirmed working**
(via `Umbrage-Studios` org membership) - use the real repo directly per the Steps above. The sandbox
path below is kept for anyone who doesn't have that access yet, or for testing changes to this
command without touching the shared repo.

If you don't have access to the real pages repo yet, don't wait idle, the whole mechanism can be
validated against a personal sandbox repo instead:

1. Create a throwaway public GitHub repo (`gh repo create <you>/pages-sandbox --public`).
2. Seed it with a root `CLAUDE.md` stating the same convention (`projects/<name>/` with `index.html`
   at that folder's root).
3. Enable GitHub Pages on it from the `main` branch root
   (`gh api repos/<you>/pages-sandbox/pages -X POST -f "source[branch]=main" -f "source[path]=/"`).
4. Run steps 1-6 above against that repo instead of the real one, merge the PR yourself, and open
   `https://<you>.github.io/pages-sandbox/<project-name>/`.

GitHub Pages has the same relevant constraints as the real target (served at a sub-path, no
server-side rewrites), so this genuinely exercises the static-build requirements, the
`index.html`-at-root convention, and the PR mechanics, not just a syntax check. This is how the
command was validated end to end before real repo access existed: build, PR, merge, and a live
render (color, font, and a hash-routed page surviving a refresh) all confirmed against
`Yani-Umbrage/umbrage-pages-sandbox`. Swap in the real repo URL once access is granted; nothing else
about the flow changes.

## If it fails

- **Clone or push denied** - check `gh api user/memberships/orgs` for a pending `Umbrage-Studios`
  invite first; accepting it (with the user's explicit go-ahead, see Step 3) resolves most cases.
  If there's no pending invite either, ask the Pages team for access rather than working around it.
- **Project name rejected** - the folder name must match `^[a-z0-9][a-z0-9-]*$` and can't start
  with `_` (reserved for platform assets). Rename the folder, don't try to escape the pattern.
- **`index.html` missing at the project folder root after copying** - check step 2 copied the right
  build subfolder. For nestjs-react-starter it's `dist/apps/frontend-react/`'s contents, not the
  outer `dist/`.
- **Build renders unstyled** - `styles.css` isn't imported in `main.tsx`. See step 2.
- **Assets 404 or blank page after merge** - the base isn't relative. Confirm `base: './'` in the
  Vite config and that the built HTML references `./assets/...`, not `/assets/...`.
- **Routing breaks on refresh or deep links after merge** - the app is using `BrowserRouter`. Switch
  to `HashRouter` and rebuild.
