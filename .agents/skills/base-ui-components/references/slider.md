# Slider

Import: `import { Slider } from '@base-ui/react/slider'`

## When to use
- Select a numeric value (or numeric range) along a continuum where the visual position matters.
- Use a single thumb for a single value, an array of values plus one `Slider.Thumb` per index for a range slider.
- Prefer a native `<input type="number">` or `NumberField` when precision typing matters more than direct manipulation.

## Anatomy
- `Slider.Root`
  - `Slider.Label` (optional)
  - `Slider.Value` (optional)
  - `Slider.Control`
    - `Slider.Track`
      - `Slider.Indicator`
      - `Slider.Thumb` (one or more)

## Parts API

### Slider.Root
Groups all parts and owns the value. Renders a `<div>`.

**Props:**
- `name`: `string` — form field name.
- `defaultValue`: `number | number[]` — uncontrolled value(s).
- `value`: `number | number[]` — controlled value(s); use an array for ranges.
- `onValueChange`: `(value, eventDetails: Slider.Root.ChangeEventDetails) => void` — fires during interaction.
- `onValueCommitted`: `(value, eventDetails: Slider.Root.CommitEventDetails) => void` — fires on `pointerup`/commit.
- `form`: `string` — id of an external form.
- `locale`: `Intl.LocalesArgument` — for `Intl.NumberFormat`.
- `thumbAlignment`: `'center' | 'edge' | 'edge-client-only'` (default `'center'`) — how thumb aligns at min/max.
- `thumbCollisionBehavior`: `'push' | 'swap' | 'none'` (default `'push'`) — multi-thumb pointer behaviour.
- `step`: `number` (default `1`).
- `largeStep`: `number` (default `10`) — for Page Up/Down and Shift+Arrow.
- `minStepsBetweenValues`: `number` (default `0`).
- `min`: `number` (default `0`).
- `max`: `number` (default `100`).
- `format`: `Intl.NumberFormatOptions`.
- `disabled`: `boolean` (default `false`).
- `orientation`: `'horizontal' | 'vertical'` (default `'horizontal'`).
- `className`, `style`, `render` (state-aware).

**Data attributes:** `data-dragging`, `data-orientation`, `data-disabled`, `data-valid`, `data-invalid`, `data-dirty`, `data-touched`, `data-focused`.

**CSS variables:** none on Root.

### Slider.Label
Accessible label automatically wired to the thumbs. Renders a `<div>`.

**Props:** `className`, `style`, `render` (state-aware).
**Data attributes:** none on the element.

### Slider.Value
Text readout of the current value(s). Renders an `<output>`.

**Props:**
- `children`: `((formattedValues: string[], values: number[]) => React.ReactNode) | null` — the entire prop is nullable; when supplied the callback returns a `ReactNode`.
- `className`, `style`, `render` (state-aware).

**Data attributes:** `data-dragging`, `data-orientation`, `data-disabled`, `data-valid`, `data-invalid`, `data-dirty`, `data-touched`, `data-focused`.

### Slider.Control
Interactive clickable region containing the track. Renders a `<div>`.

**Props:** `className`, `style`, `render` (state-aware).
**Data attributes:** same set as `Slider.Value`.

### Slider.Track
Represents the full value range; hosts indicator and thumbs. Renders a `<div>`.

**Props:** `className`, `style`, `render` (state-aware).
**Data attributes:** same set as `Slider.Value`.

### Slider.Indicator
Visualizes the filled portion. Renders a `<div>`.

**Props:** `className`, `style`, `render` (state-aware).
**Data attributes:** same set as `Slider.Value`.

### Slider.Thumb
Draggable handle plus a nested `<input type="range">`. Renders a `<div>`.

**Props:**
- `getAriaLabel`: `((index: number) => string) | null` — when supplied, returns the `aria-label` per thumb. Prop itself is nullable.
- `getAriaValueText`: `((formattedValue: string, value: number, index: number) => string) | null` — same nullability shape.
- `index`: `number` — required for range sliders' SSR.
- `onBlur` / `onFocus`: `React.FocusEventHandler<HTMLInputElement>`.
- `tabIndex`: `number`.
- `disabled`: `boolean` (default `false`).
- `inputRef`: `React.Ref<HTMLInputElement>`.
- `className`, `style`, `render` (state-aware).

**Data attributes:** `data-dragging`, `data-orientation`, `data-disabled`, `data-valid`, `data-invalid`, `data-dirty`, `data-touched`, `data-focused`, `data-index`.

