# Button

Import: `import { Button } from '@base-ui/react/button'`

## When to use
- Render an accessible `<button>` whenever you need consistent disabled/focus behavior — including the ability to stay focusable while disabled (loading states).
- Use it when you need to render button semantics on a different tag (`render={<div />}` + `nativeButton={false}`).
- Do **not** use it for links (anchors): the component enforces button semantics (`role="button"`, keyboard handlers). Style an `<a>` directly with CSS instead.

## Anatomy
- `Button` — single-element component (no sub-parts). Renders a `<button>` by default.

## Parts API

### Button
Renders a `<button>` element. Used to trigger actions.
**Props:**
- `focusableWhenDisabled` — `boolean` (`false`) — keep focus on the button when `disabled`, useful for loading states so focus/tab order isn't lost
- `nativeButton` — `boolean` (`true`) — whether the rendered element is a native `<button>`. Set `false` when using `render` to produce a non-button element (e.g. `<div>`)
- `disabled` — `boolean` — standard button disabled (also exposed as `data-disabled`)
- `type` — standard HTML; **must** be `"submit"` for form submission (unlike the native `<button>`, the component does not default to `submit`)
- `className` — `string \| ((state: Button.State) => string \| undefined)`
- `style` — `React.CSSProperties \| ((state: Button.State) => React.CSSProperties \| undefined)`
- `render` — `ReactElement \| ((props: HTMLProps, state: Button.State) => ReactElement)`
- All native `<button>` HTML attributes are forwarded (`onClick`, `name`, `value`, `form`, `aria-*`, etc.)

**Data attributes:**
- `data-disabled` — present when the button is disabled

State exposed to render/className functions: `{ disabled: boolean }`.

## Keyboard
| Key | Action |
| --- | --- |
| `Space` / `Enter` | Activate the button (fires `onClick`) |
| `Tab` / `Shift+Tab` | Move focus to/from the button (always reachable when `focusableWhenDisabled`) |

## State
- Stateless on its own — driven entirely by props (`disabled`, `focusableWhenDisabled`, etc.).
- For loading patterns, control `disabled` from local state and set `focusableWhenDisabled` so focus stays put while the action runs.

## Canonical example
```tsx
'use client';
import * as React from 'react';
import { Button } from '@base-ui/react/button';

export default function ExampleButton() {
  const [loading, setLoading] = React.useState(false);

  return (
    <Button
      className="flex h-8 items-center justify-center gap-2 border border-neutral-950 bg-white px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 dark:focus-visible:outline-white dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400"
      disabled={loading}
      focusableWhenDisabled
      onClick={() => {
        setLoading(true);
        setTimeout(() => setLoading(false), 4000);
      }}
    >
      {loading ? 'Submitting' : 'Submit'}
    </Button>
  );
}
```

## Gotchas
- `type` is **not** `submit` by default — set `type="submit"` explicitly inside forms.
- `nativeButton={true}` (default) means `render` must produce a native `<button>`. To render a `<div>` or other tag, also pass `nativeButton={false}`.
- Do not render an `<a>` through `render` — links have different semantics; build a styled link instead.
- Use `focusableWhenDisabled` whenever you toggle `disabled` mid-interaction (loading buttons) so focus doesn't jump to the next focusable element.
- Style both `:disabled` and `[data-disabled]` — `data-disabled` is present on the element even when `focusableWhenDisabled` keeps the button reachable.
- Children should be plain text/icons; if you need a button containing block-level content, use `render={<div />} nativeButton={false}` to avoid invalid HTML.
