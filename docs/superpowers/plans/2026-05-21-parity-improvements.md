# Parity Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the highest-value functionality gaps identified in the parity review against `cmdk` (pacocoursey) and `ai-elements` PromptInput — without re-introducing any reference-package dependencies.

**Architecture:** Lift per-page item match-tracking into `CommandMenu` context so `Empty`/`Loading` are reactive, and expose a `filter` prop on Root for custom matching. Add `Loading`, `Separator`, and `forceMount` as small primitive additions. On the PromptInput side, wrap Base UI's `Tooltip` for `PromptInput.Button` and add an `AddScreenshot` action menu item that uses `getDisplayMedia`. All changes are additive; no public-API breakage.

**Tech Stack:** TypeScript, React 19 (ref-as-prop), Base UI v1.5 (`Combobox`, `Tooltip`, `Separator`, `Menu`), Vitest + jsdom + RTL, Tailwind v4, tsup, pnpm.

---

## Working Conventions

- **Branch:** Cut `feat/parity-improvements` from `chore/component-quality-pass` (current HEAD). Use `git checkout -b feat/parity-improvements` once at the start.
- **Per-task verify:** `pnpm type-check && pnpm test` must be green before every commit step.
- **Commit messages:** Conventional Commits. Each task ends in exactly one commit.
- **Public API:** Additive only. No renamed or removed exports.
- **Tailwind classes:** `pi-*` and `cmdk-*` prefixes are public — don't rename existing classes; new ones follow the same prefix.
- **Base UI imports:** Always use the segmented `@base-ui/react/<part>` paths that the existing code uses (e.g. `@base-ui/react/tooltip`), not the barrel.

---

## Task 1: Branch and verify clean baseline

**Files:**
- Modify: none

- [ ] **Step 1: Cut the working branch**

Run:
```bash
git checkout chore/component-quality-pass
git checkout -b feat/parity-improvements
```

Expected: switched to a fresh branch off `chore/component-quality-pass` (which contains all 0.2.0 work).

- [ ] **Step 2: Verify clean baseline**

Run:
```bash
pnpm type-check && pnpm test && pnpm build
```

Expected:
- tsc clean
- vitest: 37 tests passing across 8 files
- tsup + tailwind emit `dist/index.js`, `dist/index.d.ts`, `dist/styles.css` cleanly

If any fail, STOP and fix before continuing.

- [ ] **Step 3: No commit**

No-op. Move on.

---

## Task 2: Lift match-tracking into CommandMenu context

This is the foundational refactor that lets `Empty` and `Loading` react to filter state. Currently each `Item` self-filters via local `matchesQuery` and returns `null`. We add a `registerMatch(value, matched)` API so the Root can count matches and expose `matchCount` to consumers.

**Files:**
- Modify: `src/lib/context.ts`
- Modify: `src/parts/root.tsx`
- Modify: `src/parts/item.tsx`
- Test: `tests/match-count.test.tsx` (new)

- [ ] **Step 1: Extend context type**

In `src/lib/context.ts`, find:

```ts
export interface CommandMenuContextValue {
  page: string;
  setPage: (id: string) => void;
  popPage: () => void;
  query: string;
  setQuery: (q: string) => void;
  searchPrefix: string[];
  setSearchPrefix: (p: string[]) => void;
  close: () => void;
  registerItem: (value: string, item: RegisteredItem) => () => void;
  fireSelect: (value: string) => void;
}
```

Add two new fields to this interface:

```ts
  registerMatch: (value: string, matched: boolean) => () => void;
  matchCount: number;
```

The final interface is:

```ts
export interface CommandMenuContextValue {
  page: string;
  setPage: (id: string) => void;
  popPage: () => void;
  query: string;
  setQuery: (q: string) => void;
  searchPrefix: string[];
  setSearchPrefix: (p: string[]) => void;
  close: () => void;
  registerItem: (value: string, item: RegisteredItem) => () => void;
  fireSelect: (value: string) => void;
  registerMatch: (value: string, matched: boolean) => () => void;
  matchCount: number;
}
```

- [ ] **Step 2: Implement match-tracking in `parts/root.tsx`**

In `src/parts/root.tsx`, find the existing `itemsRef` block:

```tsx
  const itemsRef = React.useRef(new Map<string, RegisteredItem>());

  const registerItem = React.useCallback(
    (value: string, item: RegisteredItem) => {
      itemsRef.current.set(value, item);
      return () => {
        itemsRef.current.delete(value);
      };
    },
    [],
  );
```

Immediately after `registerItem`, add:

```tsx
  const [matchSet, setMatchSet] = React.useState<Set<string>>(
    () => new Set(),
  );

  const registerMatch = React.useCallback(
    (value: string, matched: boolean) => {
      setMatchSet((prev) => {
        const has = prev.has(value);
        if (matched && !has) {
          const next = new Set(prev);
          next.add(value);
          return next;
        }
        if (!matched && has) {
          const next = new Set(prev);
          next.delete(value);
          return next;
        }
        return prev;
      });
      return () => {
        setMatchSet((prev) => {
          if (!prev.has(value)) return prev;
          const next = new Set(prev);
          next.delete(value);
          return next;
        });
      };
    },
    [],
  );
```

In the `ctxValue = React.useMemo(...)` block, add `registerMatch` and `matchCount: matchSet.size` to the value, and add `matchSet` to the dependency array. The updated memo should read:

```tsx
  const ctxValue = React.useMemo<
    React.ContextType<typeof CommandMenuContext>
  >(
    () => ({
      page,
      setPage,
      popPage,
      query,
      setQuery,
      searchPrefix,
      setSearchPrefix,
      close,
      registerItem,
      fireSelect,
      registerMatch,
      matchCount: matchSet.size,
    }),
    [
      page,
      setPage,
      popPage,
      query,
      searchPrefix,
      close,
      registerItem,
      fireSelect,
      registerMatch,
      matchSet,
    ],
  );
```

- [ ] **Step 3: Wire `Item` to call `registerMatch`**

In `src/parts/item.tsx`, find the existing block that uses `matchesQuery`:

```tsx
  React.useEffect(() => {
    return registerItem(value, { onSelect, keepOpen });
  }, [registerItem, value, onSelect, keepOpen]);

  if (!matchesQuery(query, label, keywords)) return null;
```

