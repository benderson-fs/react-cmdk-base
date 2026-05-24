# Menu

Import: `import { Menu } from '@base-ui/react/menu'`

## When to use
- Dropdown list of actions or selectable options anchored to a trigger.
- Supports submenus, checkbox/radio items, links, groups, separators, and animated content viewports.
- Compose with `Menubar` for app-style menu bars or with `createHandle` for detached/multi-trigger menus.

## Anatomy
- `Menu.Root`
  - `Menu.Trigger`
  - `Menu.Portal`
    - `Menu.Backdrop`
    - `Menu.Positioner`
      - `Menu.Popup`
        - `Menu.Arrow`
        - `Menu.Item` / `Menu.LinkItem` / `Menu.Separator`
        - `Menu.SubmenuRoot` → `Menu.SubmenuTrigger` (+ nested Portal/Positioner/Popup)
        - `Menu.Group` → `Menu.GroupLabel`
        - `Menu.RadioGroup` → `Menu.RadioItem` → `Menu.RadioItemIndicator`
        - `Menu.CheckboxItem` → `Menu.CheckboxItemIndicator`
        - `Menu.Viewport` (for animated content swaps with multiple triggers)
- `Menu.createHandle()` + `Menu.Handle` — connect a single Root to detached Triggers.

## Parts API

### Menu.Root
Groups all parts. Renders nothing.
**Props:**
- `defaultOpen` — `boolean` (`false`) — initially open (uncontrolled).
- `open` — `boolean` — controlled open state.
- `onOpenChange` — `(open: boolean, eventDetails: Menu.Root.ChangeEventDetails) => void`.
- `highlightItemOnHover` — `boolean` (`true`) — disable to separate CSS `:hover` from `data-highlighted` focus.
- `actionsRef` — `React.RefObject<Menu.Root.Actions | null>` — `{ unmount(): void; close(): void }`.
- `closeParentOnEsc` — `boolean` (`false`) — submenus only: Esc closes the whole tree vs current submenu.
- `defaultTriggerId` / `triggerId` — `string | null` — pair with `defaultOpen`/`open` when the menu is associated with a specific trigger.
- `handle` — `Menu.Handle<Payload>` — connect detached external triggers.
- `loopFocus` — `boolean` (`true`) — wrap arrow-key navigation.
- `modal` — `boolean` (`true`) — `true` locks scroll and blocks outside pointer interaction.
- `onOpenChangeComplete` — `(open: boolean) => void` — fires after close animations finish.
- `disabled` — `boolean` (`false`).
- `orientation` — `Menu.Root.Orientation` (`'vertical'`) — controls arrow-key axis for roving focus.
- `children` — `React.ReactNode | PayloadChildRenderFunction<Payload>` — render function receives `{ payload }` of the active trigger.

`Root.State = {}` (no exposed render-prop state).
`Root.Actions = { unmount(): void; close(): void }`.
`Root.ChangeEventReason = 'trigger-hover' | 'trigger-focus' | 'trigger-press' | 'outside-press' | 'focus-out' | 'list-navigation' | 'escape-key' | 'item-press' | 'close-press' | 'sibling-open' | 'cancel-open' | 'imperative-action' | 'none'`.
`Root.ChangeEventDetails` includes `{ event; cancel(); allowPropagation(); isCanceled; isPropagationAllowed; trigger; preventUnmountOnClose }`.

### Menu.Trigger
Renders a `<button>`.
**Props:**
- `handle` — `Menu.Handle<Payload>`.
- `nativeButton` — `boolean` (`true`) — set `false` when `render`ing a non-button element.
- `payload` — `Payload` — passed to the menu when opened.
- `disabled` — `boolean` (`false`).
- `openOnHover` — `boolean` — open on hover.
- `delay` — `number` (`100`) — hover-open delay ms.
- `closeDelay` — `number` (`0`) — hover-close delay ms.
- `children`, `className`, `style`, `render`.

**Data attributes:** `data-popup-open`, `data-pressed`.
**State:** `{ open: boolean; disabled: boolean }`.

### Menu.Portal
Renders a `<div>` portal.
**Props:**
- `container` — `HTMLElement | ShadowRoot | RefObject | null`.
- `keepMounted` — `boolean` (`false`) — keep mounted while hidden.
- `className`, `style`, `render`.

### Menu.Backdrop
Renders a `<div>` overlay.
**Props:** `className`, `style`, `render`.
**Data attributes:** `data-open`, `data-closed`, `data-starting-style`, `data-ending-style`.
**State:** `{ open; transitionStatus }`.

