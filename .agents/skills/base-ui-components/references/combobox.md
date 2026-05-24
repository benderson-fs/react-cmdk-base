# Combobox

Import: `import { Combobox } from '@base-ui/react/combobox'`

## When to use
- Autocomplete-style text input that filters a list of options and supports keyboard selection (single or `multiple`).
- For a non-typeable dropdown of options use `Select`.
- For arbitrary popover content use `Popover`; for a global command palette use a Combobox with `inline` or `modal`.

## Anatomy
- `Combobox.Root` — controller; type-infers the item shape from `value`/`defaultValue`.
- `Combobox.Label` — optional label associated with the input.
- `Combobox.InputGroup` — visual container for input + adornments.
- `Combobox.Input` — text input.
- `Combobox.Trigger` / `Combobox.Icon` / `Combobox.Clear` — adornments inside the group.
- `Combobox.Value` — read-only render of the current selection.
- `Combobox.Chips` + `Combobox.Chip` + `Combobox.ChipRemove` — chips for multi-select.
- `Combobox.Portal` → `Combobox.Backdrop` (optional) → `Combobox.Positioner` → `Combobox.Popup` — floating popup.
- Inside Popup: `Combobox.Arrow`, `Combobox.Status`, `Combobox.Empty`, `Combobox.List` (with `Row`, `Item`, `ItemIndicator`, `Group`, `GroupLabel`, `Collection`, `Separator`).

## Parts API

### Combobox.Root
Doesn't render its own element.
**Props:**
- `name` — `string` — form name for hidden input.
- `defaultValue` / `value` — `Value | Value[] | null` — single or multi.
- `onValueChange` — `(value, eventDetails) => void`.
- `defaultInputValue` / `inputValue` — `string | number | string[]` (string[] in multiple mode).
- `onInputValueChange` — `(inputValue: string, eventDetails) => void`.
- `defaultOpen` / `open` — `boolean`.
- `onOpenChange` — `(open, eventDetails) => void`.
- `onOpenChangeComplete` — `(open: boolean) => void`.
- `autoHighlight` — `boolean` (`false`) — auto-highlight first match while filtering.
- `highlightItemOnHover` — `boolean` (`true`).
- `actionsRef` — `RefObject<Combobox.Root.Actions | null>` — exposes `{ unmount }`.
- `autoComplete` — `string` — browser autofill hint.
- `filter` — `((itemValue, query, itemToString?) => boolean) | null` — replace the default filter.
- `filteredItems` — `any[] | Group[]` — supply your own filtered list (used with `useFilter`).
- `form` — `string` — id of external form.
- `grid` — `boolean` (`false`) — grid navigation across `Row`s.
- `inline` — `boolean` (`false`) — render list inline (no popup).
- `isItemEqualToValue` — `(itemValue, value) => boolean` (default `Object.is`).
- `itemToStringLabel` — `(itemValue) => string` — label for object items (auto-resolved if shape is `{ value, label }`).
- `itemToStringValue` — `(itemValue) => string` — form-submit value for object items.
- `items` — `any[] | Group[]`.
- `limit` — `number` (`-1`).
- `locale` — `Intl.LocalesArgument`.
- `loopFocus` — `boolean` (`true`) — input is always in the loop per ARIA APG.
- `modal` — `boolean` (`false`) — lock body scroll & dismiss-outside.
- `multiple` — `boolean` (`false`).
- `onItemHighlighted` — `(highlightedValue, eventDetails) => void` — `eventDetails.reason` is `'keyboard' | 'pointer' | 'none'`.
- `openOnInputClick` — `boolean` (`true`).
- `virtualized` — `boolean` (`false`).
- `disabled` / `readOnly` / `required` — `boolean` (`false`).
- `inputRef` — `Ref<HTMLInputElement>` — hidden form input.
- `id` — `string`.
- `children` — `React.ReactNode`.

### Combobox.Label
Renders `<div>`. Auto-associates with the trigger. **Props:** `className`, `style`, `render`.

### Combobox.InputGroup
Renders `<div>`. **Props:** `className`, `style`, `render`.
**Data attributes:** `data-popup-open`, `data-popup-side`, `data-list-empty`, `data-pressed`, `data-disabled`, `data-readonly`, `data-valid`, `data-invalid`, `data-dirty`, `data-touched`, `data-filled`, `data-focused`, `data-placeholder`.
**State:** `{ open, disabled, readOnly, popupSide, listEmpty, placeholder, touched, dirty, valid, filled, focused }` — mirrors the data attrs for render-prop callbacks.

