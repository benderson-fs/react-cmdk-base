# Collapsible

Import: `import { Collapsible } from '@base-ui/react/collapsible'`

## When to use
- Show/hide a single region of content controlled by a trigger button.
- For multiple, coordinated sections with one expanded at a time use `Accordion` instead.
- For floating panels that overlay other content use `Popover` or `Dialog`.

## Anatomy
- `Collapsible.Root` — state container.
- `Collapsible.Trigger` — button that toggles the panel.
- `Collapsible.Panel` — region that expands/collapses; exposes height/width CSS vars for transitions.

```jsx
<Collapsible.Root>
  <Collapsible.Trigger />
  <Collapsible.Panel />
</Collapsible.Root>
```

## Parts API

### Collapsible.Root
Groups all parts. Renders a `<div>`.

**Props:**
- `defaultOpen` — `boolean` (`false`) — Initial open state when uncontrolled.
- `open` — `boolean` — Controlled open state.
- `onOpenChange` — `(open: boolean, eventDetails: Collapsible.Root.ChangeEventDetails) => void` — Fired on open/close.
- `disabled` — `boolean` (`false`) — Ignore user interaction.
- `className` — `string | ((state: Collapsible.Root.State) => string | undefined)`.
- `style` — `React.CSSProperties | ((state: Collapsible.Root.State) => React.CSSProperties | undefined)`.
- `render` — `ReactElement | ((props: HTMLProps, state: Collapsible.Root.State) => ReactElement)`.

### Collapsible.Trigger
Button that opens/closes the panel. Renders a `<button>`.

**Props:**
- `nativeButton` — `boolean` (`true`) — Set `false` if `render` swaps the button for a non-button element (e.g. `<div>`).
- `className` — `string | ((state: Collapsible.Trigger.State) => string | undefined)`.
- `style` — `React.CSSProperties | ((state: Collapsible.Trigger.State) => React.CSSProperties | undefined)`.
- `render` — `ReactElement | ((props: HTMLProps, state: Collapsible.Trigger.State) => ReactElement)`.

**Data attributes:**
- `data-panel-open` — present when the panel is open.

### Collapsible.Panel
Collapsible content region. Renders a `<div>`.

**Props:**
- `hiddenUntilFound` — `boolean` (`false`) — Uses `hidden="until-found"` so the browser's in-page search can reveal the panel. Overrides `keepMounted`.
- `keepMounted` — `boolean` (`false`) — Keep the panel in the DOM while closed (required for some exit transitions). Ignored when `hiddenUntilFound` is set.
- `className` — `string | ((state: Collapsible.Panel.State) => string | undefined)`.
- `style` — `React.CSSProperties | ((state: Collapsible.Panel.State) => React.CSSProperties | undefined)`.
- `render` — `ReactElement | ((props: HTMLProps, state: Collapsible.Panel.State) => ReactElement)`.

**Data attributes:**
- `data-open` — panel is open.
- `data-closed` — panel is closed.
- `data-starting-style` — animating in.
- `data-ending-style` — animating out.

**CSS variables:**
- `--collapsible-panel-height` — panel's measured height (px).
- `--collapsible-panel-width` — panel's measured width (px).

## Keyboard
| Key | Action |
| --- | --- |
| Space / Enter | Toggle the panel when `Trigger` is focused. |

## State
- Uncontrolled: `defaultOpen`.
- Controlled: `open` + `onOpenChange`. `eventDetails.reason` is `'trigger-press'` or `'none'`; details include `cancel()`, `allowPropagation()`, `isCanceled`, `isPropagationAllowed`, and `trigger`.
- All three Parts expose `{ open, disabled, transitionStatus }` (Panel state is the same shape).

## Animation
- Transition height/width by interpolating to/from `0` using `data-starting-style` and `data-ending-style`, with the actual size pinned via `--collapsible-panel-height` / `--collapsible-panel-width`.
- For exit transitions you must keep the panel mounted: set `keepMounted` (or `hiddenUntilFound`, which already keeps it in the DOM).
- When closed without `keepMounted` the panel is `hidden`; guard styles with `[&[hidden]:not([hidden='until-found'])]:hidden` if the closed state must remain non-interactive.

## Canonical example
```tsx
import * as React from 'react';
import { Collapsible } from '@base-ui/react/collapsible';

export default function ExampleCollapsible() {
  return (
    <Collapsible.Root className="flex min-h-36 w-48 flex-col justify-center text-neutral-950 dark:text-white">
      <Collapsible.Trigger className="group flex h-8 items-center justify-between gap-2 border border-neutral-950 bg-white pl-3 pr-2 text-sm select-none hover:not-data-disabled:bg-neutral-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:border-white dark:bg-neutral-950 dark:hover:not-data-disabled:bg-neutral-800">
        Recovery keys
        <Caret className="transition-transform duration-100 ease-out group-data-panel-open:rotate-90" />
      </Collapsible.Trigger>
      <Collapsible.Panel className="flex h-[var(--collapsible-panel-height)] flex-col justify-end overflow-hidden text-sm transition-[height] duration-150 ease-out [&[hidden]:not([hidden='until-found'])]:hidden data-ending-style:h-0 data-starting-style:h-0">
        <div className="flex flex-col gap-2 px-3.5 py-2">
          <div>alien-bean-pasta</div>
          <div>wild-irish-burrito</div>
          <div>horse-battery-staple</div>
        </div>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}

function Caret(props: React.ComponentProps<'svg'>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M6 12V4l4.5 4z" />
    </svg>
  );
}
```

## Gotchas
- `Collapsible.Panel` uses `display: flex/block` semantics; do not transition `height: auto` directly — use `var(--collapsible-panel-height)` plus `data-starting-style`/`data-ending-style` rules that set it to `0`.
- Without `keepMounted` the panel unmounts when closed, so exit transitions will not run unless `keepMounted` (or `hiddenUntilFound`) is set.
- `hiddenUntilFound` requires the panel to be in the DOM; it also lets browser find-in-page (Chromium) open the panel automatically.
- Setting `nativeButton={false}` on `Collapsible.Trigger` is only safe if you also swap the rendered element via `render` to a non-button (and you'll lose native button keyboard handling).
- When wiring inline arrow rotation, target `group-data-panel-open` on `Trigger` (not `data-open`, which lives on the panel).
