# Quick start

Bootstrap Base UI in a React app with `@base-ui/react`. All components are tree-shakable from a single package.

> Package note: previously published as `@base-ui-components/react`, now `@base-ui/react`. Always import from `@base-ui/react/<part>`.

## Install

```bash
pnpm add @base-ui/react
# npm i @base-ui/react
# yarn add @base-ui/react
# bun add @base-ui/react
```

Peer deps: `react`, `react-dom`. Source's quick-start doesn't publish a supported React-version range — check `package.json` for the actual pin (this repo pins React 19).

Base UI is **unstyled**, ships **no CSS**, and is compatible with Tailwind, CSS Modules, CSS-in-JS, or anything else. Components are imported from subpaths:

```ts
import { Popover } from '@base-ui/react/popover';
import { Menu } from '@base-ui/react/menu';
import { Field } from '@base-ui/react/field';
```

## App setup

### Portals (stacking context)

Popups (Dialog, Popover, Menu, Tooltip, etc.) render through portals. Add `isolation: isolate` to your root container (Tailwind's `isolate` class is equivalent) so the root creates a separate stacking context — portaled popups then always paint above app content without `z-index` conflicts:

```tsx title="layout.tsx"
<body>
  <div className="isolate">
    {children}
  </div>
</body>
```

### iOS 26+ Safari

iOS 26 lets content show under browser chrome. Backdrops use `position: absolute` and need `body { position: relative }`:

```css title="globals.css"
body { position: relative; }
```

## Smallest working example (Tailwind v4)

```tsx
import { Popover } from '@base-ui/react/popover';

export default function ExamplePopover() {
  return (
    <Popover.Root>
      <Popover.Trigger
        className="flex h-8 items-center justify-center border border-neutral-950 bg-white px-3 text-sm text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 data-popup-open:bg-neutral-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 dark:data-popup-open:bg-neutral-800 dark:focus-visible:outline-white"
      >
        Notifications
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8}>
          <Popover.Popup
            className="relative flex w-[var(--popup-width,auto)] max-w-[500px] flex-col gap-1 origin-[var(--transform-origin)] border border-neutral-950 bg-white p-3 text-neutral-950 outline-none shadow-[0.25rem_0.25rem_0] shadow-black/12 transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
          >
            <Popover.Arrow className="relative block w-3 h-1.5 overflow-clip data-[side=bottom]:top-[-6px] data-[side=left]:right-[-9px] data-[side=left]:rotate-90 data-[side=right]:left-[-9px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-6px] data-[side=top]:rotate-180 before:content-[''] before:absolute before:bottom-0 before:left-1/2 before:w-[calc(6px*sqrt(2))] before:h-[calc(6px*sqrt(2))] before:bg-white before:border before:border-neutral-950 dark:before:bg-neutral-950 dark:before:border-white before:[transform:translate(-50%,50%)_rotate(45deg)]" />
            <Popover.Title className="text-sm font-bold">Notifications</Popover.Title>
            <Popover.Description className="text-sm text-neutral-600 dark:text-neutral-400">
              You are all caught up. Good job!
            </Popover.Description>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
```

## Where styles come from

Base UI exposes three style hooks on every part — there is **no** stylesheet to import:

| Hook | Use case |
| :--- | :--- |
| `className` (string or function of `state`) | Apply utility classes / CSS module classes |
| `style` (object or function of `state`) | Inline styles |
| `data-*` attributes (e.g. `data-popup-open`, `data-side`, `data-checked`) | CSS targeting of internal state |
| CSS variables (e.g. `--transform-origin`, `--available-height`, `--anchor-width`, `--popup-width`) | Dynamic sizing/positioning values exposed by `Positioner`/`Popup` |

### Tailwind v4 note

Tailwind v4's arbitrary-attribute syntax pairs naturally with Base UI's data attributes:

- `data-popup-open:bg-neutral-100`
- `data-[side=bottom]:top-[-6px]`
- `data-starting-style:opacity-0` / `data-ending-style:opacity-0`
- `data-checked:bg-green-500`

CSS variables can be consumed via Tailwind's `[var(--…)]` arbitrary values: `origin-[var(--transform-origin)]`, `max-h-[var(--available-height)]`.

## Pre-styled options

[shadcn/ui](https://ui.shadcn.com/create?base=base) wraps Base UI with pre-styled components. The Base UI [Community](https://base-ui.com/react/overview/community) page lists other styled libraries.

## Next

- `references/composition.md` — `render` prop, multi-component composition
- `references/styling.md` — Tailwind v4 patterns, dark mode, CSS modules
- `references/animation.md` — `data-starting-style`/`data-ending-style`, Motion integration
- `references/forms.md` — `Field`/`Form`, validation, RHF, TanStack Form
