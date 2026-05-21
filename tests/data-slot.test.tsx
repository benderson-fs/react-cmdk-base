import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { CommandMenu, PromptInput } from "../src";

describe("data-slot attributes", () => {
  describe("CommandMenu", () => {
    function Harness() {
      return (
        <CommandMenu.Root open onOpenChange={() => {}}>
          <CommandMenu.Input />
          <CommandMenu.List>
            <CommandMenu.Page id="root">
              <CommandMenu.Item value="apple" onSelect={() => {}}>
                Apple
              </CommandMenu.Item>
              <CommandMenu.Empty>No results</CommandMenu.Empty>
            </CommandMenu.Page>
          </CommandMenu.List>
        </CommandMenu.Root>
      );
    }

    it("tags CommandMenu.Item with data-slot=command-menu-item", () => {
      render(<Harness />);
      const item = screen.getByText("Apple").closest("[data-slot]");
      expect(item).not.toBeNull();
      expect(item?.getAttribute("data-slot")).toBe("command-menu-item");
    });

    it("tags CommandMenu.Empty with data-slot=command-menu-empty", async () => {
      const user = userEvent.setup();
      render(<Harness />);
      await user.type(screen.getByRole("combobox"), "zzz");
      const empty = screen.getByText("No results");
      expect(empty.getAttribute("data-slot")).toBe("command-menu-empty");
    });
  });

  describe("PromptInput", () => {
    it("tags PromptInput.Submit (non-asChild) with data-slot=prompt-input-submit", () => {
      render(
        <PromptInput.Root onSubmit={() => {}}>
          <PromptInput.Body>
            <PromptInput.Textarea />
          </PromptInput.Body>
          <PromptInput.Footer>
            <PromptInput.Submit />
          </PromptInput.Footer>
        </PromptInput.Root>,
      );
      const submit = screen.getByRole("button", { name: "Send message" });
      expect(submit.getAttribute("data-slot")).toBe("prompt-input-submit");
    });

    it("tags PromptInput.ActionMenuTrigger with data-slot=prompt-input-action-menu-trigger (overriding prompt-input-button)", () => {
      render(
        <PromptInput.Root onSubmit={() => {}}>
          <PromptInput.Body>
            <PromptInput.Textarea />
          </PromptInput.Body>
          <PromptInput.Footer>
            <PromptInput.Tools>
              <PromptInput.ActionMenu>
                <PromptInput.ActionMenuTrigger />
                <PromptInput.ActionMenuContent>
                  <PromptInput.ActionMenuItem>One</PromptInput.ActionMenuItem>
                </PromptInput.ActionMenuContent>
              </PromptInput.ActionMenu>
            </PromptInput.Tools>
          </PromptInput.Footer>
        </PromptInput.Root>,
      );
      const trigger = screen.getByRole("button", { name: "Open actions" });
      expect(trigger.getAttribute("data-slot")).toBe(
        "prompt-input-action-menu-trigger",
      );
    });
  });
});
