# Number Field

Import: `import { NumberField } from '@base-ui/react/number-field'`

## When to use
- Numeric inputs with steppers (`+` / `-`), keyboard step modifiers, optional scrub-to-set drag.
- Locale-aware formatting via `Intl.NumberFormatOptions`; integrates with `Field` for validation.
- Provide a `<label>` (or wrap in `Field`) — input must have an accessible name.

## Anatomy
- `NumberField.Root`
  - `NumberField.ScrubArea`
    - `NumberField.ScrubAreaCursor`
  - `NumberField.Group`
    - `NumberField.Decrement`
    - `NumberField.Input`
    - `NumberField.Increment`

## Parts API

### NumberField.Root
Renders `<div>`. Owns value/state.

**Props:**
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | — | Form field name. |
| `defaultValue` | `number` | — | Uncontrolled initial value. |
| `value` | `number \| null` | — | Controlled raw numeric value. |
| `onValueChange` | `(value: number \| null, eventDetails: NumberField.Root.ChangeEventDetails) => void` | — | Fires on value change. |
| `onValueCommitted` | `(value: number \| null, eventDetails: NumberField.Root.CommitEventDetails) => void` | — | Fires on commit (blur, pointer release, keyboard). |
| `allowOutOfRange` | `boolean` | `false` | Typing may exceed `min`/`max` (steppers still clamp). |
| `form` | `string` | — | Form id for the hidden input. |
| `locale` | `Intl.LocalesArgument` | runtime locale | — |
| `snapOnStep` | `boolean` | `false` | Snap to nearest step when stepping. |
| `step` | `number \| 'any'` | `1` | Step (also disables step validation when `'any'`). |
| `smallStep` | `number` | `0.1` | Step while meta key held. |
| `largeStep` | `number` | `10` | Step while shift key held. |
| `min` | `number` | — | Minimum value. |
| `max` | `number` | — | Maximum value. |
| `allowWheelScrub` | `boolean` | `false` | Mouse-wheel scrubbing while focused. |
| `format` | `Intl.NumberFormatOptions` | — | Display formatting. |
| `disabled` | `boolean` | `false` | — |
| `readOnly` | `boolean` | `false` | — |
| `required` | `boolean` | `false` | — |
| `inputRef` | `React.Ref<HTMLInputElement>` | — | Ref to hidden input. |
| `id` | `string` | — | Input id (for label `htmlFor`). |
| `className` / `style` / `render` | state-aware | — | — |

**Data attributes (shared by every part):** `data-disabled`, `data-readonly`, `data-required`, `data-valid`, `data-invalid`, `data-dirty`, `data-touched`, `data-filled`, `data-focused`, `data-scrubbing`.
**State:** `{ value: number | null; inputValue: string; required: boolean; disabled: boolean; readOnly: boolean; scrubbing: boolean; touched: boolean; dirty: boolean; valid: boolean | null; filled: boolean; focused: boolean }` (this same shape is exposed on `Input.State`, `Group.State`, `ScrubArea.State`, `ScrubAreaCursor.State`, `Decrement.State`, `Increment.State`).

**Root.ChangeEventReason:** `'input-change' \| 'input-clear' \| 'input-blur' \| 'input-paste' \| 'keyboard' \| 'increment-press' \| 'decrement-press' \| 'wheel' \| 'scrub' \| 'none'`.
**Root.ChangeEventDetails:** discriminated union (matches reasons above) with `cancel()`, `allowPropagation()`, `isCanceled`, `isPropagationAllowed`, `trigger`, optional `direction?: Direction` (`-1 | 1`).
**Root.CommitEventReason:** `'input-blur' \| 'input-clear' \| 'keyboard' \| 'increment-press' \| 'decrement-press' \| 'wheel' \| 'scrub' \| 'none'`.
**Root.CommitEventDetails:** discriminated union (no `cancel/allow`-style helpers — generic event).

### NumberField.Input
Renders `<input>`. Native control inside the group.

**Props:** `aria-roledescription` (default `'Number field'`), plus standard.
**Data attributes:** same shared set.
**State:** same shared shape.

### NumberField.Group
Renders `<div>`. Wraps decrement/input/increment to layout as a single control.
**Props:** standard. **Data attributes / State:** shared shape.

### NumberField.Decrement / NumberField.Increment
Renders `<button>`. Stepper buttons; press-and-hold auto-repeats.
**Props:** `nativeButton` (default `true` — set `false` for non-button render targets), plus standard.
**Data attributes / State:** shared shape.

### NumberField.ScrubArea
Renders `<span>`. Click-and-drag region to scrub the value. Pair with a `<label htmlFor>` inside it for nice UX.

