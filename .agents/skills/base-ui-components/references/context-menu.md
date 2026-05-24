# Context Menu

Import: `import { ContextMenu } from '@base-ui/react/context-menu'`

## When to use
- Show a menu of actions on right-click / long-press of an element.
- For menus opened from a clickable trigger button use `Menu`; for app-bar style horizontal menus use `Menubar`.
- For a free-floating popup with arbitrary content (not items) use `Popover`.

## Anatomy
- `ContextMenu.Root` — controller (no DOM).
- `ContextMenu.Trigger` — right-clickable / long-press area (renders `<div>`).
- `ContextMenu.Portal` — portals the popup; optional `Backdrop` inside.
- `ContextMenu.Positioner` — positions popup relative to the contextmenu coordinates.
- `ContextMenu.Popup` — popup container; holds `Arrow`, `Item`s, `Group`, `Separator`, `Submenu*`, `RadioGroup`, `CheckboxItem`, `LinkItem`.
- `ContextMenu.Item` / `LinkItem` / `CheckboxItem` (+ `Indicator`) / `RadioGroup` + `RadioItem` (+ `Indicator`) — interactive rows.
- `ContextMenu.Group` + `ContextMenu.GroupLabel` — labeled section of items.
- `ContextMenu.Separator` — divider row.
- `ContextMenu.SubmenuRoot` + `ContextMenu.SubmenuTrigger` — nested submenu (with another `Portal`/`Positioner`/`Popup`).

## Parts API

### ContextMenu.Root
Doesn't render its own element.
**Props:**
- `defaultOpen` — `boolean` (`false`) — initial open state.
- `open` — `boolean` — controlled open.
- `onOpenChange` — `(open: boolean, eventDetails: ContextMenu.Root.ChangeEventDetails) => void`.
- `onOpenChangeComplete` — `(open: boolean) => void` — fired after close animations finish.
- `highlightItemOnHover` — `boolean` (`true`) — disable to differentiate CSS `:hover` from `data-highlighted`.
- `actionsRef` — `React.RefObject<MenuRoot.Actions | null>` — imperative `{ unmount, close }`. Providing `unmount` prevents auto-unmount; you must call it manually.
- `closeParentOnEsc` — `boolean` (`false`) — when in a submenu, Esc closes the entire menu instead of just the child.
- `defaultTriggerId` / `triggerId` — `string | null` — pair the menu with a specific trigger (handle-based usage).
- `handle` — `MenuHandle<unknown>` — external trigger handle.
- `loopFocus` — `boolean` (`true`) — arrow-key roving loops.
- `disabled` — `boolean` (`false`).
- `orientation` — `'horizontal' | 'vertical'` (`'vertical'`).
- `children` — `React.ReactNode | (({ payload }) => ReactNode)`.

### ContextMenu.Trigger
Renders `<div>`.
**Props:** `className`, `style`, `render`.
**Data attributes:** `data-popup-open`, `data-pressed`.

### ContextMenu.Portal
Renders `<div>`.
**Props:**
- `container` — `HTMLElement | ShadowRoot | RefObject | null`.
- `keepMounted` — `boolean` (`false`).
- `className`, `style`, `render`.

### ContextMenu.Backdrop
Renders `<div>`.
**Props:** `className`, `style`, `render`.
**Data attributes:** `data-open`, `data-closed`, `data-starting-style`, `data-ending-style`.

### ContextMenu.Positioner
Renders `<div>`.
**Props:**
- `anchor` — `Element | VirtualElement | RefObject | (() => …) | null` — default is the context-menu open coordinates.
- `side` — `'top' | 'bottom' | 'left' | 'right' | 'inline-end' | 'inline-start'` (`'bottom'`).
- `align` — `'start' | 'center' | 'end'` (`'center'`).
- `sideOffset` — `number | OffsetFunction` (`0`).
- `alignOffset` — `number | OffsetFunction` (`0`).
- `arrowPadding` — `number` (`5`).
- `collisionAvoidance` — `{ side, align, fallbackAxisSide }` — see source for semantics; `side: 'shift'` forces `align` to `'shift' | 'none'`.
- `collisionBoundary` — `Boundary` (`'clipping-ancestors'`).
- `collisionPadding` — `Padding` (`5`).
- `sticky` — `boolean` (`false`).
- `positionMethod` — `'absolute' | 'fixed'` (`'absolute'`).
- `disableAnchorTracking` — `boolean` (`false`).
- `className`, `style`, `render`.

