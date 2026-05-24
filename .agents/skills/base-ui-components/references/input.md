# Input

Import: `import { Input } from '@base-ui/react/input'`

## When to use
- Standalone, accessible `<input>` that auto-integrates with `Field` when wrapped.
- Drop-in replacement for `<input>` with consistent data-attribute states (`data-disabled`, `data-invalid`, etc.) for styling.
- Use controlled (`value` + `onValueChange`) or uncontrolled (`defaultValue`) modes.

## Anatomy
- `Input` — single-part component rendering an `<input>` element. Compose with `Field.Root` / `Field.Label` / `Field.Error` for full form-control behavior, or wrap in a native `<label>` for a minimal accessible name.

## Parts API

### Input
Renders an `<input>`.
**Props:**
- `defaultValue` — `string | number | string[]` — uncontrolled initial value.
- `value` — `string | string[] | number` — controlled value.
- `onValueChange` — `(value: string, eventDetails: Input.ChangeEventDetails) => void` — fired when the value changes.
- `className` — `string | ((state: Input.State) => string | undefined)`.
- `style` — `React.CSSProperties | ((state: Input.State) => React.CSSProperties | undefined)`.
- `render` — `ReactElement | ((props: HTMLProps, state: Input.State) => ReactElement)`.
- All native `<input>` props (`type`, `placeholder`, `required`, `pattern`, `min`, `max`, `disabled`, `onChange`, etc.) are forwarded.

**Data attributes:**
- `data-disabled` — when the input is disabled.
- `data-valid` — valid state (only when wrapped in `Field.Root`).
- `data-invalid` — invalid state (only when wrapped in `Field.Root`).
- `data-dirty` — value has changed (only when wrapped in `Field.Root`).
- `data-touched` — input has been touched (only when wrapped in `Field.Root`).
- `data-filled` — input is filled (only when wrapped in `Field.Root`).
- `data-focused` — input is focused (only when wrapped in `Field.Root`).

**State (`Input.State`):**
- `disabled: boolean`
- `touched: boolean`
- `dirty: boolean`
- `valid: boolean | null`
- `filled: boolean`
- `focused: boolean`

**Types:**
- `Input.ChangeEventReason = 'none'`.
- `Input.ChangeEventDetails = { reason: 'none'; event: Event; cancel(): void; allowPropagation(): void; isCanceled: boolean; isPropagationAllowed: boolean; trigger: Element | undefined }`.

## Keyboard
| Key | Action |
| --- | --- |
| Any printable key | Updates the value (native `<input>` behavior). |
| Enter | Submits the surrounding form for single-line inputs. |
| Tab / Shift+Tab | Moves focus to the next / previous focusable element. |
| Arrow keys | Native caret movement; specific behavior depends on `type` (e.g., number/range). |

## State
- **Uncontrolled:** pass `defaultValue` and read via `FormData` / refs.
- **Controlled:** pass `value` + `onValueChange` (or native `onChange`). `onValueChange` gives a `value` string plus event details that allow cancelling the default handling and reading the originating event.
- When wrapped in `<Field.Root>`, the field’s `dirty` / `touched` / `valid` / `filled` / `focused` flags are propagated as `data-*` attributes for styling.

## Canonical example
```tsx
import { Input } from '@base-ui/react/input';

export default function ExampleInput() {
  return (
    <label className="flex flex-col items-start gap-1 text-sm font-bold text-neutral-950 dark:text-white">
      Name
      <Input
        placeholder="e.g. Colm Tuite"
        className="h-8 w-40 border border-neutral-950 bg-white px-2 text-sm font-normal text-neutral-950 placeholder:text-neutral-500 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:border-white dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400 dark:focus:outline-white"
      />
    </label>
  );
}
```

## Gotchas
- Form controls must have an accessible name. Use `<Field.Label>` or wrap in a native `<label>` — `Input` itself does not generate one.
- `valid` / `dirty` / `touched` / `filled` / `focused` data attributes only appear when the input is wrapped inside `<Field.Root>` — standalone usage gets only `data-disabled`.
- Prefer `onValueChange` over native `onChange` when you want the standardized `ChangeEventDetails` (with `cancel()` to suppress Base UI's default handling).
- Controlled value props (`value`) must stay controlled; do not switch between controlled and uncontrolled across renders.
- `Input` is a single part — do not nest it inside other Base UI form primitives (Checkbox, Switch, etc.); each has its own dedicated control.
- For email/url/number, set the proper `type` so the wrapped `Field` can use the native `ValidityState` (e.g., `typeMismatch`, `rangeUnderflow`).
