import * as React from "react";
import { useCommandMenu } from "../hooks/use-command-menu";

export interface CommandMenuPageProps {
  id: string;
  searchPrefix?: string[];
  children: React.ReactNode;
}

const EMPTY_PREFIX: readonly string[] = [];

function sameContents(a: readonly string[], b: readonly string[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

export function CommandMenuPage({
  id,
  searchPrefix,
  children,
}: CommandMenuPageProps) {
  const {
    page,
    searchPrefix: currentPrefix,
    setSearchPrefix,
  } = useCommandMenu();
  const active = page === id;
  // incoming is intentionally not memoized: the sameContents check in the
  // effect is cheap (O(n), n ≤ 3) and avoids the complexity of a content-
  // hash useMemo. Identity changes when the caller passes an inline array,
  // but setSearchPrefix is only called when contents differ.
  const incoming = searchPrefix ?? EMPTY_PREFIX;

  React.useEffect(() => {
    if (!active) return;
    if (sameContents(incoming, currentPrefix)) return;
    // The setSearchPrefix call wants a mutable string[] in the context
    // signature; clone to avoid leaking the EMPTY_PREFIX sentinel.
    setSearchPrefix([...incoming]);
  }, [active, incoming, currentPrefix, setSearchPrefix]);

  // No `data-slot` attribute — Page renders a fragment with no DOM element of
  // its own. Pages are a logical grouping mechanism; the structural slots
  // live on List/Group/Item/etc.
  return active ? <>{children}</> : null;
}

CommandMenuPage.displayName = "CommandMenu.Page";
