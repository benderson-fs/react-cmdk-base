# Drawer

Import: `import { Drawer } from '@base-ui/react/drawer'`

## When to use
- Edge-anchored sheet that supports swipe gestures, snap points, nested drawers, and `Drawer.Indent` background effects.
- For a non-swipeable side panel use a positioned `Dialog` instead — Drawer extends Dialog and only adds gesture/snap/indent features.
- For right-click menus use `ContextMenu`; for floating overlays anchored to a trigger use `Popover`.

## Anatomy
- `Drawer.Provider` — optional, coordinates global `Indent` / `IndentBackground` for multiple drawers.
- `Drawer.IndentBackground` + `Drawer.Indent` — background and main-UI wrapper that react to any drawer being open.
- `Drawer.Root` — controller (gesture/snap state, swipe direction).
- `Drawer.Trigger` — opens the drawer.
- `Drawer.SwipeArea` — invisible edge area that opens drawer via swipe.
- `Drawer.Portal` → `Drawer.Backdrop` + `Drawer.Viewport` → `Drawer.Popup` — overlay tree.
- `Drawer.Content` (inside Popup) holds `Title`, `Description`, `Close`, and your content.

## Parts API

### Drawer.Root
Doesn't render its own element.
**Props:**
- `defaultOpen` — `boolean` (`false`).
- `open` — `boolean` — controlled.
- `onOpenChange` — `(open, eventDetails) => void`.
- `onOpenChangeComplete` — `(open: boolean) => void` — fires after animations.
- `snapPoints` — `DrawerSnapPoint[]` (`number` 0-1 = fraction of viewport, `>1` = px, or `'…px'`/`'…rem'`).
- `defaultSnapPoint` / `snapPoint` — `DrawerSnapPoint | null`.
- `onSnapPointChange` — `(snapPoint, eventDetails) => void`.
- `snapToSequentialPoints` — `boolean` (`false`) — disable velocity-based skipping; drag distance picks next point.
- `swipeDirection` — `'up' | 'down' | 'left' | 'right'` (`'down'`).
- `actionsRef` — `RefObject<Drawer.Root.Actions | null>` — `{ unmount, close }`. Providing `unmount` blocks auto-unmount; call manually.
- `disablePointerDismissal` — `boolean` (`false`).
- `modal` — `boolean | 'trap-focus'` (`true`) — `'trap-focus'` traps focus but leaves scroll/pointer enabled.
- `handle` — `Drawer.Handle<Payload>` — link detached triggers (see `Drawer.createHandle()`).
- `defaultTriggerId` / `triggerId` — `string | null` — pair the drawer with a specific trigger id.
- `children` — `ReactNode | ({ payload }) => ReactNode`.

### Drawer.Provider
Doesn't render an element. **Props:** `children`.

### Drawer.Trigger
Renders `<button>`. **Props:** `handle`, `payload`, `id`, `nativeButton` (`true`), `className`, `style`, `render`.
State: `{ disabled, open }`.

### Drawer.SwipeArea
Renders `<div>`. **Props:** `swipeDirection` (defaults to opposite of `Root` swipeDirection), `disabled` (`false`), `className`, `style`, `render`.
**Data attributes:** `data-open`, `data-closed`, `data-disabled`, `data-swipe-direction`, `data-swiping`.

### Drawer.Portal
Renders `<div>`. **Props:** `container`, `keepMounted` (`false`), `className`, `style`, `render`.

### Drawer.Backdrop
Renders `<div>`. **Props:** `forceRender` (`false`, force-render even when nested), `className`, `style`, `render`.
**Data attributes:** `data-open`, `data-closed`, `data-starting-style`, `data-ending-style`.
**CSS variables:** `--drawer-swipe-progress`.

### Drawer.Viewport
Renders `<div>`. Positioning container for the popup. **Props:** `className`, `style`, `render`.
**Data attributes:** `data-open`, `data-closed`, `data-nested`, `data-starting-style`, `data-ending-style`.
State exposes `{ open, transitionStatus, nested, nestedDialogOpen }`.

