# react-cmdk-base — design

**Status:** approved-for-implementation
**Date:** 2026-05-20

## Goal

Rebuild the react-cmdk command-palette library on top of Base UI primitives. Ship a new package `react-cmdk-base` (clean break from v1) and a Next.js prototype in `app/` that exercises pages, groups, icons, and a free-search fallback action.

## Why Base UI

Base UI v1.5 ships a `Combobox` primitive with an `inline` mode that renders the list directly (no floating popup, no positioner). Composed with `Dialog`, it gives us — for free — keyboard navigation, ARIA combobox semantics, focus management, escape-to-close, modal scroll lock, and built-in client-side filtering. The library becomes a thin styling + page-stack layer on top.

## Package layout

```
react-cmdk/                              # repo root, npm package "react-cmdk-base"
├── src/
│   ├── index.ts                         # public exports
│   ├── command-menu.tsx                 # <CommandMenu> namespace re-export
│   ├── parts/
│   │   ├── root.tsx                     # Dialog + Combobox wiring + context
│   │   ├── input.tsx                    # styled Combobox.Input row
│   │   ├── list.tsx                     # Combobox.List wrapper
│   │   ├── page.tsx                     # renderless page filter + searchPrefix
│   │   ├── group.tsx                    # Combobox.Group + GroupLabel
│   │   ├── item.tsx                     # Combobox.Item + onSelect + keepOpen
│   │   ├── empty.tsx                    # Combobox.Empty wrapper
│   │   ├── free-search.tsx              # convenience Item for empty state
│   │   ├── footer.tsx                   # plain styled div under list
│   │   └── kbd.tsx                      # <kbd> chip
│   ├── hooks/
│   │   ├── use-command-menu.ts          # exposes query, page, setPage, popPage
│   │   └── use-cmdk-shortcut.ts         # cmd/ctrl+K toggle
│   ├── lib/
│   │   ├── context.ts                   # CommandMenuContext, PageContext
│   │   └── cn.ts                        # classnames helper
│   └── styles.css                       # Tailwind v4 source + @layer components
├── app/                                  # Next.js 16 prototype (workspace child)
│   ├── package.json                     # depends on "react-cmdk-base": "workspace:*"
│   ├── pnpm-workspace.yaml              # already present
│   └── app/page.tsx                     # demo with all 4 features
├── docs/superpowers/specs/
│   └── 2026-05-20-react-cmdk-base-design.md
└── package.json                          # name: "react-cmdk-base", version 0.1.0
```

**Workspace wiring:** `app/pnpm-workspace.yaml` already declares the root as a workspace package; `app/package.json` adds `"react-cmdk-base": "workspace:*"` and we drop the old direct base-ui dep there (it transits via the lib).

**Dependencies:**
- Library `peerDependencies`: `react ^18 || ^19`, `react-dom ^18 || ^19`, `@base-ui/react ^1.5`.
- Library `devDependencies`: TypeScript, Vitest, RTL, Tailwind v4, `@tailwindcss/cli` for building `styles.css`.
- Library deletes: `@headlessui/react`, `@heroicons/react` (icons become a render-prop / component-passing pattern; the library is icon-agnostic).
- Prototype `dependencies`: adds `lucide-react` for demo icons.

## Public API

```tsx
import { CommandMenu, useCmdkShortcut } from "react-cmdk-base";
import "react-cmdk-base/styles.css";

const [open, setOpen] = useState(false);
const [page, setPage] = useState("root");
useCmdkShortcut(setOpen);

<CommandMenu.Root
  open={open}
  onOpenChange={setOpen}
  page={page}
  onPageChange={setPage}
  placeholder="Search…"
>
  <CommandMenu.Input />
  <CommandMenu.List>
    <CommandMenu.Page id="root">
      <CommandMenu.Group heading="Home">
        <CommandMenu.Item
          value="home"
          icon={HomeIcon}
          onSelect={() => router.push("/")}
        >
          Home
        </CommandMenu.Item>
        <CommandMenu.Item
          value="projects"
          icon={StackIcon}
          keepOpen
          onSelect={() => setPage("projects")}
        >
          Projects
        </CommandMenu.Item>
      </CommandMenu.Group>
      <CommandMenu.Empty>
        <CommandMenu.FreeSearch
          onSelect={(q) => console.log("search for", q)}
        />
      </CommandMenu.Empty>
    </CommandMenu.Page>

    <CommandMenu.Page id="projects" searchPrefix={["Projects"]}>
      <CommandMenu.Group heading="Your projects">
        {projects.map(p => (
          <CommandMenu.Item key={p.id} value={p.id} onSelect={() => open(p)}>
            {p.name}
          </CommandMenu.Item>
        ))}
      </CommandMenu.Group>
    </CommandMenu.Page>
  </CommandMenu.List>

  <CommandMenu.Footer>…</CommandMenu.Footer>
</CommandMenu.Root>
```

