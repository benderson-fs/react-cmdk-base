// src/internal/command-core/page.tsx
import * as React from "react";
import { useCommandCore } from "./hooks";

export interface CommandCorePageProps {
  id: string;
  searchPrefix?: readonly string[];
  children: React.ReactNode;
}

const EMPTY_PREFIX: readonly string[] = [];

function sameContents(a: readonly string[], b: readonly string[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

export function CommandCorePage({
  id,
  searchPrefix,
  children,
}: CommandCorePageProps) {
  const {
    page,
    searchPrefix: currentPrefix,
    setSearchPrefix,
  } = useCommandCore();
  const active = page === id;
  const incoming = searchPrefix ?? EMPTY_PREFIX;

  const currentPrefixRef = React.useRef(currentPrefix);
  React.useEffect(() => {
    currentPrefixRef.current = currentPrefix;
  });

  React.useEffect(() => {
    if (!active) return;
    if (sameContents(incoming, currentPrefixRef.current)) return;
    setSearchPrefix([...incoming]);
  }, [active, incoming, setSearchPrefix]);

  return active ? <>{children}</> : null;
}

CommandCorePage.displayName = "CommandCore.Page";
