---
name: react-cmdk-aschild
description: Use when adding asChild to a part, modifying src/lib/slot.tsx, or composing CommandMenu.Item / PromptInput.Button / PromptInput.Submit / SearchInput.Submit with custom design-system elements — covers the Slot merge rules in 0.10.x (event handlers compose, non-event undefined clears, className appends, child wins on collision, forceProps locks identity, refs merged via useMergedRef).
---

# `asChild` composition

The `asChild` pattern in `react-cmdk-base` is handled by `src/lib/slot.tsx`. Behaviour matches Radix's Slot for event-handler composition and Base UI's `baseUIHandlerPrevented` for cancellation, with one additional feature: `forceProps` for library-identity attributes.

**REQUIRED BACKGROUND:** `react-cmdk-architecture` (to understand the three parts that use Slot).

## Which parts support `asChild`

| Part | Slot child | Common use |
| --- | --- | --- |
| `CommandMenu.Item` | `<a>`, `<Link>`, custom row | Navigate without intercepting Enter in JS |
| `PromptInput.Button` | Any button-like element | Render a design-system button while keeping toolbar/tooltip wiring |
| `PromptInput.Submit` | Custom button | Same — but status-aware `aria-label` + `data-status` still apply |
| `SearchInput.Button` | Any button-like element | Same as PromptInput.Button |
| `SearchInput.Submit` | Custom button | Same as PromptInput.Submit |

The Slot path is opt-in per render — `asChild={false}` (default) renders the native element with no Slot overhead.

## Merge rules (`src/lib/slot.tsx`)

The Slot accepts a single React element child and merges parent props onto it. Rules in order of precedence:

### 1. `className` — concatenated

```
parent: "pi-btn pi-btn-ghost"
child:  "my-design-system-button"
→ "pi-btn pi-btn-ghost my-design-system-button"
```

Parent first, child second. Use `cn()` under the hood to dedupe + handle conditional classes.

### 2. `style` — merged, child wins on collision

```ts
parent: { color: "red", padding: 8 }
child:  { color: "blue" }
→ { color: "blue", padding: 8 }
```

Standard object spread — child keys override parent keys; non-conflicting keys are preserved from both.

### 3. Event handlers (`on*`) — composed, parent runs first

```ts
parent.onClick = (e) => { console.log("parent"); }
child.onClick  = (e) => { console.log("child"); }
→ composed = (e) => {
    parent.onClick(e);
    if (e.defaultPrevented) return;
    if (e.baseUIHandlerPrevented) return;
    child.onClick(e);
  }
```

Two cancellation paths:

