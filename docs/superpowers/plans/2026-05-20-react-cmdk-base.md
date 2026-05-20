# react-cmdk-base Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild react-cmdk on Base UI's Combobox + Dialog (clean break, new package name `react-cmdk-base`) and demo it in the Next.js prototype at `app/`.

**Architecture:** A `<CommandMenu>` namespace where `Root` is a Base UI `Dialog.Popup` containing a single `Combobox.Root` in `inline` mode. Sub-parts (`Input`, `List`, `Group`, `Item`, `Empty`, `Page`, `FreeSearch`, `Footer`, `Kbd`) are thin styled wrappers over Combobox parts. Pages mount/unmount children based on a controlled `page` prop and push a `searchPrefix` breadcrumb via context.

**Tech Stack:** React 19, `@base-ui/react ^1.5`, TypeScript 5, Tailwind v4, Next.js 16, Vitest (lib tests), pnpm.

---

## File structure

```
react-cmdk/
├── package.json                          # rename → react-cmdk-base, deps cleanup
├── tsconfig.json                         # update for new src layout
├── vitest.config.ts                      # NEW — lib test runner
├── tsup.config.ts                        # NEW — bundler for lib (replaces babel build)
├── src/
│   ├── index.ts                          # NEW — public exports
│   ├── command-menu.tsx                  # NEW — CommandMenu namespace
│   ├── parts/
│   │   ├── root.tsx                      # NEW
│   │   ├── input.tsx                     # NEW
│   │   ├── list.tsx                      # NEW
│   │   ├── page.tsx                      # NEW
│   │   ├── group.tsx                     # NEW
│   │   ├── item.tsx                      # NEW
│   │   ├── empty.tsx                     # NEW
│   │   ├── free-search.tsx               # NEW
│   │   ├── footer.tsx                    # NEW
│   │   └── kbd.tsx                       # NEW
│   ├── hooks/
│   │   ├── use-command-menu.ts           # NEW
│   │   └── use-cmdk-shortcut.ts          # NEW
│   ├── lib/
│   │   ├── context.ts                    # NEW
│   │   └── cn.ts                         # NEW
│   └── styles.css                        # NEW — Tailwind v4 source
├── tests/
│   ├── setup.ts                          # NEW — RTL + jsdom setup
│   ├── filter.test.tsx                   # NEW
│   ├── navigation.test.tsx               # NEW
│   ├── pages.test.tsx                    # NEW
│   └── shortcut.test.tsx                 # NEW
└── app/
    ├── package.json                      # add lucide-react, link library
    └── app/
        ├── page.tsx                      # rewrite as prototype demo
        ├── layout.tsx                    # minor: drop the html background classes that fight the demo
        └── globals.css                   # import library styles
```

**Files removed wholesale:** `src/components/*` (CommandPalette, Page, List, ListItem, Search, FreeSearchAction, Icon), `src/lib/{context.ts,utils.tsx}`, `src/types.ts`, `stories/`, `.storybook/`, `tailwind.config.js`, `tailwind.css`, `postcss.config.js`, root `package-lock.json` (pnpm-only now).

---

## Task 1: Strip legacy and reshape package

**Files:**
- Delete: `src/components/`, `src/lib/`, `src/types.ts`, `src/index.ts`, `stories/`, `.storybook/`, `tailwind.config.js`, `tailwind.css`, `postcss.config.js`, `package-lock.json`
- Modify: `package.json` (rename, new deps), `tsconfig.json`, `.gitignore`

- [ ] **Step 1: Delete legacy source**

```bash
rm -rf src/components src/lib src/types.ts src/index.ts stories .storybook \
       tailwind.config.js tailwind.css postcss.config.js package-lock.json
```

- [ ] **Step 2: Replace `package.json`**

```json
{
  "name": "react-cmdk-base",
  "version": "0.1.0",
  "description": "A fast, accessible React command palette built on Base UI",
  "homepage": "https://github.com/albingroen/react-cmdk",
  "license": "MIT",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./styles.css": "./dist/styles.css"
  },
  "files": ["dist", "README.md", "LICENSE"],
  "scripts": {
    "build": "pnpm build:js && pnpm build:css",
    "build:js": "tsup",
    "build:css": "tailwindcss -i src/styles.css -o dist/styles.css --minify",
    "test": "vitest run",
    "test:watch": "vitest",
    "type-check": "tsc --noEmit"
  },
  "peerDependencies": {
    "@base-ui/react": "^1.5.0",
    "react": "^18 || ^19",
    "react-dom": "^18 || ^19"
  },
  "devDependencies": {
    "@base-ui/react": "^1.5.0",
    "@tailwindcss/cli": "^4.0.0",
    "@testing-library/jest-dom": "^6.5.0",
    "@testing-library/react": "^16.0.1",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "jsdom": "^25.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwindcss": "^4.0.0",
    "tsup": "^8.3.0",
    "typescript": "^5.6.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 3: Replace `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["dist", "node_modules", "tests", "app"]
}
```

- [ ] **Step 4: Update `.gitignore`**

```
*.log
.DS_Store
node_modules
.cache
build
dist
coverage
```

- [ ] **Step 5: Install**

Run: `pnpm install`
Expected: succeeds; `pnpm-lock.yaml` updates.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: reset package to react-cmdk-base scaffolding"
```

