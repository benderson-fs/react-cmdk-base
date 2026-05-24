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
- **CSS-variable theme tokens** (`--pi-*`, `--cmdk-*`) for branding without overriding utility classes — plus an optional [`luz` theme overlay](#luz-theme) and [`luz` Tailwind palette](#luz-palette-tailwind-tokens) shipped as separate CSS imports
- **Tailwind v4 source** also shipped, so you can fork classes if needed
- **Zero icon-library dependency** — SVGs inlined; override via `icon` / `children` props
- `cmd/ctrl+K` shortcut helper

## Install

```bash
pnpm add react-cmdk-base @base-ui/react react react-dom
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

### Toolbar (recommended for control rows)

Use `<PromptInput.Toolbar>` whenever you have two or more controls (Add Attachments + Model picker + Submit, etc.). It provides arrow-key roving focus and the WAI-ARIA `toolbar` role automatically:

```tsx
import { Toolbar } from "@base-ui/react/toolbar";
import { PromptInput } from "react-cmdk-base";

<PromptInput.Toolbar>
  <Toolbar.Button render={<PromptInput.ActionMenuTrigger />} />
  <Toolbar.Button render={<PromptInput.ModelSelectTrigger label="GPT-4o" />} />
  <PromptInput.Submit />
</PromptInput.Toolbar>
```

For a single control, `<PromptInput.Tools>` (plain div) is fine — Toolbar without arrow-key navigation is an a11y anti-pattern.

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
  --cmdk-accent-bg: rgba(0, 0, 0, 0.06);
}
```

All theme-able properties are declared as CSS custom properties at the top of
each surface block in `src/styles.css`. The themed surfaces split into inline
(rendered in the document tree) and portaled (mounted at `<body>`, can't
inherit CSS variables from the logical parent):

- **Inline:** `.pi-root` (`--pi-*`), `.si-root` (`--si-*`)
- **Portaled:** `.cmdk-popup` (`--cmdk-*`), `.pi-menu-popup`
  (`--pi-menu-*`), `.pi-tooltip` (`--pi-tooltip-*`), `.si-results` /
  `.si-picker-popup` / `.si-tooltip` (`--si-*`, declared together since
  they share a token shape)

Override any `--cmdk-*` / `--pi-*` / `--pi-menu-*` / `--pi-tooltip-*` /
`--si-*` custom property to retheme.

Defaults follow the OS color scheme automatically.

### Luz theme

An opt-in visual theme that maps `CommandMenu` to a Spotlight-style toolbar
(always-dark, 20px corners, base-black bg, `product-purple-700` focus ring)
and `PromptInput` to a softer light/dark surface, modeled after the `@fs/luz`
design system. Pure CSS, no extra JS, no runtime dependency on `@fs/luz`.

**1.** Import the overlay alongside the base styles (order matters — overlay
must come second):

```ts
// Once, at your app entry:
import "react-cmdk-base/styles.css";
import "react-cmdk-base/themes/luz.css";
```

**2.** Activate by setting `data-theme="luz"` on any ancestor. In Next.js,
the simplest place is the root layout:

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="luz">
      <body>{children}</body>
    </html>
  );
}
```

Toggling between themes at runtime — e.g. for a settings panel — works by
`document.documentElement.setAttribute("data-theme", "luz")` inside an
effect. Combine with `.dark` on the same element to drive the dark variant.

**Behaviour**:

- **Token-overlay only** — every value the theme changes is a CSS custom
  property the base stylesheet already declares. Per-surface overrides
  documented above continue to work; they win because of the cascade order.
- **Portaled surfaces inherit via the ancestor selector.** `CommandMenu`'s
  popup, `PromptInput`'s action menu / model select popups, and tooltips
  all portal to `document.body`. Setting `data-theme="luz"` on `<html>`
  (or `<body>`) ensures every portaled surface is themed. Setting it on
  a non-ancestor wrapper will theme the inline surfaces but miss the
  popups.
- **CommandMenu is always-dark.** Spotlight is dark by design;
  `.dark`-mode toggling has no effect on the command menu under this
  theme.
- **PromptInput honors `.dark`.** Add the `.dark` class to the same
  element as `data-theme="luz"` (or any ancestor) to switch the prompt
  surface between luz's light and dark FilterToolbar variants.

### Luz palette (Tailwind tokens)

An opt-in companion to the Luz theme overlay. While `themes/luz.css`
re-skins the library's own surfaces, **`themes/luz-palette.css`**
registers the full luz design-system palette as Tailwind v4 `@theme`
tokens, so your own components can use luz-namespaced utility classes
directly:

```tsx
<button className="rounded-luz-button bg-luz-product-purple-700 text-luz-base-white shadow-luz-button-secondary hover:bg-luz-product-purple-accent">
  Take action
