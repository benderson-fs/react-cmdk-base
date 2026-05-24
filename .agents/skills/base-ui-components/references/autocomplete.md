# Autocomplete

Import: `import { Autocomplete } from '@base-ui/react/autocomplete'`

## When to use
- Free-text input that suggests/filters a list of items as the user types (search boxes, command palettes, tag pickers).
- Use `Combobox` when the user must pick from a fixed set (the input enforces a chosen value). Use `Select` when there is no free-text typing.
- Set `mode="inline"` or `mode="both"` to fill the highlighted item into the input as the user navigates; `inline` (root prop) renders the list without a popup.

## Anatomy
- `Autocomplete.Root` — owns value, open, filtering, items
- `Autocomplete.InputGroup` — wraps the input area and its controls
- `Autocomplete.Input` — the search input
- `Autocomplete.Trigger` — button that toggles the popup
- `Autocomplete.Icon` — decorative trigger affordance
- `Autocomplete.Clear` — clears the value
- `Autocomplete.Value` — read-only render of the current value
- `Autocomplete.Portal` — portals popup tree
- `Autocomplete.Backdrop` — optional dim layer
- `Autocomplete.Positioner` — anchors popup to the input/trigger
- `Autocomplete.Popup` — popup container
- `Autocomplete.Arrow` — optional anchor pointer
- `Autocomplete.Status` / `Autocomplete.Empty` — live regions / empty state
- `Autocomplete.List` — list container; `Autocomplete.Collection` renders filtered items
- `Autocomplete.Group` / `Autocomplete.GroupLabel` / `Autocomplete.Separator` / `Autocomplete.Row` — grouping/grid scaffolding
- `Autocomplete.Item` — selectable entry
- Hooks: `Autocomplete.useFilter()`, `Autocomplete.useFilteredItems()`

## Parts API

### Autocomplete.Root
Does not render its own element. Owns state.
**Props:**
- `name` — `string` — form field name
- `defaultValue` — `string \| number \| string[]` — uncontrolled initial value
- `value` — `string \| string[] \| number` — controlled value
- `onValueChange` — `(value: string, eventDetails: Autocomplete.Root.ChangeEventDetails) => void`
- `defaultOpen` — `boolean` (`false`)
- `open` — `boolean` — controlled open state
- `onOpenChange` — `(open: boolean, eventDetails: Autocomplete.Root.ChangeEventDetails) => void`
- `autoHighlight` — `boolean \| 'always'` (`false`) — `true` highlights first match after typing; `'always'` keeps the first item highlighted
- `keepHighlight` — `boolean` (`false`) — preserve highlight when pointer leaves the list
- `highlightItemOnHover` — `boolean` (`true`) — pointer hover sets the highlight (disable to differentiate `:hover` vs `data-highlighted`)
- `actionsRef` — `RefObject<Autocomplete.Root.Actions | null>` — exposes `{ unmount }` for externally managed exit animations
- `filter` — `((itemValue, query, itemToString?) => boolean) \| null` — custom predicate
- `filteredItems` — `any[] \| Group[]` — pre-filtered items (use with `useFilter()`)
- `form` — `string` — id of the owning form
- `grid` — `boolean` (`false`) — enable grid navigation (arrows move across DOM rows/cols)
- `inline` — `boolean` (`false`) — render list inline without popup
- `itemToStringValue` — `(itemValue) => string` — extracts display/submitted string from object items (auto when items are `{ value, label }`)
- `items` — `({ items: any[] })[] \| ItemValue[]` — flat or grouped items
- `limit` — `number` (`-1`) — max items shown
- `locale` — `Intl.LocalesArgument` — for string comparison
- `loopFocus` — `boolean` (`true`) — loop arrow-key focus back to input at list ends (input is always part of focus loop per ARIA APG)
- `modal` — `boolean` (`false`) — lock page scroll + outside interaction while open
- `mode` — `'list' | 'both' | 'inline' | 'none'` (`'list'`) — `list`: filter only; `both`: filter + inline autocompletion of input; `inline`: static items + inline autocompletion; `none`: static, no input mutation
- `onItemHighlighted` — `(highlightedValue, eventDetails: HighlightEventDetails) => void` — `reason`: `'keyboard' | 'pointer' | 'none'`
- `onOpenChangeComplete` — `(open: boolean) => void` — after open/close transitions
- `openOnInputClick` — `boolean` (`false`)
- `submitOnItemClick` — `boolean` (`false`) — submit owning form when an item is chosen
- `virtualized` — `boolean` (`false`) — disables internal scroll/DOM assumptions for external virtualization
- `disabled` / `readOnly` / `required` — `boolean` (`false`)
- `inputRef` — `React.Ref<HTMLInputElement>`
- `id` — `string`
- `children` — `React.ReactNode`