### Combobox.Input
Renders `<input>`. **Props:** `disabled`, `className`, `style`, `render`.
**Data attributes:** `data-popup-open`, `data-popup-side`, `data-list-empty`, `data-pressed`, `data-disabled`, `data-readonly`, `data-required`, `data-valid`, `data-invalid`, `data-dirty`, `data-touched`, `data-filled`, `data-focused`.

### Combobox.Trigger
Renders `<button>`. **Props:** `nativeButton` (`true`), `disabled`, `className`, `style`, `render`.
**Data attributes:** same as `Input` plus `data-placeholder`.

### Combobox.Icon
Renders `<span>`. **Props:** `className`, `style`, `render`.

### Combobox.Clear
Renders `<button>`. **Props:** `nativeButton` (`true`), `disabled`, `keepMounted` (`false`), `className`, `style`, `render`.
**Data attributes:** `data-popup-open`, `data-disabled`, `data-visible`, `data-starting-style`, `data-ending-style`.

### Combobox.Value
Doesn't render an element. **Props:** `placeholder`, `children` (`ReactNode | (selectedValue) => ReactNode`).

### Combobox.List
Renders `<div>`. **Props:** `children` (`ReactNode | (item, index) => ReactNode`), `className`, `style`, `render`.
State exposes `{ empty }`. When child is a function, `List` implicitly wraps with `Collection`.

### Combobox.Collection
Doesn't render an element. **Props:** `children*` — `(item, index) => ReactNode`. Use when you need an explicit grouped Collection (or with `Group items={…}`).

### Combobox.Row
Renders `<div>`. Use when `grid` is set on `Root`. **Props:** `className`, `style`, `render`.

### Combobox.Portal
Renders `<div>`. **Props:** `container`, `keepMounted` (`false`), `className`, `style`, `render`.

### Combobox.Backdrop
Renders `<div>`. **Props:** `className`, `style`, `render`.
**Data attributes:** `data-open`, `data-closed`, `data-starting-style`, `data-ending-style`.

### Combobox.Positioner
Renders `<div>`. **Props:**
- `anchor` — `Element | VirtualElement | RefObject | (() => …) | null`.
- `side` (`'bottom'`), `align` (`'center'`), `sideOffset` (`0`), `alignOffset` (`0`), `arrowPadding` (`5`).
- `collisionAvoidance` — `{ side, align, fallbackAxisSide }`.
- `collisionBoundary` (`'clipping-ancestors'`), `collisionPadding` (`5`).
- `sticky` (`false`), `positionMethod` (`'absolute'`), `disableAnchorTracking` (`false`).
- `className`, `style`, `render`.

**Data attributes:** `data-open`, `data-closed`, `data-anchor-hidden`, `data-align`, `data-empty`, `data-side`.
**CSS variables:** `--anchor-height`, `--anchor-width`, `--available-height`, `--available-width`, `--transform-origin`.

### Combobox.Popup
Renders `<div>`. **Props:** `initialFocus`, `finalFocus` (boolean | RefObject | function of `InteractionType`), `className`, `style`, `render`.
**Data attributes:** `data-open`, `data-closed`, `data-align`, `data-empty`, `data-side`, `data-instant` (`'click' | 'dismiss'`), `data-starting-style`, `data-ending-style`.

### Combobox.Arrow
Renders `<div>`. **Props:** `className`, `style`, `render`.
**Data attributes:** `data-open`, `data-closed`, `data-uncentered`, `data-align`, `data-side`.

### Combobox.Item
Renders `<div>`. **Props:**
- `value` (`any`, `null`) — selection key.
- `onClick`, `index` (`number`, perf hint), `nativeButton` (`false`), `disabled` (`false`), `children`, `className`, `style`, `render`.

**Data attributes:** `data-selected`, `data-highlighted`, `data-disabled`.

### Combobox.ItemIndicator
Renders `<span>`. **Props:** `children`, `keepMounted` (`false`), `className`, `style`, `render`.
**Data attributes:** `data-starting-style`, `data-ending-style`.

### Combobox.Group
Renders `<div>`. **Props:** `items` (used by child `Collection`), `className`, `style`, `render`.
### Combobox.GroupLabel
Renders `<div>`. **Props:** `className`, `style`, `render`.

