# Figma Sync Setup

Two-way sync between the Umbrage Figma design system and the code.

> **Status:** `nestjs-react-starter` itself still ships with no `.figma.tsx` mapping files under
> `libs/ui-components` and no `libs/util/tailwind-preset/sync-tokens.mjs` - neither sync is
> pre-configured in the shared starter kit, by design, since each engagement's Figma file key
> differs. This skill now ships **templates** for both at
> `skills/umbrage-prototype/templates/sync-tokens.mjs` and
> `skills/umbrage-prototype/templates/badge.figma.tsx`, matching the spec below. Copy them into
> your engagement's cloned prototype repo (never into the shared starter kit) when you set up
> either sync - see the One-Time Setup and per-sync sections below for exactly where.
>
> `sync-tokens.mjs`'s core logic (Figma variable name conversion, color conversion, and the
> tailwind.config.js insert-or-update block) has been smoke-tested against a mocked Figma API
> response, but neither template has been run against a **real** Figma file yet - no
> `FIGMA_ACCESS_TOKEN` or client file key was available when they were written. Validate against
> your engagement's duplicated V2.2 file before trusting the output, and update this note once
> either has run successfully for the first time against real data.
>
> Until Design Token Sync is actually running for your engagement, use `clientTheme` for prototype
> branding (see `prototype-guide.md` Step 10 / `SKILL.md`) - it doesn't depend on this
> infrastructure or a paid Figma plan, and nothing about adopting sync later requires reworking it.

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

### 3. Set your client's Figma file key

Every engagement works from a **duplicated** client Figma file, never the shared V2.2 kit. Find
your client file's key in its URL (`figma.com/design/<FILE_KEY>/...`) and store it as a GitHub repo
variable (Settings → Secrets and variables → Actions → Variables tab):

- Name: `FIGMA_FILE_KEY`
- Value: your client's duplicated file's key (NOT `KjT0pvJZg3HrTM2SGxlZxy` - that's the shared kit,
  for reference only)

Once both the secret and this variable are set, and the scripts below have been copied in from this
skill's templates (see the Status note above), you can run either sync manually. **The nightly and
on-push GitHub Actions themselves still need to be written** - this skill ships the `sync-tokens.mjs`
and `.figma.tsx` templates the Actions would call, but not `.github/workflows/*.yml` for either
schedule yet. Until those workflows exist, run both syncs manually (see "Running manually" /
"Publishing manually" below) rather than assuming they're automatic.

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

### First-time setup: copy the template

If `libs/ui-components/src/lib/badge/badge.figma.tsx` doesn't exist yet in your engagement's repo,
copy the starting point from this skill:

```bash
cp <path-to-this-skill>/templates/badge.figma.tsx libs/ui-components/src/lib/badge/badge.figma.tsx
```

It's untested against a real Figma file (see the Status note above) - review it against your
client's actual Badge variants before publishing, then use it as the reference structure for every
other component's `.figma.tsx` file.

### Filling in node IDs

Most mapping files have `REPLACE_NODE_ID` as a placeholder. Run this once to auto-discover the real Figma node IDs:

```bash
cd libs/ui-components

# Use YOUR CLIENT'S DUPLICATED file, not the shared V2.2 kit.
FIGMA_ACCESS_TOKEN=your_token npx @figma/code-connect create https://www.figma.com/design/$FIGMA_FILE_KEY --skip-update
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
3. Push to main - the GitHub Action publishes it automatically

---

## Design Token Sync

### What it does

Reads color Variables from the Figma file and updates the color tokens in `libs/util/tailwind-preset/tailwind.config.js`.

**Requires a paid Figma plan** - the Variables REST API is only available on Professional plans and above.

### How it works

1. GitHub Action runs nightly at 2am UTC
2. Calls `GET /v1/files/{fileKey}/variables/local`
3. Converts Figma Variable names (e.g. `light/background/badge/information`) to tailwind tokens (e.g. `light-background-badge-information`)
4. Rewrites the colors block in `tailwind.config.js`
5. Commits the changes if anything changed

### First-time setup: copy the template

If `libs/util/tailwind-preset/sync-tokens.mjs` doesn't exist yet in your engagement's repo, copy the
starting point from this skill:

```bash
cp <path-to-this-skill>/templates/sync-tokens.mjs libs/util/tailwind-preset/sync-tokens.mjs
```

It's smoke-tested against a mocked Figma response but untested against a real Figma file (see the
Status note above) - run it once manually and review the `tailwind.config.js` diff carefully before
wiring it into a nightly GitHub Action.

### Running manually

```bash
cd libs/util/tailwind-preset
FIGMA_ACCESS_TOKEN=your_token FIGMA_FILE_KEY=your_client_file_key node sync-tokens.mjs
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
4. Merge the PR - the updated colors are live in the next deploy

### A developer adds a new component

1. Build the component in `libs/ui-components/src/lib/NewComponent/`
2. Create `NewComponent.figma.tsx` with props mapped to Figma variants
3. Push to main
4. Code Connect publishes automatically
5. Designers see the React snippet in Figma Dev Mode

### A designer adds a new component variant in Figma

1. Update the `.figma.tsx` mapping file to include the new variant in the `figma.enum()` call
2. Push to main - published automatically
