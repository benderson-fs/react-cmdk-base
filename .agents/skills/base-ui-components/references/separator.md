# Separator

Import: `import { Separator } from '@base-ui/react/separator'`

## When to use
- Visually divide groups of related content while exposing `role="separator"` to assistive tech.
- Use horizontal between stacked sections, vertical inside flex/inline groups.
- Prefer a styled border on the adjacent element when you do not need an accessible separator role.

## Anatomy
- `Separator` — a single, self-contained element. There are no sub-parts.

```jsx
<Separator />
```

## Parts API

### Separator
A separator element accessible to screen readers. Renders a `<div>`.

**Props:**
- `orientation` — `'horizontal' | 'vertical'` (`'horizontal'`) — Logical orientation of the separator.
- `className` — `string | ((state: Separator.State) => string | undefined)`.
- `style` — `React.CSSProperties | ((state: Separator.State) => React.CSSProperties | undefined)`.
- `render` — `ReactElement | ((props: HTMLProps, state: Separator.State) => ReactElement)` — Replace the rendered element/component.

**Data attributes:**
- `data-orientation` — `'horizontal' | 'vertical'` — reflects the resolved `orientation` prop.

## State
`Separator.State` exposes:
```ts
type SeparatorState = { orientation: 'horizontal' | 'vertical' };
```
There is no controlled/uncontrolled API — Separator is stateless.

## Canonical example
```tsx
import { Separator } from '@base-ui/react/separator';

export default function ExampleSeparator() {
  return (
    <div className="flex gap-4 text-nowrap">
      <a
        href="#"
        className="text-sm text-neutral-950 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:text-white dark:focus-visible:outline-white"
      >
        Home
      </a>
      <a
        href="#"
        className="text-sm text-neutral-950 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:text-white"
      >
        Pricing
      </a>
      <a
        href="#"
        className="text-sm text-neutral-950 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:text-white"
      >
        Blog
      </a>

      <Separator
        orientation="vertical"
        className="w-px bg-neutral-300 dark:bg-neutral-700"
      />

      <a
        href="#"
        className="text-sm text-neutral-950 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:text-white"
      >
        Log in
      </a>
      <a
        href="#"
        className="text-sm text-neutral-950 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:text-white"
      >
        Sign up
      </a>
    </div>
  );
}
```

## Gotchas
- A `Separator` has no intrinsic size — set width/height (or use `border` styling) in your own CSS. Horizontal separators typically get `h-px w-full`; vertical separators need `w-px` and a non-zero height inherited from the flex row.
- For purely decorative dividers, render a plain `<hr>` or styled border instead — Separator is for separators that should be announced via the implicit ARIA `separator` role.
- Inside a `Menu`/`Menubar` use the component-specific `*.Separator` (it carries menu semantics); this primitive is for generic layout dividers.
- `data-orientation` is always emitted, even with the default; rely on it for orientation-specific styling rather than reading the prop.
- The component does not expose `aria-orientation` overrides — change `orientation` to flip both the data attribute and ARIA semantics in lockstep.
