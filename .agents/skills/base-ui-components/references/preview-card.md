# Preview Card

Import: `import { PreviewCard } from '@base-ui/react/preview-card'`

## When to use
- Hover/focus preview of a link's destination (think GitHub user hover cards, Wikipedia article previews).
- Trigger is an `<a>` — the card opens on hover/focus after a delay; clicking still navigates.
- Use `Popover` for action-laden floating panels; use `Tooltip` for short labels.

## Anatomy
- `PreviewCard.Root` (renders no element)
  - `PreviewCard.Trigger` (`<a>`)
  - `PreviewCard.Portal`
    - `PreviewCard.Backdrop` (optional)
    - `PreviewCard.Positioner`
      - `PreviewCard.Popup`
        - `PreviewCard.Arrow` (optional)
        - `PreviewCard.Viewport` (optional — for multi-trigger animated swaps)

## Parts API

### PreviewCard.Root
Headless wrapper.

**Props:**
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `defaultOpen` | `boolean` | `false` | Uncontrolled initial open. |
| `open` | `boolean` | — | Controlled open. |
| `onOpenChange` | `(open: boolean, eventDetails: PreviewCard.Root.ChangeEventDetails) => void` | — | — |
| `onOpenChangeComplete` | `(open: boolean) => void` | — | After animations complete. |
| `actionsRef` | `React.RefObject<PreviewCard.Root.Actions \| null>` | — | `{ unmount(); close() }`. |
| `defaultTriggerId` | `string \| null` | — | Initial active trigger (uncontrolled). |
| `triggerId` | `string \| null` | — | Active trigger in controlled mode. |
| `handle` | `PreviewCard.Handle<Payload>` | — | From `PreviewCard.createHandle()`; share across detached triggers. |
| `children` | `React.ReactNode \| PayloadChildRenderFunction<Payload>` | — | Static or `({ payload }) => ReactNode`. |

**State:** `type PreviewCardRootState = {}`.
**Root.Actions:** `{ unmount: () => void; close: () => void }`.
**Root.ChangeEventReason:** `'trigger-hover' \| 'trigger-focus' \| 'trigger-press' \| 'outside-press' \| 'escape-key' \| 'imperative-action' \| 'none'`.
**Root.ChangeEventDetails:** discriminated union by reason + `cancel()`, `allowPropagation()`, `isCanceled`, `isPropagationAllowed`, `trigger`, `preventUnmountOnClose: () => void`.

### PreviewCard.Trigger
Renders `<a>` (link with preview).

**Props:**
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `handle` | `PreviewCard.Handle<Payload>` | — | Associate with a detached root. |
| `payload` | `Payload` | — | Value passed to root's render function on open. |
| `delay` | `number` | `600` | Hover/focus open delay (ms). |
| `closeDelay` | `number` | `300` | Close delay (ms). |
| `className` / `style` / `render` | state-aware | — | — |

Standard `<a>` attributes (`href`, `target`, etc.) are forwarded.
**Data attributes:** `data-popup-open`.
**State:** `{ open: boolean }`.

### PreviewCard.Portal
Renders `<div>`. Portals popup tree (default `<body>`).
**Props:** `container`, `keepMounted` (default `false`), `className`/`style`/`render`.
**State:** `{}`.

### PreviewCard.Backdrop
Renders `<div>`. Optional overlay.
**Props:** standard.
**Data attributes:** `data-open`, `data-closed`, `data-starting-style`, `data-ending-style`.
**State:** `{ open: boolean; transitionStatus: TransitionStatus }`.

### PreviewCard.Positioner
Renders `<div>`.

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
| `collisionAvoidance` | `CollisionAvoidance` (`{ side, align, fallbackAxisSide }`) | — | See Popover/NavigationMenu refs for full semantics. |
| `collisionBoundary` | `Boundary` | `'clipping-ancestors'` | — |
| `collisionPadding` | `Padding` | `5` | — |
| `sticky` | `boolean` | `false` | — |
| `positionMethod` | `'absolute' \| 'fixed'` | `'absolute'` | — |
| `className` / `style` / `render` | state-aware | — | — |

`OffsetFunction`: `(data: { side; align; anchor; positioner }) => number`.
**Data attributes:** `data-open`, `data-closed`, `data-anchor-hidden`, `data-align`, `data-side`.
**CSS variables:** `--anchor-height`, `--anchor-width`, `--available-height`, `--available-width`, `--transform-origin`.
**State:** `{ open: boolean; side: Side; align: Align; anchorHidden: boolean; instant: 'dismiss' | 'focus' | undefined }`.

### PreviewCard.Popup
Renders `<div>`.
**Props:** standard.
**Data attributes:** `data-open`, `data-closed`, `data-align`, `data-side`, `data-starting-style`, `data-ending-style`.
**State:** `{ open: boolean; side: Side; align: Align; instant: 'dismiss' | 'focus' | undefined; transitionStatus: TransitionStatus }`.

### PreviewCard.Arrow
Renders `<div>`.
**Props:** standard.
**Data attributes:** `data-open`, `data-closed`, `data-uncentered`, `data-align`, `data-side`.
**State:** `{ open: boolean; side: Side; align: Align; uncentered: boolean }`.