### Menu.Positioner
Positions the popup. Renders a `<div>`.
**Props:**
- `disableAnchorTracking` — `boolean` (`false`).
- `align` — `Align` (`'center'`) — `'start' | 'center' | 'end'`.
- `alignOffset` — `number | OffsetFunction` (`0`).
- `side` — `Side` (`'bottom'`) — `'top' | 'bottom' | 'left' | 'right' | 'inline-end' | 'inline-start'`.
- `sideOffset` — `number | OffsetFunction` (`0`).
- `arrowPadding` — `number` (`5`) — keeps arrow inside rounded popup corners.
- `anchor` — `Element | VirtualElement | RefObject | (() => Element | VirtualElement | null) | null`.
- `collisionAvoidance` — `{ side: 'flip'|'shift'|'none'; align: 'flip'|'shift'|'none'; fallbackAxisSide: 'start'|'end'|'none' }`.
- `collisionBoundary` — `Boundary` (`'clipping-ancestors'`).
- `collisionPadding` — `Padding` (`5`).
- `sticky` — `boolean` (`false`) — keep popup in viewport after anchor scrolls away.
- `positionMethod` — `'absolute' | 'fixed'` (`'absolute'`).
- `className`, `style`, `render`.

**Data attributes:** `data-open`, `data-closed`, `data-anchor-hidden`, `data-align`, `data-side`.
**CSS variables:** `--anchor-height`, `--anchor-width`, `--available-height`, `--available-width`, `--transform-origin`.
**State:** `{ open; side; align; anchorHidden; nested; instant }`.

### Menu.Popup
Renders a `<div>`.
**Props:**
- `finalFocus` — `boolean | RefObject | ((closeType: InteractionType) => boolean | void | HTMLElement | null)` — controls focus on close. `InteractionType = 'mouse' | 'touch' | 'pen' | 'keyboard' | ''`.
- `children`, `className`, `style`, `render`.

**Data attributes:** `data-open`, `data-closed`, `data-align`, `data-instant` (`'click' | 'dismiss' | 'group' | 'trigger-change'`), `data-side`, `data-starting-style`, `data-ending-style`.
**State:** `{ transitionStatus; side; align; open; nested; instant }`.

### Menu.Arrow
Renders a `<div>`.
**Props:** `className`, `style`, `render`.
**Data attributes:** `data-open`, `data-closed`, `data-uncentered`, `data-align`, `data-side`.
**State:** `{ open; side; align; uncentered }`.

### Menu.Item
Renders a `<div>`.
**Props:**
- `label` — `string` — override text used for typeahead.
- `onClick` — `(event: BaseUIEvent<React.MouseEvent<HTMLDivElement>>) => void`.
- `closeOnClick` — `boolean` (`true`).
- `nativeButton` — `boolean` (`false`).
- `disabled` — `boolean` (`false`).
- `className`, `style`, `render`.

**Data attributes:** `data-highlighted`, `data-disabled`.
**State:** `{ disabled; highlighted }`.

### Menu.Viewport
Animated wrapper for swapping popup content across multiple triggers. Renders a `<div>`.
**Props:** `children`, `className`, `style`, `render`.
**Data attributes:** `data-activation-direction` (space-separated values for the horizontal and vertical axes, e.g. `"left up"` / `"right down"` — used for directional reveal animations), `data-current`, `data-instant`, `data-previous`, `data-transitioning`.
**CSS variables:** `--popup-height`, `--popup-width` (set on the `previous` child).
**State:** `{ activationDirection; transitioning; instant }`.

### Menu.Group
Renders a `<div>`.
**Props:** `children`, `className`, `style`, `render`.

### Menu.GroupLabel
Auto-associated with parent `Menu.Group`. Renders a `<div>`.
**Props:** `className`, `style`, `render`.

### Menu.Separator
Renders a `<div>` with the proper a11y role.
**Props:**
- `orientation` — `'horizontal' | 'vertical'` (`'horizontal'`).
- `className`, `style`, `render`.

**State:** `{ orientation }`.

### Menu.SubmenuRoot
Same prop surface as `Menu.Root` minus `modal` (submenus inherit). Renders nothing. **State:** `{}`.
**Props:** `defaultOpen`, `open`, `onOpenChange`, `highlightItemOnHover`, `actionsRef`, `closeParentOnEsc`, `defaultTriggerId`, `handle` (typed `Menu.Handle<unknown>` — submenus do *not* carry a typed payload, unlike Root), `loopFocus`, `onOpenChangeComplete`, `triggerId`, `disabled`, `orientation` (`'vertical'`), `children` (`React.ReactNode | PayloadChildRenderFunction<unknown>`). Event reason/details mirror `Root.ChangeEventReason` / `Root.ChangeEventDetails`.