---

## Task 2: Add bundler + Vitest config

**Files:**
- Create: `tsup.config.ts`, `vitest.config.ts`, `tests/setup.ts`

- [ ] **Step 1: Create `tsup.config.ts`**

```ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom", "@base-ui/react"],
  target: "es2020",
});
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    globals: true,
    css: false,
  },
  esbuild: { jsx: "automatic" },
});
```

- [ ] **Step 3: Create `tests/setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => cleanup());
```

- [ ] **Step 4: Commit**

```bash
git add tsup.config.ts vitest.config.ts tests/setup.ts
git commit -m "chore: add tsup and vitest config"
```

---

## Task 3: Helpers (`cn`, context, hooks)

**Files:**
- Create: `src/lib/cn.ts`, `src/lib/context.ts`, `src/hooks/use-cmdk-shortcut.ts`, `src/hooks/use-command-menu.ts`

- [ ] **Step 1: Create `src/lib/cn.ts`**

```ts
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}
```

- [ ] **Step 2: Create `src/lib/context.ts`**

```ts
import { createContext } from "react";

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

export interface RegisteredItem {
  onSelect?: (value: string) => void;
  keepOpen?: boolean;
}

export const CommandMenuContext = createContext<CommandMenuContextValue | null>(
  null
);
```

- [ ] **Step 3: Create `src/hooks/use-cmdk-shortcut.ts`**

```ts
import { useEffect } from "react";

export function useCmdkShortcut(
  setOpen: (updater: (current: boolean) => boolean) => void
): void {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const isMac =
        typeof navigator !== "undefined" &&
        navigator.platform.toLowerCase().includes("mac");
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        e.stopPropagation();
        setOpen((c) => !c);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [setOpen]);
}
```

- [ ] **Step 4: Create `src/hooks/use-command-menu.ts`**

```ts
import { useContext } from "react";
import { CommandMenuContext } from "../lib/context";

export function useCommandMenu() {
  const ctx = useContext(CommandMenuContext);
  if (!ctx) {
    throw new Error(
      "useCommandMenu must be used inside <CommandMenu.Root>"
    );
  }
  return ctx;
}
```

- [ ] **Step 5: Commit**

```bash
git add src/lib src/hooks
git commit -m "feat: add cn, context, and hooks"
```

---

## Task 4: Tailwind source styles

**Files:**
- Create: `src/styles.css`

- [ ] **Step 1: Create `src/styles.css`**

```css
@import "tailwindcss";

@layer components {
  .cmdk-backdrop {
    @apply fixed inset-0 z-50 bg-black/60 backdrop-blur-sm;
    @apply transition-opacity duration-150 ease-out;
  }
  .cmdk-backdrop[data-starting-style],
  .cmdk-backdrop[data-ending-style] {
    @apply opacity-0;
  }

  .cmdk-popup {
    @apply fixed left-1/2 top-[20%] z-50 w-[640px] max-w-[calc(100vw-2rem)];
    @apply -translate-x-1/2 overflow-hidden rounded-xl;
    @apply bg-white shadow-2xl ring-1 ring-black/10;
    @apply dark:bg-zinc-900 dark:ring-white/10;
    @apply flex flex-col max-h-[min(560px,80vh)];
    @apply transition-[opacity,transform] duration-150 ease-out;
  }
  .cmdk-popup[data-starting-style],
  .cmdk-popup[data-ending-style] {
    @apply opacity-0 -translate-x-1/2 translate-y-1;
  }

  .cmdk-input-row {
    @apply flex items-center gap-2 border-b border-zinc-200 px-3.5 py-3;
    @apply dark:border-zinc-800;
  }
  .cmdk-input-row svg.cmdk-search-icon {
    @apply size-4 shrink-0 text-zinc-400;
  }
  .cmdk-prefix-chip {
    @apply rounded bg-zinc-100 px-2 py-0.5 text-sm font-medium;
    @apply text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200;
  }
  .cmdk-input {
    @apply flex-1 bg-transparent text-[15px] text-zinc-900 outline-none;
    @apply placeholder:text-zinc-400 dark:text-zinc-100;
  }

  .cmdk-list {
    @apply flex-1 overflow-y-auto p-2 space-y-2;
    @apply focus:outline-none;
  }

  .cmdk-group {
    @apply space-y-1;
  }
  .cmdk-group-label {
    @apply px-2 pt-1 text-xs font-medium uppercase tracking-wide;
    @apply text-zinc-500 dark:text-zinc-400;
  }

  .cmdk-item {
    @apply flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left;
    @apply text-[14px] text-zinc-800 outline-none dark:text-zinc-100;
    @apply cursor-pointer select-none;
  }
  .cmdk-item[data-highlighted] {
    @apply bg-zinc-100 dark:bg-zinc-800;
  }
  .cmdk-item[data-disabled] {
    @apply pointer-events-none opacity-50;
  }
  .cmdk-item-icon {
    @apply size-4 shrink-0 text-zinc-500 dark:text-zinc-400;
  }
  .cmdk-item-label {
    @apply flex-1 truncate;
  }
  .cmdk-item-trail {
    @apply text-xs text-zinc-400;
  }

  .cmdk-empty {
    @apply px-3 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400;
  }

  .cmdk-footer {
    @apply flex items-center justify-between gap-2 border-t border-zinc-200;
    @apply px-3 py-2 text-xs text-zinc-500;
    @apply dark:border-zinc-800 dark:text-zinc-400;
  }

  .cmdk-kbd {
    @apply inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded;
    @apply border border-zinc-200 bg-zinc-50 px-1 font-mono text-[10px];
    @apply text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300;
  }

  .cmdk-sr-only {
    @apply absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0;
    clip: rect(0 0 0 0);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles.css
git commit -m "feat: add tailwind v4 source styles"
```

