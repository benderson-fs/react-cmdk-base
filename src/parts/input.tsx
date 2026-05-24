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

  // Combobox.InputGroup forwards its state attributes (data-popup-open,
  // data-list-empty, data-placeholder, data-touched, etc.) onto the
  // rendered element via the `render` prop. Base UI's documented
  // contract notes that Combobox.Empty requires `items` on Combobox.Root
  // to function; InputGroup does NOT have that requirement as of
  // @base-ui/react ^1.5 — it works with the package's registry-based
  // filtering. If a future Base UI release tightens InputGroup's
  // contract (precondition on `items`, or state attrs that no longer
  // forward through `render`), tests/input-group.test.tsx will fail —
  // it asserts `data-placeholder` today, so that's the one assertion
  // to watch.
  return (
    <Combobox.InputGroup
      data-slot="command-menu-input"
      render={<div className={cn("cmdk-input-row", className)} />}
    >
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
          if (
            e.key === "Backspace" &&
            query === "" &&
            searchPrefix.length > 0
          ) {
            e.preventDefault();
            popPage();
          }
        }}
      />
    </Combobox.InputGroup>
  );
}

CommandMenuInput.displayName = "CommandMenu.Input";
