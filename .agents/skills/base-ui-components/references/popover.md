# Popover

Import: `import { Popover } from '@base-ui/react/popover'`

## When to use
- Inline floating panel triggered by a button (click or hover).
- Supports multiple triggers via `Popover.Handle` + `Popover.createHandle()` for detached/shared popovers.
- Use `Dialog` for modal flows, `Menu` for action lists, `Tooltip` for short hover hints.

## Anatomy
- `Popover.Root` (renders no element)
  - `Popover.Trigger` (one or more)
  - `Popover.Portal`
    - `Popover.Backdrop` (optional)
    - `Popover.Positioner`
      - `Popover.Popup`
        - `Popover.Arrow` (optional)
        - `Popover.Viewport` (optional — for animating between trigger payloads)
          - `Popover.Title`, `Popover.Description`, `Popover.Close`

## Parts API

### Popover.Root
Headless wrapper.

**Props:**
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `defaultOpen` | `boolean` | `false` | Uncontrolled initial open state. |
| `open` | `boolean` | — | Controlled open. |
| `onOpenChange` | `(open: boolean, eventDetails: Popover.Root.ChangeEventDetails) => void` | — | — |
| `onOpenChangeComplete` | `(open: boolean) => void` | — | Fires after open/close animation. |
| `actionsRef` | `React.RefObject<Popover.Root.Actions \| null>` | — | Imperative `{ unmount(); close() }`. When `unmount` is reserved (external animations), you must call it to remove from DOM. |
| `defaultTriggerId` | `string \| null` | — | Initial active trigger (uncontrolled). |
| `triggerId` | `string \| null` | — | Active trigger in controlled mode. |
| `handle` | `Popover.Handle<Payload>` | — | Share a handle with external triggers. |
| `modal` | `boolean \| 'trap-focus'` | `false` | `true` = scroll-lock + outside pointer block; `'trap-focus'` = focus trap only (no scroll lock). Requires a `Popover.Close` inside `Popup` for focus trap to engage (can be visually hidden with `sr-only`). |
| `children` | `React.ReactNode \| PayloadChildRenderFunction<Payload>` | — | Static content or render function receiving `{ payload }` from active trigger. |

**State:** `type PopoverRootState = {}`.
**Root.Actions:** `{ unmount: () => void; close: () => void }`.
**Root.ChangeEventReason:** `'trigger-hover' \| 'trigger-focus' \| 'trigger-press' \| 'outside-press' \| 'escape-key' \| 'close-press' \| 'focus-out' \| 'imperative-action' \| 'none'`.
**Root.ChangeEventDetails:** discriminated union by reason + `cancel()`, `allowPropagation()`, `isCanceled`, `isPropagationAllowed`, `trigger`, `preventUnmountOnClose: () => void`.

### Popover.Trigger
Renders `<button>`. Multiple triggers may share a `handle`.

**Props:**
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `handle` | `Popover.Handle<Payload>` | — | Associates with a detached root. |
| `payload` | `Payload` | — | Value passed to root render function on open. |
| `nativeButton` | `boolean` | `true` | Set `false` when `render`ing non-button element. |
| `openOnHover` | `boolean` | `false` | Hover-to-open. |
| `delay` | `number` | `300` | Hover open delay (ms; requires `openOnHover`). |
| `closeDelay` | `number` | `0` | Hover close delay (ms; requires `openOnHover`). |
| `id` | `string` | — | Trigger id; used with `triggerId`/`defaultTriggerId` on `Root`. |
| `className` / `style` / `render` | state-aware | — | — |

**Data attributes:** `data-popup-open`, `data-pressed`.
**State:** `{ disabled: boolean; open: boolean }`.

### Popover.Portal
Renders `<div>`. Portals popup subtree (default `<body>`).
**Props:** `container`, `keepMounted` (default `false`), `className`/`style`/`render`.
**State:** `{}`.

### Popover.Backdrop
Renders `<div>`. Overlay beneath popup.
**Props:** standard.
**Data attributes:** `data-open`, `data-closed`, `data-starting-style`, `data-ending-style`.
**State:** `{ open: boolean; transitionStatus: TransitionStatus }`.

### Popover.Positioner
Renders `<div>`. Anchors popup to trigger.