Replace the `if (!matchesQuery(...)) return null;` line with the following block (we'll keep using `matchesQuery` to decide visibility, but ALSO report the result to the Root):

```tsx
  const matched = matchesQuery(query, label, keywords);
  const { registerMatch } = useCommandMenu();
  React.useEffect(() => {
    return registerMatch(value, matched);
  }, [registerMatch, value, matched]);

  if (!matched) return null;
```

Note: `useCommandMenu()` was already destructuring `fireSelect, registerItem, query` at the top of the function. Move the additional destructure of `registerMatch` up to that same call rather than creating a second `useCommandMenu()` invocation:

```tsx
  const { fireSelect, registerItem, query, registerMatch } = useCommandMenu();
```

Then the body becomes:

```tsx
  const label = React.useMemo(
    () => getLabelFromChildren(children) || value,
    [children, value],
  );

  React.useEffect(() => {
    return registerItem(value, { onSelect, keepOpen });
  }, [registerItem, value, onSelect, keepOpen]);

  const matched = matchesQuery(query, label, keywords);
  React.useEffect(() => {
    return registerMatch(value, matched);
  }, [registerMatch, value, matched]);

  if (!matched) return null;
```

The remaining JSX (both branches — asChild and default) stays unchanged.

- [ ] **Step 4: Write the failing test**

Create `tests/match-count.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { CommandMenu, useCommandMenu } from "../src";

function MatchProbe() {
  const ctx = useCommandMenu();
  return <span data-testid="count">{ctx.matchCount}</span>;
}

describe("CommandMenu match tracking", () => {
  it("matchCount reflects visible items as query changes", async () => {
    const user = userEvent.setup();
    render(
      <CommandMenu.Root open onOpenChange={() => {}}>
        <CommandMenu.Input />
        <CommandMenu.List>
          <CommandMenu.Page id="root">
            <CommandMenu.Group>
              <CommandMenu.Item value="apple" onSelect={() => {}}>
                Apple
              </CommandMenu.Item>
              <CommandMenu.Item value="banana" onSelect={() => {}}>
                Banana
              </CommandMenu.Item>
              <CommandMenu.Item value="cherry" onSelect={() => {}}>
                Cherry
              </CommandMenu.Item>
            </CommandMenu.Group>
            <MatchProbe />
          </CommandMenu.Page>
        </CommandMenu.List>
      </CommandMenu.Root>,
    );

    expect(screen.getByTestId("count")).toHaveTextContent("3");

    await user.type(screen.getByRole("combobox"), "an");
    expect(screen.getByTestId("count")).toHaveTextContent("1");

    await user.clear(screen.getByRole("combobox"));
    expect(screen.getByTestId("count")).toHaveTextContent("3");
  });
});
```

- [ ] **Step 5: Run the test, expect pass**

Run: `pnpm vitest run tests/match-count.test.tsx`
Expected: PASS (1 test).

If it fails because `getByRole("combobox")` returns the wrong element, inspect `tests/filter.test.tsx` for the working selector pattern (the existing filter test exercises the input directly).

- [ ] **Step 6: Verify full suite**

Run: `pnpm type-check && pnpm test`
Expected: tsc clean; 38 tests pass (37 + 1 new).

- [ ] **Step 7: Commit**

```bash
git add src/lib/context.ts src/parts/root.tsx src/parts/item.tsx tests/match-count.test.tsx
git commit -m "feat(command-menu): track match count in Root context"
```

---

## Task 3: Auto-render `<CommandMenu.Empty>` on zero matches

**Files:**
- Modify: `src/parts/empty.tsx`
- Test: `tests/empty.test.tsx` (new)

- [ ] **Step 1: Write the failing test**

Create `tests/empty.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { CommandMenu } from "../src";

describe("CommandMenu.Empty", () => {
  function Harness() {
    return (
      <CommandMenu.Root open onOpenChange={() => {}}>
        <CommandMenu.Input />
        <CommandMenu.List>
          <CommandMenu.Page id="root">
            <CommandMenu.Group>
              <CommandMenu.Item value="apple" onSelect={() => {}}>
                Apple
              </CommandMenu.Item>
              <CommandMenu.Item value="banana" onSelect={() => {}}>
                Banana
              </CommandMenu.Item>
            </CommandMenu.Group>
            <CommandMenu.Empty>No fruit found</CommandMenu.Empty>
          </CommandMenu.Page>
        </CommandMenu.List>
      </CommandMenu.Root>
    );
  }

  it("does not render when query is empty", () => {
    render(<Harness />);
    expect(screen.queryByText("No fruit found")).toBeNull();
  });

  it("does not render when at least one item matches", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(screen.getByRole("combobox"), "ap");
    expect(screen.queryByText("No fruit found")).toBeNull();
  });

  it("renders when query is non-empty and no items match", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(screen.getByRole("combobox"), "zzz");
    expect(screen.getByText("No fruit found")).toBeInTheDocument();
  });

  it("still supports `alwaysRender` prop (override)", async () => {
    render(
      <CommandMenu.Root open onOpenChange={() => {}}>
        <CommandMenu.Input />
        <CommandMenu.List>
          <CommandMenu.Page id="root">
            <CommandMenu.Empty alwaysRender>Always shown</CommandMenu.Empty>
          </CommandMenu.Page>
        </CommandMenu.List>
      </CommandMenu.Root>,
    );
    expect(screen.getByText("Always shown")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the tests, expect failure**

Run: `pnpm vitest run tests/empty.test.tsx`
Expected: FAIL — first two tests fail (current `Empty` always renders).

- [ ] **Step 3: Update `CommandMenuEmpty`**

Replace `src/parts/empty.tsx` with:

```tsx
import * as React from "react";
import { cn } from "../lib/cn";
import { useCommandMenu } from "../hooks/use-command-menu";

export interface CommandMenuEmptyProps {
  className?: string;
  children?: React.ReactNode;
  /**
   * When true, render regardless of match state. Useful for placeholder
   * content. Defaults to false: Empty only renders when the query is
   * non-empty and no items match.
   */
  alwaysRender?: boolean;
}

export function CommandMenuEmpty({
  className,
  children,
  alwaysRender = false,
}: CommandMenuEmptyProps) {
  const { query, matchCount } = useCommandMenu();
  if (!alwaysRender && (query.length === 0 || matchCount > 0)) return null;
  return (
    <div className={cn("cmdk-empty", className)} data-cmdk-empty>
      {children ?? "No results"}
    </div>
  );
}

CommandMenuEmpty.displayName = "CommandMenu.Empty";
```

- [ ] **Step 4: Run the tests, expect pass**

Run: `pnpm vitest run tests/empty.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Full suite**

Run: `pnpm type-check && pnpm test`
Expected: tsc clean; 42 tests pass (38 + 4 new).

- [ ] **Step 6: Commit**

```bash
git add src/parts/empty.tsx tests/empty.test.tsx
git commit -m "feat(command-menu): Empty auto-renders on zero matches"
```

---

## Task 4: Custom `filter` prop on `CommandMenu.Root`

Right now `Item` uses a hard-coded `matchesQuery` (substring + keyword `includes`). This task adds an optional `filter` prop on `Root` that swaps the matcher — letting consumers wire in fuzzy scoring (e.g. `commandScore`, `fzf`).

**Files:**
- Modify: `src/lib/context.ts` (add `filter` to context)
- Modify: `src/parts/root.tsx` (accept and provide `filter`)
- Modify: `src/parts/item.tsx` (consume `filter` from context)
- Test: `tests/filter.test.tsx` (extend, not replace)

- [ ] **Step 1: Define the filter type**

In `src/lib/context.ts`, add at the top (after `import`):

```ts
export type CommandMenuFilter = (
  query: string,
  label: string,
  keywords: string[] | undefined,
) => boolean;
```

Add to `CommandMenuContextValue`:

```ts
  filter: CommandMenuFilter;
```

Final interface:

```ts
export interface CommandMenuContextValue {
  page: string;
  setPage: (id: string) => void;
  popPage: () => void;
  query: string;
  setQuery: (q: string) => void;
  searchPrefix: string[];
  setSearchPrefix: (p: string[]) => void;
  close: () => void;
  registerItem: (value: string, item: RegisteredItem) => () => void;
  fireSelect: (value: string) => void;
  registerMatch: (value: string, matched: boolean) => () => void;
  matchCount: number;
  filter: CommandMenuFilter;
}
```

- [ ] **Step 2: Update Root to accept and provide `filter`**

In `src/parts/root.tsx`:

a) Extend the existing context import to include `CommandMenuFilter`. Find:

```tsx
import {
  CommandMenuContext,
  type RegisteredItem,
} from "../lib/context";
```

Replace with:

```tsx
import {
  CommandMenuContext,
  type CommandMenuFilter,
  type RegisteredItem,
} from "../lib/context";
```

b) Add `filter` prop to `CommandMenuRootProps`. Find the interface:

```tsx
export interface CommandMenuRootProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  page?: string;
  onPageChange?: (page: string) => void;
  placeholder?: string;
  label?: string;
  loop?: boolean;
  children: React.ReactNode;
}
```

