# Toast

Import: `import { Toast } from '@base-ui/react/toast'`

## When to use
- Transient notifications, queued by an imperative manager (`useToastManager()` / `createToastManager()`).
- Stacked (default) or anchored to a triggering element via `Toast.Positioner`.
- F6 lets keyboard users jump into the viewport landmark. Add `data-base-ui-swipe-ignore` to opt elements out of swipe gestures.

## Anatomy
```
Toast.Provider
  Toast.Portal
    Toast.Viewport
      // Stacked
      Toast.Root
        Toast.Content
          Toast.Title
          Toast.Description
          Toast.Action
          Toast.Close
      // Anchored
      Toast.Positioner
        Toast.Root
          Toast.Arrow
          Toast.Content … (same as above)
```

## Parts API

### Toast.Provider
Provides toast context. No DOM rendering of its own.

**Props:**
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| limit | `number` | `3` | Max simultaneously displayed; oldest are dropped when exceeded. |
| toastManager | `ToastManager` | - | Pass a global manager (from `createToastManager`) to queue toasts outside React. |
| timeout | `number` | `5000` | Default auto-dismiss in ms. `0` disables auto-dismiss. |
| children | `React.ReactNode` | - | - |

### Toast.Portal
Portals content to `<body>` by default. Renders `<div>`.

**Props:** `container` (`HTMLElement | ShadowRoot | RefObject | null`), `className`, `style`, `render`.

### Toast.Viewport
Container landmark for toasts. Renders `<div>`.

**Props:** `className`, `style`, `render`.

**Data attributes:** `data-expanded` (toasts expanded in viewport).

**CSS variables:** `--toast-frontmost-height` (height of frontmost toast).

### Toast.Root
Individual toast wrapper. Renders `<div>`.

**Props:**
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| swipeDirection | `'up' \| 'down' \| 'left' \| 'right' \| ('left' \| 'right' \| 'up' \| 'down')[]` | `['down', 'right']` | Direction(s) for swipe-to-dismiss. |
| toast\* | `Toast.Root.ToastObject` | - | Toast object from the manager. |
| className, style, render | (state-driven) | - | Standard. |

**Data attributes:** `data-expanded`, `data-limited`, `data-swipe-direction` (`'up' | 'down' | 'left' | 'right'`), `data-swiping`, `data-type`, `data-starting-style`, `data-ending-style`.

**CSS variables:** `--toast-height`, `--toast-index` (0 = frontmost), `--toast-offset-y`, `--toast-swipe-movement-x`, `--toast-swipe-movement-y`.

### Toast.Content
Container for the visible content; hides overflow when stack is collapsed. Renders `<div>`.

**Data attributes:** `data-behind` (behind frontmost toast), `data-expanded`.

### Toast.Title
Renders `<h2>`. **Data:** `data-type`.

### Toast.Description
Renders `<p>`. Used as default message if no title. **Data:** `data-type`.

### Toast.Close
Closes its toast. Renders `<button>`.

**Props:** `nativeButton` (default `true`), `className`, `style`, `render`.

**Data:** `data-type`.

### Toast.Action
Executes the toast's action and closes. Renders `<button>`.

**Props:** same shape as `Close`. **Data:** `data-type`.

Props for the action button come from `actionProps` on the `ToastObject` (so the manager controls label/handler).

### Toast.Positioner
For anchored toasts. Renders `<div>`. Use a separate `Toast.Provider` from stacked toasts.

**Props:** `toast*` (`ToastObject`), `anchor` (`Element | null`), `side` (default `'top'`), `align` (default `'center'`), `sideOffset`, `alignOffset` (`number | OffsetFunction`), `arrowPadding` (default `5`), `collisionBoundary` (default `'clipping-ancestors'`), `collisionPadding` (default `5`), `collisionAvoidance`, `sticky` (default `false`), `positionMethod` (`'absolute' | 'fixed'`, default `'absolute'`), `disableAnchorTracking` (default `false`), `className`, `style`, `render`.

**Data:** `data-anchor-hidden`, `data-align` (`'start' | 'center' | 'end'`), `data-side` (`'top' | 'bottom' | 'left' | 'right' | 'inline-end' | 'inline-start'`).

**CSS variables:** `--anchor-height`, `--anchor-width`, `--available-height`, `--available-width`, `--transform-origin`.

### Toast.Arrow
Anchor-pointer for `Positioner`. Renders `<div>`. **Data:** `data-uncentered`, `data-align`, `data-side`.

## Imperative API

```ts
const toastManager = Toast.useToastManager(); // inside provider
// or
const toastManager = Toast.createToastManager(); // outside React; pass to Provider

toastManager.add({ title, description, type, timeout, priority, actionProps, positionerProps, data, onClose, onRemove });
toastManager.update(id, { ...partial });
toastManager.close(id?); // omit id to close all
toastManager.promise(promise, {
  loading: 'string or update options',
  success: 'string | options | (value) => string | options',
  error:   'string | options | (err)   => string | options',
});
toastManager.toasts; // ToastObject[]
```