**Data attributes:** `data-open`, `data-closed`, `data-anchor-hidden`, `data-align` (`'start' | 'center' | 'end'`), `data-side`.
**CSS variables:** `--anchor-height`, `--anchor-width`, `--available-height`, `--available-width`, `--transform-origin`.
**State:** `{ open, side, align, anchorHidden, nested, instant }`.

### ContextMenu.Popup
Renders `<div>`.
**Props:**
- `finalFocus` — `boolean | RefObject | ((closeType: InteractionType) => boolean | void | HTMLElement | null)` — focus target on close.
- `children`, `className`, `style`, `render`.

**Data attributes:** `data-open`, `data-closed`, `data-align`, `data-side`, `data-instant` (`'click' | 'dismiss' | 'group' | 'trigger-change'`), `data-starting-style`, `data-ending-style`.
**State:** `{ open, side, align, transitionStatus, nested, instant }`.

### ContextMenu.Arrow
Renders `<div>`.
**Props:** `className`, `style`, `render`.
**Data attributes:** `data-open`, `data-closed`, `data-uncentered`, `data-align`, `data-side`.

### ContextMenu.Item
Renders `<div>`.
**Props:**
- `label` — `string` — overrides text used for typeahead matching.
- `onClick` — `(event: BaseUIEvent<MouseEvent>) => void`.
- `closeOnClick` — `boolean` (`true`).
- `nativeButton` — `boolean` (`false`) — set `true` if `render` swaps to a `<button>`.
- `disabled` — `boolean` (`false`).
- `className`, `style`, `render`.

**Data attributes:** `data-highlighted`, `data-disabled`.

### ContextMenu.Group / GroupLabel
**Group props:** `children`, `className`, `style`, `render`.
**GroupLabel props:** `className`, `style`, `render`.

### ContextMenu.Separator
Renders `<div>`.
**Props:** `orientation` (`'horizontal'`), `className`, `style`, `render`.

### ContextMenu.SubmenuRoot
Same prop set as `Root` — `defaultOpen`, `open`, `onOpenChange`, `highlightItemOnHover`, `actionsRef`, `closeParentOnEsc`, `defaultTriggerId`/`triggerId`, `handle`, `loopFocus`, `onOpenChangeComplete`, `disabled`, `orientation`, `children`. Renders nothing. The `ChangeEventDetails` adds `preventUnmountOnClose()` like Root.

### ContextMenu.SubmenuTrigger
Renders `<div>`.
**Props:** `label`, `onClick`, `nativeButton` (`false`), `disabled`, `openOnHover` (`boolean`), `delay` (`number`, `100`), `closeDelay` (`number`, `0`), `className`, `style`, `render`.
**Data attributes:** `data-popup-open`, `data-highlighted`, `data-disabled`.

### ContextMenu.RadioGroup
**Props:** `defaultValue` / `value` (`any`), `onValueChange` — `(value, eventDetails) => void`, `disabled` (`false`), `children`, `className`, `style`, `render`.

### ContextMenu.RadioItem
Renders `<div>`.
**Props:** `value*` (required), `label`, `onClick`, `closeOnClick` (`false`), `nativeButton` (`false`), `disabled` (`false`), `className`, `style`, `render`.
**Data attributes:** `data-checked`, `data-unchecked`, `data-highlighted`, `data-disabled`.

### ContextMenu.RadioItemIndicator
Renders `<span>`.
**Props:** `keepMounted` (`false`), `className`, `style`, `render`.
**Data attributes:** `data-checked`, `data-unchecked`, `data-disabled`, `data-starting-style`, `data-ending-style`.

### ContextMenu.CheckboxItem
Renders `<div>`.
**Props:** `label`, `defaultChecked` (`false`), `checked` (`boolean`), `onCheckedChange` — `(checked, eventDetails) => void`, `onClick`, `closeOnClick` (`false`), `nativeButton` (`false`), `disabled` (`false`), `className`, `style`, `render`.
**Data attributes:** `data-checked`, `data-unchecked`, `data-highlighted`, `data-disabled`.

### ContextMenu.CheckboxItemIndicator
Renders `<span>`.
**Props:** `keepMounted` (`false`), `className`, `style`, `render`.
**Data attributes:** `data-checked`, `data-unchecked`, `data-disabled`, `data-starting-style`, `data-ending-style`.

