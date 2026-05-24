# Checkbox Group

Import: `import { CheckboxGroup } from '@base-ui/react/checkbox-group'`

## When to use
- Coordinate state across a list of related `Checkbox.Root` items (multi-select).
- Add a "select all" / indeterminate parent checkbox via `allValues` + child `parent`.
- For single-choice groups use `RadioGroup` instead.

## Anatomy
- `CheckboxGroup` — shared state provider that wraps one or more `Checkbox.Root` children.

```jsx
import { Checkbox } from '@base-ui/react/checkbox';
import { CheckboxGroup } from '@base-ui/react/checkbox-group';

<CheckboxGroup>
  <Checkbox.Root />
</CheckboxGroup>
```

## Parts API

### CheckboxGroup
Provides a shared state to a series of checkboxes. Renders a `<div>`.

**Props:**
- `defaultValue` — `string[]` — Initially-ticked values when uncontrolled.
- `value` — `string[]` — Currently-ticked values (controlled).
- `onValueChange` — `(value: string[], eventDetails: CheckboxGroup.ChangeEventDetails) => void` — Fired when a child checkbox is toggled.
- `allValues` — `string[]` — Names of all child checkboxes; required when using a `parent` checkbox.
- `disabled` — `boolean` (`false`) — Ignores user interaction for the whole group.
- `className` — `string | ((state: CheckboxGroup.State) => string | undefined)` — Class or state-based class function.
- `style` — `React.CSSProperties | ((state: CheckboxGroup.State) => React.CSSProperties | undefined)` — Style or state-based style function.
- `render` — `ReactElement | ((props: HTMLProps, state: CheckboxGroup.State) => ReactElement)` — Replace the rendered element/component.

**Data attributes:**
- `data-disabled` — present when the group is disabled.

## State
- Uncontrolled: `defaultValue={['fuji-apple']}`.
- Controlled: `value` + `onValueChange`. The change handler receives `(value, eventDetails)` where `eventDetails.reason` is `'none'` and includes `cancel()`, `allowPropagation()`, `isCanceled`, `isPropagationAllowed`, and `trigger`.
- `CheckboxGroup.State` exposes `disabled`, `touched`, `dirty`, `valid`, `filled`, `focused` (Field integration).

## Canonical example
```tsx
'use client';
import * as React from 'react';
import { Checkbox } from '@base-ui/react/checkbox';
import { CheckboxGroup } from '@base-ui/react/checkbox-group';

const FRUITS = ['fuji-apple', 'gala-apple', 'granny-smith-apple'];

export default function ExampleCheckboxGroup() {
  const id = React.useId();
  const [value, setValue] = React.useState<string[]>(['fuji-apple']);

  return (
    <CheckboxGroup
      aria-labelledby={id}
      value={value}
      onValueChange={setValue}
      allValues={FRUITS}
      className="flex flex-col items-start gap-1 text-neutral-950 dark:text-white"
    >
      <label className="flex items-center gap-2 text-sm" id={id}>
        <Checkbox.Root
          parent
          className="flex size-4 shrink-0 items-center justify-center border border-neutral-950 bg-white text-white data-checked:bg-neutral-950 data-checked:text-white data-indeterminate:bg-neutral-950 data-indeterminate:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:border-white dark:bg-neutral-950"
        >
          <Checkbox.Indicator
            className="flex data-unchecked:hidden"
            render={(props, state) => (
              <span {...props}>{state.indeterminate ? <Dash /> : <Check />}</span>
            )}
          />
        </Checkbox.Root>
        Apples
      </label>

      {FRUITS.map((v) => (
        <label key={v} className="flex items-center gap-2 text-sm">
          <Checkbox.Root
            value={v}
            className="flex size-4 shrink-0 items-center justify-center border border-neutral-950 bg-white text-white data-checked:bg-neutral-950 data-checked:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:border-white dark:bg-neutral-950"
          >
            <Checkbox.Indicator className="flex data-unchecked:hidden">
              <Check />
            </Checkbox.Indicator>
          </Checkbox.Root>
          {v}
        </label>
      ))}
    </CheckboxGroup>
  );
}

function Check(props: React.ComponentProps<'svg'>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" {...props}>
      <path d="m2.5 8.5 4 4 7-9" />
    </svg>
  );
}
function Dash(props: React.ComponentProps<'svg'>) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" />
    </svg>
  );
}
```

## Gotchas
- The group needs an accessible name. Use `aria-labelledby` pointing at a sibling label, or render via `Fieldset.Root render={<CheckboxGroup />}` with a `Fieldset.Legend`.
- For a parent checkbox you MUST pass `allValues` AND make the group controlled (`value` + `onValueChange`) — without this, indeterminate/parent logic cannot resolve.
- Child `Checkbox.Root` items must each carry a unique `value` prop; the parent checkbox omits `value` and adds `parent`.
- `Checkbox.Root` renders a `<span>` by default to allow wrapping `<label>` patterns. For sibling `htmlFor`/`id` labels add `nativeButton render={<button />}` so the rendered element is a real button.
- Nested groups: when child `CheckboxGroup` covers a subset, sync both groups manually in `onValueChange` to keep the outer parent state correct.
- `CheckboxGroup.ChangeEventReason` is currently always `'none'`.
