# Settings, multi-theme preferences, Tasks layout (updated)

## Goals (including latest feedback)

1. **Appearance**: Light / Dark / **System** (resolved), plus **multiple curated color themes** so users can pick a preset they like (not only one generic light and one generic dark).
2. **Settings entry**: From **sidebar profile** (bottom account button → menu), **Settings** opens a **single Settings area** where **all relevant options are visible** (scrollable page or hub with in-page sections)—not scattered only across separate routes without context.
3. **Header**: No theme toggle (moved into Settings).
4. **Tasks page**: Secondary tabs, toolbar, richer list (see earlier plan); optional read of “default tasks view” from preferences.

---

## Multi-theme / color presets (“best” light + dark)

**Interpretation:** One **appearance mode** (light / dark / system) still controls whether the UI uses light or dark **surfaces**. **Color presets** adjust **CSS design tokens** (the existing HSL variables in [`globals.css`](src/styles/globals.css): `--bg`, `--surface`, `--brand`, `--border`, etc.) so each preset looks polished in **both** modes.

**Implementation approach:**

- Add `data-theme` or `data-color-preset` on `document.documentElement` (e.g. `default`, `slate`, `warm`, `contrast`), persisted in `localStorage` next to appearance preference.
- In [`globals.css`](src/styles/globals.css), define token overrides per preset:
  - **`default`** — current BuildWire tokens (baseline).
  - **`slate`** — cool neutrals, slightly blue-gray surfaces (popular “modern SaaS” look).
  - **`warm`** — warm off-white / warm dark grays (paper-like light, cozy dark).
  - **`contrast`** — stronger borders and text contrast (accessibility-oriented).
- Each preset only redefines the **minimal set** of variables needed for a visible shift (background, surface, elevated, border, optional brand tint)—avoid rewriting the entire file.
- **Preferences UI**: In addition to the three **mode** cards (Light / Dark / System), add a **“Color theme”** subsection: **grid of preset cards** (name + one-line description + small dual preview: light half / dark half), single selection, included in the same **Save / Cancel** flow as appearance mode.

**Note:** “Best in the world” is subjective; the plan uses **4 named, tested presets** that map to clear design intents (neutral, cool, warm, high-contrast). More presets can be added later by extending the same mechanism.

**ThemeProvider responsibilities:**

- `appearancePreference`: `light | dark | system`
- `colorPreset`: string union of preset ids
- `resolvedAppearance`: `light | dark` (from preference + `matchMedia` when system)
- Apply: `classList` for `dark` from resolved appearance + `data-color-preset` attribute for tokens

---

## Settings page from sidebar profile (“all details visible”)

**Current:** [`AccountDropdown`](src/components/layout/AccountDropdown.tsx) opens from the **profile row** in the sidebar; it has “Settings” → `/settings/organization` only.

**Target:**

1. **Primary menu item:** **Settings** → **`/settings`** (main settings page).
2. **`/settings` page** — **one scrollable layout** (minimalist sections, clear headings) that includes:
   - **Profile** (read-only or placeholder: name, email, org from Redux/auth—no backend change required initially).
   - **Appearance** — mode cards (Light / Dark / System) + **color preset** grid + Save / Cancel.
   - **Preferences** (niche): date format, default tasks view, units, notification toggles (`localStorage` as in prior plan).
   - **Workspace / org** (conditional): **Organization**, **Roles**, **Billing**, **Bot integrations** — either **summary rows with “Manage →” links** to existing routes (`/settings/organization`, etc.) **or** short embedded descriptions + buttons so “everything is visible” at a glance without losing deep pages.

Optional: **sticky subnav** (anchor links) at top of `/settings` for long pages: Appearance | Preferences | Workspace.

3. Keep **`/settings/preferences`** as **optional**:
   - Either **redirect** `/settings/preferences` → `/settings#appearance` for bookmarks, **or** drop the separate route and use only `/settings`.

4. **Sidebar “Settings” group** (RBAC): Can still list deep links; **profile → Settings** is the main entry for “everything in one place.”

---

## Routing (summary)

- **`/settings`** — Main hub: profile, appearance, color presets, preferences, org summaries/links.
- **`/settings/organization`** — Existing deep page (unchanged).
- **`/settings/roles`**, **`/settings/billing`**, **`/settings/bot-integrations`** — Unchanged.

---

## Tasks page (unchanged intent from prior plan)

- Secondary tabs, toolbar, list enhancements (checkbox, avatar, progress, date), default view from preferences.

---

## Implementation todos (ordered)

1. **Theme system**: `light` / `dark` / `system` + `resolvedAppearance` + `matchMedia`.
2. **Color presets**: `data-color-preset` + CSS variable blocks in `globals.css` + persist preset id.
3. **`/settings` page**: Single page composing Profile, Appearance (mode + presets), Preferences, org deep-link sections; Save/Cancel for appearance block.
4. **AccountDropdown**: Settings → `/settings`; add **Organization** (or “Workspace”) link when RBAC allows, pointing to `/settings/organization`.
5. **Remove** [`ThemeToggle`](src/components/theme-toggle.tsx) from [`header.tsx`](src/components/layout/header.tsx) (keep component for rare reuse if needed).
6. **Sidebar**: Ensure profile menu copy matches (“Settings” = full hub).
7. **Tasks layout** improvements (tabs, toolbar, columns) + read default view from `localStorage`.

---

## Out of scope (this pass)

- Real API for user profile/theme sync.
- Custom user-imported themes or infinite theme marketplace.
