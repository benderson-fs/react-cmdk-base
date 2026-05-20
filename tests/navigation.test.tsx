import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { CommandMenu } from "../src";

function Harness({ onSelect }: { onSelect: (v: string) => void }) {
  const [open, setOpen] = useState(true);
  return (
    <CommandMenu.Root open={open} onOpenChange={setOpen}>
      <CommandMenu.Input />
      <CommandMenu.List>
        <CommandMenu.Page id="root">
          <CommandMenu.Item value="one" onSelect={onSelect}>
            One
          </CommandMenu.Item>
          <CommandMenu.Item value="two" onSelect={onSelect}>
            Two
          </CommandMenu.Item>
          <CommandMenu.Item value="three" onSelect={onSelect}>
            Three
          </CommandMenu.Item>
        </CommandMenu.Page>
      </CommandMenu.List>
    </CommandMenu.Root>
  );
}

describe("navigation", () => {
  it("clicking an item fires onSelect with its value", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Harness onSelect={onSelect} />);
    await user.click(screen.getByText("Two"));
    expect(onSelect).toHaveBeenCalledWith("two");
  });

  it("clicking an item closes the menu by default", async () => {
    const user = userEvent.setup();
    let openState = true;
    function Wrapped() {
      const [open, setOpen] = useState(true);
      openState = open;
      return (
        <CommandMenu.Root open={open} onOpenChange={setOpen}>
          <CommandMenu.Input />
          <CommandMenu.List>
            <CommandMenu.Page id="root">
              <CommandMenu.Item value="only">Only</CommandMenu.Item>
            </CommandMenu.Page>
          </CommandMenu.List>
        </CommandMenu.Root>
      );
    }
    render(<Wrapped />);
    expect(openState).toBe(true);
    await user.click(screen.getByText("Only"));
    expect(openState).toBe(false);
  });

  it("keepOpen item leaves the menu open", async () => {
    const user = userEvent.setup();
    let openState = true;
    function Wrapped() {
      const [open, setOpen] = useState(true);
      openState = open;
      return (
        <CommandMenu.Root open={open} onOpenChange={setOpen}>
          <CommandMenu.Input />
          <CommandMenu.List>
            <CommandMenu.Page id="root">
              <CommandMenu.Item value="stay" keepOpen onSelect={() => {}}>
                Stay
              </CommandMenu.Item>
            </CommandMenu.Page>
          </CommandMenu.List>
        </CommandMenu.Root>
      );
    }
    render(<Wrapped />);
    await user.click(screen.getByText("Stay"));
    expect(openState).toBe(true);
  });
});