### PreviewCard.Viewport
Renders `<div>`. Required only when one popup serves multiple triggers with animated content swaps.
**Props:** `children`, `className`/`style`/`render`.
**Data attributes:** `data-activation-direction` (`` `${'left'|'right'} ${'top'|'bottom'}` ``), `data-current`, `data-instant` (`'dismiss' \| 'focus'`), `data-previous`, `data-transitioning`.
**CSS variables:** `--popup-height`, `--popup-width` (placed on the 'previous' container; freezes dimensions across swaps).
**State:** `{ activationDirection: string | undefined; transitioning: boolean; instant: 'dismiss' | 'focus' | undefined }`.

### PreviewCard.createHandle / PreviewCard.Handle
`createHandle<Payload>()` returns a `PreviewCard.Handle<Payload>`.
**Handle:**
- `isOpen: boolean` (readonly)
- `open(triggerId: string): void` — call in event handler / effect, not during render.
- `close(): void`

## Keyboard
| Key | Action |
| :-- | :--- |
| `Tab` (to trigger) | Opens preview after `delay`. |
| `Enter` (on trigger) | Activates link (browser-default). |
| `Escape` | Close preview. |

## State
Controlled: `<PreviewCard.Root open={open} onOpenChange={(next, details) => setOpen(next)} />` (pair with `triggerId` for multi-trigger).
Uncontrolled: `<PreviewCard.Root defaultOpen={false} />`.
Imperative: `actionsRef.current?.close()` closes the preview. `actionsRef.current?.unmount()` is paired with `eventDetails.preventUnmountOnClose()` in `onOpenChange` — when an external animation library owns the exit, you call `unmount()` after the animation finishes to remove the popup from the DOM.
Inside `onOpenChange`, use `eventDetails.cancel()` to veto and `eventDetails.preventUnmountOnClose()` to keep the popup mounted after close (for external animation libs).

## Animation
- `data-starting-style` / `data-ending-style` on `Popup`/`Backdrop` mark enter/exit phases — set "off" styles there.
- `data-instant` (`'dismiss'` / `'focus'`) signals transitions should be skipped.
- `--transform-origin` enables scale-from-anchor transitions; `--popup-width/height` on `Viewport`'s "previous" child freezes dimensions during content swaps.
- `Viewport` uses `data-current`/`data-previous`/`data-transitioning` + `data-activation-direction` for directional content transitions.

## Canonical example
```tsx
// Tailwind v4
import { PreviewCard } from '@base-ui/react/preview-card';

export default function ExamplePreviewCard() {
  return (
    <PreviewCard.Root>
      <p className="m-0 text-base text-neutral-950 text-balance dark:text-white">
        The principles of good{' '}
        <PreviewCard.Trigger
          className="text-neutral-950 underline decoration-neutral-950/60 decoration-1 underline-offset-2 outline-0 hover:decoration-neutral-950 data-popup-open:decoration-neutral-950 focus-visible:no-underline focus-visible:outline-2 focus-visible:outline-neutral-950 dark:text-white dark:decoration-white/60 dark:hover:decoration-white dark:data-popup-open:decoration-white dark:focus-visible:outline-white"
          href="https://en.wikipedia.org/wiki/Typography"
        >
          typography
        </PreviewCard.Trigger>{' '}
        remain in the digital age.
      </p>

      <PreviewCard.Portal>
        <PreviewCard.Positioner sideOffset={8}>
          <PreviewCard.Popup className="origin-[var(--transform-origin)] border border-neutral-950 bg-white text-neutral-950 shadow-md transition-[transform,opacity] duration-100 data-starting-style:scale-[0.98] data-starting-style:opacity-0 data-ending-style:scale-[0.98] data-ending-style:opacity-0 dark:border-white dark:bg-neutral-950 dark:text-white">
            <PreviewCard.Arrow className="data-[side=bottom]:top-[-6px]" />
            <div className="flex w-56 flex-col gap-2 p-2">
              <img
                width={224}
                height={150}
                className="block max-w-none"
                src="https://images.unsplash.com/photo-1619615391095-dfa29e1672ef?q=80&w=448&h=300"
                alt=""
              />
              <p className="m-0 text-sm text-pretty">
                <strong>Typography</strong> is the art and science of arranging type to make written language clear and effective.
              </p>
            </div>
          </PreviewCard.Popup>
        </PreviewCard.Positioner>
      </PreviewCard.Portal>
    </PreviewCard.Root>
  );
}
```

## Gotchas
- `Trigger` renders an `<a>`, not a button. The link still navigates on click — preview opens on hover/focus after `delay` (default 600 ms).
- `Root` renders nothing. Use it as a logical wrapper around trigger and portal.
- For multiple triggers feeding one card: create a `handle` with `PreviewCard.createHandle<Payload>()`, pass it to `Root` and every `Trigger`, and use a `children` render function: `<Root handle={h}>{({ payload }) => ...}</Root>`.
- Use `Viewport` only when animating content swaps between triggers; otherwise omit it.
- For routing/Next.js: use `render={<NextLink href={...} />}` (or framework equivalent) on `Trigger`.
- `Backdrop` exists but is uncommon for preview cards (they're typically not modal); add it only if you want to dim the page.
- `sideOffset`/`alignOffset` accept functions for trigger-dimension-aware offsets; the function receives `{ side, align, anchor, positioner }`.
- `instant` data attribute is `'dismiss'` (closed via escape/outside-press) or `'focus'` (rapid focus changes) — use to short-circuit transitions.
- `--popup-width` / `--popup-height` are formally documented on `Viewport`'s "previous" container, but the canonical Tailwind examples also read them on `Popup` for size animations (e.g. `h-[var(--popup-height,auto)] w-[var(--popup-width,auto)]`) — that's the same value plumbed down through Floating UI.