</button>
```

```ts
// Once, at your app entry — alongside the base styles:
import "react-cmdk-base/styles.css";
import "react-cmdk-base/themes/luz-palette.css";
```

Activation requires no attribute and no JS — Tailwind v4 reads the
`@theme` block at compile time and generates utilities only for the
tokens you actually reference in source. Unused tokens incur zero
output cost.

**What's registered:**

| Namespace | Utility prefix | Example |
| --- | --- | --- |
| `--color-luz-*` (80 tokens) | `bg-luz-`, `text-luz-`, `border-luz-`, `fill-luz-`, `stroke-luz-` | `bg-luz-product-purple-700`, `text-luz-base-gray-dark/80` |
| `--radius-luz-*` (10 tokens) | `rounded-luz-`, `rounded-t-luz-`, `rounded-tl-luz-`, … | `rounded-luz-toolbar`, `rounded-luz-button` |
| `--shadow-luz-*` (7 tokens) | `shadow-luz-` | `shadow-luz-heavy`, `shadow-luz-button-secondary` |
| `--ease-luz-*` (1 token) | `ease-luz-` | `ease-luz-button-action` |

**What's NOT registered** (and why):

- Font families — would require font assets the consumer hasn't loaded.
- Spacing — luz uses a 5px-based scale that would conflict with
  Tailwind's 4px default if applied to `--spacing`.
- Breakpoints — luz redefines `--breakpoint-xl: 1440px` which would
  silently shift the consumer's `xl:*` breakpoint.
- Animations — luz's `@keyframes` overlap with Tailwind defaults.

This file is **independent** from `themes/luz.css`. Use one, the other,
both, or neither. Hex values are inlined — no runtime dependency on
`@fs/luz`. If luz updates their palette, this file is frozen and must
be manually refreshed.

### Styling hooks (`data-slot`)

Every part renders a `data-slot="<family>-<part>"` attribute on its root DOM
element (e.g. `data-slot="command-menu-item"`, `data-slot="prompt-input-submit"`).
Use these as stable, framework-agnostic selectors when you'd rather target parts
by role than by classname — handy for Tailwind variant selectors, scoped CSS,
or testing. Existing classnames (`.cmdk-item`, `.pi-btn`, …) still drive the
shipped styles. Composing wrappers like `<PromptInput.ActionMenuTrigger>`
produce more specific slots (`prompt-input-action-menu-trigger`) so you can
target them without ambiguity.

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
| `asChild` | `boolean` | render the child element instead of the default row wrapper. When set, the child's natural accessible name (link text / button text) is preserved unless `aria-label` is set explicitly on Item |
| `forceMount` | `boolean` | render even when the query doesn't match (e.g. "Create new …" actions); doesn't count toward `matchCount` |
| `aria-label` | `string` | override the accessible name and the filter target. For icon-only items, pass to make them reachable by typing the visible/spoken name. asChild branch: only propagates to the child element when explicitly set (empty/whitespace = "no override") |

### Other parts

All parts below accept `className` and any standard HTML attributes for their root element (typically `<div>`); listed props are the component-specific ones.

- `<CommandMenu.Input>` — search input row with magnifier and breadcrumb chips. `placeholder?` (default `"Search…"`)
- `<CommandMenu.List>` — scrollable container
- `<CommandMenu.Page id searchPrefix?>` — drill-down section; only its children render when `page === id`
- `<CommandMenu.Group heading?>` — grouped items with a heading (sticky)
- `<CommandMenu.Empty alwaysRender?>` — auto-renders when the query is non-empty and zero items match; pass `alwaysRender` to force. `children?` (default `"No results"`)
- `<CommandMenu.Loading loading? label?>` — `role="progressbar"` placeholder for async fetches. `loading?` defaults to `true`; pass `loading={false}` to hide
- `<CommandMenu.Separator orientation?>` — visual + a11y separator between sections. `orientation?` defaults to `"horizontal"`
- `<CommandMenu.FreeSearch label? onSelect?>` — convenience item that appears whenever the query is non-empty. `label?` (default `"Search for"`)
- `<CommandMenu.Footer>` — bottom bar (e.g. keyboard hints)
- `<CommandMenu.Kbd>` — `<kbd>` chip
- `useCommandMenu()` — access query, page, popPage, matchCount, filter, etc. inside the menu
- `useCmdkShortcut(setOpen)` — wires cmd/ctrl+K. Calls `e.stopPropagation()` on intercepted shortcuts; invokes the setter as an updater (`c => !c`), so passing a non-Dispatch `(value: boolean) => void` setter will receive `true`/`false` as expected

### `useCommandMenu()`

Returns the command-menu context. Throws if used outside `<CommandMenu.Root>`.

| field | type | description |
| --- | --- | --- |
| `query` | `string` | current input value |
| `setQuery` | `(q: string) => void` | imperatively update the query |
| `page` | `string` | active page id |
| `popPage` | `() => void` | go back one level on the page stack |
| `searchPrefix` | `readonly string[]` | breadcrumb chips shown in `<Input>` |
| `matchCount` | `number` | number of items currently matching the query (excludes `forceMount` items) |
| `filter` | `(query, label, keywords) => boolean` | the resolved matcher (Root's `filter` prop or the default) |
| `close` | `() => void` | close the menu (same as `onOpenChange(false)`) |

Plus internal fields (`registerItem`, `registerMatch`, `unregisterMatch`, `fireSelect`, `setPage`, `setSearchPrefix`) for advanced custom parts. The page-navigation callbacks (`setPage`, `popPage`) have stable identity across renders — safe to pass to `React.memo`'d children.

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
    <PromptInput.Tools>{/* action menu, model select, etc. */}</PromptInput.Tools>
    <PromptInput.Submit />
  </PromptInput.Footer>
</PromptInput.Root>
```

