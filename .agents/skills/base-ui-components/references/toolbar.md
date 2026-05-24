# Toolbar

Import: `import { Toolbar } from '@base-ui/react/toolbar'`

## When to use
- Group of related controls (buttons, toggles, popup triggers, link, input) sharing toolbar keyboard semantics (arrow-key roving focus).
- Compose Base UI popup triggers via `Toolbar.Button render={<Menu.Trigger />}` etc.
- Use only one `Toolbar.Input` in a horizontal toolbar (place last) to avoid arrow-key conflict with text caret.

## Anatomy
```
Toolbar.Root
  Toolbar.Button
  Toolbar.Link
  Toolbar.Separator
  Toolbar.Group
    Toolbar.Button
    Toolbar.Button
  Toolbar.Input
```

## Parts API

### Toolbar.Root
Container. Source says it renders `<div>`; the part follows the WAI-ARIA toolbar pattern, so style/treat it as if `role="toolbar"` were applied.

**Props:**
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| loopFocus | `boolean` | `true` | Wrap arrow-key focus at toolbar ends. |
| disabled | `boolean` | - | Disable the whole toolbar. |
| orientation | `'horizontal' \| 'vertical'` | `'horizontal'` | Toolbar orientation (drives arrow-key axis). |
| className | `string \| ((state: Toolbar.Root.State) => string \| undefined)` | - | Class. |
| style | `React.CSSProperties \| ((state: Toolbar.Root.State) => React.CSSProperties \| undefined)` | - | Style. |
| render | `ReactElement \| ((props: HTMLProps, state: Toolbar.Root.State) => ReactElement)` | - | Replace element. |

**Data attributes:** `data-orientation`, `data-disabled`.

**CSS variables:** none.

### Toolbar.Button
Renders `<button>`. Use the `render` prop to swap in a `Menu.Trigger`, `Select.Trigger`, `Popover.Trigger`, `Dialog.Trigger`, `AlertDialog.Trigger`, or `Toggle`.

**Props:**
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| focusableWhenDisabled | `boolean` | `true` | Disabled items still receive focus (so screen-reader users hear them). |
| nativeButton | `boolean` | `true` | Set false when `render` produces non-button. |
| disabled | `boolean` | `false` | Disable item. |
| className, style, render | (state-driven) | - | Standard. |

**Data attributes:** `data-orientation`, `data-disabled`, `data-focusable` (present when focusable-while-disabled).

### Toolbar.Link
Renders `<a>`. Standard props (`className`, `style`, `render`). Pass through `href` directly.

**Data:** `data-orientation`.

### Toolbar.Separator
Source says it renders `<div>`; semantically a WAI-ARIA separator within a toolbar.

**Props:** `orientation` (`'horizontal' | 'vertical'`, default `'horizontal'`), `className`, `style`, `render`.

**Data:** `data-orientation`.

### Toolbar.Group
Visually and semantically groups items inside the toolbar. Renders `<div>`.

**Props:** `disabled` (disables all child items), `className`, `style`, `render`.

**Data:** `data-orientation`, `data-disabled`.

### Toolbar.Input
Native input that integrates with toolbar roving focus. Renders `<input>`.

**Props:**
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| defaultValue | `string \| number \| string[]` | - | Initial value. |
| focusableWhenDisabled | `boolean` | `true` | Stay focusable when disabled. |
| disabled | `boolean` | `false` | Disable. |
| className, style, render | (state-driven) | - | Standard. Use `render={<NumberField.Input />}` to compose with NumberField. |

**Data:** `data-orientation`, `data-disabled`, `data-focusable`.

**CSS variables:** none.

## Keyboard
| Key | Action |
| :--- | :--- |
| ArrowLeft / ArrowRight | Move focus across items (horizontal). |
| ArrowUp / ArrowDown | Move focus across items (vertical). |
| Home / End | Move to first / last item. |
| Tab | Move focus outside the toolbar. (One item is in the tab order at a time.) |
| Enter / Space | Activate the focused button / link. |

## State
Toolbar itself is stateless beyond `disabled` + `orientation`. Each part exposes its own `State`:
```ts
type ToolbarRootState   = { disabled: boolean; orientation: 'horizontal' | 'vertical' };
type ToolbarButtonState = { disabled: boolean; focusable: boolean; orientation: 'horizontal' | 'vertical' };
type ToolbarInputState  = { disabled: boolean; focusable: boolean; orientation: 'horizontal' | 'vertical' };
type ToolbarGroupState  = { disabled: boolean; orientation: 'horizontal' | 'vertical' };
type ToolbarLinkState   = { orientation: 'horizontal' | 'vertical' };
type ToolbarSeparatorState = { orientation: 'horizontal' | 'vertical' };
```

