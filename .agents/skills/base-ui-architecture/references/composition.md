# Composition

Compose Base UI parts with your own React components via the `render` prop. Every part that renders an HTML element accepts `render`, which controls both the **rendered element** and any **wrapping component**.

## `render` prop

### Signature

The handbook's *composition* page describes `render` in prose; the typed signature below is from the *typescript* handbook (`references/typescript.md`):

```ts
render: ReactElement | ((props: HTMLProps, state: Part.State) => ReactElement)
```

- **Element form** — pass a ReactElement; Base UI clones it, forwarding all props and the merged `ref`.
- **Function form** — `(props, state) => ReactElement`; you spread `props` and decide what to render. Use this when you need access to internal `state` (e.g. `state.checked`, `state.open`, `state.side`).

The composed component **must forward `ref`** and **spread all received props** onto its DOM node.

## Compose with a custom component

Most triggers default to `<button>`. To use your own button instead:

```tsx
import { Menu } from '@base-ui/react/menu';
import { MyButton } from './MyButton';

<Menu.Trigger render={<MyButton size="md" />}>
  Open menu
</Menu.Trigger>;
```

`MyButton` must do `forwardRef` and spread received props:

```tsx
const MyButton = React.forwardRef<HTMLButtonElement, MyButtonProps>(
  function MyButton({ size = 'md', className, ...rest }, ref) {
    return <button ref={ref} className={cn(buttonStyles[size], className)} {...rest} />;
  },
);
```

## Compose multiple Base UI components

`render` props nest: each outer Base UI part hands its merged props down to the next via `render`. Common with Tooltip wrapping a Dialog/Menu trigger:

```tsx
<Dialog.Root>
  <Tooltip.Root>
    <Tooltip.Trigger
      render={
        <Dialog.Trigger
          render={
            <Menu.Trigger render={<MyButton size="md" />}>
              Open menu
            </Menu.Trigger>
          }
        />
      }
    />
    <Tooltip.Portal>{/* … */}</Tooltip.Portal>
  </Tooltip.Root>
  <Dialog.Portal>{/* … */}</Dialog.Portal>
</Dialog.Root>
```

## Change the default rendered element

`<Menu.Item>` renders a `<div>` by default. Render it as an `<a>` to make a link item:

```tsx
import { Menu } from '@base-ui/react/menu';

<Menu.Root>
  <Menu.Trigger>Song</Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup>
        <Menu.Item render={<a href="https://base-ui.com" />}>
          Add to Library
        </Menu.Item>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>;
```

Each part defaults to the most semantically appropriate element — override only when you have a clear reason.

## Render function form

For performance-sensitive code paths or state-dependent content, pass a function:

```tsx
<Switch.Thumb
  render={(props, state) => (
    <span {...props}>
      {state.checked ? <CheckedIcon /> : <UncheckedIcon />}
    </span>
  )}
/>
```

The function gives you:

- Total control over how `props` are spread (e.g. mix in extra `className` based on `state`).
- The component's typed `State` object — useful for `Positioner` (`state.side`, `state.align`, `state.open`, `state.anchorHidden`), `Switch` (`state.checked`), `Field.Root` (`state.valid`, `state.dirty`, `state.touched`), etc.

### State-aware className via function

`className` also accepts a function of `state`:

```tsx
<Switch.Thumb className={(state) => (state.checked ? 'checked' : 'unchecked')} />
```

## Styling by data attribute (the preferred pattern)

Prefer `data-*` selectors over render-function branches when you only need to vary styles:

```tsx
<Switch.Thumb className="data-checked:bg-green-500 data-unchecked:bg-neutral-300" />
```

This keeps the JSX clean and lets the browser apply state transitions for free. Use render-function only when you need to swap **DOM** (different children, different elements).

## `mergeProps` and `useRender` (utilities)

Two utilities exist for building **your own** Base UI-style composable components on top of the same primitives:

- `mergeProps` — combines multiple sets of props (event handlers, refs, classNames) deterministically. See the `base-ui-utilities` skill: `references/merge-props.md`.
- `useRender` — implements the same `render` prop contract inside your custom component. See `base-ui-utilities/references/use-render.md`.

When wrapping Base UI parts you usually do **not** need these — `render` plus `forwardRef` is sufficient. Reach for them when authoring a new primitive.

## As-child semantics (vs Radix)

Base UI does not have an `asChild` prop; the `render` prop fills that role. Conceptually `render={<a />}` is equivalent to Radix's `<Trigger asChild><a /></Trigger>` — props and refs are merged into the passed element rather than being applied to a default wrapper.

## Gotchas

- **Forgetting to spread `props`** in the function form drops Base UI's event handlers, ARIA, and `ref` — the component will look right but behave wrong.
- **Forgetting `forwardRef`** in a custom render element breaks focus management and `Positioner` anchoring.
- **Stale state in function form** — destructuring `state` is fine, but capturing it in a memoised callback can desync; treat the render function like any other render.
- **Multiple `render` props in one tree** — each level's props flow into the next; don't drop `ref` or `className` when chaining.
- **Render functions must return exactly one ReactElement** — wrap fragments in a single element if you need siblings.
