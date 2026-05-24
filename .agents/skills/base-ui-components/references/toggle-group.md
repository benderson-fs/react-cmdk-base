# Toggle Group

Import: `import { ToggleGroup } from '@base-ui/react/toggle-group'`

## When to use
- Group of related `Toggle` buttons sharing a single pressed-value array.
- Single-select (default) or multi-select (`multiple`) modes.
- Common patterns: text-alignment selector, formatting toolbar, view-mode switcher.

## Anatomy
```
ToggleGroup
  Toggle (value="...")
  Toggle (value="...")
```

`ToggleGroup` is a single-part component; child `Toggle`s carry their own `value` so the group can track them.

## Parts API

### ToggleGroup
Provides shared state to a series of `Toggle` buttons. Renders `<div>`.

**Props:**
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| defaultValue | `string[]` | - | Initial array of pressed toggle values (uncontrolled). |
| value | `string[]` | - | Controlled array of pressed values. |
| onValueChange | `((groupValue: string[], eventDetails: ToggleGroup.ChangeEventDetails) => void)` | - | Called when pressed set changes. |
| loopFocus | `boolean` | `true` | Loop arrow-key focus across ends. |
| multiple | `boolean` | `false` | `false` = at most one pressed; `true` = many can be pressed simultaneously. |
| disabled | `boolean` | `false` | Disable all child toggles. |
| orientation | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout direction (also drives arrow-key axis). |
| className | `string \| ((state: ToggleGroup.State) => string \| undefined)` | - | Class. |
| style | `React.CSSProperties \| ((state: ToggleGroup.State) => React.CSSProperties \| undefined)` | - | Style. |
| render | `ReactElement \| ((props: HTMLProps, state: ToggleGroup.State) => ReactElement)` | - | Replace element. |

**Data attributes:** `data-orientation` (`'horizontal' | 'vertical'`), `data-disabled`, `data-multiple` (present when `multiple`).

**CSS variables:** none.

### Toggle (child)
Inside a group, each `Toggle` must have a `value` string to identify itself. See the Toggle reference for the full props list. Each child receives `data-pressed` when its value is in the group's pressed array.

## Keyboard
| Key | Action |
| :--- | :--- |
| ArrowLeft / ArrowRight | Move focus between toggles (horizontal). |
| ArrowUp / ArrowDown | Move focus between toggles (vertical). |
| Home / End | Move focus to first / last enabled toggle. |
| Space / Enter | Toggle the focused item's pressed state. |
| Tab / Shift+Tab | Move focus into/out of the group. |

## State
```tsx
// Single-select (uncontrolled)
<ToggleGroup defaultValue={['left']}>
  <Toggle value="left">…</Toggle>
  <Toggle value="center">…</Toggle>
  <Toggle value="right">…</Toggle>
</ToggleGroup>

// Multi-select (controlled)
const [marks, setMarks] = React.useState<string[]>(['bold']);
<ToggleGroup
  multiple
  value={marks}
  onValueChange={(next, details) => setMarks(next)}
  aria-label="Text formatting"
>
  <Toggle value="bold">…</Toggle>
  <Toggle value="italic">…</Toggle>
  <Toggle value="underline">…</Toggle>
</ToggleGroup>
```

```ts
type ToggleGroupState = {
  disabled: boolean;
  multiple: boolean;
  orientation: 'horizontal' | 'vertical';
};

type ToggleGroupChangeEventReason = 'none';
type ToggleGroupChangeEventDetails = {
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
No transition surface. Drive child visuals via the child `Toggle`'s `data-pressed`.

## Canonical example
```tsx
// Tailwind v4
import * as React from 'react';
import { Toggle } from '@base-ui/react/toggle';
import { ToggleGroup } from '@base-ui/react/toggle-group';

export default function ExampleToggleGroup() {
  const itemClasses =
    'flex size-8 items-center justify-center bg-transparent text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:not-data-pressed:bg-neutral-200 data-pressed:bg-neutral-950 data-pressed:text-white focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:data-pressed:bg-white dark:data-pressed:text-neutral-950 dark:focus-visible:outline-white';

  return (
    <ToggleGroup
      defaultValue={['left']}
      aria-label="Text alignment"
      className="flex gap-px p-px border border-neutral-950 dark:border-white"
    >
      <Toggle aria-label="Align left" value="left" className={itemClasses}>
        <AlignLeftIcon />
      </Toggle>
      <Toggle aria-label="Align center" value="center" className={itemClasses}>
        <AlignCenterIcon />
      </Toggle>
      <Toggle aria-label="Align right" value="right" className={itemClasses}>
        <AlignRightIcon />
      </Toggle>
    </ToggleGroup>
  );
}

function AlignLeftIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 16 16" stroke="currentColor" {...props}>
      <path strokeLinecap="square" strokeLinejoin="round" d="M2.5 4.5h11m-11 7h9M2.5 8h5" />
    </svg>
  );
}
function AlignCenterIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 16 16" stroke="currentColor" {...props}>
      <path strokeLinecap="square" strokeLinejoin="round" d="M2.5 4.5h11m-10 7h9M5.5 8h5" />
    </svg>
  );
}
function AlignRightIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 16 16" stroke="currentColor" {...props}>
      <path strokeLinecap="square" strokeLinejoin="round" d="M2.5 4.5h11m-9 7h9M8.5 8h5" />
    </svg>
  );
}
```

## Gotchas
- Both controlled and uncontrolled values are arrays of strings even in single-select mode (the array has 0 or 1 entries when `multiple` is false).
- Each child `Toggle` must have a unique `value` — toggles without a `value` won't appear in `onValueChange` results.
- Always provide a group-level `aria-label` (or `aria-labelledby`) on `ToggleGroup`. Source does not document a specific ARIA role being applied automatically (don't assume `radiogroup`/`toolbar` is set) — wrap in `Toolbar.Root` if you need full toolbar semantics.
- `disabled` on `ToggleGroup` cascades to children; child `disabled` is independent.
- `orientation` only changes the arrow-key axis and exposes `data-orientation`; it does not change visual layout — apply your own flex direction.
- `loopFocus` defaults to `true`. Set false for non-cyclic keyboard navigation.
- For a non-mutually-exclusive "format buttons" pattern, use `multiple`. For an "one-of-N" radio-like selector, leave `multiple` off.
