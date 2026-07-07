# Umbrage Prototype Guide

### From Figma Starter Kit → Working App → Umbrage Pages

A step-by-step guide for building a clickable, deployed prototype using the Umbrage design system and React starter kit. No backend required in prototype mode (see Scope modes in `SKILL.md`).

---

## What You'll Build

A multi-screen React prototype with:

- Real navigation and routing (not just Figma links)
- Umbrage design system components (Badge, Button, Sidebar, etc.)
- Mock data that looks realistic
- Role-based views (e.g. customer vs. admin)
- A shareable Umbrage Pages link (SSO-gated to Umbrage staff) you can send to the team

**Time estimate:** 1–2 days for a 10–12 screen prototype.

---

## Prerequisites

- Node.js 20+ and Yarn installed
- Git installed
- The Umbrage Pages connector connected in Claude (for publishing; see Step 12) - no Vercel account needed
- Access to the [Umbrage Figma design system](https://www.figma.com/design/KjT0pvJZg3HrTM2SGxlZxy/TEST-Design-System-Starter-V2.2)
- GitHub account with access to the Umbrage-Studios org (or your personal account)

---

## Step 1 - Get Familiar with the Figma Starter Kit

**File:** [TEST Design System Starter V2.2](https://www.figma.com/design/KjT0pvJZg3HrTM2SGxlZxy/TEST-Design-System-Starter-V2.2)

This Figma file is the visual source of truth for every component in the code. Before writing a single line, spend 10 minutes exploring it so you know what's available.

### What's in the file

Open the file and look at the left sidebar pages:

- **CORE COMPONENTS** - every UI component (Badge, Button, Input, Select, Sidebar, etc.) with all their variants
- **EXAMPLE** - sample layouts showing how components combine into screens
- **Read Me** - usage notes from the design team

### How to use it while building

**To inspect a component's visual spec:**

1. Open the file in Figma
2. Click the component (e.g. Badge)
3. Switch to **Dev Mode** (top-right `</>` toggle) to see exact spacing, colors, and variant names

**The component names in Figma map directly to code:**
| Figma component | Code import |
|---|---|
| Badge | `Badge, BadgeColor, BadgeSize` |
| Button | `Button, ButtonColor, ButtonSize, ButtonType` |
| Input Field | `InputField` |
| Select | `Select, SelectOption` |
| Sidebar | `Sidebar, SidebarSection, SidebarItem` |
| Tab / Tab Group | `Tab, TabGroup` |
| Breadcrumb | `Breadcrumb, BreadcrumbSize` |
| Banner | `Banner, BannerColor` |
| Modal | `Modal` |
| Toggle | `Toggle` |
| Checkbox | `Checkbox, CheckboxGroup` |
| Radio | `RadioGroup` |
| Avatar | `Avatar, AvatarSize` |

### Figma ↔ Code sync is opt-in infrastructure

The repo supports two sync mechanisms (see [`figma-sync.md`](figma-sync.md)), but neither is set up by default - they're a one-time setup an engagement does when it needs them, not something that ships pre-configured:

1. **Code Connect** - once set up, real React code snippets appear in Figma Dev Mode when you click any component. Requires filling in `.figma.tsx` node IDs and running the initial publish (see `figma-sync.md`).

2. **Design Token Sync** - once set up, a nightly GitHub Action reads Figma Variables and regenerates the color tokens in `libs/util/tailwind-preset/tailwind.config.js`. Requires a paid Figma plan (Variables REST API) and a `sync-tokens.mjs` script that the engagement builds per `figma-sync.md`'s spec.

**For prototypes, don't wait on either sync.** Use `clientTheme` (Step 10) - it's the fast, working-today path for getting a client's brand color into the code, whether or not this engagement ever sets up full Figma sync. If `/new-prototype` was used to scaffold this project, `clientTheme` is already wired up.

### Finding color and spacing values

All color tokens are in the Figma file under the **Variables** panel (right sidebar in Dev Mode). The ones you'll use most:

| Figma token                | Hex             | Use                    |
| -------------------------- | --------------- | ---------------------- |
| `color/brand/primary`      | client-specific | Primary actions, links |
| `color/text/primary`       | `#25272C`       | Body text              |
| `color/text/secondary`     | `#6B7280`       | Labels, captions       |
| `color/background/default` | `#F5F7FA`       | Page background        |
| `color/border/default`     | `#EDEEF1`       | Cards, dividers        |

---

## Step 2 - Clone the Starter Kit

The starter kit lives at `github.com/Umbrage-Studios/nestjs-react-starter`. **Do not push changes back to this repo** - it's the shared source of truth for all Umbrage projects.

```bash
# Clone to a new folder with your project name
git clone https://github.com/Umbrage-Studios/nestjs-react-starter.git your-project-name
cd your-project-name

# Remove the original remote so you don't accidentally push there
git remote remove origin

# Install dependencies
yarn install
```

---

## Step 3 - Create Your GitHub Repo

Create a new private repo for your project (use your personal account if you don't have org-level create permissions):

```bash
gh repo create your-username/your-project-name --private --description "Your project description"

# Point the local repo at the new remote
git remote add origin https://github.com/your-username/your-project-name.git
```

---

## Step 4 - Understand the Project Structure

```
your-project-name/
├── apps/
│   └── frontend-react/          ← your prototype lives here
│       └── src/app/
│           ├── app.tsx           ← routes go here
│           ├── pages/            ← create your screens here
│           └── ...
└── libs/
    └── ui-components/            ← Umbrage design system (read-only)
        └── src/lib/
            ├── badge/
            ├── button/
            ├── sidebar/
            └── ...               ← all available components
```

The key rule: **you only edit files inside `apps/frontend-react/src/app/`.** Everything in `libs/` is the design system - don't modify it.

To see all available components, run Storybook:

```bash
yarn nx storybook ui-components
# Opens at http://localhost:4400
```

---

## Step 5 - Start the Dev Server

```bash
yarn nx serve frontend-react
# Opens at http://localhost:4200
```

**If everything renders unstyled** (system font, no colors, no spacing) - a fresh clone of
`nestjs-react-starter` does not import `styles.css` anywhere in the `apps/frontend-react` entry
chain, so Tailwind never loads until you add it yourself. Add this to `src/main.tsx`:

```ts
import './styles.css';
```

This is a gap in the starter kit itself, not something specific to your prototype - worth flagging
to whoever maintains `nestjs-react-starter` so new clones don't hit it.

---

## Step 6 - Plan Your Screens

Before writing code, list every screen your prototype needs. For each screen write down:

- **Name** (e.g. `DashboardPage`)
- **Route** (e.g. `/app/dashboard`)
- **Who sees it** (customer, admin, both)
- **Key data** it shows (properties, meters, alerts, etc.)

This list becomes your file structure and your mock data schema.

---

## Step 7 - Set Up Auth (Copy This Pattern)

For prototypes, a simple hardcoded auth context is enough. Create `src/app/auth/AuthContext.tsx`:

```tsx
import { createContext, useContext, useState, ReactNode } from 'react';

// Define your user roles
export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  // add any role-specific fields here
}

// Hardcode demo accounts
const DEMO_USERS: User[] = [
  { id: '1', email: 'user@example.com', role: 'customer', name: 'Jane Smith' },
  { id: '2', email: 'admin@example.com', role: 'admin', name: 'Admin User' },
];

const getUserByEmail = (email: string) => DEMO_USERS.find(u => u.email === email);

// Persist auth across page reloads
const STORAGE_KEY = 'proto_user_email';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (getUserByEmail(saved) ?? null) : null;
  });

  const login = (email: string, _password: string): boolean => {
    const found = getUserByEmail(email);
    if (found) {
      localStorage.setItem(STORAGE_KEY, email);
      setUser(found);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
```

Wrap your app in `<AuthProvider>` inside `src/main.tsx`.

---

## Step 8 - Define Your Data Types and Mock Data

Create `src/app/data/types.ts` with interfaces for everything your prototype shows:

```ts
// Example - adapt to your project
export interface Property {
  id: string;
  name: string;
  address: string;
  status: 'active' | 'inactive';
}
```

Create `src/app/data/seed.ts` with realistic-looking hardcoded data:

```ts
import { Property } from './types';

export const PROPERTIES: Property[] = [
  { id: 'p1', name: '350 Fifth Ave', address: '350 Fifth Ave, NY 10118', status: 'active' },
  { id: 'p2', name: '1 World Trade', address: '1 World Trade Center, NY 10007', status: 'active' },
  // add enough rows to look real - aim for 5–10 items per list
];
```

Create `src/app/data/dataLayer.ts` with query functions (keeps pages clean):

```ts
import { PROPERTIES } from './seed';

export const getAllProperties = () => PROPERTIES;
export const getPropertyById = (id: string) => PROPERTIES.find(p => p.id === id);
```

---

## Step 9 - Set Up Layouts and Routing

Create shell layouts for each role using the `Sidebar` component.

**`src/app/layouts/CustomerShell.tsx`** (example skeleton):

```tsx
import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar, SidebarSection, SidebarItem } from '@nestjs-react-starter/ui-components';
import { GridStroke } from '@nestjs-react-starter/ui-components';
import { useAuth } from '../auth/AuthContext';

export default function CustomerShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-[#F5F7FA]">
      <Sidebar
        collapsed={collapsed}
        logo={<YourLogo />}
        header
        userName={user?.name ?? ''}
        userEmail={user?.email ?? ''}
        profilePicture=""
        selected={location.pathname}
        toggleCollapsed={() => setCollapsed(!collapsed)}
        setSelected={s => navigate(s)}
      >
        <SidebarSection divider={collapsed} collapsed={collapsed}>
          <SidebarItem
            text="Dashboard"
            icon={<GridStroke />}
            selected={location.pathname === '/app'}
            collapsed={collapsed}
            onClick={() => navigate('/app')}
          />
          {/* add more items for each screen */}
        </SidebarSection>
      </Sidebar>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
```

Wire everything up in **`src/app/app.tsx`**:

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import LoginPage from './pages/LoginPage';
import CustomerShell from './layouts/CustomerShell';
import DashboardPage from './pages/customer/DashboardPage';
// import other pages...

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/app" element={<CustomerShell />}>
            <Route index element={<DashboardPage />} />
            {/* nest your customer pages here */}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

Add a `<ProtectedRoute>` wrapper if you need to redirect unauthenticated users:

```tsx
function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: ReactNode;
  requiredRole?: string;
}) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" replace />;
  return <>{children}</>;
}
```

---

## Step 10 - Build Each Screen

Use Storybook (`http://localhost:4400`) as your component reference while building. Key patterns:

**Import components like this:**

```tsx
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonType,
  Badge,
  BadgeColor,
  BadgeSize,
  Tab,
  TabGroup,
  Breadcrumb,
  BreadcrumbSize,
  InputField,
  Select,
  SelectOption,
} from '@nestjs-react-starter/ui-components';
```

**Common gotchas:**

- `BadgeColor` has: `Information`, `Success`, `Warning`, `Alert`, `Neutral` - there is **no** `Error`
- `Select` requires a `placeholder` prop
- `Sidebar` requires a `profilePicture` prop (pass `""` if unused)
- `Breadcrumb` duplicates the last item unless you set `breadcrumbSize={BreadcrumbSize.Two}` for 2-item breadcrumbs
- TypeScript's `exactOptionalPropertyTypes` is enabled - don't pass `undefined` to optional props; omit them or use conditional spread: `{...(condition ? { prop: value } : {})}`

**A minimal screen:**

```tsx
import { Button, ButtonColor, ButtonSize, ButtonType } from '@nestjs-react-starter/ui-components';
import { getAllProperties } from '../../data/dataLayer';

export default function DashboardPage() {
  const properties = getAllProperties();

  return (
    <div className="p-8">
      <h1 className="typography-font-title-xl text-[var(--client-primary-dark)]">Dashboard</h1>
      <p className="typography-font-body-sm text-[#6B7280] mt-1">{properties.length} properties</p>
    </div>
  );
}
```

`--client-primary-dark` is a CSS variable set by `clientTheme` (see below) - never hardcode a brand hex directly in a component.

**Typography classes** (from the design system):
| Class | Use |
|---|---|
| `typography-font-title-xl` | Page headings |
| `typography-font-title-lg` | Section headings |
| `typography-font-title-sm` | Card headings |
| `typography-font-body-sm` | Body text |
| `typography-font-body-xs` | Small/secondary text |
| `typography-font-label-sm` | Labels, tags |

**Color tokens** - use your client's tokens, never these literals. The neutrals below are design-system defaults and are safe to reuse; the brand colors MUST come from `clientTheme` (`apps/frontend-react/src/app/theme/clientTheme.ts`, see `SKILL.md`), not hardcoded hex:

| Token | Source |
|---|---|
| Primary brand | `clientTheme.primary` / `var(--client-primary)` - client-specific, do NOT hardcode |
| Dark / accent | `clientTheme.primaryDark` / `var(--client-primary-dark)` - client-specific |
| Body text | `#25272C` - design-system default |
| Secondary text | `#6B7280` - design-system default |
| Background | `#F5F7FA` - design-system default |
| Border | `#EDEEF1` - design-system default |

> Example only (ConEd BEUP 3.0): primary `#069BD7`, dark navy `#003B5C`. Do not reuse these for other clients.

---

## Step 11 - Build a Login Page with Quick-Fill Buttons

Always include quick-fill demo buttons so reviewers don't need to remember passwords:

```tsx
<button onClick={() => quickFill('user@example.com')}>
  <p className="typography-font-label-sm text-[var(--client-primary)]">Customer Account</p>
  <p className="typography-font-body-xs text-[#6B7280]">user@example.com</p>
</button>
```

The `quickFill` function sets credentials and immediately logs in:

```tsx
const quickFill = (email: string) => {
  setEmail(email);
  setTimeout(() => handleLogin(email), 50);
};
```

---

## Step 12 - Publish to Umbrage Pages

Prototypes publish to **Umbrage Pages**, not a third-party host, and via a **pull request**, not an
instant upload. The `/publish-pages` command builds the static bundle and opens a PR adding it as a
new project folder at `pages.umbrage.com/<project-name>/`:

```
/publish-pages
```

It asks for a project name, builds, opens the PR, and hands back the **PR link**. The prototype goes
live once that PR is reviewed and merged, same as any other change to that repo, there's no instant
link here.

There's also a `publish_preview` MCP tool that publishes instantly to a hashed
`preview.pages.umbrage.com/p/<hash>/` link. Don't use it for a prototype: Umbrage Pages leadership
confirmed that tool is for one-off static content (reports, recaps), not full React apps. A
production build's bundle is too large to pass through it anyway, git is both the sanctioned and the
only workable path here.

**What makes a build publishable.** The app is served at a sub-path with no server-side rewrites, so
the build needs:

- **Relative base** - `base: './'` in the Vite config, so asset URLs resolve at the sub-path.
- **HashRouter, not BrowserRouter** - client-side routing via `#/path`, so refreshes and deep links
  work without server rewrites. (Projects scaffolded by `/new-prototype` already use HashRouter.)

Binary assets (fonts, images) are fine as-is, there's no text-only constraint once you're publishing
through git.

`/publish-pages` handles the build and the PR for you (poc-template is already compliant;
nestjs-react-starter gets the static-safe build applied). See `commands/publish-pages.md` for the
full mechanics, the `projects/<name>/index.html`-at-root convention the repo expects, and the
still-open question of the exact repo name and access.

---

## Step 13 - Push to GitHub

The pre-push hook runs lint, type-check, and tests. Fix any errors it reports before pushing. Common issues:

```bash
# Check type errors in the frontend only (faster than full build)
node node_modules/.bin/tsc -p apps/frontend-react/tsconfig.app.json --noEmit

# Then push
git push -u origin main
```

If your machine doesn't have Go installed, the `backend-go` targets will fail. Exclude them in `.husky/pre-push`:

```sh
# Change this line:
yarn nx run-many -t test,lint,build
# To:
yarn nx run-many -t test,lint,build --exclude=backend-go
```

---

## Quick Reference

### Component cheat sheet

```tsx
// Button
<Button
  buttonSize={ButtonSize.Regular}      // Regular | Small
  buttonType={ButtonType.Primary}      // Primary | Secondary | Text
  buttonColor={ButtonColor.Main}       // Main | Alert
  text="Click me"
  onClick={() => {}}
/>

// Badge
<Badge
  size={BadgeSize.Small}               // Regular | Small
  color={BadgeColor.Success}           // Information | Success | Warning | Alert | Neutral
  text="Active"
/>

// InputField
<InputField
  label="Email"
  placeholder="you@example.com"
  value={value}
  onChange={e => setValue(e.target.value)}
/>

// Select
<Select
  label="Status"
  placeholder="Select status"
  widthClass="w-40"
  selected={selectedOption}
  options={[
    { label: 'Active', value: 'active', id: 0, disabled: false },
    { label: 'Inactive', value: 'inactive', id: 1, disabled: false },
  ]}
  isMultiSelect={false}
  onSelect={s => !Array.isArray(s) && setSelected(s)}
/>

// Breadcrumb (2 items - use BreadcrumbSize.Two to avoid duplicates)
<Breadcrumb
  breadcrumbSize={BreadcrumbSize.Two}
  onClick={url => navigate(url)}
  items={[
    { label: 'List', url: '/app/list' },
    { label: 'Detail', url: `/app/list/${id}` },
  ]}
/>

// Tabs
<TabGroup onTabClick={setActiveTab} containerClass="mb-6">
  <Tab label="Overview" index={0} />
  <Tab label="Details" index={1} />
</TabGroup>
{activeTab === 0 && <OverviewContent />}
{activeTab === 1 && <DetailsContent />}
```

### File structure for a typical prototype

```
apps/frontend-react/src/app/
├── auth/
│   └── AuthContext.tsx
├── data/
│   ├── types.ts
│   ├── seed.ts
│   └── dataLayer.ts
├── layouts/
│   ├── CustomerShell.tsx
│   └── AdminShell.tsx
├── pages/
│   ├── LoginPage.tsx
│   ├── customer/
│   │   ├── DashboardPage.tsx
│   │   ├── ListPage.tsx
│   │   └── DetailPage.tsx
│   └── admin/
│       ├── AdminDashboardPage.tsx
│       └── ManagementPage.tsx
└── app.tsx
```

---

## Example implementation (one client) - do not reuse its colors

The ConEd BEUP 3.0 prototype built with this guide is at:

- **Code:** `github.com/hamza-umbrage/beup-starter`
- **Live:** `beup-starter.vercel.app`
- **Screens:** 12 screens across customer + admin roles