## Keyboard
| Key | Effect |
| --- | --- |
| Tab | Move focus through thumbs. |
| Arrow Up | Always increases the focused thumb by `step`. |
| Arrow Down | Always decreases by `step`. |
| Arrow Right | Increases on horizontal (LTR) / decreases on horizontal (RTL via `DirectionProvider`). |
| Arrow Left | Decreases on horizontal (LTR) / increases on horizontal (RTL). |
| Shift + Arrow | Increase/decrease by `largeStep`. |
| Page Up | Increase by `largeStep`. |
| Page Down | Decrease by `largeStep`. |
| Home | Jump to `min`. |
| End | Jump to `max`. |

## State

```ts
type Orientation = 'horizontal' | 'vertical';

// Root/Track/Control/Indicator/Thumb/Value/Label all share this state shape:
type SliderRootState = {
  activeThumbIndex: number;
  disabled: boolean;
  dragging: boolean;
  max: number;
  min: number;
  minStepsBetweenValues: number;
  orientation: Orientation;
  step: number;
  values: number[];
  touched: boolean;
  dirty: boolean;
  valid: boolean | null;
  filled: boolean;
  focused: boolean;
};

type SliderRootChangeEventReason = 'input-change' | 'track-press' | 'drag' | 'keyboard' | 'none';
type SliderRootChangeEventDetails = ( // discriminated by `reason`
  | { reason: 'none'; event: Event }
  | { reason: 'input-change'; event: Event | InputEvent }
  | { reason: 'track-press'; event: PointerEvent | MouseEvent | TouchEvent }
  | { reason: 'drag'; event: PointerEvent | TouchEvent }
  | { reason: 'keyboard'; event: KeyboardEvent }
) & {
  cancel: () => void;
  allowPropagation: () => void;
  isCanceled: boolean;
  isPropagationAllowed: boolean;
  trigger: Element | undefined;
  activeThumbIndex: number;
};

type SliderRootCommitEventReason = SliderRootChangeEventReason;
type SliderRootCommitEventDetails = // same discriminated union as ChangeEventDetails minus the helpers
  | { reason: 'none'; event: Event }
  | { reason: 'input-change'; event: Event | InputEvent }
  | { reason: 'track-press'; event: PointerEvent | MouseEvent | TouchEvent }
  | { reason: 'drag'; event: PointerEvent | TouchEvent }
  | { reason: 'keyboard'; event: KeyboardEvent };

type ThumbMetadata = { inputId: string | null | undefined };
```

Controlled: `<Slider.Root value={v} onValueChange={setV}>`. Uncontrolled: `<Slider.Root defaultValue={25}>`.

## Animation
No enter/exit transition surface. Use `data-dragging` for active-state styling and animate `Indicator`/`Thumb` transforms with regular CSS transitions.

## Canonical example
```tsx
// Tailwind v4
import { Slider } from '@base-ui/react/slider';

export default function ExampleSlider() {
  return (
    <Slider.Root defaultValue={25}>
      <Slider.Control className="flex w-56 touch-none items-center py-3 select-none">
        <Slider.Track className="h-1 w-full select-none bg-neutral-200 dark:bg-neutral-800">
          <Slider.Indicator className="select-none bg-neutral-950 dark:bg-white" />
          <Slider.Thumb
            aria-label="Volume"
            className="size-4 select-none border border-neutral-950 bg-white has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-neutral-950 dark:border-white dark:bg-neutral-950 dark:has-[:focus-visible]:outline-white"
          />
        </Slider.Track>
      </Slider.Control>
    </Slider.Root>
  );
}
```

## Gotchas
- `Slider.Thumb` renders a nested `<input type="range">`; `:focus-visible` styling belongs on the wrapper via `has-[:focus-visible]` (Tailwind) or `:has(:focus-visible)` (CSS).
- For range sliders, always provide an `index` on each `<Slider.Thumb>` so SSR pairs them with the correct value; omit it only when client-only rendering and a single value is used.
- `onValueChange` fires continuously during drag/keyboard; use `onValueCommitted` for one-shot work (e.g. analytics, network calls).
- `thumbAlignment="edge-client-only"` reduces bundle size but only positions correctly after hydration — avoid for SSR-critical layouts.
- Provide either `Slider.Label` or per-thumb `aria-label`; for range sliders with a visible label, also label each thumb individually.
- `Slider.Control` (not `Track`) handles pointer-down clicks to jump the value — keep its hit area at least `touch-none py-3` for touch use.
- `thumbCollisionBehavior` only governs pointer interactions; keyboard navigation always respects `minStepsBetweenValues`.