- **`event.preventDefault()`** in the parent skips the child (standard React/DOM)
- **`event.baseUIHandlerPrevented = true`** in the parent skips the child (Base UI's pattern for non-preventable events, like `onPointerEnter`)

Parent handlers can use either to short-circuit the child. **Don't add a third cancellation flag** without updating both Radix and Base UI awareness.

### 4. Non-event props with `undefined` on child — child WINS (clears the prop)

```tsx
parent: { disabled: true, role: "button" }
child:  <button disabled={undefined}>…</button>
→ rendered: { disabled: undefined, role: "button" }
```

`undefined` on a non-event prop is a meaningful "clear" signal. This is **different from Radix's Slot**, which keeps the parent's value when the child passes `undefined`. The change was made deliberately in 0.10.x to support the common case of overriding `disabled` / `aria-*` / `type` / `role` via asChild:

```tsx
<PromptInput.Submit asChild disabled>
  <button disabled={false}>Always enabled</button>
</PromptInput.Submit>
```

Without this semantics, the child's explicit `disabled={false}` would be silently overridden by the parent's `disabled={true}` — a footgun.

### 5. Event handlers with `undefined` on child — PARENT wins

```tsx
parent: { onClick: handle }
child:  <button onClick={undefined}>…</button>
→ rendered: { onClick: handle }
```

Event handlers preserve Radix's semantics: `undefined` on an `on*` prop is treated as "no handler supplied, parent stays". This matters because design-system buttons frequently spread leftover props that may include `onClick: undefined` from a destructure — without this rule, those would silently disable the parent's click behaviour.

The asymmetry between rules 4 and 5 is intentional. Test cases live in `tests/slot.test.tsx`.

### 6. Other non-event, non-`undefined` props — child WINS

```tsx
parent: { type: "submit", "data-variant": "ghost" }
child:  <button type="button" data-variant="primary">…</button>
→ rendered: { type: "button", "data-variant": "primary" }
```

Child wins. Use this to override `type` (e.g. `type="button"` inside a form to prevent accidental submit) or to set `aria-label` differently from the parent's default.

### 7. `forceProps` — locks identity, applied LAST

```tsx
<Slot forceProps={{ "data-slot": "prompt-input-submit" }}>
  <button data-slot="my-custom">…</button>
</Slot>
→ rendered: { "data-slot": "prompt-input-submit" }
```

`forceProps` is the escape hatch the library uses to prevent consumers from overriding identity attributes through `asChild`. Currently used for `data-slot` on wrapper components — if `PromptInput.ActionMenuTrigger` renders `<PromptInput.Button asChild>` under the hood, the trigger's slot `prompt-input-action-menu-trigger` is locked via `forceProps` so a consumer cannot change it.

**`forceProps` is a literal replace** — it does NOT:
- concatenate className
- merge style
- compose event handlers
- merge ref

Don't put `className`, `style`, event handlers, or `ref` in `forceProps`. The library emits a dev-mode `console.error` if you include `ref`. For the other three, results will be incorrect (last-write-wins instead of the documented merge).

### 8. `ref` — merged via `useMergedRef`

Both the parent forwarded ref and the child's ref get notified. `useMergedRef` (in `src/lib/use-merged-ref.ts`):

- Returns a stable callback ref identity across renders
- Honors cleanup functions returned from callback refs
- Skips refs that switch from `null` → object correctly across renders

Do NOT replicate ref-merging logic anywhere else in the library — the merged-ref identity stability is what keeps Base UI's positioner from re-measuring on every render. Bugs here cause measurable layout thrash.

## Accessible-name preservation on `CommandMenu.Item asChild`

`CommandMenu.Item` has a special rule for `aria-label`:

- **Without `asChild`**: Item's `aria-label` overrides the accessible name AND is used as the filter target. For icon-only items, pass `aria-label` to make them keyboard-reachable.
- **With `asChild`**: The child's natural accessible name (link text, button text) is preserved. Item's `aria-label` propagates to the child ONLY when explicitly set. Empty string or whitespace = "no override" — the child's name stays.

```tsx
// asChild — link text "Docs" is the a11y name, no aria-label override
<CommandMenu.Item asChild value="docs">
  <Link href="/docs">Docs</Link>
</CommandMenu.Item>

// asChild + explicit aria-label — wins
<CommandMenu.Item asChild value="docs" aria-label="Open documentation">
  <Link href="/docs"><Icon /></Link>
</CommandMenu.Item>

// asChild + whitespace aria-label — child's name stays
<CommandMenu.Item asChild value="docs" aria-label="   ">
  <Link href="/docs">Docs</Link>
</CommandMenu.Item>
```

The whitespace branch matters because consumers may pass `aria-label={user.preferredName}` where `preferredName` is sometimes blank — without the whitespace check, the link would silently become unnamed.

## `data-slot` lock pattern

When a wrapper component renders an inner `asChild` primitive, lock the wrapper's slot via `forceProps`:

```tsx
// PromptInput.ActionMenuTrigger
return (
  <PromptInput.Button
    asChild
    {...buttonProps}
  >
    <Menu.Trigger
      data-slot="prompt-input-action-menu-trigger"  // ← consumer-overridable
      …
    />
  </PromptInput.Button>
);
```

vs the correct form:

```tsx
return (
  <Slot
    forceProps={{ "data-slot": "prompt-input-action-menu-trigger" }}
  >
    <Menu.Trigger render={<PromptInput.Button asChild />} … />
  </Slot>
);
```

The pattern: when you advertise a more specific `data-slot` from a composed wrapper, lock it. Consumers reaching for `data-slot=…` selectors should ALWAYS find the most specific slot the library provides — not the underlying primitive's slot.

## Type-level changes (0.10.x)

In 0.10.x, `PromptInputButtonProps`, `PromptInputSubmitProps`, and `PromptInputRootProps` (and likely future Props types) NO LONGER declare `ref` in the interface. `ref` arrives via `React.forwardRef`'s second arg.

**Migration impact**:

- Consumers that destructured `ref` from these prop types must remove the destructure (e.g. when writing wrapper components).
- Passing `ref={x}` in JSX is unchanged.
- The interface is now `React.ButtonHTMLAttributes<HTMLButtonElement> & { … }` — clean and React-canonical.

If you add a new `asChild`-supporting part, follow this pattern: no `ref` in the Props interface; route `ref` through `React.forwardRef`.

## Common mistakes

| Mistake | Fix |
| --- | --- |
| Passing `className` via `forceProps` to "lock" the styles | `forceProps` doesn't concatenate. Either put it in the regular Slot props (will concat via rule 1) or accept that consumers can override via child className. |
| Putting `ref` in `forceProps` | Dev-mode `console.error`. Use the normal `ref` prop path. |
| Adding `aria-label={"" || someValue}` to Item asChild | Empty-string is treated as "no override". The child's natural name stays. Pass a meaningful label or omit the prop. |
| Adding `disabled={undefined}` to the parent expecting "inherit child's" | Parent's `undefined` doesn't trigger any special branch — it's just not set. Rules 4/5 are about CHILD's undefined, not parent's. |
| Wrapping a fragment in Slot | Throws. Slot requires a single React element. Wrap multi-element children in a div first. |
| Building a "Slot lite" elsewhere in the codebase | Use `src/lib/slot.tsx`. Roll-your-own will diverge on edge cases (ref cleanup, baseUIHandlerPrevented, forceProps). |

## Where to look in source

- `src/lib/slot.tsx` — the canonical implementation; rules 1-8 above all live here
- `src/lib/use-merged-ref.ts` — ref-merging with stable identity + cleanup support
- `tests/slot.test.tsx` — covers every rule above (run with `pnpm test -- slot`)
- `src/parts/item.tsx` — Item's `aria-label` preservation logic for asChild
- `src/prompt-input/submit.tsx`, `src/prompt-input/button.tsx` — examples of forwardRef + asChild Slot wiring (canonical patterns)
- `src/prompt-input/action-menu.tsx` — `forceProps` locking the trigger's `data-slot`

## What NOT to do

- **Don't replicate Slot logic for "just one part"** — every divergence creates a hard-to-diagnose composition bug. The four-line conditional you'd write here is the eight-line bug you'll debug next month.
- **Don't add a Slot rule that depends on the React version** — `useMergedRef` already handles React 18 vs 19 ref semantics. Anything else should be version-agnostic.
- **Don't change rules 4 vs 5 to be symmetric** — the asymmetry is documented and tested. Symmetric semantics would either re-introduce the "disabled trap" or break the "destructure-spread" pattern.
- **Don't add forceProps for non-identity attributes** (style, theme classes, etc.) — that's what the regular merge is for. forceProps is for attributes the consumer should NEVER be able to override (data-slot, role when the role is load-bearing, etc.).
