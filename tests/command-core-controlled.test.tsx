import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CommandMenu, useCommandMenu } from "../src";

describe("CommandMenu.Root controlled page", () => {
  it("setPage does not desync pageRef when controller ignores onPageChange", () => {
    const onPageChange = vi.fn();
    function Drill() {
      const ctx = useCommandMenu();
      return <button onClick={() => ctx.setPage("settings")}>drill</button>;
    }
    render(
      <CommandMenu.Root
        open
        onOpenChange={() => {}}
        page="root"
        onPageChange={onPageChange}
      >
        <CommandMenu.Input />
        <CommandMenu.List>
          <CommandMenu.Page id="root">
            <Drill />
            <CommandMenu.Item value="r">root-item</CommandMenu.Item>
          </CommandMenu.Page>
          <CommandMenu.Page id="settings">
            <CommandMenu.Item value="s">settings-item</CommandMenu.Item>
          </CommandMenu.Page>
        </CommandMenu.List>
      </CommandMenu.Root>,
    );
    fireEvent.click(screen.getByText("drill"));
    expect(screen.getByText("root-item")).toBeInTheDocument();
    fireEvent.click(screen.getByText("drill"));
    expect(onPageChange).toHaveBeenCalledTimes(2);
  });
});