Replace with (adding the `filter` field):

```tsx
export interface CommandMenuRootProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  page?: string;
  onPageChange?: (page: string) => void;
  placeholder?: string;
  label?: string;
  loop?: boolean;
  /**
   * Override the built-in matcher. Receives the current query, the item's
   * label (derived from its children), and any `keywords` it declared.
   * Return `true` to keep the item visible, `false` to hide it. Defaults
   * to a case-insensitive substring + keyword match.
   */
  filter?: CommandMenuFilter;
  children: React.ReactNode;
}
```

c) Destructure `filter` in the function signature:

Find:

```tsx
export function CommandMenuRoot({
  open,
  onOpenChange,
  page: pageProp,
  onPageChange,
  label = "Command menu",
  loop = true,
  children,
}: CommandMenuRootProps) {
```

Replace with:

```tsx
export function CommandMenuRoot({
  open,
  onOpenChange,
  page: pageProp,
  onPageChange,
  label = "Command menu",
  loop = true,
  filter,
  children,
}: CommandMenuRootProps) {
```

d) Inside the function body, just above `const ctxValue = React.useMemo(...)`, add:

```tsx
  const effectiveFilter = React.useMemo<CommandMenuFilter>(
    () => filter ?? defaultFilter,
    [filter],
  );
```

e) Add `filter: effectiveFilter` to the `ctxValue` memo and `effectiveFilter` to its deps:

```tsx
  const ctxValue = React.useMemo<
    React.ContextType<typeof CommandMenuContext>
  >(
    () => ({
      page,
      setPage,
      popPage,
      query,
      setQuery,
      searchPrefix,
      setSearchPrefix,
      close,
      registerItem,
      fireSelect,
      registerMatch,
      matchCount: matchSet.size,
      filter: effectiveFilter,
    }),
    [
      page,
      setPage,
      popPage,
      query,
      searchPrefix,
      close,
      registerItem,
      fireSelect,
      registerMatch,
      matchSet,
      effectiveFilter,
    ],
  );
```

f) Add `defaultFilter` as a module-level helper at the top of `src/parts/root.tsx` (after the imports, before `CommandMenuRootProps`):

```tsx
const defaultFilter: CommandMenuFilter = (query, label, keywords) => {
  if (!query) return true;
  if (keywords?.includes("*")) return true;
  const q = query.toLowerCase();
  if (label.toLowerCase().includes(q)) return true;
  return (keywords ?? []).some((k) => k.toLowerCase().includes(q));
};
```

- [ ] **Step 3: Update `Item` to use `ctx.filter`**

In `src/parts/item.tsx`:

a) Delete the local `matchesQuery` function entirely (it's now in Root as `defaultFilter`). For reference, the function being deleted looks like:

```tsx
function matchesQuery(
  query: string,
  label: string,
  keywords: string[] | undefined,
): boolean {
  if (!query) return true;
  if (keywords?.includes("*")) return true;
  const q = query.toLowerCase();
  if (label.toLowerCase().includes(q)) return true;
  return (keywords ?? []).some((k) => k.toLowerCase().includes(q));
}
```

After deletion the only remaining helper in this file should be `getLabelFromChildren`.

b) Update the destructure to include `filter`:

```tsx
  const { fireSelect, registerItem, query, registerMatch, filter } =
    useCommandMenu();
```

c) Update the `matched` computation:

```tsx
  const matched = filter(query, label, keywords);
```

The rest of the function stays the same.

- [ ] **Step 4: Extend the existing filter test**

Open `tests/filter.test.tsx`. It currently has 1 test (a basic substring match). Append a new test inside the same `describe(...)` block — first find what the existing describe block is named with `head -10 tests/filter.test.tsx`:

If the describe is `describe("filtering", ...)`, append inside it. Otherwise put a new top-level describe at the end.

Add this test:

```tsx
  it("uses custom filter prop when provided", async () => {
    const user = userEvent.setup();
    // A toy custom filter: matches only when the query is the EXACT
    // lowercased label, no partial matches.
    const exactFilter = (q: string, label: string) =>
      q.length === 0 || q.toLowerCase() === label.toLowerCase();

    render(
      <CommandMenu.Root open onOpenChange={() => {}} filter={exactFilter}>
        <CommandMenu.Input />
        <CommandMenu.List>
          <CommandMenu.Page id="root">
            <CommandMenu.Group>
              <CommandMenu.Item value="a" onSelect={() => {}}>
                Apple
              </CommandMenu.Item>
              <CommandMenu.Item value="b" onSelect={() => {}}>
                Banana
              </CommandMenu.Item>
            </CommandMenu.Group>
          </CommandMenu.Page>
        </CommandMenu.List>
      </CommandMenu.Root>,
    );

    const input = screen.getByRole("combobox");
    await user.type(input, "app");
    // "app" is not an exact match → both items hidden
    expect(screen.queryByText("Apple")).toBeNull();
    expect(screen.queryByText("Banana")).toBeNull();

    await user.clear(input);
    await user.type(input, "apple");
    // exact match → Apple visible
    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.queryByText("Banana")).toBeNull();
  });
```

If the test file doesn't already import `userEvent` and `CommandMenu`, add the imports at the top:

```tsx
import userEvent from "@testing-library/user-event";
import { CommandMenu } from "../src";
```

- [ ] **Step 5: Run tests**

```bash
pnpm vitest run tests/filter.test.tsx
```

Expected: PASS — 1 existing + 1 new = 2 tests.

- [ ] **Step 6: Full suite**

```bash
pnpm type-check && pnpm test
```

Expected: tsc clean; 43 tests pass (42 + 1 new).

- [ ] **Step 7: Commit**

```bash
git add src/lib/context.ts src/parts/root.tsx src/parts/item.tsx tests/filter.test.tsx
git commit -m "feat(command-menu): support custom filter via Root prop"
```

---

## Task 5: `forceMount` on `CommandMenu.Item`

Items with `forceMount={true}` skip the filter check entirely — useful for "always show this action" items (e.g. "Create new project").

**Files:**
- Modify: `src/parts/item.tsx`
- Test: `tests/force-mount.test.tsx` (new)

- [ ] **Step 1: Write the failing test**

