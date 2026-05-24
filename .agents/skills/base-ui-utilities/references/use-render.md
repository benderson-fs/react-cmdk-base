# useRender

Import: `import { useRender } from '@base-ui/react/use-render'`

## When to use
- Build your own component that exposes a Base UI–style `render` prop so consumers can swap the underlying tag/component without an `asChild`-style wrapper.
- Forward refs, spread merged props, and expose component state through the callback form of `render`.
- Acts as the Base UI equivalent of Radix's `<Slot>` / `asChild`.

## API

### `useRender(params)`

Returns `ReactElement | null`.

#### `useRender.Parameters<TState, RenderedElementType, Enabled>`

| Field                    | Type                                                            | Default | Description                                                                                                                  |
| :----------------------- | :-------------------------------------------------------------- | :------ | :--------------------------------------------------------------------------------------------------------------------------- |
| `render`                 | `useRender.RenderProp<TState>`                                  | —       | `ReactElement` to clone, or `(props, state) => ReactElement` callback. Overrides the default element.                       |
| `ref`                    | `React.Ref<RenderedElementType> \| React.Ref<RenderedElementType>[]` | — | Ref(s) merged onto the rendered element. Array form merges multiple refs (e.g. internal + forwarded).                       |
| `state`                  | `TState`                                                        | —       | Component state — passed as the 2nd arg to the `render` callback, and auto-projected to `data-*` attributes.                |
| `stateAttributesMapping` | `StateAttributesMapping<TState>`                                | —       | Custom mapping from state to `data-*`, e.g. `{ isActive: (v) => v ? { 'data-is-active': '' } : null }`.                     |
| `props`                  | `Record<string, unknown>`                                       | —       | Props spread on the element. Already-merged props (event handlers chained, `className` joined, `style` joined).             |
| `enabled`                | `boolean \| undefined`                                          | `true`  | If `false`, the hook short-circuits and returns `null`. Useful for conditional rendering.                                   |
| `defaultTagName`         | Any HTML or SVG intrinsic element name — including SVG filter primitives (`feBlend`, `feGaussianBlur`, …), `animateMotion`, `webview`, etc. | `'div'` | Tag used when `render` is not provided.                                                                                     |

#### Types

```ts
// External (public) props for your component — includes `render` + HTML attrs.
type useRender.ComponentProps<
  ElementType extends React.ElementType,
  TState = {},
  RenderFunctionProps = HTMLProps,
> = React.ComponentPropsWithRef<ElementType> & {
  render?: ReactElement | ((props: RenderFunctionProps, state: TState) => ReactElement);
};

// Internal (private) props passed via `props` — HTML attrs only.
type useRender.ElementProps =
  | (React.PropsWithoutRef<Props> & React.RefAttributes<R | any>)
  | Props
  | React.ComponentProps<React.ElementType>;

type useRender.RenderProp<TState = Record<string, unknown>> =
  | ReactElement
  | ((props: React.HTMLAttributes<any>, state: TState) => ReactElement);

type useRender.ReturnValue = ReactElement | null;

type HTMLProps<T = any> = React.HTMLAttributes<T> & { ref?: React.Ref<T> };
```

`ComponentRenderFn<State, RenderedElementType>` is the function form of `render` — receives the props to spread and the state; returns a React element. Exported alongside `useRender.RenderProp` so you can type a render-prop function separately.

## Examples

```tsx
'use client';
import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { mergeProps } from '@base-ui/react/merge-props';

// 1) Minimal Text component with a render prop (React 19; no forwardRef needed).
interface TextProps extends useRender.ComponentProps<'p'> {}

function Text(props: TextProps) {
  const { render, ...otherProps } = props;
  return useRender({
    defaultTagName: 'p',
    render,
    props: mergeProps<'p'>({ className: 'text-sm text-neutral-950 dark:text-white' }, otherProps),
  });
}

// Usage: default <p>, or override with `render`.
// <Text>Paragraph</Text>
// <Text render={<strong />}>Strong</Text>

// 2) Counter with state passed to the render callback + state -> data-* attributes.
interface CounterState { odd: boolean }
interface CounterProps extends useRender.ComponentProps<'button', CounterState> {}

function Counter(props: CounterProps) {
  const { render, ...otherProps } = props;
  const [count, setCount] = React.useState(0);
  const odd = count % 2 === 1;
  const state = React.useMemo(() => ({ odd }), [odd]);

  const defaultProps: useRender.ElementProps<'button'> = {
    className: 'h-8 px-3 border border-neutral-950 dark:border-white',
    type: 'button',
    children: <>Counter: <span className="tabular-nums">{count}</span></>,
    onClick: () => setCount((p) => p + 1),
    'aria-label': `Count is ${count}, click to increase.`,
  };

  return useRender({
    defaultTagName: 'button',
    render,
    state, // becomes data-odd attribute automatically
    props: mergeProps<'button'>(defaultProps, otherProps),
  });
}

// 3) Merging refs (React 19): pass internal + external refs via the `ref` array.
function TextWithRef({ render, ...props }: TextProps) {
  const internalRef = React.useRef<HTMLElement | null>(null);
  return useRender({
    defaultTagName: 'p',
    ref: internalRef, // single ref OK; use array to combine with forwarded refs
    props,
    render,
  });
}

// React 18 / 17: wrap in forwardRef and pass [forwardedRef, internalRef].
```

Using `mergeProps` inside a callback `render` prop (Base UI does **not** auto-merge in callback mode):

```tsx
<Component
  render={(props, state) => (
    <button {...mergeProps<'button'>(props, { className: 'my-class' })} />
  )}
/>
```

## Gotchas
- The element form `render={<MyButton />}` clones and spreads props automatically. The callback form `render={(props, state) => ...}` does **not** — you must spread `props` and use `mergeProps` to combine with your own props/handlers.
- `render` is primarily for *behavioral* composition; polymorphism (changing the tag) is allowed but risky. Defaults like `type="button"` are not valid on every tag — components like Base UI's `Button` expose a `nativeButton` prop to signal this. Mirror that pattern in your own components when the default props depend on the tag.
- Use `useRender.ComponentProps<ElementType, TState>` for public props (includes `render`); use `useRender.ElementProps<ElementType>` for the internal default props object you build before merging.
- `state` keys become `data-*` attributes on the rendered element by default. Provide `stateAttributesMapping` to customize how they project (or to omit them).
- `enabled: false` returns `null` and skips most logic — handy for conditional render without an extra `if` upstream.
- Pre-merge your `props` with `mergeProps` *before* passing to `useRender`; the hook spreads `props` directly onto the rendered element.
- In React 18/17 you still need `React.forwardRef` and must combine `forwardedRef` with your internal ref via the `ref` array.
