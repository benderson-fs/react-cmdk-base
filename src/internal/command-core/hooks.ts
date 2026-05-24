// src/internal/command-core/hooks.ts
import { useContext } from "react";
import { CommandCoreContext } from "./context";

export function useCommandCore() {
  const ctx = useContext(CommandCoreContext);
  if (!ctx) {
    throw new Error(
      "command-core parts must be used inside <CommandCoreProvider>",
    );
  }
  return ctx;
}