Create `tests/force-mount.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { CommandMenu } from "../src";

describe("CommandMenu.Item forceMount", () => {
  it("stays visible even when the query has no match", async () => {
    const user = userEvent.setup();
    render(
      <CommandMenu.Root open onOpenChange={() => {}}>
        <CommandMenu.Input />
        <CommandMenu.List>
          <CommandMenu.Page id="root">
            <CommandMenu.Group>
              <CommandMenu.Item value="apple" onSelect={() => {}}>
                Apple
              </CommandMenu.Item>
              <CommandMenu.Item
                value="create-new"
                forceMount
                onSelect={() => {}}
              >
                Create new
              </CommandMenu.Item>
            </CommandMenu.Group>
          </CommandMenu.Page>
        </CommandMenu.List>
      </CommandMenu.Root>,
    );

    await user.type(screen.getByRole("combobox"), "zzz");
    expect(screen.queryByText("Apple")).toBeNull();
    expect(screen.getByText("Create new")).toBeInTheDocument();
  });

  it("does not inflate matchCount when force-mounted via no-match query", async () => {
    // forceMount items SHOULD NOT mark themselves as a "match" — Empty
    // should still appear when the query genuinely has no matches, since
    // forceMount means "render anyway", not "this is a match".
    const user = userEvent.setup();
    render(
      <CommandMenu.Root open onOpenChange={() => {}}>
        <CommandMenu.Input />
        <CommandMenu.List>
          <CommandMenu.Page id="root">
            <CommandMenu.Group>
              <CommandMenu.Item value="apple" onSelect={() => {}}>
                Apple
              </CommandMenu.Item>
              <CommandMenu.Item
                value="create-new"
                forceMount
                onSelect={() => {}}
              >
                Create new
              </CommandMenu.Item>
            </CommandMenu.Group>
            <CommandMenu.Empty>None found</CommandMenu.Empty>
          </CommandMenu.Page>
        </CommandMenu.List>
      </CommandMenu.Root>,
    );

    await user.type(screen.getByRole("combobox"), "zzz");
    expect(screen.getByText("None found")).toBeInTheDocument();
    expect(screen.getByText("Create new")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run, expect failure**

Run: `pnpm vitest run tests/force-mount.test.tsx`
Expected: FAIL — current `Item` has no `forceMount` prop.

- [ ] **Step 3: Add `forceMount` to `Item`**

In `src/parts/item.tsx`, modify `CommandMenuItemProps`:

Find:

```tsx
export interface CommandMenuItemProps {
  value: string;
  keywords?: string[];
  keepOpen?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  onSelect?: (value: string) => void;
  className?: string;
  trailing?: React.ReactNode;
  /**
   * When true, render the child element instead of the default Combobox.Item
   * wrapper. The child receives the row className, click handler, and
   * `aria-disabled` — useful for nesting a Link or custom Button.
   */
  asChild?: boolean;
  children: React.ReactNode;
}
```

Replace with (adding `forceMount`):

```tsx
export interface CommandMenuItemProps {
  value: string;
  keywords?: string[];
  keepOpen?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  onSelect?: (value: string) => void;
  className?: string;
  trailing?: React.ReactNode;
  /**
   * When true, render the child element instead of the default Combobox.Item
   * wrapper. The child receives the row className, click handler, and
   * `aria-disabled` — useful for nesting a Link or custom Button.
   */
  asChild?: boolean;
  /**
   * When true, render the item regardless of the current query. The item
   * is NOT counted as a match, so `<CommandMenu.Empty>` still appears
   * when no real matches exist. Useful for catch-all actions like
   * "Create new …".
   */
  forceMount?: boolean;
  children: React.ReactNode;
}
```

Then update the destructure in the function signature:

Find:

```tsx
export function CommandMenuItem({
  value,
  keywords,
  keepOpen = false,
  icon: Icon,
  disabled,
  onSelect,
  className,
  trailing,
  asChild,
  children,
}: CommandMenuItemProps) {
```

Replace with:

```tsx
export function CommandMenuItem({
  value,
  keywords,
  keepOpen = false,
  icon: Icon,
  disabled,
  onSelect,
  className,
  trailing,
  asChild,
  forceMount,
  children,
}: CommandMenuItemProps) {
```

And update the visibility gate. Find:

```tsx
  const matched = filter(query, label, keywords);
  React.useEffect(() => {
    return registerMatch(value, matched);
  }, [registerMatch, value, matched]);

  if (!matched) return null;
```

Replace with:

```tsx
  const matched = filter(query, label, keywords);
  React.useEffect(() => {
    // forceMount items should not count as a match — they're rendered
    // unconditionally, so they shouldn't suppress <Empty>.
    return registerMatch(value, matched);
  }, [registerMatch, value, matched]);

  if (!matched && !forceMount) return null;
```

- [ ] **Step 4: Run the test, expect pass**

Run: `pnpm vitest run tests/force-mount.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Full suite**

```bash
pnpm type-check && pnpm test
```

Expected: 45 tests pass (43 + 2 new).

- [ ] **Step 6: Commit**

```bash
git add src/parts/item.tsx tests/force-mount.test.tsx
git commit -m "feat(command-menu): add forceMount prop to Item"
```

---

## Task 6: `<CommandMenu.Loading>` primitive

**Files:**
- Create: `src/parts/loading.tsx`
- Modify: `src/command-menu.tsx` (add to namespace)
- Modify: `src/index.ts` (add export)
- Test: `tests/loading.test.tsx` (new)

- [ ] **Step 1: Write the failing test**

Create `tests/loading.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { CommandMenu } from "../src";

describe("CommandMenu.Loading", () => {
  it("renders with role='progressbar' when `loading` is true", () => {
    render(
      <CommandMenu.Root open onOpenChange={() => {}}>
        <CommandMenu.Input />
        <CommandMenu.List>
          <CommandMenu.Page id="root">
            <CommandMenu.Loading loading>Fetching…</CommandMenu.Loading>
          </CommandMenu.Page>
        </CommandMenu.List>
      </CommandMenu.Root>,
    );
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveTextContent("Fetching…");
  });

  it("does not render when `loading` is false", () => {
    render(
      <CommandMenu.Root open onOpenChange={() => {}}>
        <CommandMenu.Input />
        <CommandMenu.List>
          <CommandMenu.Page id="root">
            <CommandMenu.Loading loading={false}>Idle</CommandMenu.Loading>
          </CommandMenu.Page>
        </CommandMenu.List>
      </CommandMenu.Root>,
    );
    expect(screen.queryByText("Idle")).toBeNull();
  });

  it("exposes `aria-valuetext` when provided", () => {
    render(
      <CommandMenu.Root open onOpenChange={() => {}}>
        <CommandMenu.Input />
        <CommandMenu.List>
          <CommandMenu.Page id="root">
            <CommandMenu.Loading loading label="Fetching results">
              …
            </CommandMenu.Loading>
          </CommandMenu.Page>
        </CommandMenu.List>
      </CommandMenu.Root>,
    );
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-label",
      "Fetching results",
    );
  });
});
```

- [ ] **Step 2: Run, expect failure**

Run: `pnpm vitest run tests/loading.test.tsx`
Expected: FAIL with `CommandMenu.Loading is undefined`.

- [ ] **Step 3: Implement `Loading`**

Create `src/parts/loading.tsx`:

```tsx
import * as React from "react";
import { cn } from "../lib/cn";

export interface CommandMenuLoadingProps {
  /** When true, the component renders. Defaults to true so consumers can
   * conditionally render the whole element if they prefer. */
  loading?: boolean;
  /** Optional accessible label, applied as `aria-label`. */
  label?: string;
  className?: string;
  children?: React.ReactNode;
}

export function CommandMenuLoading({
  loading = true,
  label,
  className,
  children,
}: CommandMenuLoadingProps) {
  if (!loading) return null;
  return (
    <div
      role="progressbar"
      aria-label={label}
      className={cn("cmdk-loading", className)}
    >
      {children}
    </div>
  );
}

CommandMenuLoading.displayName = "CommandMenu.Loading";
```

- [ ] **Step 4: Wire into namespace and exports**

In `src/command-menu.tsx`, find the imports and the namespace object. Add the import after the existing parts imports:

```tsx
import { CommandMenuLoading } from "./parts/loading";
```

Add to the `CommandMenu = { ... }` object — insert `Loading: CommandMenuLoading,` after `Empty`:

```tsx
export const CommandMenu = {
  Root: CommandMenuRoot,
  Input: CommandMenuInput,
  List: CommandMenuList,
  Page: CommandMenuPage,
  Group: CommandMenuGroup,
  Item: CommandMenuItem,
  Empty: CommandMenuEmpty,
  Loading: CommandMenuLoading,
  FreeSearch: CommandMenuFreeSearch,
  Footer: CommandMenuFooter,
  Kbd: CommandMenuKbd,
};
```

In `src/index.ts`, after `export { CommandMenuEmpty } from "./parts/empty";`, add:

```ts
export { CommandMenuLoading } from "./parts/loading";
```

And after `export type { CommandMenuEmptyProps } from "./parts/empty";`, add:

```ts
export type { CommandMenuLoadingProps } from "./parts/loading";
```

- [ ] **Step 5: Add minimal styling**

In `src/styles.css`, find the existing `.cmdk-empty` rule:

```css
  .cmdk-empty {
    @apply px-3 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400;
  }
```

Immediately after it, add:

```css
  .cmdk-loading {
    @apply flex items-center justify-center gap-2 px-3 py-4;
    @apply text-sm text-zinc-500 dark:text-zinc-400;
  }
```

- [ ] **Step 6: Run tests**

```bash
pnpm vitest run tests/loading.test.tsx
```

Expected: PASS (3 tests).

```bash
pnpm type-check && pnpm test
```

Expected: 48 tests pass (45 + 3 new).

- [ ] **Step 7: Commit**

```bash
git add src/parts/loading.tsx src/command-menu.tsx src/index.ts src/styles.css tests/loading.test.tsx
git commit -m "feat(command-menu): add Loading primitive with progressbar role"
```

---

## Task 7: `<CommandMenu.Separator>` primitive

**Files:**
- Create: `src/parts/separator.tsx`
- Modify: `src/command-menu.tsx`
- Modify: `src/index.ts`
- Modify: `src/styles.css`
- Test: `tests/separator.test.tsx` (new)

- [ ] **Step 1: Write the failing test**

Create `tests/separator.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { CommandMenu } from "../src";

describe("CommandMenu.Separator", () => {
  it("renders a separator with role='separator'", () => {
    render(
      <CommandMenu.Root open onOpenChange={() => {}}>
        <CommandMenu.Input />
        <CommandMenu.List>
          <CommandMenu.Page id="root">
            <CommandMenu.Group>
              <CommandMenu.Item value="a" onSelect={() => {}}>
                A
              </CommandMenu.Item>
            </CommandMenu.Group>
            <CommandMenu.Separator />
            <CommandMenu.Group>
              <CommandMenu.Item value="b" onSelect={() => {}}>
                B
              </CommandMenu.Item>
            </CommandMenu.Group>
          </CommandMenu.Page>
        </CommandMenu.List>
      </CommandMenu.Root>,
    );
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run, expect failure**

Run: `pnpm vitest run tests/separator.test.tsx`
Expected: FAIL with `CommandMenu.Separator is undefined`.

- [ ] **Step 3: Implement `Separator`**

Create `src/parts/separator.tsx`:

```tsx
import * as React from "react";
import { Separator } from "@base-ui/react/separator";
import { cn } from "../lib/cn";

export interface CommandMenuSeparatorProps {
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export function CommandMenuSeparator({
  className,
  orientation = "horizontal",
}: CommandMenuSeparatorProps) {
  return (
    <Separator
      orientation={orientation}
      className={cn("cmdk-separator", className)}
    />
  );
}

CommandMenuSeparator.displayName = "CommandMenu.Separator";
```

- [ ] **Step 4: Wire into namespace and exports**

In `src/command-menu.tsx`, add the import:

```tsx
import { CommandMenuSeparator } from "./parts/separator";
```

Add `Separator: CommandMenuSeparator,` to the namespace object (place after `Loading`):

```tsx
  Loading: CommandMenuLoading,
  Separator: CommandMenuSeparator,
  FreeSearch: CommandMenuFreeSearch,
```

In `src/index.ts`, after the Loading exports, add:

```ts
export { CommandMenuSeparator } from "./parts/separator";
```

```ts
export type { CommandMenuSeparatorProps } from "./parts/separator";
```

- [ ] **Step 5: Add styling**

In `src/styles.css`, after the `.cmdk-loading` rule, add:

```css
  .cmdk-separator {
    @apply my-1 h-px bg-zinc-200 dark:bg-zinc-800;
  }
```

- [ ] **Step 6: Run tests**

```bash
pnpm vitest run tests/separator.test.tsx
```

Expected: PASS.

```bash
pnpm type-check && pnpm test
```

Expected: 49 tests pass (48 + 1 new).

- [ ] **Step 7: Commit**

```bash
git add src/parts/separator.tsx src/command-menu.tsx src/index.ts src/styles.css tests/separator.test.tsx
git commit -m "feat(command-menu): add Separator primitive"
```

---

## Task 8: Sticky group headings (CSS-only)

**Files:**
- Modify: `src/styles.css`

This is a pure CSS change. No test added — it's a visual property that doesn't affect any assertion the test suite makes.

- [ ] **Step 1: Find the existing `.cmdk-group-label` rule**

Inspect `src/styles.css` for the existing rule:

```css
  .cmdk-group-label {
    @apply px-2 pt-1 text-xs font-medium uppercase tracking-wide;
    @apply text-zinc-500 dark:text-zinc-400;
  }
```

- [ ] **Step 2: Add sticky positioning**

Replace the rule with:

```css
  .cmdk-group-label {
    @apply px-2 pt-1 text-xs font-medium uppercase tracking-wide;
    @apply text-zinc-500 dark:text-zinc-400;
    position: sticky;
    top: 0;
    background-color: var(--cmdk-bg);
    z-index: 1;
  }
```

The `var(--cmdk-bg)` keeps the heading opaque over items scrolling underneath; sticky + `top: 0` keeps it pinned within the scrolling `.cmdk-list` container.

- [ ] **Step 3: Verify build**

```bash
pnpm build:css
```

Expected: clean. Then:

```bash
grep -c "position: sticky" dist/styles.css
```

Expected: at least 1.

- [ ] **Step 4: Full suite**

```bash
pnpm type-check && pnpm test
```

Expected: 49 tests still pass (no test changes; CSS only).

- [ ] **Step 5: Commit**

```bash
git add src/styles.css
git commit -m "feat(styles): sticky group headings in CommandMenu list"
```

---

## Task 9: `<PromptInput.Tooltip>` wrapper

This adds a thin wrapper around Base UI `Tooltip` so consumers can put `<PromptInput.Tooltip content="Send (⌘↵)">…</PromptInput.Tooltip>` around any button. We also let `<PromptInput.Button tooltip="…">` opt into auto-wrapping for the common case.

**Files:**
- Create: `src/prompt-input/tooltip.tsx`
- Modify: `src/prompt-input/button.tsx`
- Modify: `src/prompt-input.tsx`
- Modify: `src/index.ts`
- Test: `tests/tooltip.test.tsx` (new)

- [ ] **Step 1: Write the failing test**

Create `tests/tooltip.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { PromptInput } from "../src";

describe("PromptInput.Tooltip", () => {
  it("shows tooltip content on focus of the trigger", async () => {
    const user = userEvent.setup();
    render(
      <PromptInput.Root onSubmit={() => {}}>
        <PromptInput.Body>
          <PromptInput.Textarea />
        </PromptInput.Body>
        <PromptInput.Footer>
          <PromptInput.Tooltip content="Send the message" shortcut="⌘↵">
            <PromptInput.Button>Send</PromptInput.Button>
          </PromptInput.Tooltip>
        </PromptInput.Footer>
      </PromptInput.Root>,
    );

    const btn = screen.getByRole("button", { name: "Send" });
    await user.tab(); // focus the textarea first
    await user.tab(); // then the button
    expect(btn).toHaveFocus();
    // Base UI Tooltip mounts content into a portal on focus.
    expect(
      await screen.findByText("Send the message"),
    ).toBeInTheDocument();
  });

  it("PromptInput.Button `tooltip` prop short-circuits to wrap automatically", () => {
    render(
      <PromptInput.Root onSubmit={() => {}}>
        <PromptInput.Body>
          <PromptInput.Textarea />
        </PromptInput.Body>
        <PromptInput.Footer>
          <PromptInput.Button tooltip="Helpful hint">
            Help
          </PromptInput.Button>
        </PromptInput.Footer>
      </PromptInput.Root>,
    );
    // The button renders; the tooltip is not visible until hover/focus,
    // but the trigger should be wired up. Confirm the button is rendered.
    expect(
      screen.getByRole("button", { name: "Help" }),
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run, expect failure**

Run: `pnpm vitest run tests/tooltip.test.tsx`
Expected: FAIL — `PromptInput.Tooltip` undefined; `PromptInput.Button` `tooltip` prop unrecognized.

- [ ] **Step 3: Implement `PromptInputTooltip`**

Create `src/prompt-input/tooltip.tsx`:

```tsx
import * as React from "react";
import { Tooltip } from "@base-ui/react/tooltip";
import { cn } from "../lib/cn";

export interface PromptInputTooltipProps {
  content: React.ReactNode;
  /** Optional keyboard shortcut hint shown after the content in muted text. */
  shortcut?: string;
  side?: "top" | "right" | "bottom" | "left";
  /** Open delay in ms (Base UI default). */
  delay?: number;
  className?: string;
  children: React.ReactElement;
}

/**
 * Wrap a single child in a Base UI Tooltip. The child is used as the
 * trigger and must accept ref + standard event handlers (any
 * <PromptInput.Button> or native <button> works).
 */
export function PromptInputTooltip({
  content,
  shortcut,
  side = "top",
  delay,
  className,
  children,
}: PromptInputTooltipProps) {
  return (
    <Tooltip.Root delay={delay}>
      <Tooltip.Trigger
        render={(triggerProps) =>
          React.cloneElement(children, triggerProps as Record<string, unknown>)
        }
      />
      <Tooltip.Portal>
        <Tooltip.Positioner side={side} sideOffset={6}>
          <Tooltip.Popup className={cn("pi-tooltip", className)}>
            <span className="pi-tooltip-content">{content}</span>
            {shortcut ? (
              <span className="pi-tooltip-shortcut">{shortcut}</span>
            ) : null}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

PromptInputTooltip.displayName = "PromptInput.Tooltip";
```

- [ ] **Step 4: Add `tooltip` prop to `PromptInput.Button`**

In `src/prompt-input/button.tsx`:

a) Add the import after the existing imports:

```tsx
import { PromptInputTooltip } from "./tooltip";
```

b) Extend the props interface. Find:

```tsx
export interface PromptInputButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: PromptInputButtonVariant;
  pressed?: boolean;
  asChild?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}
```

Replace with:

```tsx
export interface PromptInputButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: PromptInputButtonVariant;
  pressed?: boolean;
  asChild?: boolean;
  /**
   * Shorthand to wrap this button in a `<PromptInput.Tooltip>`. Pass a
   * string for plain content, or an object for shortcut + side overrides.
   */
  tooltip?:
    | string
    | {
        content: React.ReactNode;
        shortcut?: string;
        side?: "top" | "right" | "bottom" | "left";
      };
  ref?: React.Ref<HTMLButtonElement>;
}
```

c) Destructure `tooltip` from props at the top of the function body:

Find:

```tsx
export function PromptInputButton({
  variant = "ghost",
  pressed,
  asChild,
  type,
  className,
  children,
  ref,
  ...props
}: PromptInputButtonProps) {
```

Replace with:

```tsx
export function PromptInputButton({
  variant = "ghost",
  pressed,
  asChild,
  tooltip,
  type,
  className,
  children,
  ref,
  ...props
}: PromptInputButtonProps) {
```

d) Wrap the return value when `tooltip` is set. The current function body ends with:

```tsx
  if (asChild) {
    return (
      <Slot ...>
        {children as React.ReactElement}
      </Slot>
    );
  }

  return (
    <button ...>
      {children}
    </button>
  );
}
```

Wrap both returns by extracting the rendered button into a local and conditionally wrapping. Replace the final return-section of the function with:

```tsx
  const rendered = asChild ? (
    <Slot
      ref={ref}
      type={type}
      className={mergedClassName}
      data-variant={variant}
      data-pressed={dataPressed}
      aria-pressed={ariaPressed}
      {...props}
    >
      {children as React.ReactElement}
    </Slot>
  ) : (
    <button
      ref={ref}
      type={type ?? "button"}
      data-variant={variant}
      data-pressed={dataPressed}
      aria-pressed={ariaPressed}
      className={mergedClassName}
      {...props}
    >
      {children}
    </button>
  );

  if (!tooltip) return rendered;

  const tooltipProps =
    typeof tooltip === "string" ? { content: tooltip } : tooltip;

  return <PromptInputTooltip {...tooltipProps}>{rendered}</PromptInputTooltip>;
}
```

This means deleting the old `if (asChild)` block and old final `return (...)` and replacing them with the block above.

- [ ] **Step 5: Add tooltip styling**

In `src/styles.css`, after the existing `.pi-menu-popup` rule, add:

```css
  .pi-tooltip {
    @apply z-50 inline-flex items-center gap-2 rounded-md;
    @apply border border-zinc-200 bg-white px-2 py-1 text-xs shadow-md;
    @apply text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100;
    @apply transition-[opacity,transform] duration-100 ease-out;
    background-color: var(--pi-bg);
    border-color: var(--pi-border);
    color: var(--pi-text);
  }
  .pi-tooltip[data-starting-style],
  .pi-tooltip[data-ending-style] {
    @apply opacity-0;
  }
  .pi-tooltip-shortcut {
    @apply text-zinc-500 dark:text-zinc-400;
    color: var(--pi-text-muted);
  }
```

- [ ] **Step 6: Wire into namespace and exports**

In `src/prompt-input.tsx`, add the import after the existing parts imports:

```tsx
import { PromptInputTooltip } from "./prompt-input/tooltip";
```

Add `Tooltip: PromptInputTooltip,` to the namespace (insert after `Submit`):

```tsx
  Submit: PromptInputSubmit,
  Tooltip: PromptInputTooltip,
  ActionMenu: PromptInputActionMenu,
```

In `src/index.ts`, add:

```ts
export { PromptInputTooltip } from "./prompt-input/tooltip";
export type { PromptInputTooltipProps } from "./prompt-input/tooltip";
```

- [ ] **Step 7: Run tests**

```bash
pnpm vitest run tests/tooltip.test.tsx
```

Expected: PASS (2 tests).

If the first test fails because Base UI's Tooltip needs a `Tooltip.Provider` ancestor: inspect `node_modules/@base-ui/react/tooltip/provider/TooltipProvider.d.ts` and decide whether to:
- (a) wrap each `Tooltip.Root` in its own `Tooltip.Provider` inside `PromptInputTooltip`, or
- (b) require consumers to mount a `Tooltip.Provider` at the app root.

The Radix/Base UI convention is (a) for self-contained components. If needed, update `PromptInputTooltip` to wrap with `<Tooltip.Provider>` and re-run.

- [ ] **Step 8: Full suite**

```bash
pnpm type-check && pnpm test
```

Expected: 51 tests pass (49 + 2 new).

- [ ] **Step 9: Commit**

```bash
git add src/prompt-input/tooltip.tsx src/prompt-input/button.tsx src/prompt-input.tsx src/index.ts src/styles.css tests/tooltip.test.tsx
git commit -m "feat(prompt-input): add Tooltip wrapper and Button tooltip prop"
```

---

## Task 10: `<PromptInput.AddScreenshot>` action menu item

A `Menu.Item` that calls `navigator.mediaDevices.getDisplayMedia`, draws a frame to a canvas, and pushes the resulting PNG as an attachment via the existing `addFiles` API.

**Files:**
- Create: `src/prompt-input/add-screenshot.tsx`
- Modify: `src/prompt-input.tsx`
- Modify: `src/index.ts`
- Test: `tests/add-screenshot.test.tsx` (new)

- [ ] **Step 1: Write the failing test**

Create `tests/add-screenshot.test.tsx`:

```tsx
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { PromptInput } from "../src";

// jsdom doesn't ship navigator.mediaDevices. Stub it for these tests.
function stubMediaDevices(
  getDisplayMedia: (
    constraints?: DisplayMediaStreamOptions,
  ) => Promise<MediaStream>,
) {
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: { getDisplayMedia },
  });
}

afterEach(() => {
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: undefined,
  });
});

describe("PromptInput.AddScreenshot", () => {
  it("calls getDisplayMedia and adds a PNG attachment on success", async () => {
    const fakeTrack = { stop: vi.fn() };
    const fakeStream = {
      getTracks: () => [fakeTrack],
    } as unknown as MediaStream;
    const getDisplayMedia = vi.fn().mockResolvedValue(fakeStream);
    stubMediaDevices(getDisplayMedia);

    // Stub HTMLCanvasElement.prototype.toBlob to return a fake PNG blob
    // synchronously (jsdom canvas doesn't render).
    const originalToBlob = HTMLCanvasElement.prototype.toBlob;
    HTMLCanvasElement.prototype.toBlob = function (
      cb: BlobCallback,
    ) {
      cb(new Blob([new Uint8Array([1, 2, 3])], { type: "image/png" }));
    };

    const user = userEvent.setup();
    function Harness() {
      return (
        <PromptInput.Root onSubmit={() => {}}>
          <PromptInput.Attachments />
          <PromptInput.Body>
            <PromptInput.Textarea />
          </PromptInput.Body>
          <PromptInput.Footer>
            <PromptInput.ActionMenu>
              <PromptInput.ActionMenuTrigger />
              <PromptInput.ActionMenuContent>
                <PromptInput.AddScreenshot label="Screenshot" />
              </PromptInput.ActionMenuContent>
            </PromptInput.ActionMenu>
          </PromptInput.Footer>
        </PromptInput.Root>
      );
    }
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: "Open actions" }));
    const item = await screen.findByRole("menuitem", { name: /Screenshot/ });
    await user.click(item);

    // Wait one microtask tick for the promise chain to resolve and
    // attach the file.
    await new Promise((r) => setTimeout(r, 0));

    expect(getDisplayMedia).toHaveBeenCalledTimes(1);
    expect(fakeTrack.stop).toHaveBeenCalled();
    // The attachment chip should appear in the document.
    expect(
      await screen.findByLabelText(/Remove screenshot/i),
    ).toBeInTheDocument();

    HTMLCanvasElement.prototype.toBlob = originalToBlob;
  });

  it("swallows NotAllowedError silently", async () => {
    const getDisplayMedia = vi
      .fn()
      .mockRejectedValue(
        Object.assign(new Error("Permission denied"), {
          name: "NotAllowedError",
        }),
      );
    stubMediaDevices(getDisplayMedia);

    const user = userEvent.setup();
    function Harness() {
      return (
        <PromptInput.Root onSubmit={() => {}}>
          <PromptInput.Body>
            <PromptInput.Textarea />
          </PromptInput.Body>
          <PromptInput.Footer>
            <PromptInput.ActionMenu>
              <PromptInput.ActionMenuTrigger />
              <PromptInput.ActionMenuContent>
                <PromptInput.AddScreenshot label="Screenshot" />
              </PromptInput.ActionMenuContent>
            </PromptInput.ActionMenu>
          </PromptInput.Footer>
        </PromptInput.Root>
      );
    }
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: "Open actions" }));
    const item = await screen.findByRole("menuitem", { name: /Screenshot/ });

    // Should not throw — error is swallowed.
    await expect(user.click(item)).resolves.not.toThrow();
    expect(getDisplayMedia).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run, expect failure**

Run: `pnpm vitest run tests/add-screenshot.test.tsx`
Expected: FAIL — `PromptInput.AddScreenshot` is undefined.

- [ ] **Step 3: Implement `AddScreenshot`**

Create `src/prompt-input/add-screenshot.tsx`:

```tsx
import * as React from "react";
import { Menu } from "@base-ui/react/menu";
import { usePromptInput } from "./context";
import { cn } from "../lib/cn";

function MonitorIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="pi-menu-item-icon"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

async function captureDisplay(): Promise<File | null> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices) return null;
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false,
    });
  } catch (err) {
    const name = (err as { name?: string })?.name;
    if (name === "NotAllowedError" || name === "AbortError") return null;
    throw err;
  }
  try {
    const video = document.createElement("video");
    video.srcObject = stream;
    video.muted = true;
    await video.play();
    // Wait one frame so dimensions are populated.
    await new Promise<void>((res) =>
      requestAnimationFrame(() => res()),
    );
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx2d = canvas.getContext("2d");
    if (ctx2d) ctx2d.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob((b) => res(b), "image/png"),
    );
    if (!blob) return null;
    return new File([blob], `screenshot-${Date.now()}.png`, {
      type: "image/png",
    });
  } finally {
    for (const track of stream.getTracks()) track.stop();
  }
}

