---
name: react-cmdk-theming
description: Use when editing src/styles.css, adding tokens, debugging dark-mode behavior, or modifying themes/luz.css / themes/luz-palette.css in react-cmdk-base — covers the six surface token blocks (themeing eight selectors), the three-times dark-mode declaration pattern (light → @media → .dark), data-slot styling hooks, the luz overlay's portal-ancestor requirement, and the Tailwind v4 @theme palette's deliberate omissions.
---

# Theming

Every visual decision in `react-cmdk-base` flows through CSS custom properties. There are SIX token-declaration blocks themeing EIGHT distinct selectors, each declared three times (light, `@media (prefers-color-scheme: dark)`, `.dark` ancestor selector).

**REQUIRED BACKGROUND:** `react-cmdk-architecture` (for where each surface mounts in the DOM and which parts portal).

## The six token blocks

| Block | Selector(s) | Namespace | Mounts via | Why a separate block? |
| --- | --- | --- | --- | --- |
| 1 | `.cmdk-popup` | `--cmdk-*` | Base UI Dialog portal | Portals to `<body>`; cannot inherit |
| 2 | `.pi-root` | `--pi-*` | Inline form | Anchor for inline PromptInput surface |
| 3 | `.pi-menu-popup` | `--pi-menu-*` | Base UI Menu/Select portal | Portals; has `item-hover-bg` + `ring` tokens menu needs |
| 4 | `.pi-tooltip` | `--pi-tooltip-*` | Base UI Tooltip portal | Portals; has `shortcut-fg` tooltip needs |
| 5 | `.si-root` | `--si-*` | Inline form | Anchor for SearchInput; `--si-*` mirror `--pi-*` defaults |
| 6 | `.si-results, .si-picker-popup, .si-tooltip` (combined) | `--si-*` (subset) | Base UI Popover / Select / Tooltip portals | All three portaled SearchInput surfaces share an identical token shape, so they're combined |

Inline surfaces (`.pi-root`, `.si-root`) live in the document tree. Portaled surfaces (`.cmdk-popup`, `.pi-menu-popup`, `.pi-tooltip`, `.si-results`, `.si-picker-popup`, `.si-tooltip`) mount at `<body>` and cannot inherit CSS variables from their logical parent — each MUST declare its own values.

**Why PromptInput has split menu/tooltip blocks but SearchInput combines its three portaled surfaces:** the PromptInput menu and tooltip have different token *shapes* (the menu needs `item-hover-bg` + `ring`; the tooltip needs `shortcut-fg`) so they can't share a block. The three SearchInput portaled surfaces happen to share an identical 6-token shape (bg, border, text, text-muted, item-highlight, separator) — consolidating them is pure deduplication, not a different design philosophy. If a future SearchInput surface needs a unique token, split it out.

## The three-times dark-mode pattern

Each surface declares its tokens three times:

```css
:where(.cmdk-popup) {
  --cmdk-bg: rgb(255 255 255);
  /* …light values… */
}

@media (prefers-color-scheme: dark) {
  :where(.cmdk-popup) {
    --cmdk-bg: rgb(24 24 27);
    /* …dark values… */
  }
}

:where(.dark) :where(.cmdk-popup),
:where(.cmdk-popup):where(.dark) {
  --cmdk-bg: rgb(24 24 27);
  /* …dark values, same as media block… */
}
```

Why three:

1. **Light block** — the default.
2. **`@media (prefers-color-scheme: dark)`** — respects OS preference.
3. **`.dark` ancestor selector** — beats the media query, lets consumers force-dark with a class. The `:where(.dark) <surface>, <surface>:where(.dark)` shape handles both cases: `.dark` on an ancestor (top-down theme switch) AND `.dark` on the surface itself (useful for the always-dark luz overlay on `.cmdk-popup`).

**Don't add a `prefers-color-scheme: light` media block.** The light values are already the default; an explicit light block would clobber the `.dark` ancestor override.

**Don't condense the three blocks into one with CSS variables for the colors.** Tried in early iterations — broke portaled surfaces because `<body class="dark">` doesn't propagate to portaled descendants via CSS-variable inheritance, ONLY via the explicit `:where(.dark) :where(.cmdk-popup)` selector.

## `:where()` for specificity-free selectors

Every token-block selector is wrapped in `:where()` to keep specificity at 0,0,0. This means:

- Consumer's `.my-app .cmdk-popup` (specificity 0,2,0) wins over the library's `:where(.cmdk-popup)` (0,0,0).
- Component-level overrides via `className` win.
- Per-surface overrides documented in the README work — they pick up against any `:where()` rule.

