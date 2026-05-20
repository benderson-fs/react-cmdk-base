import { useEffect } from "react";

type SetOpen =
  | ((updater: (current: boolean) => boolean) => void)
  | ((value: boolean) => void);

export function useCmdkShortcut(setOpen: SetOpen): void {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const isMac =
        typeof navigator !== "undefined" &&
        navigator.platform.toLowerCase().includes("mac");
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        e.stopPropagation();
        (setOpen as (updater: (c: boolean) => boolean) => void)((c) => !c);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [setOpen]);
}
