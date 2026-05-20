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
    </div>
  );
}