### Drawer.Popup
Renders `<div>`. **Props:**
- `initialFocus` / `finalFocus` — `boolean | RefObject | (interactionType) => boolean | void | HTMLElement | null`.
- `className`, `style`, `render`.

**Data attributes:** `data-open`, `data-closed`, `data-expanded` (at top/expanded snap point), `data-nested-drawer-open`, `data-nested-drawer-swiping`, `data-swipe-direction` (`'up' | 'down' | 'left' | 'right'`), `data-swipe-dismiss`, `data-swiping`, `data-starting-style`, `data-ending-style`.

**CSS variables:**
- `--drawer-frontmost-height` — height of the frontmost open drawer in the nested stack.
- `--drawer-height` — popup height.
- `--drawer-snap-point-offset` — translation offset for the current snap point.
- `--drawer-swipe-movement-x` / `--drawer-swipe-movement-y` — current swipe deltas.
- `--drawer-swipe-strength` — 0.1-1 scalar used to scale release transition duration.
- `--nested-drawers` — count of currently open nested drawers.

State: `{ open, transitionStatus, expanded, nested, nestedDrawerOpen, nestedDrawerSwiping, swipeDirection, swiping }`.

### Drawer.Content
Renders `<div>`. Inner content container that allows text selection without competing with swipe gestures (mouse pointer). Add `data-base-ui-swipe-ignore` on any descendant to opt out of swipe dismissal for all input types.
**Props:** `className`, `style`, `render`.

### Drawer.Title
Renders `<h2>`. **Props:** `className`, `style`, `render`.

### Drawer.Description
Renders `<p>`. **Props:** `className`, `style`, `render`.

### Drawer.Close
Renders `<button>`. **Props:** `nativeButton` (`true`), `className`, `style`, `render`.
State: `{ disabled }`.

### Drawer.Indent
Renders `<div>`. Wrap your app shell; gets `data-active` when any drawer in the nearest `Provider` is open.
**Props:** `className`, `style`, `render`. State: `{ active }`.

### Drawer.IndentBackground
Renders `<div>`. Place before `Drawer.Indent` for a background layer; receives the same `{ active }` state.
**Props:** `className`, `style`, `render`.

### Drawer.createHandle / Drawer.Handle
- `Drawer.createHandle<Payload>(): Drawer.Handle<Payload>` — create once outside render.
- `Handle` exposes `isOpen` (readonly), `open(triggerId)`, `openWithPayload(payload)`, `close()`. Call `open`/`openWithPayload` only from effects or event handlers, never during render. Pass the same handle to both `Drawer.Root handle={…}` and detached `Drawer.Trigger handle={…}` instances.

## Keyboard
| Key | Action |
| --- | --- |
| Enter / Space (Trigger) | Open the drawer. |
| Escape | Close the drawer (or close via Close Watcher). |
| Tab / Shift+Tab | Move focus inside the drawer (focus trapped when `modal !== false`). |

## State
- Uncontrolled: `defaultOpen`. Controlled: `open` + `onOpenChange`.
- `ChangeEventDetails.reason`: `'trigger-press' | 'outside-press' | 'escape-key' | 'close-watcher' | 'close-press' | 'focus-out' | 'imperative-action' | 'swipe' | 'none'`; details include `cancel()`, `allowPropagation()`, `isCanceled`, `isPropagationAllowed`, `trigger`, and `preventUnmountOnClose`.
- Snap point: `defaultSnapPoint` / `snapPoint` + `onSnapPointChange` with `SnapPointChangeEventDetails`. Its `reason` union is identical to `ChangeEventDetails.reason`, but the snap-point details object does **not** include `preventUnmountOnClose` — only the open-state `ChangeEventDetails` does.
- Imperative: `actionsRef.current?.close()` / `unmount()` — required when `actionsRef` provides `unmount`.

