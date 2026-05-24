import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React, { useState } from "react";
import { CommandMenu, useCommandMenu } from "../src";

function Harness() {
  const [open, setOpen] = useState(true);
  const [page, setPage] = useState("root");
  return (
    <CommandMenu.Root
      open={open}
      onOpenChange={setOpen}
      page={page}
      onPageChange={setPage}
    >
      <CommandMenu.Input />
      <CommandMenu.List>
        <CommandMenu.Page id="root">
          <CommandMenu.Item
            value="go-projects"
            keepOpen
            onSelect={() => setPage("projects")}
          >
            Projects
          </CommandMenu.Item>
        </CommandMenu.Page>
        <CommandMenu.Page id="projects" searchPrefix={["Projects"]}>
          <CommandMenu.Item value="alpha">Alpha</CommandMenu.Item>
          <CommandMenu.Item value="beta">Beta</CommandMenu.Item>
        </CommandMenu.Page>
      </CommandMenu.List>
    </CommandMenu.Root>
  );
}

describe("pages", () => {
  it("drills into a sub-page when the trigger item is clicked", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.queryByText("Alpha")).toBeNull();

    await user.click(screen.getByText("Projects"));

    expect(await screen.findByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
    // breadcrumb chip is rendered next to the input
    expect(screen.getByText("Projects")).toBeInTheDocument();
  });

  it("renders only the active page's items", async () => {
    render(<Harness />);
    // root page only has the Projects trigger; Alpha lives on the sub-page
    expect(screen.queryByText("Alpha")).toBeNull();
    expect(screen.queryByText("Beta")).toBeNull();
  });

  it("does not thrash setSearchPrefix when parent re-renders with an inline array", () => {
    const renderCounts: number[] = [];

    function Indicator() {
      const { searchPrefix } = useCommandMenu();
      renderCounts.push(searchPrefix.length);
      return <span data-testid="prefix">{searchPrefix.join(",")}</span>;
    }

    function PrefixHarness({ tick }: { tick: number }) {
      return (
        <CommandMenu.Root open onOpenChange={() => {}} page="projects" onPageChange={() => {}}>
          <CommandMenu.Input />
          <CommandMenu.List>
            <CommandMenu.Page id="projects" searchPrefix={["Projects"]}>
              <Indicator />
              <span data-testid="tick">{tick}</span>
            </CommandMenu.Page>
          </CommandMenu.List>
        </CommandMenu.Root>
      );
    }

    const { rerender } = render(<PrefixHarness tick={0} />);
    const baseline = renderCounts.length;

    rerender(<PrefixHarness tick={1} />);
    rerender(<PrefixHarness tick={2} />);

    // Each parent rerender should produce at most ONE additional Indicator render
    // (driven by the new tick sibling). Without the fix, setSearchPrefix flips
    // context per parent render and we see two renders per tick instead of one.
    expect(renderCounts.length - baseline).toBeLessThanOrEqual(2);
  });

  it("popPage returns to the prior page even after setPage was called with the current id", async () => {
    // Items call the CommandMenu context's setPage directly so the pageStack
    // is exercised — mirroring what internal navigation components do.
    function NavItem({
      value,
      target,
      children,
    }: {
      value: string;
      target: string;
      children: React.ReactNode;
    }) {
      const { setPage } = useCommandMenu();
      return (
        <CommandMenu.Item
          value={value}
          keepOpen
          onSelect={() => setPage(target)}
        >
          {children}
        </CommandMenu.Item>
      );
    }

    function Harness() {
      const [page, setPage] = useState("root");
      return (
        <CommandMenu.Root
          open
          onOpenChange={() => {}}
          page={page}
          onPageChange={setPage}
        >
          <CommandMenu.Input />
          <CommandMenu.List>
            <CommandMenu.Page id="root">
              <NavItem value="go-projects" target="projects">
                Go projects
              </NavItem>
            </CommandMenu.Page>
            <CommandMenu.Page id="projects" searchPrefix={["Projects"]}>
              <NavItem value="dupe" target="projects">
                Dupe
              </NavItem>
            </CommandMenu.Page>
          </CommandMenu.List>
        </CommandMenu.Root>
      );
    }
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByText("Go projects"));
    expect(screen.queryByText("Go projects")).toBeNull();
    expect(screen.getByText("Dupe")).toBeInTheDocument();

    await user.click(screen.getByText("Dupe")); // re-selects current page via context setPage

    // Backspace on the empty input should pop back to "root", not stay on "projects".
    await user.click(screen.getByRole("combobox"));
    await user.keyboard("{Backspace}");

    expect(screen.getByText("Go projects")).toBeInTheDocument();
  });

  it("popPage does not fire onPageChange when the popped target equals the current page", async () => {
    const onPageChange = vi.fn();

    // Expose a button outside the combobox so we can call popPage directly
    // without going through the Backspace guard in CommandMenu.Input
    // (which only fires when searchPrefix.length > 0).
    function PopButton() {
      const { popPage } = useCommandMenu();
      return <button type="button" onClick={popPage}>Pop</button>;
    }

    function NavItem({ to, children, value }: { to: string; children: React.ReactNode; value: string }) {
      const { setPage } = useCommandMenu();
      return (
        <CommandMenu.Item value={value} keepOpen onSelect={() => setPage(to)}>
          {children}
        </CommandMenu.Item>
      );
    }

    function Harness() {
      const [page, setPage] = React.useState("root");
      return (
        <CommandMenu.Root
          open
          onOpenChange={() => {}}
          page={page}
          onPageChange={(next) => {
            onPageChange(next);
            setPage(next);
          }}
        >
          <PopButton />
          <CommandMenu.Input />
          <CommandMenu.List>
            <CommandMenu.Page id="root">
              <NavItem to="projects" value="go-projects">Go projects</NavItem>
            </CommandMenu.Page>
            <CommandMenu.Page id="projects" searchPrefix={["Projects"]}>
              <CommandMenu.Item value="dummy" onSelect={() => {}}>
                Dummy item
              </CommandMenu.Item>
            </CommandMenu.Page>
          </CommandMenu.List>
        </CommandMenu.Root>
      );
    }

    const user = userEvent.setup();
    render(<Harness />);

    // Navigate to projects page
    await user.click(screen.getByText("Go projects"));
    expect(onPageChange).toHaveBeenLastCalledWith("projects");

    onPageChange.mockClear();
    // Pop back to root (real transition: stack had "root", so target = "root" != "projects")
    await user.click(screen.getByText("Pop"));
    expect(onPageChange).toHaveBeenLastCalledWith("root");

    onPageChange.mockClear();
    // Pop again: stack is now empty, target falls back to "root";
    // current page is already "root" — no-op, onPageChange must NOT fire.
    await user.click(screen.getByText("Pop"));
    expect(onPageChange).not.toHaveBeenCalled();
  });
});

describe("CommandMenu.Item asChild", () => {
  it("renders the child element with role='option' and merged props", () => {
    render(
      <CommandMenu.Root open onOpenChange={() => {}}>
        <CommandMenu.Input />
        <CommandMenu.List>
          <CommandMenu.Page id="root">
            <CommandMenu.Group>
              <CommandMenu.Item value="docs" asChild>
                <a href="/docs">Docs</a>
              </CommandMenu.Item>
            </CommandMenu.Group>
          </CommandMenu.Page>
        </CommandMenu.List>
      </CommandMenu.Root>,
    );

    // Base UI's Combobox.Item applies role="option" — the correct ARIA role
    // inside a combobox listbox, regardless of the child element type.
    const option = screen.getByRole("option", { name: "Docs" });
    expect(option.tagName).toBe("A");
    expect(option.getAttribute("href")).toBe("/docs");
    expect(option.className).toMatch(/cmdk-item/);
  });
});