**Don't drop `:where()`** when adding tokens. A regular `.cmdk-popup { … }` rule would have specificity 0,1,0 and force consumers into `!important` arms races.

## Tokens are declared per-surface, not globally

Every theme-able value lives at the top of its surface block. Adding a new component → choose which surface it lives in (or under), and use that surface's namespace:

- New CommandMenu sub-part → `--cmdk-*`
- New PromptInput sub-part rendered inline → `--pi-*`
- New PromptInput sub-part portaled via Menu/Select → `--pi-menu-*`
- New tooltip-y thing portaled via Tooltip → `--pi-tooltip-*`
- New SearchInput sub-part rendered inline → `--si-*`

If a token would be useful across surfaces, declare it in EACH surface block (don't try to share via `:root` — portaled surfaces won't see it during transitions; the cascade has gaps when popups mount).

## `--si-*` falls back to `--pi-*`

SearchInput's tokens default to PromptInput-equivalent values:

```css
:where(.si-root) {
  --si-bg: rgb(255 255 255);          /* matches --pi-bg */
  --si-border: rgb(228 228 231);      /* matches --pi-border */
  /* … */
}
```

The duplication is intentional — keeping them separate lets consumers theme SearchInput independently. But the OUT-OF-THE-BOX values should mirror PromptInput so a page with both surfaces looks coherent. When changing `--pi-*`, update the matching `--si-*` unless you have a specific reason to diverge.

## `data-slot` styling hooks

Every part root renders `data-slot="<family>-<part>"`. These are:

- **Framework-agnostic** — work for vanilla CSS, Tailwind variants, Vue, anything that can match attributes
- **Stable across versions** — adding/removing classNames is a refactor; renaming a `data-slot` is a breaking change
- **More specific than the component's own classes** — wrapper components advertise more specific slots (e.g. `prompt-input-action-menu-trigger` rather than the underlying `prompt-input-button`)

Use them as the primary selector for consumer overrides:

```css
[data-slot="prompt-input-submit"][data-status="streaming"] {
  background: oklch(0.62 0.21 264);
}
```

```tsx
// Tailwind v4 + data-attribute variants
<PromptInput.Submit className="data-[status=streaming]:bg-blue-500" />
```

**When you add a wrapper that delegates to an inner asChild primitive, lock the wrapper's `data-slot` via `forceProps`** so the consumer always sees the most specific slot — see `react-cmdk-aschild` for the pattern.

## Luz theme overlay (`src/themes/luz.css`)

Opt-in token overlay that maps CommandMenu to a Spotlight-style toolbar (always-dark, 20px corners, base-black bg, `product-purple-700` focus ring) and PromptInput to a softer light/dark surface modeled after `@fs/luz`.

**Activation rules** (read carefully — the wrong activation point silently fails for portaled surfaces):

1. Import order matters: `styles.css` first, then `themes/luz.css`.
2. Set `data-theme="luz"` on an ANCESTOR of every portaled surface. In Next.js, the only place that satisfies this is `<html>` (or `<body>` in the root layout).
3. Setting `data-theme="luz"` on a non-ancestor wrapper themes the inline surfaces (`.pi-root`, `.si-root`) but MISSES the portaled ones (`.cmdk-popup`, `.pi-menu-popup`, `.pi-tooltip`).

```tsx
// app/layout.tsx
<html lang="en" data-theme="luz">
  <body>{children}</body>
</html>
```

**Behaviour invariants:**

- **Token-overlay only.** Every value the theme changes is a CSS custom property the base stylesheet already declares. Per-surface overrides documented in the base stylesheet continue to work — they win because of cascade order.
- **CommandMenu is always-dark under luz.** Spotlight is dark by design; `.dark`-mode toggling has no effect on `.cmdk-popup` while luz is active.
- **PromptInput honors `.dark`.** Add `.dark` to the same element as `data-theme="luz"` (or any ancestor) to switch between luz's light and dark FilterToolbar variants.
- **No JS dependency.** No runtime hook into `@fs/luz`; just CSS variables.

When adding new tokens to the base stylesheet, add the matching luz overlay value in `themes/luz.css` — otherwise the new token will silently render with its non-themed default under luz.

## Luz palette (`src/themes/luz-palette.css`)

Tailwind v4 `@theme` block that registers the full luz design-system palette so consumer components can use luz-namespaced utility classes:

```tsx
<button className="rounded-luz-button bg-luz-product-purple-700 text-luz-base-white">
  Take action
</button>
```

**Independent from `themes/luz.css`.** Use one, the other, both, or neither.

**What's registered:**

| Namespace | Utility prefix | Token count |
| --- | --- | --- |
| `--color-luz-*` | `bg-luz-`, `text-luz-`, `border-luz-`, `fill-luz-`, `stroke-luz-` | 80 |
| `--radius-luz-*` | `rounded-luz-`, `rounded-t-luz-`, `rounded-tl-luz-`, … | 10 |
| `--shadow-luz-*` | `shadow-luz-` | 7 |
| `--ease-luz-*` | `ease-luz-` | 1 |

**What's deliberately NOT registered, with reasons:**

| Category | Why not |
| --- | --- |
| Font families | Would require font assets the consumer hasn't loaded |
| Spacing | Luz uses a 5px-based scale that would conflict with Tailwind's 4px default if applied to `--spacing` |
| Breakpoints | Luz redefines `--breakpoint-xl: 1440px` which would silently shift the consumer's `xl:*` breakpoint |
| Animations | Luz's `@keyframes` overlap with Tailwind defaults |

Each omission is a designed-in decision — adding any of them back risks breaking consumer code. Don't add them without explicit user request AND a deprecation plan.

**Hex values are inlined.** No runtime dependency on `@fs/luz`. If luz updates their palette, this file is frozen and must be manually refreshed — leave a comment in the PR if you do.

## Tailwind v4 default activation

Tailwind v4 reads the `@theme` block at compile time and generates utilities ONLY for the tokens consumers actually reference in source. Unused tokens incur zero output cost. This is why all 80+ color tokens can be registered without bloating consumer bundles.

For Tailwind v4 setup, variants, and `@utility`-defined custom utilities, see `tailwind-v4-architecture`. For utility class lookups, see `tailwind-v4-utilities`.

## CSP and inline styles

Base UI's positioner sets inline styles for floating placement. If the consumer's CSP forbids inline styles, they must mount `<CSPProvider nonce={…}>` at the app root (see `base-ui-utilities` → `csp-provider.md`). This is consumer-side, NOT something the library can solve. Document the requirement on any PR that adds a new portaled surface.

## Gotchas

- **Don't add a 7th block** unless the new surface portals to `document.body` AND has a token shape that doesn't fit an existing combined block. Same-family non-portaled additions go into the existing surface's block.
- **Don't drop the `.dark` ancestor selector** — the `@media` block alone misses force-dark scenarios (e.g. settings panel toggle, OS preference override).
- **Don't rename a `data-slot`** without a major-version bump. Consumers rely on these for theming hooks.
- **Don't use Tailwind utility classes for the library's own internal styling** — every visual decision must flow through a CSS variable so consumers can override. Utilities are fine ONLY for layout primitives that consumers wouldn't want to retheme (flex, grid, gap).
- **Don't share tokens across surfaces via `:root`** — portaled surfaces have gaps in CSS-variable inheritance during mount/unmount transitions. Duplicate per-surface.
- **Don't add a luz token without updating both `styles.css` (the base) AND `themes/luz.css` (the overlay)** — the overlay only works because every value it sets has a corresponding declaration in the base.

## Where to look in source

- `src/styles.css` — every base token + every utility class the library ships. Lines 1-300 are token blocks; the rest are component styles.
- `src/themes/luz.css` — the opt-in theme overlay. Mirrors the base token list with luz values.
- `src/themes/luz-palette.css` — the Tailwind `@theme` block. 80 colors + 10 radii + 7 shadows + 1 easing. Hex-inlined.
- `app/app/layout.tsx` (prototype) — shows the canonical activation point for `data-theme="luz"` and `.dark`.

## What NOT to do

- **Don't put theme tokens in JS or TS files** — they belong in CSS so they participate in the cascade and consumers can override via stylesheet.
- **Don't ship the luz overlay as the default** — it's opt-in for a reason. Many consumers want their own design system, not Spotlight aesthetics.
- **Don't try to support OS dark-mode AND `.dark` AND `data-theme` simultaneously without testing all combinations** — the matrix is small (4 cells) but each cell has portaled-surface implications. Test all four with the prototype `app/` before merging.
- **Don't add CSS variable fallbacks (`var(--pi-bg, fallback)`) in the base stylesheet** — the surface blocks already declare every variable. A `var(--pi-bg, fallback)` in a utility class hides the missing declaration instead of failing loudly during development.