---

## Task 5: `<CommandMenu.Root>` — Dialog + Combobox wiring

**Files:**
- Create: `src/parts/root.tsx`

- [ ] **Step 1: Create `src/parts/root.tsx`**

```tsx
import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Combobox } from "@base-ui/react/combobox";
import {
  CommandMenuContext,
  type RegisteredItem,
} from "../lib/context";

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

export function CommandMenuRoot({
  open,
  onOpenChange,
  page: pageProp,
  onPageChange,
  placeholder: _placeholder,
  label = "Command menu",
  loop = true,
  children,
}: CommandMenuRootProps) {
  const [internalPage, setInternalPage] = React.useState("root");
  const page = pageProp ?? internalPage;
  const pageStack = React.useRef<string[]>([]);

  const setPage = React.useCallback(
    (id: string) => {
      pageStack.current.push(page);
      if (onPageChange) onPageChange(id);
      else setInternalPage(id);
      setQuery("");
    },
    [page, onPageChange]
  );

  const popPage = React.useCallback(() => {
    const prev = pageStack.current.pop();
    const target = prev ?? "root";
    if (onPageChange) onPageChange(target);
    else setInternalPage(target);
    setQuery("");
  }, [onPageChange]);

  const [query, setQuery] = React.useState("");
  const [searchPrefix, setSearchPrefix] = React.useState<string[]>([]);

  const itemsRef = React.useRef(new Map<string, RegisteredItem>());

  const registerItem = React.useCallback(
    (value: string, item: RegisteredItem) => {
      itemsRef.current.set(value, item);
      return () => {
        itemsRef.current.delete(value);
      };
    },
    []
  );

  const close = React.useCallback(() => onOpenChange(false), [onOpenChange]);

  const fireSelect = React.useCallback(
    (value: string) => {
      const item = itemsRef.current.get(value);
      item?.onSelect?.(value);
      if (!item?.keepOpen) close();
    },
    [close]
  );

  // Reset query + highlight whenever page changes.
  React.useEffect(() => {
    setQuery("");
  }, [page]);

  const ctxValue = React.useMemo(
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
    ]
  );

  return (
    <CommandMenuContext.Provider value={ctxValue}>
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Backdrop className="cmdk-backdrop" />
          <Dialog.Popup className="cmdk-popup" aria-label={label}>
            <Dialog.Title className="cmdk-sr-only">{label}</Dialog.Title>
            <Combobox.Root
              inline
              selectionMode="none"
              autoHighlight="always"
              openOnInputClick={false}
              loopFocus={loop}
              open
              inputValue={query}
              onInputValueChange={(v) => setQuery(v)}
              onValueChange={(value) => {
                if (typeof value === "string") fireSelect(value);
              }}
            >
              {children}
            </Combobox.Root>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </CommandMenuContext.Provider>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/parts/root.tsx
git commit -m "feat: add CommandMenu.Root wrapping Dialog + Combobox"
```

---

## Task 6: Input, List, Page, Group, Empty, Footer, Kbd