### Autocomplete.Trigger
Renders a `<button>`. Opens the popup.
**Props:** `nativeButton` (`true`), `disabled` (`false`), `className`, `style`, `render`.
**Data attributes:** `data-popup-open`, `data-popup-side` (`'top' | 'bottom' | 'left' | 'right' | 'inline-start' | 'inline-end' | null`), `data-list-empty`, `data-pressed`, `data-disabled`, `data-readonly`, `data-required`, plus Field state attrs (`data-valid`/`data-invalid`/`data-dirty`/`data-touched`/`data-filled`/`data-focused`).

### Autocomplete.Value
Does not render an element.
**Props:** `children` — `React.ReactNode | ((value: string) => React.ReactNode)`.

### Autocomplete.Input
Renders an `<input>`.
**Props:** `disabled` (`false`), `className`, `style`, `render`.
**Data attributes:** `data-popup-open`, `data-popup-side`, `data-list-empty`, `data-pressed`, `data-disabled`, `data-readonly`, `data-required`, plus Field state attrs (`data-valid`/`data-invalid`/`data-dirty`/`data-touched`/`data-filled`/`data-focused`). Same set as Trigger.

### Autocomplete.Icon
Renders a `<span>`. Decorative chevron/affordance.
**Props:** `className`, `style`, `render`.

### Autocomplete.Clear
Renders a `<button>`. Clears the value.
**Props:** `nativeButton` (`true`), `disabled` (`false`), `keepMounted` (`false`), `className`, `style`, `render`.
**Data attributes:** `data-popup-open`, `data-disabled`, `data-visible`, `data-starting-style`, `data-ending-style`.

### Autocomplete.List
Renders a `<div>`. Container; when given a function child, it implicitly wraps a `Collection`.
**Props:** `children` (`React.ReactNode | ((item, index) => React.ReactNode)`), `className`, `style`, `render`.

### Autocomplete.Portal
Renders a `<div>` portalled to `<body>` by default.
**Props:** `container`, `keepMounted` (`false`), `className`, `style`, `render`.

### Autocomplete.Backdrop
Renders a `<div>` behind the popup.
**Props:** `className`, `style`, `render`.
**Data attributes:** `data-open`, `data-closed`, `data-starting-style`, `data-ending-style`.

### Autocomplete.Positioner
Renders a `<div>`. Floating-UI positioning.
**Props:**
- `disableAnchorTracking` — `boolean` (`false`)
- `align` — `Align` (`'center'`); `alignOffset` — `number | OffsetFunction` (`0`)
- `side` — `Side` (`'bottom'`); `sideOffset` — `number | OffsetFunction` (`0`)
- `arrowPadding` — `number` (`5`)
- `anchor` — `Element | VirtualElement | RefObject<Element | null> | (() => …) | null`
- `collisionAvoidance` — `{ side?: 'flip'|'shift'|'none'; align?: 'flip'|'shift'|'none'; fallbackAxisSide?: 'start'|'end'|'none' }`
- `collisionBoundary` — `Boundary` (`'clipping-ancestors'`)
- `collisionPadding` — `Padding` (`5`)
- `sticky` — `boolean` (`false`)
- `positionMethod` — `'absolute' | 'fixed'` (`'absolute'`)
- `className`, `style`, `render`

**Data attributes:** `data-open`, `data-closed`, `data-anchor-hidden`, `data-align`, `data-empty`, `data-side`.
**CSS variables:** `--anchor-height`, `--anchor-width`, `--available-height`, `--available-width`, `--transform-origin`.

