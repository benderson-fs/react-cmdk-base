# CSP Provider

Import: `import { CSPProvider } from '@base-ui/react/csp-provider'`

## When to use
- Your app enforces a strict CSP that blocks inline `<style>` / `<script>` tags by default — Base UI injects some (e.g. `<ScrollArea.Viewport>`, `<Select.Popup>` / `<Select.List>` with `alignItemWithTrigger`) and they need a matching nonce to load.
- You want to forbid Base UI from rendering inline `<style>` elements entirely and supply equivalent CSS yourself.
- Mount it near the root of the React tree, above any Base UI component that may render inline tags.

## API

### `<CSPProvider>` props

| Prop                   | Type              | Default | Description                                                                                                                |
| :--------------------- | :---------------- | :------ | :------------------------------------------------------------------------------------------------------------------------- |
| `disableStyleElements` | `boolean`         | `false` | If true, Base UI components do not render inline `<style>` elements. You must supply equivalent CSS via class names / CSS. |
| `nonce`                | `string`          | —       | Nonce applied to inline `<style>` and `<script>` tags emitted by Base UI components.                                       |
| `children`             | `React.ReactNode` | —       | —                                                                                                                          |

### Type aliases

- `CSPProvider.Props` → `CSPProviderProps`
- `CSPProvider.State` → `CSPProviderState` (`{}`)

## Examples

```tsx
// app/layout.tsx (server) — generate a nonce per request and pass it in.
import { CSPProvider } from '@base-ui/react/csp-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = crypto.randomUUID();
  // Set on the response headers:
  //   default-src 'self';
  //   script-src 'self' 'nonce-${nonce}';
  //   style-src-elem 'self' 'nonce-${nonce}';
  return (
    <html lang="en">
      <body>
        <CSPProvider nonce={nonce}>{children}</CSPProvider>
      </body>
    </html>
  );
}
```

Disable inline `<style>` elements instead of supplying a nonce — you become responsible for the CSS that hides native scrollbars (`base-ui-disable-scrollbar` selectors):

```tsx
<CSPProvider disableStyleElements>{/* ... */}</CSPProvider>
```

```css
/* Replacement for the inline style Base UI would otherwise inject. */
.base-ui-disable-scrollbar {
  scrollbar-width: none;
}
.base-ui-disable-scrollbar::-webkit-scrollbar {
  display: none;
}
```

## Inline style attributes vs. elements

`CSPProvider` only covers inline `<style>` / `<script>` *elements*. It does **not** cover inline `style=""` *attributes* (e.g. `<div style="...">`). In CSP:

- `style-src` covers both `<style>` elements and `style=""` attributes.
- `style-src-elem` covers only `<style>` elements.
- `style-src-attr` covers only inline `style=""` attributes, and only when encountered while parsing server-rendered HTML (not when set by client JS).

If your CSP blocks inline style *attributes* too, you have three options:

1. Relax CSP by adding `'unsafe-inline'` to `style-src-attr`, or use `style-src-elem` instead of `style-src`. Attributes are a lower-risk vector than elements but still may not be acceptable in high-security setups.
2. Render affected components on the client only, so the initial HTML carries no inline styles.
3. Unset inline styles per-component and re-apply via CSS, e.g. `<ScrollArea.Viewport style={{ overflow: undefined }} />`. Audit Base UI upgrades for new inline styles when relying on this approach.

## Gotchas
- `<script>` tags are opt-in across all components and have no disable flag. If any component uses inline scripts you must supply a `nonce`; `disableStyleElements` will not help.
- `CSPProvider` only governs inline `<style>` / `<script>` *elements*. Inline `style="..."` *attributes* are governed by `style-src-attr` — see the section above.
- Mount the provider at or above any tree that renders Base UI. Components outside the provider get no nonce and no opt-out.
- Generate the nonce per request and feed the same value to both the CSP header and `CSPProvider`. Reusing a constant nonce defeats the purpose.
- Verify each Base UI upgrade for new inline styles when you've chosen the "unset inline styles" approach.
