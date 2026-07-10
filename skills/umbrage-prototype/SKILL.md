---
name: umbrage-prototype
description: >
  Guides building, maintaining, and syncing Umbrage design system prototypes for client engagements.
  Use this skill whenever someone wants to start a new prototype, build React screens with Umbrage
  components, apply client branding (colors, typography, logos) to a prototype or Figma file, set
  up a repo from the nestjs-react-starter, publish a prototype to Umbrage Pages, configure Figma
  Code Connect, sync
  design tokens from Figma, or work with any Umbrage UI component (Badge, Button, Sidebar,
  InputField, Select, etc.). Also trigger when someone mentions client colors or brand tokens,
  asks how to restyle the V2.2 kit for a new client, is confused about component props or variant
  names, asks which components are available, wants to add a new screen, or needs to understand
  the Figma ↔ code relationship. Works for experienced developers AND designers or interns
  touching the codebase for the first time.
---

# Umbrage Prototype Skill

You are helping someone build or maintain a React prototype using the Umbrage design system
(`nestjs-react-starter`). Your job spans three areas:

1. **Scaffolding** - clone, configure, and publish a new prototype
2. **Building** - create screens using the correct Umbrage components and patterns
3. **Figma sync** - keep Code Connect and Design Tokens in sync

Read the relevant reference file for the detailed steps:

- **Starting a new prototype fast →** `/new-prototype` (clones the starter kit and wires up
  `clientTheme` from one brand color in a single step - use this instead of the manual clone in
  `prototype-guide.md` Step 2 unless the user specifically wants to walk through it by hand)
- **Sharing a prototype →** `/publish-pages` (builds a static bundle and opens a PR adding it as a
  new project on Umbrage Pages - this replaces the old Vercel deploy; goes through review, not an
  instant link)
- **Building a prototype end-to-end →** `references/prototype-guide.md`
- **Figma sync setup →** `references/figma-sync.md`

### Scope modes

- **Prototype mode (default):** frontend-only, mock data, no backend. Use this for clickable demos.
  Everything lives in `apps/frontend-react/src/app/`.
- **Full-stack POC mode:** when the goal is to prove the end-to-end product, the backend app is in
  scope too. Confirm the backend stack first - the repo is `nestjs-react-starter`, but its pre-push
  hook also has a `backend-go` target, so ask which backend(s) are actually in play before writing
  server code.

Ask which mode applies before scaffolding if it isn't obvious from the request.

---

## Client branding - establish this first

Every prototype is for a specific client. Before writing any code or touching the Figma file, you need the client's brand values. If they haven't been provided, ask for them upfront - retrofitting colors and typography later is painful.

**What to collect:**

| Asset | Where it goes |
|---|---|
| Primary brand color(s) | `color/brand/primary` token → Figma Variables + `tailwind.config.js` |
| Text colors (primary, secondary) | `color/text/primary`, `color/text/secondary` |
| Background color | `color/background/default` |
| Border / divider color | `color/border/default` |
| Logo file (SVG preferred) | Used in the Sidebar `logo` prop and the login page |
| Typography (font family, weights) | Tailwind typography config |

**How branding flows through the system:**

1. **Figma-first (source of truth).** The designer duplicates the V2.2 Starter Kit and updates
   Variables in that client-specific file to match the brand. Once an engagement has Design Token
   Sync set up (see `references/figma-sync.md`), those Variables flow automatically into
   `libs/util/tailwind-preset/tailwind.config.js` via a nightly GitHub Action, and every component
   picks up the client's brand with no code changes. This is the system's intended end state -
   Figma Variables are the single source of truth for client brand tokens, not `clientTheme`.

   **Prerequisite:** a paid Figma plan (Variables REST API is Professional+), and - as of writing -
   someone has to build `sync-tokens.mjs` for this engagement, since it doesn't exist in a stock
   clone yet (see the Status note in `figma-sync.md`). Treat this as real setup work, not a toggle.