## Animation
- Drive open/close transitions using `data-starting-style` / `data-ending-style` on `Popup`, `Backdrop`, and `Viewport`.
- Live swipe uses `--drawer-swipe-movement-x` / `--drawer-swipe-movement-y` (apply to `transform`) and `--drawer-swipe-progress` (typically used for backdrop opacity).
- Scale exit duration by `--drawer-swipe-strength`: `data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)]`.
- `data-swiping` on `Popup` / `Backdrop` lets you disable transitions mid-gesture (`data-swiping:duration-0`, `data-swiping:select-none`).
- Snap-point translation comes from `--drawer-snap-point-offset` — combine with `--drawer-swipe-movement-*` if both are in play.
- `keepMounted` on `Portal` is required if exit transitions should run before unmount.

## Canonical example
```tsx
import { Drawer } from '@base-ui/react/drawer';

export default function ExampleDrawer() {
  return (
    <Drawer.Root swipeDirection="right">
      <Drawer.Trigger className="flex h-8 items-center gap-2 border border-neutral-950 bg-white px-3 text-sm text-neutral-950 hover:not-data-disabled:bg-neutral-100 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950">
        Open drawer
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Backdrop className="fixed inset-0 min-h-dvh bg-black opacity-[calc(0.2*(1-var(--drawer-swipe-progress)))] transition-opacity duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-swiping:duration-0 data-ending-style:opacity-0 data-starting-style:opacity-0 dark:opacity-[calc(0.7*(1-var(--drawer-swipe-progress)))]" />
        <Drawer.Viewport className="fixed inset-0 flex items-stretch justify-end">
          <Drawer.Popup className="h-full w-80 max-w-[calc(100vw-3rem)] border-l border-neutral-950 bg-white p-6 text-neutral-950 outline-none shadow-[0.25rem_0.25rem_0_rgb(0_0_0_/_12%)] overflow-y-auto overscroll-contain [transform:translateX(var(--drawer-swipe-movement-x))] transition-transform duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-swiping:select-none data-ending-style:[transform:translateX(100%)] data-starting-style:[transform:translateX(100%)] data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none">
            <Drawer.Content className="mx-auto w-full max-w-md">
              <Drawer.Title className="mb-1 text-base font-bold">Drawer</Drawer.Title>
              <Drawer.Description className="mb-6 text-sm text-neutral-600 dark:text-neutral-400">
                Swipe right to dismiss.
              </Drawer.Description>
              <div className="flex justify-end">
                <Drawer.Close className="flex h-8 items-center border border-neutral-950 bg-white px-3 text-sm text-neutral-950 hover:bg-neutral-100 dark:border-white dark:bg-neutral-950 dark:text-white">
                  Close
                </Drawer.Close>
              </div>
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
```

## Gotchas
- `Popup` MUST be inside `Viewport` MUST be inside `Portal`. Without `Viewport` the swipe maths/snap offsets don't apply.
- `swipeDirection` defaults to `'down'` (bottom sheet). Match it to the side the drawer slides in from: a right-edge drawer uses `swipeDirection="right"`.
- `Drawer.SwipeArea`'s `swipeDirection` defaults to the OPPOSITE of `Root.swipeDirection` (it's the gesture to OPEN, not to dismiss).
- Snap points must be in monotonic order matching the swipe axis; mix numbers `(0,1]` (fraction) with pixel/rem strings for explicit pixel sizes.
- For nested drawers wrap with `Drawer.Provider`; `Indent`/`IndentBackground` only react to drawers inside the nearest provider. `Backdrop forceRender` makes a nested drawer's backdrop render even when nested behavior would normally suppress it.
- `Drawer.Content` is required if you want text selection (mouse) to work without triggering swipe; otherwise the popup itself captures the gesture. Use `data-base-ui-swipe-ignore` on descendants to opt out of swipes.
- `actionsRef` providing `unmount` disables Base UI's automatic unmount on close — you MUST call `actionsRef.current?.unmount()` after your external animation library finishes its exit.
- `Handle.open` / `openWithPayload` must be called from effects or handlers, never during render.