**Props:**
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `disableAnchorTracking` | `boolean` | `false` | — |
| `align` | `Align` (`'start' \| 'center' \| 'end'`) | `'center'` | — |
| `alignOffset` | `number \| OffsetFunction` | `0` | — |
| `side` | `Side` (`'top' \| 'bottom' \| 'left' \| 'right' \| 'inline-end' \| 'inline-start'`) | `'bottom'` | May auto-flip. |
| `sideOffset` | `number \| OffsetFunction` | `0` | — |
| `arrowPadding` | `number` | `5` | — |
| `anchor` | `Element \| VirtualElement \| RefObject<Element \| null> \| (() => Element \| VirtualElement \| null) \| null` | — | Default: trigger. |
| `collisionAvoidance` | `CollisionAvoidance` (`{ side, align, fallbackAxisSide }` — `'flip' \| 'shift' \| 'none'` / `'start' \| 'end' \| 'none'`) | — | — |
| `collisionBoundary` | `Boundary` | `'clipping-ancestors'` | — |
| `collisionPadding` | `Padding` | `5` | — |
| `sticky` | `boolean` | `false` | — |
| `positionMethod` | `'absolute' \| 'fixed'` | `'absolute'` | — |
| `className` / `style` / `render` | state-aware | — | — |

`OffsetFunction`: `(data: { side; align; anchor; positioner }) => number`.
**Data attributes:** `data-open`, `data-closed`, `data-anchor-hidden`, `data-align`, `data-side`.
**CSS variables:** `--anchor-height`, `--anchor-width`, `--available-height`, `--available-width`, `--positioner-height`, `--positioner-width`, `--transform-origin`.
**State:** `{ open: boolean; side: Side; align: Align; anchorHidden: boolean; instant: string | undefined }`.

### Popover.Popup
Renders `<div>`.

**Props:**
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `initialFocus` | `boolean \| RefObject<HTMLElement \| null> \| ((openType: InteractionType) => boolean \| void \| HTMLElement \| null)` | — | Focus target on open. `true` = default; `false` = no move; ref/function = custom. |
| `finalFocus` | `boolean \| RefObject<HTMLElement \| null> \| ((closeType: InteractionType) => boolean \| void \| HTMLElement \| null)` | — | Focus target on close. |
| `className` / `style` / `render` | state-aware | — | — |

**Data attributes:** `data-open`, `data-closed`, `data-align`, `data-instant` (`'click' \| 'dismiss' \| 'focus' \| 'trigger-change'`), `data-side`, `data-starting-style`, `data-ending-style`.
**CSS variables:** `--popup-height`, `--popup-width`.
**State:** `{ open: boolean; side: Side; align: Align; transitionStatus: TransitionStatus; instant: 'dismiss' | 'click' | 'focus' | 'trigger-change' | undefined }`.
`InteractionType`: `'mouse' | 'touch' | 'pen' | 'keyboard' | ''`.

### Popover.Arrow
Renders `<div>`.
**Props:** standard.
**Data attributes:** `data-open`, `data-closed`, `data-uncentered`, `data-align`, `data-side`.
**State:** `{ open: boolean; side: Side; align: Align; uncentered: boolean }`.

### Popover.Title
Renders `<h2>`. Accessible heading.
**Props:** standard. **State:** `{}`.

### Popover.Description
Renders `<p>`. Accessible description.
**Props:** standard. **State:** `{}`.

### Popover.Close
Renders `<button>`. Closes popover.
**Props:** `nativeButton` (default `true`), plus standard. **State:** `{}`.

### Popover.Viewport
Renders `<div>`. Required only when one popup serves multiple triggers with animated transitions between payloads.
**Props:** `children`, `className`/`style`/`render`.
**Data attributes:** `data-activation-direction` (`` `${'left'|'right'} ${'top'|'bottom'}` ``), `data-current`, `data-instant`, `data-previous`, `data-transitioning`.
**CSS variables:** `--popup-height`, `--popup-width` (placed on the 'previous' container — freeze dimensions across content swaps).
**State:** `{ activationDirection: string | undefined; transitioning: boolean; instant: 'dismiss' | 'click' | 'focus' | 'trigger-change' | undefined }`.

