# Dialog

Import: `import { Dialog } from '@base-ui/react/dialog'`

## When to use
- Modal interactions that demand the user's attention (confirmation, forms, important content).
- Use `modal={true}` (default) to trap focus and lock scroll; `modal="trap-focus"` to trap focus only; `modal={false}` for a non-modal popup.
- Compose with `Dialog.Handle` / `Dialog.createHandle` to drive the dialog from triggers outside the `Dialog.Root` subtree.

## Anatomy
- `Dialog.Root`
  - `Dialog.Trigger` (or external trigger via `handle`)
  - `Dialog.Portal`
    - `Dialog.Backdrop`
    - `Dialog.Viewport` (optional positioning/scroll container)
      - `Dialog.Popup`
        - `Dialog.Title`
        - `Dialog.Description`
        - children
        - `Dialog.Close`

## Parts API

### Dialog.Root
Owns open state. Does not render its own element.

**Props:**
- `defaultOpen`: `boolean` (default `false`).
- `open`: `boolean` — controlled.
- `onOpenChange`: `(open: boolean, eventDetails: Dialog.Root.ChangeEventDetails) => void`.
- `onOpenChangeComplete`: `(open: boolean) => void` — fires after exit animations.
- `actionsRef`: `React.RefObject<Dialog.Root.Actions | null>` — `{ unmount, close }`.
- `defaultTriggerId` / `triggerId`: `string | null` — associate (or pre-associate) a trigger by id.
- `disablePointerDismissal`: `boolean` (default `false`).
- `handle`: `Dialog.Handle<Payload>` — external handle for detached triggers.
- `modal`: `boolean | 'trap-focus'` (default `true`).
- `children`: `React.ReactNode | PayloadChildRenderFunction<Payload>`.

### Dialog.Trigger
Renders a `<button>`.

**Props:** `handle`, `nativeButton` (default `true`), `payload`, `id`, `className`, `style`, `render`.
**Data attributes:** `data-popup-open`, `data-disabled`.

### Dialog.Portal
Renders a `<div>` in `<body>` by default.

**Props:** `container`: `HTMLElement | ShadowRoot | RefObject<...> | null`, `keepMounted`: `boolean` (default `false`), `className`, `style`, `render`.

### Dialog.Backdrop
Overlay under the popup. Renders `<div>`.

**Props:** `forceRender`: `boolean` (default `false`) — render even when nested, `className`, `style`, `render`.
**Data attributes:** `data-open`, `data-closed`, `data-starting-style`, `data-ending-style`.

### Dialog.Viewport
Optional positioning/scroll container. Renders `<div>`.

**Props:** `className`, `style`, `render`.
**Data attributes:** `data-open`, `data-closed`, `data-nested`, `data-nested-dialog-open`, `data-starting-style`, `data-ending-style`.

### Dialog.Popup
Dialog contents container. Renders `<div>`.

**Props:**
- `initialFocus`: `boolean | RefObject<HTMLElement | null> | ((openType: InteractionType) => boolean | void | HTMLElement | null)`.
- `finalFocus`: same shape as `initialFocus` but for close.
- `className`, `style`, `render`.

**Data attributes:** `data-open`, `data-closed`, `data-nested`, `data-nested-dialog-open`, `data-starting-style`, `data-ending-style`.
**CSS variables:** `--nested-dialogs` (number) — count of dialogs nested within.

### Dialog.Title
Renders `<h2>`. Auto-associates as `aria-labelledby` for the popup.

### Dialog.Description
Renders `<p>`. Auto-associates as `aria-describedby` for the popup.

### Dialog.Close
Button that closes the dialog. Renders `<button>`.

**Props:** `nativeButton` (default `true`), `className`, `style`, `render`.
**Data attributes:** `data-disabled`.

### Dialog.Handle (`Dialog.createHandle()`)
Imperative handle for detached triggers and external control.

```ts
const handle = Dialog.createHandle<Payload>();
handle.isOpen;                   // readonly
handle.open(triggerId | null);   // open and associate with trigger by id
handle.openWithPayload(payload); // open without a trigger
handle.close();                  // close
```

Use only inside event handlers/effects, not during render.

