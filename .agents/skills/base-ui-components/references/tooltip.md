# Tooltip

Import: `import { Tooltip } from '@base-ui/react/tooltip'`

## When to use
- Brief hover/focus-only description of an icon-button or otherwise unlabeled control.
- For longer/interactive content or persistent help text, use `Popover` (interactive) or inline help text instead.
- Use `Tooltip.Provider` to share open/close delays so adjacent tooltips appear instantly after the first.

## Anatomy
```
Tooltip.Provider          // optional: shared timing for sibling tooltips
  Tooltip.Root
    Tooltip.Trigger
    Tooltip.Portal
      Tooltip.Positioner
        Tooltip.Popup
          Tooltip.Arrow
          Tooltip.Viewport   // optional: animated content swap across triggers
```

## Parts API

### Tooltip.Provider
Shares delay state across tooltips. Renders nothing.

**Props:** `delay` (number, ms), `closeDelay` (number, ms), `timeout` (number, default `400`; window during which adjacent tooltips open instantly after the previous closes), `children`.

### Tooltip.Root
Wires the tooltip together. Renders nothing.

**Props:**
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| defaultOpen | `boolean` | `false` | Initial open state (uncontrolled). |
| open | `boolean` | - | Controlled open state. |
| onOpenChange | `((open: boolean, eventDetails: Tooltip.Root.ChangeEventDetails) => void)` | - | Fired when open changes. |
| actionsRef | `React.RefObject<Tooltip.Root.Actions \| null>` | - | Imperative `unmount()` / `close()` actions. |
| defaultTriggerId | `string \| null` | - | Pre-associate the initial open tooltip with a trigger id (uncontrolled). |
| handle | `Tooltip.Handle<Payload>` | - | Attach via `createHandle()` to let detached triggers drive the tooltip. |
| onOpenChangeComplete | `((open: boolean) => void)` | - | Called after open/close animations finish. |
| triggerId | `string \| null` | - | Pre-associate a trigger id in controlled mode. |
| trackCursorAxis | `'none' \| 'x' \| 'y' \| 'both'` | `'none'` | Track the cursor along given axes. |
| disabled | `boolean` | `false` | Disable the entire tooltip. |
| disableHoverablePopup | `boolean` | `false` | Disallow hovering the popup itself (default permits it). |
| children | `React.ReactNode \| PayloadChildRenderFunction<Payload>` | - | Static node or `({ payload }) => ReactNode` for per-trigger content. |

`Root.Actions`: `{ unmount: () => void; close: () => void }`.

`ChangeEventReason`: `'trigger-hover' | 'trigger-focus' | 'trigger-press' | 'outside-press' | 'escape-key' | 'disabled' | 'imperative-action' | 'none'`. `ChangeEventDetails` adds `cancel()`, `allowPropagation()`, `isCanceled`, `isPropagationAllowed`, `trigger`, `preventUnmountOnClose`.

### Tooltip.Trigger
Anchor element. Renders `<button>`.

**Props:**
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| closeOnClick | `boolean` | `true` | Close on trigger click. |
| handle | `Tooltip.Handle<Payload>` | - | Associate with a handle (detached trigger pattern). |
| payload | `Payload` | - | Per-trigger data delivered to a Root's render-function children. |
| disabled | `boolean` | `false` | Skip open for this trigger (does not add the HTML `disabled` attribute — pass that via `render`). |
| delay | `number` | `600` | Open delay (ms). |
| closeDelay | `number` | `0` | Close delay (ms). |
| className, style, render | (state-driven) | - | Standard. |

**Data attributes:** `data-popup-open`, `data-trigger-disabled`.

### Tooltip.Portal
Portals popup to `<body>` (or `container`).

**Props:** `container` (`HTMLElement | ShadowRoot | RefObject | null`), `keepMounted` (default `false`), `className`, `style`, `render`.

### Tooltip.Positioner
Positions popup against trigger. Renders `<div>`.

**Props:** `disableAnchorTracking` (default `false`), `align` (`Align`, default `'center'`), `alignOffset` (`number | OffsetFunction`, default `0`), `side` (`Side`, default `'top'`), `sideOffset` (`number | OffsetFunction`, default `0`), `arrowPadding` (default `5`), `anchor` (`Element | VirtualElement | RefObject | () => Element | null | null`), `collisionAvoidance` (`{ side?: 'flip' | 'shift' | 'none'; align?: 'flip' | 'shift' | 'none'; fallbackAxisSide?: 'start' | 'end' | 'none' }`), `collisionBoundary` (default `'clipping-ancestors'`), `collisionPadding` (default `5`), `sticky` (default `false`), `positionMethod` (`'absolute' | 'fixed'`, default `'absolute'`), `className`, `style`, `render`.

