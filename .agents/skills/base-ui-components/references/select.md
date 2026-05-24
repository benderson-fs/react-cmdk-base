# Select

Import: `import { Select } from '@base-ui/react/select'`

## When to use
- Pick a value (or values, with `multiple`) from a known list inside a dropdown popup.
- When the trigger needs to stay button-like and the listbox must be a true popup (portalled, focus-managed, ARIA listbox/option semantics).
- Prefer Autocomplete/Combobox when typing or filtering is required.

## Anatomy
- `Select.Root`
  - `Select.Label`
  - `Select.Trigger`
    - `Select.Value`
    - `Select.Icon`
  - `Select.Portal`
    - `Select.Backdrop`
    - `Select.Positioner`
      - `Select.Popup`
        - `Select.Arrow`
        - `Select.ScrollUpArrow`
        - `Select.List`
          - `Select.Group` -> `Select.GroupLabel`
          - `Select.Item` -> `Select.ItemIndicator`, `Select.ItemText`
          - `Select.Separator`
        - `Select.ScrollDownArrow`

## Parts API

### Select.Root
Does not render its own element. Owns value, open state, and item registry.

**Props:**
- `name`, `form`, `id`, `autoComplete`, `disabled`, `readOnly`, `required`: form-style props.
- `defaultValue` / `value`: `Value[] | Value | null`.
- `onValueChange`: `(value, eventDetails: Select.Root.ChangeEventDetails) => void`.
- `defaultOpen` / `open` (default `false` / —), `onOpenChange`: `(open, eventDetails) => void`.
- `onOpenChangeComplete`: `(open: boolean) => void`.
- `highlightItemOnHover`: `boolean` (default `true`).
- `actionsRef`: `React.RefObject<Select.Root.Actions | null>` (`{ unmount }` for animation libs).
- `isItemEqualToValue`: `(itemValue, value) => boolean` (defaults to `Object.is`).
- `itemToStringLabel`: `(itemValue) => string` for object-valued items.
- `itemToStringValue`: `(itemValue) => string` for form submission of object values.
- `items`: `Record<string, ReactNode> | { label; value }[] | Group[]`.
- `modal`: `boolean` (default `true`).
- `multiple`: `boolean` (default `false`).
- `inputRef`: `React.Ref<HTMLInputElement>` for the hidden form input.

### Select.Trigger
Renders a `<button>` (`nativeButton` default `true`). Opens the popup.

**Props:** `nativeButton`, `disabled`, `children`, `className`, `style`, `render`.
**Data attributes:** `data-popup-open`, `data-popup-side`, `data-pressed`, `data-disabled`, `data-readonly`, `data-required`, `data-valid`, `data-invalid`, `data-dirty`, `data-touched`, `data-filled`, `data-focused`, `data-placeholder`.

### Select.Value
Renders `<span>`. Displays current value or placeholder.

**Props:** `placeholder`, `children` (`ReactNode | (value) => ReactNode`), `className`, `style`, `render`.
**Data attributes:** `data-placeholder`.

### Select.Icon
Decorative chevron next to the value. Renders `<span>`.
**Props:** `className`, `style`, `render`.
**Data attributes:** `data-popup-open`.

### Select.Label
Renders `<div>`. Visible label automatically associated with the trigger.
**Props:** `className`, `style`, `render`. **Data attributes:** none.

### Select.Portal
**Props:** `container`: `HTMLElement | ShadowRoot | RefObject<HTMLElement | ShadowRoot | null> | null`, plus `className`, `style`, `render`.

### Select.Backdrop
Optional overlay underneath the popup. Renders `<div>`.
**Data attributes:** `data-open`, `data-closed`, `data-starting-style`, `data-ending-style`.

### Select.Positioner
Positions the popup against the trigger. Renders `<div>`.

**Props:**
- `alignItemWithTrigger`: `boolean` (default `true`) — overlap trigger so selected item text aligns (mouse only).
- `disableAnchorTracking`: `boolean` (default `false`).
- `align`: `'start' | 'center' | 'end'` (default `'center'`).
- `alignOffset`: `number | OffsetFunction` (default `0`).
- `side`: `'top' | 'bottom' | 'left' | 'right' | 'inline-start' | 'inline-end'` (default `'bottom'`).
- `sideOffset`: `number | OffsetFunction` (default `0`).
- `arrowPadding`: `number` (default `5`).
- `anchor`: `Element | VirtualElement | RefObject<Element | null> | (() => Element | VirtualElement | null) | null`.
- `collisionAvoidance`: `{ side?: 'flip' | 'shift' | 'none'; align?: 'flip' | 'shift' | 'none'; fallbackAxisSide?: 'start' | 'end' | 'none' }`.
- `collisionBoundary`: `Boundary` (default `'clipping-ancestors'`).
- `collisionPadding`: `Padding` (default `5`).
- `sticky`: `boolean` (default `false`).
- `positionMethod`: `'absolute' | 'fixed'` (default `'absolute'`).
- `className`, `style`, `render`.

