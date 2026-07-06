---
name: publish-preview
description: Build the current prototype into a self-contained static bundle and publish it to Umbrage Pages, returning an SSO-gated shareable link. Use when someone wants to share a prototype with the team without deploying to a third-party host like Vercel. Replaces the old Vercel deploy step.
---

# /publish-preview

Build the prototype into a static HTML bundle and publish it to Umbrage Pages. The user gets back a
link like `https://preview.pages.umbrage.com/p/<hash>/` that any signed-in Umbrage user can open. No
Vercel, no manual upload, no third-party account.

> **No `tools:` restriction on purpose.** This command needs the Umbrage Pages publish tool, whose
> MCP name is a session-specific hash (`mcp__<hash>__publish_preview`). Restricting `tools:` to a
> fixed list would block it. Leave it unrestricted so the command can call whatever publish tool the
> session exposes.

## How Umbrage Pages publishing works (read this first)

The publisher has three hard constraints that shape everything below:

1. **Text files only.** It accepts UTF-8 text (HTML/CSS/JS/SVG). No binary uploads - so no `.ttf`,
   `.woff`, `.png`, or `.jpg` files in the build output. Binary assets must be inlined as base64 or
   replaced with SVG.
2. **Served at a sub-path** (`/p/<hash>/`). All asset URLs must be relative (`./assets/...`), never
   absolute (`/assets/...`), or they 404.
3. **No SPA rewrites.** Client-side routing must use `HashRouter` (`#/path`), not `BrowserRouter`, or
   deep links and refreshes break.

`poc-template` already satisfies all three. `nestjs-react-starter` does not by default and needs the
static-safe build in step 3.

## Steps

1. **Ask the user for the project name.** This becomes the preview's `title` (it shows in the
   shareable link listing and is how the user finds it later). Keep asking until you have one.

2. **Confirm the Umbrage Pages connector is available.** Look for a `publish_preview` tool in the
   session (its full name is `mcp__<hash>__publish_preview`). If it isn't present, stop and tell the
   user to connect the Umbrage Pages connector in their Claude connector settings, then re-run. Do
   not try to work around a missing connector.

3. **Detect the template and make the build static-safe.**

   - **poc-template** (a `package.json` named `poc-template`, `vite.config.ts` with `base: './'`):
     already publish-ready. No changes needed. Skip to step 4.

   - **nestjs-react-starter** (an Nx workspace with `apps/frontend-react`): apply these before
     building. Prefer a dedicated publish config so the normal dev/build config is untouched.
     - **Relative base** - `base: './'` in the Vite config used for the publish build.
     - **HashRouter** - if the app uses `BrowserRouter` (check `apps/frontend-react/src/main.tsx`
       and `src/app/app.tsx`), switch it to `HashRouter`. Prototypes scaffolded by `/new-prototype`
       already use HashRouter, so this is usually a no-op.
     - **Text-only output** - inline all fonts and images as base64 so nothing binary is emitted.
       The design system hardcodes the binary Cera Pro `.ttf` fonts, so this matters. Two ways:
       - `vite-plugin-singlefile` - collapses JS/CSS/assets into a single `index.html`. Cleanest for
         this publisher (one text file).
       - or set `build.assetsInlineLimit` very high so Vite base64-inlines fonts/images into the CSS.
     - Confirm `styles.css` is imported in `main.tsx` (a stock clone does not import it, and without
       it Tailwind never loads and the whole build renders unstyled).

4. **Build.**
   - poc-template: `npm run build` (outputs to `dist/`).
   - nestjs-react-starter: `yarn nx build frontend-react` with the static-safe config (outputs to
     `dist/apps/frontend-react/`).

5. **Verify no binary assets** before publishing:

   ```bash
   find <dist-dir> -type f -exec file {} +
   ```

   Reject the build if any real binary format is present: `.ttf`, `.woff`, `.woff2`, `.png`, `.jpg`,
   `.jpeg`, `.gif`, `.ico`. Fix the inlining (step 3) or swap the asset for SVG first. Note: `file`
   labels `.svg` as "SVG Scalable Vector Graphics image" even though SVG is XML text, so SVG is fine
   to publish - do NOT reject on the word "image"; only reject the binary extensions above. Also mind
   the total size (see step 6).

6. **Publish.** Read every file in the dist directory as text into a `files` array of
   `{ path, content }` (paths relative to the dist root, e.g. `index.html`, `assets/main-*.js`), and
   call the `publish_preview` tool with `files` and `title` = the project name.

   **Size matters a lot here.** The entire bundle is sent as arguments to the publish tool, so every
   file's content passes through the model's context. A typical Vite bundle has a large minified
   `main-*.js` (a stock poc-template build is ~690K, roughly 170K tokens on its own) - publishable but
   heavy. A `nestjs-react-starter` build with the Cera Pro fonts base64-inlined can run to several MB,
   which is likely too large to pass through a tool call at all. Keep bundles small: prefer the
   lighter poc-template for Umbrage Pages, trim unused dependencies, and only inline the font weights
   you actually use. If a build is too big to publish, say so plainly rather than silently truncating.

7. **Return the link** the tool gives back (`https://preview.pages.umbrage.com/p/<hash>/`) to the
   user. That's the deliverable: hand them the link. Mention it's SSO-gated to Umbrage users and
   listed under their project name.

## True per-project placement on pages.umbrage.com (not available yet)

The user may want the POC to live under a named project folder on `pages.umbrage.com` itself (not
just a hashed preview link). That requires committing the built files into a per-project folder in
the `Umbrage-Studios/umbrage-client-pages` repo, which backs `pages.umbrage.com`.

**This is blocked today** - that repo is not accessible and the GitHub connector for it has not been
authorized. Do not attempt it. Once the connector is authorized and the repo is confirmed, the flow
would be: build (steps 3-5) → commit the dist into `projects/<project-name>/` on that repo → push →
the POC appears at `pages.umbrage.com/<project-name>/`. Until then, use the preview link from step 7,
titled with the project name.

## If it fails

- **No `publish_preview` tool in the session** - the Umbrage Pages connector isn't connected. Ask the
  user to add it in their Claude connector settings and re-run.
- **Publish rejected for size** - base64-inlined Cera Pro fonts can make the bundle large. Try
  inlining fewer font weights, or drop Cera Pro and let text fall back to a system sans-serif (the
  layout still holds since spacing/sizing come from Tailwind). Note this trade-off to the user.
- **Link opens but everything is unstyled** - Tailwind didn't load. Confirm `styles.css` is imported
  in `main.tsx` and rebuild.
- **Link opens but assets 404 / blank page** - the base isn't relative. Confirm `base: './'` and that
  the built HTML references `./assets/...`, not `/assets/...`.
- **Routing breaks on refresh or deep links** - the app is using `BrowserRouter`. Switch to
  `HashRouter` and rebuild.