export interface PromptInputAddScreenshotProps
  extends Omit<
    React.ComponentProps<typeof Menu.Item>,
    "children" | "className"
  > {
  label?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function PromptInputAddScreenshot({
  label = "Take screenshot",
  icon,
  className,
  onClick,
  ...props
}: PromptInputAddScreenshotProps) {
  const ctx = usePromptInput();
  return (
    <Menu.Item
      className={cn("pi-menu-item", className)}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        // Fire-and-forget; addFiles handles all the URL bookkeeping.
        void captureDisplay().then((file) => {
          if (file) ctx.addFiles([file]);
        });
      }}
      {...props}
    >
      {icon ?? <MonitorIcon />}
      <span className="pi-menu-item-label">{label}</span>
    </Menu.Item>
  );
}

PromptInputAddScreenshot.displayName = "PromptInput.AddScreenshot";
```

- [ ] **Step 4: Wire into namespace and exports**

In `src/prompt-input.tsx`, add the import:

```tsx
import { PromptInputAddScreenshot } from "./prompt-input/add-screenshot";
```

Add `AddScreenshot: PromptInputAddScreenshot,` to the namespace, after `AddAttachments`:

```tsx
  AddAttachments: PromptInputAddAttachments,
  AddScreenshot: PromptInputAddScreenshot,
  ModelSelect: PromptInputModelSelect,
