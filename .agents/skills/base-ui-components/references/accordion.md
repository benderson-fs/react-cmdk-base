# Accordion

Import: `import { Accordion } from '@base-ui/react/accordion'`

## When to use
- Group multiple expandable sections under headings (e.g. FAQ, settings panels).
- Use `multiple` to allow several panels open simultaneously; otherwise it behaves single-select.
- Prefer `Collapsible` when you only need one stand-alone open/close panel without grouping or roving focus.

## Anatomy
- `Accordion.Root` — groups all items, owns value/orientation state
- `Accordion.Item` — pairs a header with its panel
- `Accordion.Header` — heading (`<h3>`) that labels the panel
- `Accordion.Trigger` — button toggling the item
- `Accordion.Panel` — collapsible content region

## Parts API

### Accordion.Root
Renders a `<div>`. Groups all parts of the accordion.
**Props:**
- `defaultValue` — `Value[]` — uncontrolled initially open items
- `value` — `Value[]` — controlled open items
- `onValueChange` — `(value: Value[], eventDetails: Accordion.Root.ChangeEventDetails) => void` — fires when items expand/collapse
- `hiddenUntilFound` — `boolean` (`false`) — enables in-page find; uses `hidden="until-found"`, overrides `keepMounted`
- `loopFocus` — `boolean` (`true`) — loop arrow-key focus back to first item at the end
- `multiple` — `boolean` (`false`) — allow multiple open items
- `disabled` — `boolean` (`false`) — ignore user interaction
- `orientation` — `'horizontal' \| 'vertical'` (`'vertical'`) — drives arrow-key axis
- `className` — `string \| ((state: Accordion.Root.State<Value>) => string \| undefined)`
- `style` — `React.CSSProperties \| ((state) => React.CSSProperties \| undefined)`
- `keepMounted` — `boolean` (`false`) — keep panels in DOM while closed; ignored if `hiddenUntilFound`
- `render` — `ReactElement \| ((props: HTMLProps, state) => ReactElement)`

**Data attributes:**
- `data-orientation` — orientation of the accordion
- `data-disabled` — present when disabled

### Accordion.Item
Renders a `<div>`. Groups a header with its panel.
**Props:**
- `value` — `any` — unique id for this item (auto if omitted); use to seed/control open state
- `onOpenChange` — `(open: boolean, eventDetails: Accordion.Item.ChangeEventDetails) => void`
- `disabled` — `boolean` (`false`)
- `className` — `string \| ((state: Accordion.Item.State) => string \| undefined)`
- `style` — `React.CSSProperties \| ((state) => React.CSSProperties \| undefined)`
- `render` — `ReactElement \| ((props, state) => ReactElement)`

**Data attributes:**
- `data-open` — present when item open
- `data-disabled` — present when item disabled
- `data-index` — `number` — item index

### Accordion.Header
Renders an `<h3>`. Heading that labels the panel.
**Props:**
- `className` — `string \| ((state: Accordion.Header.State) => string \| undefined)`
- `style` — `React.CSSProperties \| ((state) => React.CSSProperties \| undefined)`
- `render` — `ReactElement \| ((props, state) => ReactElement)`

**Data attributes:**
- `data-open` — present when item open
- `data-disabled` — present when item disabled
- `data-index` — `number`

### Accordion.Trigger
Renders a `<button>`. Opens and closes its panel.
**Props:**
- `nativeButton` — `boolean` (`true`) — set `false` when `render` produces a non-button element
- `className` — `string \| ((state: Accordion.Trigger.State) => string \| undefined)`
- `style` — `React.CSSProperties \| ((state) => React.CSSProperties \| undefined)`
- `render` — `ReactElement \| ((props, state) => ReactElement)`

**Data attributes:**
- `data-panel-open` — present when the panel is open
- `data-disabled` — present when item disabled

