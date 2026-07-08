---
name: publish-pages
description: Build the prototype into a static bundle and open a PR adding it as a new project on Umbrage Pages. Use when someone wants to ship a prototype for real review and sharing, not just describe one. Publishes via the standard git/PR flow, not the preview MCP tool.
tools:
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

## Structure the Umbrage Pages repo expects

- A new folder per project: `projects/<project-name>/` (kebab-case).
- The build's `index.html` must land at the **root of that folder**, not nested under a `dist/`
  subfolder. This is how `pages.umbrage.com/<project-name>/` gets served.
- A `CLAUDE.md` inside `projects/<project-name>/` describing the prototype, and restating that it
  builds to the root of this folder.
- The repo's own root-level `CLAUDE.md` should already state this convention for every project. If
  it doesn't, that's worth flagging to whoever maintains the repo, it is not something to patch into
  their root docs uninvited.

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
   git clone <UMBRAGE_PAGES_REPO_URL> umbrage-pages
   cd umbrage-pages
   git checkout -b poc/<project-name>
   ```

   `<UMBRAGE_PAGES_REPO_URL>` is a placeholder. Confirm the real repo and that you have push access
   before running this; do not guess a repo name.

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

- **Clone or push denied** - access to the pages repo hasn't been granted yet. Don't try to work
  around this; ask for access.
- **`index.html` missing at the project folder root after copying** - check step 2 copied the right
  build subfolder. For nestjs-react-starter it's `dist/apps/frontend-react/`'s contents, not the
  outer `dist/`.
- **Build renders unstyled** - `styles.css` isn't imported in `main.tsx`. See step 2.
- **Assets 404 or blank page after merge** - the base isn't relative. Confirm `base: './'` in the
  Vite config and that the built HTML references `./assets/...`, not `/assets/...`.
- **Routing breaks on refresh or deep links after merge** - the app is using `BrowserRouter`. Switch
  to `HashRouter` and rebuild.
