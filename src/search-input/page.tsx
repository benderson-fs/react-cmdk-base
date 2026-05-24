import * as React from "react";
import {
  CommandCorePage,
  type CommandCorePageProps,
} from "../internal/command-core";

export type SearchInputPageProps = CommandCorePageProps;

export function SearchInputPage(props: SearchInputPageProps) {
  return <CommandCorePage {...props} />;
}

SearchInputPage.displayName = "SearchInput.Page";
