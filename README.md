# Umbrage Prototype Kit

Hit the ground running on any engagement and go straight into building products.

## What's included

### Skill — `umbrage-prototype`
Invoke with `/umbrage-prototype` or just describe what you want to build. Covers:
- Scaffolding a new prototype from `nestjs-react-starter`
- Building screens with the correct Umbrage components and patterns
- Applying client branding (colors, typography, logo)
- Deploying to Vercel
- Figma ↔ code sync setup

### Command — `/sync-tokens`
Syncs Figma Variables to `tailwind.config.js` immediately, without waiting for the nightly GitHub Action. Use whenever a designer updates brand colors in Figma and you need them in code now.

**Requires:** Figma Personal Access Token + paid Figma plan (Variables API).

### Command — `/publish-code-connect`
Publishes Code Connect mappings so Figma Dev Mode shows real React snippets for every component. Use when adding a new component or setting up a project for the first time.

**Requires:** Figma Personal Access Token.

## Setup

1. Install this plugin in Cowork (double-click the `.plugin` file)
2. Add your Figma Personal Access Token to your repo's GitHub Secrets as `FIGMA_ACCESS_TOKEN`
3. That's it — both GitHub Actions (nightly token sync + Code Connect on push) will work automatically

## Figma file

Each engagement uses a **client-specific duplicate** of the V2.2 Starter Kit. Never work in the shared kit directly. After duplicating, update Variables in the client file to match their brand before running any syncs.
