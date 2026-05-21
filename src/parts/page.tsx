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
  const prefix = React.useMemo(
    () => searchPrefix ?? [],
    [searchPrefix],
  );

  React.useEffect(() => {
    if (active) setSearchPrefix(prefix);
  }, [active, prefix, setSearchPrefix]);

  // No `data-slot` attribute — Page renders a fragment with no DOM element of
  // its own. Pages are a logical grouping mechanism; the structural slots
  // live on List/Group/Item/etc.
  return active ? <>{children}</> : null;
}

CommandMenuPage.displayName = "CommandMenu.Page";
