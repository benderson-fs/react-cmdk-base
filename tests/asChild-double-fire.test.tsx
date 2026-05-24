import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CommandMenu } from "../src";

describe("CommandMenu.Item asChild fireSelect single-fire", () => {
  it("clicking an asChild Item fires onSelect exactly once", () => {
    const onSelect = vi.fn();
    render(
      <CommandMenu.Root open onOpenChange={() => {}}>
        <CommandMenu.Input />
        <CommandMenu.List>
          <CommandMenu.Page id="root">
            <CommandMenu.Item value="x" onSelect={onSelect} asChild>
              <a href="/x">X</a>
            </CommandMenu.Item>
          </CommandMenu.Page>
        </CommandMenu.List>
      </CommandMenu.Root>,
    );
    const link = screen.getByRole("option", { name: "X" });
    fireEvent.click(link);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
