# Alert Dialog

Import: `import { AlertDialog } from '@base-ui/react/alert-dialog'`

## When to use
- Block the UI until the user confirms a destructive or critical action (e.g. discard, delete).
- Unlike `Dialog`, it traps focus, can't dismiss on backdrop/Esc by default, and signals interruption via `role="alertdialog"`.
- Use `Dialog` for non-blocking content; use `AlertDialog` only when a decision is required to proceed.

## Anatomy
- `AlertDialog.Root` — owns open state, payload, handle wiring
- `AlertDialog.Trigger` — button that opens the dialog (optional when using a `handle`)
- `AlertDialog.Portal` — moves popup tree outside parent DOM
- `AlertDialog.Backdrop` — overlay behind the popup
- `AlertDialog.Viewport` — optional scrollable positioning container
- `AlertDialog.Popup` — the dialog container, manages focus trap
- `AlertDialog.Title` — `<h2>` label
- `AlertDialog.Description` — `<p>` supporting text
- `AlertDialog.Close` — button that closes the dialog
- `AlertDialog.createHandle()` / `AlertDialog.Handle` — imperative + detached-trigger control

## Parts API

### AlertDialog.Root
Does not render an element. Groups all parts.
**Props:**
- `defaultOpen` — `boolean` (`false`)
- `open` — `boolean` — controlled open state
- `onOpenChange` — `(open: boolean, eventDetails: AlertDialog.Root.ChangeEventDetails) => void`
- `actionsRef` — `React.RefObject<AlertDialog.Root.Actions | null>` — exposes `{ unmount(), close() }`; when provided, dialog is not auto-unmounted on close (call `unmount()` after animations)
- `defaultTriggerId` — `string \| null` — initial active trigger id (uncontrolled)
- `triggerId` — `string \| null` — controlled active trigger id
- `handle` — `AlertDialog.Handle<Payload>` — link to detached triggers / imperative API
- `onOpenChangeComplete` — `(open: boolean) => void` — fires after open/close animations
- `children` — `React.ReactNode \| ((arg: { payload: Payload | undefined }) => ReactNode)` — supports render function for payload-driven content

### AlertDialog.Trigger
Renders a `<button>`. Opens the dialog.
**Props:**
- `handle` — `AlertDialog.Handle<Payload>` — detached trigger handle
- `nativeButton` — `boolean` (`true`)
- `payload` — `Payload` — data passed to dialog when this trigger opens it
- `id` — `string` — also used to identify active trigger in controlled mode
- `className` / `style` / `render` — standard render props

**Data attributes:**
- `data-popup-open` — present when its dialog is open
- `data-disabled` — present when disabled

### AlertDialog.Portal
Renders a `<div>` portalled to `<body>` by default.
**Props:**
- `container` — `HTMLElement \| ShadowRoot \| React.RefObject<HTMLElement \| ShadowRoot \| null> \| null`
- `keepMounted` — `boolean` (`false`) — keep portal in DOM when popup hidden
- `className` / `style` / `render`

### AlertDialog.Backdrop
Renders a `<div>` overlay.
**Props:**
- `forceRender` — `boolean` (`false`) — render even when nested (nested dialogs normally skip backdrop)
- `className` / `style` / `render`

**Data attributes:**
- `data-open` / `data-closed`
- `data-starting-style` / `data-ending-style`

### AlertDialog.Popup
Renders a `<div>`. Container for dialog content.
**Props:**
- `initialFocus` — `boolean \| RefObject<HTMLElement \| null> \| ((openType: InteractionType) => boolean \| void \| HTMLElement \| null)` — where to focus on open
- `finalFocus` — `boolean \| RefObject<HTMLElement \| null> \| ((closeType: InteractionType) => boolean \| void \| HTMLElement \| null)` — where to focus on close
- `className` / `style` / `render`

**Data attributes:**
- `data-open` / `data-closed`
- `data-nested` — dialog is inside another dialog
- `data-nested-dialog-open` — has open child dialogs
- `data-starting-style` / `data-ending-style`

**CSS variables:**
- `--nested-dialogs` — number of nested dialogs open (use to offset/scale parent popup)

### AlertDialog.Viewport
Renders a `<div>`. Optional scrollable positioner around the popup.
**Props:** `className` / `style` / `render`
**Data attributes:** `data-open`, `data-closed`, `data-nested`, `data-nested-dialog-open`, `data-starting-style`, `data-ending-style`

