# Component Quality Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the seven gaps surfaced in the building-components review of `@benderson-fs/react-cmdk-base` so the library reaches feature-parity with the building-components spec (asChild, theme tokens, displayName/docs, Submit/ctx alignment, ref-forwarding cleanup, ActionMenuItem keepOpen, isDev helper).

**Architecture:** Add three tiny utility modules (`Slot`, `isDev`, `useMergedRef`) plus two extracted hooks (`useAttachments`, `useDragDrop`) that the existing primitives plug into. Layer CSS custom properties under `.pi-root` / `.cmdk-popup` for theming. No public-API breaking changes — every new prop is additive and defaults preserve current behavior.

**Tech Stack:** TypeScript, React 19 (ref-as-prop), Base UI v1.5, Vitest + jsdom + React Testing Library, Tailwind v4 (`@layer components` with CSS variables), tsup, pnpm.

---

## Working Conventions

- **Branch:** Work on `chore/component-quality-pass` cut from `main`. Use `git checkout -b chore/component-quality-pass` once at the start; every commit lands on this branch.
- **Verify per task:** Always run `pnpm type-check` AND `pnpm test` at the end of a task. Both must be green before the commit step.
- **Commit messages:** Use Conventional Commits. Each task ends in exactly one commit.
- **Public API:** Do not rename or remove any existing export. All new props are optional and default to current behavior.
- **CSS class names:** `pi-*` and `cmdk-*` prefixes are public — do not rename.

---

## Task 1: Branch and verify clean baseline

**Files:**
- Modify: none

- [ ] **Step 1: Create the working branch**

Run:
```bash
git checkout main
git pull --ff-only
git checkout -b chore/component-quality-pass
```

Expected: switched to a fresh branch off `main`.

- [ ] **Step 2: Verify clean baseline**

Run:
```bash
pnpm type-check && pnpm test && pnpm build
```

Expected:
- `tsc --noEmit` exits 0.
- vitest reports `Tests 11 passed | Files 5 passed` (or similar; current expectation is all green).
- `tsup` + tailwind CSS build emit `dist/index.js`, `dist/index.d.ts`, `dist/styles.css` with no errors.

If any of these fail, STOP and fix the failure before proceeding — the plan assumes a green baseline.

- [ ] **Step 3: Commit nothing**

No-op task. Move on.

---

## Task 2: Add `isDev()` helper and use it in ModelSelect

**Files:**
- Create: `src/lib/is-dev.ts`
- Modify: `src/prompt-input/model-select.tsx`
- Test: `tests/is-dev.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/is-dev.test.ts`:

```ts
import { describe, it, expect, vi, afterEach } from "vitest";
import { isDev } from "../src/lib/is-dev";

const originalProcess = globalThis.process;

afterEach(() => {
  if (originalProcess) {
    (globalThis as { process?: NodeJS.Process }).process = originalProcess;
  }
  vi.unstubAllEnvs();
});

describe("isDev", () => {
  it("returns true when NODE_ENV is not 'production'", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(isDev()).toBe(true);
  });

  it("returns false when NODE_ENV is 'production'", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(isDev()).toBe(false);
  });

  it("returns true when process is undefined (browser without shim)", () => {
    (globalThis as { process?: NodeJS.Process }).process =
      undefined as unknown as NodeJS.Process;
    expect(isDev()).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test, expect failure**

Run: `pnpm vitest run tests/is-dev.test.ts`
Expected: FAIL with `Cannot find module '../src/lib/is-dev'`.

- [ ] **Step 3: Implement `isDev`**

Create `src/lib/is-dev.ts`:

```ts
/**
 * True when the bundle is not built for production. Bundlers typically
 * dead-code-eliminate the inverse branch when this is referenced inside
 * an `if (isDev()) { ... }` guard.
 *
 * Safe to call in browsers that have no `process` shim — returns `true`
 * (developer-friendly default) when `process.env.NODE_ENV` cannot be read.
 */
export function isDev(): boolean {
  const env = (
    globalThis as { process?: { env?: { NODE_ENV?: string } } }
  ).process?.env?.NODE_ENV;
  return env !== "production";
}
```

- [ ] **Step 4: Run the test, expect pass**

Run: `pnpm vitest run tests/is-dev.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Replace the hand-rolled guard in ModelSelect**

In `src/prompt-input/model-select.tsx`, replace the `onValueChange ??` block (currently around lines 43–59) with a call to `isDev()`.

Add the import at the top of the file (after the existing imports):

```tsx
import { isDev } from "../lib/is-dev";
```

Replace the existing fallback assignment so the `ctxValue` memo reads:

```tsx
  const ctxValue = React.useMemo<ModelSelectContextValue>(
    () => ({
      value,
      onValueChange:
        onValueChange ??
        ((next: string) => {
          if (isDev()) {
            console.warn(
              `[react-cmdk-base] PromptInput.ModelSelect: selected "${next}" but no onValueChange was provided.`,
            );
          }
        }),
    }),
    [value, onValueChange],
  );
```

- [ ] **Step 6: Verify**

Run:
```bash
pnpm type-check && pnpm test
```

Expected: tsc exits 0; vitest reports all tests passing (previous 11 + 3 new = 14).

- [ ] **Step 7: Commit**

```bash
git add src/lib/is-dev.ts tests/is-dev.test.ts src/prompt-input/model-select.tsx
git commit -m "refactor(prompt-input): extract isDev helper for dev-only warnings"
```

---

## Task 3: Add `useMergedRef` helper and use it in Root

**Files:**
- Create: `src/lib/use-merged-ref.ts`
- Modify: `src/prompt-input/root.tsx`
- Test: `tests/use-merged-ref.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `tests/use-merged-ref.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import * as React from "react";
import { useMergedRef } from "../src/lib/use-merged-ref";

describe("useMergedRef", () => {
  it("assigns to both callback and object refs", () => {
    const callback = vi.fn();
    const object = React.createRef<HTMLDivElement>();

    function Probe() {
      const ref = useMergedRef(callback, object);
      return <div ref={ref} data-testid="probe" />;
    }

    const { getByTestId } = render(<Probe />);
    const node = getByTestId("probe");

    expect(callback).toHaveBeenCalledWith(node);
    expect(object.current).toBe(node);
  });

  it("tolerates null and undefined entries", () => {
    function Probe() {
      const ref = useMergedRef<HTMLDivElement>(null, undefined);
      return <div ref={ref} />;
    }
    expect(() => render(<Probe />)).not.toThrow();
  });
});
```

Add at the top: `import { vi } from "vitest";`

- [ ] **Step 2: Run the test, expect failure**

Run: `pnpm vitest run tests/use-merged-ref.test.tsx`
Expected: FAIL with `Cannot find module '../src/lib/use-merged-ref'`.

- [ ] **Step 3: Implement `useMergedRef`**

Create `src/lib/use-merged-ref.ts`:

```ts
import * as React from "react";

type AnyRef<T> =
  | React.RefCallback<T>
  | React.MutableRefObject<T | null>
  | React.RefObject<T | null>
  | null
  | undefined;

/**
 * Merge multiple refs into a single ref callback so a component can both
 * accept a `ref` prop AND keep an internal ref to the same node.
 *
 * Callback refs receive `null` on unmount; object refs are cleared by
 * React itself, so we don't reassign them on unmount.
 */
