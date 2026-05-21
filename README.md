# react-cmdk-base

A fast, accessible React command palette + AI-style prompt input built on [Base UI](https://base-ui.com) primitives.

Two top-level primitives:

- **`CommandMenu`** — `cmd/ctrl+K`-style palette with drill-down pages, groups, custom filtering, and free-search fallback.
- **`PromptInput`** — chat-style composer with auto-grow textarea, attachments (file picker + drag/drop + paste), toolbar buttons with tooltips, action menus, model selector, and status-aware submit/stop.

Both expose composable parts, CSS-variable theme tokens, and `asChild` polymorphism. The library inlines its own SVG icons — no `lucide-react` / `heroicons` runtime dep.

See the full release history in [CHANGELOG.md](./CHANGELOG.md).

## Features

- **Accessible by default** — full ARIA combobox/listbox + dialog semantics, focus trap, scroll lock, all via Base UI
- **CommandMenu**: drill-down pages with breadcrumb prefix and backspace-to-go-back; grouped items with sticky headings; custom `filter` prop; `forceMount` for catch-all actions; auto-rendering `Empty`; `Loading` and `Separator` primitives; free-search fallback
- **PromptInput**: Enter-submit / Shift+Enter newline (IME-safe); drag/drop, paste, and file-picker attachments; deferred object-URL revoke; status-aware Submit (ready / submitted / streaming / error) with Stop affordance; tooltip wrapper; screen-capture menu item
- **`asChild` composition** on `CommandMenu.Item`, `PromptInput.Button`, and `PromptInput.Submit` — render your own design-system element while keeping primitive behaviour
- **CSS-variable theme tokens** (`--pi-*`, `--cmdk-*`) for branding without overriding utility classes
- **Tailwind v4 source** also shipped, so you can fork classes if needed
- **Zero icon-library dependency** — SVGs inlined; override via `icon` / `children` props
- `cmd/ctrl+K` shortcut helper

## Install

```bash
pnpm add react-cmdk-base @base-ui/react
```

Import the styles once at your app entry:

```ts
import "react-cmdk-base/styles.css";
```

React 18 or 19 is required (declared as a peer dependency).

## Publish (maintainers)

```bash
# Bump version in package.json, then:
pnpm publish
```

`prepublishOnly` runs `type-check`, `test`, and `build` first.

## Usage

### CommandMenu

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

### PromptInput

```tsx
"use client";

import * as React from "react";
import { Globe } from "lucide-react";
import {
  PromptInput,
  type PromptInputMessage,
  type PromptInputStatus,
} from "react-cmdk-base";

const MODELS = [
  { id: "gpt-4o", name: "GPT-4o" },
  { id: "claude-sonnet-4", name: "Claude 4 Sonnet" },
] as const;

export function Composer() {
  const [model, setModel] = React.useState<string>("gpt-4o");
  const [search, setSearch] = React.useState(false);
  const [status, setStatus] = React.useState<PromptInputStatus>("ready");

  const handleSubmit = React.useCallback(
    async (msg: PromptInputMessage) => {
      if (!msg.text.trim() && msg.files.length === 0) return;
      setStatus("submitted");
      // …send msg.text and msg.files to your backend…
      setStatus("ready");
    },
    [],
  );

  return (
    <PromptInput.Root onSubmit={handleSubmit} multiple status={status}>
      <PromptInput.Attachments />
      <PromptInput.Body>
        <PromptInput.Textarea placeholder="Ask anything…" />
      </PromptInput.Body>
      <PromptInput.Footer>
        <PromptInput.Tools>
          <PromptInput.ActionMenu>
            <PromptInput.ActionMenuTrigger />
            <PromptInput.ActionMenuContent>
              <PromptInput.AddAttachments label="Add files" />
              <PromptInput.AddScreenshot label="Take screenshot" />
            </PromptInput.ActionMenuContent>
          </PromptInput.ActionMenu>

          <PromptInput.Button
            pressed={search}
            onClick={() => setSearch((s) => !s)}
            tooltip={{ content: "Web search", shortcut: "⌘/" }}
          >
            <Globe />
            <span>Search</span>
          </PromptInput.Button>

          <PromptInput.ModelSelect value={model} onValueChange={setModel}>
            <PromptInput.ModelSelectTrigger
              label={MODELS.find((m) => m.id === model)?.name ?? "Model"}
            />
            <PromptInput.ModelSelectContent>
              {MODELS.map((m) => (
                <PromptInput.ModelSelectItem key={m.id} value={m.id}>
                  {m.name}
                </PromptInput.ModelSelectItem>
              ))}
            </PromptInput.ModelSelectContent>
          </PromptInput.ModelSelect>
        </PromptInput.Tools>

        <PromptInput.Submit onStop={() => setStatus("ready")} />
      </PromptInput.Footer>
    </PromptInput.Root>
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
| `filter` | `(query, label, keywords) => boolean` | no | custom matcher; defaults to substring + keyword `includes` |

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
| `asChild` | `boolean` | render the child element instead of the default row wrapper |
| `forceMount` | `boolean` | render even when the query doesn't match (e.g. "Create new …" actions); doesn't count toward `matchCount` |

### Other parts

- `<CommandMenu.Input>` — search input row with magnifier and breadcrumb chips
- `<CommandMenu.List>` — scrollable container
- `<CommandMenu.Page id searchPrefix?>` — drill-down section; only its children render when `page === id`
- `<CommandMenu.Group heading?>` — grouped items with a heading (sticky)
- `<CommandMenu.Empty alwaysRender?>` — auto-renders when the query is non-empty and zero items match; pass `alwaysRender` to force
- `<CommandMenu.Loading loading? label?>` — `role="progressbar"` placeholder for async fetches
- `<CommandMenu.Separator orientation?>` — visual + a11y separator between sections
- `<CommandMenu.FreeSearch label? onSelect?>` — convenience item that appears whenever the query is non-empty
- `<CommandMenu.Footer>` — bottom bar (e.g. keyboard hints)
- `<CommandMenu.Kbd>` — `<kbd>` chip
- `useCommandMenu()` — access query, page, popPage, matchCount, filter, etc. inside the menu
- `useCmdkShortcut(setOpen)` — wires cmd/ctrl+K

### `useCommandMenu()`

Returns the command-menu context. Throws if used outside `<CommandMenu.Root>`.

| field | type | description |
| --- | --- | --- |
| `query` | `string` | current input value |
| `setQuery` | `(q: string) => void` | imperatively update the query |
| `page` | `string` | active page id |
| `popPage` | `() => void` | go back one level on the page stack |
| `searchPrefix` | `string[]` | breadcrumb chips shown in `<Input>` |
| `matchCount` | `number` | number of items currently matching the query (excludes `forceMount` items) |
| `filter` | `(query, label, keywords) => boolean` | the resolved matcher (Root's `filter` prop or the default) |
| `close` | `() => void` | close the menu (same as `onOpenChange(false)`) |

Plus internal fields (`registerItem`, `registerMatch`, `unregisterMatch`, `fireSelect`, `setPage`, `setSearchPrefix`) for advanced custom parts.

---

## PromptInput API

### `<PromptInput.Root>`

Renders a `<form>` and owns text + attachment state. Extends `React.FormHTMLAttributes<HTMLFormElement>` (so any standard form attribute works) minus `onSubmit`, `onError`, and `defaultValue` which are typed below.

| prop | type | required | description |
| --- | --- | --- | --- |
| `onSubmit` | `(msg: PromptInputMessage, e: FormEvent) => void \| Promise<void>` | yes | called on Enter or Submit click. Reject the returned promise to keep user content for retry |
| `accept` | `string` | no | hidden file-input `accept` filter (e.g. `"image/*,.pdf"`) |
| `multiple` | `boolean` | no | allow multi-file selection |
| `maxFiles` | `number` | no | cap on total attachments; extras fire `onError({ code: "max_files" })` |
| `maxFileSize` | `number` | no | per-file byte limit; over-size files fire `onError({ code: "max_file_size" })` |
| `globalDrop` | `boolean` | no | listen for drops on `document` instead of just the form |
| `fileInputName` | `string` | no | `name` for the hidden file input (only matters if you bypass `onSubmit`) |
| `onError` | `(err: PromptInputErrorEvent) => void` | no | fired once per `addFiles` call when any file is rejected |
| `value` | `string` | no | controlled textarea value |
| `onValueChange` | `(value: string) => void` | no | text change callback |
| `defaultValue` | `string` | no | uncontrolled initial textarea value |
| `label` | `string` | no | accessible name for the form (default `"Prompt input"`) |
| `status` | `PromptInputStatus` | no | one of `ready` / `submitted` / `streaming` / `error`; `submitted`/`streaming` block Enter |
| `collapsible` | `boolean` | no | opt in to the [collapsible state](#collapsible-state) (default `false`) |
| `collapsed` | `boolean` | no | controlled collapsed state |
| `defaultCollapsed` | `boolean` | no | uncontrolled initial collapsed state (default `true` when `collapsible`) |
| `onCollapsedChange` | `(collapsed: boolean) => void` | no | fires when the collapsed state should change |

### Collapsible state

Opt into a single-row composer that animates open on hover or focus. Useful
for floating prompts and persistent toolbars where you don't want the
textarea taking up vertical space until the user engages.

```tsx
<PromptInput.Root onSubmit={handleSubmit} collapsible>
  <PromptInput.Body>
    <PromptInput.Textarea />
  </PromptInput.Body>
  <PromptInput.Footer>
    <PromptInput.Tools />
  </PromptInput.Footer>
  <PromptInput.Submit />
</PromptInput.Root>
```

**Important:** render `<PromptInput.Submit>` as a Root-level sibling, not
nested inside `<Footer>`. In the collapsed single-row layout, `<Footer>`
gets the `hidden` HTML attribute — anything inside it disappears with it.
Keeping Submit outside guarantees it stays visible.

When collapsed, `<PromptInput.Header>`, `<PromptInput.Footer>`,
`<PromptInput.Tools>`, and `<PromptInput.Attachments>` get the `hidden`
attribute so screen readers and tab navigation skip them. The textarea
clamps to a single visible row. Transitions are CSS-only and respect
`prefers-reduced-motion`.

Triggers (each one calls `onCollapsedChange`; in controlled mode the
caller decides whether to honor it):

- `pointerenter` on the root → expand.
- `focusin` (textarea or any descendant) → expand.
- `pointerleave` (after ~150ms debounce) → collapse, **if** text is empty,
  no attachments, status is not `submitted`/`streaming`, and nothing is
  focus-within.
- `Escape` while focused → collapse + blur, same emptiness check.

Use `usePromptInput()` to read `collapsed` or call `setCollapsed()` from
custom children.

### `<PromptInput.Submit>`

Status-aware button. Shows Send → Spinner → Stop → Retry icons based on `status`. Extends `React.ButtonHTMLAttributes<HTMLButtonElement>`.

| prop | type | description |
| --- | --- | --- |
| `status` | `PromptInputStatus` | override the context status (defaults to `ctx.status`) |
| `onStop` | `() => void` | called when clicked during `submitted`/`streaming` instead of submitting |
| `asChild` | `boolean` | render the child element via [`Slot`](#composition-with-aschild) |

### `<PromptInput.Button>`

Toolbar button. Extends `React.ButtonHTMLAttributes<HTMLButtonElement>`.

| prop | type | description |
| --- | --- | --- |
| `variant` | `"ghost" \| "default"` | visual variant (default `"ghost"`) |
| `pressed` | `boolean` | toggles `data-pressed` + `aria-pressed` (use for Search-style toggle buttons) |
| `asChild` | `boolean` | render the child element via Slot |
| `tooltip` | `string \| { content; shortcut?; side? }` | shorthand to wrap in `<PromptInput.Tooltip>` |

### `<PromptInput.Textarea>`

Auto-grow textarea via `field-sizing: content`, capped between 4rem and 12rem. Extends `React.TextareaHTMLAttributes<HTMLTextAreaElement>` minus `value`/`onChange` (managed via Root's `value`/`onValueChange`).

| prop | type | description |
| --- | --- | --- |
| `placeholder` | `string` | default `"What would you like to know?"` |

Behaviour: Enter submits (IME-safe), Shift+Enter inserts newline, Backspace on empty removes the last attachment (only when not auto-repeating), paste with files in the clipboard adds them as attachments.

### `<PromptInput.Tooltip>`

Wrap a single child in a Base UI Tooltip. The shared `Tooltip.Provider` is auto-mounted by `<PromptInput.Root>`, so adjacent tooltips skip the open-delay.

| prop | type | description |
| --- | --- | --- |
| `content` | `ReactNode` | tooltip body |
| `shortcut` | `string` | optional muted shortcut hint (e.g. `"⌘↵"`) |
| `side` | `"top" \| "right" \| "bottom" \| "left"` | positioning side (default `"top"`) |
| `delay` | `number` | reserved; configure on a parent `Tooltip.Provider` instead |
| `children` | `ReactElement` | single trigger element |

### `<PromptInput.ActionMenu>` and sub-parts

Wraps Base UI's `Menu`. Used for the "+" affordance.

- `<PromptInput.ActionMenu>` — passes through to `Menu.Root` (controlled/uncontrolled open via `open`/`onOpenChange`)
- `<PromptInput.ActionMenuTrigger>` — uses `<PromptInput.Button>` as the trigger; defaults to a `+` icon and `aria-label="Open actions"`
- `<PromptInput.ActionMenuContent>` — popup container; `align?: "start" | "center" | "end"`, `side?`, `sideOffset?` (default `align="start"`, `side="top"`, `sideOffset={8}`)
- `<PromptInput.ActionMenuItem>` — `keepOpen?: boolean` keeps the menu open after click (default closes)
- `<PromptInput.AddAttachments>` — built-in `Menu.Item` that opens the file dialog; `label?` (default `"Add files"`), `icon?: ReactNode` (default paperclip)
- `<PromptInput.AddScreenshot>` — built-in `Menu.Item` that calls `navigator.mediaDevices.getDisplayMedia`, draws the captured frame to a canvas, and pushes the PNG as an attachment. Silently swallows `NotAllowedError` / `AbortError`. `label?` (default `"Take screenshot"`), `icon?: ReactNode` (default monitor)

### `<PromptInput.ModelSelect>` and sub-parts

Wraps Base UI's `Menu`. Used as a lightweight model picker.

- `<PromptInput.ModelSelect value? onValueChange?>` — controlled value selection. If `onValueChange` is omitted, selecting an item logs a dev warning.
- `<PromptInput.ModelSelectTrigger label?>` — `<PromptInput.Button>`-based trigger. `label` is rendered as the chip text. Defaults `aria-label="Model"`.
- `<PromptInput.ModelSelectContent>` — popup container; `align?` (default `"end"`), `side?` (default `"top"`), `sideOffset?` (default `8`).
- `<PromptInput.ModelSelectItem value>` — `role="menuitemradio"` with `aria-checked`; selecting it calls `onValueChange(value)` after any consumer `onClick`.

### `<PromptInput.Attachments>`

Chip row that renders the current attachments. Reads from context — no props beyond:

| prop | type | description |
| --- | --- | --- |
| `alwaysRender` | `boolean` | render an empty row even with zero attachments (default `false` → returns `null`) |

Each chip shows an image thumbnail (for `image/*` files), filename, size, and a remove `<button>` with `aria-label="Remove <filename>"`.

### `<PromptInput.Body>` / `<PromptInput.Header>` / `<PromptInput.Footer>` / `<PromptInput.Tools>`

Plain styled `<div>` wrappers, all accepting `className` and any standard HTML div attributes:

- `<Body>` — textarea container (flex column)
- `<Header>` — chips row above the textarea (wrap-flex)
- `<Footer>` — bottom bar with `Tools` on the left and `Submit` on the right
- `<Tools>` — left-aligned button cluster inside Footer

### `usePromptInput()`

Returns the prompt-input context. Throws if used outside `<PromptInput.Root>`.

| field | type | description |
| --- | --- | --- |
| `text` | `string` | current textarea value |
| `setText` | `(v: string) => void` | imperatively update text (calls `onValueChange`) |
| `attachments` | `PromptInputAttachment[]` | current files |
| `addFiles` | `(files: File[] \| FileList) => void` | append files (applies accept/maxFiles/maxFileSize, fires `onError`) |
| `removeFile` | `(id: string) => void` | remove by attachment id |
| `clearFiles` | `() => void` | clear all and revoke object URLs |
| `openFileDialog` | `() => void` | trigger the hidden file input |
| `status` | `PromptInputStatus` | current status from Root |
| `label` | `string` | accessible form label |
| `collapsible` | `boolean` | whether Root was rendered with `collapsible` |
| `collapsed` | `boolean` | current collapsed state (always `false` when not collapsible) |
| `setCollapsed` | `(next: boolean) => void` | request a collapsed-state change; honors controlled/uncontrolled |

### Exported types

| type | shape |
| --- | --- |
| `PromptInputStatus` | `"ready" \| "submitted" \| "streaming" \| "error"` |
| `PromptInputMessage` | `{ text: string; files: PromptInputAttachment[] }` |
| `PromptInputAttachment` | `{ id; filename; mediaType; size; url; file: File }` |
| `PromptInputErrorEvent` | `{ code: "max_files" \| "max_file_size" \| "accept"; message: string }` |
| `PromptInputButtonVariant` | `"ghost" \| "default"` |

## Migrating from `albingroen/react-cmdk@1.x`

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
- `tests/` — Vitest + RTL test suite (~55 tests)
- `app/` — Next.js 16 prototype demonstrating both `CommandMenu` (`/`) and `PromptInput` (`/prompt`)

## License

MIT