### AlertDialog.Title
Renders an `<h2>`.
**Props:** `className` / `style` / `render`

### AlertDialog.Description
Renders a `<p>`.
**Props:** `className` / `style` / `render`

### AlertDialog.Close
Renders a `<button>` that closes the dialog.
**Props:**
- `nativeButton` — `boolean` (`true`)
- `className` / `style` / `render`

**Data attributes:**
- `data-disabled`

### AlertDialog.createHandle / AlertDialog.Handle
- `AlertDialog.createHandle<Payload>()` returns an `AlertDialog.Handle<Payload>`.
- Handle properties: `isOpen: boolean` (readonly).
- Methods (call in handlers/effects, not during render):
  - `open(triggerId: string | null): void` — open and associate with a matching `Trigger` having that handle
  - `openWithPayload(payload: Payload): void` — open with payload, no trigger association
  - `close(): void`

## Keyboard
| Key | Action |
| --- | --- |
| `Tab` / `Shift+Tab` | Cycle focus within the popup (focus trap) |
| `Enter` / `Space` | Activate focused button |

Note: unlike `Dialog`, alert dialogs are not auto-dismissed by Esc or backdrop click — render an explicit `AlertDialog.Close`. Esc and outside-press still emit `onOpenChange` with `escape-key` / `outside-press` reasons; Base UI just doesn't close the dialog for you. Call `actionsRef.current?.close()` (or set `open=false` via the controlled-state handler) inside `onOpenChange` if you want them to dismiss.

## State
- Uncontrolled: `defaultOpen`, optional `defaultTriggerId`
- Controlled: `open` + `onOpenChange`; use `triggerId` to track which trigger initiated
- `onOpenChangeComplete(open)` runs after transitions
- `ChangeEventReason` ∈ `'trigger-press' | 'outside-press' | 'escape-key' | 'close-press' | 'focus-out' | 'imperative-action' | 'none'`
- `ChangeEventDetails` provides `cancel()`, `allowPropagation()`, `isCanceled`, `isPropagationAllowed`, `trigger`, and `preventUnmountOnClose()` to defer unmount for custom animations

## Animation
- `data-starting-style` / `data-ending-style` on Backdrop, Popup, and Viewport mark in/out phases.
- Use `--nested-dialogs` on Popup to offset/scale parent when child dialogs open.
- For externally controlled animation, pass `actionsRef` and call `unmount()` after the exit transition (use `keepMounted` on `Portal` if needed).

## Canonical example
```tsx
import { AlertDialog } from '@base-ui/react/alert-dialog';

const btn =
  'flex h-8 items-center justify-center gap-2 border border-neutral-950 bg-white px-3 text-sm leading-none select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800';
const danger = `${btn} text-red-700 dark:text-red-400`;

export default function ExampleAlertDialog() {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger className={danger}>Discard draft</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 min-h-dvh bg-black/20 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 dark:bg-black/50" />
        <AlertDialog.Popup className="fixed top-1/2 left-1/2 -mt-8 flex w-96 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 border border-neutral-950 bg-white p-4 text-neutral-950 transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0 dark:border-white dark:bg-neutral-950 dark:text-white">
          <div className="flex flex-col gap-1">
            <AlertDialog.Title className="text-base font-bold">Discard draft?</AlertDialog.Title>
            <AlertDialog.Description className="text-sm text-neutral-600 dark:text-neutral-400">
              You can&rsquo;t undo this action.
            </AlertDialog.Description>
          </div>
          <div className="flex justify-end gap-3">
            <AlertDialog.Close className={btn}>Cancel</AlertDialog.Close>
            <AlertDialog.Close className={danger}>Discard</AlertDialog.Close>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
```

## Gotchas
- Always render `Popup` inside `Portal`; rendering without a Portal breaks stacking and focus management.
- AlertDialog intentionally does not close on backdrop click or Esc — give users explicit `Close` buttons.
- When using `handle`/detached triggers, pair the same handle on both `Trigger` and `Root`; call `handle.open()` in event handlers only.
- For nested alert dialogs, child backdrops are suppressed by default; set `forceRender` if you need them, and use `var(--nested-dialogs)` on parents to offset. The CSS variable is exposed on `AlertDialog.Popup` only — not on `Viewport` — so read it from the popup descendant.
- If you provide `actionsRef`, you own the unmount lifecycle — call `actions.unmount()` after your exit animation, otherwise the dialog stays mounted.
- Render-function children only receive `payload`; static layout still goes inside the function return.