2. **`clientTheme` (fast-start fallback, works today with zero Figma dependency).** Until Design
   Token Sync is actually running for an engagement - which, as of writing, is true for every new
   engagement, since `sync-tokens.mjs` hasn't been built yet - `/new-prototype` generates
   `apps/frontend-react/src/app/theme/clientTheme.ts` from a single primary brand color instead (it
   derives `primaryDark` automatically). Components read from it directly or via the
   `--client-primary` / `--client-primary-dark` CSS variables it sets. Use this to start a prototype
   immediately; move to Figma-first sync when the engagement is ready to invest in the setup - it
   does not block starting.

   ```ts
   // apps/frontend-react/src/app/theme/clientTheme.ts
   export const clientTheme = {
     primary: '#YOUR_CLIENT_PRIMARY',
     primaryDark: '#YOUR_CLIENT_DARK', // auto-derived by /new-prototype if not given
     bodyText: '#25272C',
     secondaryText: '#6B7280',
     background: '#F5F7FA',
     border: '#EDEEF1',
   };
   ```

3. **Never hardcode client hex values in components.** Always read from synced Figma tokens (once
   set up) or `clientTheme` (before that) and let them flow through. If a component uses a literal
   hex like `text-[#069BD7]`, that's a bug - replace it with the appropriate token.

**Figma kit for the client:** The V2.2 Starter Kit should be duplicated (not forked from the original) for every engagement, whether or not Design Token Sync is set up yet - it's needed for Dev Mode inspection and eventual Code Connect regardless. The duplicate is the client-specific source of truth. After duplication, the designer updates Variables in the new file - no changes go back to the shared V2.2 kit.

---

## How to approach this

### Understand the request first

Before writing any code, figure out where the user is in the workflow:

- **Starting fresh?** → First confirm: client name and primary brand color (a duplicated client Figma file is nice to have, not required to start). Then run `/new-prototype` to clone, theme, and boot the project in one step. Only fall back to prototype guide Steps 1–9 by hand if the user wants to see each step or `/new-prototype` doesn't fit their case.
- **Building a screen?** → Ask what screen, what data it shows, what role sees it. Then scaffold the page file and wire the route.
- **Component question?** → Answer with the exact import path, required props, and any gotchas (listed below).
- **Figma sync issue?** → Check whether it's Code Connect (code → Figma) or Design Tokens (Figma → code) and follow the relevant section in the sync guide.

### Component rules - always enforce these

These patterns trip people up. Apply them automatically, don't wait to be asked:

- **Never hardcode colors, spacing, or typography.** Use design tokens or the `typography-font-*` Tailwind classes.
- **BadgeColor has no `Error` value.** Valid options: `Information | Success | Warning | Alert | Neutral`
- **Select always needs a `placeholder` prop.**
- **Sidebar needs a `profilePicture` prop** - pass `""` if not used.
- **Breadcrumbs with 2 items need `breadcrumbSize={BreadcrumbSize.Two}`** to avoid duplicate rendering.
- **TypeScript's `exactOptionalPropertyTypes` is on** - don't pass `undefined` to optional props. Omit them or use conditional spread: `{...(condition ? { prop: value } : {})}`.
- **Edit only `apps/frontend-react/src/app/`.** Everything in `libs/` is the design system - don't modify it.
- **Every component you add should have a Storybook story** - keep `libs/ui-components` in sync.

### Tone and depth

The user might be a developer who wants to move fast, or a designer/intern touching React for the first time. Read the conversation for cues. When in doubt:

- Use plain language - explain _why_ a pattern exists, not just what to type
- Show complete, copy-pasteable code blocks
- Call out gotchas before the user hits them
- Confirm the dev server is running and Storybook is available when relevant

---

## Quick component reference