### Autocomplete.Popup
Renders a `<div>`.
**Props:** `initialFocus`, `finalFocus` (`boolean | RefObject<HTMLElement | null> | ((openType: InteractionType) => boolean | void | HTMLElement | null)`), `className`, `style`, `render`.
**Data attributes:** `data-open`, `data-closed`, `data-align`, `data-empty`, `data-instant` (`'click' | 'dismiss'`), `data-side`, `data-starting-style`, `data-ending-style`.

### Autocomplete.Arrow
Renders a `<div>` aligned to the anchor.
**Props:** `className`, `style`, `render`.
**Data attributes:** `data-open`, `data-closed`, `data-uncentered`, `data-align`, `data-side`.

### Autocomplete.Item
Renders a `<div>`. A selectable entry.
**Props:** `value` (`any`, default `null`), `onClick`, `index` (perf hint), `nativeButton` (default `false`), `disabled` (`false`), `children`, `className`, `style`, `render`.
**Data attributes:** `data-highlighted`, `data-disabled`.

### Autocomplete.Group / GroupLabel
- `Group` renders a `<div>`; props: `items` (any[] passed to inner `Collection`), `className`, `style`, `render`. Data attrs: `data-popup-open`, `data-popup-side`, `data-list-empty`, `data-pressed`, `data-disabled`, `data-readonly`, plus Field state attrs (**no `data-required`** — only Trigger and Input carry that).
- `GroupLabel` renders a `<div>` automatically labelling its parent group; props: `className`, `style`, `render`.

### Autocomplete.Separator
Renders a `<div>` with separator semantics.
**Props:** `orientation` — `'horizontal' | 'vertical'` (`'horizontal'`), `className`, `style`, `render`.

### Autocomplete.Status
Renders a `<div>` (polite live region). **Must remain mounted** in the DOM so screen readers announce updates consistently. Per source, do **not** hide it with `display: none`, `hidden`, `aria-hidden`, or conditional rendering — update or conditionally render its **children** instead.
**Props:** `className`, `style`, `render`.

### Autocomplete.Empty
Renders a `<div>` only when the list is empty (requires `items` on Root). Polite live region — same mounting rules as `Status`: do not hide with `display: none`, `hidden`, `aria-hidden`, or conditional rendering.
**Props:** `className`, `style`, `render`.

### Autocomplete.Collection
Doesn't render its own element. For grouped lists; flat lists can use a function child on `List` instead.
**Props:** `children*` — `(item, index) => React.ReactNode`.

### Autocomplete.Row
Renders a `<div>`. Single row in a grid layout (requires `grid` on Root).
**Props:** `className`, `style`, `render`.

### Autocomplete.InputGroup
Renders a `<div>` wrapping input + controls.
**Props:** `className`, `style`, `render`.
**Data attributes:** `data-popup-open`, `data-popup-side`, `data-list-empty`, `data-pressed`, `data-disabled`, `data-readonly`, plus Field state attrs (**no `data-required`** — only Trigger and Input expose it).

### Hooks
- `useFilter(options?: { locale?: Intl.LocalesArgument }) → AutocompleteFilter` — returns `{ contains, startsWith, endsWith }`, each `(item, query, itemToString?) => boolean` using `Intl.Collator`.
- `useFilteredItems<T>() → T[]` — read internally filtered items inside the Root subtree.

## Keyboard
| Key | Action |
| --- | --- |
| Typing | Filters items (modes `list`/`both`) |
| `ArrowDown` / `ArrowUp` | Move highlight; from input wraps to first/last when `loopFocus` |
| `ArrowLeft` / `ArrowRight` | In `grid` mode, move highlight across columns |
| `Home` / `End` | First/last item |
| `Enter` | Select highlighted item (submits form if `submitOnItemClick`) |
| `Esc` | Close the popup, then clear |
| `Tab` | Move focus out (popup closes per APG) |