export function useMergedRef<T>(...refs: Array<AnyRef<T>>): React.RefCallback<T> {
  return React.useCallback(
    (node: T | null) => {
      for (const ref of refs) {
        if (!ref) continue;
        if (typeof ref === "function") {
          ref(node);
        } else {
          (ref as React.MutableRefObject<T | null>).current = node;
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    refs,
  );
}
```

- [ ] **Step 4: Run the test, expect pass**

Run: `pnpm vitest run tests/use-merged-ref.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Use `useMergedRef` in PromptInputRoot**

In `src/prompt-input/root.tsx`, add the import after the `cn` import:

```tsx
import { useMergedRef } from "../lib/use-merged-ref";
```

Replace the inline ref callback on the `<form>` element. Currently (around lines 377–381):

```tsx
      <form
        ref={(node) => {
          formRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
```

Replace with:

```tsx
      <form
        ref={useMergedRef(formRef, ref)}
```

- [ ] **Step 6: Verify**

Run:
```bash
pnpm type-check && pnpm test
```

Expected: tsc exits 0; vitest reports all tests passing.

- [ ] **Step 7: Commit**

```bash
git add src/lib/use-merged-ref.ts tests/use-merged-ref.test.tsx src/prompt-input/root.tsx
git commit -m "refactor(prompt-input): use useMergedRef for Root's dual-ref pattern"
```

---

## Task 4: Build a `<Slot>` primitive (foundation for asChild)

**Files:**
- Create: `src/lib/slot.tsx`
- Test: `tests/slot.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `tests/slot.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { Slot } from "../src/lib/slot";

describe("Slot", () => {
  it("renders the child element with merged className", () => {
    render(
      <Slot className="from-parent">
        <button className="from-child">Click</button>
      </Slot>,
    );
    const btn = screen.getByRole("button");
    expect(btn.className).toBe("from-parent from-child");
  });

  it("merges and composes onClick — child handler runs after parent", async () => {
    const order: string[] = [];
    const parent = () => order.push("parent");
    const child = () => order.push("child");
    const user = userEvent.setup();

    render(
      <Slot onClick={parent}>
        <button onClick={child}>Click</button>
      </Slot>,
    );
    await user.click(screen.getByRole("button"));
    expect(order).toEqual(["parent", "child"]);
  });

  it("child can stopPropagation to prevent parent handler", async () => {
    const parent = vi.fn();
    const user = userEvent.setup();

    render(
      <Slot onClick={parent}>
        <button
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          Click
        </button>
      </Slot>,
    );
    await user.click(screen.getByRole("button"));
    expect(parent).not.toHaveBeenCalled();
  });

  it("forwards refs to the child element", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <Slot ref={ref}>
        <button>Click</button>
      </Slot>,
    );
    expect(ref.current?.tagName).toBe("BUTTON");
  });

  it("child props win on collision (except className and event handlers)", () => {
    render(
      <Slot data-testid="parent" type="submit">
        <button type="button" data-testid="child">
          Click
        </button>
      </Slot>,
    );
    const btn = screen.getByTestId("child");
    expect(btn.getAttribute("type")).toBe("button");
  });

  it("throws a helpful error if children is not a single element", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      render(
        <Slot>
          <span>one</span>
          <span>two</span>
        </Slot>,
      ),
    ).toThrow(/single React element/);
    spy.mockRestore();
  });
});
```

- [ ] **Step 2: Run the test, expect failure**

Run: `pnpm vitest run tests/slot.test.tsx`
Expected: FAIL with `Cannot find module '../src/lib/slot'`.

- [ ] **Step 3: Implement `Slot`**

Create `src/lib/slot.tsx`:

```tsx
import * as React from "react";
import { cn } from "./cn";

type AnyProps = Record<string, unknown>;

export interface SlotProps {
  children: React.ReactNode;
  [key: string]: unknown;
}

/**
 * Radix-style Slot. Renders its single child with merged props:
 *   - `className`: concatenated (parent first, then child)
 *   - `style`: merged (child wins on key collisions)
 *   - event handlers (props starting with `on`): composed so the parent
 *     handler runs first; if the child calls `e.stopPropagation()` or
 *     mutates `defaultPrevented`, the parent's effect already ran. To
 *     fully cancel the parent, child must call it via its own handler.
 *   - All other props: child wins on collision (so a child can override
 *     `type`, `role`, etc.).
 *
 * Forwards `ref` to the child via React 19 ref-as-prop on the cloned element.
 */
export const Slot = React.forwardRef<unknown, SlotProps>(function Slot(
  { children, ...slotProps },
  forwardedRef,
) {
  if (!React.isValidElement(children)) {
    throw new Error(
      "Slot: `children` must be a single React element when using asChild.",
    );
  }
  const childProps = (children.props ?? {}) as AnyProps;
  const merged: AnyProps = { ...slotProps };

  for (const key of Object.keys(childProps)) {
    const childValue = childProps[key];
    const parentValue = (slotProps as AnyProps)[key];

    if (key === "className") {
      merged.className = cn(
        slotProps.className as string | undefined,
        childValue as string | undefined,
      );
    } else if (key === "style") {
      merged.style = {
        ...(parentValue as React.CSSProperties | undefined),
        ...(childValue as React.CSSProperties | undefined),
      };
    } else if (
      typeof childValue === "function" &&
      typeof parentValue === "function" &&
      key.startsWith("on")
    ) {
      merged[key] = (...args: unknown[]) => {
        (parentValue as (...a: unknown[]) => unknown)(...args);
        (childValue as (...a: unknown[]) => unknown)(...args);
      };
    } else {
      merged[key] = childValue;
    }
  }

  // React 19 ref-as-prop on cloneElement: pass through both forwarded and child ref.
  const childRef = (children as { ref?: React.Ref<unknown> }).ref;
  merged.ref = mergeRefs(forwardedRef, childRef);

  return React.cloneElement(children, merged);
});

function mergeRefs<T>(
  a: React.Ref<T> | undefined,
  b: React.Ref<T> | undefined,
): React.RefCallback<T> {
  return (node: T | null) => {
    for (const ref of [a, b]) {
      if (!ref) continue;
      if (typeof ref === "function") ref(node);
      else (ref as React.MutableRefObject<T | null>).current = node;
    }
  };
}
```

- [ ] **Step 4: Run the test, expect pass**

Run: `pnpm vitest run tests/slot.test.tsx`
Expected: PASS (6 tests).

- [ ] **Step 5: Verify nothing else broke**

Run:
```bash
pnpm type-check && pnpm test
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/slot.tsx tests/slot.test.tsx
git commit -m "feat(lib): add Slot primitive for asChild composition"
```

---

## Task 5: Add `asChild` to `PromptInput.Button`

**Files:**
- Modify: `src/prompt-input/button.tsx`
- Test: `tests/prompt-input.test.tsx`

- [ ] **Step 1: Write the failing test**

Append to `tests/prompt-input.test.tsx` (inside the existing `describe("PromptInput")` block):

```tsx
  it("PromptInput.Button asChild renders the child element with merged props", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(
      <PromptInput.Root onSubmit={() => {}}>
        <PromptInput.Body>
          <PromptInput.Textarea />
        </PromptInput.Body>
        <PromptInput.Footer>
          <PromptInput.Button asChild>
            <a href="/somewhere" onClick={onClick}>
              Go
            </a>
          </PromptInput.Button>
        </PromptInput.Footer>
      </PromptInput.Root>,
    );

    const link = screen.getByRole("link", { name: "Go" });
    expect(link.className).toMatch(/pi-btn/);
    expect(link.getAttribute("href")).toBe("/somewhere");

    await user.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
```

- [ ] **Step 2: Run the test, expect failure**

Run: `pnpm vitest run tests/prompt-input.test.tsx -t "Button asChild"`
Expected: FAIL — either the `<a>` is wrapped in a `<button>` (so `getByRole("link")` fails) or `asChild` prop is not recognized.

- [ ] **Step 3: Update `PromptInputButton`**

Replace the contents of `src/prompt-input/button.tsx` with:

```tsx
import * as React from "react";
import { cn } from "../lib/cn";
import { Slot } from "../lib/slot";

export type PromptInputButtonVariant = "ghost" | "default";

export interface PromptInputButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: PromptInputButtonVariant;
  pressed?: boolean;
  asChild?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}

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
  const mergedClassName = cn("pi-btn", `pi-btn-${variant}`, className);
  const dataPressed = pressed ? "" : undefined;
  const ariaPressed = typeof pressed === "boolean" ? pressed : undefined;

  if (asChild) {
    return (
      <Slot
        ref={ref}
        className={mergedClassName}
        data-variant={variant}
        data-pressed={dataPressed}
        aria-pressed={ariaPressed}
        {...props}
      >
        {children as React.ReactElement}
      </Slot>
    );
  }

  return (
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
}

