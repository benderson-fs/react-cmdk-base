# @benderson-fs/react-cmdk-base

A fast, accessible React command palette + AI-style prompt input built on [Base UI](https://base-ui.com) primitives.

Two top-level primitives:

- **`CommandMenu`** — `cmd/ctrl+K`-style palette with drill-down pages, groups, free-search fallback.
- **`PromptInput`** — chat-style composer with auto-grow textarea, attachments (file picker + drag/drop + paste), toolbar buttons, action menus, model selector, status-aware submit/stop.

Both are composable parts, Tailwind v4 styles, zero icon dependencies — bring your own.

## Features

- Accessible: full ARIA semantics, focus trap, scroll lock — courtesy of Base UI
- Drill-down pages with breadcrumb prefix and backspace-to-go-back
- Grouped items with headings and free-search fallback
- `cmd/ctrl+K` shortcut helper
- PromptInput: Enter-submit, Shift+Enter newline, drag/drop attachments, validation hooks, deferred URL revoke
- Tailwind v4 source you can override

## Install

This package is published to **GitHub Packages** (private). To install in another repo:

1. Generate a [classic personal access token](https://github.com/settings/tokens) with the `read:packages` scope.
2. Export it as `GITHUB_PACKAGES_TOKEN=<token>` in your shell (or your CI secret).
3. Add an `.npmrc` to the consuming repo:

   ```ini
   @benderson-fs:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_TOKEN}
   always-auth=true
   ```

4. Install:

   ```bash
   pnpm add @benderson-fs/react-cmdk-base @base-ui/react
   ```

5. Import the styles once:

   ```ts
   import "@benderson-fs/react-cmdk-base/styles.css";
   ```

## Publish (maintainers)

```bash
# One-time: PAT with `write:packages` scope
export GITHUB_PACKAGES_TOKEN=<token>

# Bump version in package.json, then:
pnpm publish
```

`prepublishOnly` runs `type-check`, `test`, and `build` first; `publishConfig` routes the upload at `npm.pkg.github.com`.

## Usage

```tsx
"use client";

import * as React from "react";
import { House, Cog, Layers } from "lucide-react";
import { CommandMenu, useCmdkShortcut } from "@benderson-fs/react-cmdk-base";

export function Palette() {
  const [open, setOpen] = React.useState(false);
  const [page, setPage] = React.useState("root");
  useCmdkShortcut(setOpen);

  return (
    <CommandMenu.Root
      open={open}
      onOpenChange={setOpen}
      page={page}
      onPageChange={setPage}
    >
      <CommandMenu.Input placeholder="Type a command…" />
      <CommandMenu.List>
        <CommandMenu.Page id="root">
          <CommandMenu.Group heading="Home">
            <CommandMenu.Item value="home" icon={House} onSelect={() => {}}>
              Home
            </CommandMenu.Item>
            <CommandMenu.Item value="settings" icon={Cog} onSelect={() => {}}>
              Settings
            </CommandMenu.Item>
            <CommandMenu.Item
              value="projects"
              icon={Layers}
              keepOpen
              onSelect={() => setPage("projects")}
            >
              Projects
            </CommandMenu.Item>
          </CommandMenu.Group>
          <CommandMenu.FreeSearch
            onSelect={(q) => console.log("search:", q)}
          />
        </CommandMenu.Page>

        <CommandMenu.Page id="projects" searchPrefix={["Projects"]}>
          {/* project items… */}
        </CommandMenu.Page>
      </CommandMenu.List>
    </CommandMenu.Root>
  );
}
```

## Theming

Both `CommandMenu` and `PromptInput` expose CSS custom properties on their root
element. Override them in your own stylesheet (or inline `style`):

```css
.pi-root {
  --pi-accent: oklch(0.62 0.21 264);     /* indigo */
  --pi-accent-fg: white;
  --pi-radius: 1rem;
}

.cmdk-popup {
  --cmdk-bg: #fafafa;
  --cmdk-accent: rgba(0, 0, 0, 0.06);
}
```

Available tokens:

- **PromptInput** — `--pi-bg`, `--pi-border`, `--pi-border-strong`,
  `--pi-text`, `--pi-text-muted`, `--pi-accent`, `--pi-accent-fg`,
  `--pi-radius`, `--pi-radius-inner`.
- **CommandMenu** — `--cmdk-bg`, `--cmdk-border`, `--cmdk-text`,
  `--cmdk-text-muted`, `--cmdk-accent`, `--cmdk-radius`.

Defaults follow the OS color scheme automatically.

## Composition with `asChild`

Several primitives accept `asChild` to delegate rendering to a custom element
while preserving the component's behaviour, ARIA, and styles. Supported on
`CommandMenu.Item`, `PromptInput.Button`, and `PromptInput.Submit`.

```tsx
<PromptInput.Submit asChild>
  <MyDesignSystemButton variant="primary">Send</MyDesignSystemButton>
</PromptInput.Submit>

<CommandMenu.Item value="docs" asChild>
  <Link href="/docs">Docs</Link>
</CommandMenu.Item>
```

The child must be a single React element. Parent and child event handlers
compose (parent runs first); the parent can call `event.preventDefault()` to
skip the child's handler. The child's `className` is appended to the
primitive's own classes; other props from the child win on collision so you
can override e.g. `type="button"`.

## API

### `<CommandMenu.Root>`

| prop | type | required | description |
| --- | --- | --- | --- |
| `open` | `boolean` | yes | controlled open state |
| `onOpenChange` | `(open: boolean) => void` | yes | open callback |
| `page` | `string` | no | controlled active page id (defaults to `"root"`) |
| `onPageChange` | `(page: string) => void` | no | required to drill down |
| `placeholder` | `string` | no | input placeholder |
| `label` | `string` | no | accessible dialog name (visually hidden), default `"Command menu"` |
| `loop` | `boolean` | no | arrow-key wrap, default `true` |

### `<CommandMenu.Item>`

| prop | type | description |
| --- | --- | --- |
| `value` | `string` | unique id within the active page |
| `onSelect` | `(value: string) => void` | fired on Enter or click |
| `keepOpen` | `boolean` | leave the menu open after selection (default `false`) |
| `icon` | `ComponentType<{ className?: string }>` | optional leading icon |
| `keywords` | `string[]` | extra search terms; `"*"` matches anything |
| `disabled` | `boolean` | aria-disabled and unhighlightable |
| `trailing` | `ReactNode` | text/element at the right of the row |

### Other parts

- `<CommandMenu.Input>` — search input row with magnifier and breadcrumb chips
- `<CommandMenu.List>` — scrollable container
- `<CommandMenu.Page id searchPrefix?>` — drill-down section; only its children render when `page === id`
- `<CommandMenu.Group heading?>` — grouped items with a heading
- `<CommandMenu.Empty>` — fallback content when query has no matches
- `<CommandMenu.FreeSearch label? onSelect?>` — convenience item that appears whenever the query is non-empty
- `<CommandMenu.Footer>` — bottom bar (e.g. keyboard hints)
- `<CommandMenu.Kbd>` — `<kbd>` chip
- `useCommandMenu()` — access query, page, popPage, etc. inside the menu
- `useCmdkShortcut(setOpen)` — wires cmd/ctrl+K

## Migrating from `react-cmdk` v1

This is a breaking rewrite — no compat shim is provided. Sketch of the changes:

| v1 | v2 |
| --- | --- |
| `<CommandPalette>` | `<CommandMenu.Root>` |
| `isOpen` / `onChangeOpen` | `open` / `onOpenChange` |
| `search`, `onChangeSearch` | managed internally |
| `<CommandPalette.List heading>` | `<CommandMenu.Group heading>` |
| `<CommandPalette.ListItem index onClick href>` | `<CommandMenu.Item value onSelect>` (anchors/links live inside `onSelect`) |
| `filterItems`, `getItemIndex`, `renderJsonStructure` | removed (filtering is internal) |
| `icon: "HomeIcon"` (string) | `icon={HomeIcon}` (component) |
| heroicons + headlessui deps | dropped — bring your own icons |

## Repo layout

- `src/` — library source
- `dist/` — published artefacts (`index.js`, `index.d.ts`, `styles.css`)
- `tests/` — Vitest + RTL smoke tests
- `app/` — Next.js 16 prototype that demonstrates pages, groups, icons, and free-search

## License

MIT