### Accordion.Panel
Renders a `<div>`. Collapsible content region.
**Props:**
- `hiddenUntilFound` — `boolean` (`false`) — uses `hidden="until-found"`, overrides `keepMounted`
- `keepMounted` — `boolean` (`false`) — keep in DOM while closed; ignored if `hiddenUntilFound`
- `className` — `string \| ((state: Accordion.Panel.State) => string \| undefined)`
- `style` — `React.CSSProperties \| ((state) => React.CSSProperties \| undefined)`
- `render` — `ReactElement \| ((props, state) => ReactElement)`

**Data attributes:**
- `data-open` — present when panel open
- `data-orientation` — accordion orientation
- `data-disabled` — present when item disabled
- `data-index` — `number`
- `data-starting-style` — animating in
- `data-ending-style` — animating out

**CSS variables:**
- `--accordion-panel-height` — current panel height (for height transitions)
- `--accordion-panel-width` — current panel width

## Keyboard
| Key | Action |
| --- | --- |
| `Space` / `Enter` | Toggle the focused item |
| `ArrowDown` / `ArrowUp` (vertical) | Move focus to next/previous trigger |
| `ArrowRight` / `ArrowLeft` (horizontal) | Move focus to next/previous trigger |
| `Home` / `End` | Move focus to first/last trigger |

## State
- Uncontrolled: `defaultValue={['item-a']}` or omit and rely on auto-generated item ids
- Controlled: `value` + `onValueChange` (always an array, even in single-open mode)
- Item-level open state available via `Accordion.Item` `onOpenChange`
- `ChangeEventReason` is `'trigger-press' | 'none'`; `ChangeEventDetails` exposes `cancel()`, `allowPropagation()`, `isCanceled`, `isPropagationAllowed`, and the `trigger` element

## Animation
- `data-starting-style` / `data-ending-style` mark the in/out animation phases on `Panel`.
- Animate `height` against `var(--accordion-panel-height)` (or width with `--accordion-panel-width` when horizontal).
- Set `keepMounted` (or `hiddenUntilFound`) on `Root`/`Panel` if your transition library needs the node to stay in the DOM.

## Canonical example
```tsx
import * as React from 'react';
import { Accordion } from '@base-ui/react/accordion';

export default function ExampleAccordion() {
  return (
    <Accordion.Root className="flex w-full max-w-80 flex-col border border-neutral-950 text-neutral-950 dark:border-white dark:text-white">
      {[
        ['What is Base UI?', 'Base UI is a library of high-quality unstyled React components.'],
        ['How do I get started?', 'Read the Quick start guide in the docs.'],
        ['Can I use it for my project?', 'Of course! Base UI is free and open source.'],
      ].map(([q, a], i) => (
        <Accordion.Item
          key={q}
          className={i === 0 ? '' : 'border-t border-neutral-950 dark:border-white'}
        >
          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 bg-transparent px-3 py-2 text-left text-sm select-none hover:not-data-disabled:bg-neutral-100 focus-visible:relative focus-visible:z-1 focus-visible:outline-2 focus-visible:outline-neutral-950 dark:hover:not-data-disabled:bg-neutral-800 dark:focus-visible:outline-white">
              {q}
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                className="shrink-0 transition-transform duration-100 ease-out group-data-panel-open:rotate-45"
              >
                <path d="M1.5 8h13M8 14.5v-13" />
              </svg>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel className="h-[var(--accordion-panel-height)] overflow-hidden text-sm transition-[height] duration-150 ease-out data-ending-style:h-0 data-starting-style:h-0">
            <div className="px-3 py-2">{a}</div>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
```

## Gotchas
- `value` is always an array even with `multiple={false}` — pass `[id]` when controlling.
- The Trigger must live inside `Accordion.Header` for correct heading semantics; do not omit `Header`.
- For animations that depend on measuring height, transition against `var(--accordion-panel-height)` and pair with `data-starting-style`/`data-ending-style`.
- `hiddenUntilFound` overrides `keepMounted`; only use it when you want browser find-in-page to surface hidden content.
- `loopFocus` defaults to `true`; disable it if accordion is part of a larger roving-tabindex scheme.
- Horizontal orientation switches arrow keys to left/right and exposes `--accordion-panel-width` instead of height.
