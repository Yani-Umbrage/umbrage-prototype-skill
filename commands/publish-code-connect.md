---
name: publish-code-connect
description: Publish Code Connect mappings to Figma so developers see real React snippets in Dev Mode. Use when a new component has been added to the repo, a component's props have changed, or Code Connect hasn't been set up yet and Dev Mode is showing generic CSS instead of React code.
tools:
  - Bash
  - Read
  - Glob
---

# /publish-code-connect

Publish Code Connect so Figma Dev Mode shows live React snippets for every component.

## What this does

Reads the `.figma.tsx` mapping files alongside each component in `libs/ui-components/` and publishes them to the client's Figma file. After publishing, any developer who clicks a component in Figma Dev Mode sees the exact import and props to use — no more guessing.

## Steps

1. Check whether `FIGMA_ACCESS_TOKEN` is set. If not, ask the user for their Figma Personal Access Token.

2. Check whether the `.figma.tsx` files have real node IDs or still contain `REPLACE_NODE_ID` placeholders. If placeholders exist, run the discovery step first:

```bash
cd libs/ui-components
FIGMA_ACCESS_TOKEN=<token> npx @figma/code-connect create <client-figma-url> --skip-update
```

This prints the correct node IDs for each component. The user needs to copy them into the corresponding `.figma.tsx` files before publishing.

3. Once node IDs are filled in, publish:

```bash
cd libs/ui-components
FIGMA_ACCESS_TOKEN=<token> npx @figma/code-connect publish
```

4. Confirm success — tell the user to open the Figma file, click any component, switch to Dev Mode (`</>` toggle), and verify they see the React snippet.

## Adding a new component

When a new component is added to `libs/ui-components/src/lib/`:

1. Create `ComponentName.figma.tsx` alongside the component source, using `badge.figma.tsx` as a reference for prop mapping structure.
2. Run this command to publish it.
3. From next push to `main`, the GitHub Action will publish automatically — no need to run this manually again.

## If it fails

- **"Unauthorized"** — the token doesn't have the right Figma scopes. Regenerate it with `File content (read)` and `Code Connect (write)` permissions.
- **"Component not found"** — the node ID in the `.figma.tsx` file doesn't match the client's Figma file. Re-run the discovery step with the correct client Figma URL.
- **GitHub Action not triggering** — confirm `FIGMA_ACCESS_TOKEN` is added as a repository secret (repo Settings → Secrets and variables → Actions).