### Part-by-part mapping to Base UI

| Library part | Base UI primitives used |
| --- | --- |
| `Root` | `Dialog.Root` + `Dialog.Portal` + `Dialog.Backdrop` + `Dialog.Popup` containing `Combobox.Root` with `inline`, `selectionMode="none"`, `autoHighlight="always"`, `openOnInputClick={false}`, `open` forced `true` while Dialog is open |
| `Input` | `Combobox.Input` wrapped in a flex row with magnifier icon + `searchPrefix` breadcrumb chips |
| `List` | `Combobox.List` (scrollable) |
| `Page` | renderless — only mounts children when active; pushes `searchPrefix` into context |
| `Group` | `Combobox.Group` + `Combobox.GroupLabel` + `Combobox.Collection`, or simpler children-based render |
| `Item` | `Combobox.Item` with required `value` (string), optional `icon`, `keepOpen`, `onSelect(value)`. Filtering uses base-ui's default contains-match against the item's text children plus `keywords`; we pass a custom `filter` to Root that ORs label-match and keyword-match |
| `Empty` | `Combobox.Empty` |
| `FreeSearch` | A pre-wired `Item` with `keywords: ["*"]` so it always matches when no other items do |
| `Footer` | plain `<div>` rendered as Dialog.Popup child after the Combobox |
| `Kbd` | styled `<kbd>` helper |

### Root props

| name | type | default | description |
| --- | --- | --- | --- |
| `open` | `boolean` | — | controlled open state |
| `onOpenChange` | `(open: boolean) => void` | — | open callback |
| `page` | `string` | `"root"` | controlled active page id |
| `onPageChange` | `(page: string) => void` | — | optional; required to drill down |
| `placeholder` | `string` | `"Search…"` | input placeholder |
| `label` | `string` | `"Command menu"` | accessible name (Dialog.Title, visually hidden) |
| `loop` | `boolean` | `true` | arrow-key wrap (maps to Combobox `loopFocus`) |
| `children` | `ReactNode` | — | parts |

### Item props

| name | type | default | description |
| --- | --- | --- | --- |
| `value` | `string` | — | unique within the active page; passed to `onSelect` |
| `keywords` | `string[]` | `[]` | extra search terms; `["*"]` matches anything |
| `keepOpen` | `boolean` | `false` | if true, menu stays open after selection |
| `icon` | `ComponentType<{ className?: string }>` | — | optional leading icon |
| `disabled` | `boolean` | `false` | renders aria-disabled, can't be highlighted |
| `onSelect` | `(value: string) => void` | — | fired on Enter or click |
| `children` | `ReactNode` | — | display label (string preferred for filtering) |

## Data flow

```
User types ──▶ Combobox.Input ──▶ onInputValueChange ──▶ query state in Root context
                                                          │
                                                          ▼ base-ui filters children
                                       List shows matching items, first auto-highlighted
                                                          │
                                                          ▼ ArrowUp/Down/Enter
                                       base-ui moves data-highlighted, Enter fires
                                                          │
                                                          ▼ onValueChange(value, details)
                                       Root finds matching Item by value → calls its
                                       onSelect → if !keepOpen → onOpenChange(false)
```

**Page stack:**
- `page` is controlled by the consumer. A ref-held history stack lets Backspace-on-empty-query and Escape pop back.
- `<Page>` reads context, mounts children only when `page === id`, and pushes `searchPrefix` into context on activation.
- Page change clears the input.

**Cross-page state:**
- Input query is reset on `page` change (matches v1).
- Highlighted index resets to first item on every page change and every query change.
- Selected value is unused (`selectionMode="none"`); the menu's purpose is firing `onSelect`, not remembering a choice.

## Styling

