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

  it("re-syncs pageRef when controller resets page back to root between drills", () => {
    const onPageChange = vi.fn();
    function Drill() {
      const ctx = useCommandMenu();
      return <button onClick={() => ctx.setPage("settings")}>drill</button>;
    }
    function Reset() {
      const ctx = useCommandMenu();
      return <button onClick={() => ctx.setPage("root")}>reset</button>;
    }
    function Harness() {
      const [page, setPage] = React.useState("root");
      const handleChange = (next: string) => {
        onPageChange(next);
        setPage(next);
      };
      return (
        <CommandMenu.Root
          open
          onOpenChange={() => {}}
          page={page}
          onPageChange={handleChange}
        >
          <CommandMenu.Input />
          <CommandMenu.List>
            <CommandMenu.Page id="root">
              <Drill />
              <CommandMenu.Item value="r">root-item</CommandMenu.Item>
            </CommandMenu.Page>
            <CommandMenu.Page id="settings">
              <Reset />
              <CommandMenu.Item value="s">settings-item</CommandMenu.Item>
            </CommandMenu.Page>
          </CommandMenu.List>
        </CommandMenu.Root>
      );
    }
    render(<Harness />);
    fireEvent.click(screen.getByText("drill"));
    fireEvent.click(screen.getByText("reset"));
    fireEvent.click(screen.getByText("drill"));
    expect(onPageChange).toHaveBeenCalledTimes(3);
    expect(onPageChange.mock.calls.map((c) => c[0])).toEqual([
      "settings",
      "root",
      "settings",
    ]);
  });

  it("setPage('root') request fires onPageChange even when consumer holds the current page", () => {
    const onPageChange = vi.fn();
    function ResetButton() {
      const ctx = useCommandMenu();
      return <button onClick={() => ctx.setPage("root")}>reset</button>;
    }
    render(
      <CommandMenu.Root
        open
        onOpenChange={() => {}}
        page="settings"
        onPageChange={onPageChange}
      >
        <CommandMenu.Input />
        <CommandMenu.List>
          <CommandMenu.Page id="root">
            <CommandMenu.Item value="r">root-item</CommandMenu.Item>
          </CommandMenu.Page>
          <CommandMenu.Page id="settings">
            <ResetButton />
          </CommandMenu.Page>
        </CommandMenu.List>
      </CommandMenu.Root>,
    );
    fireEvent.click(screen.getByText("reset"));
    expect(onPageChange).toHaveBeenCalledWith("root");
    // Consumer ignored the request — rendered page stays at "settings".
    expect(screen.getByText("reset")).toBeInTheDocument();
  });

  it("popPage does not desync pageRef when controller rejects the pop", () => {
    // Symmetric to the first setPage test in this file, but for popPage.
    // Scenario: harness accepts drill (page moves to "settings") but rejects
    // pop (page stays at "settings"). If popPage speculatively writes
    // pageRef.current = "root" in controlled mode (the bug), then the next
    // drill sees a stale ref ("root" instead of "settings") and emits a
    // spurious onPageChange("settings") request even though the rendered
    // page is already "settings". The correct behavior: the drill notices
    // id === current and short-circuits silently.
    const onPageChange = vi.fn();
    function Drill() {
      const ctx = useCommandMenu();
      return <button onClick={() => ctx.setPage("settings")}>drill</button>;
    }
    function Pop() {
      const ctx = useCommandMenu();
      return <button onClick={() => ctx.popPage()}>pop</button>;
    }
    function Harness() {
      const [page, setPage] = React.useState("root");
      const handleChange = (next: string) => {
        onPageChange(next);
        // Accept drill (root -> settings), reject pop (settings -> root).
        if (next === "settings") setPage(next);
      };
      return (
        <CommandMenu.Root
          open
          onOpenChange={() => {}}
          page={page}
          onPageChange={handleChange}
        >
          <CommandMenu.Input />
          <CommandMenu.List>
            <CommandMenu.Page id="root">
              <Drill />
              <CommandMenu.Item value="r">root-item</CommandMenu.Item>
            </CommandMenu.Page>
            <CommandMenu.Page id="settings">
              <Pop />
              <Drill />
              <CommandMenu.Item value="s">settings-item</CommandMenu.Item>
            </CommandMenu.Page>
          </CommandMenu.List>
        </CommandMenu.Root>
      );
    }
    render(<Harness />);
    // 1. Drill: root -> settings, accepted.
    fireEvent.click(screen.getByText("drill"));
    // 2. Pop: requests root, harness rejects, rendered page stays at settings.
    fireEvent.click(screen.getByText("pop"));
    // 3. Drill again: pageRef must still be "settings". If popPage had
    //    speculatively written it to "root", this would fire a spurious
    //    onPageChange("settings") and we'd see 3 calls instead of 2.
    fireEvent.click(screen.getByText("drill"));
    expect(onPageChange.mock.calls.map((c) => c[0])).toEqual([
      "settings",
      "root",
    ]);
  });
});
