import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { CommandMenu } from "../src";

describe("CommandMenu.Separator", () => {
  it("renders a separator with role='separator'", () => {
    render(
      <CommandMenu.Root open onOpenChange={() => {}}>
        <CommandMenu.Input />
        <CommandMenu.List>
          <CommandMenu.Page id="root">
            <CommandMenu.Group>
              <CommandMenu.Item value="a" onSelect={() => {}}>
                A
              </CommandMenu.Item>
            </CommandMenu.Group>
            <CommandMenu.Separator />
            <CommandMenu.Group>
              <CommandMenu.Item value="b" onSelect={() => {}}>
                B
              </CommandMenu.Item>
            </CommandMenu.Group>
          </CommandMenu.Page>
        </CommandMenu.List>
      </CommandMenu.Root>,
    );
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });
});
