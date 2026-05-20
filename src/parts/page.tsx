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

  return active ? <>{children}</> : null;
}