**Files:**
- Create: `src/parts/input.tsx`, `src/parts/list.tsx`, `src/parts/page.tsx`, `src/parts/group.tsx`, `src/parts/empty.tsx`, `src/parts/footer.tsx`, `src/parts/kbd.tsx`

- [ ] **Step 1: Create `src/parts/input.tsx`**

```tsx
import * as React from "react";
import { Combobox } from "@base-ui/react/combobox";
import { useCommandMenu } from "../hooks/use-command-menu";
import { cn } from "../lib/cn";

export interface CommandMenuInputProps {
  placeholder?: string;
  className?: string;
}

export function CommandMenuInput({
  placeholder = "Search…",
  className,
}: CommandMenuInputProps) {
  const { searchPrefix, popPage, query } = useCommandMenu();

  return (
    <div className={cn("cmdk-input-row", className)}>
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="cmdk-search-icon"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" strokeLinecap="round" />
      </svg>
      {searchPrefix.map((p) => (
        <span key={p} className="cmdk-prefix-chip">
          {p}
        </span>
      ))}
      <Combobox.Input
        placeholder={placeholder}
        className="cmdk-input"
        onKeyDown={(e) => {
          if (e.key === "Backspace" && query === "" && searchPrefix.length > 0) {
            e.preventDefault();
            popPage();
          }
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Create `src/parts/list.tsx`**

```tsx
import * as React from "react";
import { Combobox } from "@base-ui/react/combobox";
import { cn } from "../lib/cn";

export interface CommandMenuListProps {
  className?: string;
  children: React.ReactNode;
}

export function CommandMenuList({ className, children }: CommandMenuListProps) {
  return (
    <Combobox.List className={cn("cmdk-list", className)}>
      {children}
    </Combobox.List>
  );
}
```

- [ ] **Step 3: Create `src/parts/page.tsx`**

```tsx
import * as React from "react";
import { useCommandMenu } from "../hooks/use-command-menu";

export interface CommandMenuPageProps {
  id: string;
  searchPrefix?: string[];
  children: React.ReactNode;
}

export function CommandMenuPage({
  id,
  searchPrefix,
  children,
}: CommandMenuPageProps) {
  const { page, setSearchPrefix } = useCommandMenu();
  const active = page === id;

  React.useEffect(() => {
    if (active) setSearchPrefix(searchPrefix ?? []);
  }, [active, searchPrefix, setSearchPrefix]);

  return active ? <>{children}</> : null;
}
```

- [ ] **Step 4: Create `src/parts/group.tsx`**

```tsx
import * as React from "react";
import { cn } from "../lib/cn";

export interface CommandMenuGroupProps {
  heading?: string;
  className?: string;
  children: React.ReactNode;
}

export function CommandMenuGroup({
  heading,
  className,
  children,
}: CommandMenuGroupProps) {
  return (
    <div className={cn("cmdk-group", className)}>
      {heading ? <div className="cmdk-group-label">{heading}</div> : null}
      {children}
    </div>
  );
}
```

- [ ] **Step 5: Create `src/parts/empty.tsx`**

```tsx
import * as React from "react";
import { Combobox } from "@base-ui/react/combobox";
import { cn } from "../lib/cn";

export interface CommandMenuEmptyProps {
  className?: string;
  children?: React.ReactNode;
}

export function CommandMenuEmpty({ className, children }: CommandMenuEmptyProps) {
  return (
    <Combobox.Empty className={cn("cmdk-empty", className)}>
      {children ?? "No results"}
    </Combobox.Empty>
  );
}
```

- [ ] **Step 6: Create `src/parts/footer.tsx`**

```tsx
import * as React from "react";
import { cn } from "../lib/cn";

export interface CommandMenuFooterProps {
  className?: string;
  children: React.ReactNode;
}

export function CommandMenuFooter({ className, children }: CommandMenuFooterProps) {
  return <div className={cn("cmdk-footer", className)}>{children}</div>;
}
```

- [ ] **Step 7: Create `src/parts/kbd.tsx`**

```tsx
import * as React from "react";
import { cn } from "../lib/cn";

export interface CommandMenuKbdProps {
  className?: string;
  children: React.ReactNode;
}

export function CommandMenuKbd({ className, children }: CommandMenuKbdProps) {
  return <kbd className={cn("cmdk-kbd", className)}>{children}</kbd>;
}
```

- [ ] **Step 8: Commit**

```bash
git add src/parts
git commit -m "feat: add Input, List, Page, Group, Empty, Footer, Kbd parts"
```

---

## Task 7: `<CommandMenu.Item>` + `<CommandMenu.FreeSearch>`

**Files:**
- Create: `src/parts/item.tsx`, `src/parts/free-search.tsx`

- [ ] **Step 1: Create `src/parts/item.tsx`**

```tsx
import * as React from "react";
import { Combobox } from "@base-ui/react/combobox";
import { useCommandMenu } from "../hooks/use-command-menu";
import { cn } from "../lib/cn";

