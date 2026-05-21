import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { CommandMenu } from "../src";

describe("CommandMenu.Item forceMount", () => {
  it("stays visible even when the query has no match", async () => {
    const user = userEvent.setup();
    render(
      <CommandMenu.Root open onOpenChange={() => {}}>
        <CommandMenu.Input />
        <CommandMenu.List>
          <CommandMenu.Page id="root">
            <CommandMenu.Group>
              <CommandMenu.Item value="apple" onSelect={() => {}}>
                Apple
              </CommandMenu.Item>
              <CommandMenu.Item
                value="create-new"
                forceMount
                onSelect={() => {}}
              >
                Create new
              </CommandMenu.Item>
            </CommandMenu.Group>
          </CommandMenu.Page>
        </CommandMenu.List>
      </CommandMenu.Root>,
    );

    await user.type(screen.getByRole("combobox"), "zzz");
    expect(screen.queryByText("Apple")).toBeNull();
    expect(screen.getByText("Create new")).toBeInTheDocument();
  });

  it("does not inflate matchCount when force-mounted via no-match query", async () => {
    // forceMount items SHOULD NOT mark themselves as a "match" — Empty
    // should still appear when the query genuinely has no matches, since
    // forceMount means "render anyway", not "this is a match".
    const user = userEvent.setup();
    render(
      <CommandMenu.Root open onOpenChange={() => {}}>
        <CommandMenu.Input />
        <CommandMenu.List>
          <CommandMenu.Page id="root">
            <CommandMenu.Group>
              <CommandMenu.Item value="apple" onSelect={() => {}}>
                Apple
              </CommandMenu.Item>
              <CommandMenu.Item
                value="create-new"
                forceMount
                onSelect={() => {}}
              >
                Create new
              </CommandMenu.Item>
            </CommandMenu.Group>
            <CommandMenu.Empty>None found</CommandMenu.Empty>
          </CommandMenu.Page>
        </CommandMenu.List>
      </CommandMenu.Root>,
    );

    await user.type(screen.getByRole("combobox"), "zzz");
    expect(screen.getByText("None found")).toBeInTheDocument();
    expect(screen.getByText("Create new")).toBeInTheDocument();
  });

  it("does not inflate matchCount when force-mounted item's label happens to match the query", async () => {
    // Regression: even if a forceMount item's label substring-matches the
    // query, it must NOT join the match set. Otherwise <Empty> is wrongly
    // suppressed.
    const user = userEvent.setup();
    render(
      <CommandMenu.Root open onOpenChange={() => {}}>
        <CommandMenu.Input />
        <CommandMenu.List>
          <CommandMenu.Page id="root">
            <CommandMenu.Group>
              <CommandMenu.Item value="apple" onSelect={() => {}}>
                Apple
              </CommandMenu.Item>
              <CommandMenu.Item
                value="create-new"
                forceMount
                onSelect={() => {}}
              >
                Create new
              </CommandMenu.Item>
            </CommandMenu.Group>
            <CommandMenu.Empty>None found</CommandMenu.Empty>
          </CommandMenu.Page>
        </CommandMenu.List>
      </CommandMenu.Root>,
    );

    // Query "create" matches the forceMount item's label but nothing else.
    // <Empty> must still render because the only "match" is a forceMount item.
    await user.type(screen.getByRole("combobox"), "create");
    expect(screen.queryByText("Apple")).toBeNull();
    expect(screen.getByText("Create new")).toBeInTheDocument();
    expect(screen.getByText("None found")).toBeInTheDocument();
  });
});