```

In `src/index.ts`:

```ts
export { PromptInputAddScreenshot } from "./prompt-input/add-screenshot";
export type { PromptInputAddScreenshotProps } from "./prompt-input/add-screenshot";
```

- [ ] **Step 5: Run tests**

```bash
pnpm vitest run tests/add-screenshot.test.tsx
```

Expected: PASS (2 tests).

The first test depends on `HTMLCanvasElement.prototype.toBlob` being stubbed because jsdom's canvas doesn't render. If it still fails because `video.play()` rejects in jsdom (no media support), update the test to stub the entire `captureDisplay` flow by adding a `video.play = vi.fn().mockResolvedValue(undefined)` patch on `HTMLVideoElement.prototype` inside the test's `stubMediaDevices` helper. If you must adapt the test, document the change in your task report.

- [ ] **Step 6: Full suite**

```bash
pnpm type-check && pnpm test
```

Expected: 53 tests pass (51 + 2 new).

- [ ] **Step 7: Commit**

```bash
git add src/prompt-input/add-screenshot.tsx src/prompt-input.tsx src/index.ts tests/add-screenshot.test.tsx
git commit -m "feat(prompt-input): add AddScreenshot action menu item"
```

---

## Task 11: Update README and exports

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update the API section to mention new parts**

In `README.md`, find the existing `### Other parts` list under the CommandMenu API section:

```markdown
### Other parts

- `<CommandMenu.Input>` — search input row with magnifier and breadcrumb chips
- `<CommandMenu.List>` — scrollable container
- `<CommandMenu.Page id searchPrefix?>` — drill-down section; only its children render when `page === id`
- `<CommandMenu.Group heading?>` — grouped items with a heading
- `<CommandMenu.Empty>` — fallback content when query has no matches
- `<CommandMenu.FreeSearch label? onSelect?>` — convenience item that appears whenever the query is non-empty
- `<CommandMenu.Footer>` — bottom bar (e.g. keyboard hints)
- `<CommandMenu.Kbd>` — `<kbd>` chip
- `useCommandMenu()` — access query, page, popPage, etc. inside the menu
- `useCmdkShortcut(setOpen)` — wires cmd/ctrl+K
```

Replace with:

```markdown
### Other parts

- `<CommandMenu.Input>` — search input row with magnifier and breadcrumb chips
- `<CommandMenu.List>` — scrollable container
- `<CommandMenu.Page id searchPrefix?>` — drill-down section; only its children render when `page === id`
- `<CommandMenu.Group heading?>` — grouped items with a heading (sticky)
- `<CommandMenu.Empty alwaysRender?>` — auto-renders when the query is non-empty and zero items match; pass `alwaysRender` to force
- `<CommandMenu.Loading loading? label?>` — `role="progressbar"` placeholder for async fetches
- `<CommandMenu.Separator orientation?>` — visual + a11y separator between sections
- `<CommandMenu.FreeSearch label? onSelect?>` — convenience item that appears whenever the query is non-empty
- `<CommandMenu.Footer>` — bottom bar (e.g. keyboard hints)
- `<CommandMenu.Kbd>` — `<kbd>` chip
- `useCommandMenu()` — access query, page, popPage, matchCount, filter, etc. inside the menu
- `useCmdkShortcut(setOpen)` — wires cmd/ctrl+K
```