### Combobox.Separator
Renders `<div>`. **Props:** `orientation` (`'horizontal'`), `className`, `style`, `render`.

### Combobox.Chips / Chip / ChipRemove
- `Chips` — `<div>` container for chip rows. **Props:** `className`, `style`, `render`.
- `Chip` — `<div>` representing a selected value. **Props:** `className`, `style`, `render`. State has `disabled`.
- `ChipRemove` — `<button>`. **Props:** `nativeButton` (`true`), `className`, `style`, `render`.

### Combobox.Status
Renders `<div>`. Announces children to screen readers; must stay mounted (toggle `children`, not the component). **Props:** `className`, `style`, `render`.

### Combobox.Empty
Renders `<div>`. Shows only when filtered list is empty; must stay mounted. Requires `items` prop on Root. **Props:** `className`, `style`, `render`.

### Hooks
- `Combobox.useFilter(options?: ComboboxFilterOptions): ComboboxFilter` — `{ contains, startsWith, endsWith }` using `Intl.Collator`. Use to drive external `filter` prop or `filteredItems`.
- `Combobox.useFilteredItems(): T[]` — read the internally filtered items (must be called inside `Combobox.Root`).

## Keyboard
| Key | Action |
| --- | --- |
| Type | Filter list, open popup. |
| Arrow Down / Up | Highlight next / previous item (or move into list from input). |
| Arrow Left / Right | In `grid` mode, navigate columns. |
| Home / End | Highlight first / last item. |
| Enter | Select highlighted item. |
| Escape | Close popup; second press clears input value (when `Clear` available). |
| Backspace (empty input, multiple) | Remove the last chip. |
| Tab | Move focus out of the popup. |

## State
- Selection: `defaultValue` / `value` + `onValueChange` (single or array when `multiple`).
- Input string: `defaultInputValue` / `inputValue` + `onInputValueChange`.
- Open state: `defaultOpen` / `open` + `onOpenChange` (+ `onOpenChangeComplete`).
- `ChangeEventDetails.reason`: `'trigger-press' | 'outside-press' | 'item-press' | 'close-press' | 'escape-key' | 'list-navigation' | 'focus-out' | 'input-change' | 'input-clear' | 'clear-press' | 'chip-remove-press' | 'none'`; details include `cancel()`, `allowPropagation()`, `isCanceled`, `isPropagationAllowed`, `trigger`.
- `HighlightEventDetails.reason`: `'keyboard' | 'pointer' | 'none'` plus `index`.
- Form: hidden input named via `name`; `itemToStringValue` maps object items to form values.

## Animation
- Popup transitions via `data-starting-style` / `data-ending-style` on `Popup` / `Backdrop` / `ItemIndicator` / `Clear`. Combine with `--transform-origin` for scale-in effects.
- `data-instant` on `Popup` indicates a non-animated state change (e.g. click/dismiss switch).
- Use `Portal keepMounted` or `Clear keepMounted` / `ItemIndicator keepMounted` if you need exit animations.
- `Status` and `Empty` must stay mounted to announce changes to screen readers — animate children, not the part itself.

