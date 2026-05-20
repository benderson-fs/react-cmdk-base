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
});