### Menu.SubmenuTrigger
Menu item that opens a submenu. Renders a `<div>`.
**Props:**
- `label` — `string`.
- `onClick` — `(event: BaseUIEvent<React.MouseEvent<HTMLDivElement>>) => void`.
- `nativeButton` — `boolean` (`false`).
- `disabled` — `boolean` (`false`).
- `openOnHover` — `boolean`.
- `delay` — `number` (`100`).
- `closeDelay` — `number` (`0`).
- `className`, `style`, `render`.

**Data attributes:** `data-popup-open`, `data-highlighted`, `data-disabled`.
**State:** `{ disabled; highlighted; open }`.

### Menu.RadioGroup
Renders a `<div>`.
**Props:**
- `defaultValue` / `value` — `any`.
- `onValueChange` — `(value: any, eventDetails: Menu.RadioGroup.ChangeEventDetails) => void`.
- `disabled` — `boolean` (`false`).
- `children`, `className`, `style`, `render`.

`RadioGroup.ChangeEventReason` mirrors `Root.ChangeEventReason`; details add `cancel/allowPropagation/isCanceled/isPropagationAllowed/trigger/preventUnmountOnClose`.

### Menu.RadioItem
Renders a `<div>`.
**Props:**
- `value*` — `any` (required).
- `label` — `string`.
- `onClick` — `(event: BaseUIEvent<React.MouseEvent<HTMLDivElement>>) => void`.
- `closeOnClick` — `boolean` (`false`).
- `nativeButton` — `boolean` (`false`).
- `disabled` — `boolean` (`false`).
- `className`, `style`, `render`.

**Data attributes:** `data-checked`, `data-unchecked`, `data-highlighted`, `data-disabled`.
**State:** `{ disabled; highlighted; checked }`.

### Menu.RadioItemIndicator
Renders a `<span>`.
**Props:**
- `keepMounted` — `boolean` (`false`).
- `className`, `style`, `render`.

**Data attributes:** `data-checked`, `data-unchecked`, `data-disabled`, `data-starting-style`, `data-ending-style`.
**State:** `{ checked; disabled; highlighted; transitionStatus }`.

### Menu.CheckboxItem
Renders a `<div>`.
**Props:**
- `label` — `string`.
- `defaultChecked` — `boolean` (`false`).
- `checked` — `boolean` — controlled.
- `onCheckedChange` — `(checked: boolean, eventDetails: Menu.CheckboxItem.ChangeEventDetails) => void`.
- `onClick` — `(event: BaseUIEvent<React.MouseEvent<HTMLDivElement>>) => void`.
- `closeOnClick` — `boolean` (`false`).
- `nativeButton` — `boolean` (`false`).
- `disabled` — `boolean` (`false`).
- `className`, `style`, `render`.

**Data attributes:** `data-checked`, `data-unchecked`, `data-highlighted`, `data-disabled`.
**State:** `{ disabled; highlighted; checked }`. Event reason/details mirror `RadioGroup`.

### Menu.CheckboxItemIndicator
Renders a `<span>`.
**Props:** `keepMounted` (`false`), `className`, `style`, `render`.
**Data attributes:** `data-checked`, `data-unchecked`, `data-disabled`, `data-starting-style`, `data-ending-style`.
**State:** `{ checked; disabled; highlighted; transitionStatus }`.

### Menu.LinkItem
Renders an `<a>`.
**Props:**
- `label` — `string`.
- `closeOnClick` — `boolean` (`false`).
- `className`, `style`, `render`.
- All native anchor props (`href`, `target`, …).

**Data attributes:** `data-highlighted`.
**State:** `{ highlighted }`.

### Menu.createHandle / Menu.Handle
- `createHandle<Payload>(): Menu.Handle<Payload>` — share between a `Menu.Root` (via `handle`) and one or more detached `Menu.Trigger`s.
- `handle.isOpen: boolean` (readonly).
- `handle.open(triggerId: string): void` — open and associate with a `Menu.Trigger` whose `handle` prop matches.
- `handle.close(): void`.

## Keyboard
| Key | Action |
| --- | --- |
| Enter / Space | Open the menu from the trigger; activate the highlighted item. |
| Arrow Down / Up | Move highlight to next/previous item (when `orientation='vertical'`, default). |
| Arrow Right / Left | Move highlight when `orientation='horizontal'`; open/close submenu in vertical menus. |
| Home / End | Jump to first / last item. |
| Type-ahead | Match items by leading characters (use the `label` prop on items with custom content). |
| Escape | Close the current menu (or the entire tree if `closeParentOnEsc`). |
| Tab | Close the menu and move focus naturally. |

