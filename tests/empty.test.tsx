import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { CommandMenu } from "../src";

describe("CommandMenu.Empty", () => {
  function Harness() {
    return (
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
            </CommandMenu.Group>
            <CommandMenu.Empty>No fruit found</CommandMenu.Empty>
          </CommandMenu.Page>
        </CommandMenu.List>
      </CommandMenu.Root>
    );
  }

  it("does not render when query is empty", () => {
    render(<Harness />);
    expect(screen.queryByText("No fruit found")).toBeNull();
  });

  it("does not render when at least one item matches", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(screen.getByRole("combobox"), "ap");
    expect(screen.queryByText("No fruit found")).toBeNull();
  });

  it("renders when query is non-empty and no items match", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(screen.getByRole("combobox"), "zzz");
    expect(screen.getByText("No fruit found")).toBeInTheDocument();
  });

  it("still supports `alwaysRender` prop (override)", async () => {
    render(
      <CommandMenu.Root open onOpenChange={() => {}}>
        <CommandMenu.Input />
        <CommandMenu.List>
          <CommandMenu.Page id="root">
            <CommandMenu.Empty alwaysRender>Always shown</CommandMenu.Empty>
          </CommandMenu.Page>
        </CommandMenu.List>
      </CommandMenu.Root>,
    );
    expect(screen.getByText("Always shown")).toBeInTheDocument();
  });
});