**Data attributes:** `data-open`, `data-closed`, `data-anchor-hidden`, `data-align` (`'start' | 'center' | 'end'`), `data-side` (`'top' | 'bottom' | 'left' | 'right' | 'inline-end' | 'inline-start'`).

**CSS variables:** `--anchor-height`, `--anchor-width`, `--available-height`, `--available-width`, `--transform-origin`.

### Tooltip.Popup
The tooltip content container. Source says it renders `<div>`; semantically it's the WAI-ARIA tooltip element.

**Props:** `className`, `style`, `render`.

**Data attributes:** `data-open`, `data-closed`, `data-align`, `data-instant` (`'delay' | 'dismiss' | 'focus'`), `data-side`, `data-starting-style`, `data-ending-style`.

### Tooltip.Arrow
Anchor-pointer. Renders `<div>`.

**Props:** `className`, `style`, `render`.

**Data:** `data-open`, `data-closed`, `data-uncentered`, `data-align`, `data-instant`, `data-side`.

### Tooltip.Viewport
Animated content swap when a single Root is driven by multiple triggers. Renders `<div>`.

**Props:** `children`, `className`, `style`, `render`.

**Data:** `data-activation-direction` (`` `${'left'|'right'} ${'top'|'bottom'}` ``), `data-current` (entering / sole child), `data-instant`, `data-previous` (exiting child), `data-transitioning`.

**CSS variables:** `--popup-height`, `--popup-width` (set on the previous container to freeze dimensions during animation).

### Tooltip.createHandle / Tooltip.Handle
```ts
const handle = Tooltip.createHandle<Payload>();
// handle.isOpen: boolean (readonly)
// handle.open(triggerId: string): void  // call in handler/effect
// handle.close(): void
```
Used for "detached triggers" — multiple `Tooltip.Trigger`s elsewhere in the tree driving the same `Tooltip.Root`. Pass `handle` to both Root and each Trigger.

## Keyboard
| Key | Action |
| :--- | :--- |
| Tab to trigger | Open tooltip (after `delay`). |
| Shift+Tab off trigger | Close tooltip. |
| Esc | Close tooltip. |
| Click trigger | Close (when `closeOnClick`, default). |

Tooltips also open on `pointerenter` and close on `pointerleave` (with the respective delays). When `disableHoverablePopup` is false (default), the popup itself stays open while hovered.

## State
```tsx
// Uncontrolled
<Tooltip.Root defaultOpen>{/* ... */}</Tooltip.Root>

// Controlled
const [open, setOpen] = React.useState(false);
<Tooltip.Root open={open} onOpenChange={(next, details) => setOpen(next)} />
```

Use `actionsRef` to imperatively close/unmount:
```tsx
const actions = React.useRef<Tooltip.Root.Actions>(null);
<Tooltip.Root actionsRef={actions} />
actions.current?.close();
actions.current?.unmount(); // skip exit animation
```

## Animation
- `data-starting-style` / `data-ending-style` on `Popup` (and `Arrow`) for enter/exit.
- `data-instant` on Popup/Arrow/Viewport — present when the transition should be skipped (`'delay'`, `'dismiss'`, `'focus'`).
- Use `Tooltip.Viewport` with `data-current` / `data-previous` / `data-transitioning` to animate content swaps across multiple triggers; freeze previous dimensions with `--popup-width`/`--popup-height`.
- `Portal` defaults `keepMounted={false}`; set true to leave the popup in DOM between closes (required if exit animations need the previous-mount snapshot).
- In `ChangeEventDetails`, call `preventUnmountOnClose()` to keep DOM mounted after close (e.g., for view-transitions).

