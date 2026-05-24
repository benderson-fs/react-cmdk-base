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

    it("honors a custom aria-label on Item", () => {
      render(
        <CommandMenu.Root open onOpenChange={() => {}}>
          <CommandMenu.Input />
          <CommandMenu.List>
            <CommandMenu.Page id="root">
              <CommandMenu.Item
                value="delete"
                aria-label="Delete project"
                onSelect={() => {}}
              >
                <span aria-hidden>🗑</span>
              </CommandMenu.Item>
            </CommandMenu.Page>
          </CommandMenu.List>
        </CommandMenu.Root>,
      );
      const item = screen.getByLabelText("Delete project");
      expect(item.getAttribute("data-slot")).toBe("command-menu-item");
    });

    it("preserves data-slot on Item asChild even when the consumer's child sets data-slot", () => {
      render(
        <CommandMenu.Root open onOpenChange={() => {}}>
          <CommandMenu.Input />
          <CommandMenu.List>
            <CommandMenu.Page id="root">
              <CommandMenu.Item value="docs" asChild onSelect={() => {}}>
                <a href="/docs" data-slot="my-link">Docs</a>
              </CommandMenu.Item>
            </CommandMenu.Page>
          </CommandMenu.List>
        </CommandMenu.Root>,
      );
      const link = screen.getByText("Docs");
      expect(link.getAttribute("data-slot")).toBe("command-menu-item");
    });

    it("asChild always sets aria-label, falling back to the derived accessible name", async () => {
      // Contract: asChild items ALWAYS receive an aria-label so icon-only
      // asChild items (e.g. <a><svg/></a>) get an accessible name from the
      // item's `value`/derived label. When the consumer doesn't pass
      // aria-label, we fall back to the label derived from children.
      //
      // Base UI's Combobox.Item sets role="option" on the rendered element,
      // so the <a> is queried by role="option".
      render(
        <CommandMenu.Root open onOpenChange={() => {}}>
          <CommandMenu.List>
            <CommandMenu.Page id="root">
              <CommandMenu.Item value="docs" asChild onSelect={() => {}}>
                <a href="/docs">Visit docs</a>
              </CommandMenu.Item>
            </CommandMenu.Page>
          </CommandMenu.List>
        </CommandMenu.Root>,
      );
      const option = await screen.findByRole("option", { name: "Visit docs" });
      expect(option.tagName).toBe("A");
      expect(option).toHaveAttribute("aria-label", "Visit docs");
    });

    it("asChild DOES override the child's accessible name when consumer provides aria-label explicitly", async () => {
      render(
        <CommandMenu.Root open onOpenChange={() => {}}>
          <CommandMenu.List>
            <CommandMenu.Page id="root">
              <CommandMenu.Item
                value="docs"
                aria-label="Documentation"
                asChild
                onSelect={() => {}}
              >
                <a href="/docs">x</a>
              </CommandMenu.Item>
            </CommandMenu.Page>
          </CommandMenu.List>
        </CommandMenu.Root>,
      );
      const option = await screen.findByRole("option", { name: "Documentation" });
      expect(option.tagName).toBe("A");
      expect(option).toHaveAttribute("aria-label", "Documentation");
    });

    it("falls through to the derived label when aria-label is an empty string", async () => {
      const user = userEvent.setup();
      render(
        <CommandMenu.Root open onOpenChange={() => {}}>
          <CommandMenu.Input />
          <CommandMenu.List>
            <CommandMenu.Page id="root">
              <CommandMenu.Item
                value="apple"
                aria-label=""
                onSelect={() => {}}
              >
                Apple
              </CommandMenu.Item>
            </CommandMenu.Page>
          </CommandMenu.List>
        </CommandMenu.Root>,
      );

      // The item should still match by its text content even when aria-label="".
      await user.type(screen.getByRole("combobox"), "App");
      expect(screen.getByText("Apple")).toBeInTheDocument();

      // The DOM attribute should be the derived label, not "".
      const item = screen.getByText("Apple").closest("[data-slot]");
      expect(item?.getAttribute("aria-label")).toBe("Apple");
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
