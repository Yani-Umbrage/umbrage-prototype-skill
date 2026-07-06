---
name: sync-tokens
description: Sync design tokens from Figma Variables to tailwind.config.js. Use when a designer has updated brand colors or tokens in Figma and the code needs to reflect those changes immediately, without waiting for the nightly GitHub Action.
tools:
  - Bash
  - Read
---

# /sync-tokens

Sync Figma design tokens to the codebase immediately.

## What this does

Reads color Variables from the client's Figma file and regenerates the color tokens in `libs/util/tailwind-preset/tailwind.config.js`. Requires a paid Figma plan (the Variables REST API is a paid feature).

## Steps

1. Check whether `FIGMA_ACCESS_TOKEN` is already set in the environment. If not, ask the user to provide their Figma Personal Access Token before continuing.

2. Confirm the user is in the project root directory. If not, ask them to `cd` into it first.

3. Run the sync:

```bash
cd libs/util/tailwind-preset && FIGMA_ACCESS_TOKEN=<token> node sync-tokens.mjs
```

4. Report what changed - show which token values were updated in `tailwind.config.js`.

5. Remind the user to commit and push the updated `tailwind.config.js` so the changes go live on next deploy.

## If it fails

- **"Variables API not available"** - the Figma file is on a free plan. The Variables REST API requires Professional plan or above.
- **"File not found"** - confirm the `FIGMA_FILE_KEY` in the sync script matches the client's duplicated Figma file (not the shared V2.2 kit).
- **Token naming mismatch** - Figma Variables must follow `{mode}/{type}/{component}/{variant}` format (e.g. `light/background/badge/information`). Freeform names like "Primary Blue" won't convert. Ask the designer to rename the variable in Figma.

## After syncing

Never hardcode the synced hex values anywhere in the codebase. All components should reference tokens - the sync keeps them accurate automatically.