export interface CommandMenuItemProps {
  value: string;
  keywords?: string[];
  keepOpen?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  onSelect?: (value: string) => void;
  className?: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
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
  children,
}: CommandMenuItemProps) {
  const { registerItem } = useCommandMenu();

  React.useEffect(() => {
    return registerItem(value, { onSelect, keepOpen });
  }, [registerItem, value, onSelect, keepOpen]);

  const label = typeof children === "string" ? children : value;
  const searchableText = [label, ...(keywords ?? [])].join(" ");

  return (
    <Combobox.Item
      value={value}
      keywords={keywords}
      disabled={disabled}
      aria-label={label}
      data-searchable={searchableText}
      className={cn("cmdk-item", className)}
    >
      {Icon ? <Icon className="cmdk-item-icon" /> : null}
      <span className="cmdk-item-label">{children}</span>
      {trailing ? <span className="cmdk-item-trail">{trailing}</span> : null}
    </Combobox.Item>
  );
}
```

- [ ] **Step 2: Create `src/parts/free-search.tsx`**

```tsx
import * as React from "react";
import { CommandMenuItem } from "./item";
import { useCommandMenu } from "../hooks/use-command-menu";

export interface CommandMenuFreeSearchProps {
  label?: string;
  onSelect?: (query: string) => void;
}

