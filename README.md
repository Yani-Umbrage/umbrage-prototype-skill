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

### Command - `/publish-preview`
Builds the prototype into a self-contained static bundle and publishes it to Umbrage Pages, returning
an SSO-gated `preview.pages.umbrage.com/p/<hash>/` link that any signed-in Umbrage user can open. No
Vercel, no manual upload. Asks for a project name (used as the preview's title). Replaces the old
Vercel deploy step.

**Requires:** the Umbrage Pages connector connected in Claude.

### Command - `/sync-tokens`
Syncs Figma Variables to `tailwind.config.js` immediately, without waiting for the nightly GitHub Action. Use whenever a designer updates brand colors in Figma and you need them in code now.

**Requires:** Figma Personal Access Token + paid Figma plan (Variables API).

### Command - `/publish-code-connect`
Publishes Code Connect mappings so Figma Dev Mode shows real React snippets for every component. Use when adding a new component or setting up a project for the first time.

**Requires:** Figma Personal Access Token.

## Setup

1. Install this plugin in Cowork (double-click the `.plugin` file)
2. For prototypes, you're done - `/new-prototype` and the skill's `clientTheme` path don't need
   any Figma automation set up. To publish, connect the Umbrage Pages connector in Claude (no Vercel
   account needed).
3. If you also want Figma Code Connect and nightly token sync, add your Figma Personal Access
   Token to your repo's GitHub Secrets as `FIGMA_ACCESS_TOKEN` and follow the One-Time Setup in
   `skills/umbrage-prototype/references/figma-sync.md` - these aren't built into
   `nestjs-react-starter` yet, so the first engagement that wants them needs to set them up per
   that file's spec.

## Figma file

Each engagement uses a **client-specific duplicate** of the V2.2 Starter Kit. Never work in the shared kit directly. After duplicating, update Variables in the client file to match their brand before running any syncs.