The composition is identical to the standard layout — `Submit` stays
nested inside `Footer`. When the prompt is collapsed, `Footer` switches
to `display: contents` so its children become row siblings of `Body`.
`Tools` (and `Header` and `Attachments`) get the `hidden` HTML attribute,
so screen readers and tab navigation skip them; `Submit` remains visible
in the single-row layout. Transitions are CSS-only and respect
`prefers-reduced-motion`.

The Root element exposes two data attributes for styling hooks:

- `data-collapsible=""` — present whenever `collapsible` is on
- `data-state="expanded" | "collapsed"` — the current resolved state

Triggers (each one calls `onCollapsedChange`; in controlled mode the
caller decides whether to honor it):

- `pointerenter` on the root → expand.
- `focusin` (textarea or any descendant) → expand.
- `pointerleave` (after ~150ms debounce) → collapse, **if** text is empty,
  no attachments, status is not `submitted`/`streaming`, and nothing is
  focus-within.
- `Escape` while the textarea is focused → collapse + blur, same emptiness check. Escape originating from other descendants (open menus, buttons) is ignored so overlay dismissals don't also collapse the prompt.

Use `usePromptInput()` to read `collapsed` or call `setCollapsed()` from
custom children.

### `<PromptInput.Submit>`

Status-aware button. The default icon changes with `status` (Send → Spinner → Stop → close-glyph); pass `children` to override. Extends `React.ButtonHTMLAttributes<HTMLButtonElement>`.

