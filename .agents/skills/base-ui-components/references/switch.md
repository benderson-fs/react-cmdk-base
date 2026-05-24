# Switch

Import: `import { Switch } from '@base-ui/react/switch'`

## When to use
- Binary on/off setting that applies immediately (no submit step).
- Prefer over Checkbox when the change has an instantaneous effect on the system.
- Must have an accessible name via wrapping `<label>`, sibling `htmlFor`/`id`, or `Field`.

## Anatomy
```
Switch.Root
  Switch.Thumb
```

Root renders a `<span>` plus a sibling hidden `<input>`. To render as a real `<button>` (e.g. for sibling labels), set `nativeButton` and `render={<button />}`.

## Parts API

### Switch.Root
Represents the switch. Renders `<span>` + hidden `<input>`.

**Props:**
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| name | `string` | - | Identifies the field when a form is submitted. |
| defaultChecked | `boolean` | `false` | Initial checked state (uncontrolled). |
| checked | `boolean` | - | Controlled checked state. |
| onCheckedChange | `((checked: boolean, eventDetails: Switch.Root.ChangeEventDetails) => void)` | - | Called when activated/deactivated. |
| value | `string` | - | Form value when on. Defaults to `"on"`. |
| form | `string` | - | Form id when switch is rendered outside the form. |
| nativeButton | `boolean` | `false` | Set true when `render` produces a native `<button>`. |
| uncheckedValue | `string` | - | Form value when off. Default: no value submitted. |
| disabled | `boolean` | `false` | Ignore user interaction. |
| readOnly | `boolean` | `false` | User cannot toggle. |
| required | `boolean` | `false` | Must be on to submit form. |
| inputRef | `React.Ref<HTMLInputElement>` | - | Ref to the hidden `<input>`. |
| id | `string` | - | Element id. |
| className | `string \| ((state: Switch.Root.State) => string \| undefined)` | - | Class or state-driven class. |
| style | `React.CSSProperties \| ((state: Switch.Root.State) => React.CSSProperties \| undefined)` | - | Style or state-driven style. |
| render | `ReactElement \| ((props: HTMLProps, state: Switch.Root.State) => ReactElement)` | - | Replace element or compose. |

**Data attributes:** `data-checked`, `data-unchecked`, `data-disabled`, `data-readonly`, `data-required`, `data-valid`, `data-invalid`, `data-dirty`, `data-touched`, `data-filled`, `data-focused` (the last six only apply when wrapped in `Field.Root`).

**CSS variables:** none.

### Switch.Thumb
The movable indicator. Renders `<span>`.

**Props:** `className`, `style`, `render` (same signatures as Root, typed against `Switch.Thumb.State`).

**Data attributes:** same as Root (`data-checked`, `data-unchecked`, `data-disabled`, `data-readonly`, `data-required`, `data-valid`, `data-invalid`, `data-dirty`, `data-touched`, `data-filled`, `data-focused`).

**CSS variables:** none.

## Keyboard
| Key | Action |
| :--- | :--- |
| Space | Toggle checked state. |
| Enter | Toggle checked state (when rendered as button) and submit form if applicable. |
| Tab / Shift+Tab | Move focus to/from switch. |

## State
```tsx
// Uncontrolled
<Switch.Root defaultChecked />

// Controlled
const [checked, setChecked] = React.useState(false);
<Switch.Root
  checked={checked}
  onCheckedChange={(next, details) => setChecked(next)}
/>
```

`State` shape for both parts:
```ts
type SwitchRootState = {
  checked: boolean;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  touched: boolean;
  dirty: boolean;
  valid: boolean | null;
  filled: boolean;
  focused: boolean;
};
```

`ChangeEventReason` is `'none'`. `ChangeEventDetails` exposes `reason`, `event`, `cancel()`, `allowPropagation()`, `isCanceled`, `isPropagationAllowed`, `trigger`.

## Animation
No transition surface beyond CSS state transitions. Use `data-checked` / `data-unchecked` on Root or Thumb to drive transitions in CSS.

## Canonical example
```tsx
// Tailwind v4
import { Switch } from '@base-ui/react/switch';

export default function ExampleSwitch() {
  return (
    <label className="flex items-center gap-2 text-sm font-normal text-neutral-950 dark:text-white">
      <Switch.Root
        defaultChecked
        className="flex h-5 w-9 shrink-0 border border-neutral-950 bg-white p-0.5 transition-colors duration-150 ease-[ease] dark:border-white dark:bg-neutral-950 data-checked:bg-neutral-950 dark:data-checked:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
      >
        <Switch.Thumb className="size-3.5 bg-neutral-950 transition-[translate,background-color] duration-150 ease-[ease] data-checked:translate-x-4 data-checked:bg-white dark:bg-white dark:data-checked:bg-neutral-950" />
      </Switch.Root>
      Notifications
    </label>
  );
}
```

## Gotchas
- Root renders a `<span>` by default to allow wrapping `<label>`. For sibling-label patterns (`htmlFor`/`id`), pass `nativeButton` and `render={<button />}`.
- To use a native `<button>` inside a wrapping `<label>`, use a `render` callback that places the hidden input outside the label.
- Unchecked switches submit no value by default (matching native checkbox semantics). Use `uncheckedValue` if your backend needs an explicit off value.
- `value` defaults to `"on"`; set it explicitly when you need a typed boolean substitute.
- Field/Form integration is via `Field.Root` and `Field.Label` — that's also how the `data-valid` / `data-invalid` / `data-dirty` / `data-touched` / `data-filled` / `data-focused` attributes light up.
- `nativeButton` must accurately reflect whether the rendered element is a button — wrong value breaks event handling and accessibility.