**Props:**
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | Drag axis. |
| `pixelSensitivity` | `number` | `2` | Pixels of movement per value change (higher = less sensitive). |
| `teleportDistance` | `number` | — | Max pixel distance from center before cursor loops. |
| `className` / `style` / `render` | state-aware | — | — |

**Data attributes / State:** shared shape.

### NumberField.ScrubAreaCursor
Renders `<span>`. Custom cursor shown while scrubbing (uses Pointer Lock API). Disabled in Safari to avoid layout shift from the browser's pointer-lock notification.
**Props:** standard. **Data attributes / State:** shared shape.

## Keyboard
Source does not publish a keyboard table for `NumberField`; the behaviours below are inferred from the `ChangeEventReason`/`CommitEventReason` unions (which include `'keyboard'`) and from typical spinbutton conventions. Verify against your Base UI version before relying on the exotic ones (PageUp/Down, Home/End).

| Key | Action |
| :-- | :--- |
| `ArrowUp` / `ArrowDown` | Step by `step` (documented via `keyboard` reason). |
| `Shift+ArrowUp` / `Shift+ArrowDown` | Step by `largeStep`. |
| `Meta+ArrowUp` / `Meta+ArrowDown` (Ctrl on Windows) | Step by `smallStep`. |
| `PageUp` / `PageDown` | Inferred: step by `largeStep`. Not documented in source — verify. |
| `Home` / `End` | Inferred: jump to `min` / `max`. Not documented in source — verify. |
| `Enter` | Commit and re-format (commits via the `keyboard` `CommitEventReason`). |

## State
Controlled: `<NumberField.Root value={n} onValueChange={(next, details) => setN(next)} />`.
Uncontrolled: `<NumberField.Root defaultValue={100} />`.
`onValueCommitted` fires later than `onValueChange` (blur, pointer release; same time as `onValueChange` for keyboard). Inside `onValueChange`, call `eventDetails.cancel()` to block Base UI from applying the change.

## Animation
- No transition surface; data attributes are status flags, not animation phases.

## Canonical example
```tsx
// Tailwind v4
import * as React from 'react';
import { NumberField } from '@base-ui/react/number-field';

const stepperClass =
  "flex h-full w-8 items-center justify-center border border-neutral-950 bg-white text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 data-disabled:border-neutral-500 data-disabled:text-neutral-500 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700";

export default function ExampleNumberField() {
  const id = React.useId();
  return (
    <NumberField.Root id={id} defaultValue={100} className="flex flex-col items-start gap-1">
      <NumberField.ScrubArea className="cursor-ew-resize font-bold select-none">
        <label htmlFor={id} className="cursor-ew-resize text-sm font-bold text-neutral-950 dark:text-white">
          Amount
        </label>
        <NumberField.ScrubAreaCursor className="drop-shadow-[0_1px_1px_#0008] filter">
          <svg width="26" height="14" viewBox="0 0 24 14" fill="black" stroke="white">
            <path d="M19.5 5.5L6.49737 5.51844V2L1 6.9999L6.5 12L6.49737 8.5L19.5 8.5V12L25 6.9999L19.5 2V5.5Z" />
          </svg>
        </NumberField.ScrubAreaCursor>
      </NumberField.ScrubArea>

      <NumberField.Group className="flex h-8">
        <NumberField.Decrement className={`${stepperClass} border-r-0`}>−</NumberField.Decrement>
        <NumberField.Input className="h-full w-[7ch] border border-neutral-950 bg-white px-2 text-left text-sm tabular-nums focus:z-1 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:border-white dark:bg-neutral-950 dark:text-white dark:focus:outline-white" />
        <NumberField.Increment className={`${stepperClass} border-l-0`}>+</NumberField.Increment>
      </NumberField.Group>
    </NumberField.Root>
  );
}
```

## Gotchas
- The visible `<input>` shows `inputValue` (formatted string); read the raw number from `value` / `onValueChange`.
- `step="any"` disables step validation; pair `step` with `min` explicitly to enable native step validity.
- `allowOutOfRange` only relaxes typing — keyboard/buttons/wheel/scrub still clamp.
- `Meta` (⌘ on macOS, Ctrl on Win/Linux) triggers `smallStep`; `Shift` triggers `largeStep`. Both also work on +/- buttons.
- `ScrubAreaCursor` uses Pointer Lock; expect a browser permission notification on first use (suppressed in Safari).
- For form submission, set `name` on `Root`; a hidden `<input>` is rendered automatically. Use `form` if rendering outside the `<form>`.
- Wrap in `Field.Root` to surface validation state via `data-valid`/`data-invalid`/`data-dirty`/`data-touched`.