- Tailwind v4 source in `src/styles.css`; the build step uses `@tailwindcss/cli` to produce `dist/styles.css` shipped to npm.
- Component classes live under a `cmdk` namespace via `@layer components` so they don't collide with consumer Tailwind.
- Dark mode honours `prefers-color-scheme` by default; consumers can override via class strategy.
- All visual decisions follow the v1 look (rounded modal, soft shadow, grey-on-dark hierarchy) so the rebuild is visually familiar.

## Error handling

| Failure | Behaviour |
| --- | --- |
| Invalid `page` id (no matching `<Page>`) | Dev-only `console.warn`, render empty list |
| Missing `<Page id="root">` | Same — warn + empty |
| `Item.onSelect` throws | Don't catch — propagate. Menu still closes because `onValueChange` runs before user code |
| Consumer forgets `Dialog.Title` | Library renders visually-hidden default ("Command menu") so a11y is never broken |
| Filter returns no items and no `<Empty>` is provided | Combobox.Empty's default ("No results") renders |

## Accessibility

- Combobox role on the input, listbox role on the list, option role on items (free via base-ui).
- `aria-activedescendant` follows highlighted item.
- Dialog provides focus trap, escape-to-close, scroll lock.
- Visually-hidden `Dialog.Title` keeps the menu named for screen readers.
- `cmd/ctrl+K` shortcut binds at document level; consumers opt in via `useCmdkShortcut`.

## Testing strategy

**Library (Vitest + React Testing Library):**
- `filter`: typing filters items by label and keywords (`*` always matches).
- `navigation`: ArrowDown highlights next, ArrowUp wraps with `loop`, Enter fires `onSelect`.
- `pages`: `onPageChange` swaps active page, clears query, resets highlight; Backspace on empty input pops.
- `keepOpen`: selection with `keepOpen` does not call `onOpenChange(false)`.
- `useCmdkShortcut`: Mock keydown `meta+k` toggles state; respects `ctrl` on non-Mac.

**Prototype as integration test:** `app/app/page.tsx` exercises pages, groups, icons, empty state. Manual verification via `pnpm dev` is the acceptance check.

**No Storybook / no Chromatic** for v1 — the prototype replaces both for the rebuild.

## Prototype scope (`app/app/page.tsx`)

- A landing card with a "Press ⌘K" hint button that also toggles the menu on click.
- `useCmdkShortcut` wired to the open state.
- Root page with two groups:
  - **Home** — Home, Settings, Projects (drills into projects page, `keepOpen`).
  - **Other** — Developer settings, Privacy policy, Log out (with `keepOpen={false}` action).
- Projects page with `searchPrefix={["Projects"]}` and five fake projects.
- Empty state on root page wired to `<FreeSearch>` that `console.log`s the query.
- Icons from `lucide-react` (installed in `app/` only).
- Dark mode follows OS preference.

## Out of scope (v1)

- Multi-select (the menu is action-oriented; `selectionMode="none"`).
- Virtualisation (not needed at prototype scale; base-ui supports it if we add later).
- Custom render-link prop (router integration is the consumer's concern via `onSelect`).
- Storybook, Chromatic, prefix-selector PostCSS plugin — all removed.
- Backward-compat shim for v1 API.

## Migration notes (for v1 users, not implemented in v1)

- `<CommandPalette>` → `<CommandMenu.Root>` (props: `isOpen`/`onChangeOpen` → `open`/`onOpenChange`, `search`/`onChangeSearch` removed — managed internally).
- `<CommandPalette.List heading=>` → `<CommandMenu.Group heading=>`.
- `<CommandPalette.ListItem index= onClick= href=>` → `<CommandMenu.Item value= onSelect=>`. Anchors/links are now the consumer's job inside `onSelect`.
- `filterItems`, `getItemIndex`, `renderJsonStructure` — removed. Filtering is internal; indexing is gone.
- `icon: "HomeIcon"` string-by-name → `icon={HomeIcon}` component prop. The library no longer ships heroicons.

## Acceptance criteria

1. `react-cmdk/src/` rewritten to base-ui; old components and stories removed.
2. `react-cmdk/package.json` renamed to `react-cmdk-base`, deps reflect new peer-deps.
3. `app/app/page.tsx` demos all four features; `pnpm dev` in `app/` serves a working command menu.
4. Library unit tests pass: filter, navigation, pages, keepOpen, shortcut.
5. `pnpm type-check` and `pnpm build` pass in both library and `app/`.
6. README updated to reflect new API.