`ToastObject` fields: `id`, `ref?`, `title?`, `type?`, `description?`, `timeout?` (default `5000`), `priority?` (`'low' | 'high'`, default `'low'`), `transitionStatus?`, `updateKey?` (increments on update — useful for replaying animations or remounting via React `key`), `limited?`, `height?`, `onClose?`, `onRemove?`, `actionProps?`, `positionerProps?`, `data?`.

## Keyboard
| Key | Action |
| :--- | :--- |
| F6 | Focus into the toast viewport landmark. |
| Tab / Shift+Tab | Move between toasts and actions inside the viewport. |
| Esc | Close the focused toast (when focus is within it). |
| Enter / Space | Activate focused button (Close/Action). |

Pointer: hover or focus over the viewport expands the stack (`data-expanded`); swipe in an allowed direction dismisses.

## State
The manager owns toast state. `Root`/`Content`/`Title`/etc. read from the `toast` prop. Animation state is exposed via data attributes:

```ts
type ToastRootState = {
  transitionStatus: 'starting' | 'ending' | undefined;
  expanded: boolean;
  limited: boolean;
  type: string | undefined;
  swiping: boolean;
  swipeDirection: 'up' | 'down' | 'left' | 'right' | undefined;
};
```

## Animation
- `data-starting-style` / `data-ending-style` on `Toast.Root` for enter/exit.
- `data-swipe-direction` on Root drives the dismissal vector.
- `data-limited` indicates dismissal due to the `limit` cap (animate differently if desired).
- `data-expanded` on Root / Content / Viewport marks the expanded stack state.
- `data-behind` on Content hides obscured toasts; pair with `data-expanded` to fade them back in.
- For dynamic content updates, increment `updateKey` (manager does this automatically) and key off it to replay an attention-grabbing animation or remount.

## Canonical example
```tsx
// Tailwind v4
'use client';
import * as React from 'react';
import { Toast } from '@base-ui/react/toast';

export default function ExampleToast() {
  return (
    <Toast.Provider>
      <ToastButton />
      <Toast.Portal>
        <Toast.Viewport className="fixed right-4 bottom-4 z-10 mx-auto w-[calc(100vw-2rem)] sm:right-8 sm:bottom-8 sm:w-[22.5rem]">
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}

function ToastButton() {
  const toastManager = Toast.useToastManager();
  const [count, setCount] = React.useState(0);
  return (
    <button
      type="button"
      className="flex h-8 items-center gap-2 border border-neutral-950 bg-white px-3 text-sm hover:bg-neutral-100 dark:border-white dark:bg-neutral-950 dark:text-white"
      onClick={() => {
        setCount((c) => c + 1);
        toastManager.add({ title: `Toast ${count + 1}`, description: 'A notification.' });
      }}
    >
      Create toast
    </button>
  );
}

function ToastList() {
  const { toasts } = Toast.useToastManager();
  return toasts.map((toast) => (
    <Toast.Root
      key={toast.id}
      toast={toast}
      className="[--gap:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] absolute right-0 bottom-0 w-full origin-bottom border border-neutral-950 bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0_rgb(0_0_0/12%)] dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none data-starting-style:translate-y-[150%] data-ending-style:opacity-0 data-limited:opacity-0 transition-[transform,opacity,height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
    >
      <Toast.Content className="flex h-full items-center gap-4 p-3 overflow-hidden transition-opacity duration-300 data-behind:opacity-0 data-expanded:opacity-100">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Toast.Title className="text-sm font-bold" />
          <Toast.Description className="text-sm" />
        </div>
        <Toast.Close className="h-8 border border-neutral-950 bg-white px-3 text-sm dark:border-white dark:bg-neutral-950 dark:text-white">
          Dismiss
        </Toast.Close>
      </Toast.Content>
    </Toast.Root>
  ));
}
```

## Gotchas
- For high-priority toasts, only the `title` and `description` strings are announced — extra rendered content is not. Anything important must be in those props.
- Use a separate `Toast.Provider` (and ideally a separate `createToastManager`) for anchored vs stacked toasts.
- `limit` defaults to 3 — toasts dropped because of it carry `data-limited` for distinct exit animation.
- `timeout: 0` pins a toast indefinitely (e.g. for "loading…" via `promise`).
- Re-adding an existing `id` updates the toast in place and resets its timer; bump `updateKey` (auto) to replay animations.
- The Viewport must be inside `Toast.Portal` and a `Toast.Provider`; otherwise `useToastManager` throws.
- Interactive elements inside a toast automatically skip swipe gestures; for non-interactive opt-outs use `data-base-ui-swipe-ignore`.
