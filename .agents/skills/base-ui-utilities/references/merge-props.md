# mergeProps

Import: `import { mergeProps, mergePropsN, mergeClassNames, makeEventPreventable } from '@base-ui/react/merge-props'`

## When to use
- Combine your props with Base UI's props inside the callback form of a `render` prop — Base UI does **not** auto-merge in that mode.
- Stack multiple prop sources (defaults + consumer overrides + internal handlers) safely without clobbering event handlers, `className`, or `style`.
- Reach for `mergePropsN` only when you have more than 5 sources; it's slightly slower.

## API

### `mergeProps<ElementType>(a, b, c?, d?, e?)`

Accepts up to 5 args, each is either a props object or a function `(mergedSoFar) => props`. Rightmost wins for plain keys, with these exceptions:

| Key                   | Behavior                                                                                                                                                                                                                              |
| :-------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `className`           | Concatenated **right-to-left** (rightmost class appears first in the output string).                                                                                                                                                  |
| `style`               | Shallow-merged; rightmost keys overwrite earlier ones.                                                                                                                                                                                |
| Event handlers (`on*`)| All preserved; invoked **right-to-left** (rightmost first, leftmost last). For React synthetic events, a handler can call `event.preventBaseUIHandler()` to skip earlier (Base UI / left-positioned) handlers. Non-synthetic events have no prevention mechanism — all handlers always run. |
| `ref`                 | **Not merged.** Only the rightmost `ref` is kept. (Use `useRender`'s `ref` array option if you need to merge refs.)                                                                                                                  |
| Everything else       | Rightmost wins, like `Object.assign`.                                                                                                                                                                                                  |

Signature parameters (`a` required, `b` required, `c`/`d`/`e` optional): `InputProps<ElementType>` (object or function returning an object).

Return:
```ts
type ReturnValue = WithBaseUIEvent<React.ComponentPropsWithRef<ElementType>>;
```

### `mergePropsN<ElementType>(props: InputProps<ElementType>[])`

Same semantics as `mergeProps`, but takes a single array of `InputProps<ElementType>`. Use when you have more than 5 sources; otherwise prefer `mergeProps` for perf.

```ts
type ReturnValue = WithBaseUIEvent<React.ComponentPropsWithRef<ElementType>>;
```

### `mergeClassNames(ourClassName, theirClassName)`
`(string | undefined, string | undefined) => string | undefined`

### `makeEventPreventable(event)`
`(BaseUIEvent<React.SyntheticEvent>) => BaseUIEvent<React.SyntheticEvent>` — adds `preventBaseUIHandler()` / `baseUIHandlerPrevented` to a synthetic event.

### Function-form merging

A function arg replaces accumulated props at its position; chain prior handlers yourself if needed. Handlers returned from a function arg are **not** auto-skipped by `preventBaseUIHandler()` — read `event.baseUIHandlerPrevented` and bail manually.

## Examples

```tsx
'use client';
import * as React from 'react';
import { mergeProps } from '@base-ui/react/merge-props';
import { Toggle } from '@base-ui/react/toggle';

// Using the callback render prop + mergeProps to gate Base UI's onClick.
export default function ExamplePreventBaseUIHandler() {
  const [locked, setLocked] = React.useState(true);
  const [pressed, setPressed] = React.useState(true);

  const getToggleProps = (props: React.ComponentProps<'button'>) =>
    mergeProps<'button'>(props, {
      onClick(event) {
        if (locked) event.preventBaseUIHandler(); // skip Base UI's toggle handler
      },
    });

  return (
    <Toggle
      aria-label="Favorite"
      pressed={pressed}
      onPressedChange={setPressed}
      className="size-8 grid place-items-center text-neutral-950 dark:text-white"
      render={(props, state) => (
        <button type="button" {...getToggleProps(props)}>
          {state.pressed ? 'on' : 'off'}
        </button>
      )}
    />
  );
}

// Function-arg form: must manually call the previous handler.
const merged = mergeProps(
  { onClick(event) { /* prior */ } },
  (props) => ({
    onClick(event) {
      props.onClick?.(event); // explicit chain
      // your logic
    },
  }),
);
```

## Gotchas
- `ref` is **not** merged — only the last one wins. For merged refs, use `useRender`'s `ref` array option.
- `className` joins right-to-left: `mergeProps({ className: 'a' }, { className: 'b' })` → `'b a'`. CSS specificity is identical; the order only matters for last-wins shorthand utilities.
- Event handlers run **rightmost first**. Base UI's internal handler is the leftmost one — your rightmost handler can short-circuit it via `event.preventBaseUIHandler()`, which is **not** `preventDefault()` / `stopPropagation()`.
- `preventBaseUIHandler()` only works on React synthetic events. Custom/non-synthetic events run all handlers unconditionally.
- Handlers returned from a function arg ignore `preventBaseUIHandler()` automatically; check `event.baseUIHandlerPrevented` yourself.
- Prefer `mergeProps` (≤5 args). Reach for `mergePropsN` only when needed — array form has lower performance.
