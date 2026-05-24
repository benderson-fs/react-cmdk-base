# OTP Field

Import: `import { OTPFieldPreview as OTPField } from '@base-ui/react/otp-field'`

> Currently shipped as `OTPFieldPreview`. Alias to `OTPField` locally for readable JSX.

## When to use
- One-time codes, verification codes, recovery codes — multi-slot character entry.
- Built-in paste handling (spreads across slots), arrow navigation, completion detection.
- Use `validationType` to constrain input (`numeric` for SMS codes, `alphanumeric` for recovery).

## Anatomy
- `OTPField.Root` — controls value, length, validation; owns hidden form input.
  - `OTPField.Input` — repeated for each slot (`length` times).
  - `OTPField.Separator` — optional visual divider between groups.

## Parts API

### OTPField.Root
Renders `<div>`. Required `length`.

**Props:**
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `length*` | `number` | — | Number of slots; required for clamping/completion detection and SSR hydration. |
| `name` | `string` | — | Form field name (hidden input). |
| `defaultValue` | `string` | — | Uncontrolled initial value. |
| `value` | `string` | — | Controlled value. |
| `onValueChange` | `(value: string, eventDetails: OTPField.Root.ChangeEventDetails) => void` | — | Fires on value change. |
| `onValueComplete` | `(value: string, eventDetails: OTPField.Root.CompleteEventDetails) => void` | — | Fires when all slots fill (or a complete value is pasted on top of one). |
| `onValueInvalid` | `(value: string, eventDetails: OTPField.Root.InvalidEventDetails) => void` | — | Fires when typed/pasted text contains rejected characters. |
| `autoComplete` | `string` | `'one-time-code'` | Applied to first slot + hidden input. |
| `autoSubmit` | `boolean` | `false` | Submit owning form on completion. |
| `form` | `string` | — | Form id when rendered outside `<form>`. |
| `inputMode` | `'none' \| 'text' \| 'tel' \| 'url' \| 'email' \| 'numeric' \| 'decimal' \| 'search'` | — | Virtual keyboard hint (overrides validation defaults). |
| `mask` | `boolean` | `false` | Mask entered characters (use `type` on `Input` for custom). |
| `normalizeValue` | `(value: string) => string` | — | Runs after whitespace/`validationType` filtering; must be idempotent. Rejected chars surface via `onValueInvalid`. |
| `validationType` | `'numeric' \| 'alpha' \| 'alphanumeric' \| 'none'` | `'numeric'` | Character filter. |
| `disabled` | `boolean` | `false` | — |
| `readOnly` | `boolean` | `false` | — |
| `required` | `boolean` | `false` | — |
| `id` | `string` | — | Id of first input; others derive (`{id}-2`, `{id}-3`, …). |
| `className` / `style` / `render` | state-aware | — | — |

**Data attributes:** `data-disabled`, `data-readonly`, `data-required`, `data-valid`, `data-invalid`, `data-dirty`, `data-touched`, `data-complete` (all slots filled), `data-filled` (≥1 char), `data-focused` (any slot focused).
**State:** `{ complete: boolean; disabled: boolean; length: number; readOnly: boolean; required: boolean; value: string; touched: boolean; dirty: boolean; valid: boolean | null; filled: boolean; focused: boolean }`.

**Root.ChangeEventReason:** `'input-change' \| 'input-clear' \| 'input-paste' \| 'keyboard'`.
**Root.ChangeEventDetails:** discriminated union by reason + `cancel()`, `allowPropagation()`, `isCanceled`, `isPropagationAllowed`, `trigger`.
**Root.CompleteEventReason:** `'input-change' \| 'input-paste'`.
**Root.CompleteEventDetails:** discriminated union (no cancel helpers).
**Root.InvalidEventReason:** `'input-change' \| 'input-paste'`.
**Root.InvalidEventDetails:** discriminated union (no cancel helpers).
**Root.ValidationType:** `'numeric' \| 'alpha' \| 'alphanumeric' \| 'none'`.

### OTPField.Input
Renders `<input>`. Repeat `length` times as children of `Root`. Pass `type` (e.g. `password`) for masked variants beyond `mask`.

