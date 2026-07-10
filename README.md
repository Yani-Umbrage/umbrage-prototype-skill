# Umbrage Prototype Kit

Hit the ground running on any engagement and go straight into building products.

## What's included

### Skill - `umbrage-prototype`
Invoke with `/umbrage-prototype` or just describe what you want to build. Covers:
- Scaffolding a new prototype from `nestjs-react-starter`
- Building screens with the correct Umbrage components and patterns
- Applying client branding (colors, typography, logo)
- Publishing to Umbrage Pages
- Figma ↔ code sync setup

### Command - `/new-prototype`
Clones `nestjs-react-starter`, wires up client branding from a single primary color (via
`clientTheme`), scaffolds the standard auth/data/layout stubs, sets the project up publish-ready
(HashRouter + relative base), and optionally creates and pushes a new GitHub repo. Use this to start
a new engagement instead of cloning by hand.

### Command - `/publish-pages`
Builds the prototype and opens a pull request adding it as a new project folder on Umbrage Pages
(`pages.umbrage.com`). Goes through the repo's normal review process, so you get back a PR link, not
an instant URL. Replaces the old Vercel deploy step. This is the git/PR path, not the preview MCP
tool, since Umbrage Pages leadership confirmed the preview tool is for one-off static content, not
full React apps.

**Requires:** access to the Umbrage Pages repo (ask the Pages team).

### Command - `/sync-tokens`
Syncs Figma Variables to `tailwind.config.js` immediately, without waiting for the nightly GitHub Action. Use whenever a designer updates brand colors in Figma and you need them in code now.

**Requires:** Figma Personal Access Token + paid Figma plan (Variables API).

### Command - `/publish-code-connect`
Publishes Code Connect mappings so Figma Dev Mode shows real React snippets for every component. Use when adding a new component or setting up a project for the first time.

**Requires:** Figma Personal Access Token.

## Setup

1. Install this plugin in Cowork (double-click the `.plugin` file)
2. For prototypes, you're done - `/new-prototype` and the skill's `clientTheme` path don't need
   any Figma automation set up. To publish, you'll need access to the Umbrage Pages repo (no Vercel
   account needed).
3. If you also want Figma Code Connect and nightly token sync, add your Figma Personal Access
   Token to your repo's GitHub Secrets as `FIGMA_ACCESS_TOKEN` and follow the One-Time Setup in
   `skills/umbrage-prototype/references/figma-sync.md`. Neither is built into `nestjs-react-starter`
   by default; this skill ships starting-point templates at `skills/umbrage-prototype/templates/`
   (`sync-tokens.mjs`, `badge.figma.tsx`) to copy in, but they're untested against a real Figma file
   and the actual GitHub Actions workflows still need to be written - see the Status note at the top
   of `figma-sync.md`.

## Figma file

Each engagement uses a **client-specific duplicate** of the V2.2 Starter Kit. Never work in the shared kit directly. After duplicating, update Variables in the client file to match their brand before running any syncs.
