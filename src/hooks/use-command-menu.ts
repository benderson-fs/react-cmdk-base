import { useContext } from "react";
import { CommandMenuContext } from "../lib/context";

export function useCommandMenu() {
  const ctx = useContext(CommandMenuContext);
  if (!ctx) {
    throw new Error("useCommandMenu must be used inside <CommandMenu.Root>");
  }
  return ctx;
}