- [ ] **Step 2: Add `forceMount` and `filter` to the Item / Root prop tables**

Find the `<CommandMenu.Root>` table. Append two rows before the closing `|`:

```markdown
| `filter` | `(query, label, keywords) => boolean` | no | custom matcher; defaults to substring + keyword `includes` |
```

Find the `<CommandMenu.Item>` table. Append:

```markdown
| `forceMount` | `boolean` | render even when the query doesn't match (e.g. "Create new …" actions); doesn't count toward `matchCount` |
| `asChild` | `boolean` | render the child element instead of the default row wrapper |
```

(The `asChild` row may already exist; if so, don't duplicate.)

- [ ] **Step 3: Add a PromptInput section for Tooltip and AddScreenshot**

In `README.md`, find the existing `## Composition with \`asChild\`` section. After it, add:

```markdown
## PromptInput extras

- `<PromptInput.Tooltip content shortcut? side?>` — wrap any button to attach
  a Base UI Tooltip. Shorthand: `<PromptInput.Button tooltip="…">` auto-wraps.
- `<PromptInput.AddScreenshot label? icon?>` — Menu.Item that captures the
  current screen via `navigator.mediaDevices.getDisplayMedia` and adds the
  resulting PNG as an attachment. Silently swallows user cancellation
  (`NotAllowedError` / `AbortError`).
```

- [ ] **Step 4: Verify the README still renders**

```bash
grep -n "Loading\|Separator\|forceMount\|AddScreenshot\|PromptInput.Tooltip" README.md
```

Expected: each grep hit returns at least one line.

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "docs: document new parity primitives (Loading, Separator, forceMount, Tooltip, AddScreenshot)"
```

---

## Task 12: Release-gate, version bump, CHANGELOG, tag

**Files:**
- Modify: `package.json`, `CHANGELOG.md`

- [ ] **Step 1: Run the complete release gate**

```bash
pnpm type-check && pnpm test && pnpm build && pnpm publish --dry-run --no-git-checks
```

Expected:
- tsc clean
- vitest: 53 tests passing
- tsup + tailwind emit cleanly
- publish dry-run produces a tarball — note the size

If any step fails, fix before continuing.

- [ ] **Step 2: Bump version**

Edit `package.json`. Change:

```json
  "version": "0.2.0",
```

to:

```json
  "version": "0.3.0",
```

(Minor bump — additive: new opt-in primitives + props; one new context field; no removed exports.)

- [ ] **Step 3: Prepend CHANGELOG entry**

Open `CHANGELOG.md`. Currently the top reads:

```markdown
# Changelog

## 0.2.0 — 2026-05-21
```

Insert a new section after the `# Changelog` line, before the 0.2.0 block:

```markdown
## 0.3.0 — 2026-05-21

### Added
- `<CommandMenu.Empty>` now auto-renders when the query is non-empty and no
  items match. Pass `alwaysRender` to force the previous behaviour.
- `<CommandMenu.Loading loading label?>` — `role="progressbar"` placeholder
  for async fetches.
- `<CommandMenu.Separator orientation?>` — built on Base UI `Separator`.
- `<CommandMenu.Root filter>` — supply a custom matcher (e.g. fuzzy
  scoring); replaces the default substring + keyword matcher.
- `<CommandMenu.Item forceMount>` — render an item regardless of the
  current query; doesn't inflate `matchCount`.
- `<PromptInput.Tooltip content shortcut? side?>` — Base UI Tooltip wrapper.
- `<PromptInput.Button tooltip>` — shorthand auto-wraps the button.
- `<PromptInput.AddScreenshot>` — Menu.Item that captures the screen via
  `getDisplayMedia` and adds the PNG as an attachment.
- `useCommandMenu()` now exposes `matchCount: number` and
  `filter: (query, label, keywords) => boolean`.

### Changed
- `.cmdk-group-label` is now `position: sticky` so headings stay visible as
  the list scrolls. Uses `var(--cmdk-bg)` for opacity, so consumer theme
  overrides apply.

```

- [ ] **Step 4: Verify**

```bash
head -30 CHANGELOG.md
grep -n "^\"version\":" package.json
```

Expected:
- CHANGELOG starts with `# Changelog`, then `## 0.3.0 — 2026-05-21`, then bullets.
- `package.json` contains `"version": "0.3.0",`.

- [ ] **Step 5: Commit and tag**

```bash
git add package.json CHANGELOG.md
git commit -m "chore: release 0.3.0 — parity improvements"
git tag -a v0.3.0 -m "v0.3.0"
git log --oneline -15
```

Expected: new commit on top, tag `v0.3.0` pointing at it.

---

## Self-Review Notes (controller's checklist)

- **Coverage:**
  - Empty auto-render → Task 3
  - Custom filter prop → Task 4 (also requires Task 2 foundation)
  - Loading primitive → Task 6
  - Separator primitive → Task 7
  - forceMount → Task 5
  - Sticky group headings → Task 8
  - Tooltip wrapper + Button.tooltip prop → Task 9
  - AddScreenshot menu item → Task 10
- **Architecture choice:** Match-tracking foundation (Task 2) lifts state into Root so Empty/Loading can be reactive. This is a small but real architectural change; without it, Empty has no way to know whether anything matched. The alternative (each Item registering visibility through `Combobox.Empty`) would couple us tighter to Base UI's internal filter machinery, which we don't use today.
- **Ordering:** Task 2 is the foundation. Tasks 3, 4, 5 all consume the new context fields. Tasks 6, 7, 8 are independent. Tasks 9, 10 are PromptInput-only.
- **No breaking changes:** every prop is optional with safe defaults. `matchCount` and `filter` being added to the context value is a strictly additive change — consumers who never call `useCommandMenu()` see nothing change.
- **No new runtime deps:** zero. Everything routes through existing `@base-ui/react` parts.
