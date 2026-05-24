# Field

Import: `import { Field } from '@base-ui/react/field'`

## When to use
- Provide an accessible label, description, and validation messaging for a form control.
- Wrap a `Field.Control` or any Base UI input (Input, Checkbox, Select, etc.) to inherit field state.
- Drive per-field validation (`onSubmit` / `onBlur` / `onChange`) with custom or browser ValidityState.

## Anatomy
- `Field.Root`
  - `Field.Label`
  - `Field.Control` (optional — any Base UI input also works)
  - `Field.Description`
  - `Field.Item` (used inside checkbox/radio groups to scope a label/description to one option)
  - `Field.Error`
  - `Field.Validity` (render-prop for custom validity-driven UI)

## Parts API

### Field.Root
Groups all parts. Renders a `<div>`.
**Props:**
- `name` — `string` — submit-time identifier; takes precedence over `name` on `<Field.Control>`.
- `actionsRef` — `React.RefObject<Field.Root.Actions | null>` — `{ validate(): void }` imperative handle.
- `dirty` — `boolean` — externally controlled dirty state.
- `touched` — `boolean` — externally controlled touched state.
- `disabled` — `boolean` (`false`) — overrides `disabled` on `<Field.Control>`.
- `invalid` — `boolean` — externally marked invalid.
- `validate` — `(value, formValues) => string | string[] | Promise<string | string[] | null> | null` — custom validator; async OK but cannot block submit when `validationMode="onSubmit"`.
- `validationMode` — `Form.ValidationMode` (`'onSubmit'`) — `'onSubmit' | 'onBlur' | 'onChange'`; takes precedence over `<Form>`.
- `validationDebounceTime` — `number` (`0`) — debounce ms for `onChange` mode.
- `className` / `style` / `render` — standard polymorphic props.

**Data attributes:** `data-disabled`, `data-valid`, `data-invalid`, `data-dirty`, `data-touched`, `data-filled`, `data-focused`.

### Field.Label
Auto-associated `<label>`.
**Props:**
- `nativeLabel` — `boolean` (`true`) — set `false` when `render` produces a non-label element (e.g., `<div>` for `Select.Trigger`/`Combobox.Trigger`) to avoid hover/click side effects on button controls.
- `className` / `style` / `render`.

**Data attributes:** same set as Root.

### Field.Control
Default form control. Renders an `<input>`. Omit and use any Base UI input directly — it auto-integrates.
**Props:**
- `defaultValue` — `string | number | string[]`.
- `onValueChange` — `(value: string, eventDetails: Field.Control.ChangeEventDetails) => void`.
- `className` / `style` / `render`.

`ChangeEventDetails`: `{ reason: 'none'; event; cancel(); allowPropagation(); isCanceled; isPropagationAllowed; trigger }`.

**Data attributes:** same set as Root.

### Field.Description
Additional info. Renders `<p>`.
**Props:** `className` / `style` / `render`. **Data attributes:** same set as Root.

### Field.Item
Scopes labels/descriptions to one option in a checkbox/radio group. Renders `<div>`.
**Props:**
- `disabled` — `boolean` (`false`) — Root's `disabled` still takes precedence.
- `className` / `style` / `render`.

**State:** `{ disabled, touched, dirty, valid, filled, focused }` — same shape as `Field.Root`. All other parts (`Label`, `Description`, `Control`) expose the same state shape; `Field.Error.State` adds `transitionStatus`.

### Field.Error
Validation message. Renders `<div>`.
**Props:**
- `match` — `boolean | 'valid' | 'badInput' | 'customError' | 'patternMismatch' | 'rangeOverflow' | 'rangeUnderflow' | 'stepMismatch' | 'tooLong' | 'tooShort' | 'typeMismatch' | 'valueMissing'` — gate visibility on a specific `ValidityState` key; `true` = always show (for external libraries).
- `className` / `style` / `render`.

**Data attributes:** Root set plus `data-starting-style`, `data-ending-style`.

### Field.Validity
Render-prop. Requires `children` as a function.
**Props:**
- `children*` — `(state: Field.Validity.State) => React.ReactNode`.

State exposes `{ validity: ValidityState-like, transitionStatus, errors, value, error, initialValue }`.

## Keyboard
| Key | Action |
| --- | --- |
| n/a | Field is a wrapper — keyboard semantics come from the wrapped control. |

## State
Field state is derived (not controlled by a value prop). External libraries can force `dirty`/`touched`/`invalid` via Root props; otherwise these flip automatically as the user interacts. Use `actionsRef.current.validate()` to imperatively re-run validation.

Exported types:
```ts
type FieldRootState = { disabled: boolean; touched: boolean; dirty: boolean; valid: boolean | null; filled: boolean; focused: boolean };
type FieldErrorState = FieldRootState & { transitionStatus: TransitionStatus };
type FieldValidityState = { validity: ValidityState; transitionStatus: TransitionStatus; errors: string[]; value: unknown; error: string | undefined; initialValue: unknown };
type FieldValidityData = { state: ValidityState; error: string; errors: string[]; value: unknown; initialValue: unknown };
```
`Field.Item`, `Field.Label`, `Field.Description`, `Field.Control` all share `FieldRootState`.

## Animation
- `Field.Error` exposes `data-starting-style` / `data-ending-style` so you can transition the error in/out when it mounts/unmounts.

## Canonical example
```tsx
import { Field } from '@base-ui/react/field';

export default function ExampleField() {
  return (
    <Field.Root className="flex w-full max-w-64 flex-col items-start gap-1">
      <Field.Label className="text-sm font-bold text-neutral-950 dark:text-white">
        Name
      </Field.Label>
      <Field.Control
        required
        placeholder="Required"
        className="h-8 self-stretch border border-neutral-950 bg-white px-2 text-sm font-normal text-neutral-950 placeholder:text-neutral-500 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:border-white dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400 dark:focus:outline-white"
      />
      <Field.Error
        match="valueMissing"
        className="text-sm text-red-700 dark:text-red-400"
      >
        Please enter your name
      </Field.Error>
      <Field.Description className="text-sm text-neutral-600 dark:text-neutral-400">
        Visible on your profile
      </Field.Description>
    </Field.Root>
  );
}
```

## Gotchas
- `name` on `Field.Root` wins over `name` on `Field.Control` — set it in one place.
- Async `validate` cannot prevent submit in `validationMode="onSubmit"`; use `validationMode="onChange"` or server errors via `<Form errors={...}>` for async checks.
- Set `nativeLabel={false}` when you `render` `Field.Label` as a non-`<label>` (e.g., a `<div>` over a `Select.Trigger`/`Combobox.Trigger`) to avoid stray hover/click forwarding.
- `Field.Error` won't render unless its `match` condition is satisfied (or `match` is `true`/omitted under external control).
- `Field.Item` is required for per-option labels in checkbox/radio groups — `Field.Label` inside an `Item` binds to that single item, not the group.
- `data-filled` / `data-focused` / `data-touched` / `data-dirty` are forwarded to **all** parts, so you can theme labels, descriptions, and errors off the same state without prop drilling.