| prop | type | description |
| --- | --- | --- |
| `status` | `PromptInputStatus` | override the context status (defaults to `ctx.status`) |
| `onStop` | `() => void` | called when clicked during `submitted`/`streaming` (and `onStop` is set), instead of submitting. When `onStop` is absent, the click is a no-op during those statuses — submission is already blocked at the form level |
| `asChild` | `boolean` | render the child element via [`Slot`](#composition-with-aschild) |

Renders a `data-status="<status>"` attribute and a status-specific `aria-label` (`"Send message"` / `"Submitting"` / `"Stop generating"` / `"Retry"`) for testing + styling hooks. Sets `type="submit"` by default and `type="button"` during `submitted`/`streaming` when `onStop` is wired (so the click handler runs instead of the form submitting).

### `<PromptInput.Button>`

Toolbar button. Extends `React.ButtonHTMLAttributes<HTMLButtonElement>`. Defaults `type="button"` (skipped when `asChild` is used so the child's `type` is preserved). Sets `data-variant={variant}` on the rendered element for styling hooks.

| prop | type | description |
| --- | --- | --- |
| `variant` | `"ghost" \| "default"` | visual variant (default `"ghost"`) |
| `pressed` | `boolean` | toggles `data-pressed` + `aria-pressed` (use for Search-style toggle buttons) |
| `asChild` | `boolean` | render the child element via Slot |
| `tooltip` | `string \| { content; shortcut?; side? }` | shorthand to wrap in `<PromptInput.Tooltip>` |

Any `data-slot` value passed via props lands directly on the rendered `<button>` element — wrapper components (such as `PromptInput.Picker`'s trigger) override the default `prompt-input-button` slot to advertise their own.

### `<PromptInput.Textarea>`

Auto-grow textarea via `field-sizing: content`, capped between 4rem and 12rem. Extends `React.TextareaHTMLAttributes<HTMLTextAreaElement>` minus `value`/`onChange` — text state is fully owned by Root; any consumer-supplied `value` / `defaultValue` is ignored. Hard-codes `rows={1}` so collapsed/empty heights render correctly. Defaults `aria-label` to the Root's `label` prop (`"Prompt input"`).

| prop | type | description |
| --- | --- | --- |
| `placeholder` | `string` | default `"What would you like to know?"` |

Behaviour: Enter submits (IME-safe; suppressed when `status` is `submitted` or `streaming`), Shift+Enter inserts newline, Backspace on empty removes the last attachment (only when not auto-repeating), paste with files in the clipboard adds them as attachments.

### `<PromptInput.Tooltip>`

Wrap a single child in a Base UI Tooltip. The shared `Tooltip.Provider` is auto-mounted by `<PromptInput.Root>`, so adjacent tooltips skip the open-delay. The positioner uses a fixed `sideOffset` of 6px (not configurable).

| prop | type | description |
| --- | --- | --- |
| `content` | `ReactNode` | tooltip body |
| `shortcut` | `string` | optional muted shortcut hint (e.g. `"⌘↵"`) |
| `side` | `"top" \| "right" \| "bottom" \| "left"` | positioning side (default `"top"`) |
| `className` | `string` | applied to `Tooltip.Popup` (the surface) |
| `children` | `ReactElement` | single trigger element |

### `<PromptInput.ActionMenu>` and sub-parts

Wraps Base UI's `Menu`. Used for the "+" affordance.

- `<PromptInput.ActionMenu>` — passes through to `Menu.Root` (controlled/uncontrolled open via `open`/`onOpenChange`)
- `<PromptInput.ActionMenuTrigger>` — uses `<PromptInput.Button>` as the trigger; defaults to a `+` icon and `aria-label="Open actions"`
- `<PromptInput.ActionMenuContent>` — popup container; `align?: "start" | "center" | "end"`, `side?`, `sideOffset?` (default `align="start"`, `side="top"`, `sideOffset={8}`), plus `collisionAvoidance?`, `collisionPadding?`, `sticky?` pass-through to Base UI's `Menu.Positioner` (see [Base UI docs](https://base-ui.com/react/components/menu#positioner))
- `<PromptInput.ActionMenuItem>` — `keepOpen?: boolean` keeps the menu open after click (default closes)
- `<PromptInput.AddAttachments>` — built-in `Menu.Item` that opens the file dialog; `label?` (default `"Add files"`), `icon?: ReactNode` (default paperclip)
- `<PromptInput.AddScreenshot>` — built-in `Menu.Item` that calls `navigator.mediaDevices.getDisplayMedia`, draws the captured frame to a canvas, and pushes the PNG as an attachment. Silently swallows `NotAllowedError` / `AbortError`. `label?` (default `"Take screenshot"`), `icon?: ReactNode` (default monitor)

### `<PromptInput.ModelSelect>` and sub-parts

Wraps Base UI's `Menu`. Used as a lightweight model picker.

- `<PromptInput.ModelSelect value? onValueChange?>` — controlled value selection. If `onValueChange` is omitted, selecting an item logs a dev warning.
- `<PromptInput.ModelSelectTrigger label?>` — `<PromptInput.Button>`-based trigger. `label` is rendered as the chip text. Defaults `aria-label="Model"`.
- `<PromptInput.ModelSelectContent>` — popup container; `align?` (default `"end"`), `side?` (default `"top"`), `sideOffset?` (default `8`), plus `collisionAvoidance?`, `collisionPadding?`, `sticky?` pass-through to Base UI's `Menu.Positioner`.
- `<PromptInput.ModelSelectItem value>` — `role="menuitemradio"` with `aria-checked`; selecting it calls `onValueChange(value)` after any consumer `onClick`.

### `PromptInput.Picker`

Generic single-value picker built on Base UI's `Select` primitive. Use this when the popup is purely "pick one value from a known list" — items announce as `option` inside a `listbox` (the WAI-ARIA-correct pattern for selection). For a popup that mixes selection with arbitrary action items, use [`PromptInput.ModelSelect`](#promptinputmodelselect) instead.

```tsx
import { PromptInput } from "react-cmdk-base";

<PromptInput.Picker defaultValue="gpt-4o">
  <PromptInput.PickerTrigger aria-label="Model" label="GPT-4o" />
  <PromptInput.PickerContent aria-label="Model">
    <PromptInput.PickerGroup>
      <PromptInput.PickerGroupLabel>OpenAI</PromptInput.PickerGroupLabel>
      <PromptInput.PickerItem value="gpt-4o">GPT-4o</PromptInput.PickerItem>
    </PromptInput.PickerGroup>
    <PromptInput.PickerGroup>
      <PromptInput.PickerGroupLabel>Anthropic</PromptInput.PickerGroupLabel>
      <PromptInput.PickerItem value="claude">Claude</PromptInput.PickerItem>
    </PromptInput.PickerGroup>
  </PromptInput.PickerContent>
</PromptInput.Picker>
```

**Trigger display:** Three options for what shows in the trigger:

1. **Manual** — pass `label` on `PickerTrigger`: `<PickerTrigger label="GPT-4o" />`. The label is rendered verbatim and does NOT auto-update with the selected item. For controlled state, drive `label` from your `value`-to-display-name map.
2. **Auto-derive via `items` prop on Picker** — omit `label`/`children` and pass `items={[{ value, label }, …]}` on `<PromptInput.Picker>`. `<Select.Value />` then auto-derives the display label from the selected item.
3. **Auto-derive via Select.Value's render-prop** — `<PickerTrigger><Select.Value>{(v) => LABELS[v] ?? v}</Select.Value></PickerTrigger>`. Lightest workaround when you want auto-update without restructuring to the `items` prop.

> ⚠️ With JSX-child items and no `label` prop, `<Select.Value />` serializes the raw value (e.g. `"gpt-4o"` instead of `"GPT-4o"`). Use one of the three patterns above.

> **Modal default:** `Picker` is modal by default (locks page scroll, blocks outside clicks). When nesting inside another modal (Dialog, CommandMenu, etc.), pass `modal={false}` on `<PromptInput.Picker>`.

Key differences from `ModelSelect`:

| | `PromptInput.ModelSelect` (Menu) | `PromptInput.Picker` (Select) |
|---|---|---|
| Base primitive | `Menu` | `Select` |
| Popup ARIA role | `menu` | `listbox` |
| Item ARIA role | `menuitemradio` | `option` |
| `defaultValue` | not supported | ✓ supported |
| Native form submission | no | ✓ via `name`/`form` |
| Auto-display in trigger | manual `label` prop | ✓ via `Select.Value` + `items` prop |
| Group support | no | ✓ Group + GroupLabel |
| Mixed selection + action items | ✓ supported | not supported (every item must be an `option`) |

**API:**

- `<PromptInput.Picker {...selectRootProps}>` — passes through all `Select.Root` props: `value`/`defaultValue`/`onValueChange`, `open`/`defaultOpen`/`onOpenChange`, `disabled`, `name`/`form`, `multiple`, `items`, `modal` (default `true`). See [Base UI Select.Root](https://base-ui.com/react/components/select).
- `<PromptInput.PickerTrigger label? aria-label?>` — `PromptInput.Button`-based trigger. `aria-label` defaults to `"Picker"`. See the three trigger-display options above.
- `<PromptInput.PickerContent align? side? sideOffset? collisionAvoidance? collisionPadding? sticky? aria-label?>` — popup container. Defaults `align="end"`, `side="top"`, `sideOffset={8}`. The `aria-label` is applied to the inner `Select.List` (the listbox).
- `<PromptInput.PickerItem value disabled?>` — `role="option"`. Selecting fires `Select.Root.onValueChange(value)` and closes the popup. Renders a check icon when selected.
- `<PromptInput.PickerGroup>` / `<PromptInput.PickerGroupLabel>` — labeled grouping for related options.
- `<PromptInput.PickerSeparator>` — visual + a11y separator between items or groups (new in 0.10.0). Renders a 1px divider using the popup's border token.

**Native form submission:**

When `name` is set on `<PromptInput.Picker>`, the current selected value is included in the form's submission via a hidden `<input>`:

```tsx
<form onSubmit={(e) => {
  e.preventDefault();
  const data = new FormData(e.currentTarget);
  console.log(data.get("model")); // "gpt-4o"
}}>
  <PromptInput.Picker name="model" defaultValue="gpt-4o">
    <PromptInput.PickerTrigger aria-label="Model" label="GPT-4o" />
    <PromptInput.PickerContent aria-label="Model">
      <PromptInput.PickerItem value="gpt-4o">GPT-4o</PromptInput.PickerItem>
      <PromptInput.PickerItem value="claude">Claude</PromptInput.PickerItem>
    </PromptInput.PickerContent>
  </PromptInput.Picker>
  <button type="submit">Send</button>
</form>
```

> ⚠️ With `name` set but no `defaultValue` (or `value`), an unsubmitted Picker contributes an empty-string entry — indistinguishable from a deliberate selection of an empty-string option. Pair `name` with either `defaultValue` or your own validation if the distinction matters.

### `<PromptInput.Attachments>`

Chip row that renders the current attachments. Auto-hides (via the `hidden` HTML attribute) when the parent `<Root collapsible>` is in its collapsed state. Extends `React.HTMLAttributes<HTMLDivElement>` (so `className`, `style`, and any standard div attribute work) plus:

| prop | type | description |
| --- | --- | --- |
| `alwaysRender` | `boolean` | render an empty row even with zero attachments (default `false` → returns `null`) |

Each chip shows an image thumbnail (for `image/*` files), filename, size, and a remove `<button>` with `aria-label="Remove <filename>"`.

### `<PromptInput.Body>` / `<PromptInput.Header>` / `<PromptInput.Footer>` / `<PromptInput.Tools>`

Styled `<div>` wrappers, all accepting `className` and any standard HTML div attributes:

- `<Body>` — textarea container (flex column). Plain.
- `<Header>` — wrap-flex container intended for above-the-textarea custom content. Auto-hides (via the `hidden` attribute) when the parent `<Root collapsible>` is collapsed.
- `<Footer>` — bottom bar with `Tools` on the left and `Submit` on the right. Switches to `display: contents` in the collapsed state so `Submit` becomes a sibling of `Body`.
- `<Tools>` — left-aligned button cluster inside Footer. Auto-hides when the parent `<Root collapsible>` is collapsed (same mechanism as `Header`).

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

Additionally, every component's `Props` type is exported (`PromptInputRootProps`, `PromptInputSubmitProps`, `PromptInputModelSelectProps`, etc.), as is `PromptInputContextValue` (the return shape of `usePromptInput()`) and `CommandMenuRootProps` / `CommandMenuItemProps` / etc. for the command-menu side. These exist for consumers that need to write wrapper components or `forwardRef` adapters.

---

## `SearchInput`

`SearchInput` is the third public namespace. It combines:

- The **collapsible single-row** look of `PromptInput` (one line by default; expands on hover/focus to show controls).
- The **popover results experience** of `CommandMenu` (Pages, Groups, Items, Empty, Loading, keyboard nav, drill-down).

Results appear *after the form is submitted* (Enter or the Submit button). Use it for embedded "search this section" affordances — not as a full `CommandMenu` replacement.

### Quick start

```tsx
import { SearchInput, type SearchInputMessage } from "react-cmdk-base";

function Header() {
  const handleSubmit = async (msg: SearchInputMessage) => {
    const res = await fetch(`/api/search?q=${encodeURIComponent(msg.query)}`);
    // …consumer surfaces results into Page/Group/Item
  };
  return (
    <SearchInput.Root onSubmit={handleSubmit}>
      <SearchInput.Input placeholder="Search…" />
      <SearchInput.Submit />
      <SearchInput.Results>
        <SearchInput.Page id="root">
          <SearchInput.Group heading="Docs">
            <SearchInput.Item value="useState" onSelect={(v) => router.push(`/docs/${v}`)}>
              useState
            </SearchInput.Item>
          </SearchInput.Group>
          <SearchInput.Empty>No results.</SearchInput.Empty>
        </SearchInput.Page>
      </SearchInput.Results>
    </SearchInput.Root>
  );
}
```

### Parts

| Part | Purpose |
|---|---|
| `SearchInput.Root` | `<form role="search">`. Owns the collapsible state, the `query` / `committedQuery` pair, status, scope, resultsOpen, and exposes a `formRef` to anchor the Results popover. |
| `SearchInput.Input` | `<input type="search" role="combobox">` with `aria-expanded` / `aria-controls` / `aria-haspopup="listbox"`. Reads `query` from context; submit fires the form. Does NOT filter — typing leaves results closed until Enter / Submit. |
| `SearchInput.Submit` | Status-aware submit button. Swaps to a Stop icon while `status="streaming"`. Disabled when query is empty and status is idle. |
| `SearchInput.Button` | Plain icon button used internally by Picker / asChild slots. Variants (`ghost` / `default`), `pressed`, `tooltip`. |
| `SearchInput.Tools` | Plain-`<div>` controls container. Hidden + inert + aria-hidden when collapsed. |
| `SearchInput.Toolbar` | WAI-ARIA `role="toolbar"` controls container with arrow-key roving focus. Hidden + inert + aria-hidden when collapsed. |
| `SearchInput.Tooltip` | Wraps a single button in a Base UI Tooltip. **Requires** a `<Tooltip.Provider>` from `@base-ui/react/tooltip` — `SearchInput.Root` does NOT include one. |
| `SearchInput.Picker` (+ `Trigger` / `Content` / `Item` / `Group` / `GroupLabel` / `Separator`) | Optional scope selector built on Base UI `Select`. Wire `value` / `onValueChange` through to `<Root scope onScopeChange>` to feed `scope` into the `SearchInputMessage`. |
| `SearchInput.Results` | Base UI `Popover` anchored to the form. Hosts `Combobox.Root` + `CommandCoreProvider` + `CommandCoreList` and renders Page/Group/Item children. Page state is owned by `Root` and reset to `"root"` on each successful submit (via `resetPage()`); the inner `CommandCoreProvider` is controlled and clears its back-stack on the external-nav-to-root effect branch, so drill-down resets cleanly without remounting. |
| `SearchInput.Page` (+ `Group` / `Item` / `Empty` / `Loading` / `Separator` / `FreeSearch`) | CommandMenu-style result parts. Mirror the existing CommandMenu API, just renamed. |
| `useSearchInput()` | Hook exposing `query`, `committedQuery`, `status`, `scope`, `collapsed`, `resultsOpen`, `submit()`, and refs/ids. |

### Behavior

- **Submit-only results.** Typing does NOT open the popup; only Enter or Submit click does. The popup's filter runs against `committedQuery`, not the live `query`.
- **Collapsible row.** Hover or focus expands the row to show Tools / Toolbar. Blurring + 150ms grace + empty input collapses again. Escape on an empty input also collapses.
- **Drill-down.** Items can call `useCommandCore().setPage("id")` (`import { useCommandCore } from "react-cmdk-base"` is intentionally NOT exposed — drill-down is typically driven via the Item's `onSelect` and a controlled `page` prop on Root). Backspace on the popup's empty Combobox input pops the page stack.
- **Status flow.** `idle | submitted | streaming | error`. The Submit button reflects the status and switches to a Stop affordance while in flight (when `onStop` is provided). A polite aria-live region announces "Searching" while in flight.
- **A11y.** `<form role="search">`, `<input role="combobox">` with `aria-expanded` / `aria-controls` / `aria-haspopup="listbox"`, `<Popover.Popup>` hosts the listbox. Collapsed controls get `aria-hidden` + `inert` so screen readers and keyboard navigation skip them.

## Upgrading

### 0.9.0 → 0.10.x

- **Type-level breaking change**: `PromptInputButtonProps`, `PromptInputSubmitProps`, and `PromptInputRootProps` no longer declare `ref` in the interface — the ref now arrives via `React.forwardRef`'s second arg. Consumers that destructured `ref` from these prop types should remove the destructure. Passing `ref={x}` in JSX is unchanged.
- The Slot composition rule for `undefined` child props is now scoped to event handlers only: writing `<button disabled={undefined}>` inside a `Slot` clears the prop (parent's `disabled` no longer wins for non-event props). Event handlers retain the parent-wins-when-child-undefined semantics.
- `CommandMenu` context's `searchPrefix` is now `readonly string[]` (was `string[]`). Code that called `searchPrefix.push(...)` on the context value will now be a type error — clone first.

### Upgrading 0.10.x → 0.11.0

- **No breaking changes.** SearchInput is purely additive — `CommandMenu` and `PromptInput` consumers see no API drift.
- Internally, `CommandMenu` now consumes a shared `internal/command-core/` primitive. If your code imports from `src/lib/context` or `src/hooks/use-command-menu` directly (not part of the public API), the modules still re-export the same types — but consider switching to the public `useCommandMenu` hook from `react-cmdk-base`.
- New optional exports: `SearchInput` namespace, `useSearchInput()` hook, and per-part exports for tree-shaking.
- The `CommandCoreProvider` gained a new optional `defaultQuery` prop used internally by `SearchInput.Results` to seed the popup's filter from `committedQuery`. CommandMenu consumers don't need to pass it.

## Migrating from `albingroen/react-cmdk@1.x`

This is a breaking rewrite — no compat shim is provided. Sketch of the changes:

| v1 | v2 |
| --- | --- |
| `<CommandPalette>` | `<CommandMenu.Root>` |
| `isOpen` / `onChangeOpen` | `open` / `onOpenChange` |
| `search`, `onChangeSearch` | managed internally |
| `<CommandPalette.List heading>` | `<CommandMenu.Group heading>` |
| `<CommandPalette.ListItem index onClick href>` | `<CommandMenu.Item value onSelect>` — or render an anchor/link directly via [`asChild`](#composition-with-aschild): `<CommandMenu.Item asChild value="docs"><Link href="/docs">Docs</Link></CommandMenu.Item>` |
| `filterItems`, `getItemIndex`, `renderJsonStructure` | removed (filtering is internal) |
| `icon: "HomeIcon"` (string) | `icon={HomeIcon}` (component) |
| heroicons + headlessui deps | dropped — bring your own icons |

## Repo layout

- `src/` — library source (`src/themes/` holds opt-in theme overlays such as `luz.css`)
- `dist/` — published JS/TS artefacts (`index.js`, `index.d.ts`)
- `styles.css`, `themes/luz.css`, `themes/luz-palette.css` — published CSS artefacts at the package root
- `tests/` — Vitest + RTL test suite
- `app/` — Next.js prototype demonstrating `CommandMenu` (`/`), `PromptInput` (`/prompt`), and the `luz` theme (`/luz`)

## License

MIT