| Component | Import | Key gotchas |
|---|---|---|
| Button | `Button, ButtonColor, ButtonSize, ButtonType` | `buttonType`, `buttonColor`, `buttonSize` are all required |
| Badge | `Badge, BadgeColor, BadgeSize` | No `Error` color |
| InputField | `InputField` | `label`, `placeholder`, `value`, `onChange` |
| Select | `Select, SelectOption` | `placeholder` required; `isMultiSelect` required |
| Sidebar | `Sidebar, SidebarSection, SidebarItem` | `profilePicture` required |
| Tab / TabGroup | `Tab, TabGroup` | `onTabClick` on TabGroup, `index` on Tab |
| Breadcrumb | `Breadcrumb, BreadcrumbSize` | Use `BreadcrumbSize.Two` for 2-item breadcrumbs |
| Banner | `Banner, BannerColor` | - |
| Modal | `Modal` | - |
| Toggle | `Toggle` | - |
| Checkbox | `Checkbox, CheckboxGroup` | - |
| Avatar | `Avatar, AvatarSize` | - |

All imports come from `@nestjs-react-starter/ui-components`.

---

## Key file locations

```
apps/frontend-react/src/app/
├── auth/AuthContext.tsx      ← auth pattern lives here
├── theme/clientTheme.ts      ← client brand colors (see Client branding above)
├── data/
│   ├── types.ts              ← data interfaces
│   ├── seed.ts               ← mock data
│   └── dataLayer.ts          ← query functions
├── layouts/                  ← shell layouts with Sidebar
├── pages/                    ← one file per screen
└── app.tsx                   ← routes
```

---

## Figma source of truth

The **shared** V2.2 Starter Kit (reference only): [TEST Design System Starter V2.2](https://www.figma.com/design/KjT0pvJZg3HrTM2SGxlZxy/TEST-Design-System-Starter-V2.2)

Each engagement uses a **client-specific duplicate** of this file with the client's Variables applied. Always work from the client's duplicated file, not the shared kit.

- Component names in Figma map directly to code imports (see component table above)
- Use Dev Mode (`</>` toggle) to inspect exact spacing, colors, and variant names
- The client's Figma file is **disconnected from the original V2.2** - do not sync back upstream
- If the user doesn't know their client Figma file URL yet, remind them to duplicate the V2.2 kit before starting

---

## Publishing to Umbrage Pages

Prototypes are shared via **Umbrage Pages**, not Vercel, and via **git, not the preview MCP tool**.
Use `/publish-pages`: it builds the prototype and opens a PR adding it as a new project folder at
`pages.umbrage.com/<project-name>/`. It goes through the repo's normal review process, so the command
hands back a **PR link**, not an instant live URL.

There's a separate `publish_preview` MCP tool that publishes instantly to a hashed
`preview.pages.umbrage.com/p/<hash>/` link. Don't use it for prototypes: Umbrage Pages leadership
confirmed it's meant for one-off static content (reports, recaps), not full React apps, and a real
build is too large to pass through that tool anyway (the model can't read or emit a production
bundle's minified JS as a tool-call argument). Git has no such limit, which is the other reason this
is the right path, not just the sanctioned one. It has one narrow legitimate use - a quick,
disposable static check of client brand colors on a few hand-authored components before building the
real screens - see the confirmed limits and caveats in `commands/publish-pages.md`.

A publishable build still needs relative base (`base: './'`) and `HashRouter` (not `BrowserRouter`),
since it's served at a sub-path with no server-side rewrites. It does NOT need binary assets
avoided or inlined, git handles fonts and images as normal files. Prototypes scaffolded by
`/new-prototype` are already set up this way.

The Umbrage Pages repo expects a specific structure: a `projects/<project-name>/` folder with the
build's `index.html` at its root (not nested under `dist/`), plus a `CLAUDE.md` inside that folder
describing the prototype. See `commands/publish-pages.md` for the full mechanics. The actual repo
name and write access are still being confirmed with the Pages team; treat that as a placeholder
until it's filled in.

---

## Reference files

Read these when you need step-by-step detail:

- `references/prototype-guide.md` - full 13-step walkthrough from clone to Umbrage Pages publish
- `references/figma-sync.md` - Code Connect setup and Design Token sync (opt-in; see Status note)

See `../../commands/new-prototype.md` for the fast-start scaffolding command.
