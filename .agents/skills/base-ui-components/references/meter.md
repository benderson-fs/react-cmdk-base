# Meter

Import: `import { Meter } from '@base-ui/react/meter'`

## When to use
- Display a static numeric value within a known range (e.g. storage used, score).
- Read-only graphical indicator; not a progress bar (use `Progress` for indeterminate/over-time work).
- Exposes value to assistive tech via `role="meter"` semantics.

## Anatomy
- `Meter.Root` — groups parts, owns `value`/`min`/`max`/`format`.
  - `Meter.Label` — accessible label.
  - `Meter.Track` — full range container.
    - `Meter.Indicator` — filled portion.
  - `Meter.Value` — formatted numeric/text readout.

## Parts API

### Meter.Root
Renders a `<div>`. Groups all parts and provides the value for screen readers.

**Props:**
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `value*` | `number` | — | The current value. |
| `aria-valuetext` | `string` | — | User-friendly name for `aria-valuenow`. |
| `getAriaValueText` | `(formattedValue: string, value: number) => string` | — | Returns human-readable alternative for `aria-valuenow`. |
| `locale` | `Intl.LocalesArgument` | runtime locale | Locale used by `Intl.NumberFormat`. |
| `min` | `number` | `0` | Minimum value. |
| `max` | `number` | `100` | Maximum value. |
| `format` | `Intl.NumberFormatOptions` | — | Options to format the value. |
| `className` | `string \| ((state: Meter.Root.State) => string \| undefined)` | — | Class or class-from-state. |
| `style` | `React.CSSProperties \| ((state: Meter.Root.State) => React.CSSProperties \| undefined)` | — | Style or style-from-state. |
| `render` | `ReactElement \| ((props: HTMLProps, state: Meter.Root.State) => ReactElement)` | — | Replace/compose element. |

**State:** `type MeterRootState = {}` (empty).
**Data attributes:** none documented.
**CSS variables:** none documented.

### Meter.Label
Renders a `<span>`. An accessible label for the meter.

**Props:** `className`, `style`, `render` (state-aware variants of standard signature).
**State:** `type MeterLabelState = {}`.
**Data attributes / CSS variables:** none documented.

### Meter.Track
Renders a `<div>`. Contains the indicator and represents the entire range.

**Props:** `className`, `style`, `render` (state-aware).
**State:** `type MeterTrackState = {}`.
**Data attributes / CSS variables:** none documented.

### Meter.Indicator
Renders a `<div>`. Visualizes the position of the value along the range. Width is sized by Base UI to reflect `(value - min) / (max - min)`.

**Props:** `className`, `style`, `render` (state-aware).
**State:** `type MeterIndicatorState = {}`.
**Data attributes / CSS variables:** none documented.

### Meter.Value
Renders a `<span>`. Text element displaying the current formatted value.

**Props:**
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `children` | `((formattedValue: string, value: number) => React.ReactNode) \| null` | — | Custom render of value/format. |
| `className` | `string \| ((state: Meter.Value.State) => string \| undefined)` | — | Class or class-from-state. |
| `style` | `React.CSSProperties \| ((state: Meter.Value.State) => React.CSSProperties \| undefined)` | — | Style or style-from-state. |
| `render` | `ReactElement \| ((props: HTMLProps, state: Meter.Value.State) => ReactElement)` | — | Replace/compose element. |

**State:** `type MeterValueState = {}`.
**Data attributes / CSS variables:** none documented.

## Keyboard
| Key | Action |
| :-- | :--- |
| — | Meter is non-interactive; no keyboard interactions. |

## State
Meter is fully controlled by `value` on `Root` — there is no uncontrolled mode and no `onValueChange`. Update `value` from your own state to reflect changes. `min`/`max` define the range; `format` and `locale` control how `Meter.Value` renders.

## Canonical example
```tsx
// Tailwind v4
import { Meter } from '@base-ui/react/meter';

export default function ExampleMeter() {
  return (
    <Meter.Root
      className="grid w-60 max-w-full grid-cols-2 gap-y-2"
      value={24}
    >
      <Meter.Label className="text-sm font-normal text-neutral-950 dark:text-white">
        Storage Used
      </Meter.Label>
      <Meter.Value className="text-right text-sm text-neutral-950 dark:text-white" />
      <Meter.Track className="col-span-2 h-3 overflow-hidden bg-neutral-200 dark:bg-neutral-800">
        <Meter.Indicator className="bg-neutral-950 transition-[width] duration-500 dark:bg-white" />
      </Meter.Track>
    </Meter.Root>
  );
}
```

## Gotchas
- Use `Meter` for steady-state readings; use `Progress` for tasks in flight (loading, uploads).
- `Meter.Indicator` width is controlled by Base UI — do not set `width` yourself; animate via `transition-[width]`.
- Provide either `Meter.Label` or an external `aria-label` on `Meter.Root` so screen readers announce purpose.
- `format` accepts full `Intl.NumberFormatOptions` (e.g. `{ style: 'percent' }`, `{ style: 'unit', unit: 'gigabyte' }`).
- When custom-rendering `Meter.Value`, use the `(formattedValue, value)` children function to keep i18n consistent.
- `Root.State`, `Track.State`, `Indicator.State`, `Value.State`, `Label.State` are all `{}` — class/style/render functions receive no fields; just use plain `className`.