PromptInputButton.displayName = "PromptInput.Button";
```

- [ ] **Step 4: Run the test, expect pass**

Run: `pnpm vitest run tests/prompt-input.test.tsx -t "Button asChild"`
Expected: PASS.

- [ ] **Step 5: Verify full suite**

Run:
```bash
pnpm type-check && pnpm test
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/prompt-input/button.tsx tests/prompt-input.test.tsx
git commit -m "feat(prompt-input): support asChild on Button"
```

---

## Task 6: Add `asChild` to `PromptInput.Submit` (and default `status` to context)

**Files:**
- Modify: `src/prompt-input/submit.tsx`
- Test: `tests/prompt-input.test.tsx`

- [ ] **Step 1: Write the failing test**

Append to `tests/prompt-input.test.tsx`:

```tsx
  it("PromptInput.Submit uses ctx.status when no `status` prop is provided", async () => {
    function Harness() {
      const [status, setStatus] = React.useState<"ready" | "streaming">(
        "streaming",
      );
      return (
        <>
          <PromptInput.Root onSubmit={() => {}} status={status}>
            <PromptInput.Body>
              <PromptInput.Textarea />
            </PromptInput.Body>
            <PromptInput.Footer>
              <PromptInput.Submit onStop={() => setStatus("ready")} />
            </PromptInput.Footer>
          </PromptInput.Root>
        </>
      );
    }
    const user = userEvent.setup();
    render(<Harness />);

    const stopBtn = screen.getByRole("button", { name: "Stop generating" });
    expect(stopBtn.getAttribute("data-status")).toBe("streaming");

    await user.click(stopBtn);
    expect(
      screen.getByRole("button", { name: "Send message" }),
    ).toBeInTheDocument();
  });

  it("PromptInput.Submit asChild renders the child element", () => {
    render(
      <PromptInput.Root onSubmit={() => {}}>
        <PromptInput.Body>
          <PromptInput.Textarea />
        </PromptInput.Body>
        <PromptInput.Footer>
          <PromptInput.Submit asChild>
            <button data-testid="custom-submit">Send →</button>
          </PromptInput.Submit>
        </PromptInput.Footer>
      </PromptInput.Root>,
    );

    const btn = screen.getByTestId("custom-submit");
    expect(btn.className).toMatch(/pi-submit/);
    expect(btn.getAttribute("type")).toBe("submit");
    expect(btn).toHaveTextContent("Send →");
  });
```

- [ ] **Step 2: Run the tests, expect failure**

Run: `pnpm vitest run tests/prompt-input.test.tsx -t "Submit"`
Expected: FAIL on both new tests — current `Submit` defaults `status` to `"ready"` regardless of context; `asChild` is not supported.

- [ ] **Step 3: Update `PromptInputSubmit`**

Replace the contents of `src/prompt-input/submit.tsx` with:

```tsx
import * as React from "react";
import { cn } from "../lib/cn";
import { Slot } from "../lib/slot";
import { usePromptInput, type PromptInputStatus } from "./context";

export interface PromptInputSubmitProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Override the status from the Root context. Defaults to `ctx.status`.
   * Useful when the Submit button should reflect a state that's distinct
   * from the rest of the prompt (e.g. retry indicator in a sibling).
   */
  status?: PromptInputStatus;
  onStop?: () => void;
  asChild?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}

const STATUS_LABEL: Record<PromptInputStatus, string> = {
  ready: "Send message",
  submitted: "Submitting",
  streaming: "Stop generating",
  error: "Retry",
};

function SendIcon() {
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
    >
      <path d="M9 10L4 15l5 5" />
      <path d="M20 4v7a4 4 0 0 1-4 4H4" />
    </svg>
  );
}

function SpinnerIcon() {
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
      className="pi-spin"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="6" y="6" width="12" height="12" rx="1" />
    </svg>
  );
}

function ErrorIcon() {
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
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function PromptInputSubmit({
  status: statusProp,
  onStop,
  onClick,
  type,
  className,
  children,
  asChild,
  ref,
  ...props
}: PromptInputSubmitProps) {
  const ctx = usePromptInput();
  const status = statusProp ?? ctx.status;
  const isGenerating = status === "submitted" || status === "streaming";
  const stoppable = isGenerating && !!onStop;

  let icon: React.ReactNode;
  if (status === "submitted") icon = <SpinnerIcon />;
  else if (status === "streaming") icon = <StopIcon />;
  else if (status === "error") icon = <ErrorIcon />;
  else icon = <SendIcon />;

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (stoppable) {
        e.preventDefault();
        onStop?.();
        return;
      }
      onClick?.(e);
    },
    [stoppable, onStop, onClick],
  );

  const buttonType = type ?? (stoppable ? "button" : "submit");
  const mergedClassName = cn("pi-submit", className);

  if (asChild) {
    return (
      <Slot
        ref={ref}
        type={buttonType}
        data-status={status}
        aria-label={STATUS_LABEL[status]}
        onClick={handleClick}
        className={mergedClassName}
        {...props}
      >
        {children as React.ReactElement}
      </Slot>
    );
  }

  return (
    <button
      ref={ref}
      type={buttonType}
      data-status={status}
      aria-label={STATUS_LABEL[status]}
      onClick={handleClick}
      className={mergedClassName}
      {...props}
    >
      {children ?? icon}
    </button>
  );
}

PromptInputSubmit.displayName = "PromptInput.Submit";
```

- [ ] **Step 4: Run the tests, expect pass**

Run: `pnpm vitest run tests/prompt-input.test.tsx -t "Submit"`
Expected: PASS for both new tests.

- [ ] **Step 5: Update the demo app to drop the redundant status prop**

Modify `app/app/prompt/page.tsx`. Change the JSX (around line 143) from:

```tsx
            <PromptInput.Submit status={status} onStop={handleStop} />
```

to:

```tsx
            <PromptInput.Submit onStop={handleStop} />
