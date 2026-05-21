import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { CommandMenu, useCommandMenu } from "../src";

function MatchProbe() {
  const ctx = useCommandMenu();
  return <span data-testid="count">{ctx.matchCount}</span>;
}

describe("CommandMenu match tracking", () => {
  it("matchCount reflects visible items as query changes", async () => {
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
              <CommandMenu.Item value="banana" onSelect={() => {}}>
                Banana
              </CommandMenu.Item>
              <CommandMenu.Item value="cherry" onSelect={() => {}}>
                Cherry
              </CommandMenu.Item>
            </CommandMenu.Group>
            <MatchProbe />
          </CommandMenu.Page>
        </CommandMenu.List>
      </CommandMenu.Root>,
    );

    expect(screen.getByTestId("count")).toHaveTextContent("3");

    await user.type(screen.getByRole("combobox"), "an");
    expect(screen.getByTestId("count")).toHaveTextContent("1");

    await user.clear(screen.getByRole("combobox"));
    expect(screen.getByTestId("count")).toHaveTextContent("3");
  });
});
