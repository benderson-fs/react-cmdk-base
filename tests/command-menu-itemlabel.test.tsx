import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommandMenu } from "../src/index";

describe("CommandMenu.ItemLabel", () => {
  it("ItemLabel seeds accessibleName + filter target in CommandMenu", async () => {
    const user = userEvent.setup();
    render(
      <CommandMenu.Root open onOpenChange={() => {}}>
        <CommandMenu.Input />
        <CommandMenu.List>
          <CommandMenu.Page id="root">
            <CommandMenu.Item value="alpha">
              <CommandMenu.ItemLabel>Alpha — primary contact</CommandMenu.ItemLabel>
            </CommandMenu.Item>
          </CommandMenu.Page>
        </CommandMenu.List>
      </CommandMenu.Root>,
    );
    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.keyboard("primary");
    expect(screen.getByRole("option")).toHaveAccessibleName(
      "Alpha — primary contact",
    );
  });
});