**Props:** `className`, `style`, `render` (state-aware). Standard DOM props (incl. `aria-label`, `type`) also accepted via spread.
**Data attributes:** same as `Root`, except `data-filled` reflects this slot only.
**State:** `{ filled: boolean; index: number; value: string; disabled: boolean; length: number; required: boolean; readOnly: boolean; complete: boolean; touched: boolean; dirty: boolean; valid: boolean | null; focused: boolean }`.

### OTPField.Separator
Renders `<div>`. Accessible decorative divider.

**Props:** `orientation` (`'horizontal' \| 'vertical'`, default `'horizontal'`), plus standard.
**State:** `{ orientation: Orientation }`.

## Keyboard
| Key | Action |
| :-- | :--- |
| Typing a character | Fill current slot, advance to next. |
| `Backspace` | Clear current slot; if empty, move to previous and clear. |
| `Delete` | Clear from current slot forward. |
| `ArrowLeft` / `ArrowRight` | Move between slots. |
| `Home` / `End` | Jump to first / last slot. |
| `Cmd/Ctrl + V` | Paste; characters spread across slots starting from current. |
| `Tab` | Leave the field. |

## State
Controlled: `<OTPField.Root value={code} onValueChange={(next) => setCode(next)} />`.
Uncontrolled: `<OTPField.Root defaultValue="">`.
`onValueComplete` fires after the value update; on a paste that matches the current complete value, `onValueChange` is skipped but `onValueComplete` still fires. Use `eventDetails.cancel()` inside `onValueChange` to reject an update.

## Animation
- No transition surface; data attributes are status flags.

## Canonical example
```tsx
// Tailwind v4
import * as React from 'react';
import { OTPFieldPreview as OTPField } from '@base-ui/react/otp-field';

const OTP_LENGTH = 6;

export default function ExampleOTPField() {
  const id = React.useId();
  const descriptionId = `${id}-description`;

  return (
    <div className="flex w-full max-w-80 flex-col items-start gap-1">
      <label htmlFor={id} className="text-sm font-bold text-neutral-950 dark:text-white">
        Verification code
      </label>
      <OTPField.Root
        id={id}
        length={OTP_LENGTH}
        aria-describedby={descriptionId}
        className="flex w-full gap-2"
        onValueComplete={(value) => console.log('submit', value)}
      >
        {Array.from({ length: OTP_LENGTH }, (_, index) => (
          <OTPField.Input
            key={index}
            className="m-0 h-10 w-10 border border-neutral-950 bg-white text-center text-base text-neutral-950 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:border-white dark:bg-neutral-950 dark:text-white dark:focus:outline-white"
            aria-label={`Character ${index + 1} of ${OTP_LENGTH}`}
          />
        ))}
      </OTPField.Root>
      <p id={descriptionId} className="m-0 text-sm text-neutral-600 dark:text-neutral-400">
        Enter the 6-character code we sent to your device.
      </p>
    </div>
  );
}
```

## Gotchas
- The package exports `OTPFieldPreview`, not `OTPField`. Alias on import: `import { OTPFieldPreview as OTPField } from '@base-ui/react/otp-field'`. Underlying type aliases ship under both `OTPFieldPreviewRoot*` and `OTPFieldRoot*` names; namespace-style access via `OTPField.Root.State` works once the import is aliased.
- `length` on `Root` is required, even with explicit `Input` children — the value is clamped to it.
- You must render `length` `OTPField.Input` children (typically via `Array.from(...)` or explicit JSX); the root does not generate inputs.
- The first `Input` inherits the field label via `htmlFor`; add `aria-label="Character N of M"` to the rest.
- `validationType` defaults to `'numeric'`. Switch to `'alphanumeric'` for recovery codes; `'none'` accepts any character.
- `normalizeValue` runs multiple times — keep it idempotent (e.g. `s => s.toUpperCase()`), not state-dependent.
- `autoSubmit` triggers the owning `<form>`; `onValueComplete` fires immediately before submission. Use `form` prop if the field is outside the form.
- `mask` toggles all slots to masked input; use `<OTPField.Input type="password" />` for per-slot control.
