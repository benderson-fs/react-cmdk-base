# Fieldset

Import: `import { Fieldset } from '@base-ui/react/fieldset'`

## When to use
- Group a set of related fields under a shared, stylable legend.
- Apply `disabled` to all enclosed controls via the native `<fieldset>` semantics.

## Anatomy
- `Fieldset.Root` — native `<fieldset>`
  - `Fieldset.Legend` — `<div>` styled like a legend, accessibly associated with the fieldset

## Parts API

### Fieldset.Root
Renders a `<fieldset>`.
**Props:**
- `className` — `string | ((state: Fieldset.Root.State) => string | undefined)`.
- `style` — `React.CSSProperties | ((state: Fieldset.Root.State) => React.CSSProperties | undefined)`.
- `render` — `ReactElement | ((props: HTMLProps, state: Fieldset.Root.State) => ReactElement)`.

**State:** `{ disabled: boolean }`.

### Fieldset.Legend
Auto-associated label. Renders a `<div>` (not the native `<legend>`) so it can be flex/grid-styled freely while still announced as the group label.
**Props:**
- `className` — `string | ((state: Fieldset.Legend.State) => string | undefined)`.
- `style` — `React.CSSProperties | ((state: Fieldset.Legend.State) => React.CSSProperties | undefined)`.
- `render` — `ReactElement | ((props: HTMLProps, state: Fieldset.Legend.State) => ReactElement)`.

**State:** `{ disabled: boolean }`.

## Keyboard
| Key | Action |
| --- | --- |
| n/a | Fieldset is a presentation/grouping wrapper — keyboard behavior comes from the enclosed controls. |

## State
`Fieldset.Root` and `Fieldset.Legend` both expose `{ disabled: boolean }` in their render-prop state so `className` / `style` / `render` callbacks can react to the disabled flag. The native `<fieldset>` also propagates `disabled` to descendant controls via standard HTML semantics — set `disabled` on the rendered element to disable the whole group.

## Canonical example
```tsx
import { Field } from '@base-ui/react/field';
import { Fieldset } from '@base-ui/react/fieldset';

export default function ExampleFieldset() {
  const inputClass =
    'h-8 w-full border border-neutral-950 bg-white px-2 text-sm font-normal text-neutral-950 placeholder:text-neutral-500 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:border-white dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400 dark:focus:outline-white';

  return (
    <Fieldset.Root className="flex w-full max-w-64 flex-col gap-4 border-0 p-0">
      <Fieldset.Legend className="border-b border-neutral-950 text-base font-bold text-neutral-950 dark:border-white dark:text-white">
        Billing details
      </Fieldset.Legend>

      <Field.Root className="flex flex-col items-start gap-1">
        <Field.Label className="text-sm font-bold text-neutral-950 dark:text-white">
          Company
        </Field.Label>
        <Field.Control placeholder="Enter company name" className={inputClass} />
      </Field.Root>

      <Field.Root className="flex flex-col items-start gap-1">
        <Field.Label className="text-sm font-bold text-neutral-950 dark:text-white">
          Tax ID
        </Field.Label>
        <Field.Control placeholder="Enter fiscal number" className={inputClass} />
      </Field.Root>
    </Fieldset.Root>
  );
}
```

## Gotchas
- `Fieldset.Legend` renders as a `<div>`, not `<legend>`. The accessibility association is wired up manually, so do not try to nest a real `<legend>` inside.
- The native `<fieldset>` defaults inject `padding`, `margin`, and a `border` — reset them (`border-0 p-0 m-0`) when matching custom designs.
- Setting `disabled` directly on the rendered `<fieldset>` disables every descendant form control by HTML semantics. Use `<Field.Root disabled>` if you want one-off control-level overrides.
- `Fieldset` does not provide any focus management or roving tab index — pair with `RadioGroup`, `CheckboxGroup`, or a navigation primitive when you need that.
- The legend is read by screen readers when focus enters any wrapped control. Keep it short and descriptive.