## Canonical example
```tsx
'use client';
import * as React from 'react';
import { Combobox } from '@base-ui/react/combobox';

interface Fruit { label: string; value: string }
const fruits: Fruit[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Orange', value: 'orange' },
  { label: 'Pineapple', value: 'pineapple' },
];

export default function ExampleCombobox() {
  const id = React.useId();
  return (
    <Combobox.Root items={fruits}>
      <div className="relative flex flex-col gap-1 text-sm font-bold text-neutral-950 dark:text-white">
        <label htmlFor={id}>Choose a fruit</label>
        <Combobox.InputGroup className="relative h-8 w-56 border border-neutral-950 bg-white focus-within:outline-2 focus-within:-outline-offset-1 focus-within:outline-neutral-950 dark:border-white dark:bg-neutral-950 dark:focus-within:outline-white">
          <Combobox.Input
            id={id}
            placeholder="e.g. Apple"
            className="h-full w-full border-0 bg-white pl-2 pr-16 text-sm font-normal text-neutral-950 outline-none placeholder:text-neutral-500 dark:bg-neutral-950 dark:text-white"
          />
          <div className="absolute right-0 bottom-0 flex h-full items-center text-neutral-500 dark:text-neutral-400">
            <Combobox.Clear className="flex h-full w-6 items-center justify-center text-neutral-950 dark:text-white" aria-label="Clear">
              <XIcon />
            </Combobox.Clear>
            <Combobox.Trigger className="flex h-full w-6 items-center justify-center text-neutral-950 dark:text-white" aria-label="Open">
              <CaretIcon />
            </Combobox.Trigger>
          </div>
        </Combobox.InputGroup>
      </div>

      <Combobox.Portal>
        <Combobox.Positioner sideOffset={4} className="outline-none">
          <Combobox.Popup className="w-[var(--anchor-width)] max-w-[var(--available-width)] origin-[var(--transform-origin)] border border-neutral-950 bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0_rgb(0_0_0_/_12%)] transition-[scale,opacity] duration-100 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none">
            <Combobox.Empty>
              <div className="px-2 py-4 text-sm text-neutral-500 dark:text-neutral-400">No fruits found.</div>
            </Combobox.Empty>
            <Combobox.List className="max-h-[min(22.5rem,var(--available-height))] overflow-y-auto py-1 outline-0 data-empty:p-0">
              {(item: Fruit) => (
                <Combobox.Item
                  key={item.value}
                  value={item}
                  className="grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 p-2 text-sm outline-none select-none data-highlighted:bg-neutral-950 data-highlighted:text-white dark:data-highlighted:bg-white dark:data-highlighted:text-neutral-950"
                >
                  <Combobox.ItemIndicator className="col-start-1"><CheckIcon /></Combobox.ItemIndicator>
                  <span className="col-start-2">{item.label}</span>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}

function CheckIcon(p: React.ComponentProps<'svg'>) { return (<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" {...p}><path d="m2.5 8.5 4 4 7-9" /></svg>); }
function XIcon(p: React.ComponentProps<'svg'>) { return (<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" {...p}><path d="m4.5 4.5 7 7m-7 0 7-7" /></svg>); }
function CaretIcon(p: React.ComponentProps<'svg'>) { return (<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" {...p}><path d="M12 6H4l4 4.5z" /></svg>); }
```

## Gotchas
- `Popup` MUST be inside `Positioner` MUST be inside `Portal`. Skipping the portal breaks stacking and focus.
- Item value identity uses `Object.is`; pass `isItemEqualToValue` for object items, and provide `itemToStringLabel` / `itemToStringValue` so the input displays/submits the right strings.
- `Empty` and `Status` MUST remain mounted (no `display: none` / unmount) — switch their `children` instead, otherwise screen readers will not pick up updates.
- For async filtering, control filtering externally with `useFilter` and pass results to `filteredItems`. Also pass `items` so Empty/internal accounting still work; or feed the filtered list via `filteredItems`.
- Multi-select needs `multiple` AND chips rendered via `Combobox.Chips` / `Chip` / `ChipRemove` inside `InputGroup`; without `multiple`, chip parts will not behave. **The canonical pattern wraps the chip map in `<Combobox.Value>`** so the current value array is delivered to your render function: `<InputGroup><Chips><Combobox.Value>{(value: T[]) => (<>{value.map((item) => <Chip>…<ChipRemove /></Chip>)}<Combobox.Input /></>)}</Combobox.Value></Chips></InputGroup>`. The `Combobox.Input` typically lives *inside* the `Value` render callback so its placeholder can react to `value.length`. Base UI does not auto-render chips — you map `value` yourself.
- In `multiple` mode the popup default is to stay open after each selection (so the user can pick more); the canonical Base UI multi-select example does not close on selection. To force-close on Enter or click, control `open` yourself and read `eventDetails.reason` in `onValueChange`. The full reason union per source: `'trigger-press' | 'outside-press' | 'item-press' | 'close-press' | 'escape-key' | 'list-navigation' | 'focus-out' | 'input-change' | 'input-clear' | 'clear-press' | 'chip-remove-press' | 'none'`. Treat `'item-press'` and `'list-navigation'` as "user picked something — you may want to close".
- `defaultInputValue` / `inputValue` source type is `string | number | string[]`. The `string[]` shape applies to tag-input scenarios where the input is a chip editor; for the standard "type-to-filter" combobox you only need the `string` variant.
- `inline` removes the popup and renders the list directly — do not pair with `Portal` in that mode.
- For typed wrappers, propagate `<Value, Multiple>` generics: `Combobox.Root.Props<Value, Multiple extends boolean | undefined = false>`.