**Data attributes:** `data-open`, `data-closed`, `data-anchor-hidden`, `data-align`, `data-side`.
**CSS variables:** `--anchor-height`, `--anchor-width`, `--available-height`, `--available-width`, `--transform-origin`.

### Select.Popup
Inner container. Renders `<div>`.

**Props:** `finalFocus`: `boolean | RefObject<HTMLElement | null> | ((closeType: InteractionType) => boolean | void | HTMLElement | null)`, `children`, `className`, `style`, `render`.
**Data attributes:** `data-open`, `data-closed`, `data-align`, `data-side`, `data-starting-style`, `data-ending-style`.

### Select.Arrow
Optional pointer. Renders `<div>`.
**Data attributes:** `data-open`, `data-closed`, `data-uncentered`, `data-align`, `data-side`.

### Select.List
The listbox container. Renders `<div>`. **Props:** `className`, `style`, `render`.

### Select.Item
Single option. Renders `<div>` (or button via `nativeButton`).
**Props:** `label`, `value` (default `null`), `nativeButton` (default `false`), `disabled` (default `false`), `children`, `className`, `style`, `render`.
**Data attributes:** `data-selected`, `data-highlighted`, `data-disabled`.

### Select.ItemText
Renders `<div>`. The accessible text of an item.

### Select.ItemIndicator
Renders `<span>`. Shown when item is selected.
**Props:** `keepMounted`: `boolean`, `children`, `className`, `style`, `render`.
**Data attributes:** `data-starting-style`, `data-ending-style`.

### Select.Group
Wraps related items. Renders `<div>`.

### Select.GroupLabel
Auto-associates with its parent group. Renders `<div>`.

### Select.Separator
Renders `<div>`. **Props:** `orientation`: `'horizontal' | 'vertical'` (default `'horizontal'`).

### Select.ScrollUpArrow / Select.ScrollDownArrow
Hover-to-scroll arrows; not rendered for touch input. Renders `<div>`.
**Props:** `keepMounted`: `boolean` (default `false`), `className`, `style`, `render`.
**Data attributes:** `data-direction` (`'up' | 'down'`), `data-side`, `data-visible`, `data-starting-style`, `data-ending-style`.

## Keyboard
| Key | Effect |
| --- | --- |
| Space / Enter | Open popup from trigger; select highlighted item from list. |
| Arrow Down / Arrow Up | Open popup or move highlight down/up. |
| Home / End | Highlight first / last item. |
| Letter keys | Typeahead match by `label` / text content. |
| Esc | Close popup (returns focus to trigger). |
| Tab | Close popup and move focus to the next focusable element. |

## State

