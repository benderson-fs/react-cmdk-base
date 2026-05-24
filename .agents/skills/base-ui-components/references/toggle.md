# Toggle

Import: `import { Toggle } from '@base-ui/react/toggle'`

## When to use
- Two-state button (pressed / unpressed) for actions like bold, italic, favorite.
- Standalone or as a `Toggle.value`-tagged item inside `ToggleGroup`.
- Always provide an accessible name (`aria-label` or visible label).

## Anatomy
```
Toggle  // single-part
```

## Parts API

### Toggle
A two-state button. Renders `<button>`.

**Props:**
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| value | `string` | - | Unique id for this toggle when inside `ToggleGroup`. |
| defaultPressed | `boolean` | `false` | Initial pressed state (uncontrolled). |
| pressed | `boolean` | - | Controlled pressed state. |
| onPressedChange | `((pressed: boolean, eventDetails: Toggle.ChangeEventDetails) => void)` | - | Called when pressed state changes. |
| nativeButton | `boolean` | `true` | Set false when `render` produces a non-button element. |
| disabled | `boolean` | `false` | Ignore user interaction. |
| className | `string \| ((state: Toggle.State) => string \| undefined)` | - | Class or state-driven class. |
| style | `React.CSSProperties \| ((state: Toggle.State) => React.CSSProperties \| undefined)` | - | Style or state-driven style. |
| render | `ReactElement \| ((props: HTMLProps, state: Toggle.State) => ReactElement)` | - | Replace element or compose. The state-aware function form is the recommended way to swap content based on `pressed`. |

**Data attributes:** `data-pressed` (per source — present when pressed). Source does not document `data-disabled` for `Toggle`; the rendered `<button>` carries the native `disabled` attribute via the `disabled` prop, so style off the `:disabled` pseudo-class or the `[disabled]` attribute selector instead.

**CSS variables:** none.

## Keyboard
| Key | Action |
| :--- | :--- |
| Space / Enter | Toggle pressed state. |
| Tab / Shift+Tab | Move focus. |

## State
```tsx
// Uncontrolled
<Toggle defaultPressed aria-label="Bold" />

// Controlled
const [pressed, setPressed] = React.useState(false);
<Toggle
  pressed={pressed}
  onPressedChange={(next, details) => setPressed(next)}
  aria-label="Bold"
/>
```

```ts
type ToggleState = {
  pressed: boolean;
  disabled: boolean;
};

type ToggleChangeEventReason = 'none';
type ToggleChangeEventDetails = {
  reason: 'none';
  event: Event;
  cancel: () => void;
  allowPropagation: () => void;
  isCanceled: boolean;
  isPropagationAllowed: boolean;
  trigger: Element | undefined;
};
```

## Animation
No transition surface beyond CSS state transitions. Drive visuals via `data-pressed` (and the native `:disabled` / `[disabled]` selectors).

## Canonical example
```tsx
// Tailwind v4
'use client';
import * as React from 'react';
import { Toggle } from '@base-ui/react/toggle';

export default function ExampleToggle() {
  return (
    <Toggle
      aria-label="Favorite"
      className="flex size-8 items-center justify-center bg-transparent text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 data-pressed:text-neutral-950 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 dark:data-pressed:text-white dark:focus-visible:outline-white"
      render={(props, state) => (
        <button type="button" {...props}>
          {state.pressed ? <HeartFilledIcon /> : <HeartOutlineIcon />}
        </button>
      )}
    />
  );
}

function HeartFilledIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M8 13.87a.46.46 0 0 1-.32-.11C7.43 13.58 1.6 9.2 1.6 5.87A3.73 3.73 0 0 1 5.33 2.13c1.26 0 2.17.68 2.67 1.18.5-.5 1.41-1.18 2.67-1.18A3.73 3.73 0 0 1 14.4 5.87c0 3.33-5.83 7.71-6.08 7.9a.46.46 0 0 1-.32.1Z" />
    </svg>
  );
}

function HeartOutlineIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path fillRule="evenodd" clipRule="evenodd" d="M8 4.82 7.24 4.07c-.4-.4-1.05-.87-1.9-.87A2.67 2.67 0 0 0 2.67 5.87c0 .54.25 1.24.75 2.05.5.79 1.18 1.6 1.9 2.34 1.07 1.1 2.16 1.99 2.68 2.4.53-.41 1.62-1.3 2.69-2.4.71-.74 1.4-1.55 1.89-2.34.51-.81.75-1.51.75-2.05a2.67 2.67 0 0 0-2.66-2.67c-.86 0-1.51.46-1.91.87L8 4.82Z" />
    </svg>
  );
}
```

## Gotchas
- Toggle is a single-part component (no `Toggle.Root`). The default `render` is a `<button>`.
- When using `render` to swap the rendered tag, set `nativeButton={false}` if it is not a real `<button>`.
- The render-callback variant `(props, state) => …` lets you swap children based on `state.pressed` without re-rendering surrounding context.
- A standalone toggle does not participate in form submission — it is a UI affordance, not a form control. For form-submitted on/off values, use `Switch` or `Checkbox`.
- Inside `ToggleGroup`, provide `value` so the group can track which item is pressed.
- `ChangeEventDetails` lets you call `cancel()` to prevent the press from being applied.
