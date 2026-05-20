# react-cmdk-base

A fast, accessible React command palette built on [Base UI](https://base-ui.com) primitives.

This is a clean-break rebuild of the original [`react-cmdk`](https://github.com/albingroen/react-cmdk) on top of Base UI's `Combobox` and `Dialog`. It ships a small set of composable parts, Tailwind v4 styles, and zero icon dependencies — bring your own.

## Features

- Accessible: full ARIA combobox + dialog semantics, focus trap, scroll lock — courtesy of Base UI
- Drill-down pages with a breadcrumb search prefix and backspace-to-go-back
- Grouped items with headings
- Free-search fallback action that always matches non-empty queries
- `cmd/ctrl+K` shortcut helper
- Tailwind v4 source you can override

## Install

```bash
pnpm add react-cmdk-base @base-ui/react
```

```ts
import "react-cmdk-base/styles.css";
```

## Usage

```tsx
"use client";

import * as React from "react";
import { House, Cog, Layers } from "lucide-react";
import { CommandMenu, useCmdkShortcut } from "react-cmdk-base";

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