### ContextMenu.LinkItem
Renders `<a>`.
**Props:** `label`, `closeOnClick` (`false`), `className`, `style`, `render` (plus native `<a>` props).
**Data attributes:** `data-highlighted`.

## Keyboard
| Key | Action |
| --- | --- |
| ContextMenu / Shift+F10 | Open the menu at the focused element. |
| Long press (touch) | Open the menu. |
| Arrow Up / Down | Move highlight between items (vertical orientation). |
| Arrow Left / Right | In submenus, open/close the nested menu; or move when `orientation='horizontal'`. |
| Home / End | Jump to first / last item. |
| Enter / Space | Activate the highlighted item. |
| Type-to-search | Highlight by item text (override via `label`). |
| Escape | Close the current (sub)menu; closes whole menu if `closeParentOnEsc` on submenu. |

## State
- Uncontrolled: `defaultOpen`. Controlled: `open` + `onOpenChange`.
- `ChangeEventDetails.reason`: `'trigger-hover' | 'trigger-focus' | 'trigger-press' | 'outside-press' | 'focus-out' | 'list-navigation' | 'escape-key' | 'item-press' | 'close-press' | 'sibling-open' | 'cancel-open' | 'imperative-action' | 'none'`; details expose `cancel()`, `allowPropagation()`, `isCanceled`, `isPropagationAllowed`, `trigger`; submenu / checkbox / radio change-details also include `preventUnmountOnClose`.
- `CheckboxItem` mirrors checked state via `defaultChecked` / `checked` + `onCheckedChange`.
- `RadioGroup` mirrors selection via `defaultValue` / `value` + `onValueChange`.

## Animation
- Animate the popup via `data-starting-style` / `data-ending-style` on `Popup` and use `--transform-origin` for scale/zoom effects.
- `data-instant` on `Popup` signals "skip transitions" (e.g. switching between sibling submenus).
- Pair animations with `Portal keepMounted` if you need the exit transition to run.
- `RadioItemIndicator` / `CheckboxItemIndicator` carry their own `data-starting-style` / `data-ending-style`; use `keepMounted` if you want them to animate out when unchecking.

## Canonical example
```tsx
import { ContextMenu } from '@base-ui/react/context-menu';

const ITEM =
  "flex cursor-default py-2 pr-8 pl-4 text-sm leading-4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-white data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:bg-neutral-950 data-highlighted:before:content-[''] data-disabled:text-neutral-500 dark:data-highlighted:text-neutral-950 dark:data-highlighted:before:bg-white";

export default function ExampleContextMenu() {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger className="flex h-48 w-60 items-center justify-center border border-neutral-950 bg-white text-neutral-950 select-none dark:border-white dark:bg-neutral-950 dark:text-white">
        Right click here
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Positioner className="outline-hidden">
          <ContextMenu.Popup className="origin-[var(--transform-origin)] border border-neutral-950 bg-white py-1 text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 outline-hidden transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none">
            <ContextMenu.Item className={ITEM}>Add to Library</ContextMenu.Item>
            <ContextMenu.Item className={ITEM}>Add to Playlist</ContextMenu.Item>
            <ContextMenu.Separator className="mx-1 my-1 h-px bg-neutral-950 dark:bg-white" />
            <ContextMenu.Item className={ITEM}>Play Next</ContextMenu.Item>
            <ContextMenu.Item className={ITEM}>Play Last</ContextMenu.Item>
          </ContextMenu.Popup>
        </ContextMenu.Positioner>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
```

## Gotchas
- `Trigger` renders a `<div>` (not a button) because it must capture `contextmenu` / long-press events — do not wrap it in a button.
- `Popup` MUST be inside `Positioner` MUST be inside `Portal`. Without the Portal pairing, focus management and stacking-context behavior break.
- For submenus add another `ContextMenu.Portal`/`Positioner`/`Popup` inside `SubmenuRoot`; `SubmenuTrigger` only renders the row label.
- `CheckboxItem` and `RadioItem` default to `closeOnClick: false` (unlike `Item` which is `true`) — set `closeOnClick` explicitly if you want the opposite.
- When animating popup exit, ensure `Portal keepMounted` or the popup unmounts before `data-ending-style` runs.
- The default positioning anchor is the right-click point. Pass `anchor` only if you need a fixed/virtual anchor, which disables the right-click-position behavior.