### Popover.createHandle / Popover.Handle
Factory to share a popover across detached triggers.
**`createHandle()`** returns a `Popover.Handle<Payload>`.
**Handle:**
- `isOpen: boolean` (readonly)
- `open(triggerId: string): void` — opens, associating with that trigger.
- `close(): void` — closes.

## Keyboard
| Key | Action |
| :-- | :--- |
| `Enter` / `Space` (on Trigger) | Open/close. |
| `Tab` / `Shift+Tab` | Move focus inside open popup (trapped when `modal === true` or `'trap-focus'`). |
| `Escape` | Close popup. |

## State
Controlled: `<Popover.Root open={open} onOpenChange={(next, details) => setOpen(next)} />` (pair with `triggerId` for multi-trigger control).
Uncontrolled: `<Popover.Root defaultOpen={false} defaultTriggerId={...} />`.
Imperative: `actionsRef.current?.close()` closes the popover. `actionsRef.current?.unmount()` is for external-animation flows — when you call `eventDetails.preventUnmountOnClose()` from `onOpenChange`, Base UI leaves the popup mounted; you then call `unmount()` after your animation finishes to remove it from the DOM.
Inside `onOpenChange`, call `eventDetails.cancel()` to veto, `eventDetails.preventUnmountOnClose()` to keep the popup mounted after close (e.g. for external animation libs).

## Animation
- `data-starting-style` / `data-ending-style` on `Popup` and `Backdrop` mark enter/exit phases — set the "off" styles here.
- `data-instant` on `Popup` / `Viewport` signals transitions should be skipped (with a reason: `click`/`dismiss`/`focus`/`trigger-change`).
- `--transform-origin`, `--popup-width/height`, `--positioner-width/height` enable scale/size transitions; set `width: var(--positioner-width)` etc. when animating size.
- `Viewport` uses `data-current`/`data-previous`/`data-transitioning` plus `data-activation-direction` for directional content transitions; previous container exposes frozen `--popup-width/height`.

## Canonical example
```tsx
// Tailwind v4
import { Popover } from '@base-ui/react/popover';

export default function ExamplePopover() {
  return (
    <Popover.Root>
      <Popover.Trigger className="flex h-8 items-center justify-center gap-1.5 border border-neutral-950 px-2 text-sm text-neutral-950 select-none hover:bg-neutral-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:border-white dark:text-white dark:hover:bg-neutral-800 dark:focus-visible:outline-white">
        Notifications
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8} className="outline-none">
          <Popover.Popup className="origin-[var(--transform-origin)] w-72 border border-neutral-950 bg-white p-4 text-neutral-950 shadow-lg outline-none transition-[opacity,transform] duration-200 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 dark:border-white dark:bg-neutral-950 dark:text-white">
            <Popover.Arrow className="data-[side=bottom]:top-[-6px]" />
            <Popover.Title className="m-0 text-sm font-medium">You have 3 new alerts</Popover.Title>
            <Popover.Description className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              Review them in your inbox.
            </Popover.Description>
            <div className="mt-3 flex justify-end">
              <Popover.Close className="px-2 py-1 text-sm text-neutral-950 hover:bg-neutral-100 dark:text-white dark:hover:bg-neutral-800">
                Dismiss
              </Popover.Close>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
```

## Gotchas
- `Root` renders no element — wrap each trigger/portal pair, do not style the `Root`.
- `modal={true}` only traps focus when a `Popover.Close` is rendered inside `Popup` (can be visually hidden via `sr-only`).
- For animation libs that control unmount, call `eventDetails.preventUnmountOnClose()` in `onOpenChange` and later `actionsRef.current?.unmount()`.
- Set `nativeButton={false}` on `Trigger`/`Close` when rendering non-button elements via `render`.
- Multiple triggers: pass the same `Popover.Handle` (from `Popover.createHandle()`) to `Popover.Root` and every `Popover.Trigger`; use `payload` to vary content via a `children` render function.
- Use `Viewport` only when animating content swaps between triggers of the same popup; otherwise omit it (Title/Description/Close can live directly inside Popup).
- `sideOffset`/`alignOffset` accept functions for trigger-dimension-aware offsets (e.g. anchor at the corner via `({ side, anchor }) => side === 'top' || side === 'bottom' ? anchor.width : anchor.height`).
- The `instant` data attribute carries the reason — useful for skipping transitions on rapid trigger switches (`'trigger-change'`).