## Canonical example
```tsx
// Tailwind v4
import * as React from 'react';
import { Tooltip } from '@base-ui/react/tooltip';

const triggerClass =
  'flex size-8 items-center justify-center bg-transparent text-neutral-950 select-none data-popup-open:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-neutral-950 hover:bg-neutral-100 active:bg-neutral-200 dark:text-white dark:data-popup-open:bg-neutral-800 dark:hover:bg-neutral-800 dark:active:bg-neutral-700 dark:focus-visible:outline-white';

const popupClass =
  'flex flex-col border border-neutral-950 bg-white px-2 py-1 text-sm text-neutral-950 origin-[var(--transform-origin)] shadow-[0.25rem_0.25rem_0_rgb(0_0_0/12%)] transition-[transform,opacity] duration-100 ease-out data-ending-style:opacity-0 data-ending-style:scale-[0.98] data-instant:transition-none data-starting-style:opacity-0 data-starting-style:scale-[0.98] dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none';

const arrowClass =
  "relative block w-3 h-1.5 overflow-clip data-[side=bottom]:top-[-6px] data-[side=left]:right-[-9px] data-[side=left]:rotate-90 data-[side=right]:left-[-9px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-6px] data-[side=top]:rotate-180 before:content-[''] before:absolute before:bottom-0 before:left-1/2 before:w-[calc(6px*sqrt(2))] before:h-[calc(6px*sqrt(2))] before:bg-white dark:before:bg-neutral-950 before:border before:border-neutral-950 dark:before:border-white before:[transform:translate(-50%,50%)_rotate(45deg)]";

export default function ExampleTooltip() {
  return (
    <Tooltip.Provider>
      <div className="flex border border-neutral-950 bg-white dark:border-white dark:bg-neutral-950">
        <Tooltip.Root>
          <Tooltip.Trigger className={triggerClass} aria-label="Bold">
            <BoldIcon aria-hidden="true" />
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Positioner sideOffset={11}>
              <Tooltip.Popup className={popupClass}>
                <Tooltip.Arrow className={arrowClass} />
                Bold
              </Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip.Root>
      </div>
    </Tooltip.Provider>
  );
}

function BoldIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M3.73 2.13a.53.53 0 0 0 0 1.07h.53V12.8h-.53a.53.53 0 0 0 0 1.07h6.13a3.47 3.47 0 0 0 2.93-5.36 2.93 2.93 0 0 0-1.06-3.45A2.93 2.93 0 0 0 9.33 2.13H3.73Zm3.2 1.07h1.33a1.87 1.87 0 0 1 0 3.73H6.93V3.2Zm0 4.8h1.33a2.4 2.4 0 0 1 0 4.8H6.93V8Z" />
    </svg>
  );
}
```

## Gotchas
- Tooltips are for hover/focus-only descriptions. They are not appropriate for content that must be reachable by touch or keyboard alone — use `Popover` or inline text instead.
- `Trigger.disabled` short-circuits opening but does not add `disabled` to the rendered button. To visually disable, pass it via `render={<button disabled />}`.
- Wrap related tooltips in `Tooltip.Provider` so adjacent tooltips open instantly after the first (within `timeout`).
- **Delay configuration**: `Provider` and `Trigger` both expose `delay` and `closeDelay`. `Trigger` defaults are `600`/`0`; `Provider` defaults are undefined. Source doesn't document the precedence rule when both are set — set them at the `Provider` level to apply uniformly across siblings, or at the `Trigger` level for per-tooltip overrides, and verify the combined behaviour in your build before relying on it.
- **The "instant after first" mechanism**: when a tooltip closes and another opens within `Provider.timeout` (default `400ms`), Base UI sets `data-instant` on the new Popup/Arrow/Viewport. Combine with `data-instant:transition-none` in your className so the new tooltip skips the enter animation. (Source documents `data-instant` values `'delay' | 'dismiss' | 'focus'` but does not bind specific values to specific situations — match the attribute presence, not a specific value, for the cleanest CSS.)
- **`sideOffset` measurement** (per source): the gap is between the trigger and the `Popup` edge — not the arrow tip. The arrow extends out from the Popup. The Base UI canonical example uses `sideOffset={11}` with a 6×3px arrow; tune the number for your own arrow geometry.
- For toolbars, compose `Tooltip.Trigger render={<Toolbar.Button />}`. The Trigger is the outer wrapper.
- Multiple triggers driving one Root: use `createHandle()`, pass it to Root + each Trigger; use a `payload` prop to vary content via a Root render function. Animate the swap with `Tooltip.Viewport`.
- `keepMounted` on `Portal` is required for some animation libraries that need the popup to remain mounted; otherwise the default unmounts when closed.
- `disableHoverablePopup`: by default the popup itself is hoverable; turn this on to make the popup non-interactive (closes when leaving the trigger).
- `trackCursorAxis` is useful for following the cursor on long elements (e.g. progress bars) — combine with `side="top"` for natural feel.