## State
- Uncontrolled: `defaultValue`, `defaultOpen`
- Controlled value: `value` + `onValueChange`
- Controlled open: `open` + `onOpenChange`
- Phase callback: `onOpenChangeComplete(open)`
- `ChangeEventReason` ∈ `'trigger-press' | 'outside-press' | 'item-press' | 'close-press' | 'escape-key' | 'list-navigation' | 'focus-out' | 'input-change' | 'input-clear' | 'clear-press' | 'chip-remove-press' | 'none'`
- `ChangeEventDetails` exposes `cancel()`, `allowPropagation()`, `isCanceled`, `isPropagationAllowed`, `trigger`
- `HighlightEventDetails` carries `reason` (`'keyboard' | 'pointer' | 'none'`), `event`, `index`
- `actionsRef.current.unmount()` lets you defer unmount for external exit animations

## Animation
- `Backdrop`/`Popup` expose `data-starting-style` and `data-ending-style`; `Popup` also exposes `data-instant` (`'click' | 'dismiss'`) to skip animations.
- Use `--anchor-width` / `--anchor-height` / `--available-height` / `--available-width` / `--transform-origin` on the Positioner for size-matched, viewport-aware transitions.
- `Clear` has its own `data-starting-style` / `data-ending-style` and `data-visible`; pair with `keepMounted` to animate its exit.

## Canonical example
```tsx
'use client';
import { Autocomplete } from '@base-ui/react/autocomplete';

interface Tag { id: string; value: string }

const tags: Tag[] = [
  { id: 't1', value: 'feature' },
  { id: 't2', value: 'fix' },
  { id: 't3', value: 'bug' },
  { id: 't4', value: 'docs' },
];

export default function ExampleAutocomplete() {
  return (
    <Autocomplete.Root items={tags}>
      <label className="flex flex-col gap-1 text-sm font-bold text-neutral-950 dark:text-white">
        Search tags
        <Autocomplete.Input
          placeholder="e.g. feature"
          className="h-8 w-[16rem] border border-neutral-950 bg-white px-2 text-sm font-normal text-neutral-950 placeholder:text-neutral-500 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:border-white dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400 dark:focus:outline-white"
        />
      </label>

      <Autocomplete.Portal>
        <Autocomplete.Positioner className="outline-hidden" sideOffset={4}>
          <Autocomplete.Popup className="w-[var(--anchor-width)] max-w-[var(--available-width)] border border-neutral-950 bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none">
            <Autocomplete.Empty>
              <div className="py-4 pr-4 pl-2 text-sm text-neutral-500 dark:text-neutral-400">
                No tags found.
              </div>
            </Autocomplete.Empty>
            <Autocomplete.List className="max-h-[min(22.5rem,var(--available-height))] overflow-y-auto py-1">
              {(tag: Tag) => (
                <Autocomplete.Item
                  key={tag.id}
                  value={tag}
                  className="flex cursor-default items-center gap-2 px-2 py-2 text-sm select-none data-highlighted:bg-neutral-950 data-highlighted:text-white dark:data-highlighted:bg-white dark:data-highlighted:text-neutral-950"
                >
                  {tag.value}
                </Autocomplete.Item>
              )}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  );
}
```

## Gotchas
- Always render the popup inside `Autocomplete.Portal` and inside an `Autocomplete.Positioner` — the positioner sets the anchor metrics (`--anchor-*`, `--available-*`).
- `Autocomplete.Status` and `Autocomplete.Empty` are live regions: keep them mounted and update their children, do not toggle the element with `display:none` or conditional rendering.
- For object items, either shape them as `{ value, label }` (auto-recognized) or pass `itemToStringValue` so display and form submission work.
- `mode="inline"` / `mode="both"` mutate the input value as the user navigates — disable when this would confuse users (e.g. multi-select chips).
- `filter={null}` disables internal filtering; use with `filteredItems` and `useFilter()` for external (debounced/async) filtering.
- `loopFocus` always includes the input in the loop per ARIA APG — `ArrowUp` from the input lands on the last item.
- When using `actionsRef`, the dialog/popup is not auto-unmounted; you must call `unmount()` after exit animations finish.
- Grid mode (`grid` on Root, `Row` children) repurposes arrow keys for 2D navigation — ensure your DOM rows correspond to visual rows.
