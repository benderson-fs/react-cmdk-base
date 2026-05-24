# Checkbox

Import: `import { Checkbox } from '@base-ui/react/checkbox'`

## When to use
- Single boolean (or tri-state) input; pair with a `<label>` or `Field.Label` for an accessible name.
- Use `indeterminate` for "some children checked" parent states (typically inside `CheckboxGroup` with `parent`).
- Use `Switch` for on/off settings where toggling is immediate; use `Checkbox` for form-style multi-select.

## Anatomy
- `Checkbox.Root` — the interactive checkbox (renders a `<span>` and a hidden `<input>` so it submits with forms)
- `Checkbox.Indicator` — visual tick/dash; hidden when unchecked unless `keepMounted`

## Parts API

### Checkbox.Root
Renders a `<span>` element and a hidden `<input>` alongside.
**Props:**
- `name` — `string` (`undefined`) — form field name (submitted via hidden input)
- `defaultChecked` — `boolean` (`false`) — uncontrolled initial value
- `checked` — `boolean` (`undefined`) — controlled value
- `onCheckedChange` — `(checked: boolean, eventDetails: Checkbox.Root.ChangeEventDetails) => void`
- `indeterminate` — `boolean` (`false`) — mixed state (neither checked nor unchecked)
- `value` — `string` — submitted form value when checked. Source lists no Base UI default; if omitted, the browser uses its native `"on"` fallback for checkboxes.
- `form` — `string` — id of the owning `<form>` when the checkbox is rendered outside it
- `nativeButton` — `boolean` (`false`) — set `true` when `render` produces a native `<button>` (default `Root` is a `<span>`)
- `parent` — `boolean` (`false`) — marks this checkbox as the parent of a `CheckboxGroup`
- `uncheckedValue` — `string` — value submitted when unchecked (by default, unchecked submits nothing, matching native)
- `disabled` — `boolean` (`false`)
- `readOnly` — `boolean` (`false`)
- `required` — `boolean` (`false`)
- `inputRef` — `React.Ref<HTMLInputElement>` — ref to the hidden `<input>`
- `id` — `string` — id forwarded to the hidden input (use for `htmlFor` on sibling labels)
- `className` — `string \| ((state: Checkbox.Root.State) => string \| undefined)`
- `style` — `React.CSSProperties \| ((state) => React.CSSProperties \| undefined)`
- `render` — `ReactElement \| ((props: HTMLProps, state) => ReactElement)`

**Data attributes:**
- `data-checked` / `data-unchecked`
- `data-disabled` / `data-readonly` / `data-required`
- `data-indeterminate`
- `data-valid` / `data-invalid` / `data-dirty` / `data-touched` / `data-filled` / `data-focused` (only present when wrapped in `Field.Root`)

### Checkbox.Indicator
Renders a `<span>`. Visual indicator for the checked/indeterminate state.
**Props:**
- `keepMounted` — `boolean` (`false`) — keep in DOM when unchecked (needed for exit animations)
- `className` — `string \| ((state: Checkbox.Indicator.State) => string \| undefined)`
- `style` — `React.CSSProperties \| ((state) => React.CSSProperties \| undefined)`
- `render` — `ReactElement \| ((props, state) => ReactElement)`

**Data attributes:**
- `data-checked` / `data-unchecked`
- `data-disabled` / `data-readonly` / `data-required`
- `data-indeterminate`
- `data-valid` / `data-invalid` / `data-dirty` / `data-touched` / `data-filled` / `data-focused` (in `Field.Root`)
- `data-starting-style` / `data-ending-style`

## Keyboard
| Key | Action |
| --- | --- |
| `Space` | Toggle the checkbox |
| `Tab` / `Shift+Tab` | Move focus to/from the control |

## State
- Uncontrolled: `defaultChecked` (+ optional `indeterminate`)
- Controlled: `checked` + `onCheckedChange`
- `ChangeEventReason` is `'none'`; `ChangeEventDetails` provides `event`, `cancel()`, `allowPropagation()`, `isCanceled`, `isPropagationAllowed`, `trigger`
- When wrapped in `Field.Root`, validation state (`valid`, `dirty`, `touched`, etc.) is exposed via data attributes and state for both `Root` and `Indicator`

## Animation
- `Checkbox.Indicator` exposes `data-starting-style` / `data-ending-style` and a `transitionStatus` state value.
- Use `keepMounted` on `Indicator` so the exit animation can run before the node is removed.

## Canonical example
```tsx
import * as React from 'react';
import { Checkbox } from '@base-ui/react/checkbox';

export default function ExampleCheckbox() {
  return (
    <label className="flex items-center gap-2 text-sm font-normal text-neutral-950 dark:text-white">
      <Checkbox.Root
        defaultChecked
        className="flex size-4 shrink-0 items-center justify-center rounded-none border border-neutral-950 bg-white p-0 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 data-checked:bg-neutral-950 data-checked:text-white dark:border-white dark:bg-neutral-950 dark:text-neutral-950 dark:focus-visible:outline-white dark:data-checked:bg-white dark:data-checked:text-neutral-950"
      >
        <Checkbox.Indicator className="flex data-unchecked:hidden">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            style={{ display: 'block' }}
          >
            <path d="m2.5 8.5 4 4 7-9" />
          </svg>
        </Checkbox.Indicator>
      </Checkbox.Root>
      Enable notifications
    </label>
  );
}
```

## Gotchas
- `Checkbox.Root` defaults to a `<span>` so it can sit inside a wrapping `<label>` without invalid HTML. Pass `render={<button />} nativeButton` for the sibling-label pattern (`htmlFor`/`id`).
- For a native button inside a wrapping `<label>`, use the `render` callback so the hidden input ends up outside the label (see Examples in source).
- `uncheckedValue` is opt-in — by default unchecked checkboxes submit nothing (mirrors native).
- `indeterminate` only affects visuals/ARIA; it doesn't change `checked`. The next user interaction clears `indeterminate` and toggles `checked` normally.
- Validation-related `data-*` attributes (`data-valid`, `data-touched`, ...) only appear when wrapped in `Field.Root`.
- The hidden `<input>` is what posts to the form; use `inputRef` if you need direct access (e.g., for imperative `.focus()`).
