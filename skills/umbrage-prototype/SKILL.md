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
- **Sharing a prototype →** `/publish-preview` (builds a static bundle and publishes it to Umbrage
  Pages, returning an SSO-gated link - this replaces the old Vercel deploy)
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

1. **`clientTheme` (default, works today)** - `/new-prototype` generates
   `apps/frontend-react/src/app/theme/clientTheme.ts` from a single primary brand color (it derives
   `primaryDark` automatically). Components read from it directly or via the `--client-primary` /
   `--client-primary-dark` CSS variables it sets. This has no dependency on Figma automation or a
   paid plan, so it's the default path for prototypes - not a fallback.

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

2. **Full Figma Variable sync (optional upgrade)** - if an engagement sets up Design Token Sync
   (see `references/figma-sync.md` - this requires a paid Figma plan and, as of writing, building
   `sync-tokens.mjs` since it doesn't exist yet), the designer duplicates the V2.2 Starter Kit,
   updates Variables there, and they flow into `tailwind.config.js` automatically. Treat this as an
   upgrade path, not a prerequisite for starting a prototype.
3. **Never hardcode client hex values in components.** Always read from `clientTheme` (or synced
   tokens once set up) and let them flow through. If a component uses a literal hex like
   `text-[#069BD7]`, that's a bug - replace it with the appropriate token.

**Figma kit for the client:** The V2.2 Starter Kit should be duplicated (not forked from the original) for each engagement if/when you set up full Figma sync. The duplicate is the client-specific source of truth. After duplication, the designer updates Variables in the new file - no changes go back to the shared V2.2 kit.

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

Prototypes are shared via **Umbrage Pages**, not Vercel. Use `/publish-preview`: it builds a static
bundle and publishes it to an SSO-gated link (`https://preview.pages.umbrage.com/p/<hash>/`) that any
signed-in Umbrage user can open. Claude just hands back the link.

The publisher accepts **text files only**, serves at a **sub-path**, and does **no SPA rewrites**, so
a publishable build needs: relative base (`base: './'`), `HashRouter` (not `BrowserRouter`), and no
binary assets (inline fonts/images as base64, or use SVG). `/publish-preview` supports **both
templates**: `poc-template` is already compliant, and `nestjs-react-starter` gets the static-safe
build applied automatically. Prototypes scaffolded by `/new-prototype` are already publish-ready.

True per-project placement on `pages.umbrage.com` (a named folder rather than a hashed link) needs the
`Umbrage-Studios/umbrage-client-pages` repo and its GitHub connector, which is not authorized yet - so
that path is documented but blocked. See `commands/publish-preview.md`.

---

## Reference files

Read these when you need step-by-step detail:

- `references/prototype-guide.md` - full 13-step walkthrough from clone to Umbrage Pages publish
- `references/figma-sync.md` - Code Connect setup and Design Token sync (opt-in; see Status note)

See `../../commands/new-prototype.md` for the fast-start scaffolding command.