```ts
type SelectRootState = {};
type SelectRootActions = { unmount: () => void };
type SelectRootChangeEventReason =
  | 'trigger-press' | 'outside-press' | 'escape-key' | 'window-resize'
  | 'item-press' | 'focus-out' | 'list-navigation' | 'cancel-open' | 'none';
type SelectRootChangeEventDetails = /* discriminated by reason */ & {
  cancel: () => void; allowPropagation: () => void;
  isCanceled: boolean; isPropagationAllowed: boolean;
  trigger: Element | undefined;
};

type SelectTriggerState = {
  open: boolean; readOnly: boolean; popupSide: Side | null;
  value: any; placeholder: boolean; disabled: boolean;
  touched: boolean; dirty: boolean; valid: boolean | null;
  filled: boolean; focused: boolean;
};
type SelectPositionerState = { open: boolean; side: Side | 'none'; align: Align; anchorHidden: boolean };
type SelectPopupState = { side: Side | 'none'; align: Align; open: boolean; transitionStatus: TransitionStatus };
type SelectItemState = { disabled: boolean; selected: boolean; highlighted: boolean };
type SelectItemIndicatorState = { selected: boolean; transitionStatus: TransitionStatus };
type SelectArrowState = { open: boolean; side: Side | 'none'; align: Align; uncentered: boolean };
type SelectBackdropState = { open: boolean; transitionStatus: TransitionStatus };
type SelectLabelState = {
  disabled: boolean; touched: boolean; dirty: boolean;
  valid: boolean | null; filled: boolean; focused: boolean;
};
type SelectSeparatorState = { orientation: 'horizontal' | 'vertical' };
// All of these are empty — exposed for render-prop typing parity:
type SelectIconState = {};
type SelectValueState = {};
type SelectPortalState = {};
type SelectItemTextState = {};
type SelectListState = {};
type SelectGroupState = {};
type SelectGroupLabelState = {};
type SelectScrollUpArrowState = {};
type SelectScrollDownArrowState = {};

type Side = 'top' | 'bottom' | 'left' | 'right' | 'inline-end' | 'inline-start';
type Align = 'start' | 'center' | 'end';
type InteractionType = 'mouse' | 'touch' | 'pen' | 'keyboard' | '';
type OffsetFunction = (data: {
  side: Side; align: Align;
  anchor: { width: number; height: number };
  positioner: { width: number; height: number };
}) => number;
```

Controlled: `<Select.Root value={v} onValueChange={setV} open={o} onOpenChange={setO}>`. Uncontrolled: `defaultValue` / `defaultOpen`.

## Animation
`Popup`, `Backdrop`, `ItemIndicator`, and the scroll arrows expose `data-starting-style` and `data-ending-style`. Use `--transform-origin` on `Popup` to scale from the anchor. Provide `actionsRef.unmount()` to integrate with external animation libraries.

## Canonical example
```tsx
// Tailwind v4
import * as React from 'react';
import { Select } from '@base-ui/react/select';

const apples = [
  { label: 'Gala', value: 'gala' },
  { label: 'Fuji', value: 'fuji' },
  { label: 'Honeycrisp', value: 'honeycrisp' },
];

export default function ExampleSelect() {
  return (
    <Select.Root items={apples}>
      <Select.Label className="text-sm font-bold">Apple</Select.Label>
      <Select.Trigger className="flex h-8 min-w-40 items-center justify-between gap-3 border border-neutral-950 bg-white pl-2 pr-1 text-sm text-neutral-950 hover:not-data-disabled:bg-neutral-100 data-popup-open:bg-neutral-100 dark:border-white dark:bg-neutral-950 dark:text-white">
        <Select.Value placeholder="Select apple" className="data-placeholder:text-neutral-500" />
        <Select.Icon>▼</Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner className="z-10 outline-hidden" sideOffset={4}>
          <Select.Popup className="min-w-[var(--anchor-width)] origin-[var(--transform-origin)] border border-neutral-950 bg-white text-neutral-950 transition-[scale,opacity] duration-100 data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0 dark:border-white dark:bg-neutral-950 dark:text-white">
            <Select.List className="max-h-[var(--available-height)] overflow-y-auto py-1">
              {apples.map(({ label, value }) => (
                <Select.Item
                  key={value}
                  value={value}
                  className="grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 px-2 py-1.5 text-sm outline-hidden data-highlighted:bg-neutral-950 data-highlighted:text-white"
                >
                  <Select.ItemIndicator className="col-start-1">✓</Select.ItemIndicator>
                  <Select.ItemText className="col-start-2">{label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
```

## Gotchas
- `Select.Root` has no `Root.State` data attributes — style state lives on `Trigger`, `Positioner`, `Popup`, `Item`.
- `modal={true}` (default) locks page scroll and blocks outside pointer events; set to `false` when nesting in another modal context.
- When item values are objects, supply `isItemEqualToValue` to avoid identity bugs; if the shape is `{ label, value }`, Base UI infers both labels and submission values.
- `alignItemWithTrigger` only applies to mouse-opened popups and is auto-disabled when there is no space — do not rely on positioning across viewports.
- `--available-height` on `Positioner` defines the maximum height the listbox should claim; apply it as `max-height` to `Select.List` so it shrinks near viewport edges.
- `Select.ScrollUpArrow` / `Select.ScrollDownArrow` are hidden on touch; provide native scroll handling on `Select.List` (`overflow-y-auto`) regardless.
- `actionsRef.current?.unmount()` is required to manually unmount when integrating with libraries that delay exit animations beyond CSS.