```

(The Root already receives `status` and now propagates via context.)

- [ ] **Step 6: Verify full suite**

Run:
```bash
pnpm type-check && pnpm test
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/prompt-input/submit.tsx tests/prompt-input.test.tsx app/app/prompt/page.tsx
git commit -m "feat(prompt-input): Submit defaults status from context; support asChild"
```

---

## Task 7: Add `asChild` to `PromptInput.ActionMenuItem` and `keepOpen`

**Files:**
- Modify: `src/prompt-input/action-menu.tsx`
- Test: `tests/prompt-input.test.tsx`

- [ ] **Step 1: Write the failing test**

Append to `tests/prompt-input.test.tsx`:

```tsx
  it("PromptInput.ActionMenuItem keepOpen prevents Base UI from closing the menu", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <PromptInput.Root onSubmit={() => {}}>
        <PromptInput.Body>
          <PromptInput.Textarea />
        </PromptInput.Body>
        <PromptInput.Footer>
          <PromptInput.ActionMenu>
            <PromptInput.ActionMenuTrigger />
            <PromptInput.ActionMenuContent>
              <PromptInput.ActionMenuItem keepOpen onClick={onClick}>
                Sticky
              </PromptInput.ActionMenuItem>
            </PromptInput.ActionMenuContent>
          </PromptInput.ActionMenu>
        </PromptInput.Footer>
      </PromptInput.Root>,
    );

    await user.click(screen.getByRole("button", { name: "Open actions" }));
    const sticky = await screen.findByRole("menuitem", { name: "Sticky" });
    await user.click(sticky);

    expect(onClick).toHaveBeenCalledTimes(1);
    // The menu item itself should still be in the document — keepOpen kept the menu open.
    expect(
      screen.queryByRole("menuitem", { name: "Sticky" }),
    ).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run the test, expect failure**

Run: `pnpm vitest run tests/prompt-input.test.tsx -t "keepOpen"`
Expected: FAIL — after click, `Sticky` menuitem is gone (Base UI's default closeOnSelect).

- [ ] **Step 3: Update `PromptInputActionMenuItem`**

In `src/prompt-input/action-menu.tsx`, replace the `PromptInputActionMenuItem` type and component (around lines 100–112) with:

```tsx
// className narrowed — see note on PromptInputActionMenuContentProps.
export interface PromptInputActionMenuItemProps
  extends Omit<React.ComponentProps<typeof Menu.Item>, "className"> {
  className?: string;
  /**
   * When true, the menu stays open after this item is selected. Defaults
   * to `false` (matches Base UI's default close-on-select behaviour).
   */
  keepOpen?: boolean;
}

export function PromptInputActionMenuItem({
  className,
  keepOpen,
  closeOnClick,
  ...props
}: PromptInputActionMenuItemProps) {
  return (
    <Menu.Item
      className={cn("pi-menu-item", className)}
      closeOnClick={keepOpen ? false : closeOnClick}
      {...props}
    />
  );
}

PromptInputActionMenuItem.displayName = "PromptInput.ActionMenuItem";
```

> Note: Base UI v1.5's `Menu.Item` exposes `closeOnClick: boolean` (defaulting to `true`); setting it to `false` keeps the menu open after click. Verified against `node_modules/@base-ui/react/menu/item/MenuItem.d.ts`.

- [ ] **Step 4: Run the test, expect pass**

Run: `pnpm vitest run tests/prompt-input.test.tsx -t "keepOpen"`
Expected: PASS.

- [ ] **Step 5: Verify full suite**

Run:
```bash
pnpm type-check && pnpm test
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/prompt-input/action-menu.tsx tests/prompt-input.test.tsx
git commit -m "feat(prompt-input): ActionMenuItem supports keepOpen"
```

---

## Task 8: Add `asChild` to `CommandMenu.Item`

**Files:**
- Modify: `src/parts/item.tsx`
- Test: `tests/pages.test.tsx` (extend)

- [ ] **Step 1: Write the failing test**

Append to `tests/pages.test.tsx` (or wherever `CommandMenu.Item` is currently exercised — open the file to confirm the existing describe block name):

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { CommandMenu } from "../src";

describe("CommandMenu.Item asChild", () => {
  it("renders the child element with merged props", () => {
    render(
      <CommandMenu.Root open onOpenChange={() => {}}>
        <CommandMenu.Input />
        <CommandMenu.List>
          <CommandMenu.Page id="root">
            <CommandMenu.Group>
              <CommandMenu.Item value="docs" asChild>
                <a href="/docs">Docs</a>
              </CommandMenu.Item>
            </CommandMenu.Group>
          </CommandMenu.Page>
        </CommandMenu.List>
      </CommandMenu.Root>,
    );

    const link = screen.getByRole("link", { name: "Docs" });
    expect(link.getAttribute("href")).toBe("/docs");
    expect(link.className).toMatch(/cmdk-item/);
  });
});
```

> If `tests/pages.test.tsx` already has a top-level `describe`, append the new `describe` block at file end. Do not duplicate imports — re-use existing ones if `CommandMenu` is already imported.

- [ ] **Step 2: Run the test, expect failure**

Run: `pnpm vitest run tests/pages.test.tsx -t "asChild"`
Expected: FAIL — `Item` does not accept `asChild` and renders a `Combobox.Item` (div/li).

- [ ] **Step 3: Update `CommandMenuItem`**

Replace `src/parts/item.tsx` with:

```tsx
import * as React from "react";
import { Combobox } from "@base-ui/react/combobox";
import { useCommandMenu } from "../hooks/use-command-menu";
import { cn } from "../lib/cn";
import { Slot } from "../lib/slot";

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

function getLabelFromChildren(children: React.ReactNode): string {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(getLabelFromChildren).join(" ");
  }
  if (React.isValidElement(children)) {
    const props = children.props as { children?: React.ReactNode };
    return getLabelFromChildren(props.children);
  }
  return "";
}

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
  const { fireSelect, registerItem, query } = useCommandMenu();
  const label = React.useMemo(
    () => getLabelFromChildren(children) || value,
    [children, value],
  );

  React.useEffect(() => {
    return registerItem(value, { onSelect, keepOpen });
  }, [registerItem, value, onSelect, keepOpen]);

  if (!matchesQuery(query, label, keywords)) return null;

  const itemClassName = cn("cmdk-item", className);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!disabled) fireSelect(value);
  };

  if (asChild) {
    return (
      <Combobox.Item
        value={value}
        disabled={disabled}
        aria-label={label}
        render={(itemProps) => (
          <Slot
            {...itemProps}
            className={itemClassName}
            onClick={handleClick}
          >
            {children as React.ReactElement}
          </Slot>
        )}
      />
    );
  }

  return (
    <Combobox.Item
      value={value}
      disabled={disabled}
      aria-label={label}
      className={itemClassName}
      onClick={handleClick}
    >
      {Icon ? <Icon className="cmdk-item-icon" /> : null}
      <span className="cmdk-item-label">{children}</span>
      {trailing ? <span className="cmdk-item-trail">{trailing}</span> : null}
    </Combobox.Item>
  );
}

