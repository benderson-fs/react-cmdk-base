# Radio

Import: `import { Radio } from '@base-ui/react/radio'` and `import { RadioGroup } from '@base-ui/react/radio-group'`

## When to use
- Pick exactly one option from a small, mutually exclusive set (3–7 items).
- Each radio must be inside a `RadioGroup` and the group must have an accessible name (`<label>`, `aria-labelledby`, `Field`, or `Fieldset`).
- Prefer `Select` when the list is long or vertical space is constrained.

## Anatomy
- `RadioGroup`
  - `Radio.Root`
    - `Radio.Indicator`

## Parts API

### RadioGroup
Provides shared state to a series of radio buttons. Renders a `<div>`. The hidden inputs that participate in form submission live on each `Radio.Root` (one per option); `RadioGroup`'s `inputRef` is a ref for accessing them.

**Props:**
- `name`: `string` — form field name.
- `defaultValue`: `Value` — uncontrolled initial value.
- `value`: `Value` — controlled value.
- `onValueChange`: `(value: Value, eventDetails: RadioGroup.ChangeEventDetails) => void`.
- `form`: `string` — id of an external form.
- `disabled`: `boolean` (default `false`).
- `readOnly`: `boolean` (default `false`).
- `required`: `boolean` (default `false`).
- `inputRef`: `React.Ref<HTMLInputElement>` — ref to the hidden input.
- `className`: `string | ((state: RadioGroup.State) => string | undefined)`.
- `style`: `React.CSSProperties | ((state) => React.CSSProperties | undefined)`.
- `render`: `ReactElement | ((props: HTMLProps, state) => ReactElement)`.

**Data attributes:** `data-disabled`.

**CSS variables:** none.

### Radio.Root
Represents the radio button itself. Renders a `<span>` and a sibling hidden `<input>`.

**Props:**
- `value*`: `Value` — unique identifying value within the group.
- `nativeButton`: `boolean` (default `false`) — set to `true` when `render` produces a native `<button>`.
- `disabled`: `boolean`.
- `readOnly`: `boolean`.
- `required`: `boolean`.
- `inputRef`: `React.Ref<HTMLInputElement>`.
- `className`, `style`, `render` (state-aware).

**Data attributes:** `data-checked`, `data-unchecked`, `data-disabled`, `data-readonly`, `data-required`, `data-valid`, `data-invalid`, `data-dirty`, `data-touched`, `data-filled`, `data-focused`.

### Radio.Indicator
Indicates whether the radio is selected. Renders a `<span>`.

**Props:**
- `keepMounted`: `boolean` (default `false`) — keep DOM mounted when inactive.
- `className`, `style`, `render` (state-aware).

**Data attributes:** `data-checked`, `data-unchecked`, `data-disabled`, `data-readonly`, `data-required`, `data-valid`, `data-invalid`, `data-dirty`, `data-touched`, `data-filled`, `data-focused`, `data-starting-style`, `data-ending-style`.

## Keyboard
| Key | Effect |
| --- | --- |
| Tab | Move focus to the group; if a value is selected, focus the checked radio, otherwise focus the first. |
| Arrow Up / Arrow Left | Move focus to and select the previous radio in the group (wraps). |
| Arrow Down / Arrow Right | Move focus to and select the next radio (wraps). |
| Space | Select the focused radio. |

## State

```ts
type RadioGroupState = {
  readOnly: boolean;
  required: boolean;
  disabled: boolean;
  touched: boolean;
  dirty: boolean;
  valid: boolean | null;
  filled: boolean;
  focused: boolean;
};

type RadioRootState = {
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

type RadioIndicatorState = {
  checked: boolean;
  transitionStatus: TransitionStatus;
};

type RadioGroupChangeEventReason = 'none';
type RadioGroupChangeEventDetails = {
  reason: 'none';
  event: Event;
  cancel: () => void;
  allowPropagation: () => void;
  isCanceled: boolean;
  isPropagationAllowed: boolean;
  trigger: Element | undefined;
};
```

Controlled: `<RadioGroup value={v} onValueChange={setV}>`. Uncontrolled: `<RadioGroup defaultValue="a">`.

## Animation
`Radio.Indicator` exposes `data-starting-style` (animating in) and `data-ending-style` (animating out). Add `keepMounted` if you need the indicator in the DOM while unchecked for exit transitions.

## Canonical example
```tsx
// Tailwind v4
'use client';
import * as React from 'react';
import { Radio } from '@base-ui/react/radio';
import { RadioGroup } from '@base-ui/react/radio-group';

export default function ExampleRadioGroup() {
  const id = React.useId();
  return (
    <RadioGroup
      aria-labelledby={id}
      defaultValue="fuji-apple"
      className="flex flex-col items-start gap-1 text-neutral-950 dark:text-white"
    >
      <div className="text-sm font-bold" id={id}>
        Best apple
      </div>
      {[
        ['fuji-apple', 'Fuji'],
        ['gala-apple', 'Gala'],
        ['granny-smith-apple', 'Granny Smith'],
      ].map(([value, label]) => (
        <label
          key={value}
          className="flex items-center gap-2 text-sm font-normal text-neutral-950 dark:text-white"
        >
          <Radio.Root
            value={value}
            className="flex size-4 shrink-0 items-center justify-center rounded-full border border-neutral-950 bg-white p-0 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 data-checked:bg-neutral-950 data-checked:text-white dark:border-white dark:bg-neutral-950 dark:text-neutral-950 dark:focus-visible:outline-white dark:data-checked:bg-white dark:data-checked:text-neutral-950"
          >
            <Radio.Indicator className="flex items-center justify-center before:size-2 before:rounded-full before:bg-current data-unchecked:hidden" />
          </Radio.Root>
          {label}
        </label>
      ))}
    </RadioGroup>
  );
}
```

## Gotchas
- `Radio.Root` defaults to a `<span>` so it can nest inside `<label>`. Set `nativeButton` and `render={<button />}` only when using sibling `htmlFor`/`id` labels.
- To wrap a button in a label without invalid HTML, use the `render` callback form so the hidden input is placed outside the `<label>`.
- `RadioGroup` requires an accessible name (`aria-labelledby`, `aria-label`, `Field`, or `Fieldset.Legend`); without one, screen readers will not announce the group.
- Arrow keys both move focus and change the selected value — design for that behaviour and avoid trapping focus.
- `data-unchecked` is the inverse of `data-checked`; hide the indicator dot via `data-unchecked:hidden` (or use `keepMounted` plus animation styles).
- Field-state data attributes (`data-valid`, `data-touched`, ...) only populate when wrapped in `Field.Root`.
