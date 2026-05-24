# Progress

Import: `import { Progress } from '@base-ui/react/progress'`

## When to use
- Communicate the status of a long-running task with a known or indeterminate completion percentage.
- Pair with a visible label and value text so screen readers announce meaningful progress.
- Use `value={null}` for indeterminate progress (e.g. loading without a measurable percent).

## Anatomy
- `Progress.Root`
  - `Progress.Label`
  - `Progress.Track`
    - `Progress.Indicator`
  - `Progress.Value`

## Parts API

### Progress.Root
Groups all parts and exposes status to screen readers. Renders a `<div>`.

**Props:**
- `value*`: `number | null` (default `null`) — current value; `null` puts the bar in indeterminate state.
- `aria-valuetext`: `string` — friendly name for `aria-valuenow`.
- `getAriaValueText`: `(formattedValue: string | null, value: number | null) => string` — function returning human-readable text alternative.
- `locale`: `Intl.LocalesArgument` — locale for `Intl.NumberFormat`; defaults to runtime locale.
- `min`: `number` (default `0`).
- `max`: `number` (default `100`).
- `format`: `Intl.NumberFormatOptions` — formatting options for the value.
- `className`: `string | ((state: Progress.Root.State) => string | undefined)`.
- `style`: `React.CSSProperties | ((state) => React.CSSProperties | undefined)`.
- `render`: `ReactElement | ((props: HTMLProps, state) => ReactElement)`.

**Data attributes:** `data-complete`, `data-indeterminate`, `data-progressing`.

**CSS variables:** none.

### Progress.Label
Accessible label for the progress bar. Renders a `<span>`.

**Props:** `className`, `style`, `render` (state-aware).
**Data attributes:** `data-complete`, `data-indeterminate`, `data-progressing`.

### Progress.Track
Container for the indicator. Renders a `<div>`.

**Props:** `className`, `style`, `render` (state-aware).
**Data attributes:** `data-complete`, `data-indeterminate`, `data-progressing`.

### Progress.Indicator
Visualizes completion (width is set internally). Renders a `<div>`.

**Props:** `className`, `style`, `render` (state-aware).
**Data attributes:** `data-complete`, `data-indeterminate`, `data-progressing`.

### Progress.Value
Text label displaying the current value. Renders a `<span>`.

**Props:**
- `children`: `((formattedValue: string | null, value: number | null) => React.ReactNode) | null` — render-prop for custom value formatting.
- `className`, `style`, `render` (state-aware).

**Data attributes:** `data-complete`, `data-indeterminate`, `data-progressing`.

## Keyboard
| Key | Effect |
| --- | --- |
| — | Progress is not interactive; no keyboard handling. |

## State
Progress is fully controlled by the `value` prop on `Root`. There is no uncontrolled mode.

```ts
type ProgressStatus = 'indeterminate' | 'progressing' | 'complete';
type ProgressRootState = { status: ProgressStatus };
// Track, Indicator, Value, Label share the same { status } state shape.
```

## Animation
The indicator's width is updated as `value` changes; animate it via CSS `transition: width ...` on `Progress.Indicator`. There is no enter/exit transition surface (no `data-starting-style` / `data-ending-style`).

## Canonical example
```tsx
// Tailwind v4
'use client';
import * as React from 'react';
import { Progress } from '@base-ui/react/progress';

export default function ExampleProgress() {
  const [value, setValue] = React.useState(20);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setValue((current) => Math.min(100, Math.round(current + Math.random() * 25)));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Progress.Root
      className="grid w-60 max-w-full grid-cols-2 gap-y-2"
      value={value}
    >
      <Progress.Label className="text-sm font-normal text-neutral-950 dark:text-white">
        Export data
      </Progress.Label>
      <Progress.Value className="text-right text-sm text-neutral-950 dark:text-white" />
      <Progress.Track className="col-span-2 h-1 overflow-hidden bg-neutral-200 dark:bg-neutral-800">
        <Progress.Indicator className="bg-neutral-950 transition-[width] duration-500 dark:bg-white" />
      </Progress.Track>
    </Progress.Root>
  );
}
```

## Gotchas
- Always provide either `Progress.Label` or an `aria-label`/`aria-labelledby` on `Root`; orphan progress bars are not announced.
- `value={null}` switches to indeterminate; do not pass `NaN` or negative numbers expecting the same effect.
- `Progress.Indicator` has its width managed by Base UI — do not set width manually; animate via `transition-[width]`.
- `data-complete`, `data-indeterminate`, and `data-progressing` propagate to every part, so style consistently across `Track`, `Indicator`, `Label`, `Value`.
- `format` and `locale` only affect `Progress.Value`'s rendered text and the formatted value passed to `getAriaValueText`.
- Use `getAriaValueText` for non-numeric narrative (e.g. "Step 2 of 5") rather than overriding `aria-valuetext` statically.