CommandMenuItem.displayName = "CommandMenu.Item";
```

- [ ] **Step 4: Run the test, expect pass**

Run: `pnpm vitest run tests/pages.test.tsx -t "asChild"`
Expected: PASS.

- [ ] **Step 5: Verify full suite**

Run:
```bash
pnpm type-check && pnpm test
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/parts/item.tsx tests/pages.test.tsx
git commit -m "feat(command-menu): support asChild on Item"
```

---

## Task 9: Add CSS-variable theme layer

**Files:**
- Modify: `src/styles.css`
- Test: manual (visual) + ensure existing tests still pass

- [ ] **Step 1: Inspect current styles**

Run:
```bash
wc -l src/styles.css
```

Read the file end-to-end (`Read` tool with `file_path: /Users/benderson/dev/react-cmdk/src/styles.css`) so you know which utilities are currently hardcoded.

- [ ] **Step 2: Add CSS variables at the top of the file**

In `src/styles.css`, find the first `@layer components` block (the `pi-*` block). Immediately before it, add a `:where()` token block. The selector intentionally has zero specificity so consumer overrides win without `!important`.

```css
@layer components {
  :where(.pi-root) {
    --pi-bg: rgb(255 255 255);
    --pi-border: rgb(228 228 231); /* zinc-200 */
    --pi-border-strong: rgb(212 212 216); /* zinc-300 */
    --pi-text: rgb(24 24 27); /* zinc-900 */
    --pi-text-muted: rgb(113 113 122); /* zinc-500 */
    --pi-accent: rgb(24 24 27); /* zinc-900 */
    --pi-accent-fg: rgb(255 255 255);
    --pi-radius: 0.75rem;
    --pi-radius-inner: 0.5rem;
  }
  @media (prefers-color-scheme: dark) {
    :where(.pi-root) {
      --pi-bg: rgb(9 9 11); /* zinc-950 */
      --pi-border: rgb(39 39 42); /* zinc-800 */
      --pi-border-strong: rgb(63 63 70); /* zinc-700 */
      --pi-text: rgb(244 244 245); /* zinc-100 */
      --pi-text-muted: rgb(161 161 170); /* zinc-400 */
      --pi-accent: rgb(244 244 245);
      --pi-accent-fg: rgb(9 9 11);
    }
  }

  :where(.cmdk-popup) {
    --cmdk-bg: rgb(255 255 255);
    --cmdk-border: rgb(228 228 231);
    --cmdk-text: rgb(24 24 27);
    --cmdk-text-muted: rgb(113 113 122);
    --cmdk-accent: rgb(244 244 245); /* zinc-100 hover bg */
    --cmdk-radius: 0.875rem;
  }
  @media (prefers-color-scheme: dark) {
    :where(.cmdk-popup) {
      --cmdk-bg: rgb(9 9 11);
      --cmdk-border: rgb(39 39 42);
      --cmdk-text: rgb(244 244 245);
      --cmdk-text-muted: rgb(161 161 170);
      --cmdk-accent: rgb(39 39 42);
    }
  }
```

> Place this block **inside** the existing top-level `@layer components { … }`. If the file uses `@layer components` more than once, put it at the top of the first occurrence. Do NOT add a new top-level `@layer components` that would re-order layers.

- [ ] **Step 3: Wire the variables into key utility classes**

The goal of this step is *not* to refactor every rule — only the high-traffic surfaces that consumers will most often want to theme. Replace literal Tailwind utilities with `var(--…)` in these specific rules:

| Selector | Property | New value |
|---|---|---|
| `.pi-root` | `background-color` | `var(--pi-bg)` |
| `.pi-root` | `border-color` | `var(--pi-border)` |
| `.pi-root` | `border-radius` | `var(--pi-radius)` |
| `.pi-root` | `color` | `var(--pi-text)` |
| `.pi-textarea::placeholder` | `color` | `var(--pi-text-muted)` |
| `.pi-submit[data-status="ready"]` | `background-color` | `var(--pi-accent)` |
| `.pi-submit[data-status="ready"]` | `color` | `var(--pi-accent-fg)` |
| `.cmdk-popup` | `background-color` | `var(--cmdk-bg)` |
| `.cmdk-popup` | `border-color` | `var(--cmdk-border)` |
| `.cmdk-popup` | `border-radius` | `var(--cmdk-radius)` |
| `.cmdk-popup` | `color` | `var(--cmdk-text)` |
| `.cmdk-item[data-highlighted]` | `background-color` | `var(--cmdk-accent)` |

If a rule currently uses a Tailwind utility (e.g. `@apply bg-white dark:bg-zinc-950`), replace with `background-color: var(--pi-bg);` and remove the `@apply` for that property only. Leave other utilities on the same selector alone.

If a selector listed above doesn't yet exist in the file (e.g. you split highlight styles differently), skip it — don't invent new selectors in this task.

- [ ] **Step 4: Rebuild styles**

Run:
```bash
pnpm build:css
```

Expected: `dist/styles.css` regenerates with no errors. Open the output and grep for `var(--pi-bg)` to confirm tokens made it through.

```bash
grep -c "var(--pi-bg)" dist/styles.css
```

Expected: at least 1.

- [ ] **Step 5: Verify the demo app still looks right**

Run:
```bash
cd app && pnpm install && pnpm dev
```

In the browser, open `http://localhost:3000` and `http://localhost:3000/prompt`. Visually verify:
- Light mode: white card, dark text. Hover on a command item shows a light-grey background.
- Dark mode (toggle OS-level): dark card, light text.
- Submit button is black-on-white (light) or white-on-black (dark).

If anything looks wrong, the variable→consumer rule mapping in Step 3 is incomplete — go back and add the missing rules.

Stop the dev server when done (`Ctrl+C` or kill the background task).

- [ ] **Step 6: Run the full test suite**

Run:
```bash
pnpm type-check && pnpm test
```

Expected: all tests pass. (Tests don't load CSS — they should be unaffected.)

- [ ] **Step 7: Commit**

```bash
git add src/styles.css
git commit -m "feat(styles): add CSS-variable theme tokens for pi-* and cmdk-*"
```

---

## Task 10: Document theming and asChild in README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add a Theming section**

In `README.md`, append a new section after the existing `## Usage` section:

```markdown
## Theming

Both `CommandMenu` and `PromptInput` expose CSS custom properties on their
root element. Override them in your own stylesheet (or inline `style`):

```css
.pi-root {
  --pi-accent: oklch(0.62 0.21 264);     /* indigo */
  --pi-accent-fg: white;
  --pi-radius: 1rem;
}

.cmdk-popup {
  --cmdk-bg: #fafafa;
  --cmdk-accent: rgba(0, 0, 0, 0.06);
}
```

Available tokens:

**PromptInput** — `--pi-bg`, `--pi-border`, `--pi-border-strong`,
`--pi-text`, `--pi-text-muted`, `--pi-accent`, `--pi-accent-fg`,
`--pi-radius`, `--pi-radius-inner`.

**CommandMenu** — `--cmdk-bg`, `--cmdk-border`, `--cmdk-text`,
`--cmdk-text-muted`, `--cmdk-accent`, `--cmdk-radius`.

Defaults follow the OS color scheme automatically.

## Composition with `asChild`

Several primitives accept `asChild` to delegate rendering to a custom
element while preserving the component's behaviour, ARIA, and styles.
Supported on: `CommandMenu.Item`, `PromptInput.Button`,
`PromptInput.Submit`.

```tsx
<PromptInput.Submit asChild>
  <MyDesignSystemButton variant="primary">Send</MyDesignSystemButton>
</PromptInput.Submit>

<CommandMenu.Item value="docs" asChild>
  <Link href="/docs">Docs</Link>
</CommandMenu.Item>
```

The child must be a single React element. Parent and child event handlers
compose (parent first); the child's `className` is appended to the
primitive's own classes. Other props from the child win on collision so
you can override e.g. `type="button"`.
```

- [ ] **Step 2: Verify the README renders**

Run:
```bash
grep -n "## Theming" README.md
grep -n "## Composition with" README.md
```

Expected: both grep commands return one line each.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: document CSS-variable theming and asChild support"
```

---

## Task 11: Extract `useAttachments` hook

**Files:**
- Create: `src/lib/use-attachments.ts`
- Modify: `src/prompt-input/root.tsx`

This task is a pure refactor with no behavior change — the existing 11 (now ~17) tests cover all the attachment behaviour the hook needs to preserve.

- [ ] **Step 1: Create the hook**

Create `src/lib/use-attachments.ts`:

```ts
import * as React from "react";
import type {
  PromptInputAttachment,
  PromptInputErrorEvent,
} from "../prompt-input/context";

export interface UseAttachmentsOptions {
  accept?: string;
  maxFiles?: number;
  maxFileSize?: number;
  onError?: (err: PromptInputErrorEvent) => void;
  idPrefix: string;
}

export interface UseAttachmentsResult {
  attachments: PromptInputAttachment[];
  addFiles: (files: File[] | FileList) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
}

function matchesAccept(file: File, accept?: string): boolean {
  if (!accept || accept.trim() === "") return true;
  const patterns = accept
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return patterns.some((p) => {
    if (p.startsWith(".")) {
      return file.name.toLowerCase().endsWith(p.toLowerCase());
    }
    if (p.endsWith("/*")) {
      const prefix = p.slice(0, -1);
      return file.type.startsWith(prefix);
    }
    return file.type === p;
  });
}

export function useAttachments({
  accept,
  maxFiles,
  maxFileSize,
  onError,
  idPrefix,
}: UseAttachmentsOptions): UseAttachmentsResult {
  const [attachments, setAttachments] = React.useState<
    PromptInputAttachment[]
  >([]);
  const seq = React.useRef(0);

  const mintId = React.useCallback(() => {
    seq.current += 1;
    return `${idPrefix}-att-${seq.current}`;
  }, [idPrefix]);

  // Defer revoke past the next paint so any <img src={url}> consumer
  // has unmounted first.
  const deferRevoke = React.useCallback((urls: string[]) => {
    if (urls.length === 0) return;
    const run = () => {
      for (const url of urls) URL.revokeObjectURL(url);
    };
    if (typeof queueMicrotask === "function") queueMicrotask(run);
    else Promise.resolve().then(run);
  }, []);

  const addFiles = React.useCallback(
    (input: File[] | FileList) => {
      const incoming = Array.from(input);
      if (incoming.length === 0) return;

      const acceptResult = incoming.reduce<{
        accepted: File[];
        rejected: number;
      }>(
        (acc, f) => {
          if (matchesAccept(f, accept)) acc.accepted.push(f);
          else acc.rejected += 1;
          return acc;
        },
        { accepted: [], rejected: 0 },
      );
      if (acceptResult.rejected > 0) {
        onError?.({
          code: "accept",
          message: `${acceptResult.rejected} file(s) rejected by accept filter.`,
        });
      }
      if (acceptResult.accepted.length === 0) return;

      const sizeResult = acceptResult.accepted.reduce<{
        sized: File[];
        rejected: number;
      }>(
        (acc, f) => {
          if (!maxFileSize || f.size <= maxFileSize) acc.sized.push(f);
          else acc.rejected += 1;
          return acc;
        },
        { sized: [], rejected: 0 },
      );
      if (sizeResult.rejected > 0) {
        onError?.({
          code: "max_file_size",
          message: `${sizeResult.rejected} file(s) exceed the maximum size.`,
        });
      }
      if (sizeResult.sized.length === 0) return;

      setAttachments((prev) => {
        const capacity =
          typeof maxFiles === "number"
            ? Math.max(0, maxFiles - prev.length)
            : undefined;
        const capped =
          typeof capacity === "number"
            ? sizeResult.sized.slice(0, capacity)
            : sizeResult.sized;
        if (
          typeof capacity === "number" &&
          sizeResult.sized.length > capacity
        ) {
          onError?.({
            code: "max_files",
            message: "Too many files. Some were not added.",
          });
        }
        const next: PromptInputAttachment[] = capped.map((file) => ({
          id: mintId(),
          filename: file.name,
          mediaType: file.type,
          size: file.size,
          url: URL.createObjectURL(file),
          file,
        }));
        return [...prev, ...next];
      });
    },
    [accept, maxFileSize, maxFiles, mintId, onError],
  );

  const removeFile = React.useCallback(
    (id: string) => {
      setAttachments((prev) => {
        const found = prev.find((a) => a.id === id);
        if (found?.url) deferRevoke([found.url]);
        return prev.filter((a) => a.id !== id);
      });
    },
    [deferRevoke],
  );

  const clearFiles = React.useCallback(() => {
    setAttachments((prev) => {
      deferRevoke(prev.map((a) => a.url).filter(Boolean));
      return [];
    });
  }, [deferRevoke]);

  // Sweep on unmount
  const attachmentsRef = React.useRef(attachments);
  React.useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);
  React.useEffect(
    () => () => {
      for (const a of attachmentsRef.current) {
        if (a.url) URL.revokeObjectURL(a.url);
      }
    },
    [],
  );

  return { attachments, addFiles, removeFile, clearFiles };
}
```

- [ ] **Step 2: Replace the attachment block in `root.tsx`**

In `src/prompt-input/root.tsx`:

1. Add import after the existing `cn` import:
   ```tsx
   import { useAttachments } from "../lib/use-attachments";
   ```

2. Delete the `matchesAccept` function and the entire attachment-related block: `attachments`, `attachmentSeq`, `mintId`, `addFiles`, `deferRevoke`, `removeFile`, `clearFiles`, the `attachmentsRef`, and the two `useEffect`s that maintain it. (Approximately lines 55–71 and 104–240 in the current file — the exact ranges depend on prior tasks.)

3. Replace them with a single call right after `const idPrefix = React.useId();`:
   ```tsx
   const { attachments, addFiles, removeFile, clearFiles } = useAttachments({
     accept,
     maxFiles,
     maxFileSize,
     onError,
     idPrefix,
   });
   ```

The rest of the file (drag/drop, submit, context value) stays the same — those callers reference `addFiles`, `removeFile`, `clearFiles`, `attachments` which the hook now provides with identical signatures.

- [ ] **Step 3: Verify**

Run:
```bash
pnpm type-check && pnpm test
```

Expected: tsc exits 0; all tests pass (including the attachment-add/remove tests).

- [ ] **Step 4: Commit**

```bash
git add src/lib/use-attachments.ts src/prompt-input/root.tsx
git commit -m "refactor(prompt-input): extract useAttachments hook from Root"
```

---

## Task 12: Extract `useDragDrop` hook

**Files:**
- Create: `src/lib/use-drag-drop.ts`
- Modify: `src/prompt-input/root.tsx`

- [ ] **Step 1: Create the hook**

Create `src/lib/use-drag-drop.ts`:

```ts
import * as React from "react";

export interface UseDragDropOptions {
  /**
   * When true, listen on `document` instead of the bound element.
   */
  globalDrop?: boolean;
  /** Called with the dropped FileList. */
  onDrop: (files: FileList) => void;
}

export interface UseDragDropResult {
  isDragging: boolean;
  /** Attach to the element that should host drag listeners (when !globalDrop). */
  bind: (node: HTMLElement | null) => void;
}

/**
 * Tracks file-only drag/drop with a depth counter so dragenter/dragleave
 * on descendant elements don't flicker `isDragging`. Returns a `bind`
 * callback to attach to the host element, or listens on `document` when
 * `globalDrop` is true.
 */
export function useDragDrop({
  globalDrop,
  onDrop,
}: UseDragDropOptions): UseDragDropResult {
  const [isDragging, setIsDragging] = React.useState(false);
  const depth = React.useRef(0);
  const elementRef = React.useRef<HTMLElement | null>(null);

  const beginDrag = React.useCallback((e: DragEvent) => {
    if (!e.dataTransfer?.types?.includes("Files")) return;
    depth.current += 1;
    if (depth.current === 1) setIsDragging(true);
  }, []);

  const endDrag = React.useCallback((e: DragEvent) => {
    if (!e.dataTransfer?.types?.includes("Files")) return;
    depth.current = Math.max(0, depth.current - 1);
    if (depth.current === 0) setIsDragging(false);
  }, []);

  const reset = React.useCallback(() => {
    depth.current = 0;
    setIsDragging(false);
  }, []);

  const onDragOver = React.useCallback((e: DragEvent) => {
    if (e.dataTransfer?.types?.includes("Files")) e.preventDefault();
  }, []);

  const handleDrop = React.useCallback(
    (e: DragEvent) => {
      if (!e.dataTransfer?.types?.includes("Files")) return;
      e.preventDefault();
      // stopPropagation only matters when scoped to an element — globalDrop
      // listens on document where stopPropagation is a no-op.
      if (!globalDrop) e.stopPropagation();
      reset();
      if (e.dataTransfer.files.length > 0) onDrop(e.dataTransfer.files);
    },
    [globalDrop, onDrop, reset],
  );

  // Attach to the bound element OR to document based on globalDrop.
  React.useEffect(() => {
    const target: EventTarget | null = globalDrop
      ? document
      : elementRef.current;
    if (!target) return;

    target.addEventListener("dragenter", beginDrag as EventListener);
    target.addEventListener("dragleave", endDrag as EventListener);
    target.addEventListener("dragover", onDragOver as EventListener);
    target.addEventListener("drop", handleDrop as EventListener);
    return () => {
      target.removeEventListener("dragenter", beginDrag as EventListener);
      target.removeEventListener("dragleave", endDrag as EventListener);
      target.removeEventListener("dragover", onDragOver as EventListener);
      target.removeEventListener("drop", handleDrop as EventListener);
      reset();
    };
  }, [globalDrop, beginDrag, endDrag, onDragOver, handleDrop, reset]);

  const bind = React.useCallback((node: HTMLElement | null) => {
    elementRef.current = node;
  }, []);

  return { isDragging, bind };
}
```

- [ ] **Step 2: Replace the drag-drop block in `root.tsx`**

In `src/prompt-input/root.tsx`:

1. Add import after `useAttachments`:
   ```tsx
   import { useDragDrop } from "../lib/use-drag-drop";
   ```

2. Delete: `isDragging` state, `dragDepth` ref, `beginDrag`, `endDrag`, `resetDrag`, and the two `useEffect` blocks (form and document) that wire dragenter/leave/over/drop. (These are the two ~25-line `useEffect` calls starting near `// Drag/drop on form (unless globalDrop)`.)

3. Replace with a single call after the `useAttachments` call:
   ```tsx
   const { isDragging, bind: bindDragDrop } = useDragDrop({
     globalDrop,
     onDrop: addFiles,
   });
   ```

4. Update the form's `ref` to merge `formRef`, `ref` (forwarded), AND `bindDragDrop`:
   ```tsx
   <form
     ref={useMergedRef(formRef, ref, bindDragDrop)}
   ```

   (`useMergedRef` already accepts any number of refs and tolerates the callback shape.)

- [ ] **Step 3: Verify**

Run:
```bash
pnpm type-check && pnpm test
```

Expected: all tests pass. Drag/drop tests (if any in the suite) continue to work. If there is no explicit drag/drop test, this refactor is exercised manually in Task 9 Step 5; do not add a new test in this task (the behaviour is unchanged).

- [ ] **Step 4: Commit**

```bash
git add src/lib/use-drag-drop.ts src/prompt-input/root.tsx
git commit -m "refactor(prompt-input): extract useDragDrop hook from Root"
```

---

## Task 13: Add `displayName` to all public primitives

**Files:**
- Modify: every public-facing component file

- [ ] **Step 1: Audit which files are missing `displayName`**

Run:
```bash
grep -L "displayName" src/prompt-input/*.tsx src/parts/*.tsx
```

Expected: list of files without `displayName`. Some (Button, Submit, ActionMenuItem, CommandMenu.Item) were already updated in earlier tasks — those will be absent from the output.

- [ ] **Step 2: Add `displayName` to each remaining component**

For every file printed by the audit, append `<ComponentName>.displayName = "<DotName>"` at the end of the file. The dot name should match what the consumer sees on the namespace export. Examples:

```tsx
// src/prompt-input/root.tsx
PromptInputRoot.displayName = "PromptInput.Root";

// src/prompt-input/body.tsx
PromptInputBody.displayName = "PromptInput.Body";

// src/prompt-input/textarea.tsx
PromptInputTextarea.displayName = "PromptInput.Textarea";

// src/prompt-input/footer.tsx (three components)
PromptInputHeader.displayName = "PromptInput.Header";
PromptInputFooter.displayName = "PromptInput.Footer";
PromptInputTools.displayName = "PromptInput.Tools";

// src/prompt-input/action-menu.tsx
PromptInputActionMenu.displayName = "PromptInput.ActionMenu";
PromptInputActionMenuTrigger.displayName = "PromptInput.ActionMenuTrigger";
PromptInputActionMenuContent.displayName = "PromptInput.ActionMenuContent";

// src/prompt-input/add-attachments.tsx
PromptInputAddAttachments.displayName = "PromptInput.AddAttachments";

// src/prompt-input/attachments.tsx
PromptInputAttachments.displayName = "PromptInput.Attachments";

// src/prompt-input/model-select.tsx
PromptInputModelSelect.displayName = "PromptInput.ModelSelect";
PromptInputModelSelectTrigger.displayName = "PromptInput.ModelSelectTrigger";
PromptInputModelSelectContent.displayName = "PromptInput.ModelSelectContent";
PromptInputModelSelectItem.displayName = "PromptInput.ModelSelectItem";

// src/parts/root.tsx
CommandMenuRoot.displayName = "CommandMenu.Root";

// src/parts/input.tsx
CommandMenuInput.displayName = "CommandMenu.Input";

// src/parts/list.tsx
CommandMenuList.displayName = "CommandMenu.List";

// src/parts/page.tsx
CommandMenuPage.displayName = "CommandMenu.Page";

// src/parts/group.tsx
CommandMenuGroup.displayName = "CommandMenu.Group";

// src/parts/empty.tsx
CommandMenuEmpty.displayName = "CommandMenu.Empty";

// src/parts/free-search.tsx
CommandMenuFreeSearch.displayName = "CommandMenu.FreeSearch";

// src/parts/footer.tsx
CommandMenuFooter.displayName = "CommandMenu.Footer";

// src/parts/kbd.tsx
CommandMenuKbd.displayName = "CommandMenu.Kbd";
```

If the audit shows a file already has `displayName`, skip that one.

- [ ] **Step 3: Verify**

Run:
```bash
pnpm type-check && pnpm test
```

Expected: tsc exits 0; all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/prompt-input src/parts
git commit -m "chore: add displayName to all public primitives"
```

---

## Task 14: Add `@example` JSDoc on top-level exports

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: Add JSDoc above the namespace exports**

In `src/index.ts`, add a JSDoc block immediately above the two main namespace re-exports (`CommandMenu` and `PromptInput`). Find:

```ts
export { CommandMenu } from "./command-menu";
```

Replace with:

```ts
/**
 * A `cmd/ctrl+K`-style command palette with drill-down pages, grouped items,
 * and free-search fallback. Built on Base UI Dialog + Combobox.
 *
 * @example
 * ```tsx
 * import { CommandMenu, useCmdkShortcut } from "@benderson-fs/react-cmdk-base";
 *
 * function Palette() {
 *   const [open, setOpen] = React.useState(false);
 *   useCmdkShortcut(setOpen);
 *   return (
 *     <CommandMenu.Root open={open} onOpenChange={setOpen}>
 *       <CommandMenu.Input placeholder="Type…" />
 *       <CommandMenu.List>
 *         <CommandMenu.Page id="root">
 *           <CommandMenu.Item value="home" onSelect={() => {}}>Home</CommandMenu.Item>
 *         </CommandMenu.Page>
 *       </CommandMenu.List>
 *     </CommandMenu.Root>
 *   );
 * }
 * ```
 */
export { CommandMenu } from "./command-menu";
```

Find the `PromptInput` export:

```ts
export { PromptInput } from "./prompt-input";
```

Replace with:

```ts
/**
 * AI-Elements-style prompt composer with auto-grow textarea, attachments
 * (file picker + drag/drop + paste), toolbar buttons, action menus, model
 * selector, and status-aware submit/stop.
 *
 * @example
 * ```tsx
 * import { PromptInput, type PromptInputMessage } from "@benderson-fs/react-cmdk-base";
 *
 * function Composer() {
 *   const handleSubmit = async (msg: PromptInputMessage) => {
 *     await fetch("/api/chat", { method: "POST", body: JSON.stringify(msg) });
 *   };
 *   return (
 *     <PromptInput.Root onSubmit={handleSubmit} multiple>
 *       <PromptInput.Attachments />
 *       <PromptInput.Body>
 *         <PromptInput.Textarea placeholder="Ask anything…" />
 *       </PromptInput.Body>
 *       <PromptInput.Footer>
 *         <PromptInput.Tools />
 *         <PromptInput.Submit />
 *       </PromptInput.Footer>
 *     </PromptInput.Root>
 *   );
 * }
 * ```
 */
export { PromptInput } from "./prompt-input";
```

- [ ] **Step 2: Verify build**

Run:
```bash
pnpm type-check && pnpm build
```

Expected: tsc exits 0; build emits `dist/index.d.ts` containing the JSDoc.

Inspect:
```bash
grep -A 2 "AI-Elements-style" dist/index.d.ts
```

Expected: the JSDoc made it into the declaration file.

- [ ] **Step 3: Commit**

```bash
git add src/index.ts
git commit -m "docs(types): add @example JSDoc to CommandMenu and PromptInput exports"
```

---

## Task 15: Final integration check + version bump

**Files:**
- Modify: `package.json`, `CHANGELOG.md` (create if missing)

- [ ] **Step 1: Run the complete release-gate sequence**

Run:
```bash
pnpm type-check && pnpm test && pnpm build && pnpm publish --dry-run
```

Expected:
- tsc exits 0.
- vitest reports all tests pass — count should be ≥ 20 (original 11 + 3 isDev + 2 useMergedRef + 6 slot + 1 Button asChild + 2 Submit + 1 keepOpen + 1 Item asChild = 27 minimum, depending on how many existed at baseline).
- `tsup` + tailwind emit no errors.
- `pnpm publish --dry-run` lists files going up: `dist/index.js`, `dist/index.d.ts`, `dist/styles.css`, `README.md`, `LICENSE`, `package.json`. Tarball size should be roughly 50–70 kB.

If any of these fail, fix the failure before continuing. Do not bypass.

- [ ] **Step 2: Bump version**

Edit `package.json`. Change:

```json
  "version": "0.1.0",
```

to:

```json
  "version": "0.2.0",
```

(Minor bump — all changes are additive: new opt-in `asChild`, new CSS variables, new helpers, no removed exports.)

- [ ] **Step 3: Add CHANGELOG entry**

Create or update `CHANGELOG.md`. Prepend:

```markdown
# Changelog

## 0.2.0 — 2026-05-20

### Added
- `asChild` prop on `CommandMenu.Item`, `PromptInput.Button`, and
  `PromptInput.Submit` for design-system composition without wrapper elements.
- `PromptInput.ActionMenuItem` now accepts `keepOpen` to prevent the menu
  closing after selection.
- CSS-variable theme tokens: `--pi-bg`, `--pi-border`, `--pi-text`,
  `--pi-accent`, `--pi-radius` and friends; mirrored as `--cmdk-*` for the
  command menu popup. See README "Theming".
- `@example` JSDoc on `CommandMenu` and `PromptInput` exports.
- `displayName` on every public primitive for better DevTools output.

### Changed
- `PromptInput.Submit` now defaults its `status` from the Root context;
  passing the prop is only needed to override. Existing consumers that pass
  `status` keep working unchanged.

### Internal
- `Root` extracted `useAttachments` and `useDragDrop` hooks; `useMergedRef`
  helper introduced; `isDev()` replaces the inline NODE_ENV guard.

## 0.1.0

Initial release.
```

- [ ] **Step 4: Verify the changelog**

Run:
```bash
head -20 CHANGELOG.md
```

Expected: the new 0.2.0 block is at the top.

- [ ] **Step 5: Commit**

```bash
git add package.json CHANGELOG.md
git commit -m "chore: release 0.2.0 — asChild, theme tokens, displayName"
```

- [ ] **Step 6: Tag (do not push yet — user decides when to publish)**

Run:
```bash
git tag -a v0.2.0 -m "v0.2.0"
git log --oneline -15
```

Expected: 14 new commits (one per task except Task 1) above the prior `main`, plus the tag pointing at the release commit.

The branch is ready to merge. Pushing the tag and running `pnpm publish` are user decisions, not automated steps in this plan.

---

## Self-Review Notes (for the executing agent)

- **Coverage:** Each of the seven review findings maps to at least one task. Cross-check: `asChild` → Tasks 4, 5, 6, 8. `keepOpen` on ActionMenuItem → Task 7. `Submit.status` defaulting → Task 6. `useMergedRef` for ref forwarding → Task 3. `isDev()` helper → Task 2. CSS-variable theme layer → Task 9. `displayName` + JSDoc → Tasks 13, 14. Hook extractions (root.tsx size) → Tasks 11, 12.
- **Ordering rationale:** `Slot` (Task 4) is built before any `asChild` consumer. `useMergedRef` (Task 3) lands before `useDragDrop` (Task 12) because the latter needs to merge into the existing form ref.
- **No breaking changes:** every prop added is optional. `Submit.status` going from "required when passed by Root consumer" to "inherited from Root" is strictly looser. Existing code that passes the prop continues to work.
- **Tests at each step:** every task that changes behaviour has a failing-test step before the implementation step. Tasks 11, 12, 13, 14 are pure refactors that rely on the suite-wide check (`pnpm test`).