export function CommandMenuFreeSearch({
  label = "Search for",
  onSelect,
}: CommandMenuFreeSearchProps) {
  const { query } = useCommandMenu();

  return (
    <CommandMenuItem
      value="__cmdk_free_search__"
      keywords={["*"]}
      onSelect={() => onSelect?.(query)}
    >
      {label} <span className="font-semibold">&quot;{query}&quot;</span>
    </CommandMenuItem>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/parts/item.tsx src/parts/free-search.tsx
git commit -m "feat: add Item and FreeSearch parts"
```

---

## Task 8: Public exports + `CommandMenu` namespace

**Files:**
- Create: `src/command-menu.tsx`, `src/index.ts`

- [ ] **Step 1: Create `src/command-menu.tsx`**

```tsx
import { CommandMenuRoot } from "./parts/root";
import { CommandMenuInput } from "./parts/input";
import { CommandMenuList } from "./parts/list";
import { CommandMenuPage } from "./parts/page";
import { CommandMenuGroup } from "./parts/group";
import { CommandMenuItem } from "./parts/item";
import { CommandMenuEmpty } from "./parts/empty";
import { CommandMenuFreeSearch } from "./parts/free-search";
import { CommandMenuFooter } from "./parts/footer";
import { CommandMenuKbd } from "./parts/kbd";

export const CommandMenu = {
  Root: CommandMenuRoot,
  Input: CommandMenuInput,
  List: CommandMenuList,
  Page: CommandMenuPage,
  Group: CommandMenuGroup,
  Item: CommandMenuItem,
  Empty: CommandMenuEmpty,
  FreeSearch: CommandMenuFreeSearch,
  Footer: CommandMenuFooter,
  Kbd: CommandMenuKbd,
};
```

- [ ] **Step 2: Create `src/index.ts`**

```ts
export { CommandMenu } from "./command-menu";
export { CommandMenuRoot } from "./parts/root";
export { CommandMenuInput } from "./parts/input";
export { CommandMenuList } from "./parts/list";
export { CommandMenuPage } from "./parts/page";
export { CommandMenuGroup } from "./parts/group";
export { CommandMenuItem } from "./parts/item";
export { CommandMenuEmpty } from "./parts/empty";
export { CommandMenuFreeSearch } from "./parts/free-search";
export { CommandMenuFooter } from "./parts/footer";
export { CommandMenuKbd } from "./parts/kbd";

export type { CommandMenuRootProps } from "./parts/root";
export type { CommandMenuInputProps } from "./parts/input";
export type { CommandMenuListProps } from "./parts/list";
export type { CommandMenuPageProps } from "./parts/page";
export type { CommandMenuGroupProps } from "./parts/group";
export type { CommandMenuItemProps } from "./parts/item";
export type { CommandMenuEmptyProps } from "./parts/empty";
export type { CommandMenuFreeSearchProps } from "./parts/free-search";
export type { CommandMenuFooterProps } from "./parts/footer";
export type { CommandMenuKbdProps } from "./parts/kbd";

export { useCommandMenu } from "./hooks/use-command-menu";
export { useCmdkShortcut } from "./hooks/use-cmdk-shortcut";
```

- [ ] **Step 3: Type-check the library**

Run: `pnpm type-check`
Expected: PASS (no errors).

- [ ] **Step 4: Build the library**

Run: `pnpm build`
Expected: writes `dist/index.js`, `dist/index.d.ts`, `dist/styles.css`.

- [ ] **Step 5: Commit**

```bash
git add src/command-menu.tsx src/index.ts
git commit -m "feat: expose CommandMenu namespace and public exports"
```

---

## Task 9: Wire `app/` to consume the library

**Files:**
- Modify: `app/package.json`, `app/app/globals.css`, `app/app/layout.tsx`

- [ ] **Step 1: Update `app/package.json` dependencies**

Replace `dependencies` with:

```json
{
  "@base-ui/react": "^1.5.0",
  "lucide-react": "^0.460.0",
  "next": "16.2.6",
  "react": "19.2.4",
  "react-dom": "19.2.4",
  "react-cmdk-base": "file:.."
}
```

- [ ] **Step 2: Install in `app/`**

Run: `cd app && pnpm install`
Expected: succeeds; `react-cmdk-base` linked from parent dir.

- [ ] **Step 3: Update `app/app/globals.css`**

Replace contents with:

```css
@import "tailwindcss";
@import "react-cmdk-base/styles.css";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

html, body {
  background: var(--background);
  color: var(--foreground);
}
```

- [ ] **Step 4: Update `app/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "react-cmdk-base prototype",
  description: "Demo of the rebuilt command palette",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add app/package.json app/pnpm-lock.yaml app/app/globals.css app/app/layout.tsx
git commit -m "feat(app): wire prototype to consume react-cmdk-base"
```

---

## Task 10: Prototype demo page

**Files:**
- Modify: `app/app/page.tsx`

- [ ] **Step 1: Replace `app/app/page.tsx`**

```tsx
"use client";

import * as React from "react";
import {
  Cog,
  Code2,
  House,
  LifeBuoy,
  Layers,
  LogOut,
  Plus,
} from "lucide-react";
import { CommandMenu, useCmdkShortcut } from "react-cmdk-base";

const PROJECTS = [
  { id: "northwind", name: "Northwind ledger" },
  { id: "atlas", name: "Atlas pipeline" },
  { id: "polaris", name: "Polaris analytics" },
  { id: "helio", name: "Helio web" },
  { id: "kepler", name: "Kepler infra" },
];

export default function Home() {
  const [open, setOpen] = React.useState(false);
  const [page, setPage] = React.useState("root");
  useCmdkShortcut(setOpen);

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex max-w-md flex-col items-center gap-6 py-32 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          react-cmdk-base prototype
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          A clean-break rebuild of <code className="font-mono">react-cmdk</code> on Base UI primitives.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          Open command menu
          <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
            <CommandMenu.Kbd>⌘</CommandMenu.Kbd>
            <CommandMenu.Kbd>K</CommandMenu.Kbd>
          </span>
        </button>
      </main>

      <CommandMenu.Root
        open={open}
        onOpenChange={setOpen}
        page={page}
        onPageChange={setPage}
      >
        <CommandMenu.Input placeholder="Type a command or search…" />
        <CommandMenu.List>
          <CommandMenu.Page id="root">
            <CommandMenu.Group heading="Home">
              <CommandMenu.Item
                value="home"
                icon={House}
                onSelect={() => console.log("go home")}
              >
                Home
              </CommandMenu.Item>
              <CommandMenu.Item
                value="settings"
                icon={Cog}
                onSelect={() => console.log("settings")}
              >
                Settings
              </CommandMenu.Item>
              <CommandMenu.Item
                value="projects"
                icon={Layers}
                keepOpen
                onSelect={() => setPage("projects")}
                trailing="→"
              >
                Projects
              </CommandMenu.Item>
            </CommandMenu.Group>

            <CommandMenu.Group heading="Other">
              <CommandMenu.Item
                value="dev-settings"
                icon={Code2}
                onSelect={() => console.log("dev settings")}
              >
                Developer settings
              </CommandMenu.Item>
              <CommandMenu.Item
                value="privacy"
                icon={LifeBuoy}
                onSelect={() => console.log("privacy")}
              >
                Privacy policy
              </CommandMenu.Item>
              <CommandMenu.Item
                value="logout"
                icon={LogOut}
                onSelect={() => alert("Logging out…")}
              >
                Log out
              </CommandMenu.Item>
            </CommandMenu.Group>

            <CommandMenu.Empty>
              <CommandMenu.FreeSearch
                onSelect={(q) => console.log("free search:", q)}
              />
            </CommandMenu.Empty>
          </CommandMenu.Page>

          <CommandMenu.Page id="projects" searchPrefix={["Projects"]}>
            <CommandMenu.Group heading="Your projects">
              {PROJECTS.map((p) => (
                <CommandMenu.Item
                  key={p.id}
                  value={p.id}
                  icon={Layers}
                  onSelect={() => console.log("open project", p.id)}
                >
                  {p.name}
                </CommandMenu.Item>
              ))}
              <CommandMenu.Item
                value="new-project"
                icon={Plus}
                onSelect={() => console.log("new project")}
              >
                Create new project
              </CommandMenu.Item>
            </CommandMenu.Group>
            <CommandMenu.Empty>No projects match.</CommandMenu.Empty>
          </CommandMenu.Page>
        </CommandMenu.List>

        <CommandMenu.Footer>
          <span>
            <CommandMenu.Kbd>↵</CommandMenu.Kbd> select
            &nbsp;·&nbsp;
            <CommandMenu.Kbd>↑</CommandMenu.Kbd>
            <CommandMenu.Kbd>↓</CommandMenu.Kbd> navigate
            &nbsp;·&nbsp;
            <CommandMenu.Kbd>esc</CommandMenu.Kbd> close
          </span>
          <span>react-cmdk-base</span>
        </CommandMenu.Footer>
      </CommandMenu.Root>
    </div>
  );
}
```

- [ ] **Step 2: Run `next build` to verify**

Run: `cd app && pnpm build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add app/app/page.tsx
git commit -m "feat(app): build prototype demo page"
```

---

## Task 11: Smoke tests for filter + navigation + pages + shortcut

**Files:**
- Create: `tests/filter.test.tsx`, `tests/navigation.test.tsx`, `tests/pages.test.tsx`, `tests/shortcut.test.tsx`

- [ ] **Step 1: Create `tests/filter.test.tsx`**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { CommandMenu } from "../src";

function Harness() {
  const [open, setOpen] = useState(true);
  return (
    <CommandMenu.Root open={open} onOpenChange={setOpen}>
      <CommandMenu.Input />
      <CommandMenu.List>
        <CommandMenu.Page id="root">
          <CommandMenu.Item value="apple">Apple</CommandMenu.Item>
          <CommandMenu.Item value="banana">Banana</CommandMenu.Item>
          <CommandMenu.Item value="cherry">Cherry</CommandMenu.Item>
        </CommandMenu.Page>
      </CommandMenu.List>
    </CommandMenu.Root>
  );
}

describe("filter", () => {
  it("filters items by typed query", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.getByText("Banana")).toBeInTheDocument();

    await user.type(screen.getByRole("combobox"), "ban");

    expect(screen.queryByText("Apple")).toBeNull();
    expect(screen.getByText("Banana")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Create `tests/navigation.test.tsx`**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { CommandMenu } from "../src";

function Harness({ onSelect }: { onSelect: (v: string) => void }) {
  const [open, setOpen] = useState(true);
  return (
    <CommandMenu.Root open={open} onOpenChange={setOpen}>
      <CommandMenu.Input />
      <CommandMenu.List>
        <CommandMenu.Page id="root">
          <CommandMenu.Item value="one" onSelect={onSelect}>One</CommandMenu.Item>
          <CommandMenu.Item value="two" onSelect={onSelect}>Two</CommandMenu.Item>
          <CommandMenu.Item value="three" onSelect={onSelect}>Three</CommandMenu.Item>
        </CommandMenu.Page>
      </CommandMenu.List>
    </CommandMenu.Root>
  );
}

describe("navigation", () => {
  it("Enter selects the auto-highlighted first item", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Harness onSelect={onSelect} />);
    screen.getByRole("combobox").focus();
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledWith("one");
  });

  it("ArrowDown then Enter selects the second item", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Harness onSelect={onSelect} />);
    screen.getByRole("combobox").focus();
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onSelect).toHaveBeenCalledWith("two");
  });
});
```

- [ ] **Step 3: Create `tests/pages.test.tsx`**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { CommandMenu } from "../src";

function Harness() {
  const [open, setOpen] = useState(true);
  const [page, setPage] = useState("root");
  return (
    <CommandMenu.Root
      open={open}
      onOpenChange={setOpen}
      page={page}
      onPageChange={setPage}
    >
      <CommandMenu.Input />
      <CommandMenu.List>
        <CommandMenu.Page id="root">
          <CommandMenu.Item
            value="go-projects"
            keepOpen
            onSelect={() => setPage("projects")}
          >
            Projects
          </CommandMenu.Item>
        </CommandMenu.Page>
        <CommandMenu.Page id="projects" searchPrefix={["Projects"]}>
          <CommandMenu.Item value="alpha">Alpha</CommandMenu.Item>
          <CommandMenu.Item value="beta">Beta</CommandMenu.Item>
        </CommandMenu.Page>
      </CommandMenu.List>
    </CommandMenu.Root>
  );
}

describe("pages", () => {
  it("drills into a page on select with keepOpen and shows prefix", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    screen.getByRole("combobox").focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Projects")).toBeInTheDocument();
  });

  it("backspace on empty input pops back to root", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    screen.getByRole("combobox").focus();
    await user.keyboard("{Enter}");
    await screen.findByText("Alpha");
    await user.keyboard("{Backspace}");
    expect(await screen.findByText("Projects")).toBeInTheDocument();
    expect(screen.queryByText("Alpha")).toBeNull();
  });
});
```

- [ ] **Step 4: Create `tests/shortcut.test.tsx`**

```tsx
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useState } from "react";
import { useCmdkShortcut } from "../src";

