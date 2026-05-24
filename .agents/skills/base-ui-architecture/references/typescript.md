# TypeScript

Base UI organises every component's types under part-namespaces so you can build wrappers, render functions, and event handlers with full type safety.

## Namespaces

Every component part exposes two core interfaces:

- `Props` — e.g. `Tooltip.Root.Props`
- `State` — e.g. `Tooltip.Root.State`

Additional types (`Actions`, `ChangeEventDetails`, `ChangeEventReason`, `ToastObject`) are added per part where relevant.

### `Props`

Use to type a wrapping component that accepts all underlying Base UI props:

```tsx
import { Tooltip } from '@base-ui/react/tooltip';

function MyTooltip(props: Tooltip.Root.Props) {
  return <Tooltip.Root {...props} />;
}
```

This catches forgotten or renamed props at compile time when Base UI updates.

### `State`

The runtime state object passed to render-function and `className`/`style` functions. `Positioner` parts, for example, expose anchor metadata:

```tsx
import { Popover } from '@base-ui/react/popover';

function renderPositioner(
  props: Popover.Positioner.Props,
  state: Popover.Positioner.State,
) {
  return (
    <div {...props}>
      <ul>
        <li>The popover is {state.open ? 'open' : 'closed'}</li>
        <li>I am on the {state.side} side of the anchor</li>
        <li>I am aligned at the {state.align} of the side</li>
        <li>The anchor is {state.anchorHidden ? 'hidden' : 'visible'}</li>
      </ul>
      {props.children}
    </div>
  );
}

<Popover.Positioner render={renderPositioner} />;
```

State shapes are part-specific. Typical fields by family:

| Part family | Common `State` fields |
| :--- | :--- |
| Positioner / Popup | `open`, `side`, `align`, `anchorHidden`, `transitionStatus` |
| Field.Root and children | `disabled`, `touched`, `dirty`, `valid`, `filled`, `focused` |
| Field.Error | `valid`, `dirty`, `touched`, `filled`, `disabled`, `focused`, `transitionStatus` |
| Switch / Checkbox | `checked`, `disabled`, `readOnly`, `required` |
| Slider | `min`, `max`, `step`, `value`, `disabled`, `orientation`, `direction`, `values` |
| Menu / Select item | `highlighted`, `selected`, `disabled` |

### Event types

Per-part change events expose two helpers under the same namespace:

- `ChangeEventDetails` — the `eventDetails` object passed to `onValueChange` / `onOpenChange`.
- `ChangeEventReason` — the union of valid `reason` strings.

```tsx
import { Combobox } from '@base-ui/react/combobox';

function onValueChange(
  value: string,
  eventDetails: Combobox.Root.ChangeEventDetails,
) {
  if (eventDetails.reason === 'item-press') {
    /* … */
  }
}

function onOpenChange(open: boolean, eventDetails: Combobox.Root.ChangeEventDetails) {
  console.log(open, eventDetails);
}
```

The reason type is a string literal union, so you'll get autocomplete after `reason === '`.

## Typing `ref`

Most parts forward to a single DOM node — type the ref by the element they render:

```tsx
const triggerRef = React.useRef<HTMLButtonElement>(null);
const popupRef   = React.useRef<HTMLDivElement>(null);
const itemRef    = React.useRef<HTMLDivElement>(null);

<Menu.Trigger ref={triggerRef} />
<Menu.Popup   ref={popupRef} />
<Menu.Item    ref={itemRef} />
```

For wrapped components, forward the ref through to the rendered element:

```tsx
const MyButton = React.forwardRef<HTMLButtonElement, React.ComponentProps<'button'>>(
  function MyButton(props, ref) {
    return <button ref={ref} {...props} />;
  },
);

<Menu.Trigger render={<MyButton />}>Open</Menu.Trigger>;
```

## Render-prop typing

The `render` prop accepts:

```ts
render: ReactElement | ((props: HTMLProps, state: Part.State) => ReactElement)
```

In the function form, TypeScript infers the state automatically when used inline. For named functions, annotate both `props` and `state`:

```tsx
function renderPositioner(
  props: Popover.Positioner.Props,
  state: Popover.Positioner.State,
): React.ReactElement {
  return <div {...props}>{props.children}</div>;
}
```

For Motion / framer-motion composition the HTML props need a cast since Motion's prop types differ:

```tsx
import { motion, type HTMLMotionProps } from 'motion/react';

<Popover.Popup
  render={(props, state) => (
    <motion.div
      {...(props as HTMLMotionProps<'div'>)}
      animate={{ opacity: state.open ? 1 : 0 }}
    />
  )}
/>;
```

## Other exported types

Each part may export additional types under its namespace. Non-exhaustive list:

- `Actions` — imperative methods on `actionsRef`. E.g. `Menu.Root.Actions`, `Field.Root.Actions`, `Form.Actions`.
- `ToastObject` — the toast object passed to `<Toast.Root>` consumers: `Toast.Root.ToastObject`.
- `Values` — `Form.Values` is `Record<string, any>`; useful for destructuring values from the `onFormSubmit(formValues, eventDetails)` callback.
- `ValidationMode` — `'onSubmit' | 'onBlur' | 'onChange'`. Available as `Form.ValidationMode` (see `../../base-ui-components/references/form.md` for the canonical home).
- `useRender.ComponentProps` — extended `React.ComponentProps<T>` with the `render` prop added. Use it when building your own component that wants the same composability:

```tsx
import { useRender } from '@base-ui/react/use-render';

type MyButtonProps = useRender.ComponentProps<'button'> & { variant?: 'primary' | 'ghost' };
```

## Canonical vs alias types

Each component page documents both the namespaced canonical name and a flat alias (e.g. `Field.Root.State` ⇄ `FieldRootState`). Use the canonical form when the namespace is already imported; use the alias when you need a single import:

```tsx
import type { FieldRootProps } from '@base-ui/react/field';
function MyField(props: FieldRootProps) { /* … */ }
```

## Gotchas

- **Don't widen `State`.** Each part has its own exact `State` shape; importing a base interface won't compile.
- **`eventDetails.reason` is a string literal union** — narrow before reading reason-specific data.
- **`render` function must return one element.** Wrap fragments in a parent element if needed.
- **`forwardRef` is required** for ref-receiving wrappers; otherwise TS infers `unknown` and Base UI's focus management silently breaks.
- **Importing types-only** — namespaced types live in the same module path as the component: `import { Tooltip } from '@base-ui/react/tooltip'; type X = Tooltip.Root.State;`.
