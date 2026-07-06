# Figma Sync Setup

Two-way sync between the Umbrage Figma design system and the code.

## What's Included

| Sync          | Direction                  | Trigger                            |
| ------------- | -------------------------- | ---------------------------------- |
| Code Connect  | Code → Figma Dev Mode      | Push to main (GitHub Action)       |
| Design Tokens | Figma Variables → Tailwind | Nightly at 2am UTC (GitHub Action) |

---

## One-Time Setup

### 1. Get a Figma Access Token

1. Go to **Figma** → Account Settings → Security → **Personal access tokens**
2. Click **Generate new token**
3. Give it a name like "beup-starter-sync"
4. Copy the token

### 2. Add it to GitHub Secrets

1. Go to your GitHub repo → Settings → Secrets and variables → Actions
2. Click **New repository secret**
3. Name: `FIGMA_ACCESS_TOKEN`
4. Value: paste your Figma token

That's it — both GitHub Actions will now work automatically.

---

## Code Connect

### What it does

When a developer opens any component in the Figma file's Dev Mode, they see the actual React snippet instead of generic CSS.

### Files

Each component has a `.figma.tsx` mapping file alongside its source:

```
libs/ui-components/src/lib/
├── badge/
│   ├── badge.tsx          ← component source
│   └── badge.figma.tsx    ← Code Connect mapping
├── button/
│   ├── button.tsx
│   └── button.figma.tsx
└── ...
```

### Filling in node IDs

Most mapping files have `REPLACE_NODE_ID` as a placeholder. Run this once to auto-discover the real Figma node IDs:

```bash
cd libs/ui-components
FIGMA_ACCESS_TOKEN=your_token npx @figma/code-connect create https://www.figma.com/design/KjT0pvJZg3HrTM2SGxlZxy/TEST-Design-System-Starter-V2.2 --skip-update
```

This prints the node IDs for each component. Copy them into the corresponding `.figma.tsx` files.

### Publishing manually

```bash
cd libs/ui-components
FIGMA_ACCESS_TOKEN=your_token npx @figma/code-connect publish
```

After this, open the Figma file → click any component → Dev Mode → you'll see the React snippet.

### Adding a new component

1. Create `ComponentName.figma.tsx` alongside the component source
2. Write the prop mappings (use `badge.figma.tsx` as a reference)
3. Push to main — the GitHub Action publishes it automatically

---

## Design Token Sync

### What it does

Reads color Variables from the Figma file and updates the color tokens in `libs/util/tailwind-preset/tailwind.config.js`.

**Requires a paid Figma plan** — the Variables REST API is only available on Professional plans and above.

### How it works

1. GitHub Action runs nightly at 2am UTC
2. Calls `GET /v1/files/{fileKey}/variables/local`
3. Converts Figma Variable names (e.g. `light/background/badge/information`) to tailwind tokens (e.g. `light-background-badge-information`)
4. Rewrites the colors block in `tailwind.config.js`
5. Commits the changes if anything changed

### Running manually

```bash
cd libs/util/tailwind-preset
FIGMA_ACCESS_TOKEN=your_token node sync-tokens.mjs
```

### Token naming convention

Figma Variables should follow this naming structure for the sync to work:

```
{mode}/{type}/{component}/{variant}
```

Examples:

- `light/background/badge/information` → `light-background-badge-information`
- `dark/text/button/primary-default` → `dark-text-button-primary-default`

---

## Workflow for Design Changes

### A designer changes a color in Figma

1. Figma Variables are updated
2. Token sync runs at 2am (or trigger manually via GitHub Actions → Design Token Sync → Run workflow)
3. PR is automatically committed with the updated `tailwind.config.js`
4. Merge the PR — the updated colors are live in the next deploy

### A developer adds a new component

1. Build the component in `libs/ui-components/src/lib/NewComponent/`
2. Create `NewComponent.figma.tsx` with props mapped to Figma variants
3. Push to main
4. Code Connect publishes automatically
5. Designers see the React snippet in Figma Dev Mode

### A designer adds a new component variant in Figma

1. Update the `.figma.tsx` mapping file to include the new variant in the `figma.enum()` call
2. Push to main — published automatically