## Animation
No transition surface of its own.

## Canonical example
```tsx
// Tailwind v4
import * as React from 'react';
import { Toolbar } from '@base-ui/react/toolbar';
import { ToggleGroup } from '@base-ui/react/toggle-group';
import { Toggle } from '@base-ui/react/toggle';
import { Select } from '@base-ui/react/select';

const btn =
  'flex h-8 min-w-8 items-center justify-center gap-2 bg-transparent px-3 text-sm text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:not-data-pressed:bg-neutral-200 data-pressed:bg-neutral-950 data-pressed:text-white data-popup-open:bg-neutral-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:data-pressed:bg-white dark:data-pressed:text-neutral-950 dark:focus-visible:outline-white';

export default function ExampleToolbar() {
  return (
    <Toolbar.Root className="flex w-150 items-center gap-px border border-neutral-950 bg-white p-px dark:border-white dark:bg-neutral-950">
      <ToggleGroup className="flex" aria-label="Alignment">
        <Toolbar.Button render={<Toggle />} aria-label="Align left" value="align-left" className={btn}>
          Align Left
        </Toolbar.Button>
        <Toolbar.Button render={<Toggle />} aria-label="Align right" value="align-right" className={btn}>
          Align Right
        </Toolbar.Button>
      </ToggleGroup>
      <Toolbar.Separator className="m-1 h-4 w-px bg-neutral-950 dark:bg-white" />
      <Toolbar.Group className="flex" aria-label="Numerical format">
        <Toolbar.Button className={btn} aria-label="Format as currency">$</Toolbar.Button>
        <Toolbar.Button className={btn} aria-label="Format as percent">%</Toolbar.Button>
      </Toolbar.Group>
      <Toolbar.Separator className="m-1 h-4 w-px bg-neutral-950 dark:bg-white" />
      <Select.Root defaultValue="Helvetica">
        <Toolbar.Button render={<Select.Trigger />} className={`${btn} min-w-32 justify-between`}>
          <Select.Value />
          <Select.Icon>v</Select.Icon>
        </Toolbar.Button>
        <Select.Portal>
          <Select.Positioner className="z-10" sideOffset={4}>
            <Select.Popup className="border border-neutral-950 bg-white text-neutral-950 dark:border-white dark:bg-neutral-950 dark:text-white">
              <Select.Item value="Helvetica" className="px-2.5 py-1.5 text-sm data-highlighted:bg-neutral-950 data-highlighted:text-white dark:data-highlighted:bg-white dark:data-highlighted:text-neutral-950">
                <Select.ItemText>Helvetica</Select.ItemText>
              </Select.Item>
              <Select.Item value="Arial" className="px-2.5 py-1.5 text-sm data-highlighted:bg-neutral-950 data-highlighted:text-white dark:data-highlighted:bg-white dark:data-highlighted:text-neutral-950">
                <Select.ItemText>Arial</Select.ItemText>
              </Select.Item>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
      <Toolbar.Separator className="m-1 h-4 w-px bg-neutral-950 dark:bg-white" />
      <Toolbar.Link className="ml-auto mr-3 self-center text-sm text-neutral-500 hover:text-blue-700 dark:text-neutral-400 dark:hover:text-blue-500" href="#">
        Edited 51m ago
      </Toolbar.Link>
    </Toolbar.Root>
  );
}
```

## Gotchas
- Use only one `Toolbar.Input` in a horizontal toolbar — left/right arrows are needed for the caret. Place it as the last element.
- Disabled items remain focusable by default (`focusableWhenDisabled: true`) so screen-reader users can hear them. Set false to skip them entirely.
- Pass popup triggers via `Toolbar.Button render={<Menu.Trigger />}` etc. — works for `AlertDialog`, `Dialog`, `Menu`, `Popover`, `Select`.
- For `Tooltip`, the relationship is inverted: pass the toolbar item into the tooltip — `Tooltip.Trigger render={<Toolbar.Button />}`.
- For `NumberField`, pass `<NumberField.Input />` into `Toolbar.Input` via `render` — `<Toolbar.Input render={<NumberField.Input />} />`.
- The toolbar always has exactly one item in the tab order; arrow keys move the roving tabstop within.
- `Toolbar.Group` is purely organizational — it does not provide its own value tracking. Use `ToggleGroup` (separate component) when you need pressed-value state.