## State
- **Open**: uncontrolled via `defaultOpen`; controlled via `open` + `onOpenChange(open, details)`. `details.reason` is one of the enumerated reasons; call `details.cancel()` to veto the state change.
- **Highlighting**: keyboard sets `data-highlighted`; `highlightItemOnHover={false}` prevents pointer hover from changing it.
- **Modality**: `modal` (default `true`) locks scroll and blocks outside pointer events.
- **Payloads**: pass `payload` on each `Menu.Trigger`; in `Menu.Root` `children` as `({ payload }) => ReactNode`, render per-trigger content.
- **Imperative control**: `actionsRef.current.close()` / `actionsRef.current.unmount()`. With `actionsRef.current.unmount`, the menu stays mounted on close until you call `unmount()` — required for external animation libs.

## Animation
- `Menu.Popup` and `Menu.Backdrop` carry `data-starting-style` (entering) and `data-ending-style` (leaving). Use them to define CSS transitions; the component waits for the transition to settle before unmounting unless `actionsRef.current.unmount` is used externally.
- `data-instant` on `Popup` / `Viewport` (`'click' | 'dismiss' | 'group' | 'trigger-change'`) signals that transitions should be skipped — disable them with `[data-instant] { transition: none }`.
- `Menu.RadioItemIndicator` and `Menu.CheckboxItemIndicator` also expose `data-starting-style` / `data-ending-style` for indicator transitions; set `keepMounted` to animate out without unmounting.
- `Menu.Viewport` uses `data-current`, `data-previous`, and `data-transitioning` plus `--popup-width` / `--popup-height` on the previous child to animate content swaps when multiple triggers share one menu.

## Canonical example
```tsx
import { Menu } from '@base-ui/react/menu';

const itemClass =
  "flex cursor-default py-2 pr-8 pl-4 text-sm leading-4 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-white data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:bg-neutral-950 data-highlighted:before:content-[''] data-disabled:text-neutral-500 dark:data-highlighted:text-neutral-950 dark:data-highlighted:before:bg-white";

const popupClass =
  "origin-[var(--transform-origin)] border border-neutral-950 bg-white py-1 text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 outline-hidden transition-[scale,opacity] duration-100 ease-out data-starting-style:scale-[0.98] data-starting-style:opacity-0 data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-instant:transition-none dark:border-white dark:bg-neutral-950 dark:text-white";

export default function ExampleMenu() {
  return (
    <Menu.Root>
      <Menu.Trigger className="flex h-8 items-center gap-1.5 border border-neutral-950 bg-white pl-3 pr-2 text-sm text-neutral-950 data-popup-open:bg-neutral-100 dark:border-white dark:bg-neutral-950 dark:text-white">
        Song
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner className="outline-hidden" sideOffset={8}>
          <Menu.Popup className={popupClass}>
            <Menu.Item className={itemClass}>Add to Library</Menu.Item>
            <Menu.Item className={itemClass}>Add to Playlist</Menu.Item>
            <Menu.Separator className="mx-1 my-1 h-px bg-neutral-950 dark:bg-white" />
            <Menu.SubmenuRoot>
              <Menu.SubmenuTrigger className={itemClass}>Share</Menu.SubmenuTrigger>
              <Menu.Portal>
                <Menu.Positioner sideOffset={-4} alignOffset={-4}>
                  <Menu.Popup className={popupClass}>
                    <Menu.Item className={itemClass}>Copy link</Menu.Item>
                    <Menu.Item className={itemClass}>Embed</Menu.Item>
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Portal>
            </Menu.SubmenuRoot>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
```

## Gotchas
- `Menu.SubmenuTrigger` renders a `<div>`, not a `<button>` — keep `nativeButton` at `false` (default) unless you `render` a real button.
- `Menu.Item` closes the menu on click by default (`closeOnClick: true`). `Menu.CheckboxItem`, `Menu.RadioItem`, and `Menu.LinkItem` default to `false` so toggles persist and links navigate without dismiss.
- Provide `label` on items whose `children` are not plain text so type-ahead navigation works.
- When using `actionsRef` with `unmount`, you must call `actionsRef.current.unmount()` after your external animation finishes — otherwise the popup stays mounted forever.
- `modal={true}` (default) locks page scroll and disables outside pointer events; set to `false` for floating menus that should not trap interaction.
- `Menu.Viewport` is only needed when a single `Menu.Root` is opened by multiple triggers and you want animated content transitions between them.
- Detached triggers require `Menu.createHandle()` + matching `handle` props on both `Menu.Root` and each `Menu.Trigger`; pass `triggerId` to control which trigger the popup anchors against.
- `Menu.Positioner` exposes `--transform-origin` — use it (`transform-origin: var(--transform-origin)`) for natural scale-in animations regardless of `side`/`align`.
- For Esc-handling in nested menus, set `closeParentOnEsc={true}` on inner `SubmenuRoot`s only if Esc should close the whole tree; default closes one level at a time.
