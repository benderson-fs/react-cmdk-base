import { useEffect } from "react";

type SetOpen =
  | ((updater: (current: boolean) => boolean) => void)
  | ((value: boolean) => void);

/**
 * Toggle a command-menu open when the user presses Cmd+K (macOS) or
 * Ctrl+K (everything else). Avoids OS detection by accepting either
 * modifier — simpler than sniffing `navigator.platform` (deprecated)
 * or `navigator.userAgentData` (Chromium-only).
 */
export function useCmdkShortcut(setOpen: SetOpen): void {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        e.stopPropagation();
        (setOpen as (updater: (c: boolean) => boolean) => void)((c) => !c);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [setOpen]);
}