describe("useCmdkShortcut", () => {
  it("toggles open on cmd/ctrl+K", () => {
    const { result } = renderHook(() => {
      const [open, setOpen] = useState(false);
      useCmdkShortcut(setOpen);
      return { open };
    });
    expect(result.current.open).toBe(false);
    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "k", ctrlKey: true, metaKey: true })
      );
    });
    expect(result.current.open).toBe(true);
  });
});
```

- [ ] **Step 5: Run tests**

Run: `pnpm test`
Expected: All tests pass. If they don't, debug the failing case (see Debugging notes below).

- [ ] **Step 6: Commit**

```bash
git add tests
git commit -m "test: add filter, navigation, pages, and shortcut tests"
```

---

## Task 12: Verify prototype runs

**Files:**
- None (verification)

- [ ] **Step 1: Build library**

Run: `pnpm build` (from repo root)
Expected: `dist/index.js` and `dist/styles.css` exist.

- [ ] **Step 2: Build app**

Run: `cd app && pnpm build`
Expected: PASS.

- [ ] **Step 3: Start dev server in background**

Run: `cd app && pnpm dev`
Expected: server listens on http://localhost:3000.

- [ ] **Step 4: Verify in browser**

Open http://localhost:3000. Confirm:
- Page shows "react-cmdk-base prototype" heading and an "Open command menu" button with ⌘K hint.
- Clicking the button opens the menu.
- ⌘K (or Ctrl+K) also opens / closes the menu.
- Typing "set" filters the list to Settings + Developer settings.
- Arrow keys move highlight; Enter triggers `onSelect` (visible in console for log items).
- Clicking "Projects" drills to the projects page with a "Projects" breadcrumb chip; Backspace pops back.
- When all root items are filtered out (e.g. type "xyz"), the FreeSearch action appears with the query.

- [ ] **Step 5: Final commit (if anything changed)**

```bash
git add -A
git commit --allow-empty -m "chore: prototype verified end-to-end"
```

---

## Debugging notes

- **`Combobox.Item` does not auto-filter by children**: if filter tests fail with all items still visible after typing, pass an explicit `filter` prop to `Combobox.Root` in `root.tsx` using `Combobox.useFilter().contains(label, query) || matchesKeywords(...)`. The label can be derived from each `<Item>`'s `children` via a `data-label` attribute. Or switch Item to use `value={{value, label}}` object form and add `itemToStringLabel`.
- **`Combobox.Root` `open` prop with `inline=true`**: if base-ui rejects forcing `open`, drop the prop — `inline` should already mean "always open list".
- **`selectionMode="none"` not firing `onValueChange`**: if so, switch to a custom handler via the `onItemHighlighted` + onClick on Item, or use `selectionMode="single"` and clear value after each select.
- **Tailwind v4 in workspace**: if `app/` can't resolve `react-cmdk-base/styles.css`, ensure `pnpm install` was rerun after editing the parent `dist/styles.css`. The library must be `build`-ed before the app can pick it up via `file:..`.

## Self-review

**Spec coverage:**
- API surface (CommandMenu namespace, all parts) — Tasks 5–8.
- Page stack (drill-down + backspace pop) — Tasks 5, 6, 11.
- Tailwind v4 styles — Task 4.
- Prototype with pages + groups + icons + free search — Task 10.
- Tests for filter, navigation, pages, shortcut — Task 11.
- Workspace wiring (file: dep) — Task 9.
- Removed legacy deps — Task 1.

**Placeholder scan:** Clean. No TBDs, every step has the actual code.

**Type consistency:** `CommandMenuContextValue` properties (`page`, `setPage`, `popPage`, `query`, `setQuery`, `searchPrefix`, `setSearchPrefix`, `close`, `registerItem`, `fireSelect`) are used consistently across Root, Input, Page, Item, FreeSearch. `RegisteredItem` (`onSelect`, `keepOpen`) matches what Root reads and Item registers.