## Keyboard
| Key | Effect |
| --- | --- |
| Tab / Shift+Tab | Cycle focus within the popup (focus is trapped when `modal !== false`). |
| Esc | Close the dialog. |
| Enter / Space | Activate the focused button (`Trigger`, `Close`). |

## State

```ts
type DialogRootState = {};
type DialogRootActions = { unmount: () => void; close: () => void };
type DialogRootChangeEventReason =
  | 'trigger-press' | 'outside-press' | 'escape-key' | 'close-press'
  | 'focus-out' | 'imperative-action' | 'none';
type DialogRootChangeEventDetails = /* discriminated by reason */ & {
  cancel: () => void; allowPropagation: () => void;
  isCanceled: boolean; isPropagationAllowed: boolean;
  trigger: Element | undefined;
  preventUnmountOnClose: () => void;
};

type DialogTriggerState = { disabled: boolean; open: boolean };
type DialogBackdropState = { open: boolean; transitionStatus: TransitionStatus };
type DialogPopupState = {
  open: boolean;
  transitionStatus: TransitionStatus;
  nested: boolean;
  nestedDialogOpen: boolean;
};
type DialogViewportState = DialogPopupState;
type DialogCloseState = { disabled: boolean };
type DialogTitleState = {};
type DialogDescriptionState = {};
type DialogPortalState = {};

type InteractionType = 'mouse' | 'touch' | 'pen' | 'keyboard' | '';
type PayloadChildRenderFunction = (arg: { payload: unknown | undefined }) => React.ReactNode;
type preventUnmountOnClose = () => void;
```

Controlled: `<Dialog.Root open={o} onOpenChange={setO}>`. Uncontrolled: `<Dialog.Root defaultOpen>`.

## Animation
`Backdrop`, `Popup`, and `Viewport` expose `data-starting-style` and `data-ending-style` plus the `transitionStatus` state. Use `actionsRef.current.unmount()` and `eventDetails.preventUnmountOnClose()` to integrate with external animation libraries that defer unmount.

## Canonical example
```tsx
// Tailwind v4
import { Dialog } from '@base-ui/react/dialog';

export default function ExampleDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger className="flex h-8 items-center border border-neutral-950 bg-white px-3 text-sm text-neutral-950 hover:not-data-disabled:bg-neutral-100 focus-visible:outline-2 dark:border-white dark:bg-neutral-950 dark:text-white">
        View notifications
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/20 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 dark:bg-black/50" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 flex w-96 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 border border-neutral-950 bg-white p-4 text-neutral-950 transition-[scale,opacity] duration-100 data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0 dark:border-white dark:bg-neutral-950 dark:text-white">
          <div className="flex flex-col gap-1">
            <Dialog.Title className="text-base font-bold">Notifications</Dialog.Title>
            <Dialog.Description className="text-sm text-neutral-600 dark:text-neutral-400">
              You are all caught up. Good job!
            </Dialog.Description>
          </div>
          <div className="flex justify-end gap-3">
            <Dialog.Close className="flex h-8 items-center border border-neutral-950 bg-white px-3 text-sm text-neutral-950 hover:not-data-disabled:bg-neutral-100 dark:border-white dark:bg-neutral-950 dark:text-white">
              Close
            </Dialog.Close>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

## Gotchas
- When `modal` is `true` or `'trap-focus'`, render `<Dialog.Close>` inside `<Dialog.Popup>` so touch screen readers can escape the popup.
- `Dialog.Title` and `Dialog.Description` are required for proper screen-reader labeling — they wire `aria-labelledby` / `aria-describedby` automatically; supply at least a visually hidden title.
- Use `Dialog.Viewport` when you need the dialog to be scrollable inside its viewport (popup-inside-scroll); without `Viewport`, the popup positions itself directly.
- Pass `eventDetails.preventUnmountOnClose()` inside `onOpenChange` (or use `actionsRef.unmount`) when running close animations beyond the Base UI defaults.
- For multiple triggers driving one dialog, prefer `Dialog.createHandle()` + `<Dialog.Trigger handle={handle} payload={...} />`; access the payload via the `children` render-prop form on `Dialog.Root`.
- Nested dialogs expose `data-nested-dialog-open` on the parent's `Popup`/`Viewport` and increment `--nested-dialogs`; use those to depth-style stacks.
- `Backdrop forceRender` is needed when nesting dialogs that each want their own backdrop instead of inheriting the parent's.
