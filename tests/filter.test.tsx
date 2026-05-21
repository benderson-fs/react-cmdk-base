import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { CommandMenu } from "../src";

function Harness() {
  const [open, setOpen] = useState(true);
  return (
    <CommandMenu.Root open={open} onOpenChange={setOpen}>
      <CommandMenu.Input />
      <CommandMenu.List>
        <CommandMenu.Page id="root">
          <CommandMenu.Item value="apple">Apple</CommandMenu.Item>
          <CommandMenu.Item value="banana">Banana</CommandMenu.Item>
          <CommandMenu.Item value="cherry">Cherry</CommandMenu.Item>
        </CommandMenu.Page>
      </CommandMenu.List>
    </CommandMenu.Root>
  );
}

describe("filter", () => {
  it("filters items by typed query", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.getByText("Banana")).toBeInTheDocument();

    await user.type(screen.getByRole("combobox"), "ban");

    expect(screen.queryByText("Apple")).toBeNull();
    expect(screen.getByText("Banana")).toBeInTheDocument();
  });

  it("uses custom filter prop when provided", async () => {
    const user = userEvent.setup();
    // A toy custom filter: matches only when the query is the EXACT
    // lowercased label, no partial matches.
    const exactFilter = (q: string, label: string) =>
      q.length === 0 || q.toLowerCase() === label.toLowerCase();

    render(
      <CommandMenu.Root open onOpenChange={() => {}} filter={exactFilter}>
        <CommandMenu.Input />
        <CommandMenu.List>
          <CommandMenu.Page id="root">
            <CommandMenu.Group>
              <CommandMenu.Item value="a" onSelect={() => {}}>
                Apple
              </CommandMenu.Item>
              <CommandMenu.Item value="b" onSelect={() => {}}>
                Banana
              </CommandMenu.Item>
            </CommandMenu.Group>
          </CommandMenu.Page>
        </CommandMenu.List>
      </CommandMenu.Root>,
    );

    const input = screen.getByRole("combobox");
    await user.type(input, "app");
    // "app" is not an exact match → both items hidden
    expect(screen.queryByText("Apple")).toBeNull();
    expect(screen.queryByText("Banana")).toBeNull();

    await user.clear(input);
    await user.type(input, "apple");
    // exact match → Apple visible
    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.queryByText("Banana")).toBeNull();
  });
});
