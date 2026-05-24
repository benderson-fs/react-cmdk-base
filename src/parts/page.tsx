import * as React from "react";
import {
  CommandCorePage,
  type CommandCorePageProps,
} from "../internal/command-core";

export type CommandMenuPageProps = CommandCorePageProps;

export function CommandMenuPage(props: CommandMenuPageProps) {
  return <CommandCorePage {...props} />;
}

CommandMenuPage.displayName = "CommandMenu.Page";
